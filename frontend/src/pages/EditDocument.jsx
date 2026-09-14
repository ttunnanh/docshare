import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocumentById, updateDocument } from '../services/documentService';

const EditDocument = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoc = async () => {
            try {
                const data = await getDocumentById(id);
                setTitle(data.title);
                setDescription(data.description);
            } catch (error) {
                console.error(error)
                alert('Không tìm thấy tài liệu hoặc lỗi hệ thống');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchDoc();
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateDocument(id, { title, description });
            alert('Cập nhật tài liệu thành công!');
            navigate(-1); // Quay lại trang trước đó (Profile hoặc Admin)
        } catch (error) {
            alert('Lỗi cập nhật: ' + (error.response?.data?.message || 'Lỗi hệ thống'));
        }
    };

    if (loading) return <h3 style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</h3>;

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <h2>Chỉnh sửa Tài liệu</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                <div>
                    <label style={{ fontWeight: 'bold' }}>Tiêu đề:</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>
                <div>
                    <label style={{ fontWeight: 'bold' }}>Mô tả:</label>
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        required 
                        rows="5"
                        style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Lưu thay đổi
                    </button>
                    <button type="button" onClick={() => navigate(-1)} style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditDocument;