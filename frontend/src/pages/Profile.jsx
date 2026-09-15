import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBookOpen,
  FiDownload,
  FiEdit3,
  FiLock,
  FiSettings,
  FiTrash2,
  FiUploadCloud,
  FiUser,
} from 'react-icons/fi';
import { changePassword, getDownloads, getProfile, getUploads, updateProfile } from '../services/userService';
import { deleteDocument } from '../services/documentService';

const roleLabel = { student: 'Sinh viên', teacher: 'Giảng viên', admin: 'Quản trị viên' };

export default function Profile() {
  const [user, setUser] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [tab, setTab] = useState('uploads');
  const [name, setName] = useState('');
  const [password, setPassword] = useState({ oldPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    try {
      setError('');
      const [profileData, uploadData, downloadData] = await Promise.all([getProfile(), getUploads(), getDownloads()]);
      setUser(profileData);
      setName(profileData.fullname);
      setUploads(uploadData);
      setDownloads(downloadData);
      localStorage.setItem('user', JSON.stringify(profileData));
      window.dispatchEvent(new Event('auth-changed'));
    } catch {
      setError('Không thể tải hồ sơ. Vui lòng tải lại trang.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => ({
    uploads: uploads.length,
    approved: uploads.filter((item) => item.status === 'approved').length,
    pending: uploads.filter((item) => item.status === 'pending').length,
    downloads: downloads.length,
  }), [uploads, downloads]);

  const saveName = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice('');
    setError('');
    try {
      const result = await updateProfile(name.trim());
      setNotice(result.message || 'Đã cập nhật thông tin.');
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể cập nhật thông tin.');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice('');
    setError('');
    try {
      const result = await changePassword(password.oldPassword, password.newPassword);
      setNotice(result.message || 'Đổi mật khẩu thành công.');
      setPassword({ oldPassword: '', newPassword: '' });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể đổi mật khẩu.');
    } finally {
      setSaving(false);
    }
  };

  const removeDocument = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa tài liệu này? Hành động không thể hoàn tác.')) return;
    try {
      await deleteDocument(id);
      setUploads((items) => items.filter((item) => item.id !== id));
      setNotice('Đã xóa tài liệu.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể xóa tài liệu.');
    }
  };

  if (loading) return <main className="section shell"><div className="state-card">Đang tải hồ sơ...</div></main>;
  if (!user) return <main className="section shell"><div className="state-card error">{error || 'Không thể tải hồ sơ.'}</div></main>;

  const tabs = [
    ['uploads', FiBookOpen, 'Tài liệu của tôi'],
    ['downloads', FiDownload, 'Lịch sử tải'],
    ['settings', FiSettings, 'Cài đặt'],
  ];

  return (
    <main className="section shell">
      <section className="panel profile-hero">
        <div className="profile-head">
          <div className="avatar">{user.fullname?.[0]?.toUpperCase() || 'U'}</div>
          <div>
            <span className="eyebrow">{roleLabel[user.role] || user.role}</span>
            <h1>{user.fullname}</h1>
            <p>{user.email}</p>
          </div>
        </div>
        <Link className="btn primary small" to="/upload"><FiUploadCloud /> Đăng tài liệu</Link>
      </section>

      <div className="profile-stat-grid">
        <div><strong>{stats.uploads}</strong><span>Đã đăng</span></div>
        <div><strong>{stats.approved}</strong><span>Đã duyệt</span></div>
        <div><strong>{stats.pending}</strong><span>Chờ duyệt</span></div>
        <div><strong>{stats.downloads}</strong><span>Lượt tải của bạn</span></div>
      </div>

      {(error || notice) && <div className={error ? 'alert error profile-alert' : 'alert success profile-alert'}>{error || notice}</div>}

      <div className="tabs profile-tabs">
        {tabs.map(([key, Icon, label]) => (
          <button key={key} className={tab === key ? 'active' : ''} type="button" onClick={() => { setTab(key); setError(''); setNotice(''); }}>
            <Icon /> {label}
          </button>
        ))}
      </div>

      {tab === 'uploads' && (
        <div className="panel table-wrap">
          <table>
            <thead><tr><th>Tài liệu</th><th>Danh mục</th><th>Trạng thái</th><th>Lượt tải</th><th>Ngày đăng</th><th>Thao tác</th></tr></thead>
            <tbody>
              {uploads.map((document) => (
                <tr key={document.id}>
                  <td>
                    <Link to={`/documents/${document.id}`}>{document.title}</Link>
                    <div className="cell-sub">{document.file_format || 'FILE'}</div>
                    {document.status === 'rejected' && document.rejection_reason && (
                      <div className="rejection-feedback"><strong>Lý do từ chối:</strong> {document.rejection_reason}</div>
                    )}
                  </td>
                  <td>{document.category_name || '—'}</td>
                  <td><span className={`badge ${document.status}`}>{document.status}</span></td>
                  <td>{Number(document.downloads || 0).toLocaleString('vi-VN')}</td>
                  <td>{document.created_at ? new Date(document.created_at).toLocaleDateString('vi-VN') : '—'}</td>
                  <td>
                    <div className="row-actions">
                      <Link to={`/document/edit/${document.id}`}><FiEdit3 /> Sửa</Link>
                      <button className="danger-link" type="button" onClick={() => removeDocument(document.id)}><FiTrash2 /> Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!uploads.length && <div className="empty-inline">Bạn chưa đăng tài liệu nào. <Link to="/upload">Đăng tài liệu đầu tiên →</Link></div>}
        </div>
      )}

      {tab === 'downloads' && (
        <div className="panel table-wrap">
          <table>
            <thead><tr><th>Tài liệu</th><th>Định dạng</th><th>Thời gian tải</th></tr></thead>
            <tbody>
              {downloads.map((item) => (
                <tr key={item.download_id}>
                  <td><Link to={`/documents/${item.document_id}`}>{item.title}</Link></td>
                  <td><span className="format-chip">{item.file_format || 'FILE'}</span></td>
                  <td>{item.downloaded_at ? new Date(item.downloaded_at).toLocaleString('vi-VN') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!downloads.length && <div className="empty-inline">Chưa có lịch sử tải tài liệu.</div>}
        </div>
      )}

      {tab === 'settings' && (
        <div className="settings-grid">
          <form className="panel form-stack" onSubmit={saveName}>
            <div className="settings-title"><span><FiUser /></span><div><h3>Thông tin cá nhân</h3><p>Cập nhật tên hiển thị trên DocShare.</p></div></div>
            <label>Họ và tên<input className="input" value={name} minLength={2} onChange={(event) => setName(event.target.value)} required /></label>
            <button className="btn primary" disabled={saving} type="submit">Lưu thông tin</button>
          </form>

          <form className="panel form-stack" onSubmit={savePassword}>
            <div className="settings-title"><span><FiLock /></span><div><h3>Đổi mật khẩu</h3><p>Nên sử dụng mật khẩu riêng cho tài khoản này.</p></div></div>
            <label>Mật khẩu hiện tại<input className="input" type="password" autoComplete="current-password" value={password.oldPassword} onChange={(event) => setPassword({ ...password, oldPassword: event.target.value })} required /></label>
            <label>Mật khẩu mới<input className="input" type="password" autoComplete="new-password" minLength={6} value={password.newPassword} onChange={(event) => setPassword({ ...password, newPassword: event.target.value })} required /></label>
            <button className="btn dark" disabled={saving} type="submit">Đổi mật khẩu</button>
          </form>
        </div>
      )}
    </main>
  );
}
