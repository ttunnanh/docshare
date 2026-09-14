const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const fullname = String(req.body.fullname || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (fullname.length < 2) return res.status(400).json({ message: 'Họ tên quá ngắn.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Email không hợp lệ.' });
    if (password.length < 6) return res.status(400).json({ message: 'Mật khẩu tối thiểu 6 ký tự.' });
    const [exists] = await db.execute('SELECT id FROM users WHERE email=? LIMIT 1', [email]);
    if (exists.length) return res.status(409).json({ message: 'Email đã được sử dụng.' });
    const hash = await bcrypt.hash(password, 10);
    await db.execute('INSERT INTO users(fullname,email,password,role) VALUES(?,?,?,?)', [fullname, email, hash, 'student']);
    res.status(201).json({ message: 'Đăng ký thành công.' });
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Không thể đăng ký.' });
  }
};

exports.login = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const [rows] = await db.execute('SELECT * FROM users WHERE email=? LIMIT 1', [email]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password))) return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
    if (!process.env.JWT_SECRET) return res.status(500).json({ message: 'Server chưa cấu hình JWT_SECRET.' });
    const u = rows[0];
    const token = jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id:u.id, fullname:u.fullname, email:u.email, role:u.role, avatar:u.avatar || null } });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Không thể đăng nhập.' }); }
};
