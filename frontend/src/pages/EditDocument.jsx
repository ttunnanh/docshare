import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { getDocument, updateDocument } from '../services/documentService';
import { getCategories } from '../services/categoryService';

export default function EditDocument() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category_id: '' });
  const [categories, setCategories] = useState([]);
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  let user = null;
  try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch { user = null; }

  useEffect(() => {
    let active = true;
    Promise.all([getDocument(id), getCategories()])
      .then(([documentData, categoryData]) => {
        if (!active) return;
        setDocument(documentData);
        setForm({
          title: documentData.title || '',
          description: documentData.description || '',
          category_id: documentData.category_id || '',
        });
        setCategories(categoryData);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Không thể mở tài liệu để chỉnh sửa.');
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const result = await updateDocument(id, {
        title: form.title.trim(),
        description: form.description.trim(),
        category_id: form.category_id || null,
      });
      alert(result.message || 'Đã cập nhật tài liệu.');
      navigate(user?.role === 'admin' ? '/admin/documents' : '/profile');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể cập nhật tài liệu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="section shell narrow"><div className="state-card">Đang tải tài liệu...</div></main>;
  if (!document) return <main className="section shell narrow"><div className="state-card error"><h3>Không thể chỉnh sửa</h3><p>{error}</p><Link className="btn ghost small" to="/"><FiArrowLeft /> Quay lại</Link></div></main>;

  return (
    <main className="section shell narrow">
      <Link className="back-link" to={`/documents/${id}`}><FiArrowLeft /> Xem chi tiết tài liệu</Link>
      <div className="page-title left">
        <span className="eyebrow">Quản lý học liệu</span>
        <h1>Chỉnh sửa tài liệu</h1>
        <p>Cập nhật metadata để tài liệu dễ tìm kiếm và dễ hiểu hơn.</p>
      </div>

      <div className="panel">
        {error && <div className="alert error">{error}</div>}
        {user?.role !== 'admin' && (
          <div className="edit-review-note">Sau khi bạn lưu thay đổi, tài liệu sẽ chuyển về trạng thái <strong>chờ duyệt</strong> để đảm bảo chất lượng nội dung.</div>
        )}

        <form onSubmit={submit} className="form-stack edit-form">
          <label>Tiêu đề<input className="input" value={form.title} minLength={3} maxLength={180} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label>
          <label>Mô tả<textarea className="input textarea" value={form.description} maxLength={5000} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          <label>Danh mục<select className="input" value={form.category_id} onChange={(event) => setForm({ ...form, category_id: event.target.value })}><option value="">Chưa phân loại</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <div className="edit-meta-row"><span>Định dạng: <strong>{document.file_format || 'FILE'}</strong></span><span>Trạng thái: <span className={`badge ${document.status}`}>{document.status}</span></span></div>
          <div className="action-row"><button className="btn primary" disabled={saving} type="submit"><FiSave /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button><button type="button" className="btn ghost" onClick={() => navigate(-1)}>Hủy</button></div>
        </form>
      </div>
    </main>
  );
}
