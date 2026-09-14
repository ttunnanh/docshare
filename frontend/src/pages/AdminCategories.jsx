import { useState, useEffect, useCallback } from 'react';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState('');

    const fetchCategories = useCallback(async () => {
        try {
            const data = await getAllCategories();
            setCategories(data);
        } catch (error) {
            console.error('Lỗi tải danh mục', error);
        }
    }, []);

    useEffect(() => { 
        const loadData = async () => { await fetchCategories(); };
        loadData();
    }, [fetchCategories]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            editId ? await updateCategory(editId, name) : await createCategory(name);
            setName(''); setEditId(null); fetchCategories();
        } catch (error) {
            console.error('Lỗi lưu danh mục', error);
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm('Xóa danh mục này?')) {
            try {
                await deleteCategory(id); 
                fetchCategories();
            } catch (error) {
                console.error('Lỗi xóa', error);
            }
        }
    };

    const filteredCats = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 24px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>Quản lý Danh mục</h2>
            
            <div className="apple-card" style={{ marginBottom: '24px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
                    <input type="text" placeholder="Tên danh mục..." value={name} onChange={e => setName(e.target.value)} required
                           style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                    <button type="submit" className="btn-apple btn-primary">{editId ? 'Cập nhật' : 'Thêm mới'}</button>
                </form>
            </div>

            <input type="text" placeholder="Lọc danh mục..." value={search} onChange={e => setSearch(e.target.value)}
                   style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '16px', width: '300px' }} />

            <div className="apple-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table>
                    <thead><tr><th>ID</th><th>Tên danh mục</th><th>Hành động</th></tr></thead>
                    <tbody>
                        {filteredCats.map(cat => (
                            <tr key={cat.id}>
                                <td>{cat.id}</td><td>{cat.name}</td>
                                <td style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => {setEditId(cat.id); setName(cat.name)}} className="btn-apple btn-secondary">Sửa</button>
                                    <button onClick={() => handleDelete(cat.id)} className="btn-apple" style={{ background: '#FFEBEB', color: '#FF3B30' }}>Xóa</button>
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