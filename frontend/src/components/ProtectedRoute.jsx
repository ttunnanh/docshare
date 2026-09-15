import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, admin = false }) {
  const location = useLocation();
  const token = localStorage.getItem('token');
  let user = null;
  try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch { user = null; }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  if (admin && user.role !== 'admin') {
    return <Navigate to="/access-denied" replace />;
  }
  return children;
}
