import { useState, useEffect } from 'react';
import { getAllForAdmin, deleteDocument } from '../services/documentService';

const AdminDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const data = await getAllForAdmin();
                setDocuments(data);
            } catch (error) {
                console.error('Lỗi tải danh sách tài liệu:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, [refreshTrigger]);

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn tài liệu này?')) return;
        try {
            await deleteDocument(id);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error(error)
            alert('Lỗi xóa tài liệu');
        }
    };

    if (loading) return <h3 style={{ padding: '20px' }}>Đang tải dữ liệu...</h3>;

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: 'auto' }}>
            <h2>Quản lý Toàn bộ Tài liệu</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tiêu đề</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Trạng thái</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Ngày tạo</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {documents.map(doc => (
                        <tr key={doc.id}>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{doc.id}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}><strong>{doc.title}</strong></td>
                            <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', color: doc.status === 'approved' ? 'green' : doc.status === 'pending' ? 'orange' : 'red' }}>
                                {doc.status}
                            </td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                {new Date(doc.created_at).toLocaleDateString('vi-VN')}
                            </td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                <button 
                                    onClick={() => handleDelete(doc.id)}
                                    style={{ padding: '5px 10px', background: 'red', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                >
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDocuments;