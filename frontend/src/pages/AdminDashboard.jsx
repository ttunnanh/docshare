import { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/adminService';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error('Lỗi tải thống kê:', error);
            }
        };
        fetchStats();
    }, []);

    if (!stats) return <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải...</div>;

    return (
        <div className="fade-in-up" style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 24px' }}>
            <h1 className="text-gradient" style={{ fontSize: '32px', fontWeight: '800', marginBottom: '30px' }}>Thống kê hệ thống</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div className="card-modern" style={{ textAlign: 'center', padding: '30px' }}>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '16px', fontWeight: '500' }}>Tổng người dùng</h3>
                    <p style={{ fontSize: '48px', fontWeight: '800', color: 'var(--accent)', margin: '10px 0' }}>{stats.totalUsers}</p>
                </div>
                
                <div className="card-modern" style={{ textAlign: 'center', padding: '30px' }}>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '16px', fontWeight: '500' }}>Tổng tài liệu</h3>
                    <p style={{ fontSize: '48px', fontWeight: '800', color: 'var(--accent)', margin: '10px 0' }}>{stats.totalDocuments}</p>
                </div>
                
                <div className="card-modern" style={{ textAlign: 'center', padding: '30px' }}>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '16px', fontWeight: '500' }}>Tài liệu chờ duyệt</h3>
                    <p style={{ fontSize: '48px', fontWeight: '800', color: 'var(--danger)', margin: '10px 0' }}>{stats.pendingDocuments}</p>
                </div>
                
                <div className="card-modern" style={{ textAlign: 'center', padding: '30px' }}>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '16px', fontWeight: '500' }}>Tổng lượt tải</h3>
                    <p style={{ fontSize: '48px', fontWeight: '800', color: 'var(--success)', margin: '10px 0' }}>{stats.totalDownloads}</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;