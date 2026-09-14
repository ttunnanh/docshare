import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaFolderOpen } from 'react-icons/fa';

const Categories = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        api.get('/categories').then(res => setCategories(res.data));
    }, []);

    return (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 24px', minHeight: '60vh' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '30px', textAlign: 'center' }}>Khám phá Danh mục</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                {categories.map(cat => (
                    <div key={cat.id} className="apple-card" style={{ textAlign: 'center', padding: '30px 20px', cursor: 'pointer' }}>
                        <FaFolderOpen size={40} color="var(--accent)" style={{ marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-main)' }}>{cat.name}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Categories;