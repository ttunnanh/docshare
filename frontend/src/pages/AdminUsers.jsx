import { useEffect, useMemo, useState } from 'react';
import { FiLock, FiSearch, FiTrash2, FiUnlock, FiUsers } from 'react-icons/fi';
import AdminNav from '../components/AdminNav';
import { deleteUser, getAllUsers, updateUserRole, updateUserStatus } from '../services/adminService';

const roleLabel = { student: 'Sinh viên', teacher: 'Giảng viên', admin: 'Admin' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => users.filter((user) => {
    const matchesText = `${user.fullname} ${user.email}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const active = Number(user.is_active) !== 0;
    const matchesStatus = !statusFilter || (statusFilter === 'active' ? active : !active);
    return matchesText && matchesRole && matchesStatus;
  }), [users, query, roleFilter, statusFilter]);

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

  const toggleStatus = async (user) => {
    const isActive = Number(user.is_active) !== 0;
    const nextActive = !isActive;
    const question = nextActive
      ? `Mở khóa tài khoản "${user.fullname}"?`
      : `Khóa tài khoản "${user.fullname}"? Người dùng sẽ không thể đăng nhập hoặc tiếp tục dùng phiên hiện tại.`;
    if (!window.confirm(question)) return;

    setWorkingId(user.id);
    setError('');
    setNotice('');
    try {
      const result = await updateUserStatus(user.id, nextActive);
      setUsers((items) => items.map((item) => item.id === user.id
        ? { ...item, is_active: nextActive ? 1 : 0, locked_at: nextActive ? null : new Date().toISOString() }
        : item));
      setNotice(result.message || (nextActive ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.'));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể cập nhật trạng thái tài khoản.');
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

  const activeCount = users.filter((user) => Number(user.is_active) !== 0).length;

  return (
    <main className="section shell admin-page">
      <AdminNav />
      <div className="admin-head">
        <div>
          <span className="eyebrow">Quản lý tài khoản</span>
          <h1>Người dùng</h1>
          <p>Phân quyền, khóa/mở khóa và quản lý vòng đời tài khoản DocShare.</p>
        </div>
        <div className="queue-pill"><FiUsers /> {activeCount}/{users.length} đang hoạt động</div>
      </div>

      <div className="admin-filterbar enterprise-filterbar">
        <div className="admin-search"><FiSearch /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên hoặc email..." /></div>
        <select className="select-mini" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
          <option value="">Tất cả vai trò</option>
          <option value="student">Sinh viên</option>
          <option value="teacher">Giảng viên</option>
          <option value="admin">Admin</option>
        </select>
        <select className="select-mini" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="locked">Đã khóa</option>
        </select>
      </div>

      {error && <div className="alert error admin-alert">{error}</div>}
      {notice && <div className="alert success admin-alert">{notice}</div>}

      {loading ? (
        <div className="state-card">Đang tải người dùng...</div>
      ) : (
        <div className="panel table-wrap">
          <table>
            <thead><tr><th>Người dùng</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Hoạt động gần nhất</th><th>Thao tác</th></tr></thead>
            <tbody>
              {filtered.map((user) => {
                const active = Number(user.is_active) !== 0;
                const isCurrent = user.id === current?.id;
                return (
                  <tr key={user.id}>
                    <td><strong>{user.fullname}</strong>{isCurrent && <div className="cell-sub">Tài khoản đang đăng nhập</div>}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        className="select-mini"
                        value={user.role}
                        disabled={isCurrent || workingId === user.id}
                        onChange={(event) => changeRole(user.id, event.target.value)}
                      >
                        <option value="student">{roleLabel.student}</option>
                        <option value="teacher">{roleLabel.teacher}</option>
                        <option value="admin">{roleLabel.admin}</option>
                      </select>
                    </td>
                    <td>
                      <span className={`account-state ${active ? 'active' : 'locked'}`}>
                        {active ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                      {!active && user.locked_at && <div className="cell-sub">{new Date(user.locked_at).toLocaleString('vi-VN')}</div>}
                    </td>
                    <td>{user.last_login_at ? new Date(user.last_login_at).toLocaleString('vi-VN') : 'Chưa đăng nhập'}</td>
                    <td>
                      {isCurrent ? (
                        <span className="cell-sub">Được bảo vệ</span>
                      ) : (
                        <div className="admin-user-actions">
                          <button
                            className={active ? 'lock-action' : 'unlock-action'}
                            disabled={workingId === user.id}
                            onClick={() => toggleStatus(user)}
                            type="button"
                          >
                            {active ? <><FiLock /> Khóa</> : <><FiUnlock /> Mở khóa</>}
                          </button>
                          <button className="danger-link table-action" disabled={workingId === user.id} onClick={() => removeUser(user.id, user.fullname)} type="button">
                            <FiTrash2 /> Xóa
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!filtered.length && <div className="empty-inline">Không tìm thấy người dùng phù hợp.</div>}
        </div>
      )}
    </main>
  );
}
