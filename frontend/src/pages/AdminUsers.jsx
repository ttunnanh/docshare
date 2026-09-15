import { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiTrash2, FiUsers } from 'react-icons/fi';
import AdminNav from '../components/AdminNav';
import { deleteUser, getAllUsers, updateUserRole } from '../services/adminService';

const roleLabel = { student: 'Sinh viên', teacher: 'Giảng viên', admin: 'Admin' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [workingId, setWorkingId] = useState(null);
  let current = null;
  try { current = JSON.parse(localStorage.getItem('user') || 'null'); } catch { current = null; }

  const load = async () => {
    try {
      setError('');
      setUsers(await getAllUsers());
    } catch {
      setError('Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => users.filter((user) => {
    const matchesText = `${user.fullname} ${user.email}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesText && matchesRole;
  }), [users, query, roleFilter]);

  const changeRole = async (id, role) => {
    setWorkingId(id);
    setError('');
    setNotice('');
    try {
      const result = await updateUserRole(id, role);
      setUsers((items) => items.map((item) => item.id === id ? { ...item, role } : item));
      setNotice(result.message || 'Đã cập nhật vai trò.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể cập nhật vai trò.');
      await load();
    } finally {
      setWorkingId(null);
    }
  };

  const removeUser = async (id, fullname) => {
    if (!window.confirm(`Xóa tài khoản "${fullname}"? Hành động này không thể hoàn tác.`)) return;
    setWorkingId(id);
    setError('');
    setNotice('');
    try {
      const result = await deleteUser(id);
      setUsers((items) => items.filter((item) => item.id !== id));
      setNotice(result.message || 'Đã xóa người dùng.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể xóa người dùng. Tài khoản có thể đang liên kết với dữ liệu khác.');
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <main className="section shell admin-page">
      <AdminNav />
      <div className="admin-head">
        <div>
          <span className="eyebrow">Quản lý tài khoản</span>
          <h1>Người dùng</h1>
          <p>Phân quyền và quản lý các tài khoản đang sử dụng DocShare.</p>
        </div>
        <div className="queue-pill"><FiUsers /> {users.length} tài khoản</div>
      </div>

      <div className="admin-filterbar">
        <div className="admin-search"><FiSearch /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên hoặc email..." /></div>
        <select className="select-mini" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
          <option value="">Tất cả vai trò</option>
          <option value="student">Sinh viên</option>
          <option value="teacher">Giảng viên</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {error && <div className="alert error admin-alert">{error}</div>}
      {notice && <div className="alert success admin-alert">{notice}</div>}

      {loading ? (
        <div className="state-card">Đang tải người dùng...</div>
      ) : (
        <div className="panel table-wrap">
          <table>
            <thead><tr><th>Người dùng</th><th>Email</th><th>Vai trò</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td><strong>{user.fullname}</strong>{user.id === current?.id && <div className="cell-sub">Tài khoản đang đăng nhập</div>}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      className="select-mini"
                      value={user.role}
                      disabled={user.id === current?.id || workingId === user.id}
                      onChange={(event) => changeRole(user.id, event.target.value)}
                    >
                      <option value="student">{roleLabel.student}</option>
                      <option value="teacher">{roleLabel.teacher}</option>
                      <option value="admin">{roleLabel.admin}</option>
                    </select>
                  </td>
                  <td>{user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : '—'}</td>
                  <td>
                    {user.id !== current?.id ? (
                      <button className="danger-link table-action" disabled={workingId === user.id} onClick={() => removeUser(user.id, user.fullname)}><FiTrash2 /> Xóa</button>
                    ) : <span className="cell-sub">Được bảo vệ</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <div className="empty-inline">Không tìm thấy người dùng phù hợp.</div>}
        </div>
      )}
    </main>
  );
}
