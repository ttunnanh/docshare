const db = require('../config/db');
const cloudinary = require('../config/cloudinary');

exports.getAllDocuments = async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const category_id = req.query.category_id || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM documents WHERE status = "approved"';
        let queryParams = [];

        if (keyword) {
            query += ' AND title LIKE ?';
            queryParams.push(`%${keyword}%`);
        }
        if (category_id) {
            query += ' AND category_id = ?';
            queryParams.push(category_id);
        }

        // Đếm tổng số lượng để tính số trang
        const countQuery = query.replace('*', 'COUNT(*) as total');
        const [countResult] = await db.execute(countQuery, queryParams);
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limit);

        // Truy vấn dữ liệu theo giới hạn
        query += ` ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
        const [documents] = await db.execute(query, queryParams);

        res.json({
            totalItems,
            totalPages,
            currentPage: page,
            documents
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

exports.uploadDocument = async (req, res) => {
    try {
        const { title, description, category_id } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Vui lòng chọn file tải lên' });
        }

        // Đẩy file lên Cloudinary thông qua Buffer Stream
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'raw' },
            async (error, result) => {
                if (error) return res.status(500).json({ message: 'Lỗi upload Cloudinary', error });

                const fileUrl = result.secure_url;
                const uploaderId = req.user.id;

                // Lưu thông tin vào CSDL, trạng thái mặc định là 'pending'
                await db.execute(
                    'INSERT INTO documents (title, description, file_url, category_id, uploader_id, status) VALUES (?, ?, ?, ?, ?, ?)',
                    [title, description, fileUrl, category_id, uploaderId, 'pending']
                );

                res.status(201).json({ 
                    message: 'Tải tài liệu lên thành công, đang chờ duyệt', 
                    url: fileUrl 
                });
            }
        );

        uploadStream.end(file.buffer);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

exports.getPendingDocuments = async (req, res) => {
    try {
        const [documents] = await db.execute('SELECT * FROM documents WHERE status = "pending"');
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

exports.approveDocument = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; 

    try {
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
        }

        const [result] = await db.execute(
            'UPDATE documents SET status = ? WHERE id = ?',
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
        }

        res.json({ message: `Đã cập nhật trạng thái tài liệu thành: ${status}` });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

exports.downloadDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [docs] = await db.query('SELECT * FROM documents WHERE id = ?', [id]);
        if (docs.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
        }

        const document = docs[0];

        // Ghi nhận lịch sử tải xuống
        await db.query('INSERT INTO downloads (user_id, document_id) VALUES (?, ?)', [userId, id]);
        
        const fileName = document.file_path || document.file_url || document.filename || document.file;
        if (!fileName) {
            return res.status(404).json({ message: 'Tài liệu này không có file đính kèm trong CSDL.' });
        }
        
        let fileUrl = '';
        if (fileName.startsWith('http://') || fileName.startsWith('https://')) {
            fileUrl = fileName;
        } else {
            fileUrl = `http://localhost:5000/uploads/${fileName}`; 
        }

        res.json({ downloadUrl: fileUrl });

    } catch (error) {
        console.error('Lỗi khi tải xuống:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getDocumentById = async (req, res) => {
    try {
        const documentId = req.params.id;
        const [documents] = await db.execute(
            'SELECT * FROM documents WHERE id = ? AND status = "approved"', 
            [documentId]
        );
        
        if (documents.length === 0) {
            return res.status(404).json({ message: 'Tài liệu không tồn tại hoặc chưa được duyệt' });
        }
        
        res.json(documents[0]);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

exports.updateDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Thiếu tiêu đề hoặc mô tả' });
        }

        await db.query(
            'UPDATE documents SET title = ?, description = ? WHERE id = ?',
            [title, description, id]
        );

        res.json({ message: 'Cập nhật tài liệu thành công' });
    } catch (error) {
        console.error('Lỗi SQL cập nhật tài liệu:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật' });
    }
};

exports.getAllForAdmin = async (req, res) => {
    try {
        const [docs] = await db.query('SELECT * FROM documents ORDER BY created_at DESC');
        res.json(docs);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.deleteDocument = async (req, res) => {
    const documentId = req.params.id;
    const userId = req.user.id;

    try {
        // Lấy thêm file_url để xử lý xóa trên Cloudinary
        const [docs] = await db.execute('SELECT uploader_id, file_url FROM documents WHERE id = ?', [documentId]);
        if (docs.length === 0) return res.status(404).json({ message: 'Tài liệu không tồn tại' });
        
        const document = docs[0];

        if (document.uploader_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Không có quyền xóa tài liệu này' });
        }

        // Trích xuất public_id từ URL Cloudinary và gọi API xóa
        if (document.file_url && document.file_url.includes('cloudinary.com')) {
            const urlParts = document.file_url.split('/');
            const filenameWithExt = urlParts[urlParts.length - 1];
            const publicId = filenameWithExt.substring(0, filenameWithExt.lastIndexOf('.'));
            
            // Sử dụng resource_type: 'raw' vì lúc upload đã set 'raw' cho tài liệu
            await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        }

        await db.execute('DELETE FROM downloads WHERE document_id = ?', [documentId]);
        await db.execute('DELETE FROM documents WHERE id = ?', [documentId]);

        res.json({ message: 'Xóa tài liệu thành công' });
    } catch (error) {
        console.error('Lỗi xóa tài liệu:', error);
        res.status(500).json({ message: 'Lỗi server', error });
    }
};