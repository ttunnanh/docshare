import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Upload = () => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({ title: '', description: '', category_id: '' });
    const [file, setFile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/categories').then(res => {
            setCategories(res.data);
            if(res.data.length > 0) setFormData(f => ({...f, category_id: res.data[0].id}));
        }).catch(e => console.error(e));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!file) return alert('Vui lòng chọn file!');
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('category_id', formData.category_id);
        data.append('file', file);

        try {
            await api.post('/documents/upload', data, { headers: { 'Content-Type': 'multipart/form-data' }});
            alert('Tải lên thành công! Đang chờ duyệt.');
            navigate('/profile');
        } catch (err) { 
            console.error('Lỗi tải', err);
            alert('Lỗi tải lên.'); 
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '60px auto', padding: '0 24px' }}>
            <div className="apple-card">
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Tải tài liệu lên</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input type="text" placeholder="Tiêu đề tài liệu" required onChange={e => setFormData({...formData, title: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                    <textarea placeholder="Mô tả nội dung..." rows="4" required onChange={e => setFormData({...formData, description: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', resize: 'none' }} />
                    <select onChange={e => setFormData({...formData, category_id: e.target.value})} value={formData.category_id} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input type="file" required onChange={e => setFile(e.target.files[0])} style={{ padding: '12px', background: '#FAFAFA', borderRadius: '8px' }} />
                    <button type="submit" className="btn-apple btn-primary" style={{ padding: '14px', justifyContent: 'center' }}>Xác nhận Tải lên</button>
                </form>
            </div>
        </div>
    );
};
export default Upload;