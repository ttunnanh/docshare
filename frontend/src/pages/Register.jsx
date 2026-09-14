import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({ fullname: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', formData);
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (err) {
            console.error('Lỗi đăng ký', err); // FIX
            alert('Lỗi đăng ký. Email có thể đã tồn tại.');
        }
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div className="apple-card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '40px 32px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.5px' }}>Tạo tài khoản mới</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '32px' }}>Tham gia mạng lưới tri thức DocShare</p>
                
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input type="text" placeholder="Họ và tên" required value={formData.fullname} onChange={(e) => setFormData({...formData, fullname: e.target.value})} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#FAFAFA', fontSize: '15px', outline: 'none' }} />
                    <input type="email" placeholder="Email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#FAFAFA', fontSize: '15px', outline: 'none' }} />
                    <input type="password" placeholder="Mật khẩu" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#FAFAFA', fontSize: '15px', outline: 'none' }} />
                    <button type="submit" className="btn-apple btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px', justifyContent: 'center', marginTop: '8px' }}>Đăng ký</button>
                </form>
                <p style={{ marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
                    Đã có tài khoản? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
};
export default Register;