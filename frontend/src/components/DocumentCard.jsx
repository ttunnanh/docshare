import { Link } from 'react-router-dom';
import { FiBookmark, FiBookOpen, FiDownload, FiUser } from 'react-icons/fi';

const formatDate = (value) => {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
  } catch {
    return '';
  }
};

export default function DocumentCard({ doc, saved = false, onSave, onDownload }) {
  const format = (doc.file_format || 'FILE').toUpperCase();

  return (
    <article className="doc-card">
      <div className="doc-top">
        <span className="format-chip" data-format={format}>{format}</span>
        {onSave && (
          <button
            className={saved ? 'save-btn saved' : 'save-btn'}
            type="button"
            onClick={() => onSave(doc.id)}
            title={saved ? 'Bỏ lưu tài liệu' : 'Lưu tài liệu'}
            aria-label={saved ? 'Bỏ lưu tài liệu' : 'Lưu tài liệu'}
          >
            <FiBookmark />
          </button>
        )}
      </div>

      <Link className="doc-title" to={`/documents/${doc.id}`}>{doc.title}</Link>
      <p className="doc-desc">{doc.description || 'Tài liệu chưa có mô tả chi tiết.'}</p>

      <div className="doc-meta">
        <span><FiBookOpen /> {doc.category_name || 'Chưa phân loại'}</span>
        <span><FiUser /> {doc.uploader_name || 'Người dùng DocShare'}</span>
      </div>

      <div className="doc-footer">
        <div className="doc-stats">
          <strong>{Number(doc.downloads || 0).toLocaleString('vi-VN')}</strong>
          <span>lượt tải{doc.created_at ? ` · ${formatDate(doc.created_at)}` : ''}</span>
        </div>
        {onDownload && (
          <button className="btn ghost small" type="button" onClick={() => onDownload(doc.id)}>
            <FiDownload /> Tải xuống
          </button>
        )}
      </div>
    </article>
  );
}
