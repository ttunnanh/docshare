const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) as totalUsers FROM users');
        const [[{ totalDocs }]] = await db.query('SELECT COUNT(*) as totalDocs FROM documents');
        const [[{ pendingDocs }]] = await db.query('SELECT COUNT(*) as pendingDocs FROM documents WHERE status = "pending"');
        const [[{ totalDownloads }]] = await db.query('SELECT SUM(downloads) as totalDownloads FROM documents');

        res.json({
            totalUsers: totalUsers || 0,
            totalDocuments: totalDocs || 0,
            pendingDocuments: pendingDocs || 0,
            totalDownloads: totalDownloads || 0
        });
    } catch (error) {
        console.error('Lỗi lấy thống kê:', error);
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, fullname, email, role, created_at FROM users');
        res.json(users);
    } catch (error) {
        console.error('Lỗi lấy danh sách user:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.json({ message: 'Cập nhật phân quyền thành công' });
    } catch (error) {
        console.error('Lỗi cập nhật quyền:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getPendingDocuments = async (req, res) => {
    try {
        const [docs] = await db.query(`
            SELECT d.*, u.fullname as uploader_name 
            FROM documents d 
            LEFT JOIN users u ON d.uploader_id = u.id 
            WHERE d.status = "pending"
        `);
        res.json(docs);
    } catch (error) {
        console.error('Lỗi lấy tài liệu chờ duyệt:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.updateDocumentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await db.query('UPDATE documents SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Cập nhật trạng thái thành công' });
    } catch (error) {
        console.error('Lỗi duyệt tài liệu:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};