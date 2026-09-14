import { useState, useEffect } from 'react';
import { getMyDownloads, getMyUploads, updateProfile, changePassword } from '../services/userService';
import { Link } from 'react-router-dom';
import { deleteDocument } from '../services/documentService';

const Profile = () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};

    const [downloads, setDownloads] = useState([]);
    const [uploads, setUploads] = useState([]);
    const [activeTab, setActiveTab] = useState('uploads');
    
    const [fullname, setFullname] = useState(user.fullname || '');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [uploadsData, downloadsData] = await Promise.all([
                    getMyUploads(),
                    getMyDownloads()
                ]);
                setUploads(Array.isArray(uploadsData) ? uploadsData : []);
                setDownloads(Array.isArray(downloadsData) ? downloadsData : []);
            } catch (error) {
                console.error('Lỗi tải dữ liệu cá nhân:', error);
            }
        };
        fetchData();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const data = await updateProfile(fullname);
            alert('Cập nhật thành công!');
            const updatedUser = { ...user, fullname: data.fullname || fullname };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.location.reload();
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi cập nhật');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            await changePassword(oldPassword, newPassword);
            alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi đổi mật khẩu');
        }
    };

    const handleDeleteDocument = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này? Hành động này không thể hoàn tác.')) return;
        try {
            await deleteDocument(id);
            alert('Xóa tài liệu thành công');
            setUploads(uploads.filter(doc => doc.id !== id));
        } catch (error) {
            alert('Lỗi xóa tài liệu: ' + (error.response?.data?.message || 'Lỗi hệ thống'));
        }
    };

    return (
        <div className="fade-in-up" style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 24px' }}>
            {/* Tiêu đề & Thông tin cơ bản */}
            <div className="card-modern" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>{user.fullname || 'Hồ sơ cá nhân'}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>{user.email}</p>
                </div>
                <div style={{ padding: '8px 16px', background: user.role === 'admin' ? 'rgba(255, 59, 48, 0.1)' : 'rgba(52, 199, 89, 0.1)', color: user.role === 'admin' ? 'var(--danger)' : 'var(--success)', borderRadius: '980px', fontWeight: '700', fontSize: '14px' }}>
                    {user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                </div>
            </div>

            {/* Menu Tabs kiểu Apple Segmented Control */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.04)', padding: '6px', borderRadius: '14px', marginBottom: '30px', width: 'max-content', overflowX: 'auto' }}>
                {['uploads', 'downloads', 'settings'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '10px 24px', border: 'none', borderRadius: '10px',
                            background: activeTab === tab ? 'var(--surface)' : 'transparent',
                            color: activeTab === tab ? 'var(--text-main)' : 'var(--text-muted)',
                            boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none',
                            fontWeight: activeTab === tab ? '600' : '500',
                            fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab === 'uploads' ? 'Tài liệu của tôi' : tab === 'downloads' ? 'Lịch sử tải' : 'Cài đặt'}
                    </button>
                ))}
            </div>

            {/* Content thay đổi theo Tab */}
            <div className="card-modern" style={{ padding: '0', overflow: 'hidden' }}>
                {activeTab === 'uploads' && (
                    <div style={{ padding: '30px', overflowX: 'auto' }}>
                        <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>Tài liệu đã tải lên</h2>
                        {uploads.length === 0 ? <p style={{color: 'var(--text-muted)'}}>Bạn chưa đóng góp tài liệu nào.</p> : (
                            <table className="table-modern">
                                <thead>
                                    <tr>
                                        <th>Tiêu đề</th>
                                        <th>Ngày gửi</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {uploads.map(doc => (
                                        <tr key={doc.id}>
                                            <td style={{ fontWeight: '500' }}>{doc.title}</td>
                                            <td>{new Date(doc.created_at).toLocaleDateString('vi-VN')}</td>
                                            <td>
                                                <span style={{ color: doc.status === 'approved' ? 'var(--success)' : (doc.status === 'rejected' ? 'var(--danger)' : '#f59e0b'), fontWeight: '600' }}>
                                                    {doc.status === 'pending' ? 'Chờ duyệt' : doc.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                                                </span>
                                            </td>
                                            <td style={{ display: 'flex', gap: '15px' }}>
                                                <Link to={`/document/edit/${doc.id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '500' }}>Sửa</Link>
                                                <button onClick={() => handleDeleteDocument(doc.id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Xóa</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {activeTab === 'downloads' && (
                    <div style={{ padding: '30px', overflowX: 'auto' }}>
                        <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>Lịch sử tải xuống</h2>
                        {downloads.length === 0 ? <p style={{color: 'var(--text-muted)'}}>Bạn chưa tải xuống tài liệu nào.</p> : (
                            <table className="table-modern">
                                <thead>
                                    <tr>
                                        <th>Tên tài liệu</th>
                                        <th>Thời gian tải</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {downloads.map(item => (
                                        <tr key={item.download_id || item.id}>
                                            <td style={{ fontWeight: '500', color: 'var(--accent)' }}>{item.title}</td>
                                            <td>{new Date(item.downloaded_at).toLocaleString('vi-VN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div style={{ padding: '40px', maxWidth: '500px' }}>
                        <h2 style={{ fontSize: '22px', marginBottom: '24px' }}>Cập nhật hồ sơ</h2>
                        <form onSubmit={handleUpdateProfile} style={{ marginBottom: '40px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Họ và tên</label>
                            <input 
                                type="text" 
                                className="input-modern" 
                                value={fullname} 
                                onChange={(e) => setFullname(e.target.value)} 
                                required 
                            />
                            <button type="submit" className="btn-modern btn-primary" style={{ marginTop: '16px' }}>Lưu thông tin</button>
                        </form>

                        <h2 style={{ fontSize: '22px', marginBottom: '24px' }}>Đổi mật khẩu</h2>
                        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Mật khẩu hiện tại</label>
                                <input 
                                    type="password" 
                                    className="input-modern" 
                                    value={oldPassword} 
                                    onChange={(e) => setOldPassword(e.target.value)} 
                                    required 
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Mật khẩu mới</label>
                                <input 
                                    type="password" 
                                    className="input-modern" 
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)} 
                                    required 
                                />
                            </div>
                            <div>
                                <button type="submit" className="btn-modern btn-primary" style={{ background: 'var(--text-main)', marginTop: '8px' }}>
                                    Đổi mật khẩu
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;