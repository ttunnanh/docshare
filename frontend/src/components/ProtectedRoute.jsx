import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAdmin }) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin) {
        let role = null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            role = payload.role;
        } catch (error) {
            console.error('Lỗi giải mã token:', error);
        }

        if (role !== 'admin') {
            alert('Lỗi truy cập: Bạn không có quyền Admin!');
            return <Navigate to="/" replace />;
        }
    }
    
    return children;
};

export default ProtectedRoute;