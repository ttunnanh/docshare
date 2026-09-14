import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AdminDocuments = () => {
    const [docs, setDocs] = useState([]);
    const [search, setSearch] = useState('');

    const fetchDocs = useCallback(async () => {
        try {
            const res = await api.get('/documents/admin/all');
            setDocs(res.data);
        } catch (error) {
            console.error('Lỗi tải danh sách tài liệu', error);
        }
    }, []);
    
    useEffect(() => { 
        const loadData = async () => { await fetchDocs(); };
        loadData();
    }, [fetchDocs]);

    const handleDelete = async (id) => {
        if(!window.confirm('Xác nhận xóa tài liệu này?')) return;
        try {
            await api.delete(`/documents/${id}`);
            fetchDocs();
        } catch (error) {
            console.error('Lỗi xóa tài liệu', error);
        }
    };

    const filteredDocs = docs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 24px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>Quản lý Tài liệu</h2>
            <input type="text" placeholder="Tìm tài liệu..." value={search} onChange={e => setSearch(e.target.value)}
                   style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '24px', width: '300px' }} />
            
            <div className="apple-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table>
                    <thead><tr><th>ID</th><th>Tiêu đề</th><th>Định dạng</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
                    <tbody>
                        {filteredDocs.map(d => (
                            <tr key={d.id}>
                                <td>{d.id}</td><td>{d.title}</td><td>{d.file_format || 'PDF'}</td>
                                <td><span style={{ color: d.status === 'approved' ? '#34C759' : '#FF9500', fontWeight: '600' }}>{d.status}</span></td>
                                <td><button onClick={() => handleDelete(d.id)} className="btn-apple" style={{ background: '#FFEBEB', color: '#FF3B30' }}>Xóa</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default AdminDocuments;