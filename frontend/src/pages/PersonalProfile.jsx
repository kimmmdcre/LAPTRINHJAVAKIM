import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService, groupService, reportService } from '../services/api';
import { useUI } from '../context/UIContext';
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
    onTimeRate: 0, 
    totalCommits: 0, 
    points: 0 
  });
  const [groupName, setGroupName] = useState('Chưa gia nhập nhóm');
  const [loading, setLoading] = useState(true);

  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    hoTen: '',
    email: '',
    currentPassword: '',
    newPassword: ''
  });

  const initProfileData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. Fetch group info if student
      if (user?.role === 'SINH_VIEN') {
        // Dùng idNhom từ login nếu có
        const targetNhomId = user.idNhom;
        if (targetNhomId) {
          try {
            const groupRes = await groupService.getDetails(targetNhomId);
            setGroupName(groupRes.data.tenNhom || 'Nhóm chưa có tên');
            
            // 2. Fetch real stats
            const contribRes = await reportService.getContributions(targetNhomId);
            const myContrib = contribRes.data?.find(c => c.idSinhVien === user.id);
            if (myContrib) {
              setStats({
                tasksDone: myContrib.soNhiemVuHoanThanh || 0,
                onTimeRate: 100,
                totalCommits: myContrib.soCommit || 0,
                points: (myContrib.soCommit * 10) + (myContrib.soNhiemVuHoanThanh * 50)
              });
            }
          } catch {
            console.warn('Could not fetch detailed stats');
          }
        } else {
          setGroupName('Chưa gia nhập nhóm');
        }
      } else {
        setGroupName('Hệ thống Quản trị / Giảng viên');
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
    try {
      const { currentPassword, newPassword, ...submitData } = formData;
      const updatePayload = { ...submitData };
      if (newPassword) {
        updatePayload.currentPassword = currentPassword;
        updatePayload.newPassword = newPassword;
      }
      await userService.update(user.id, updatePayload);
      showToast('Cập nhật hồ sơ thành công!', 'success');
      setShowEditModal(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error(err);
      showToast('Lỗi cập nhật. Vui lòng kiểm tra lại.', 'danger');
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
      {/* Premium Profile Header */}
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
        {/* Background Decorative Circles */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'var(--primary)', opacity: 0.1, filter: 'blur(50px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-50px', left: '10%', width: '150px', height: '150px', borderRadius: '50%', background: 'var(--accent)', opacity: 0.1, filter: 'blur(40px)' }}></div>

        <div style={{ position: 'relative' }}>
          <div style={{ 
            width: '140px', height: '140px', borderRadius: '40px', 
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)',
            transform: 'rotate(-5deg)'
          }}>
            <span style={{ fontSize: '4rem', fontWeight: '900', color: 'white', transform: 'rotate(5deg)' }}>
              {user?.hoTen?.[0]}
            </span>
          </div>
          <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', padding: '8px', background: 'var(--success)', borderRadius: '12px', color: 'white', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)' }}>
             <ShieldCheck size={20} />
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
             <h2 style={{ fontSize: '2.25rem', fontWeight: '900', letterSpacing: '-0.03em' }}>{user?.hoTen}</h2>
             <span style={{ padding: '0.25rem 1rem', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)' }}>
               ID: {user?.username}
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
             style={{ padding: '0.8rem 1.5rem' }}
             onClick={() => {
                setFormData({
                  hoTen: user.hoTen || '',
                  username: user.username || '',
                  email: user.email || '',
                  password: '',
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
        {/* KPI Section */}
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
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '800' }}>CẤP ĐỘ 5 - SENIOR</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Security & Settings Section */}
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
                          <p style={{ fontSize: '0.9rem', fontWeight: '700' }}>Xác thực 2 lớp</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bảo vệ tài khoản qua Email</p>
                       </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--success)' }}>ON</span>
                 </div>

                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                       <Calendar size={20} color="var(--primary)" />
                       <div>
                          <p style={{ fontSize: '0.9rem', fontWeight: '700' }}>Tham gia hệ thống</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>01/01/2024</p>
                       </div>
                    </div>
                 </div>
              </div>

              <button 
                 className="btn btn-outline" 
                 style={{ width: '100%', marginTop: '2rem', justifyContent: 'center' }}
                 onClick={() => setShowEditModal(true)}
              >
                 <Settings size={18} /> Thay đổi mật khẩu
              </button>
           </div>
        </div>
      </div>

      {/* Edit Modal Refined */}
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
                  <input type="text" className="input-field" value={formData.hoTen} onChange={e => setFormData({...formData, hoTen: e.target.value})} />
               </div>
               <div className="input-group">
                  <label className="input-label">Email công việc</label>
                  <input type="email" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
               </div>
               
               <div style={{ height: '1px', background: 'var(--glass-border)', margin: '0.5rem 0' }}></div>
               
               <div className="input-group">
                  <label className="input-label">Mật khẩu mới (Bỏ trống nếu không đổi)</label>
                  <div style={{ position: 'relative' }}>
                     <input 
                       type={showPassword ? 'text' : 'password'} 
                       className="input-field" 
                       value={formData.password} 
                       onChange={e => setFormData({...formData, password: e.target.value})} 
                       placeholder="••••••••"
                     />
                     <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)' }}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                     </button>
                  </div>
               </div>

               <div className="input-group">
                  <label className="input-label">Xác nhận mật khẩu</label>
                  <input type="password" className="input-field" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} placeholder="••••••••" />
               </div>

               <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowEditModal(false)}>Huỷ bỏ</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Cập nhật ngay</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalProfile;
