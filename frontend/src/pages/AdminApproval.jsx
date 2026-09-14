import { useState, useEffect, useCallback } from 'react';
import { getPendingDocuments, approveDocument, rejectDocument } from '../services/adminService';

const AdminApproval = () => {
    const [documents, setDocuments] = useState([]);

    const fetchDocuments = useCallback(async () => {
        try {
            const data = await getPendingDocuments();
            setDocuments(data);
        } catch (error) {
            console.error('Lỗi tải danh sách:', error);
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            await fetchDocuments();
        };
        loadData();
    }, [fetchDocuments]);

    const handleApprove = async (id) => {
        try {
            await approveDocument(id);
            fetchDocuments();
        } catch (error) {
            console.error('Lỗi duyệt:', error);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Bạn có chắc muốn từ chối tài liệu này?')) return;
        try {
            await rejectDocument(id);
            fetchDocuments();
        } catch (error) {
            console.error('Lỗi từ chối:', error);
        }
    };

    return (
        <div className="fade-in-up" style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 24px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '24px' }}>Duyệt Tài liệu</h2>
            
            <div className="card-modern" style={{ padding: '0', overflowX: 'auto' }}>
                {documents.length === 0 ? (
                    <p style={{ padding: '30px', color: 'var(--text-muted)' }}>Không có tài liệu nào đang chờ duyệt.</p>
                ) : (
                    <table className="table-modern">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tiêu đề</th>
                                <th>Người đăng</th>
                                <th>Ngày gửi</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map(doc => (
                                <tr key={doc.id}>
                                    <td>{doc.id}</td>
                                    <td style={{ fontWeight: '500' }}>{doc.title}</td>
                                    <td>{doc.uploader_name}</td>
                                    <td>{new Date(doc.created_at).toLocaleDateString('vi-VN')}</td>
                                    <td style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => handleApprove(doc.id)} className="btn-modern btn-primary" style={{ padding: '6px 16px', fontSize: '13px' }}>
                                            Duyệt
                                        </button>
                                        <button onClick={() => handleReject(doc.id)} className="btn-modern btn-secondary" style={{ padding: '6px 16px', fontSize: '13px', color: 'var(--danger)' }}>
                                            Từ chối
                                        </button>
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