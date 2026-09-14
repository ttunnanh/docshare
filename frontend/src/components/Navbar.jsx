import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaChevronDown, FaUser, FaSignOutAlt, FaCog } from 'react-icons/fa';

const NavItem = ({ to, children }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <Link to={to} style={{
            textDecoration: 'none', color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
            fontSize: '14px', fontWeight: isActive ? '600' : '400', padding: '8px 12px', transition: 'color 0.2s'
        }}>
            {children}
        </Link>
    );
};

// Hàm lấy dữ liệu auth (Tách ra ngoài component)
const getAuthData = () => {
    let user = null;
    try {
        const userData = localStorage.getItem('user');
        if (userData) user = JSON.parse(userData);
    } catch (err) {
        console.error('Lỗi khi đọc dữ liệu user:', err);
    }
    const token = localStorage.getItem('token');
    return { user, token };
};

const Navbar = () => {
    const navigate = useNavigate();
    const [showAdmin, setShowAdmin] = useState(false);
    const [showUser, setShowUser] = useState(false);
    
    // 1. Dùng Lazy Initialization: Khởi tạo state ngay từ đầu để tránh việc gọi setState trong useEffect
    const [auth, setAuth] = useState(getAuthData);

    // 2. useEffect giờ đây CHỈ làm đúng nhiệm vụ đăng ký lắng nghe event
    useEffect(() => {
        const handleStorageChange = () => {
            setAuth(getAuthData());
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const { user, token } = auth;
    const isAdmin = user?.role?.toLowerCase() === 'admin';

    const handleLogout = () => {
        localStorage.clear();
        setAuth({ user: null, token: null }); // Cập nhật lại UI ngay lập tức
        setShowUser(false);
        navigate('/login');
    };

    return (
        <nav className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 1000, height: '56px', display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
                
                <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-main)', fontSize: '18px', fontWeight: '700', letterSpacing: '-0.5px' }}>
                    DocShare.
                </Link>
                
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
                    <NavItem to="/">Khám phá</NavItem>
                    <NavItem to="/categories">Danh mục</NavItem>
                    {token && <NavItem to="/saved">Đã lưu</NavItem>}
                    
                    {isAdmin && (
                        <div style={{ position: 'relative' }} onMouseEnter={() => setShowAdmin(true)} onMouseLeave={() => setShowAdmin(false)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px 12px' }}>
                                Quản trị <FaChevronDown size={10} />
                            </div>
                            {showAdmin && (
                                <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', paddingTop: '8px', zIndex: 1001 }}>
                                    <div className="apple-card" style={{ padding: '8px', minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <Link to="/admin/dashboard" style={{ textDecoration: 'none', color: 'var(--text-main)', fontSize: '14px', padding: '10px 12px', borderRadius: '8px' }} className="dropdown-item">Dashboard</Link>
                                        <Link to="/admin/documents" style={{ textDecoration: 'none', color: 'var(--text-main)', fontSize: '14px', padding: '10px 12px', borderRadius: '8px' }} className="dropdown-item">Tài liệu</Link>
                                        <Link to="/admin/users" style={{ textDecoration: 'none', color: 'var(--text-main)', fontSize: '14px', padding: '10px 12px', borderRadius: '8px' }} className="dropdown-item">Tài khoản</Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {token ? (
                        <div style={{ position: 'relative' }} onMouseEnter={() => setShowUser(true)} onMouseLeave={() => setShowUser(false)}>
                            <div className="btn-apple btn-secondary" style={{ padding: '6px 14px' }}>
                                <FaUser size={12} /> {user?.fullname?.split(' ').pop() || 'User'}
                            </div>
                            {showUser && (
                                <div style={{ position: 'absolute', top: '100%', right: '0', paddingTop: '8px', zIndex: 1001 }}>
                                    <div className="apple-card" style={{ padding: '8px', minWidth: '160px' }}>
                                        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text-main)', fontSize: '14px', padding: '10px', borderRadius: '8px' }} className="dropdown-item"><FaCog size={14}/> Cài đặt</Link>
                                        <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FF3B30', fontSize: '14px', padding: '10px', cursor: 'pointer', borderTop: '1px solid var(--border)', marginTop: '4px' }} className="dropdown-item"><FaSignOutAlt size={14}/> Đăng xuất</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" style={{ textDecoration: 'none', color: 'var(--text-main)', fontSize: '14px', fontWeight: '500', padding: '8px 12px' }}>Đăng nhập</Link>
                            <Link to="/register" className="btn-apple btn-primary">Đăng ký</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;