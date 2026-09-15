import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBookOpen, FiCheck, FiEye, FiEyeOff, FiLock, FiMail, FiUser } from 'react-icons/fi';
import api from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ fullname: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const passwordScore = useMemo(() => {
    let score = 0;
    if (form.password.length >= 6) score += 1;
    if (form.password.length >= 10) score += 1;
    if (/[A-Z]/.test(form.password) && /[a-z]/.test(form.password)) score += 1;
    if (/\d/.test(form.password) || /[^A-Za-z0-9]/.test(form.password)) score += 1;
    return score;
  }, [form.password]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Mật khẩu xác nhận chưa khớp.');

    setBusy(true);
    try {
      await api.post('/auth/register', {
        fullname: form.fullname.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate('/login', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể tạo tài khoản. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-layout">
        <section className="auth-showcase register-showcase">
          <Link className="auth-brand" to="/"><span><FiBookOpen /></span> DocShare</Link>
          <div>
            <span className="eyebrow light">Gia nhập cộng đồng</span>
            <h1>Biến tài liệu của bạn thành giá trị cho nhiều người.</h1>
            <p>Tạo tài khoản để lưu học liệu, theo dõi lịch sử tải và đóng góp tài liệu cho thư viện chung.</p>
          </div>
          <div className="auth-benefits">
            <span><FiCheck /> Tài khoản miễn phí</span>
            <span><FiCheck /> Phân quyền an toàn</span>
            <span><FiCheck /> Học liệu được kiểm duyệt</span>
          </div>
        </section>

        <section className="auth-card register-card">
          <div className="auth-copy">
            <span className="eyebrow">Tạo tài khoản</span>
            <h2>Bắt đầu với DocShare</h2>
            <p>Chỉ mất chưa tới một phút.</p>
          </div>

          {error && <div className="alert error">{error}</div>}

          <form className="form-stack" onSubmit={submit}>
            <label>
              Họ và tên
              <div className="input-with-icon">
                <FiUser />
                <input
                  value={form.fullname}
                  onChange={(event) => setForm({ ...form, fullname: event.target.value })}
                  autoComplete="name"
                  placeholder="Nguyễn Văn A"
                  minLength={2}
                  required
                />
              </div>
            </label>

            <label>
              Email
              <div className="input-with-icon">
                <FiMail />
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
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
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  autoComplete="new-password"
                  placeholder="Tối thiểu 6 ký tự"
                  minLength={6}
                  required
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Hiện hoặc ẩn mật khẩu">
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <div className="password-meter" aria-label="Độ mạnh mật khẩu">
                {[1, 2, 3, 4].map((level) => <span key={level} className={passwordScore >= level ? 'active' : ''} />)}
              </div>
            </label>

            <label>
              Xác nhận mật khẩu
              <div className="input-with-icon">
                <FiLock />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                  autoComplete="new-password"
                  placeholder="Nhập lại mật khẩu"
                  minLength={6}
                  required
                />
              </div>
            </label>

            <button disabled={busy} className="btn primary wide auth-submit" type="submit">
              {busy ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </button>
          </form>

          <p className="auth-foot">Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link></p>
          <p className="auth-legal">Tài khoản mới mặc định là sinh viên. Quyền giảng viên/admin chỉ do quản trị viên cấp.</p>
        </section>
      </div>
    </main>
  );
}
