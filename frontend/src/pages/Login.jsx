import { useState } from 'react';
import { Link } from 'react-router-dom';
import { login } from '../services/authService';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = await login(email, password);
            localStorage.setItem('token', data.token); 
            localStorage.setItem('user', JSON.stringify(data.user)); 
            window.location.href = '/'; 
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại');
            setIsLoading(false);
        }
    };

    return (
        <div className="fade-in-up" style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="card-modern" style={{ width: '100%', maxWidth: '400px', padding: '40px', textAlign: 'center' }}>
                <h2 className="text-gradient" style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Chào mừng trở lại</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '30px' }}>Đăng nhập để tiếp tục với DocShare</p>
                
                {error && (
                    <div style={{ padding: '12px', background: 'rgba(255, 59, 48, 0.1)', color: 'var(--danger)', borderRadius: '12px', fontSize: '14px', marginBottom: '20px', fontWeight: '500' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>Email</label>
                        <input 
                            type="email" 
                            className="input-modern"
                            placeholder="name@example.com"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>Mật khẩu</label>
                        <input 
                            type="password" 
                            className="input-modern"
                            placeholder="••••••••"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="btn-modern btn-primary" disabled={isLoading} style={{ marginTop: '10px', padding: '14px' }}>
                        {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>
                </form>
                
                <p style={{ marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
                    Chưa có tài khoản? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>Đăng ký ngay</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;