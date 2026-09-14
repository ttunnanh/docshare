const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        const [users] = await db.execute('SELECT COUNT(*) as totalUsers FROM users');
        const [docs] = await db.execute('SELECT COUNT(*) as totalDocs FROM documents');
        const [pendingDocs] = await db.execute('SELECT COUNT(*) as pendingDocs FROM documents WHERE status = "pending"');
        const [downloads] = await db.execute('SELECT COUNT(*) as totalDownloads FROM download_history');

        res.json({
            totalUsers: users[0].totalUsers,
            totalDocuments: docs[0].totalDocs,
            pendingDocuments: pendingDocs[0].pendingDocs,
            totalDownloads: downloads[0].totalDownloads
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, fullname, email, role FROM users');
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
        const [docs] = await db.query('SELECT * FROM documents WHERE status = "pending"');
        res.json(docs);
    } catch (error) {
        console.error('Lỗi lấy tài liệu chờ duyệt:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.updateDocumentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Giá trị 'approved' hoặc 'rejected'
        await db.query('UPDATE documents SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Cập nhật trạng thái thành công' });
    } catch (error) {
        console.error('Lỗi duyệt tài liệu:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};