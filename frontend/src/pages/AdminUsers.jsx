import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
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
  ShieldAlert,
  Lock,
  Unlock,
  Phone,
  ShieldCheck,
  LayoutGrid,
  CheckCircle,
  GitCommit,
  Zap,
  Award
} from 'lucide-react';
import { reportService } from '../services/api';

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
    status: 'ACTIVE',
    password: '',
    confirmPassword: ''
  });
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [gridData, setGridData] = useState([
    { fullName: '', username: '', email: '', roleCode: 'STUDENT', password: '123456' },
    { fullName: '', username: '', email: '', roleCode: 'STUDENT', password: '123456' },
    { fullName: '', username: '', email: '', roleCode: 'STUDENT', password: '123456' },
    { fullName: '', username: '', email: '', roleCode: 'STUDENT', password: '123456' },
    { fullName: '', username: '', email: '', roleCode: 'STUDENT', password: '123456' },
  ]);

  const gridStyles = `
    .grid-row {
      border-bottom: 1px solid var(--glass-border);
    }
    .grid-input {
      transition: all 0.15s ease;
      border-radius: 4px !important;
      font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
      font-weight: 500 !important;
      color: #e2e8f0 !important;
    }
    .grid-input:focus {
      background: rgba(255, 255, 255, 0.03) !important;
      outline: 1px solid var(--primary) !important;
      color: white !important;
    }
    .grid-input::placeholder {
      color: rgba(255, 255, 255, 0.2);
    }
  `;

  const addGridRow = () => {
    setGridData([...gridData, { fullName: '', username: '', email: '', roleCode: 'STUDENT', password: '123456' }]);
  };

  const updateGridCell = (index, field, value) => {
    const newData = [...gridData];
    newData[index][field] = value;
    setGridData(newData);
  };

  const removeGridRow = (index) => {
    if (gridData.length > 1) {
      setGridData(gridData.filter((_, i) => i !== index));
    }
  };

  const { showToast } = useUI();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setShowBulkModal(false);
        setShowAddModal(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);



  // Modal Profile State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberHistory, setMemberHistory] = useState([]);
  const [memberLoading, setMemberLoading] = useState(false);

  const handleShowMemberInfo = async (memberId) => {
    setShowProfileModal(true);
    setMemberLoading(true);
    try {
      const [userRes, historyRes] = await Promise.all([
        userService.getById(memberId),
        reportService.getPersonalHistory(memberId)
      ]);
      setSelectedMember(userRes.data);
      setMemberHistory(historyRes.data || []);
    } catch (err) {
      console.error('Lỗi tải chi tiết thành viên:', err);
      setSelectedMember({ id: memberId, fullName: 'Đang tải...' });
      setMemberHistory([]);
    } finally {
      setMemberLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showAddModal) {
        closeModal();
      }
    };

    if (showAddModal) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showAddModal]);

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
    setFormData({ username: '', fullName: '', email: '', roleCode: 'STUDENT', status: 'ACTIVE', password: '', confirmPassword: '' });
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

  const handleToggleStatus = async (targetUser) => {
    if (targetUser.id === currentUser?.id) {
        showToast('Bạn không thể tự chặn chính mình!', 'warning');
        return;
    }
    
    try {
      const newStatus = targetUser.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
      await userService.updateStatus(targetUser.id, newStatus);
      showToast(`Đã ${newStatus === 'BANNED' ? 'chặn' : 'kích hoạt'} tài khoản @${targetUser.username}`, 'success');
      fetchUsers();
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi cập nhật trạng thái người dùng.', 'danger');
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
      <style>{gridStyles}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Quản lý Nhân sự</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Quản trị viên có thể điều phối tài khoản và phân quyền hệ thống</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline animate-slide-up" onClick={() => setShowBulkModal(true)} style={{ padding: '0.8rem 1.5rem', borderColor: 'var(--primary)', color: 'var(--primary)', fontWeight: '800', fontFamily: "'Inter', sans-serif" }}>
            <LayoutGrid size={18} />
            Chế độ Bảng tính
          </button>
          <button className="btn btn-primary animate-slide-up" onClick={() => setShowAddModal(true)} style={{ padding: '0.8rem 1.5rem' }}>
            <UserPlus size={18} />
            Tạo tài khoản mới
          </button>
        </div>
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
                          color: 'var(--text-secondary)',
                          overflow: 'hidden'
                        }}>
                          {getRoleIcon(u.roleCode)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p 
                            style={{ fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' }}
                            onClick={() => handleShowMemberInfo(u.id)}
                            className="hover-text-primary"
                          >
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
                        <div style={{ 
                            width: '8px', height: '8px', borderRadius: '50%', 
                            background: u.status === 'ACTIVE' ? 'var(--success)' : 
                                       u.status === 'BANNED' ? 'var(--danger)' : 
                                       u.status === 'PENDING' ? 'var(--warning)' : 'var(--text-muted)' 
                        }}></div>
                        <span style={{ 
                            fontSize: '0.85rem', fontWeight: '600', 
                            color: u.status === 'ACTIVE' ? 'var(--text-primary)' : 
                                   u.status === 'BANNED' ? 'var(--danger)' : 
                                   u.status === 'PENDING' ? 'var(--warning)' : 'var(--text-muted)'
                        }}>
                            {u.status === 'ACTIVE' ? 'Đang hoạt động' : 
                             u.status === 'BANNED' ? 'Bị chặn' : 
                             u.status === 'PENDING' ? 'Đang chờ' : 'Ngưng hoạt động'}
                        </span>
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
                              status: u.status || 'ACTIVE',
                              password: '',
                              confirmPassword: ''
                            });
                            setShowAddModal(true);
                          }}
                          className="btn btn-outline" style={{ padding: '0.6rem' }} title="Chỉnh sửa">
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`btn btn-outline ${currentUser?.id === u.id ? 'disabled' : ''}`}
                          style={{ 
                            padding: '0.6rem', 
                            color: u.status === 'ACTIVE' ? 'var(--warning)' : 'var(--success)',
                            opacity: currentUser?.id === u.id ? 0.3 : 1 
                          }}
                          disabled={currentUser?.id === u.id}
                          title={u.status === 'ACTIVE' ? "Chặn tài khoản" : "Bỏ chặn tài khoản"}
                        >
                          {u.status === 'ACTIVE' ? <Lock size={16} /> : <Unlock size={16} />}
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

      {/* Bulk Import Grid Modal */}
      {showBulkModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
          <div className="glass-card animate-scale-in" style={{ width: '95%', maxWidth: '1100px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontFamily: "'Inter', sans-serif" }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.02em' }}>Chế độ Nhập liệu Bảng tính</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Điền thông tin trực tiếp vào bảng bên dưới để tạo tài khoản hàng loạt</p>
              </div>
              <button onClick={() => setShowBulkModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '0', flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
              <table style={{ width: '100%', borderCollapse: 'collapse', borderSpacing: 0 }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#0f0f13', boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: '800', width: '25%' }}>Họ và tên</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: '800', width: '20%' }}>Username</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: '800', width: '25%' }}>Email (Khớp GitHub)</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: '800', width: '15%' }}>Vai trò</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: '800', width: '10%' }}>Mật khẩu</th>
                    <th style={{ width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {gridData.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--glass-border)' }} className="grid-row">
                      <td style={{ padding: '0.5rem' }}>
                        <input 
                          className="input-field grid-input" 
                          style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem', background: 'transparent', border: 'none' }}
                          value={row.fullName}
                          onChange={(e) => updateGridCell(idx, 'fullName', e.target.value)}
                          placeholder="Nguyễn Văn A..."
                        />
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        <input 
                          className="input-field grid-input" 
                          style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem', background: 'transparent', border: 'none', color: 'var(--accent)' }}
                          value={row.username}
                          onChange={(e) => updateGridCell(idx, 'username', e.target.value)}
                          placeholder="nva_sv"
                        />
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        <input 
                          className="input-field grid-input" 
                          style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem', background: 'transparent', border: 'none', color: 'var(--success)' }}
                          value={row.email}
                          onChange={(e) => updateGridCell(idx, 'email', e.target.value)}
                          placeholder="email@github.com"
                        />
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        <select 
                          className="input-field grid-input" 
                          style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem', background: 'transparent', border: 'none' }}
                          value={row.roleCode}
                          onChange={(e) => updateGridCell(idx, 'roleCode', e.target.value)}
                        >
                          <option value="STUDENT">STUDENT</option>
                          <option value="TEACHER">TEACHER</option>
                        </select>
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        <input 
                          className="input-field grid-input" 
                          style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                          value={row.password}
                          onChange={(e) => updateGridCell(idx, 'password', e.target.value)}
                          type="text"
                        />
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        <button 
                          onClick={() => removeGridRow(idx)}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.5 }}
                          title="Xóa dòng"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                 <button onClick={addGridRow} className="btn btn-outline" style={{ borderStyle: 'dashed', width: '200px' }}>
                    + Thêm dòng mới
                 </button>
              </div>
            </div>

            <div style={{ padding: '1.5rem 2rem', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <strong>Lưu ý:</strong> Hệ thống sẽ tự động bỏ qua các dòng để trống cả tên và email.
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-outline" onClick={() => setShowBulkModal(false)} style={{ padding: '0.6rem 1.5rem' }}>Hủy bỏ</button>
                <button 
                  className="btn btn-primary" 
                  onClick={async () => {
                    const validData = gridData.filter(d => d.fullName.trim() && d.email.trim());
                    if (validData.length === 0) {
                      showToast('Vui lòng nhập ít nhất một tài khoản hợp lệ!', 'warning');
                      return;
                    }
                    try {
                      await userService.bulkCreate(validData);
                      showToast(`Đã tạo thành công ${validData.length} tài khoản!`);
                      setShowBulkModal(false);
                      setGridData([
                        { fullName: '', username: '', email: '', roleCode: 'STUDENT', password: '123456' },
                        { fullName: '', username: '', email: '', roleCode: 'STUDENT', password: '123456' },
                        { fullName: '', username: '', email: '', roleCode: 'STUDENT', password: '123456' },
                        { fullName: '', username: '', email: '', roleCode: 'STUDENT', password: '123456' },
                        { fullName: '', username: '', email: '', roleCode: 'STUDENT', password: '123456' },
                      ]);
                      fetchUsers();
                    } catch (err) {
                      showToast(err.response?.data?.message || 'Có lỗi khi tạo tài khoản hàng loạt.', 'danger');
                    }
                  }}
                  style={{ padding: '0.6rem 2rem', fontWeight: '800' }}
                >
                  Xác nhận Tạo {gridData.filter(d => d.fullName.trim() && d.email.trim()).length} tài khoản
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <label className="input-label">Trạng thái tài khoản</label>
                <select
                  className="input-field"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="ACTIVE">Đang hoạt động (ACTIVE)</option>
                  <option value="INACTIVE">Ngưng hoạt động (INACTIVE)</option>
                  <option value="BANNED">Bị chặn / Khóa (BANNED)</option>
                  <option value="PENDING">Đang chờ (PENDING)</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Địa chỉ Email</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: '800' }}>QUAN TRỌNG ĐỂ KHỚP GITHUB</span>
                </label>
                <input
                  type="email"
                  className="input-field"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Nhập email sinh viên dùng trên GitHub..."
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

      {/* Member Detail Modal - UNIFIED PREMIUM DESIGN */}
      {showProfileModal && (
        <div 
          onClick={(e) => { if(e.target === e.currentTarget) setShowProfileModal(false); }}
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(5, 5, 10, 0.85)', backdropFilter: 'blur(20px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div className="glass-card animate-scale-in custom-scrollbar" style={{ 
            width: '95%', 
            maxWidth: '800px', 
            maxHeight: '90vh', 
            padding: 0, 
            overflowY: 'auto', 
            position: 'relative', 
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            background: 'rgba(20, 20, 25, 0.9)',
            display: 'block'
          }}>
            
            {/* Close Button Overlay */}
            <button 
              onClick={() => setShowProfileModal(false)} 
              style={{ 
                position: 'absolute', 
                top: '1rem', 
                right: '1rem', 
                background: 'rgba(0, 0, 0, 0.5)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                color: 'white', 
                cursor: 'pointer', 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              &times;
            </button>

            {/* Premium Header */}
            <div style={{ 
              height: '140px', 
              background: 'linear-gradient(135deg, #0062ff 0%, #00a2ff 50%, #00d2ff 100%)', 
              position: 'relative'
            }}>
              <div style={{ position: 'absolute', bottom: '-40px', left: '2rem', display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                <div style={{ 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '24px', 
                  background: '#0f0f13', 
                  border: '4px solid #141419', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'var(--primary)', 
                  boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                }}>
                  <User size={50} />
                </div>
              </div>
            </div>

            <div style={{ padding: '50px 2rem 2rem 2rem' }}>
              {memberLoading ? (
                <div style={{ padding: '4rem', textAlign: 'center' }}>
                   <div className="animate-spin" style={{ width: '30px', height: '30px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 1rem' }}></div>
                   <p style={{ color: 'var(--text-muted)' }}>Đang truy xuất dữ liệu hồ sơ...</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '900', letterSpacing: '-0.03em', color: '#fff' }}>
                          {selectedMember?.fullName}
                        </h2>
                        <span style={{ 
                          padding: '3px 10px', 
                          background: selectedMember?.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.1)' : 
                                     selectedMember?.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                          color: selectedMember?.status === 'ACTIVE' ? '#4ade80' : 
                                 selectedMember?.status === 'PENDING' ? '#fbbf24' : '#f87171', 
                          borderRadius: '100px', 
                          fontSize: '0.65rem', 
                          fontWeight: '800', 
                          textTransform: 'uppercase',
                          border: `1px solid ${selectedMember?.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.2)' : 
                                               selectedMember?.status === 'PENDING' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                        }}>
                          {selectedMember?.status === 'ACTIVE' ? 'Đang hoạt động' : 
                           selectedMember?.status === 'BANNED' ? 'Bị chặn' : 
                           selectedMember?.status === 'INACTIVE' ? 'Ngưng hoạt động' : 
                           selectedMember?.status === 'PENDING' ? 'Đang chờ' : 'Không xác định'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><ShieldCheck size={14} color="var(--accent)" /> {selectedMember?.roleCode}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Mail size={14} color="var(--primary)" /> {selectedMember?.email}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {/* Left: Contact Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <section>
                        <h4 style={{ fontSize: '0.7rem', fontWeight: '800', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '15px', height: '1px', background: 'currentColor' }}></div>
                          Thông tin chi tiết
                        </h4>
                        
                        <div style={{ display: 'grid', gap: '1rem' }}>
                          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Phone size={18} color="#c084fc" />
                            <div>
                              <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700' }}>SỐ ĐIỆN THOẠI</p>
                              <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#e2e8f0' }}>{selectedMember?.phoneNumber || 'N/A'}</p>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1, padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                               <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700' }}>GIỚI TÍNH</p>
                               <p style={{ fontSize: '0.9rem', fontWeight: '700' }}>{selectedMember?.gender || 'N/A'}</p>
                            </div>
                            <div style={{ flex: 1, padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                               <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700' }}>THAM GIA</p>
                               <p style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                                 {selectedMember?.createdAt ? new Date(selectedMember.createdAt).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }) : '12/2024'}
                               </p>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>

                    {/* Right: Contributions (Hide for Teachers/Admins) */}
                    {selectedMember?.roleCode !== 'TEACHER' && selectedMember?.roleCode !== 'ADMIN' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <section>
                          <h4 style={{ fontSize: '0.7rem', fontWeight: '800', color: '#00a2ff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '15px', height: '1px', background: 'currentColor' }}></div>
                            Đóng góp dự án
                          </h4>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '1rem', background: 'rgba(0, 122, 255, 0.1)', borderRadius: '16px', border: '1px solid rgba(0, 122, 255, 0.2)', textAlign: 'center' }}>
                              <p style={{ fontSize: '1.5rem', fontWeight: '900', color: '#007AFF', margin: 0 }}>{memberHistory.filter(h => h.type === 'TASK').length}</p>
                              <p style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)' }}>TASKS</p>
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(90, 200, 250, 0.1)', borderRadius: '16px', border: '1px solid rgba(90, 200, 250, 0.2)', textAlign: 'center' }}>
                              <p style={{ fontSize: '1.5rem', fontWeight: '900', color: '#5AC8FA', margin: 0 }}>{memberHistory.filter(h => h.type === 'COMMIT').length}</p>
                              <p style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)' }}>COMMITS</p>
                            </div>
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.01)', borderRadius: '16px', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '0.75rem' }}>Hoạt động mới nhất</p>
                            <div style={{ maxHeight: '120px', overflowY: 'auto' }} className="custom-scrollbar">
                              {memberHistory.length > 0 ? (
                                memberHistory.slice(0, 3).map((h, i) => (
                                  <div key={i} style={{ padding: '0.5rem 0', borderBottom: i === 2 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                                    <p style={{ fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '2px' }}>{h.description}</p>
                                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{new Date(h.timestamp).toLocaleDateString()}</p>
                                  </div>
                                ))
                              ) : <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chưa có dữ liệu.</p>}
                            </div>
                          </div>
                        </section>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                         <ShieldCheck size={48} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                         <h4 style={{ color: 'white', fontWeight: '700', marginBottom: '0.5rem' }}>Hồ sơ Nhân sự</h4>
                         <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tài khoản này thuộc quyền quản lý/giảng dạy, không tham gia trực tiếp vào việc thực hiện dự án.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            
            <div style={{ padding: '1.5rem 2rem', background: 'rgba(15, 15, 20, 0.6)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end' }}>
               <button onClick={() => setShowProfileModal(false)} className="btn btn-outline" style={{ padding: '0.6rem 2rem' }}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .table-row-hover:hover {
          background: rgba(255,255,255,0.02);
        }
        .hover-text-primary:hover {
          color: var(--primary) !important;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default AdminUsers;
