const db = require('../config/db');
const { writeAudit } = require('../utils/audit');
const { isValidRole, positiveInt } = require('../utils/validation');
const { validateReviewInput } = require('../utils/documentWorkflow');

const activeAdminCount = async () => {
  const [[row]] = await db.query("SELECT COUNT(*) AS total FROM users WHERE role = 'admin' AND is_active = 1");
  return Number(row.total || 0);
};

exports.getDashboardStats = async (_req, res) => {
  try {
    const [[users]] = await db.query(`
      SELECT COUNT(*) AS totalUsers,
             SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) AS lockedUsers
      FROM users
    `);
    const [[documents]] = await db.query(`
      SELECT COUNT(*) AS totalDocuments,
             SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approvedDocuments,
             SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingDocuments,
             SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejectedDocuments
      FROM documents
    `);
    const [[downloads]] = await db.query('SELECT COUNT(*) AS totalDownloads FROM downloads');
    const [[audit]] = await db.query('SELECT COUNT(*) AS totalAuditEvents FROM audit_logs');

    res.json({ ...users, ...documents, ...downloads, ...audit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể tải thống kê.' });
  }
};

exports.getAllUsers = async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, fullname, email, role, is_active, locked_at, last_login_at, created_at
      FROM users
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể tải danh sách người dùng.' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const role = String(req.body.role || '');
    if (!isValidRole(role)) return res.status(400).json({ message: 'Vai trò không hợp lệ.' });
    if (userId === Number(req.user.id) && role !== 'admin') {
      return res.status(400).json({ message: 'Bạn không thể tự hạ quyền tài khoản đang đăng nhập.' });
    }

    const [rows] = await db.execute('SELECT id, fullname, email, role, is_active FROM users WHERE id = ? LIMIT 1', [userId]);
    if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    const current = rows[0];

    if (current.role === 'admin' && role !== 'admin' && Number(current.is_active) === 1 && await activeAdminCount() <= 1) {
      return res.status(409).json({ message: 'Hệ thống phải còn ít nhất một quản trị viên đang hoạt động.' });
    }

    await db.execute('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    await writeAudit({
      req,
      userId: req.user.id,
      action: 'admin.user_role_changed',
      entityType: 'user',
      entityId: userId,
      details: { from: current.role, to: role, email: current.email },
    });

    res.json({ message: 'Đã cập nhật vai trò.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể cập nhật vai trò.' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const isActive = req.body.is_active === true || req.body.is_active === 1 || req.body.is_active === '1';

    if (userId === Number(req.user.id) && !isActive) {
      return res.status(400).json({ message: 'Bạn không thể tự khóa tài khoản đang đăng nhập.' });
    }

    const [rows] = await db.execute('SELECT id, fullname, email, role, is_active FROM users WHERE id = ? LIMIT 1', [userId]);
    if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    const target = rows[0];

    if (target.role === 'admin' && Number(target.is_active) === 1 && !isActive && await activeAdminCount() <= 1) {
      return res.status(409).json({ message: 'Không thể khóa quản trị viên hoạt động cuối cùng.' });
    }

    await db.execute(
      'UPDATE users SET is_active = ?, locked_at = ? WHERE id = ?',
      [isActive ? 1 : 0, isActive ? null : new Date(), userId]
    );

    await writeAudit({
      req,
      userId: req.user.id,
      action: isActive ? 'admin.user_unlocked' : 'admin.user_locked',
      entityType: 'user',
      entityId: userId,
      details: { email: target.email },
    });

    res.json({
      message: isActive ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.',
      is_active: isActive ? 1 : 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể cập nhật trạng thái tài khoản.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (userId === Number(req.user.id)) {
      return res.status(400).json({ message: 'Bạn không thể tự xóa tài khoản đang đăng nhập.' });
    }

    const [users] = await db.execute('SELECT id, email, role, is_active FROM users WHERE id = ? LIMIT 1', [userId]);
    if (!users.length) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    const target = users[0];

    if (target.role === 'admin' && Number(target.is_active) === 1 && await activeAdminCount() <= 1) {
      return res.status(409).json({ message: 'Không thể xóa quản trị viên hoạt động cuối cùng.' });
    }

    const [[ownership]] = await db.execute('SELECT COUNT(*) AS total FROM documents WHERE uploader_id = ?', [userId]);
    if (Number(ownership.total || 0) > 0) {
      return res.status(409).json({
        message: `Tài khoản đang sở hữu ${ownership.total} tài liệu. Hãy xử lý các tài liệu đó trước khi xóa tài khoản.`,
      });
    }

    await db.execute('DELETE FROM users WHERE id = ?', [userId]);
    await writeAudit({
      req,
      userId: req.user.id,
      action: 'admin.user_deleted',
      entityType: 'user',
      entityId: userId,
      details: { email: target.email },
    });

    res.json({ message: 'Đã xóa người dùng.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể xóa người dùng.' });
  }
};

exports.getPendingDocuments = async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, u.fullname AS uploader_name, c.name AS category_name
      FROM documents d
      LEFT JOIN users u ON u.id = d.uploader_id
      LEFT JOIN categories c ON c.id = d.category_id
      WHERE d.status = 'pending'
      ORDER BY d.created_at ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể tải tài liệu chờ duyệt.' });
  }
};

exports.updateDocumentStatus = async (req, res) => {
  try {
    const review = validateReviewInput(req.body.status, req.body.rejection_reason);
    if (!review.ok) return res.status(400).json({ message: review.message });

    const [documents] = await db.execute('SELECT id, title, status, uploader_id FROM documents WHERE id = ? LIMIT 1', [req.params.id]);
    if (!documents.length) return res.status(404).json({ message: 'Không tìm thấy tài liệu.' });
    const document = documents[0];

    await db.execute(
      `UPDATE documents
       SET status = ?, rejection_reason = ?, reviewed_by = ?, reviewed_at = NOW()
       WHERE id = ?`,
      [review.status, review.rejectionReason, req.user.id, req.params.id]
    );

    await writeAudit({
      req,
      userId: req.user.id,
      action: review.status === 'approved' ? 'document.approved' : 'document.rejected',
      entityType: 'document',
      entityId: document.id,
      details: {
        title: document.title,
        from: document.status,
        to: review.status,
        rejection_reason: review.rejectionReason,
      },
    });

    res.json({
      message: review.status === 'approved' ? 'Đã duyệt tài liệu.' : 'Đã từ chối tài liệu.',
      status: review.status,
      rejection_reason: review.rejectionReason,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể cập nhật trạng thái tài liệu.' });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const page = positiveInt(req.query.page, 1, 100000);
    const limit = positiveInt(req.query.limit, 30, 100);
    const offset = (page - 1) * limit;
    const search = String(req.query.search || '').trim();
    const action = String(req.query.action || '').trim();

    const where = [];
    const params = [];
    if (action) {
      where.push('a.action = ?');
      params.push(action);
    }
    if (search) {
      where.push('(a.action LIKE ? OR a.entity_type LIKE ? OR a.entity_id LIKE ? OR a.details LIKE ? OR u.fullname LIKE ? OR u.email LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like, like, like, like);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [[countRow]] = await db.execute(
      `SELECT COUNT(*) AS total FROM audit_logs a LEFT JOIN users u ON u.id = a.user_id ${whereSql}`,
      params
    );
    const [items] = await db.execute(
      `SELECT a.id, a.user_id, a.action, a.entity_type, a.entity_id, a.details, a.ip_address, a.created_at,
              u.fullname AS user_name, u.email AS user_email
       FROM audit_logs a
       LEFT JOIN users u ON u.id = a.user_id
       ${whereSql}
       ORDER BY a.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    const total = Number(countRow.total || 0);
    res.json({ items, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể tải nhật ký hệ thống.' });
  }
};
