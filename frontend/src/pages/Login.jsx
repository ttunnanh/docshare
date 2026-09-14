import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            window.dispatchEvent(new Event('storage')); 
            navigate('/');
        } catch (err) {
            console.error('Lỗi đăng nhập', err); // FIX: Bỏ lỗi unused vars
            alert('Sai tài khoản hoặc mật khẩu!');
        }
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div className="apple-card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '40px 32px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.5px' }}>Chào mừng trở lại</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '32px' }}>Đăng nhập để tiếp tục với DocShare</p>
                
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input type="email" placeholder="Email của bạn" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#FAFAFA', fontSize: '15px', outline: 'none' }} />
                    <input type="password" placeholder="Mật khẩu" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#FAFAFA', fontSize: '15px', outline: 'none' }} />
                    <button type="submit" className="btn-apple btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px', justifyContent: 'center', marginTop: '8px' }}>Đăng nhập</button>
                </form>
                <p style={{ marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
                    Chưa có tài khoản? <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>Đăng ký ngay</Link>
                </p>
            </div>
        </div>
    );
};
export default Login;