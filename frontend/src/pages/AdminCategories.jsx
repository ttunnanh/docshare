import { useState, useEffect, useCallback } from 'react';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [editId, setEditId] = useState(null);

    const fetchCategories = useCallback(async () => {
        try {
            const data = await getAllCategories();
            setCategories(data);
        } catch (error) {
            console.error('Lỗi tải danh mục:', error);
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            await fetchCategories();
        };
        loadData();
    }, [fetchCategories]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await updateCategory(editId, name);
            } else {
                await createCategory(name);
            }
            setName('');
            setEditId(null);
            fetchCategories();
        } catch (error) {
            console.error('Lỗi lưu danh mục:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
        try {
            await deleteCategory(id);
            fetchCategories();
        } catch (error) {
            console.error('Lỗi xóa danh mục:', error);
            alert('Không thể xóa danh mục đang chứa tài liệu');
        }
    };

    return (
        <div className="fade-in-up" style={{ maxWidth: '800px', margin: '60px auto', padding: '0 24px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '24px' }}>Quản lý Danh mục</h2>
            
            <div className="card-modern" style={{ marginBottom: '30px', padding: '24px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <input 
                        type="text" 
                        className="input-modern"
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Tên danh mục mới..." 
                        required 
                        style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn-modern btn-primary">
                        {editId ? 'Cập nhật' : 'Thêm mới'}
                    </button>
                    {editId && (
                        <button type="button" onClick={() => { setEditId(null); setName(''); }} className="btn-modern btn-secondary">
                            Hủy
                        </button>
                    )}
                </form>
            </div>

            <div className="card-modern" style={{ padding: '0', overflowX: 'auto' }}>
                <table className="table-modern">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên danh mục</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.id}>
                                <td>{cat.id}</td>
                                <td style={{ fontWeight: '500' }}>{cat.name}</td>
                                <td style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => { setEditId(cat.id); setName(cat.name); }} className="btn-modern btn-secondary" style={{ padding: '6px 16px', fontSize: '13px', color: 'var(--accent)' }}>
                                        Sửa
                                    </button>
                                    <button onClick={() => handleDelete(cat.id)} className="btn-modern btn-secondary" style={{ padding: '6px 16px', fontSize: '13px', color: 'var(--danger)' }}>
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCategories;