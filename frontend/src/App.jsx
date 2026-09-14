import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import AdminApproval from './pages/AdminApproval';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers'; 
import AdminCategories from './pages/AdminCategories';
import AdminDocuments from './pages/AdminDocuments'; // Import thêm trang này
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import EditDocument from './pages/EditDocument';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Các trang công khai */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Các trang yêu cầu đăng nhập */}
        <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/document/edit/:id" element={<ProtectedRoute><EditDocument /></ProtectedRoute>} />
        
        {/* Các trang dành cho Admin */}
        <Route path="/admin/approval" element={
            <ProtectedRoute requireAdmin={true}>
                <AdminApproval />
            </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
            <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
            </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
            <ProtectedRoute requireAdmin={true}>
                <AdminUsers />
            </ProtectedRoute>
        } />
        <Route path="/admin/categories" element={
            <ProtectedRoute requireAdmin={true}>
                <AdminCategories />
            </ProtectedRoute>
        } />
        <Route path="/admin/documents" element={
            <ProtectedRoute requireAdmin={true}>
                <AdminDocuments />
            </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;