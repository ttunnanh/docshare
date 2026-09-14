import { Navigate } from 'react-router-dom';
export default function ProtectedRoute({children,admin=false}){const token=localStorage.getItem('token');let user=null;try{user=JSON.parse(localStorage.getItem('user')||'null')}catch{}if(!token)return <Navigate to="/login" replace/>;if(admin&&user?.role!=='admin')return <Navigate to="/access-denied" replace/>;return children;}
