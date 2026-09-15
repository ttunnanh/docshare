const db = require('../config/db');

exports.getAllCategories = async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.id, c.name, c.description,
             COUNT(CASE WHEN d.status = 'approved' THEN 1 END) AS document_count
      FROM categories c
      LEFT JOIN documents d ON d.category_id = c.id
      GROUP BY c.id, c.name, c.description
      ORDER BY c.name ASC
    `);
    res.json(rows.map((item) => ({ ...item, document_count: Number(item.document_count || 0) })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể tải danh mục.' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const description = String(req.body.description || '').trim();
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ message: 'Tên danh mục phải từ 2 đến 100 ký tự.' });
    }
    if (description.length > 500) {
      return res.status(400).json({ message: 'Mô tả tối đa 500 ký tự.' });
    }

    const [existing] = await db.execute('SELECT id FROM categories WHERE LOWER(name) = LOWER(?) LIMIT 1', [name]);
    if (existing.length) return res.status(409).json({ message: 'Danh mục đã tồn tại.' });

    const [result] = await db.execute('INSERT INTO categories(name, description) VALUES(?, ?)', [name, description || null]);
    res.status(201).json({ id: result.insertId, message: 'Đã thêm danh mục.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể thêm danh mục.' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const description = String(req.body.description || '').trim();
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ message: 'Tên danh mục phải từ 2 đến 100 ký tự.' });
    }
    if (description.length > 500) {
      return res.status(400).json({ message: 'Mô tả tối đa 500 ký tự.' });
    }

    const [duplicate] = await db.execute(
      'SELECT id FROM categories WHERE LOWER(name) = LOWER(?) AND id <> ? LIMIT 1',
      [name, req.params.id]
    );
    if (duplicate.length) return res.status(409).json({ message: 'Danh mục đã tồn tại.' });

    const [result] = await db.execute(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description || null, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Không tìm thấy danh mục.' });
    res.json({ message: 'Đã cập nhật danh mục.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể cập nhật danh mục.' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const [documents] = await db.execute('SELECT id FROM documents WHERE category_id = ? LIMIT 1', [req.params.id]);
    if (documents.length) {
      return res.status(400).json({ message: 'Không thể xóa danh mục đang chứa tài liệu.' });
    }
    const [result] = await db.execute('DELETE FROM categories WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Không tìm thấy danh mục.' });
    res.json({ message: 'Đã xóa danh mục.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể xóa danh mục.' });
  }
};
