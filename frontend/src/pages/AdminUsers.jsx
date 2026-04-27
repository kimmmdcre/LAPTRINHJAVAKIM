import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import {
  UserPlus,
  Trash2,
  Edit,
  Shield,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Search,
  User,
  Mail,
  UserCheck,
  GraduationCap,
  ShieldAlert
} from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    roleCode: 'STUDENT',
    password: '',
    confirmPassword: ''
  });

  const { showToast } = useUI();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAll();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError('Hệ thống không thể tải danh sách người dùng. Vui lòng kiểm tra kết nối.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      showToast('Mật khẩu xác nhận không trùng khớp!', 'danger');
      return;
    }

    try {
      // eslint-disable-next-line no-unused-vars
      const { confirmPassword, ...submitData } = formData;

      if (editingId) {
        await userService.update(editingId, submitData);
        showToast('Cập nhật thông tin thành công!');
      } else {
        await userService.create(submitData);
        showToast('Đã tạo tài khoản mới thành công!');
      }

      closeModal();
      fetchUsers();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Có lỗi xảy ra khi thực hiện thao tác này.', 'danger');
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingId(null);
    setFormData({ username: '', fullName: '', email: '', roleCode: 'STUDENT', password: '', confirmPassword: '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await userService.delete(id);
        showToast('Đã xóa tài khoản vĩnh viễn.');
        fetchUsers();
      } catch (err) {
        console.error(err);
        showToast('Không thể xóa người dùng này.', 'danger');
      }
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN': return <ShieldAlert size={14} />;
      case 'TEACHER': return <GraduationCap size={14} />;
      default: return <User size={14} />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--danger)', border: 'rgba(239, 68, 68, 0.2)' };
      case 'TEACHER': return { bg: 'rgba(99, 102, 241, 0.1)', text: 'var(--primary)', border: 'rgba(99, 102, 241, 0.2)' };
      default: return { bg: 'rgba(16, 185, 129, 0.1)', text: 'var(--success)', border: 'rgba(16, 185, 129, 0.2)' };
    }
  };

  const filteredUsers = users.filter(u =>
    u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && users.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '1rem' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Đang tải dữ liệu nhân sự...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Quản lý Nhân sự</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Quản trị viên có thể điều phối tài khoản và phân quyền hệ thống</p>
        </div>
        <button className="btn btn-primary animate-slide-up" onClick={() => setShowAddModal(true)} style={{ padding: '0.8rem 1.5rem' }}>
          <UserPlus size={18} />
          Tạo tài khoản mới
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, username hoặc email..."
            className="input-field"
            style={{ paddingLeft: '45px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error && !loading && (
        <div className="glass-card" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Thành viên</th>
                <th style={{ padding: '1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Tài khoản</th>
                <th style={{ padding: '1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Vai trò</th>
                <th style={{ padding: '1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Trạng thái</th>
                <th style={{ padding: '1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? filteredUsers.map((u) => {
                const roleStyle = getRoleColor(u.roleCode);
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'var(--transition)' }} className="table-row-hover">
                    <td style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '12px',
                          background: 'linear-gradient(135deg, var(--glass), rgba(255,255,255,0.05))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '1px solid var(--glass-border)',
                          color: 'var(--text-secondary)'
                        }}>
                          {u.roleCode === 'TEACHER' ? <GraduationCap size={20} /> : <User size={20} />}
                        </div>
                        <div>
                          <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                            {u.fullName}
                            {currentUser?.id === u.id && <span style={{ marginLeft: '8px', fontSize: '0.65rem', color: 'var(--primary)', background: 'var(--primary-glow)', padding: '2px 8px', borderRadius: '10px' }}>TÔI</span>}
                          </p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={12} /> {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem' }}>
                      <code style={{ fontSize: '0.85rem', color: 'var(--accent)', background: 'rgba(139, 92, 246, 0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                        @{u.username}
                      </code>
                    </td>
                    <td style={{ padding: '1.25rem' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800',
                        backgroundColor: roleStyle.bg, color: roleStyle.text, border: `1px solid ${roleStyle.border}`
                      }}>
                        {getRoleIcon(u.roleCode)}
                        {u.roleCode}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.status === 'ACTIVE' ? 'var(--success)' : 'var(--danger)' }}></div>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{u.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => {
                            setEditingId(u.id);
                            setFormData({
                              username: u.username || '',
                              fullName: u.fullName || '',
                              email: u.email || '',
                              roleCode: u.roleCode || 'STUDENT',
                              password: '',
                              confirmPassword: ''
                            });
                            setShowAddModal(true);
                          }}
                          className="btn btn-outline" style={{ padding: '0.6rem' }} title="Chỉnh sửa">
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className={`btn btn-outline ${currentUser?.id === u.id ? 'disabled' : ''}`}
                          style={{ padding: '0.6rem', color: 'var(--danger)', opacity: currentUser?.id === u.id ? 0.3 : 1 }}
                          disabled={currentUser?.id === u.id}
                          title={currentUser?.id === u.id ? "Không thể tự xóa chính mình" : "Xóa tài khoản"}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <AlertCircle size={40} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                    <p>Không tìm thấy người dùng nào phù hợp</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Modern Design */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
          <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: '540px', padding: '2.5rem', position: 'relative' }}>
            <button
              onClick={closeModal}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.05)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                {editingId ? 'Cập nhật Thành viên' : 'Đăng ký Thành viên'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Vui lòng điền đầy đủ các thông tin định danh bên dưới</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Họ và tên</label>
                <input
                  type="text"
                  className="input-field"
                  required
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="input-group">
                  <label className="input-label">Tên đăng nhập</label>
                  <input
                    type="text"
                    className="input-field"
                    required
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    placeholder="nva_student"
                    disabled={!!editingId}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Quyền hạn</label>
                  <select
                    className="input-field"
                    value={formData.roleCode}
                    onChange={e => setFormData({ ...formData, roleCode: e.target.value })}
                  >
                    <option value="STUDENT">Sinh viên</option>
                    <option value="TEACHER">Giảng viên</option>
                    <option value="ADMIN">Quản trị viên</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Địa chỉ Email</label>
                <input
                  type="email"
                  className="input-field"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@ut.edu.vn"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">{editingId ? 'Mật khẩu mới' : 'Mật khẩu khởi tạo'}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-field"
                      style={{ paddingRight: '45px' }}
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Xác nhận lại</label>
                  <input
                    type="password"
                    className="input-field"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    required={!!formData.password}
                  />
                </div>
              </div>

              <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={closeModal}>Đóng cửa sổ</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingId ? 'Lưu thay đổi' : 'Xác nhận Tạo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .table-row-hover:hover {
          background: rgba(255,255,255,0.02);
        }
      `}</style>
    </div>
  );
};

export default AdminUsers;
