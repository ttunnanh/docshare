const { Readable } = require('node:stream');
const db = require('../config/db');
const { writeAudit } = require('../utils/audit');

const safeFilename = (title, format) => {
  const base = String(title || 'document')
    .replace(/[\\/:*?"<>|\r\n]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120) || 'document';
  const extension = String(format || 'file').toLowerCase().replace(/[^a-z0-9]/g, '') || 'file';
  return `${base}.${extension}`;
};

exports.streamDocument = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, title, file_url, file_format
       FROM documents
       WHERE id = ? AND status = 'approved'
       LIMIT 1`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Tài liệu chưa được duyệt hoặc không tồn tại.' });
    }

    const document = rows[0];
    const upstream = await fetch(document.file_url, {
      headers: { 'User-Agent': 'DocShare-StreamGuard/1.0' },
    });

    if (!upstream.ok || !upstream.body) {
      return res.status(502).json({ message: 'Không thể đọc file từ kho lưu trữ.' });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute('UPDATE documents SET downloads = downloads + 1 WHERE id = ?', [document.id]);
      await connection.execute('INSERT INTO downloads(user_id, document_id) VALUES(?, ?)', [req.user.id, document.id]);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    await writeAudit({
      req,
      userId: req.user.id,
      action: 'document.stream_downloaded',
      entityType: 'document',
      entityId: document.id,
      details: { title: document.title },
    });

    const filename = safeFilename(document.title, document.file_format);
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const contentLength = upstream.headers.get('content-length');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (contentLength) res.setHeader('Content-Length', contentLength);

    Readable.fromWeb(upstream.body).on('error', (error) => {
      console.error('StreamGuard:', error);
      if (!res.headersSent) res.status(502).end();
      else res.destroy(error);
    }).pipe(res);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.status(500).json({ message: 'Không thể tải tài liệu an toàn.' });
    else res.destroy(error);
  }
};

exports._private = { safeFilename };
