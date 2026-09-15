import { NavLink } from 'react-router-dom';
import { FiActivity, FiBookOpen, FiCheckCircle, FiFolder, FiGrid, FiUsers } from 'react-icons/fi';

const items = [
  ['/admin/dashboard', FiGrid, 'Tổng quan'],
  ['/admin/approval', FiCheckCircle, 'Chờ duyệt'],
  ['/admin/documents', FiBookOpen, 'Tài liệu'],
  ['/admin/categories', FiFolder, 'Danh mục'],
  ['/admin/users', FiUsers, 'Người dùng'],
  ['/admin/audit-logs', FiActivity, 'Nhật ký'],
];

export default function AdminNav() {
  return (
    <nav className="admin-nav" aria-label="Điều hướng quản trị">
      {items.map(([to, Icon, label]) => (
        <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : undefined}>
          <Icon /> {label}
        </NavLink>
      ))}
    </nav>
  );
}
