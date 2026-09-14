import { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/adminService';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalDocuments: 0, pendingDocuments: 0, totalDownloads: 0 });

    useEffect(() => {
        getDashboardStats().then(data => setStats(data)).catch(() => {});
    }, []);

    return (
        <div style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 24px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '40px', textAlign: 'center' }}>Thống kê hệ thống</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <div className="apple-card" style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>Tổng người dùng</p>
                    <h2 style={{ fontSize: '48px', color: 'var(--accent)', marginTop: '10px' }}>{stats.totalUsers}</h2>
                </div>
                <div className="apple-card" style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>Tổng tài liệu</p>
                    <h2 style={{ fontSize: '48px', color: 'var(--accent)', marginTop: '10px' }}>{stats.totalDocuments}</h2>
                </div>
                <div className="apple-card" style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>Tài liệu chờ duyệt</p>
                    <h2 style={{ fontSize: '48px', color: '#FF3B30', marginTop: '10px' }}>{stats.pendingDocuments}</h2>
                </div>
                <div className="apple-card" style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>Tổng lượt tải</p>
                    <h2 style={{ fontSize: '48px', color: '#34C759', marginTop: '10px' }}>{stats.totalDownloads}</h2>
                </div>
            </div>
        </div>
    );
};
export default AdminDashboard;