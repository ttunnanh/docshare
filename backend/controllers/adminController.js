const db = require('../config/db');

exports.getDashboardStats = async (_req, res) => {
  try {
    const [[users]] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[documents]] = await db.query('SELECT COUNT(*) AS totalDocuments FROM documents');
    const [[pending]] = await db.query("SELECT COUNT(*) AS pendingDocuments FROM documents WHERE status = 'pending'");
    const [[downloads]] = await db.query('SELECT COUNT(*) AS totalDownloads FROM downloads');
    res.json({ ...users, ...documents, ...pending, ...downloads });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể tải thống kê.' });
  }
};

exports.getAllUsers = async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT id, fullname, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể tải danh sách người dùng.' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const role = String(req.body.role || '');
    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ.' });
    }
    if (Number(req.params.id) === Number(req.user.id) && role !== 'admin') {
      return res.status(400).json({ message: 'Bạn không thể tự hạ quyền tài khoản đang đăng nhập.' });
    }
    const [result] = await db.execute('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    res.json({ message: 'Đã cập nhật vai trò.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể cập nhật vai trò.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (userId === Number(req.user.id)) {
      return res.status(400).json({ message: 'Bạn không thể tự xóa tài khoản đang đăng nhập.' });
    }

    const [[ownership]] = await db.execute('SELECT COUNT(*) AS total FROM documents WHERE uploader_id = ?', [userId]);
    if (Number(ownership.total || 0) > 0) {
      return res.status(409).json({
        message: `Tài khoản đang sở hữu ${ownership.total} tài liệu. Hãy xử lý các tài liệu đó trước khi xóa tài khoản.`,
      });
    }

    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [userId]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
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
    const status = String(req.body.status || '');
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
    }
    const [result] = await db.execute('UPDATE documents SET status = ? WHERE id = ?', [status, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Không tìm thấy tài liệu.' });
    res.json({ message: status === 'approved' ? 'Đã duyệt tài liệu.' : 'Đã từ chối tài liệu.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể cập nhật trạng thái tài liệu.' });
  }
};
