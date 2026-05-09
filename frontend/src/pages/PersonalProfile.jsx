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
  Lock
} from 'lucide-react';

const PersonalProfile = () => {
  const { user, logout } = useAuth();
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
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const initProfileData = useCallback(async () => {
    try {
      setLoading(true);
      
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      return showToast('Mật khẩu xác nhận không khớp!', 'warning');
    }

    try {
      // 1. Update Profile Info
      await userService.update(user.id, {
        fullName: formData.fullName,
        email: formData.email
      });

      // 2. Update Password if requested
      if (formData.newPassword) {
        await authService.changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        });
      }

      showToast('Cập nhật hồ sơ thành công!', 'success');
      setShowEditModal(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Lỗi cập nhật. Vui lòng kiểm tra mật khẩu hiện tại.', 'danger');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '1rem' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      <p style={{ color: 'var(--text-secondary)' }}>Đang tải hồ sơ năng lực...</p>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div className="glass-card" style={{ 
        position: 'relative', 
        overflow: 'hidden', 
        padding: '3rem', 
        marginBottom: '2rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '3rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))'
      }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'var(--primary)', opacity: 0.1, filter: 'blur(50px)' }}></div>
        
        <div style={{ position: 'relative' }}>
          <div style={{ 
            width: '140px', height: '140px', borderRadius: '40px', 
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)',
            transform: 'rotate(-5deg)'
          }}>
            <span style={{ fontSize: '4rem', fontWeight: '900', color: 'white', transform: 'rotate(5deg)' }}>
              {user?.fullName?.[0]}
            </span>
          </div>
          <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', padding: '8px', background: 'var(--success)', borderRadius: '12px', color: 'white' }}>
             <ShieldCheck size={20} />
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
             <h2 style={{ fontSize: '2.25rem', fontWeight: '900', letterSpacing: '-0.03em' }}>{user?.fullName}</h2>
             <span style={{ padding: '0.25rem 1rem', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)' }}>
                @{user?.username}
             </span>
          </div>
          <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} /> {user?.role?.replace('ROLE_', '')}
          </p>
          
          <div style={{ display: 'flex', gap: '2rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                <Mail size={18} />
                <span>{user?.email}</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                <Target size={18} />
                <span>{groupName}</span>
             </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
           <button 
             className="btn btn-primary" 
             onClick={() => {
                setFormData({
                  fullName: user.fullName || '',
                  email: user.email || '',
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                });
                setShowEditModal(true);
             }}
           >
              <Settings size={18} /> Thiết lập
           </button>
           <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={logout}>
              <LogOut size={18} /> Đăng xuất
           </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="glass-card" style={{ padding: '2rem' }}>
                 <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <CheckCircle size={24} />
                 </div>
                 <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.5rem' }}>Nhiệm vụ Hoàn thành</p>
                 <h3 style={{ fontSize: '2.5rem', fontWeight: '900' }}>{stats.tasksDone}</h3>
              </div>

              <div className="glass-card" style={{ padding: '2rem' }}>
                 <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <GitCommit size={24} />
                 </div>
                 <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.5rem' }}>Tổng số Commits</p>
                 <h3 style={{ fontSize: '2.5rem', fontWeight: '900' }}>{stats.totalCommits}</h3>
              </div>
           </div>

           <div className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(249, 115, 22, 0.1))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                 <div>
                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(234, 179, 8, 0.1)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                       <Zap size={24} fill="currentColor" />
                    </div>
                    <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '0.5rem' }}>Điểm Năng lực Tích lũy</p>
                    <h3 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--warning)' }}>{stats.points} XP</h3>
                 </div>
                 <div style={{ textAlign: 'right' }}>
                    <Award size={80} style={{ opacity: 0.1 }} />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '800' }}>CẤP ĐỘ - {stats.level}</p>
                 </div>
              </div>
           </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                 <Lock size={18} color="var(--primary)" /> Bảo mật & Tài khoản
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                       <ShieldCheck size={20} color="var(--success)" />
                       <div>
                          <p style={{ fontSize: '0.9rem', fontWeight: '700' }}>Trạng thái tài khoản</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Đã xác thực hệ thống</p>
                       </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--success)' }}>ACTIVE</span>
                 </div>

                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                       <Calendar size={20} color="var(--primary)" />
                       <div>
                          <p style={{ fontSize: '0.9rem', fontWeight: '700' }}>Niên khóa</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>2024 - 2026</p>
                       </div>
                    </div>
                 </div>
              </div>

              <button 
                 className="btn btn-outline" 
                 style={{ width: '100%', marginTop: '2rem', justifyContent: 'center' }}
                 onClick={() => setShowEditModal(true)}
              >
                 <Settings size={18} /> Cập nhật thông tin
              </button>
           </div>
        </div>
      </div>

      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card animate-scale-in" style={{ width: '500px', padding: '2.5rem', position: 'relative', border: '1px solid var(--primary)' }}>
            <button onClick={() => setShowEditModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
               <X size={24} />
            </button>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '1.5rem' }}>Cập nhật Hồ sơ</h3>
            
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
               <div className="input-group">
                  <label className="input-label">Họ và Tên</label>
                  <input type="text" className="input-field" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
               </div>
               <div className="input-group">
                  <label className="input-label">Email</label>
                  <input type="email" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
               </div>
               
               <div style={{ height: '1px', background: 'var(--glass-border)', margin: '0.5rem 0' }}></div>
               <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '-0.5rem' }}>ĐỔI MẬT KHẨU (Nếu cần)</p>
               
               <div className="input-group">
                  <label className="input-label">Mật khẩu hiện tại</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    value={formData.currentPassword} 
                    onChange={e => setFormData({...formData, currentPassword: e.target.value})} 
                    placeholder="Nhập mật khẩu hiện tại để xác nhận"
                  />
               </div>

               <div className="input-group">
                  <label className="input-label">Mật khẩu mới</label>
                  <div style={{ position: 'relative' }}>
                     <input 
                       type={showPassword ? 'text' : 'password'} 
                       className="input-field" 
                       value={formData.newPassword} 
                       onChange={e => setFormData({...formData, newPassword: e.target.value})} 
                       placeholder="Để trống nếu không đổi"
                     />
                     <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)' }}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                     </button>
                  </div>
               </div>

               <div className="input-group">
                  <label className="input-label">Xác nhận mật khẩu mới</label>
                  <input type="password" className="input-field" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
               </div>

               <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowEditModal(false)}>Huỷ bỏ</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Lưu thay đổi</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalProfile;
