import { useState, useEffect } from 'react';
import { uploadDocument } from '../services/documentService';
import { getAllCategories } from '../services/categoryService';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [file, setFile] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getAllCategories();
                setCategories(data);
            } catch (error) {
                console.error("Lỗi khi tải danh mục:", error);
            }
        };
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return alert('Vui lòng chọn file');
        
        if (file.size > 10 * 1024 * 1024) {
            alert('File quá lớn! Vui lòng chọn file dưới 10MB.');
            return;
        }

        const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            alert('Chỉ hỗ trợ file PDF, Word, Excel hoặc Zip!');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category_id', categoryId);
        formData.append('file', file);

        setLoading(true);
        try {
            await uploadDocument(formData);
            alert('Tải lên thành công! Đang chờ admin duyệt.');
            navigate('/profile');
        } catch (error) {
            alert('Lỗi tải lên: ' + (error.response?.data?.message || 'Lỗi hệ thống'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in-up" style={{ maxWidth: '600px', margin: '60px auto', padding: '0 24px' }}>
            <div className="card-modern">
                <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Tải lên Tài liệu</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Chia sẻ tài liệu của bạn với cộng đồng.</p>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Tiêu đề tài liệu</label>
                        <input 
                            type="text" 
                            className="input-modern"
                            placeholder="Nhập tên tài liệu rõ ràng..."
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Danh mục</label>
                        <select 
                            className="input-modern"
                            value={categoryId} 
                            onChange={(e) => setCategoryId(e.target.value)} 
                            required
                            style={{ appearance: 'none' }}
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Mô tả chi tiết</label>
                        <textarea 
                            className="input-modern"
                            placeholder="Mô tả ngắn gọn về nội dung tài liệu..."
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            rows="4"
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Tệp đính kèm (Tối đa 10MB)</label>
                        <input 
                            type="file" 
                            onChange={(e) => setFile(e.target.files[0])} 
                            required 
                            style={{
                                display: 'block', width: '100%', padding: '12px',
                                border: '1px dashed var(--border)', borderRadius: '12px',
                                background: 'rgba(0,0,0,0.02)', cursor: 'pointer'
                            }}
                        />
                    </div>

                    <button type="submit" className="btn-modern btn-primary" disabled={loading} style={{ padding: '16px', marginTop: '10px' }}>
                        {loading ? 'Đang tải lên và xử lý...' : 'Xác nhận tải lên'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Upload;