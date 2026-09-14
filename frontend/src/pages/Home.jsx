import { useState, useEffect, useCallback } from 'react';
import { FaDownload, FaHeart, FaRegHeart } from 'react-icons/fa';
import api from '../services/api';

const getFormatColor = (format) => {
    const fmt = format?.toUpperCase() || 'PDF';
    if (fmt.includes('PDF')) return { bg: '#FFEBEB', color: '#FF3B30' };
    if (fmt.includes('DOC') || fmt.includes('WORD')) return { bg: '#EBF4FF', color: '#0071E3' };
    if (fmt.includes('XLS') || fmt.includes('EXCEL')) return { bg: '#E8F5E9', color: '#34C759' };
    if (fmt.includes('PPT')) return { bg: '#FFF4E5', color: '#FF9500' };
    return { bg: '#F5F5F7', color: '#1D1D1F' };
};

const Home = () => {
    const [documents, setDocuments] = useState([]);
    const [savedIds, setSavedIds] = useState(new Set());
    const [search, setSearch] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const [docsRes, savedRes] = await Promise.all([
                api.get('/documents'),
                api.get('/documents/saved/user').catch(() => ({ data: [] }))
            ]);
            setDocuments(docsRes.data.documents || docsRes.data);
            setSavedIds(new Set(savedRes.data.map(d => d.id)));
        } catch (err) {
            console.error('Lỗi tải dữ liệu', err);
        }
    }, []);

    useEffect(() => { 
        const loadData = async () => { await fetchData(); };
        loadData();
    }, [fetchData]);

    const handleDownload = async (id) => {
        try {
            const res = await api.get(`/documents/${id}/download`);
            if (res.data.downloadUrl) window.open(res.data.downloadUrl, '_blank');
        } catch (err) { 
            console.error(err);
            alert('Vui lòng đăng nhập để tải tài liệu!'); 
        }
    };

    const handleSave = async (id) => {
        try {
            await api.post(`/documents/${id}/save`);
            setSavedIds(prev => {
                const next = new Set(prev);
                next.has(id) ? next.delete(id) : next.add(id);
                return next;
            });
        } catch (err) { 
            console.error(err);
            alert('Vui lòng đăng nhập để lưu tài liệu!'); 
        }
    };

    const filteredDocs = documents.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ paddingBottom: '60px' }}>
            <div style={{ textAlign: 'center', padding: '60px 24px', background: '#FFFFFF', borderBottom: '1px solid var(--border)' }}>
                <h1 style={{ fontSize: '48px', fontWeight: '700', letterSpacing: '-1px', marginBottom: '16px' }}>Kho tàng tri thức.</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '18px', marginBottom: '32px' }}>Tìm kiếm, lưu trữ và chia sẻ tài nguyên chất lượng cao.</p>
                
                <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto', display: 'flex' }}>
                    <input 
                        type="text" placeholder="Nhập tên tài liệu cần tìm..." value={search} onChange={(e) => setSearch(e.target.value)}
                        style={{ flex: 1, padding: '16px 20px', border: '1px solid var(--border)', borderRadius: '999px', fontSize: '15px', outline: 'none', boxShadow: 'var(--shadow-sm)' }}
                    />
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {filteredDocs.map(doc => {
                        const formatStyle = getFormatColor(doc.file_format);
                        const isSaved = savedIds.has(doc.id);
                        return (
                            <div key={doc.id} className="apple-card" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <span style={{ background: formatStyle.bg, color: formatStyle.color, padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
                                        {(doc.file_format || 'PDF').toUpperCase()}
                                    </span>
                                    <button onClick={() => handleSave(doc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                        {isSaved ? <FaHeart size={20} color="#FF3B30" /> : <FaRegHeart size={20} color="#FF3B30" />}
                                    </button>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '6px' }}>{doc.title}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', flex: 1 }}>Bởi: {doc.uploader_name || 'Người dùng ẩn danh'}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{doc.downloads || 0} lượt tải</span>
                                    <button onClick={() => handleDownload(doc.id)} className="btn-apple btn-secondary"><FaDownload /> Tải xuống</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
export default Home;