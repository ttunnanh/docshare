import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';

const Register = () => {
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await register(fullname, email, password);
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại');
            setIsLoading(false);
        }
    };

    return (
        <div className="fade-in-up" style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="card-modern" style={{ width: '100%', maxWidth: '400px', padding: '40px', textAlign: 'center' }}>
                <h2 className="text-gradient" style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Tạo tài khoản mới</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '30px' }}>Tham gia cộng đồng chia sẻ tài liệu</p>
                
                {error && (
                    <div style={{ padding: '12px', background: 'rgba(255, 59, 48, 0.1)', color: 'var(--danger)', borderRadius: '12px', fontSize: '14px', marginBottom: '20px', fontWeight: '500' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>Họ và tên</label>
                        <input 
                            type="text" 
                            className="input-modern"
                            placeholder="Nguyễn Văn A"
                            value={fullname} 
                            onChange={(e) => setFullname(e.target.value)} 
                            required 
                        />
                    </div>
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
                            placeholder="Ít nhất 6 ký tự"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="btn-modern btn-primary" disabled={isLoading} style={{ marginTop: '10px', padding: '14px' }}>
                        {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                    </button>
                </form>
                
                <p style={{ marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
                    Đã có tài khoản? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;