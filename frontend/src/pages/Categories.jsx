import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiBookOpen, FiFolder } from 'react-icons/fi';
import { getCategories } from '../services/categoryService';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setError('Không thể tải danh mục. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="section shell">
      <div className="page-title category-page-title">
        <span className="eyebrow">Khám phá theo chủ đề</span>
        <h1>Danh mục học liệu</h1>
        <p>Đi thẳng đến lĩnh vực bạn quan tâm và khám phá những tài liệu đã được kiểm duyệt.</p>
      </div>

      {loading ? (
        <div className="category-grid">
          {Array.from({ length: 6 }).map((_, index) => <div className="category-card skeleton-card" key={index} />)}
        </div>
      ) : error ? (
        <div className="state-card error">{error}</div>
      ) : categories.length === 0 ? (
        <div className="state-card empty-state"><FiFolder /><h3>Chưa có danh mục</h3><p>Danh mục sẽ xuất hiện tại đây sau khi quản trị viên tạo mới.</p></div>
      ) : (
        <div className="category-grid">
          {categories.map((category) => (
            <Link key={category.id} to={`/?category_id=${category.id}`} className="category-card">
              <div className="category-card-top">
                <span className="category-icon"><FiFolder /></span>
                <span className="category-count"><FiBookOpen /> {Number(category.document_count || 0)} tài liệu</span>
              </div>
              <h3>{category.name}</h3>
              <p>{category.description || 'Khám phá các học liệu đã được kiểm duyệt trong danh mục này.'}</p>
              <span className="category-link">Khám phá ngay <FiArrowRight /></span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
