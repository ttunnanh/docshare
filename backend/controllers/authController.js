const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { writeAudit } = require('../utils/audit');
const { normalizeEmail, isEmail, isStrongEnoughPassword } = require('../utils/validation');

exports.register = async (req, res) => {
  try {
    const fullname = String(req.body.fullname || '').trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (fullname.length < 2) return res.status(400).json({ message: 'Họ tên quá ngắn.' });
    if (!isEmail(email)) return res.status(400).json({ message: 'Email không hợp lệ.' });
    if (!isStrongEnoughPassword(password)) return res.status(400).json({ message: 'Mật khẩu tối thiểu 6 ký tự.' });

    const [exists] = await db.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (exists.length) return res.status(409).json({ message: 'Email đã được sử dụng.' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users(fullname,email,password,role) VALUES(?,?,?,?)',
      [fullname, email, hash, 'student']
    );

    await writeAudit({
      req,
      userId: result.insertId,
      action: 'auth.register',
      entityType: 'user',
      entityId: result.insertId,
      details: { email },
    });

    res.status(201).json({ message: 'Đăng ký thành công.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Không thể đăng ký.' });
  }
};

exports.login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);

    if (!rows.length || !(await bcrypt.compare(password, rows[0].password))) {
      await writeAudit({ req, action: 'auth.login_failed', details: { email } });
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
    }

    const user = rows[0];
    if (Number(user.is_active) === 0) {
      await writeAudit({
        req,
        userId: user.id,
        action: 'auth.login_blocked',
        entityType: 'user',
        entityId: user.id,
      });
      return res.status(403).json({
        code: 'ACCOUNT_LOCKED',
        message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.',
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Server chưa cấu hình JWT_SECRET.' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    await db.execute('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
    await writeAudit({
      req,
      userId: user.id,
      action: 'auth.login',
      entityType: 'user',
      entityId: user.id,
    });

    res.json({
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
      },
    });
  } catch (err) {
    if (err?.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(503).json({
        code: 'MIGRATION_REQUIRED',
        message: 'Cơ sở dữ liệu chưa được nâng cấp. Hãy chạy migrate_enterprise_features.sql.',
      });
    }
    console.error(err);
    res.status(500).json({ message: 'Không thể đăng nhập.' });
  }
};
