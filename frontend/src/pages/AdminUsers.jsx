import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { UserPlus, Trash2, Edit, UserCheck, Shield, AlertCircle, X, Eye, EyeOff } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    hoTen: '',
    email: '',
    maVaiTro: 'SINH_VIEN',
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
      setError('Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      showToast('Mật khẩu và Xác nhận mật khẩu không khớp!', 'danger');
      return;
    }
    try {
      // Create a DTO without confirmPassword to send
      // eslint-disable-next-line no-unused-vars
      const { confirmPassword, ...submitData } = formData;
      if (editingId) {
        await userService.update(editingId, submitData);
        showToast('Thay đổi đã được lưu thành công!');
      } else {
        await userService.create(submitData);
        showToast('Thành viên mới đã được tạo thành công!');
      }
      setShowAddModal(false);
      setEditingId(null);
      setFormData({ username: '', hoTen: '', email: '', maVaiTro: 'SINH_VIEN', password: '', confirmPassword: '' });
      fetchUsers();
    } catch (err) {
      console.error(err);
      showToast(editingId ? 'Lỗi khi cập nhật tài khoản.' : 'Lỗi khi tạo tài khoản.', 'danger');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá người dùng này?')) {
      try {
        await userService.delete(id);
        showToast('Đã xóa tài khoản.');
        fetchUsers();
      } catch (err) {
        console.error(err);
        showToast('Lỗi khi xoá người dùng.', 'danger');
      }
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Quản lý Người dùng</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Danh sách tất cả tài khoản trong hệ thống</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input 
            type="text" 
            placeholder="Tìm kiếm tài khoản theo tên hoặc email..." 
            className="input-field" 
            style={{ paddingLeft: '1rem' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingId(null); setFormData({ username: '', hoTen: '', email: '', maVaiTro: 'SINH_VIEN', password: '', confirmPassword: '' }); setShowAddModal(true); }} style={{ whiteSpace: 'nowrap' }}>
          <UserPlus size={18} />
          Thêm người dùng
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--surface-border)' }}>
              <th style={{ padding: '1.25rem' }}>Họ tên</th>
              <th style={{ padding: '1.25rem' }}>Username</th>
              <th style={{ padding: '1.25rem' }}>Email</th>
              <th style={{ padding: '1.25rem' }}>Vai trò</th>
              <th style={{ padding: '1.25rem' }}>Trạng thái</th>
              <th style={{ padding: '1.25rem' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => u.hoTen?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase())).map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--surface-border)', transition: 'var(--transition)' }}>
                <td style={{ padding: '1.25rem', fontWeight: '500' }}>
                  {user.hoTen}
                  {currentUser && currentUser.id === user.id && (
                    <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: 'var(--primary)', background: 'rgba(99,102,241,0.1)', padding: '2px 6px', borderRadius: '4px' }}>(Bạn)</span>
                  )}
                </td>
                <td style={{ padding: '1.25rem', color: 'var(--text-secondary)' }}>{user.username}</td>
                <td style={{ padding: '1.25rem' }}>{user.email}</td>
                <td style={{ padding: '1.25rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '20px', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold',
                    background: (user.maVaiTro === 'ADMIN' || user.maVaiTro === 'QUAN_TRI_VIEN') ? 'rgba(99, 102, 241, 0.2)' : 
                                user.maVaiTro === 'GIANG_VIEN' ? 'rgba(139, 92, 246, 0.2)' : 
                                user.maVaiTro === 'TRUONG_NHOM' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255,255,255,0.1)',
                    color: (user.maVaiTro === 'ADMIN' || user.maVaiTro === 'QUAN_TRI_VIEN') ? 'var(--primary)' : 
                           user.maVaiTro === 'GIANG_VIEN' ? 'var(--accent)' : 
                           user.maVaiTro === 'TRUONG_NHOM' ? 'rgb(250, 204, 21)' : 'var(--text-primary)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {user.maVaiTro}
                  </span>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      background: user.trangThai === 'ACTIVE' ? 'var(--success)' : 'var(--danger)' 
                    }}></div>
                    <span style={{ fontSize: '0.875rem' }}>{user.trangThai}</span>
                  </div>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => {
                        setEditingId(user.id);
                        setFormData({
                          username: user.username || '',
                          hoTen: user.hoTen || '',
                          email: user.email || '',
                          maVaiTro: user.maVaiTro || 'SINH_VIEN',
                          password: '',
                          confirmPassword: ''
                        });
                        setShowAddModal(true);
                      }}
                      className="btn btn-outline" style={{ padding: '0.5rem' }} title="Chỉnh sửa">
                      <Edit size={16} />
                    </button>
                    {currentUser && currentUser.id === user.id ? (
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.5rem', color: 'var(--text-secondary)', opacity: 0.5, cursor: 'not-allowed' }} 
                        title="Không thể xoá tài khoản đang đăng nhập"
                        disabled
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="btn btn-outline" 
                        style={{ padding: '0.5rem', color: 'var(--danger)' }} 
                        title="Xoá"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card animate-scale-in" style={{ width: '500px', padding: '2rem', position: 'relative' }}>
            <button 
              onClick={() => { setShowAddModal(false); setEditingId(null); }}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              {editingId ? 'Chỉnh sửa thông tin tài khoản' : 'Tạo tài khoản mới'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Họ tên</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required
                  value={formData.hoTen}
                  onChange={e => setFormData({...formData, hoTen: e.target.value})}
                  placeholder="Nguyễn Văn A" 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Username</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    placeholder="nva_student" 
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Vai trò</label>
                  <select 
                    className="input-field"
                    value={formData.maVaiTro}
                    onChange={e => setFormData({...formData, maVaiTro: e.target.value})}
                    disabled={!!editingId}
                  >
                    <option value="SINH_VIEN">Sinh viên</option>
                    <option value="GIANG_VIEN">Giảng viên</option>
                    <option value="ADMIN">Quản trị viên</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Email</label>
                <input 
                  type="email" 
                  className="input-field" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="a.nguyen@example.com" 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Mật khẩu {editingId ? '(Bỏ trống nếu không đổi)' : '(Bỏ trống sẽ mặc định 123456)'}</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      className="input-field" 
                      style={{ paddingRight: '40px' }}
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      placeholder="••••••••" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Xác nhận mật khẩu</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="input-field" 
                      style={{ paddingRight: '40px' }}
                      value={formData.confirmPassword}
                      onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                      placeholder="••••••••" 
                      required={!!formData.password}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setShowAddModal(false); setEditingId(null); }}>Huỷ</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingId ? 'Lưu thay đổi' : 'Tạo tài khoản'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
