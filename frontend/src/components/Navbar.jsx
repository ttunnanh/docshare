import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  FiBookOpen,
  FiBookmark,
  FiFolder,
  FiGrid,
  FiLogIn,
  FiLogOut,
  FiMenu,
  FiUploadCloud,
  FiUser,
  FiX,
} from 'react-icons/fi';

const readAuth = () => {
  try {
    return {
      token: localStorage.getItem('token'),
      user: JSON.parse(localStorage.getItem('user') || 'null'),
    };
  } catch {
    return { token: null, user: null };
  }
};

const navClass = ({ isActive }) => (isActive ? 'active' : undefined);

export default function Navbar() {
  const [auth, setAuth] = useState(readAuth);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const sync = () => setAuth(readAuth());
    window.addEventListener('storage', sync);
    window.addEventListener('auth-changed', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('auth-changed', sync);
    };
  }, []);

  useEffect(() => setOpen(false), [location.pathname, location.search]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-changed'));
    navigate('/login');
  };

  const firstName = auth.user?.fullname?.trim().split(/\s+/).slice(-1)[0] || 'Tài khoản';

  return (
    <header className="topbar">
      <div className="nav-shell">
        <Link className="brand" to="/" aria-label="DocShare - Trang chủ">
          <span className="brand-mark"><FiBookOpen /></span>
          <span>DocShare</span>
        </Link>

        <button
          className="menu-btn"
          type="button"
          aria-label={open ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <FiX /> : <FiMenu />}
        </button>

        <nav className={open ? 'nav-links open' : 'nav-links'}>
          <NavLink to="/" className={navClass} end><FiGrid /> Khám phá</NavLink>
          <NavLink to="/categories" className={navClass}><FiFolder /> Danh mục</NavLink>
          {auth.token && <NavLink to="/saved" className={navClass}><FiBookmark /> Đã lưu</NavLink>}
          {auth.token && <NavLink to="/upload" className={navClass}><FiUploadCloud /> Đăng tài liệu</NavLink>}
          {auth.user?.role === 'admin' && (
            <NavLink to="/admin/dashboard" className={navClass}>Quản trị</NavLink>
          )}

          <div className="mobile-account-actions">
            {auth.token ? (
              <>
                <Link className="mobile-account-link" to="/profile"><FiUser /> {firstName}</Link>
                <button type="button" className="mobile-account-link danger" onClick={logout}><FiLogOut /> Đăng xuất</button>
              </>
            ) : (
              <>
                <Link className="mobile-account-link" to="/login"><FiLogIn /> Đăng nhập</Link>
                <Link className="btn primary wide" to="/register">Tạo tài khoản</Link>
              </>
            )}
          </div>
        </nav>

        <div className="nav-actions">
          {auth.token ? (
            <>
              <Link className="user-pill" to="/profile" title="Hồ sơ cá nhân">
                <span className="mini-avatar">{auth.user?.fullname?.[0]?.toUpperCase() || 'U'}</span>
                <span>{firstName}</span>
              </Link>
              <button className="icon-btn" type="button" title="Đăng xuất" onClick={logout}><FiLogOut /></button>
            </>
          ) : (
            <>
              <Link className="text-link" to="/login">Đăng nhập</Link>
              <Link className="btn primary small" to="/register">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
