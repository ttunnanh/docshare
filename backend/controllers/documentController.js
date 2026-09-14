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

        const countQuery = query.replace('*', 'COUNT(*) as total');
        const [countResult] = await db.execute(countQuery, queryParams);
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limit);

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

        const fileFormat = file.originalname.split('.').pop().toUpperCase();

        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'raw' },
            async (error, result) => {
                if (error) return res.status(500).json({ message: 'Lỗi upload Cloudinary', error });

                const fileUrl = result.secure_url;
                const uploaderId = req.user.id;

                await db.execute(
                    'INSERT INTO documents (title, description, file_url, category_id, uploader_id, status, file_format) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [title, description, fileUrl, category_id, uploaderId, 'pending', fileFormat]
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
        const [docs] = await db.execute('SELECT uploader_id, file_url FROM documents WHERE id = ?', [documentId]);
        if (docs.length === 0) return res.status(404).json({ message: 'Tài liệu không tồn tại' });
        
        const document = docs[0];

        if (document.uploader_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Không có quyền xóa tài liệu này' });
        }

        if (document.file_url && document.file_url.includes('cloudinary.com')) {
            const urlParts = document.file_url.split('/');
            const filenameWithExt = urlParts[urlParts.length - 1];
            const publicId = filenameWithExt.substring(0, filenameWithExt.lastIndexOf('.'));
            
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

exports.toggleSaveDocument = async (req, res) => {
    const userId = req.user.id;
    const documentId = req.params.id;
    try {
        const [existing] = await db.query('SELECT * FROM saved_documents WHERE user_id = ? AND document_id = ?', [userId, documentId]);
        if (existing.length > 0) {
            await db.query('DELETE FROM saved_documents WHERE user_id = ? AND document_id = ?', [userId, documentId]);
            return res.json({ message: 'Đã bỏ lưu tài liệu', saved: false });
        } else {
            await db.query('INSERT INTO saved_documents (user_id, document_id) VALUES (?, ?)', [userId, documentId]);
            return res.json({ message: 'Đã lưu tài liệu', saved: true });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

exports.getSavedDocuments = async (req, res) => {
    const userId = req.user.id;
    try {
        const query = `
            SELECT d.*, u.fullname as uploader_name 
            FROM documents d 
            JOIN saved_documents sd ON d.id = sd.document_id 
            JOIN users u ON d.uploader_id = u.id 
            WHERE sd.user_id = ?
        `;
        const [documents] = await db.query(query, [userId]);
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

exports.incrementDownload = async (req, res) => {
    const documentId = req.params.id;
    try {
        await db.query('UPDATE documents SET downloads = downloads + 1 WHERE id = ?', [documentId]);
        res.json({ message: 'Đã tăng lượt tải' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
};