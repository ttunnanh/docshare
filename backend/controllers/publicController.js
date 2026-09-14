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
