import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AdminApproval = () => {
    const [docs, setDocs] = useState([]);

    const fetchPending = useCallback(async () => {
        try {
            const res = await api.get('/documents/pending');
            setDocs(res.data);
        } catch (error) {
            console.error('Lỗi tải dữ liệu', error);
        }
    }, []);

    useEffect(() => { 
        const loadData = async () => { await fetchPending(); };
        loadData();
    }, [fetchPending]);

    const handleAction = async (id, status) => {
        if(!window.confirm(`Xác nhận ${status === 'approved' ? 'duyệt' : 'từ chối'}?`)) return;
        try {
            await api.put(`/documents/${id}/approve`, { status });
            fetchPending();
        } catch (error) {
            console.error('Lỗi cập nhật', error);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 24px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>Duyệt Tài liệu</h2>
            <div className="apple-card" style={{ padding: 0, overflow: 'hidden' }}>
                {docs.length === 0 ? <p style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Không có tài liệu chờ duyệt.</p> : (
                    <table>
                        <thead><tr><th>Tiêu đề</th><th>Người đăng</th><th>Hành động</th></tr></thead>
                        <tbody>
                            {docs.map(d => (
                                <tr key={d.id}>
                                    <td>{d.title}</td><td>{d.uploader_name || `User ID: ${d.uploader_id}`}</td>
                                    <td style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => handleAction(d.id, 'approved')} className="btn-apple btn-primary">Duyệt</button>
                                        <button onClick={() => handleAction(d.id, 'rejected')} className="btn-apple" style={{ background: '#FFEBEB', color: '#FF3B30' }}>Từ chối</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
export default AdminApproval;