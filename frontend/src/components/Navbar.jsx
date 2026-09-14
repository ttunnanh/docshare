import { Link, useNavigate, useLocation } from 'react-router-dom';

// 1. Đưa NavItem ra ngoài Navbar để tránh lỗi re-render
const NavItem = ({ to, children }) => {
    // Gọi useLocation ở đây để NavItem tự kiểm tra trạng thái active
    const location = useLocation();
    const isActive = location.pathname === to;
    
    return (
        <Link to={to} style={{
            textDecoration: 'none',
            color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: isActive ? '600' : '400',
            transition: 'color 0.2s',
            padding: '5px 10px',
            borderRadius: '8px',
            backgroundColor: isActive ? 'rgba(0,0,0,0.04)' : 'transparent'
        }}>
            {children}
        </Link>
    );
};

const Navbar = () => {
    const navigate = useNavigate();
    
    let user = null;
    try {
        const userData = localStorage.getItem('user');
        if (userData) user = JSON.parse(userData);
    } catch (err) {
        // 2. Fix lỗi Empty block & defined but never used
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
        <nav className="glass" style={{
            position: 'sticky', top: 0, zIndex: 1000,
            borderBottom: '1px solid var(--border)',
            height: '56px', display: 'flex', alignItems: 'center'
        }}>
            <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-main)', fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                    DocShare<span style={{color: 'var(--accent)'}}>.</span>
                </Link>
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <NavItem to="/">Khám phá</NavItem>
                    {token ? (
                        <>
                            <NavItem to="/upload">Tải lên</NavItem>
                            <NavItem to="/profile">Hồ sơ</NavItem>
                            
                            {isAdmin && (
                                <div style={{ display: 'flex', gap: '8px', borderLeft: '1px solid var(--border)', paddingLeft: '16px', marginLeft: '8px' }}>
                                    <NavItem to="/admin/dashboard">Dashboard</NavItem>
                                    <NavItem to="/admin/approval">Duyệt bài</NavItem>
                                    <NavItem to="/admin/documents">Tài liệu</NavItem>
                                </div>
                            )}
                            <button onClick={handleLogout} className="btn-modern" style={{ background: 'transparent', color: 'var(--danger)', padding: '5px 10px', fontSize: '13px', marginLeft: '10px' }}>
                                Đăng xuất
                            </button>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '12px', marginLeft: '10px' }}>
                            <Link to="/login" className="btn-modern btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>Đăng nhập</Link>
                            <Link to="/register" className="btn-modern btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>Đăng ký</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;