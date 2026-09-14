const db = require('../config/db');
const bcrypt = require('bcryptjs');

// ==========================================
// CÁC CHỨC NĂNG DÀNH CHO NGƯỜI DÙNG (USER)
// ==========================================

exports.updateProfile = async (req, res) => {
    try {
        const { fullname } = req.body;
        if (!fullname) return res.status(400).json({ message: 'Vui lòng nhập họ tên mới' });
        
        await db.execute('UPDATE users SET fullname = ? WHERE id = ?', [fullname, req.user.id]);
        res.json({ message: 'Cập nhật hồ sơ thành công', fullname });
    } catch (error) {
        console.error('Lỗi cập nhật hồ sơ:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Vui lòng nhập đủ thông tin' });
        }

        const [users] = await db.execute('SELECT password FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

        const isValid = await bcrypt.compare(oldPassword, users[0].password);
        if (!isValid) return res.status(400).json({ message: 'Mật khẩu cũ không chính xác' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        console.error('Lỗi đổi mật khẩu:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, fullname, email, role, avatar, created_at FROM users WHERE id = ?', 
            [req.user.id]
        );
        if (users.length === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        res.json(users[0]);
    } catch (error) {
        console.error('Lỗi lấy thông tin profile:', error);
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

exports.getMyUploads = async (req, res) => {
    try {
        const [documents] = await db.execute(
            'SELECT * FROM documents WHERE uploader_id = ? ORDER BY created_at DESC', 
            [req.user.id]
        );
        res.json(documents);
    } catch (error) {
        console.error('Lỗi lấy tài liệu đã tải lên:', error);
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

exports.getMyDownloads = async (req, res) => {
    try {
        const userId = req.user.id;
        const query = `
            SELECT d.id AS download_id, d.downloaded_at, doc.title, doc.description 
            FROM downloads d
            JOIN documents doc ON d.document_id = doc.id
            WHERE d.user_id = ?
            ORDER BY d.downloaded_at DESC
        `;
        const [downloads] = await db.execute(query, [userId]);
        res.json(downloads);
    } catch (error) {
        // Trả về mảng rỗng để tránh sập giao diện nếu CSDL chưa có bảng downloads
        console.error('Lỗi lấy lịch sử tải (Có thể chưa tạo bảng downloads):', error);
        res.json([]);
    }
};

// ==========================================
// CÁC CHỨC NĂNG DÀNH CHO QUẢN TRỊ VIÊN (ADMIN)
// ==========================================

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, fullname, email, role, avatar, created_at FROM users');
        res.json(users);
    } catch (error) {
        console.error('Lỗi lấy danh sách user:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        res.json({ message: 'Cập nhật quyền thành công' });
    } catch (error) {
        console.error('Lỗi cập nhật quyền:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'Xóa tài khoản thành công' });
    } catch (error) {
        console.error('Lỗi xóa tài khoản:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};