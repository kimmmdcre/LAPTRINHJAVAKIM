import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import { useUI } from '../context/UIContext';
import { User, Mail, Award, CheckCircle, TrendingUp, GitCommit, Settings, Target, Eye, EyeOff, X } from 'lucide-react';

const PersonalProfile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ 
    tasksDone: 0, 
    onTimeRate: 0, 
    totalCommits: 0, 
    points: 0 
  });
  const [loading, setLoading] = useState(true);

  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    hoTen: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const { showToast } = useUI();

  useEffect(() => {
    // Simulated fetching of personal advanced stats
    setTimeout(() => {
      setStats({
        tasksDone: 42,
        onTimeRate: 95,
        totalCommits: 156,
        points: 4850
      });
      setLoading(false);
    }, 1000);
  }, [user]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
    </div>
  );

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      showToast('Mật khẩu và Xác nhận mật khẩu không khớp!', 'danger');
      return;
    }
    try {
      // eslint-disable-next-line no-unused-vars
      const { confirmPassword, ...submitData } = formData;
      submitData.maVaiTro = user.role; // Giữ nguyên vai trò hiện tại
      await userService.update(user.id, submitData);
      showToast('Cập nhật thành công! Hệ thống sẽ tự tải lại để cập nhật thông tin.', 'success');
      setShowEditModal(false);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi cập nhật thông tin', 'danger');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Hồ sơ Năng lực (Personal Profile)</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Quản lý thông tin cá nhân và xem các chỉ số đánh giá (KPI).</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
        {/* Left: Profile Card */}
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', height: 'fit-content' }}>
          <div style={{ 
            width: '120px', height: '120px', borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)'
          }}>
            <span style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white' }}>
              {user?.hoTen ? user.hoTen.charAt(0) : 'U'}
            </span>
          </div>
          
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{user?.hoTen}</h3>
          <span style={{ 
            display: 'inline-block', padding: '0.25rem 1rem', borderRadius: '20px', 
            background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)',
            fontSize: '0.875rem', fontWeight: '600', marginBottom: '1.5rem'
          }}>
            {user?.role}
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
              <User size={18} />
              <span>{user?.username}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
              <Mail size={18} />
              <span>{user?.email || 'Chưa cập nhật email'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
              <Target size={18} />
              <span>Nhóm: Nhóm 1 (K70)</span>
            </div>
          </div>

          <button 
            className="btn btn-outline" 
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => {
              setFormData({
                username: user?.username || '',
                hoTen: user?.hoTen || '',
                email: user?.email || '',
                password: '',
                confirmPassword: ''
              });
              setShowEditModal(true);
            }}
          >
            <Settings size={18} />
            Cập nhật thông tin
          </button>
        </div>

        {/* Right: KPIs and Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* KPI Widgets */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ padding: '1.25rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '16px', color: 'var(--success)' }}>
                <CheckCircle size={32} />
              </div>
              <div>
                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Task đã hoàn thành</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.tasksDone}</h3>
                  <span style={{ fontSize: '0.875rem', color: 'var(--success)' }}>+5 tuần này</span>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ padding: '1.25rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '16px', color: 'var(--primary)' }}>
                <TrendingUp size={32} />
              </div>
              <div>
                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Tỷ lệ đúng hạn</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.onTimeRate}%</h3>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Khá tốt!</span>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ padding: '1.25rem', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '16px', color: 'var(--accent)' }}>
                <GitCommit size={32} />
              </div>
              <div>
                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Tổng số Commits</p>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalCommits}</h3>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1 }}>
                <Award size={120} />
              </div>
              <div style={{ padding: '1.25rem', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '16px', color: 'var(--warning)', position: 'relative', zIndex: 1 }}>
                <Award size={32} />
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Điểm Tích lũy</p>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)' }}>{stats.points}</h3>
              </div>
            </div>
          </div>

          {/* Activity Timeline (Placeholder) */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Hoạt động gần đây</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '10px', bottom: '10px', left: '11px', width: '2px', background: 'var(--surface-border)' }}></div>
              {[
                { action: 'Đã hoàn thành task', detail: 'Thiết kế giao diện Dashboard', time: 'Hôm nay' },
                { action: 'Đã commit code', detail: 'feat: add KPIs to PersonalProfile', time: 'Hôm qua' },
                { action: 'Đã nhận task mới', detail: 'Tối ưu hoá API tải báo cáo', time: '3 ngày trước' },
              ].map((activity, i) => (
                <div key={i} style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--surface)', border: '2px solid var(--primary)', marginTop: '2px' }}></div>
                  <div>
                    <p style={{ fontWeight: '500' }}>{activity.action} <span style={{ color: 'var(--primary)' }}>{activity.detail}</span></p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card animate-scale-in" style={{ width: '500px', padding: '2rem', position: 'relative' }}>
            <button 
              onClick={() => setShowEditModal(false)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Cập nhật thông tin cá nhân</h3>
            
            <form onSubmit={handleUpdate}>
              <div className="input-group">
                <label className="input-label">Họ tên</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required
                  value={formData.hoTen}
                  onChange={e => setFormData({...formData, hoTen: e.target.value})}
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
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input 
                    type="email" 
                    className="input-field" 
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                <div className="input-group">
                  <label className="input-label">Mật khẩu (Bỏ trống nếu không đổi)</label>
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
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowEditModal(false)}>Huỷ</button>
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
