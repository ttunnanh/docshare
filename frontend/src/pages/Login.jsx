import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiBookOpen, FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const locked = params.get('reason') === 'locked';

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      window.dispatchEvent(new Event('auth-changed'));

      const fromQuery = params.get('from');
      const requestedPath = location.state?.from || fromQuery;
      navigate(requestedPath || (response.data.user.role === 'admin' ? '/admin/dashboard' : '/'), { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-layout">
        <section className="auth-showcase">
          <Link className="auth-brand" to="/"><span><FiBookOpen /></span> DocShare</Link>
          <div>
            <span className="eyebrow light">Nền tảng học liệu số</span>
            <h1>Học tập tốt hơn khi tri thức được chia sẻ.</h1>
            <p>Truy cập học liệu đã kiểm duyệt, lưu tài liệu yêu thích và đóng góp kiến thức cho cộng đồng.</p>
          </div>
          <div className="auth-trust">Học liệu được kiểm duyệt · Tải xuống an toàn · Quản lý cá nhân</div>
        </section>

        <section className="auth-card">
          <div className="auth-copy">
            <span className="eyebrow">Đăng nhập</span>
            <h2>Chào mừng trở lại</h2>
            <p>Tiếp tục hành trình học tập cùng DocShare.</p>
          </div>

          {locked && !error && (
            <div className="alert error">Phiên đăng nhập đã kết thúc vì tài khoản này đang bị khóa. Vui lòng liên hệ quản trị viên nếu cần hỗ trợ.</div>
          )}
          {error && <div className="alert error">{error}</div>}

          <form className="form-stack" onSubmit={submit}>
            <label>
              Email
              <div className="input-with-icon">
                <FiMail />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </label>

            <label>
              Mật khẩu
              <div className="input-with-icon password-field">
                <FiLock />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  required
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Hiện hoặc ẩn mật khẩu">
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </label>

            <button disabled={busy} className="btn primary wide auth-submit" type="submit">
              {busy ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="auth-foot">Chưa có tài khoản? <Link to="/register">Tạo tài khoản miễn phí</Link></p>
          <Link className="auth-back" to="/">← Quay lại thư viện</Link>
        </section>
      </div>
    </main>
  );
}
