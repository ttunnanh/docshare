import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiBookmark,
  FiBookOpen,
  FiCalendar,
  FiDownload,
  FiEdit3,
  FiFolder,
  FiUser,
} from 'react-icons/fi';
import {
  downloadDocument,
  getDocument,
  getSaved,
  toggleSave,
} from '../services/documentService';

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  let user = null;
  try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch { user = null; }

  const [document, setDocument] = useState(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setError('');

    Promise.all([
      getDocument(id),
      token ? getSaved().catch(() => []) : Promise.resolve([]),
    ])
      .then(([data, savedDocuments]) => {
        if (!active) return;
        setDocument(data);
        setSaved(savedDocuments.some((item) => Number(item.id) === Number(id)));
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Không thể tải tài liệu.');
      });

    return () => { active = false; };
  }, [id, token]);

  const requireAuth = () => {
    if (token) return true;
    navigate('/login', { state: { from: `/documents/${id}` } });
    return false;
  };

  const handleDownload = async () => {
    if (!requireAuth()) return;
    setBusy(true);
    try {
      const result = await downloadDocument(id);
      window.open(result.downloadUrl, '_blank', 'noopener,noreferrer');
      setDocument((current) => ({ ...current, downloads: Number(current.downloads || 0) + 1 }));
    } catch (requestError) {
      alert(requestError.response?.data?.message || 'Không thể tải tài liệu.');
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async () => {
    if (!requireAuth()) return;
    try {
      const result = await toggleSave(id);
      setSaved(result.saved);
    } catch (requestError) {
      alert(requestError.response?.data?.message || 'Không thể cập nhật danh sách đã lưu.');
    }
  };

  if (error) {
    return (
      <main className="section shell narrow">
        <div className="state-card error">
          <h3>Không thể mở tài liệu</h3>
          <p>{error}</p>
          <Link className="btn ghost small" to="/"><FiArrowLeft /> Quay lại thư viện</Link>
        </div>
      </main>
    );
  }

  if (!document) {
    return <main className="section shell narrow"><div className="state-card">Đang tải chi tiết tài liệu...</div></main>;
  }

  const canEdit = user?.role === 'admin' || Number(user?.id) === Number(document.uploader_id);
  const approved = document.status === 'approved';
  const date = document.created_at ? new Date(document.created_at).toLocaleDateString('vi-VN') : '—';

  return (
    <main className="section shell detail-shell">
      <Link className="back-link" to="/"><FiArrowLeft /> Quay lại thư viện</Link>

      <div className="detail-layout">
        <article className="detail-card detail-main">
          <div className="detail-head">
            <div>
              <div className="detail-kickers">
                <span className="format-chip">{document.file_format || 'FILE'}</span>
                <span className={`badge ${document.status}`}>{document.status}</span>
              </div>
              <h1>{document.title}</h1>
              <p>{document.description || 'Tài liệu này chưa có mô tả chi tiết.'}</p>
            </div>
          </div>

          <div className="detail-meta">
            <div><span><FiFolder /> Danh mục</span><strong>{document.category_name || 'Chưa phân loại'}</strong></div>
            <div><span><FiUser /> Người đăng</span><strong>{document.uploader_name || 'Người dùng DocShare'}</strong></div>
            <div><span><FiDownload /> Lượt tải</span><strong>{Number(document.downloads || 0).toLocaleString('vi-VN')}</strong></div>
            <div><span><FiCalendar /> Ngày đăng</span><strong>{date}</strong></div>
          </div>

          <div className="document-note">
            <FiBookOpen />
            <div>
              <strong>Học liệu đã được kiểm duyệt</strong>
              <p>{approved ? 'Tài liệu đã được quản trị viên DocShare phê duyệt trước khi hiển thị công khai.' : 'Tài liệu này hiện chỉ hiển thị cho chủ sở hữu hoặc quản trị viên.'}</p>
            </div>
          </div>
        </article>

        <aside className="detail-card detail-actions-card">
          <span className="eyebrow">Thao tác</span>
          <h3>Sẵn sàng học tập?</h3>
          <p>{token ? 'Lưu vào thư viện cá nhân hoặc tải tài liệu xuống thiết bị.' : 'Đăng nhập để lưu và tải học liệu xuống thiết bị.'}</p>

          {approved && (
            <>
              <button className="btn primary wide" type="button" disabled={busy} onClick={handleDownload}>
                <FiDownload /> {busy ? 'Đang xử lý...' : 'Tải tài liệu'}
              </button>
              <button className={saved ? 'btn saved-action wide' : 'btn ghost wide'} type="button" onClick={handleSave}>
                <FiBookmark /> {saved ? 'Đã lưu' : 'Lưu vào thư viện'}
              </button>
            </>
          )}

          {canEdit && (
            <Link className="btn ghost wide" to={`/document/edit/${document.id}`}><FiEdit3 /> Chỉnh sửa tài liệu</Link>
          )}

          {!token && <Link className="detail-login-link" to="/login">Đăng nhập vào DocShare →</Link>}
        </aside>
      </div>
    </main>
  );
}
