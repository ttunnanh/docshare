const db = require('../config/db');

exports.getAllCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories');
        res.json(categories);
    } catch (error) {
        console.error('Lỗi lấy danh sách danh mục:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Tên danh mục không được để trống' });
        
        await db.execute('INSERT INTO categories (name) VALUES (?)', [name]);
        res.status(201).json({ message: 'Thêm danh mục thành công' });
    } catch (error) {
        console.error('Lỗi thêm danh mục:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        
        if (!name) return res.status(400).json({ message: 'Tên danh mục không được để trống' });

        await db.execute('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
        res.json({ message: 'Cập nhật danh mục thành công' });
    } catch (error) {
        console.error('Lỗi cập nhật danh mục:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [docs] = await db.execute('SELECT id FROM documents WHERE category_id = ? LIMIT 1', [id]);
        if (docs.length > 0) {
            return res.status(400).json({ message: 'Không thể xóa danh mục đang chứa tài liệu' });
        }
        
        await db.execute('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ message: 'Xóa danh mục thành công' });
    } catch (error) {
        console.error('Lỗi xóa danh mục:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};