import { useState, useEffect, useCallback } from 'react';
import { FaDownload, FaHeartBroken } from 'react-icons/fa';
import api from '../services/api';

const Saved = () => {
    const [documents, setDocuments] = useState([]);

    const fetchSaved = useCallback(async () => {
        try {
            const res = await api.get('/documents/saved/user');
            setDocuments(res.data);
        } catch (err) {
            console.error('Lỗi tải tài liệu lưu:', err);
        }
    }, []);

    useEffect(() => { 
        // FIX: Bọc hàm bất đồng bộ
        const loadData = async () => {
            await fetchSaved();
        };
        loadData();
    }, [fetchSaved]);

    const handleRemove = async (id) => {
        try {
            await api.post(`/documents/${id}/save`);
            fetchSaved();
        } catch (err) {
            console.error('Lỗi bỏ lưu:', err);
        }
    };

    const handleDownload = async (id) => {
        try {
            const res = await api.get(`/documents/${id}/download`);
            window.open(res.data.downloadUrl, '_blank');
        } catch (err) {
            console.error('Lỗi tải file:', err);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 24px', minHeight: '60vh' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '30px' }}>Kho tài liệu yêu thích</h1>
            
            {documents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Chưa có tài liệu nào được lưu.</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {documents.map(doc => (
                        <div key={doc.id} className="apple-card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>{doc.title}</h3>
                            <div style={{ flex: 1 }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <button onClick={() => handleRemove(doc.id)} className="btn-apple" style={{ background: '#FFEBEB', color: '#FF3B30', padding: '6px 14px' }}>
                                    <FaHeartBroken size={12} /> Bỏ lưu
                                </button>
                                <button onClick={() => handleDownload(doc.id)} className="btn-apple btn-primary" style={{ padding: '6px 14px' }}>
                                    <FaDownload size={12} /> Tải
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default Saved;