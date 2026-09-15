import { Link } from 'react-router-dom';
import { FiBookOpen, FiGithub, FiMail } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Link className="brand" to="/">
            <span className="brand-mark"><FiBookOpen /></span>
            <span>DocShare</span>
          </Link>
          <p>Nền tảng chia sẻ và quản lý học liệu số dành cho sinh viên, giảng viên và cộng đồng học tập.</p>
        </div>
        <div className="footer-links">
          <strong>Khám phá</strong>
          <Link to="/">Tài liệu</Link>
          <Link to="/categories">Danh mục</Link>
          <Link to="/upload">Đóng góp học liệu</Link>
        </div>
        <div className="footer-links">
          <strong>DocShare</strong>
          <a href="mailto:docshare@example.com"><FiMail /> Liên hệ</a>
          <a href="https://github.com/ttunnanh/docshare" target="_blank" rel="noreferrer"><FiGithub /> GitHub</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} DocShare. Học liệu tốt hơn, học tập hiệu quả hơn.</span>
      </div>
    </footer>
  );
}
