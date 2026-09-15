const db = require('../config/db');
const cloudinary = require('../config/cloudinary');
const { writeAudit } = require('../utils/audit');
const { positiveInt } = require('../utils/validation');
const { validateReviewInput } = require('../utils/documentWorkflow');

exports.getAllDocuments = async (req, res) => {
  try {
    const keyword = String(req.query.keyword || '').trim();
    const category = String(req.query.category_id || '').trim();
    const page = positiveInt(req.query.page, 1, 100000);
    const limit = positiveInt(req.query.limit, 12, 50);
    const offset = (page - 1) * limit;

    let where = "WHERE d.status = 'approved'";
    const params = [];
    if (keyword) {
      where += ' AND (d.title LIKE ? OR d.description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (category) {
      where += ' AND d.category_id = ?';
      params.push(category);
    }

    const [[countRow]] = await db.execute(`SELECT COUNT(*) AS total FROM documents d ${where}`, params);
    const [documents] = await db.execute(
      `SELECT d.*, u.fullname AS uploader_name, c.name AS category_name
       FROM documents d
       LEFT JOIN users u ON u.id = d.uploader_id
       LEFT JOIN categories c ON c.id = d.category_id
       ${where}
       ORDER BY d.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    const total = Number(countRow.total || 0);
    res.json({
      documents,
      totalItems: total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể tải tài liệu.' });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    const description = String(req.body.description || '').trim();
    const category = req.body.category_id || null;
    const file = req.file;

    if (title.length < 3) return res.status(400).json({ message: 'Tiêu đề tối thiểu 3 ký tự.' });
    if (!file) return res.status(400).json({ message: 'Vui lòng chọn file.' });

    const format = (file.originalname.split('.').pop() || 'FILE').toUpperCase();
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'raw', folder: 'docshare' },
      async (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ message: 'Upload Cloudinary thất bại.' });
        }

        try {
          const [insert] = await db.execute(
            `INSERT INTO documents(
               title, description, file_url, cloudinary_public_id, category_id,
               uploader_id, status, file_format, downloads, rejection_reason, reviewed_by, reviewed_at
             ) VALUES(?,?,?,?,?,?,'pending',?,0,NULL,NULL,NULL)`,
            [title, description || null, result.secure_url, result.public_id, category, req.user.id, format]
          );

          await writeAudit({
            req,
            userId: req.user.id,
            action: 'document.uploaded',
            entityType: 'document',
            entityId: insert.insertId,
            details: { title, format, category_id: category },
          });

          res.status(201).json({
            message: 'Tải lên thành công, đang chờ duyệt.',
            documentId: insert.insertId,
          });
        } catch (dbError) {
          console.error(dbError);
          if (result.public_id) {
            await cloudinary.uploader.destroy(result.public_id, { resource_type: 'raw' }).catch(() => {});
          }
          res.status(500).json({ message: 'Không thể lưu tài liệu.' });
        }
      }
    );

    stream.end(file.buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể tải tài liệu lên.' });
  }
};

exports.getPendingDocuments = async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, u.fullname AS uploader_name, c.name AS category_name
      FROM documents d
      LEFT JOIN users u ON u.id = d.uploader_id
      LEFT JOIN categories c ON c.id = d.category_id
      WHERE d.status = 'pending'
      ORDER BY d.created_at ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể tải tài liệu chờ duyệt.' });
  }
};

exports.approveDocument = async (req, res) => {
  try {
    const review = validateReviewInput(req.body.status, req.body.rejection_reason);
    if (!review.ok) return res.status(400).json({ message: review.message });

    const [rows] = await db.execute('SELECT id, title, status FROM documents WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy tài liệu.' });

    await db.execute(
      `UPDATE documents
       SET status = ?, rejection_reason = ?, reviewed_by = ?, reviewed_at = NOW()
       WHERE id = ?`,
      [review.status, review.rejectionReason, req.user.id, req.params.id]
    );

    await writeAudit({
      req,
      userId: req.user.id,
      action: review.status === 'approved' ? 'document.approved' : 'document.rejected',
      entityType: 'document',
      entityId: req.params.id,
      details: { title: rows[0].title, from: rows[0].status, to: review.status, rejection_reason: review.rejectionReason },
    });

    res.json({
      message: review.status === 'approved' ? 'Đã duyệt tài liệu.' : 'Đã từ chối tài liệu.',
      status: review.status,
      rejection_reason: review.rejectionReason,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể cập nhật trạng thái tài liệu.' });
  }
};

exports.downloadDocument = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      "SELECT id, title, file_url FROM documents WHERE id = ? AND status = 'approved' LIMIT 1",
      [req.params.id]
    );

    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ message: 'Tài liệu chưa được duyệt hoặc không tồn tại.' });
    }

    await connection.execute('UPDATE documents SET downloads = downloads + 1 WHERE id = ?', [req.params.id]);
    await connection.execute('INSERT INTO downloads(user_id, document_id) VALUES(?,?)', [req.user.id, req.params.id]);
    await connection.commit();

    await writeAudit({
      req,
      userId: req.user.id,
      action: 'document.downloaded',
      entityType: 'document',
      entityId: req.params.id,
      details: { title: rows[0].title },
    });

    res.json({ downloadUrl: rows[0].file_url });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Không thể tải tài liệu.' });
  } finally {
    connection.release();
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT d.*, u.fullname AS uploader_name, c.name AS category_name
       FROM documents d
       LEFT JOIN users u ON u.id = d.uploader_id
       LEFT JOIN categories c ON c.id = d.category_id
       WHERE d.id = ? LIMIT 1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy tài liệu.' });

    const document = rows[0];
    const canView = document.status === 'approved'
      || req.user?.role === 'admin'
      || Number(document.uploader_id) === Number(req.user?.id);
    if (!canView) return res.status(403).json({ message: 'Bạn không có quyền xem tài liệu này.' });

    res.json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể tải chi tiết tài liệu.' });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    const description = String(req.body.description || '').trim();
    const category = req.body.category_id || null;
    if (title.length < 3) return res.status(400).json({ message: 'Tiêu đề tối thiểu 3 ký tự.' });

    const [rows] = await db.execute('SELECT uploader_id, status FROM documents WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy tài liệu.' });
    if (Number(rows[0].uploader_id) !== Number(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền sửa tài liệu này.' });
    }

    if (req.user.role === 'admin') {
      await db.execute(
        'UPDATE documents SET title = ?, description = ?, category_id = ? WHERE id = ?',
        [title, description || null, category, req.params.id]
      );
    } else {
      await db.execute(
        `UPDATE documents
         SET title = ?, description = ?, category_id = ?, status = 'pending',
             rejection_reason = NULL, reviewed_by = NULL, reviewed_at = NULL
         WHERE id = ?`,
        [title, description || null, category, req.params.id]
      );
    }

    await writeAudit({
      req,
      userId: req.user.id,
      action: 'document.updated',
      entityType: 'document',
      entityId: req.params.id,
      details: { title, previous_status: rows[0].status, requires_review: req.user.role !== 'admin' },
    });

    res.json({
      message: req.user.role === 'admin'
        ? 'Cập nhật thành công.'
        : 'Cập nhật thành công, tài liệu sẽ được duyệt lại.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể cập nhật tài liệu.' });
  }
};

exports.getAllForAdmin = async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, u.fullname AS uploader_name, c.name AS category_name,
             reviewer.fullname AS reviewer_name
      FROM documents d
      LEFT JOIN users u ON u.id = d.uploader_id
      LEFT JOIN categories c ON c.id = d.category_id
      LEFT JOIN users reviewer ON reviewer.id = d.reviewed_by
      ORDER BY d.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể tải danh sách tài liệu.' });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT uploader_id, cloudinary_public_id, title FROM documents WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy tài liệu.' });
    const document = rows[0];

    if (Number(document.uploader_id) !== Number(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền xóa tài liệu này.' });
    }

    if (document.cloudinary_public_id) {
      await cloudinary.uploader.destroy(document.cloudinary_public_id, { resource_type: 'raw' }).catch(() => {});
    }
    await db.execute('DELETE FROM documents WHERE id = ?', [req.params.id]);

    await writeAudit({
      req,
      userId: req.user.id,
      action: 'document.deleted',
      entityType: 'document',
      entityId: req.params.id,
      details: { title: document.title },
    });

    res.json({ message: 'Đã xóa tài liệu.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể xóa tài liệu.' });
  }
};

exports.toggleSaveDocument = async (req, res) => {
  try {
    const [documents] = await db.execute(
      "SELECT id FROM documents WHERE id = ? AND status = 'approved'",
      [req.params.id]
    );
    if (!documents.length) {
      return res.status(404).json({ message: 'Tài liệu chưa được duyệt hoặc không tồn tại.' });
    }

    const [saved] = await db.execute(
      'SELECT user_id FROM saved_documents WHERE user_id = ? AND document_id = ?',
      [req.user.id, req.params.id]
    );

    if (saved.length) {
      await db.execute('DELETE FROM saved_documents WHERE user_id = ? AND document_id = ?', [req.user.id, req.params.id]);
      return res.json({ saved: false, message: 'Đã bỏ lưu.' });
    }

    await db.execute('INSERT INTO saved_documents(user_id, document_id) VALUES(?,?)', [req.user.id, req.params.id]);
    res.json({ saved: true, message: 'Đã lưu tài liệu.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể cập nhật danh sách đã lưu.' });
  }
};

exports.getSavedDocuments = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT d.*, u.fullname AS uploader_name, c.name AS category_name
       FROM saved_documents s
       JOIN documents d ON d.id = s.document_id
       LEFT JOIN users u ON u.id = d.uploader_id
       LEFT JOIN categories c ON c.id = d.category_id
       WHERE s.user_id = ? AND d.status = 'approved'
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể tải tài liệu đã lưu.' });
  }
};
