import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAdmin }) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin) {
        let userRole = '';
        let hasError = false;

        // Chỉ thực hiện logic giải mã chuỗi bên trong try/catch
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userRole = payload.role?.toLowerCase();
        } catch (error) {
            console.error('Lỗi giải mã token:', error);
            hasError = true;
        }

        // Đưa việc xử lý JSX (trả về Component) ra bên ngoài try/catch
        if (hasError) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return <Navigate to="/login" replace />;
        }

        if (userRole !== 'admin') {
            return <Navigate to="/access-denied" replace />;
        }
    }
    
    return children;
};

export default ProtectedRoute;