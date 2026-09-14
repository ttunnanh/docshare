USE hoc_lieu_so_db;

ALTER TABLE documents
  MODIFY status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending';

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS downloads INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cloudinary_public_id VARCHAR(255) NULL;

UPDATE documents d
SET d.downloads = (SELECT COUNT(*) FROM downloads dl WHERE dl.document_id = d.id);

-- Có thể thêm UNIQUE(name) sau demo nếu database thực tế không có tên danh mục trùng.

-- Cột uploaded_by và bảng download_history là dữ liệu legacy; ứng dụng mới dùng uploader_id + downloads.
