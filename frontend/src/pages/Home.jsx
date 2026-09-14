import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiDownloadCloud,
  FiFolder,
  FiSearch,
  FiUsers,
} from 'react-icons/fi';
import DocumentCard from '../components/DocumentCard';
import {
  downloadDocument,
  getDocuments,
  getPublicStats,
  getSaved,
  toggleSave,
} from '../services/documentService';
import { getCategories } from '../services/categoryService';

const emptyStats = { totalDocuments: 0, totalDownloads: 0, totalContributors: 0, totalCategories: 0 };

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category_id') || '';
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const token = localStorage.getItem('token');

  const [query, setQuery] = useState(keyword);
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [saved, setSaved] = useState(new Set());
  const [stats, setStats] = useState(emptyStats);
  const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => setQuery(keyword), [keyword]);

  useEffect(() => {
    Promise.all([
      getCategories().catch(() => []),
      getPublicStats().catch(() => emptyStats),
    ]).then(([categoryData, statData]) => {
      setCategories(categoryData);
      setStats(statData);
    });
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    Promise.all([
      getDocuments({ keyword, category_id: category, page, limit: 12 }),
      token ? getSaved().catch(() => []) : Promise.resolve([]),
    ])
      .then(([documentData, savedData]) => {
        if (!active) return;
        setDocuments(documentData.documents || []);
        setMeta(documentData);
        setSaved(new Set(savedData.map((item) => item.id)));
      })
      .catch(() => active && setError('Không thể tải danh sách tài liệu. Vui lòng thử lại.'))
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [keyword, category, page, token]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    setParam('keyword', query.trim());
  };

  const requireAuth = () => {
    if (token) return true;
    navigate('/login', { state: { from: `${location.pathname}${location.search}` } });
    return false;
  };

  const handleSave = async (id) => {
    if (!requireAuth()) return;
    try {
      const result = await toggleSave(id);
      setSaved((previous) => {
        const next = new Set(previous);
        if (result.saved) next.add(id); else next.delete(id);
        return next;
      });
    } catch (requestError) {
      alert(requestError.response?.data?.message || 'Không thể lưu tài liệu.');
    }
  };

  const handleDownload = async (id) => {
    if (!requireAuth()) return;
    try {
      const result = await downloadDocument(id);
      window.open(result.downloadUrl, '_blank', 'noopener,noreferrer');
      setDocuments((items) => items.map((item) => (
        item.id === id ? { ...item, downloads: Number(item.downloads || 0) + 1 } : item
      )));
    } catch (requestError) {
      alert(requestError.response?.data?.message || 'Không thể tải tài liệu.');
    }
  };

  const heroText = useMemo(() => {
    if (stats.totalDocuments) {
      return `Khám phá ${stats.totalDocuments.toLocaleString('vi-VN')} học liệu đã được kiểm duyệt và chia sẻ bởi cộng đồng DocShare.`;
    }
    return 'Kho học liệu số được kiểm duyệt dành cho sinh viên, giảng viên và cộng đồng học tập.';
  }, [stats.totalDocuments]);

  const statItems = [
    [FiBookOpen, stats.totalDocuments, 'Tài liệu'],
    [FiDownloadCloud, stats.totalDownloads, 'Lượt tải'],
    [FiUsers, stats.totalContributors, 'Người đóng góp'],
    [FiFolder, stats.totalCategories, 'Danh mục'],
  ];

  return (
    <main>
      <section className="hero-section">
        <div className="shell hero-inner">
          <div className="hero-badge">Nền tảng học liệu số dành cho cộng đồng</div>
          <h1>Học liệu chất lượng.<br /><span>Chia sẻ không giới hạn.</span></h1>
          <p>{heroText}</p>

          <form className="search-panel" onSubmit={submitSearch}>
            <div className="search-box">
              <FiSearch />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm tên, mô tả hoặc nội dung học liệu..."
                aria-label="Tìm kiếm tài liệu"
              />
            </div>
            <select
              value={category}
              onChange={(event) => setParam('category_id', event.target.value)}
              aria-label="Lọc theo danh mục"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <button className="btn primary search-submit" type="submit">Tìm kiếm</button>
          </form>

          <div className="hero-stats">
            {statItems.map(([Icon, value, label]) => (
              <div className="hero-stat" key={label}>
                <span><Icon /></span>
                <div><strong>{Number(value || 0).toLocaleString('vi-VN')}</strong><small>{label}</small></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Thư viện học liệu</span>
            <h2>{keyword || category ? 'Kết quả tìm kiếm' : 'Tài liệu mới nhất'}</h2>
            <p className="section-subtitle">
              {meta.totalItems
                ? `${Number(meta.totalItems).toLocaleString('vi-VN')} tài liệu phù hợp với lựa chọn của bạn.`
                : 'Khám phá tài liệu đã được quản trị viên kiểm duyệt.'}
            </p>
          </div>
          {(keyword || category) && (
            <Link className="btn ghost small" to="/">Xóa bộ lọc</Link>
          )}
        </div>

        {loading ? (
          <div className="doc-grid" aria-label="Đang tải tài liệu">
            {Array.from({ length: 6 }).map((_, index) => <div className="doc-card skeleton-card" key={index} />)}
          </div>
        ) : error ? (
          <div className="state-card error">{error}</div>
        ) : documents.length === 0 ? (
          <div className="state-card empty-state">
            <FiSearch />
            <h3>Chưa tìm thấy tài liệu phù hợp</h3>
            <p>Thử đổi từ khóa hoặc chọn một danh mục khác.</p>
            <Link className="btn primary small" to="/">Xem tất cả tài liệu</Link>
          </div>
        ) : (
          <div className="doc-grid">
            {documents.map((document) => (
              <DocumentCard
                key={document.id}
                doc={document}
                saved={saved.has(document.id)}
                onSave={handleSave}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}

        {!loading && !error && documents.length > 0 && (
          <div className="pagination">
            <button type="button" disabled={page <= 1} onClick={() => setParam('page', String(page - 1))}>
              <FiChevronLeft /> Trang trước
            </button>
            <span>Trang <strong>{meta.currentPage || page}</strong> / {meta.totalPages || 1}</span>
            <button type="button" disabled={page >= Number(meta.totalPages || 1)} onClick={() => setParam('page', String(page + 1))}>
              Trang sau <FiChevronRight />
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
