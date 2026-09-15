import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiActivity, FiBook, FiClock, FiDownload, FiFolder, FiLock, FiShield, FiUsers } from 'react-icons/fi';
import AdminNav from '../components/AdminNav';
import { getDashboardStats } from '../services/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    lockedUsers: 0,
    totalDocuments: 0,
    approvedDocuments: 0,
    pendingDocuments: 0,
    rejectedDocuments: 0,
    totalDownloads: 0,
    totalAuditEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((requestError) => setError(requestError.response?.data?.message || 'Không thể tải dữ liệu dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    [FiUsers, 'Người dùng', stats.totalUsers, '/admin/users'],
    [FiLock, 'Tài khoản khóa', stats.lockedUsers, '/admin/users'],
    [FiBook, 'Tài liệu', stats.totalDocuments, '/admin/documents'],
    [FiClock, 'Chờ duyệt', stats.pendingDocuments, '/admin/approval'],
    [FiDownload, 'Lượt tải', stats.totalDownloads, '/admin/documents'],
    [FiActivity, 'Audit events', stats.totalAuditEvents, '/admin/audit-logs'],
  ];

  return (
    <main className="section shell admin-page">
      <AdminNav />

      <div className="admin-head">
        <div>
          <span className="eyebrow">Quản trị hệ thống</span>
          <h1>Tổng quan DocShare</h1>
          <p>Theo dõi KPI, an toàn tài khoản, kiểm duyệt và hoạt động toàn hệ thống.</p>
        </div>
        <Link className="btn ghost" to="/admin/audit-logs"><FiActivity /> Xem nhật ký</Link>
      </div>

      {error && <div className="alert error admin-alert">{error}</div>}

      <div className="stat-grid enterprise-stat-grid">
        {cards.map(([Icon, label, value, to]) => (
          <Link className={loading ? 'stat-card loading' : 'stat-card'} to={to} key={label}>
            <span><Icon /></span>
            <div><small>{label}</small><strong>{loading ? '—' : Number(value || 0).toLocaleString('vi-VN')}</strong></div>
          </Link>
        ))}
      </div>

      <div className="admin-grid-two">
        <section className="panel admin-shortcuts">
          <div className="panel-title-row">
            <div><span className="eyebrow">Công việc</span><h3>Thao tác nhanh</h3></div>
            <FiShield />
          </div>
          <div className="shortcut-grid">
            <Link to="/admin/approval"><strong>Duyệt tài liệu</strong><span>{stats.pendingDocuments || 0} tài liệu đang chờ</span></Link>
            <Link to="/admin/users"><strong>Tài khoản</strong><span>{stats.lockedUsers || 0} tài khoản đang bị khóa</span></Link>
            <Link to="/admin/categories"><strong>Danh mục</strong><span>Tổ chức kho học liệu rõ ràng</span></Link>
            <Link to="/admin/documents"><strong>Toàn bộ tài liệu</strong><span>{stats.approvedDocuments || 0} đã duyệt · {stats.rejectedDocuments || 0} bị từ chối</span></Link>
            <Link to="/admin/audit-logs"><strong>Nhật ký hệ thống</strong><span>Truy vết thao tác quản trị và học liệu</span></Link>
          </div>
        </section>

        <section className="panel admin-note-card">
          <span className="eyebrow">Ưu tiên hôm nay</span>
          <h3>{stats.pendingDocuments ? `${stats.pendingDocuments} tài liệu cần kiểm duyệt` : 'Không còn tài liệu chờ duyệt'}</h3>
          <p>{stats.pendingDocuments ? 'Kiểm tra tiêu đề, mô tả, danh mục và tính phù hợp. Nếu từ chối, hệ thống bắt buộc ghi lý do để người đăng chỉnh sửa.' : 'Hàng đợi kiểm duyệt đã sạch. Bạn có thể kiểm tra tài khoản bị khóa hoặc audit log.'}</p>
          <Link className="btn primary small" to={stats.pendingDocuments ? '/admin/approval' : '/admin/audit-logs'}>{stats.pendingDocuments ? 'Mở hàng đợi duyệt' : 'Mở nhật ký hệ thống'}</Link>
        </section>
      </div>
    </main>
  );
}
