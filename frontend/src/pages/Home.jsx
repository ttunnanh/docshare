import { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaDownload, FaFileAlt, FaShieldAlt, FaBolt, FaRegHeart } from 'react-icons/fa';
import api from '../services/api';

const Home = () => {
    const [documents, setDocuments] = useState([]);
    const [search, setSearch] = useState('');

    const fetchDocs = useCallback(async () => {
        try {
            const res = await api.get('/documents');
            setDocuments(res.data.documents || res.data);
        } catch (err) {
            console.error('Lỗi tải dữ liệu', err);
        }
    }, []);

    useEffect(() => {
        // FIX: Bọc hàm bất đồng bộ bên trong useEffect để tránh lỗi set-state-in-effect
        const loadData = async () => {
            await fetchDocs();
        };
        loadData();
    }, [fetchDocs]);

    const handleDownload = async (id) => {
        try {
            const res = await api.get(`/documents/${id}/download`);
            if (res.data.downloadUrl) {
                window.open(res.data.downloadUrl, '_blank');
                fetchDocs();
            }
        } catch (err) {
            console.error('Lỗi tải file:', err);
            alert('Vui lòng đăng nhập để tải tài liệu!');
        }
    };

    const handleSave = async (id) => {
        try {
            await api.post(`/documents/${id}/save`);
            alert('Đã cập nhật danh sách lưu!');
        } catch (err) {
            console.error('Lỗi lưu file:', err);
            alert('Vui lòng đăng nhập để lưu tài liệu!');
        }
    };

    return (
        <div style={{ paddingBottom: '60px' }}>
            <div style={{ textAlign: 'center', padding: '80px 24px', background: '#FFFFFF', borderBottom: '1px solid var(--border)' }}>
                <h1 style={{ fontSize: '56px', fontWeight: '700', letterSpacing: '-2px', color: 'var(--text-main)', marginBottom: '16px' }}>
                    Kiến thức của bạn.<br />Được sắp xếp hoàn hảo.
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '20px', maxWidth: '600px', margin: '0 auto 40px', fontWeight: '400' }}>
                    Tìm kiếm, lưu trữ và chia sẻ tài liệu học thuật với trải nghiệm mượt mà nhất. Dành riêng cho cộng đồng.
                </p>
                
                <div style={{ position: 'relative', maxWidth: '580px', margin: '0 auto', display: 'flex', boxShadow: 'var(--shadow-md)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ padding: '0 20px', background: '#FFF', display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRight: 'none', borderTopLeftRadius: '999px', borderBottomLeftRadius: '999px' }}>
                        <FaSearch color="var(--text-muted)" size={18} />
                    </div>
                    <input 
                        type="text" placeholder="Nhập tên tài liệu, môn học..."
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        style={{ flex: 1, padding: '18px 16px', border: '1px solid var(--border)', borderLeft: 'none', borderRight: 'none', fontSize: '16px', outline: 'none' }}
                    />
                    <button className="btn-apple btn-primary" style={{ borderRadius: '0 999px 999px 0', padding: '0 32px', fontSize: '16px' }}>Tìm kiếm</button>
                </div>
            </div>

            <div style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <FaBolt size={32} color="var(--accent)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Tốc độ chớp nhoáng</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Hệ thống tối ưu hóa giúp tải tài liệu và tìm kiếm cực nhanh.</p>
                </div>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <FaShieldAlt size={32} color="var(--accent)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Kiểm duyệt chặt chẽ</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>100% tài liệu được kiểm duyệt nội dung trước khi xuất bản.</p>
                </div>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <FaFileAlt size={32} color="var(--accent)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Đa định dạng</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Hỗ trợ PDF, Word, Excel và PowerPoint.</p>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: 'var(--text-main)' }}>Học liệu nổi bật</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {documents.filter(d => d.title.toLowerCase().includes(search.toLowerCase())).map(doc => (
                        <div key={doc.id} className="apple-card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <span style={{ background: '#F5F5F7', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                                    {doc.file_format || 'PDF'}
                                </span>
                                <button onClick={() => handleSave(doc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF3B30' }}>
                                    <FaRegHeart size={18} />
                                </button>
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '6px', lineHeight: '1.4' }}>{doc.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px', flex: 1 }}>Bởi: {doc.uploader_name || 'Người dùng ẩn danh'}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '500' }}>{doc.downloads || 0} lượt tải</span>
                                <button onClick={() => handleDownload(doc.id)} className="btn-apple btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }}>
                                    <FaDownload size={12} /> Tải xuống
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default Home;