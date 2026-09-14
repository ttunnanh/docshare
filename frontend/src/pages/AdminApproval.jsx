import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiClock, FiEye, FiX } from 'react-icons/fi';
import AdminNav from '../components/AdminNav';
import { getPendingDocuments, setDocumentStatus } from '../services/adminService';

export default function AdminApproval() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    try {
      setError('');
      setDocuments(await getPendingDocuments());
    } catch {
      setError('Không thể tải hàng đợi kiểm duyệt.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const act = async (id, status) => {
    const approved = status === 'approved';
    if (!window.confirm(approved ? 'Duyệt tài liệu này và hiển thị công khai?' : 'Từ chối tài liệu này?')) return;

    setWorkingId(id);
    setError('');
    setNotice('');
    try {
      const result = await setDocumentStatus(id, status);
      setDocuments((items) => items.filter((item) => item.id !== id));
      setNotice(result.message || (approved ? 'Đã duyệt tài liệu.' : 'Đã từ chối tài liệu.'));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể cập nhật trạng thái tài liệu.');
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <main className="section shell admin-page">
      <AdminNav />
      <div className="admin-head">
        <div>
          <span className="eyebrow">Kiểm duyệt học liệu</span>
          <h1>Tài liệu chờ duyệt</h1>
          <p>Kiểm tra nội dung và metadata trước khi đưa tài liệu lên thư viện công khai.</p>
        </div>
        <div className="queue-pill"><FiClock /> {documents.length} đang chờ</div>
      </div>

      {error && <div className="alert error admin-alert">{error}</div>}
      {notice && <div className="alert success admin-alert">{notice}</div>}

      {loading ? (
        <div className="state-card">Đang tải hàng đợi kiểm duyệt...</div>
      ) : !documents.length ? (
        <div className="state-card empty-state"><FiCheck /><h3>Hàng đợi đã sạch</h3><p>Không có tài liệu nào đang chờ phê duyệt.</p></div>
      ) : (
        <div className="panel table-wrap">
          <table>
            <thead><tr><th>Tài liệu</th><th>Người đăng</th><th>Danh mục</th><th>Ngày gửi</th><th>Thao tác</th></tr></thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id}>
                  <td><strong>{document.title}</strong><div className="cell-sub">{document.file_format || 'FILE'} · ID #{document.id}</div></td>
                  <td>{document.uploader_name || 'Ẩn danh'}</td>
                  <td>{document.category_name || '—'}</td>
                  <td>{document.created_at ? new Date(document.created_at).toLocaleDateString('vi-VN') : '—'}</td>
                  <td>
                    <div className="row-actions admin-row-actions">
                      <Link to={`/documents/${document.id}`}><FiEye /> Xem</Link>
                      <button className="approve" disabled={workingId === document.id} onClick={() => act(document.id, 'approved')}><FiCheck /> Duyệt</button>
                      <button className="reject" disabled={workingId === document.id} onClick={() => act(document.id, 'rejected')}><FiX /> Từ chối</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
