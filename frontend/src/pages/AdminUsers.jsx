import { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole } from '../services/adminService';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getAllUsers();
                setUsers(data);
            } catch (error) {
                console.error('Lỗi tải danh sách người dùng:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [refreshTrigger]);

    const handleRoleChange = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        const confirmMsg = `Bạn có chắc muốn đổi quyền người dùng này thành ${newRole.toUpperCase()}?`;
        
        if (!window.confirm(confirmMsg)) return;

        try {
            await updateUserRole(userId, newRole);
            alert('Cập nhật phân quyền thành công!');
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Lỗi cập nhật quyền:', error);
            alert('Cập nhật thất bại');
        }
    };

    if (loading) return <h3 style={{ padding: '20px' }}>Đang tải dữ liệu...</h3>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <h2>Quản lý Người dùng</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Họ Tên</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Vai trò</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.id}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.fullname}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.email}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', color: user.role === 'admin' ? 'red' : 'green' }}>
                                {user.role}
                            </td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                <button 
                                    onClick={() => handleRoleChange(user.id, user.role)}
                                    style={{ padding: '5px 10px', cursor: 'pointer', background: user.role === 'admin' ? '#6c757d' : '#007bff', color: 'white', border: 'none', borderRadius: '3px' }}
                                >
                                    Đổi thành {user.role === 'admin' ? 'User' : 'Admin'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminUsers;