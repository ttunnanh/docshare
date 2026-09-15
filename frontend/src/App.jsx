import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import Saved from './pages/Saved';
import Profile from './pages/Profile';
import Categories from './pages/Categories';
import DocumentDetail from './pages/DocumentDetail';
import EditDocument from './pages/EditDocument';
import AdminDashboard from './pages/AdminDashboard';
import AdminApproval from './pages/AdminApproval';
import AdminUsers from './pages/AdminUsers';
import AdminCategories from './pages/AdminCategories';
import AdminDocuments from './pages/AdminDocuments';
import AdminAuditLogs from './pages/AdminAuditLogs';
import AccessDenied from './pages/AccessDenied';
import NotFound from './pages/NotFound';

const Private = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;
const Admin = ({ children }) => <ProtectedRoute admin>{children}</ProtectedRoute>;

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/documents/:id" element={<DocumentDetail />} />
            <Route path="/saved" element={<Private><Saved /></Private>} />
            <Route path="/upload" element={<Private><Upload /></Private>} />
            <Route path="/profile" element={<Private><Profile /></Private>} />
            <Route path="/document/edit/:id" element={<Private><EditDocument /></Private>} />
            <Route path="/admin/dashboard" element={<Admin><AdminDashboard /></Admin>} />
            <Route path="/admin/approval" element={<Admin><AdminApproval /></Admin>} />
            <Route path="/admin/users" element={<Admin><AdminUsers /></Admin>} />
            <Route path="/admin/categories" element={<Admin><AdminCategories /></Admin>} />
            <Route path="/admin/documents" element={<Admin><AdminDocuments /></Admin>} />
            <Route path="/admin/audit-logs" element={<Admin><AdminAuditLogs /></Admin>} />
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
