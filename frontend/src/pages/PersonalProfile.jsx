import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService, groupService, reportService, authService } from '../services/api';
import { useUI } from '../contexts/UIContext';
import { 
  User, 
  Mail, 
  Award, 
  CheckCircle, 
  TrendingUp, 
  GitCommit, 
  Settings, 
  Target, 
  Eye, 
  EyeOff, 
  X,
  LogOut,
  ShieldCheck,
  Zap,
  Calendar,
  LayoutGrid,
  Lock,
  Phone
} from 'lucide-react';

const PersonalProfile = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useUI();
  const [stats, setStats] = useState({ 
    tasksDone: 0, 
    totalCommits: 0, 
    points: 0,
    level: 'BEGINNER'
  });
  const [groupName, setGroupName] = useState('Chưa gia nhập nhóm');
  const [loading, setLoading] = useState(true);

  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const initProfileData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Initialize form data from current user
      if (user) {
        setFormData(prev => ({
          ...prev,
          fullName: user.fullName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          gender: user.gender || ''
        }));
      }

      if (user?.role === 'STUDENT') {
        const targetGroupId = user.groupId;
        if (targetGroupId) {
          try {
            const groupRes = await groupService.getDetails(targetGroupId);
            setGroupName(groupRes.data.groupName || 'Nhóm chưa có tên');
            
            const contribRes = await reportService.getContributions(targetGroupId);
            const myContrib = contribRes.data?.find(c => c.studentId === user.id);
            if (myContrib) {
              const xp = (myContrib.commitCount * 10) + (myContrib.completedTaskCount * 50);
              let lvl = 'BEGINNER';
              if (xp > 500) lvl = 'PRODIGY';
              if (xp > 1000) lvl = 'ELITE';
              if (xp > 2000) lvl = 'LEGEND';

              setStats({
                tasksDone: myContrib.completedTaskCount || 0,
                totalCommits: myContrib.commitCount || 0,
                points: xp,
                level: lvl
              });
            }
          } catch (e) {
            console.warn('Could not fetch detailed stats', e);
          }
        }
      } else {
        setGroupName(user?.role === 'ADMIN' ? 'Hệ thống Quản trị' : 'Giảng viên Phụ trách');
      }
    } catch (err) {
      console.error('Lỗi tải thông tin hồ sơ:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      initProfileData();
    }
  }, [user, initProfileData]);



  // Handle Escape key and click outside to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showEditModal) {
        setShowEditModal(false);
      }
    };

    if (showEditModal) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showEditModal]);

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    try {
      await userService.updateProfile({
        username: user.username,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender
      });
      
      // Update global context immediately
      updateUser({ 
        fullName: formData.fullName, 
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender
      });
      
      showToast('Cập nhật hồ sơ thành công!', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Lỗi cập nhật hồ sơ.', 'danger');
    }
  };

  const handleChangePassword = async (e) => {
    if (e) e.preventDefault();
    
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      return showToast('Vui lòng điền đầy đủ các trường mật khẩu!', 'warning');
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return showToast('Mật khẩu xác nhận không khớp!', 'warning');
    }

    if (formData.newPassword.length < 6) {
      return showToast('Mật khẩu mới phải có ít nhất 6 ký tự!', 'warning');
    }

    try {
      await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      showToast('Đổi mật khẩu thành công!', 'success');
      setShowEditModal(false);
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Mật khẩu hiện tại không chính xác.', 'danger');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '1rem' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      <p style={{ color: 'var(--text-secondary)' }}>Đang tải hồ sơ năng lực...</p>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ 
      padding: '4rem 2rem', 
      maxWidth: '1200px', 
      margin: '0 auto',
      minHeight: '100vh'
    }}>
      <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <h2 style={{ 
          fontSize: '3rem', 
          fontWeight: '800', 
          marginBottom: '1rem', 
          letterSpacing: '-0.025em', 
          background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: 'var(--font-main)'
        }}>
          Thiết lập Hồ sơ
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: '500', fontFamily: 'var(--font-main)' }}>
          Quản lý định danh và bảo mật tài khoản của bạn trên hệ thống
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '350px 1fr', 
        gap: '3rem', 
        alignItems: 'flex-start' 
      }}>
        
        {/* Left Side: Identity Card */}
        <div style={{ position: 'sticky', top: '2rem' }}>
          <div className="glass-card" style={{ 
            padding: '2.5rem', 
            textAlign: 'center', 
            border: '1px solid var(--primary)',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(0,0,0,0.4) 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Decoration */}
            <div style={{ 
              position: 'absolute', 
              top: '-50px', 
              right: '-50px', 
              width: '150px', 
              height: '150px', 
              background: 'var(--primary)', 
              filter: 'blur(100px)', 
              opacity: 0.15 
            }}></div>

            <div style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '24px', 
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
              margin: '0 auto 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)',
              transform: 'rotate(-5deg)'
            }}>
              <User size={48} color="white" />
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: 'white', fontFamily: 'var(--font-main)' }}>
              {formData.fullName || user?.username}
            </h3>
            
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '6px 16px', 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: '100px',
              border: '1px solid var(--glass-border)',
              marginBottom: '2rem'
            }}>
              <ShieldCheck size={14} color="var(--success)" />
              <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontFamily: 'var(--font-main)' }}>
                {user?.role?.replace('ROLE_', '') || 'MEMBER'}
              </span>
            </div>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', fontFamily: 'var(--font-main)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Trạng thái</span>
                <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }}></div>
                  Đang hoạt động
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Gia nhập</span>
                <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: '600' }}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }) : 'Tháng 5, 2024'}
                </span>
              </div>
            </div>
          </div>

          {/* Group Info Card */}
          <div className="glass-card" style={{ 
            marginTop: '2rem',
            padding: '2rem', 
            border: '1px solid var(--glass-border)',
            background: 'rgba(255,255,255,0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem'
          }}>
            <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
              <LayoutGrid size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tổ chức / Nhóm</p>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'white' }}>{groupName}</h4>
            </div>
          </div>

        </div>

        {/* Right Side: Settings & Stats Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Stats Grid */}
          {user?.role === 'STUDENT' && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '1.5rem' 
            }}>
              {[
                { label: 'Nhiệm vụ', value: stats.tasksDone, icon: CheckCircle, color: '#10b981' },
                { label: 'Commits', value: stats.totalCommits, icon: GitCommit, color: '#6366f1' },
                { label: 'Điểm XP', value: stats.points, icon: Zap, color: '#f59e0b' },
                { label: 'Cấp độ', value: stats.level, icon: Award, color: '#ec4899' }
              ].map((item, idx) => (
                <div key={idx} className="glass-card" style={{ 
                  padding: '1.5rem', 
                  textAlign: 'center', 
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(255,255,255,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{ color: item.color, opacity: 0.8 }}>
                    <item.icon size={24} />
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'white', fontFamily: 'var(--font-main)' }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="glass-card" style={{ padding: '3rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontFamily: 'var(--font-main)' }}>
              <Settings size={22} color="var(--primary)" /> Thông tin cá nhân
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="input-group">
                <label className="input-label" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-main)' }}>
                  <User size={14} /> Họ và Tên của bạn <span style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>(Chỉ đọc)</span>
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.95rem', padding: '1.25rem', fontFamily: 'inherit', cursor: 'not-allowed', color: 'var(--text-muted)' }}
                  value={formData.fullName}
                  readOnly
                  placeholder="Nhập tên đầy đủ"
                />
              </div>

              <div className="input-group">
                <label className="input-label" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-main)' }}>
                  <Mail size={14} /> Địa chỉ Email liên hệ
                </label>
                <input 
                  type="email" 
                  className="input-field" 
                  style={{ background: 'rgba(255,255,255,0.02)', fontSize: '0.95rem', padding: '1.25rem', fontFamily: 'inherit' }}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="example@domain.com"
                />
              </div>

              <div className="input-group">
                <label className="input-label" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-main)' }}>
                  <Phone size={14} /> Số điện thoại liên hệ
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ background: 'rgba(255,255,255,0.02)', fontSize: '0.95rem', padding: '1.25rem', fontFamily: 'inherit' }}
                  value={formData.phoneNumber || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                    if (value.length <= 10) {
                      setFormData({...formData, phoneNumber: value});
                    }
                  }}
                  placeholder="0xxx xxx xxx"
                  maxLength={10}
                />
              </div>

              <div className="input-group">
                <label className="input-label" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-main)' }}>
                  <User size={14} /> Giới tính
                </label>
                <select 
                  className="input-field" 
                  style={{ background: 'rgba(255,255,255,0.02)', fontSize: '0.95rem', padding: '1.25rem', fontFamily: 'inherit', appearance: 'none' }}
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="" disabled style={{background: '#1a1a1a'}}>Chọn giới tính</option>
                  <option value="Nam" style={{background: '#1a1a1a'}}>Nam</option>
                  <option value="Nữ" style={{background: '#1a1a1a'}}>Nữ</option>
                  <option value="Khác" style={{background: '#1a1a1a'}}>Khác</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn" 
                onClick={handleUpdate}
                style={{ 
                  background: 'var(--primary)', 
                  color: 'white', 
                  padding: '1.1rem 3rem', 
                  borderRadius: '14px', 
                  fontWeight: '700', 
                  fontSize: '0.95rem',
                  boxShadow: '0 10px 30px var(--primary-glow)',
                  transition: 'all 0.3s',
                  fontFamily: 'inherit'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Lưu thay đổi hồ sơ
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '3rem', border: '1px dashed var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ padding: '12px', background: 'rgba(255, 159, 10, 0.1)', borderRadius: '14px', color: 'var(--warning)' }}>
                  <Lock size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.25rem', fontFamily: 'var(--font-main)' }}>Mật khẩu & Bảo mật</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'var(--font-main)' }}>Thay đổi mật khẩu định kỳ để bảo vệ tài khoản</p>
                </div>
              </div>
              <button 
                className="btn btn-outline" 
                style={{ padding: '0.75rem 2rem', borderRadius: '12px', fontSize: '0.85rem', fontFamily: 'inherit' }}
                onClick={() => {
                  setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
                  setShowEditModal(true);
                }}
              >
                Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showEditModal && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
          onClick={() => setShowEditModal(false)}
        >
          <div 
            className="glass-card animate-slide-up" 
            style={{ 
              width: '100%',
              maxWidth: '480px', 
              padding: '3rem', 
              position: 'relative', 
              border: '1px solid var(--primary)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ width: '60px', height: '60px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Lock size={28} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-main)' }}>Xác thực bảo mật</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem', fontFamily: 'var(--font-main)' }}>Nhập mật khẩu mới cho tài khoản của bạn</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-main)' }}>
               <div className="input-group">
                  <label className="input-label" style={{ fontSize: '0.75rem' }}>Mật khẩu hiện tại</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showCurrentPass ? "text" : "password"} 
                      className="input-field" 
                      style={{ paddingRight: '45px', fontSize: '0.95rem', fontFamily: 'inherit' }}
                      value={formData.currentPassword} 
                      onChange={e => setFormData({...formData, currentPassword: e.target.value})} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
               </div>

               <div className="input-group">
                  <label className="input-label" style={{ fontSize: '0.75rem' }}>Mật khẩu mới</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showNewPass ? "text" : "password"} 
                      className="input-field" 
                      style={{ paddingRight: '45px', fontSize: '0.95rem', fontFamily: 'inherit' }}
                      value={formData.newPassword} 
                      onChange={e => setFormData({...formData, newPassword: e.target.value})} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowNewPass(!showNewPass)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
               </div>

               <div className="input-group">
                  <label className="input-label" style={{ fontSize: '0.75rem' }}>Xác nhận mật khẩu mới</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showConfirmPass ? "text" : "password"} 
                      className="input-field" 
                      style={{ paddingRight: '45px', fontSize: '0.95rem', fontFamily: 'inherit' }}
                      value={formData.confirmPassword} 
                      onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
               </div>

               <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-outline" style={{ flex: 1, borderRadius: '12px', fontSize: '0.85rem', fontFamily: 'inherit' }} onClick={() => setShowEditModal(false)}>Huỷ bỏ</button>
                  <button className="btn btn-primary" style={{ flex: 1, borderRadius: '12px', background: 'var(--primary)', border: 'none', fontSize: '0.85rem', fontFamily: 'inherit' }} onClick={handleChangePassword}>Cập nhật ngay</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalProfile;
