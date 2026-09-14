import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaFolderOpen, FaSearch } from 'react-icons/fa';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/categories').then(res => setCategories(res.data));
    }, []);

    const filteredCats = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 24px', minHeight: '60vh' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px', textAlign: 'center' }}>Khám phá Danh mục</h1>
            
            <div style={{ maxWidth: '400px', margin: '0 auto 40px', position: 'relative' }}>
                <FaSearch style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }} />
                <input 
                    type="text" placeholder="Tìm danh mục..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '15px' }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {filteredCats.map(cat => (
                    <div key={cat.id} onClick={() => navigate(`/?category_id=${cat.id}`)} className="apple-card" style={{ textAlign: 'center', padding: '30px 20px', cursor: 'pointer' }}>
                        <FaFolderOpen size={36} color="var(--accent)" style={{ marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{cat.name}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Categories;