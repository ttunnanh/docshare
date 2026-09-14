import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { FaGraduationCap, FaHome, FaBook, FaLayerGroup, FaHeart, FaCogs, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const NavItem = ({ to, icon: Icon, children }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    
    return (
        <Link to={to} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            textDecoration: 'none',
            color: isActive ? '#0056b3' : '#4a5568',
            fontSize: '14px',
            fontWeight: isActive ? '600' : '500',
            transition: 'color 0.2s',
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: isActive ? '#f0f7ff' : 'transparent'
        }}>
            {Icon && <Icon size={16} />}
            {children}
        </Link>
    );
};

const Navbar = () => {
    const navigate = useNavigate();
    const [showAdminDropdown, setShowAdminDropdown] = useState(false);
    
    let user = null;
    try {
        const userData = localStorage.getItem('user');
        if (userData) user = JSON.parse(userData);
    } catch (err) {
        console.error('Lỗi khi đọc dữ liệu user:', err);
    }

    const token = localStorage.getItem('token');
    const isAdmin = user && user.role && user.role.toString().toLowerCase() === 'admin';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav style={{
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            position: 'sticky', top: 0, zIndex: 1000,
            height: '64px', display: 'flex', alignItems: 'center',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        }}>
            <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                
                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#0056b3', fontSize: '20px', fontWeight: '800' }}>
                    <FaGraduationCap size={28} />
                    Học Liệu Số
                </Link>
                
                {/* Main Menu */}
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <NavItem to="/" icon={FaHome}>Trang chủ</NavItem>
                    <NavItem to="/documents" icon={FaBook}>Học liệu</NavItem>
                    <NavItem to="/categories" icon={FaLayerGroup}>Danh mục</NavItem>
                    
                    {token && (
                        <NavItem to="/saved" icon={FaHeart}>Đã lưu</NavItem>
                    )}

                    {isAdmin && (
                        <div 
                            style={{ position: 'relative', marginLeft: '8px' }}
                            onMouseEnter={() => setShowAdminDropdown(true)}
                            onMouseLeave={() => setShowAdminDropdown(false)}
                        >
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                color: '#0056b3', fontSize: '14px', fontWeight: '600',
                                padding: '8px 12px', cursor: 'pointer'
                            }}>
                                <FaCogs size={16} /> Quản trị hệ thống ▾
                            </div>
                            
                            {/* Dropdown Menu */}
                            {showAdminDropdown && (
                                <div style={{
                                    position: 'absolute', top: '100%', left: '0',
                                    background: '#fff', border: '1px solid #e2e8f0',
                                    borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    minWidth: '200px', padding: '8px 0', zIndex: 1001
                                }}>
                                    <Link to="/admin/users" style={{ display: 'block', padding: '10px 16px', textDecoration: 'none', color: '#4a5568', fontSize: '14px' }}>Quản lý Tài khoản</Link>
                                    <Link to="/admin/documents" style={{ display: 'block', padding: '10px 16px', textDecoration: 'none', color: '#4a5568', fontSize: '14px' }}>Quản lý Tài liệu</Link>
                                    <Link to="/admin/categories" style={{ display: 'block', padding: '10px 16px', textDecoration: 'none', color: '#4a5568', fontSize: '14px' }}>Quản lý Danh mục</Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Actions */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {token ? (
                        <>
                            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: '#4a5568', fontSize: '14px', fontWeight: '500' }}>
                                <FaUserCircle size={18} /> Xin chào, {user.fullname?.split(' ').pop()}!
                            </Link>
                            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid #e2e8f0', color: '#e53e3e', padding: '6px 16px', borderRadius: '999px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
                                <FaSignOutAlt /> Đăng xuất
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/register" style={{ textDecoration: 'none', color: '#4a5568', border: '1px solid #e2e8f0', padding: '6px 20px', borderRadius: '999px', fontSize: '14px', fontWeight: '500' }}>Đăng ký</Link>
                            <Link to="/login" style={{ textDecoration: 'none', color: '#fff', background: '#0f172a', padding: '6px 20px', borderRadius: '999px', fontSize: '14px', fontWeight: '500' }}>Đăng nhập</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;