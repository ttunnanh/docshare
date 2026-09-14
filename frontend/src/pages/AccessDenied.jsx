import { Link } from 'react-router-dom';
import { FaUserShield, FaHome } from 'react-icons/fa';

const AccessDenied = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 56px)', padding: '20px' }}>
            <FaUserShield size={80} color="#FF3B30" style={{ marginBottom: '20px' }} />
            <h1 style={{ fontSize: '32px', color: 'var(--text-main, #1e293b)', marginBottom: '12px', fontWeight: '700', letterSpacing: '-0.5px', textAlign: 'center' }}>
                Truy cập bị từ chối!
            </h1>
            <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '16px', marginBottom: '24px', textAlign: 'center', maxWidth: '400px' }}>
                Xin lỗi, bạn không có quyền Quản trị viên (Admin) để truy cập vào khu vực này.
            </p>
            <Link to="/" className="btn-apple btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '12px 24px', borderRadius: '999px', fontWeight: '600' }}>
                <FaHome size={16} /> Quay lại Trang chủ
            </Link>
        </div>
    );
};

export default AccessDenied;