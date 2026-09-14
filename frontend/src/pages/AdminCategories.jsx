import { useEffect, useState } from 'react';
import { FiEdit3, FiFolder, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import AdminNav from '../components/AdminNav';
import { createCategory, deleteCategory, getCategories, updateCategory } from '../services/categoryService';

const emptyForm = { name: '', description: '' };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    try {
      setError('');
      setCategories(await getCategories());
    } catch {
      setError('Không thể tải danh mục.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const payload = { name: form.name.trim(), description: form.description.trim() };
      const result = editingId
        ? await updateCategory(editingId, payload)
        : await createCategory(payload);
      setNotice(result.message || (editingId ? 'Đã cập nhật danh mục.' : 'Đã thêm danh mục.'));
      resetForm();
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể lưu danh mục.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setForm({ name: category.name || '', description: category.description || '' });
    setError('');
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (category) => {
    if (!window.confirm(`Xóa danh mục "${category.name}"?`)) return;
    setError('');
    setNotice('');
    try {
      const result = await deleteCategory(category.id);
      setCategories((items) => items.filter((item) => item.id !== category.id));
      setNotice(result.message || 'Đã xóa danh mục.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể xóa danh mục.');
    }
  };

  return (
    <main className="section shell admin-page">
      <AdminNav />
      <div className="admin-head">
        <div>
          <span className="eyebrow">Cấu trúc học liệu</span>
          <h1>Danh mục</h1>
          <p>Tổ chức thư viện theo các chủ đề rõ ràng để người học tìm tài liệu nhanh hơn.</p>
        </div>
        <div className="queue-pill"><FiFolder /> {categories.length} danh mục</div>
      </div>

      {error && <div className="alert error admin-alert">{error}</div>}
      {notice && <div className="alert success admin-alert">{notice}</div>}

      <form className="panel category-admin-form" onSubmit={submit}>
        <div className="category-form-heading">
          <span className="category-icon">{editingId ? <FiEdit3 /> : <FiPlus />}</span>
          <div><h3>{editingId ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}</h3><p>Tên ngắn gọn, mô tả rõ phạm vi nội dung.</p></div>
        </div>
        <div className="field-grid two">
          <label>Tên danh mục<input className="input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} minLength={2} maxLength={100} placeholder="Ví dụ: Công nghệ thông tin" required /></label>
          <label>Mô tả<input className="input" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} maxLength={500} placeholder="Mô tả ngắn về nhóm học liệu..." /></label>
        </div>
        <div className="category-form-actions">
          <button className="btn primary" disabled={saving} type="submit">{editingId ? <FiEdit3 /> : <FiPlus />} {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm danh mục'}</button>
          {editingId && <button className="btn ghost" type="button" onClick={resetForm}><FiX /> Hủy chỉnh sửa</button>}
        </div>
      </form>

      {loading ? (
        <div className="state-card">Đang tải danh mục...</div>
      ) : (
        <div className="panel table-wrap admin-table-space">
          <table>
            <thead><tr><th>Danh mục</th><th>Mô tả</th><th>Tài liệu</th><th>Thao tác</th></tr></thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td><strong>{category.name}</strong><div className="cell-sub">ID #{category.id}</div></td>
                  <td className="category-description-cell">{category.description || 'Chưa có mô tả'}</td>
                  <td>{Number(category.document_count || 0)}</td>
                  <td><div className="row-actions"><button type="button" onClick={() => startEdit(category)}><FiEdit3 /> Sửa</button><button className="reject" type="button" onClick={() => remove(category)}><FiTrash2 /> Xóa</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!categories.length && <div className="empty-inline">Chưa có danh mục nào.</div>}
        </div>
      )}
    </main>
  );
}
