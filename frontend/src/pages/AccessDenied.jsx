import { Link } from 'react-router-dom';
import { FaUserShield, FaHome } from 'react-icons/fa';

const AccessDenied = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', background: '#f8fafc' }}>
            <FaUserShield size={80} color="#ef4444" style={{ marginBottom: '20px' }} />
            <h1 style={{ fontSize: '32px', color: '#1e293b', marginBottom: '12px', fontWeight: '700' }}>Truy cập bị từ chối!</h1>
            <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '24px' }}>Xin lỗi, bạn không có quyền (Admin) để truy cập vào khu vực này.</p>
            <Link to="/" style={{ background: '#0f172a', color: '#fff', textDecoration: 'none', padding: '10px 24px', borderRadius: '999px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaHome /> Quay lại Trang chủ
            </Link>
        </div>
    );
};

export default AccessDenied;