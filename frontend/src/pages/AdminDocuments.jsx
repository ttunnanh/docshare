import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit3, FiEye, FiFileText, FiSearch, FiTrash2 } from 'react-icons/fi';
import AdminNav from '../components/AdminNav';
import { deleteDocument, getAllAdmin } from '../services/documentService';

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    try {
      setError('');
      setDocuments(await getAllAdmin());
    } catch {
      setError('Không thể tải danh sách tài liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => documents.filter((document) => {
    const text = `${document.title} ${document.uploader_name || ''} ${document.category_name || ''}`.toLowerCase();
    const matchesText = text.includes(query.trim().toLowerCase());
    const matchesStatus = !status || document.status === status;
    return matchesText && matchesStatus;
  }), [documents, query, status]);

  const remove = async (document) => {
    if (!window.confirm(`Xóa vĩnh viễn tài liệu "${document.title}"?`)) return;
    setWorkingId(document.id);
    setError('');
    setNotice('');
    try {
      const result = await deleteDocument(document.id);
      setDocuments((items) => items.filter((item) => item.id !== document.id));
      setNotice(result.message || 'Đã xóa tài liệu.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể xóa tài liệu.');
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <main className="section shell admin-page">
      <AdminNav />
      <div className="admin-head">
        <div>
          <span className="eyebrow">Kho học liệu</span>
          <h1>Quản lý tài liệu</h1>
          <p>Tra cứu, chỉnh sửa hoặc gỡ tài liệu trong toàn bộ hệ thống.</p>
        </div>
        <div className="queue-pill"><FiFileText /> {documents.length} tài liệu</div>
      </div>

      <div className="admin-filterbar">
        <div className="admin-search"><FiSearch /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tiêu đề, người đăng, danh mục..." /></div>
        <select className="select-mini" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Mọi trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Từ chối</option>
        </select>
      </div>

      {error && <div className="alert error admin-alert">{error}</div>}
      {notice && <div className="alert success admin-alert">{notice}</div>}

      {loading ? (
        <div className="state-card">Đang tải tài liệu...</div>
      ) : (
        <div className="panel table-wrap">
          <table>
            <thead><tr><th>Tài liệu</th><th>Người đăng</th><th>Danh mục</th><th>Trạng thái</th><th>Lượt tải</th><th>Thao tác</th></tr></thead>
            <tbody>
              {filtered.map((document) => (
                <tr key={document.id}>
                  <td><Link to={`/documents/${document.id}`}><strong>{document.title}</strong></Link><div className="cell-sub">{document.file_format || 'FILE'} · ID #{document.id}</div></td>
                  <td>{document.uploader_name || '—'}</td>
                  <td>{document.category_name || '—'}</td>
                  <td><span className={`badge ${document.status}`}>{document.status}</span></td>
                  <td>{Number(document.downloads || 0).toLocaleString('vi-VN')}</td>
                  <td>
                    <div className="row-actions admin-row-actions">
                      <Link to={`/documents/${document.id}`}><FiEye /> Xem</Link>
                      <Link to={`/document/edit/${document.id}`}><FiEdit3 /> Sửa</Link>
                      <button className="reject" disabled={workingId === document.id} onClick={() => remove(document)}><FiTrash2 /> Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <div className="empty-inline">Không có tài liệu phù hợp với bộ lọc.</div>}
        </div>
      )}
    </main>
  );
}
