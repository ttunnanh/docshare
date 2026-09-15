import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiClock, FiEye, FiMessageSquare, FiX } from 'react-icons/fi';
import AdminNav from '../components/AdminNav';
import { getPendingDocuments, setDocumentStatus } from '../services/adminService';

export default function AdminApproval() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');

  const load = async () => {
    try {
      setError('');
      setDocuments(await getPendingDocuments());
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể tải hàng đợi kiểm duyệt.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (document) => {
    if (!window.confirm(`Duyệt "${document.title}" và hiển thị công khai?`)) return;
    setWorkingId(document.id);
    setError('');
    setNotice('');
    try {
      const result = await setDocumentStatus(document.id, 'approved');
      setDocuments((items) => items.filter((item) => item.id !== document.id));
      setNotice(result.message || 'Đã duyệt tài liệu.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể duyệt tài liệu.');
    } finally {
      setWorkingId(null);
    }
  };

  const openReject = (document) => {
    setRejecting(document);
    setReason('');
    setError('');
    setNotice('');
  };

  const reject = async (event) => {
    event.preventDefault();
    const cleanReason = reason.trim();
    if (cleanReason.length < 3) {
      setError('Lý do từ chối cần tối thiểu 3 ký tự.');
      return;
    }

    setWorkingId(rejecting.id);
    setError('');
    try {
      const result = await setDocumentStatus(rejecting.id, 'rejected', cleanReason);
      setDocuments((items) => items.filter((item) => item.id !== rejecting.id));
      setNotice(result.message || 'Đã từ chối tài liệu và lưu lý do.');
      setRejecting(null);
      setReason('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể từ chối tài liệu.');
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
          <p>Kiểm tra nội dung và metadata. Tài liệu bị từ chối bắt buộc có phản hồi để người đăng biết cách chỉnh sửa.</p>
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
                      <button className="approve" disabled={workingId === document.id} onClick={() => approve(document)}><FiCheck /> Duyệt</button>
                      <button className="reject" disabled={workingId === document.id} onClick={() => openReject(document)}><FiX /> Từ chối</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rejecting && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !workingId) setRejecting(null);
        }}>
          <form className="review-modal panel" onSubmit={reject}>
            <div className="review-modal-icon"><FiMessageSquare /></div>
            <div>
              <span className="eyebrow">Phản hồi kiểm duyệt</span>
              <h2>Từ chối tài liệu</h2>
              <p><strong>{rejecting.title}</strong></p>
            </div>
            <label>
              Lý do từ chối
              <textarea
                className="input review-textarea"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                maxLength={500}
                rows={5}
                autoFocus
                placeholder="Ví dụ: Nội dung chưa đúng danh mục, thiếu mô tả hoặc file chưa hoàn chỉnh..."
                required
              />
            </label>
            <div className="review-counter">{reason.length}/500 ký tự</div>
            <div className="review-modal-actions">
              <button className="btn ghost" type="button" disabled={Boolean(workingId)} onClick={() => setRejecting(null)}>Hủy</button>
              <button className="btn danger" type="submit" disabled={Boolean(workingId) || reason.trim().length < 3}><FiX /> Xác nhận từ chối</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
