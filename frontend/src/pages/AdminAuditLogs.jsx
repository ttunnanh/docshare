import { useEffect, useMemo, useState } from 'react';
import { FiActivity, FiRefreshCw, FiSearch } from 'react-icons/fi';
import AdminNav from '../components/AdminNav';
import { getAuditLogs } from '../services/adminService';

const actionLabels = {
  'auth.register': 'Đăng ký',
  'auth.login': 'Đăng nhập',
  'auth.login_failed': 'Đăng nhập thất bại',
  'auth.login_blocked': 'Đăng nhập bị chặn',
  'admin.user_role_changed': 'Đổi vai trò',
  'admin.user_locked': 'Khóa tài khoản',
  'admin.user_unlocked': 'Mở khóa tài khoản',
  'admin.user_deleted': 'Xóa tài khoản',
  'document.draft_created': 'Tạo bản nháp',
  'document.draft_saved': 'Lưu bản nháp',
  'document.uploaded': 'Gửi tài liệu duyệt',
  'document.updated': 'Sửa / gửi lại tài liệu',
  'document.approved': 'Duyệt tài liệu',
  'document.rejected': 'Từ chối tài liệu',
  'document.downloaded': 'Tải tài liệu (legacy)',
  'document.stream_downloaded': 'Tải qua Stream Guard',
  'document.deleted': 'Xóa tài liệu',
};

const actionGroup = (action = '') => {
  if (action.startsWith('auth.')) return 'auth';
  if (action.startsWith('admin.')) return 'admin';
  if (action.startsWith('document.')) return 'document';
  return 'other';
};

const formatDetails = (value) => {
  if (!value) return '—';
  try {
    const parsed = JSON.parse(value);
    return Object.entries(parsed)
      .filter(([, item]) => item !== null && item !== undefined && item !== '')
      .map(([key, item]) => `${key}: ${String(item)}`)
      .join(' · ') || '—';
  } catch {
    return value;
  }
};

export default function AdminAuditLogs() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, totalPages: 1 });
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (page = 1, search = submittedQuery, selectedAction = action) => {
    setLoading(true);
    setError('');
    try {
      const result = await getAuditLogs({ page, limit: 30, search, action: selectedAction });
      setData(result);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể tải nhật ký hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1, '', ''); }, []);

  const actions = useMemo(() => Object.keys(actionLabels).sort(), []);

  const submitSearch = (event) => {
    event.preventDefault();
    const clean = query.trim();
    setSubmittedQuery(clean);
    load(1, clean, action);
  };

  const changeAction = (event) => {
    const next = event.target.value;
    setAction(next);
    load(1, submittedQuery, next);
  };

  return (
    <main className="section shell admin-page">
      <AdminNav />
      <div className="admin-head">
        <div>
          <span className="eyebrow">An toàn & truy vết</span>
          <h1>Nhật ký hệ thống</h1>
          <p>Theo dõi các hoạt động quan trọng về xác thực, quản trị tài khoản và vòng đời học liệu.</p>
        </div>
        <div className="queue-pill"><FiActivity /> {Number(data.total || 0).toLocaleString('vi-VN')} sự kiện</div>
      </div>

      <div className="admin-filterbar enterprise-filterbar audit-filterbar">
        <form className="admin-search" onSubmit={submitSearch}>
          <FiSearch />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm action, người dùng, entity, chi tiết..." />
        </form>
        <select className="select-mini" value={action} onChange={changeAction}>
          <option value="">Tất cả hành động</option>
          {actions.map((item) => <option key={item} value={item}>{actionLabels[item]}</option>)}
        </select>
        <button className="audit-refresh" type="button" onClick={() => load(data.page)} disabled={loading}><FiRefreshCw /> Làm mới</button>
      </div>

      {error && <div className="alert error admin-alert">{error}</div>}

      {loading ? (
        <div className="state-card">Đang tải nhật ký...</div>
      ) : !data.items?.length ? (
        <div className="state-card empty-state"><FiActivity /><h3>Chưa có sự kiện phù hợp</h3><p>Thử đổi bộ lọc hoặc thực hiện một vài thao tác trong hệ thống.</p></div>
      ) : (
        <div className="panel table-wrap audit-table-wrap">
          <table>
            <thead><tr><th>Thời gian</th><th>Hành động</th><th>Người thực hiện</th><th>Đối tượng</th><th>Chi tiết</th><th>IP</th></tr></thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.id}>
                  <td className="audit-time">{item.created_at ? new Date(item.created_at).toLocaleString('vi-VN') : '—'}</td>
                  <td><span className={`audit-action ${actionGroup(item.action)}`}>{actionLabels[item.action] || item.action}</span><div className="cell-sub">{item.action}</div></td>
                  <td>{item.user_name || 'Hệ thống / khách'}<div className="cell-sub">{item.user_email || (item.user_id ? `User #${item.user_id}` : 'Không xác định')}</div></td>
                  <td>{item.entity_type ? `${item.entity_type}${item.entity_id ? ` #${item.entity_id}` : ''}` : '—'}</td>
                  <td className="audit-details">{formatDetails(item.details)}</td>
                  <td className="audit-ip">{item.ip_address || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.totalPages > 1 && (
        <div className="audit-pagination">
          <button type="button" disabled={loading || data.page <= 1} onClick={() => load(data.page - 1)}>← Trang trước</button>
          <span>Trang {data.page} / {data.totalPages}</span>
          <button type="button" disabled={loading || data.page >= data.totalPages} onClick={() => load(data.page + 1)}>Trang sau →</button>
        </div>
      )}
    </main>
  );
}
