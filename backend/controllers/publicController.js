const db = require('../config/db');

exports.getStats = async (_req, res) => {
  try {
    const [[documents]] = await db.query(`
      SELECT
        COUNT(*) AS totalDocuments,
        COALESCE(SUM(downloads), 0) AS totalDownloads,
        COUNT(DISTINCT uploader_id) AS totalContributors
      FROM documents
      WHERE status = 'approved'
    `);
    const [[categories]] = await db.query('SELECT COUNT(*) AS totalCategories FROM categories');

    res.json({
      totalDocuments: Number(documents.totalDocuments || 0),
      totalDownloads: Number(documents.totalDownloads || 0),
      totalContributors: Number(documents.totalContributors || 0),
      totalCategories: Number(categories.totalCategories || 0),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể tải thống kê công khai.' });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT
         d.id, d.title, d.description, d.file_type, d.file_format,
         d.category_id, d.uploader_id, d.status, d.created_at,
         d.downloads, d.rating, d.rejection_reason, d.reviewed_at,
         u.fullname AS uploader_name,
         c.name AS category_name
       FROM documents d
       LEFT JOIN users u ON u.id = d.uploader_id
       LEFT JOIN categories c ON c.id = d.category_id
       WHERE d.id = ?
       LIMIT 1`,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy tài liệu.' });

    const document = rows[0];
    const canViewPrivate = Boolean(req.user) && (
      req.user.role === 'admin' || Number(document.uploader_id) === Number(req.user.id)
    );

    if (document.status !== 'approved' && !canViewPrivate) {
      return res.status(404).json({ message: 'Không tìm thấy tài liệu.' });
    }

    if (!canViewPrivate) {
      delete document.rejection_reason;
      delete document.reviewed_at;
    }

    res.json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể tải chi tiết tài liệu.' });
  }
};
