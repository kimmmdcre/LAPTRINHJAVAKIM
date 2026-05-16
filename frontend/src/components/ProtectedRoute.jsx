import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Component bảo vệ các route dựa trên trạng thái đăng nhập và vai trò người dùng.
 * 
 * @param {React.ReactNode} children - Nội dung hiển thị nếu hợp lệ
 * @param {string[]} allowedRoles - Danh sách các vai trò được phép truy cập (vd: ['ADMIN', 'TEACHER'])
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      </div>
    );
  }

  // Nếu chưa đăng nhập, chuyển hướng về trang login và lưu lại vị trí hiện tại
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu có yêu cầu về vai trò nhưng người dùng không thỏa mãn
  if (allowedRoles && !allowedRoles.includes(user.role?.replace('ROLE_', ''))) {
    // Chuyển hướng về dashboard nếu không có quyền
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
