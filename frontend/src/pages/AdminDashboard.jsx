import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiClock, FiDownload, FiFolder, FiShield, FiUsers } from 'react-icons/fi';
import AdminNav from '../components/AdminNav';
import { getDashboardStats } from '../services/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalDocuments: 0, pendingDocuments: 0, totalDownloads: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => setError('Không thể tải dữ liệu dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    [FiUsers, 'Người dùng', stats.totalUsers, '/admin/users'],
    [FiBook, 'Tài liệu', stats.totalDocuments, '/admin/documents'],
    [FiClock, 'Chờ duyệt', stats.pendingDocuments, '/admin/approval'],
    [FiDownload, 'Lượt tải', stats.totalDownloads, '/admin/documents'],
  ];

  return (
    <main className="section shell admin-page">
      <AdminNav />

      <div className="admin-head">
        <div>
          <span className="eyebrow">Quản trị hệ thống</span>
          <h1>Tổng quan DocShare</h1>
          <p>Theo dõi hoạt động và xử lý các công việc quản trị quan trọng.</p>
        </div>
        <Link className="btn ghost" to="/admin/categories"><FiFolder /> Quản lý danh mục</Link>
      </div>

      {error && <div className="alert error admin-alert">{error}</div>}

      <div className="stat-grid">
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
            <Link to="/admin/users"><strong>Phân quyền</strong><span>Quản lý sinh viên, giảng viên, admin</span></Link>
            <Link to="/admin/categories"><strong>Danh mục</strong><span>Tổ chức kho học liệu rõ ràng</span></Link>
            <Link to="/admin/documents"><strong>Toàn bộ tài liệu</strong><span>Kiểm tra trạng thái và nội dung</span></Link>
          </div>
        </section>

        <section className="panel admin-note-card">
          <span className="eyebrow">Ưu tiên hôm nay</span>
          <h3>{stats.pendingDocuments ? `${stats.pendingDocuments} tài liệu cần kiểm duyệt` : 'Không còn tài liệu chờ duyệt'}</h3>
          <p>{stats.pendingDocuments ? 'Kiểm tra tiêu đề, mô tả, danh mục và tính phù hợp trước khi phê duyệt.' : 'Hàng đợi kiểm duyệt đã sạch. Bạn có thể kiểm tra người dùng hoặc danh mục.'}</p>
          <Link className="btn primary small" to="/admin/approval">Mở hàng đợi duyệt</Link>
        </section>
      </div>
    </main>
  );
}
