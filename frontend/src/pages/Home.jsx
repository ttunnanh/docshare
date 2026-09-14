import { useState, useEffect } from 'react';
import { getAllDocuments, getDownloadUrl } from '../services/documentService';
import { getAllCategories } from '../services/categoryService';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            const data = await getAllCategories();
            setCategories(data);
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchDocuments = async () => {
            setLoading(true);
            try {
                const data = await getAllDocuments(page, searchTerm, selectedCategory);
                const docsArray = data.documents ? data.documents : data;
                if (Array.isArray(docsArray)) {
                    setDocuments(docsArray);
                    setTotalPages(data.totalPages || 1);
                } else setDocuments([]);
            } catch (error) {
                console.error("Lỗi khi tải danh sách tài liệu:", error);
                setDocuments([]);
            } finally {
                setLoading(false);
            }
        };

        const delayDebounceFn = setTimeout(() => { fetchDocuments(); }, 400);
        return () => clearTimeout(delayDebounceFn);
    }, [page, searchTerm, selectedCategory]);

    const handleDownload = async (id) => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');
        try {
            const data = await getDownloadUrl(id);
            if (data.downloadUrl) window.open(data.downloadUrl, '_blank');
        } catch (error) {
            console.error("Lỗi khi tải xuống:", error);
            alert('Không thể tải xuống tài liệu lúc này.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Hero Section Siêu Đẹp */}
            <div className="fade-in-up" style={{ 
                padding: '120px 20px 80px 20px', 
                textAlign: 'center',
                background: 'radial-gradient(circle at 50% 0%, #ffffff 0%, var(--bg-color) 70%)'
            }}>
                <h1 className="text-gradient" style={{ fontSize: '64px', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '20px', lineHeight: '1.1' }}>
                    Kho tàng tri thức.<br />Nằm trọn trong tay bạn.
                </h1>
                <p style={{ fontSize: '21px', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 50px auto', fontWeight: '400' }}>
                    Tìm kiếm, chia sẻ và tải xuống hàng ngàn tài liệu học thuật, đồ án và nghiên cứu chất lượng cao.
                </p>
                
                {/* Thanh tìm kiếm nổi (Floating Search Bar) */}
                <div style={{ 
                    display: 'flex', gap: '0', maxWidth: '720px', margin: '0 auto', 
                    background: 'var(--surface)', borderRadius: '980px', 
                    boxShadow: 'var(--shadow-lg)', padding: '8px',
                    border: '1px solid rgba(0,0,0,0.05)'
                }}>
                    <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Bạn đang tìm kiếm tài liệu gì?" 
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        style={{ flex: 1, border: 'none', outline: 'none', fontSize: '18px', background: 'transparent' }}
                    />
                    <select 
                        value={selectedCategory} 
                        onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                        style={{ 
                            border: 'none', outline: 'none', fontSize: '16px', background: 'var(--bg-color)', 
                            padding: '12px 20px', borderRadius: '980px', cursor: 'pointer', fontWeight: '500' 
                        }}
                    >
                        <option value="">Mọi danh mục</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Danh sách Tài liệu */}
            <div className="fade-in-up" style={{ animationDelay: '0.2s', maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)', fontSize: '20px' }}>Đang tìm kiếm...</div>
                ) : documents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>Không tìm thấy kết quả</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Thử thay đổi từ khóa hoặc danh mục tìm kiếm.</p>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
                            {documents.map(doc => (
                                <div key={doc.id} className="card-modern" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ 
                                            display: 'inline-block', padding: '6px 12px', background: 'rgba(0, 113, 227, 0.1)', 
                                            color: 'var(--accent)', borderRadius: '8px', fontSize: '12px', fontWeight: '700', marginBottom: '16px' 
                                        }}>
                                            {categories.find(c => c.id === doc.category_id)?.name || 'Tài liệu'}
                                        </span>
                                        <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px', lineHeight: '1.3', letterSpacing: '-0.01em' }}>
                                            {doc.title}
                                        </h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {doc.description || 'Chưa có mô tả chi tiết cho tài liệu này.'}
                                        </p>
                                    </div>
                                    <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                                        <button onClick={() => handleDownload(doc.id)} className="btn-modern btn-secondary" style={{ width: '100%' }}>
                                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{marginRight: '8px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                            Tải xuống ngay
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Phân trang */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '60px' }}>
                                <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="btn-modern btn-secondary">
                                    Trang trước
                                </button>
                                <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-muted)' }}>
                                    {page} / {totalPages}
                                </span>
                                <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="btn-modern btn-secondary">
                                    Trang sau
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Home;