import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { groupService, userService, taskService, reportService, configService } from '../services/api';
import {
  Layers,
  CheckSquare,
  Trophy,
  Users,
  Settings,
  ArrowRight,
  Activity,
  Zap,
  Clock,
  LayoutGrid,
  FileText,
  Database,
  GitCommit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGroups: 0,
    myGroups: [],
    studentTasks: { todo: 0, doing: 0, done: 0 },
    groupProgress: 0,
    topPerformers: []
  });

  const fetchConfigs = useCallback(async () => {
    if (user?.groupId) {
      try {
        const res = await configService.getConfig(user.groupId);
        setConfigs(res.data || []);
      } catch (err) {
        console.error('Lỗi tải cấu hình Dashboard:', err);
      }
    }
  }, [user?.groupId]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const role = user?.role ? user.role.replace('ROLE_', '').toUpperCase() : '';

      if (role === 'ADMIN') {
        const [usersRes, groupsRes] = await Promise.all([
          userService.getAll(),
          groupService.getAll()
        ]);
        
        const rawGroups = groupsRes.data || [];
        const top5 = rawGroups.slice(0, 5);
        
        // Fetch real progress for these groups
        const progressPromises = top5.map(g => 
          reportService.getProgress(g.groupId).catch(() => ({ data: { progressPercentage: 0 } }))
        );
        const progressResults = await Promise.all(progressPromises);

        setStats(prev => ({
          ...prev,
          totalUsers: usersRes.data.length,
          totalGroups: rawGroups.length,
          topPerformers: top5.map((g, i) => ({ 
            name: g.groupName, 
            progress: progressResults[i].data.progressPercentage || 0,
            jiraUrl: g.jiraUrl,
            githubUrl: g.githubUrl
          }))
        }));
      } else if (role === 'TEACHER') {
        const res = await groupService.getByTeacher(user.id);
        const myGroups = res.data || [];
        
        // Fetch real progress for each group
        const progressPromises = myGroups.map(g => 
          reportService.getProgress(g.groupId).catch(() => ({ data: { progressPercentage: 0 } }))
        );
        const progressResults = await Promise.all(progressPromises);

        const enrichedGroups = myGroups.map((g, i) => ({
          ...g,
          progress: progressResults[i].data.progressPercentage || 0
        }));

        setStats(prev => ({
          ...prev,
          totalGroups: enrichedGroups.length,
          myGroups: enrichedGroups
        }));
      } else if (role === 'STUDENT') {
        const myTasksRes = await taskService.getMine(user.id);
        
        if (user.groupId) {
          try {
            const [groupDetailsRes, progressRes] = await Promise.all([
              groupService.getDetails(user.groupId),
              reportService.getProgress(user.groupId)
            ]);
            
            setStats(prev => ({
              ...prev,
              myGroups: [groupDetailsRes.data],
              groupProgress: progressRes.data.progressPercentage || 0
            }));
          } catch (e) {
            console.error('Lỗi lấy thông tin nhóm:', e);
          }
        }

        const tasks = myTasksRes.data;
        setStats(prev => ({
          ...prev,
          studentTasks: {
            todo: tasks.filter(t => t.status === 'TODO').length,
            doing: tasks.filter(t => t.status === 'IN_PROGRESS').length,
            done: tasks.filter(t => t.status === 'DONE').length
          }
        }));
      }
    } catch (err) {
      console.error('Lỗi Dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchConfigs();
    }
  }, [user, fetchDashboardData, fetchConfigs]);

  const renderAdminWidgets = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
      <div 
        className="glass-card animate-scale-in" 
        onClick={() => navigate('/admin/users')}
        style={{ 
          padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer',
          border: '1px solid var(--glass-border)',
          transition: 'var(--transition)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--primary)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(10, 132, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--glass-border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={{ padding: '16px', background: 'rgba(10, 132, 255, 0.15)', color: 'var(--primary)', borderRadius: '18px', boxShadow: '0 8px 16px rgba(10, 132, 255, 0.1)' }}>
          <Users size={36} />
        </div>
        <div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '0.25rem' }}>Người dùng hệ thống</p>
          <h3 style={{ fontSize: '2.25rem', fontWeight: '900', letterSpacing: '-0.02em' }}>{stats.totalUsers}</h3>
        </div>
        <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.03 }}>
          <Users size={120} />
        </div>
      </div>

      <div 
        className="glass-card animate-scale-in" 
        onClick={() => navigate('/admin/groups')}
        style={{ 
          padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer',
          border: '1px solid var(--glass-border)',
          transition: 'var(--transition)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(94, 92, 230, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--glass-border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={{ padding: '16px', background: 'rgba(94, 92, 230, 0.15)', color: 'var(--accent)', borderRadius: '18px', boxShadow: '0 8px 16px rgba(94, 92, 230, 0.1)' }}>
          <LayoutGrid size={36} />
        </div>
        <div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '0.25rem' }}>Nhóm dự án</p>
          <h3 style={{ fontSize: '2.25rem', fontWeight: '900', letterSpacing: '-0.02em' }}>{stats.totalGroups}</h3>
        </div>
        <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.03 }}>
          <LayoutGrid size={120} />
        </div>
      </div>
    </div>
  );

  const renderLecturerWidgets = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
      <div 
        className="glass-card animate-scale-in" 
        onClick={() => navigate('/teacher/classes')}
        style={{ 
          padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer',
          border: '1px solid var(--glass-border)',
          transition: 'var(--transition)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--primary)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(10, 132, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--glass-border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={{ padding: '16px', background: 'rgba(10, 132, 255, 0.15)', color: 'var(--primary)', borderRadius: '18px' }}>
          <Trophy size={36} />
        </div>
        <div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '0.25rem' }}>Nhóm phụ trách</p>
          <h3 style={{ fontSize: '2.25rem', fontWeight: '900', letterSpacing: '-0.02em' }}>{stats.myGroups.length}</h3>
        </div>
      </div>

      <div 
        className="glass-card animate-scale-in" 
        onClick={() => navigate('/teacher/reports')}
        style={{ 
          padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer',
          border: '1px solid var(--glass-border)',
          transition: 'var(--transition)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--warning)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 159, 10, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--glass-border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={{ padding: '16px', background: 'rgba(255, 159, 10, 0.15)', color: 'var(--warning)', borderRadius: '18px' }}>
          <Zap size={36} />
        </div>
        <div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '0.25rem' }}>Cần đánh giá</p>
          <h3 style={{ fontSize: '2.25rem', fontWeight: '900', letterSpacing: '-0.02em' }}>
            {stats.myGroups.filter(g => (g.progress || 0) >= 80).length > 0 
              ? `${stats.myGroups.filter(g => (g.progress || 0) >= 80).length} Nhóm` 
              : 'Ổn định'}
          </h3>
        </div>
      </div>
    </div>
  );

  const renderStudentWidgets = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
      <div 
        className="glass-card animate-scale-in" 
        onClick={() => navigate('/member/tasks')}
        style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer', border: '1px solid var(--glass-border)', transition: 'var(--transition)' }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
      >
        <div style={{ padding: '14px', background: 'rgba(10, 132, 255, 0.15)', color: 'var(--primary)', borderRadius: '16px' }}>
          <Clock size={28} />
        </div>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Đang thực hiện</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '900' }}>{stats.studentTasks.doing}</h3>
        </div>
      </div>

      <div 
        className="glass-card animate-scale-in" 
        onClick={() => navigate('/member/tasks')}
        style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer', border: '1px solid var(--glass-border)', transition: 'var(--transition)' }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--success)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
      >
        <div style={{ padding: '14px', background: 'rgba(48, 209, 88, 0.15)', color: 'var(--success)', borderRadius: '16px' }}>
          <CheckSquare size={28} />
        </div>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Đã hoàn thành</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '900' }}>{stats.studentTasks.done}</h3>
        </div>
      </div>

      <div 
        className="glass-card animate-scale-in" 
        onClick={() => navigate('/project/sprint')}
        style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer', border: '1px solid var(--glass-border)', transition: 'var(--transition)' }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
      >
        <div style={{ padding: '14px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', borderRadius: '16px' }}>
          <Activity size={28} />
        </div>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Tiến độ Nhóm</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '900' }}>{stats.groupProgress}%</h3>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '1rem' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      <p style={{ color: 'var(--text-secondary)' }}>Đang tổng hợp thông tin cá nhân...</p>
    </div>
  );

  const role = user?.role ? user.role.replace('ROLE_', '').toUpperCase() : '';

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Chào {user?.fullName}! 🚀</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Bạn đang truy cập với vai trò <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{role}</span>. Dưới đây là tóm tắt hoạt động của bạn.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => navigate('/profile')}>
            Hồ sơ cá nhân
          </button>
        </div>
      </div>

      {role === 'ADMIN' && renderAdminWidgets()}
      {role === 'TEACHER' && renderLecturerWidgets()}
      {role === 'STUDENT' && renderStudentWidgets()}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Main Section */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Zap size={20} color="var(--warning)" />
              Hoạt động quan trọng
            </h3>
            <button 
              className="btn btn-outline" 
              style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
              onClick={() => navigate(role === 'STUDENT' ? '/member/tasks' : '/teacher/classes')}
            >
              Xem tất cả
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {role === 'ADMIN' && stats.topPerformers.map((g, i) => (
              <div key={i} className="table-row-hover" style={{ padding: '1rem', border: '1px solid var(--glass-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{i + 1}</div>
                  <div>
                    <p style={{ fontWeight: '700' }}>{g.name}</p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.6rem' }}>
                      {g?.jiraUrl && (
                        <a href={g.jiraUrl} target="_blank" rel="noreferrer" title="Mở Jira" style={{ display: 'flex', padding: '8px', background: 'rgba(0, 82, 204, 0.12)', borderRadius: '10px', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 82, 204, 0.25)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 82, 204, 0.12)'}>
                          <Database size={24} color="#0052CC" />
                        </a>
                      )}
                      {g?.githubUrl && (
                        <a href={g.githubUrl} target="_blank" rel="noreferrer" title="Mở GitHub" style={{ display: 'flex', padding: '8px', background: 'rgba(110, 84, 148, 0.12)', borderRadius: '10px', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(110, 84, 148, 0.25)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(110, 84, 148, 0.12)'}>
                          <GitCommit size={24} color="#6e5494" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: '800', color: 'var(--success)' }}>{g.progress}%</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tiến độ</p>
                </div>
              </div>
            ))}

            {role === 'TEACHER' && stats.myGroups.map((g, i) => (
              <div key={i} className="table-row-hover" style={{ padding: '1rem', border: '1px solid var(--glass-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} onClick={() => navigate(`/teacher/reports?groupId=${g.groupId}`)}>
                  <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '8px' }}><LayoutGrid size={20} /></div>
                  <div>
                    <p style={{ fontWeight: '700' }}>{g.groupName}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{g.projectTopic || 'Chưa cập nhật đề tài'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {g.jiraUrl && (
                      <a href={g.jiraUrl} target="_blank" rel="noreferrer" title="Mở Jira" style={{ padding: '12px', background: 'rgba(0, 82, 204, 0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 82, 204, 0.3)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 82, 204, 0.2)'}>
                        <Database size={28} color="#0052CC" />
                      </a>
                    )}
                    {g.githubUrl && (
                      <a href={g.githubUrl} target="_blank" rel="noreferrer" title="Mở GitHub" style={{ padding: '12px', background: 'rgba(110, 84, 148, 0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(110, 84, 148, 0.3)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(110, 84, 148, 0.2)'}>
                        <GitCommit size={28} color="#6e5494" />
                      </a>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }} onClick={() => navigate(`/teacher/reports?groupId=${g.groupId}`)}>
                    <p style={{ fontWeight: '800', color: 'var(--success)', fontSize: '1.1rem' }}>{g.progress}%</p>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Tiến độ</p>
                  </div>
                  <ArrowRight size={18} color="var(--text-muted)" onClick={() => navigate(`/teacher/reports?groupId=${g.groupId}`)} />
                </div>
              </div>
            ))}

            {role === 'STUDENT' && stats.studentTasks.doing > 0 && (
              <div className="table-row-hover" style={{ padding: '1.5rem', border: '1px solid rgba(0, 122, 255, 0.3)', borderRadius: '16px', display: 'flex', alignItems: 'center', background: 'rgba(0, 122, 255, 0.05)' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: '800', color: 'var(--primary)', marginBottom: '0.25rem' }}>Đang thực hiện nhiệm vụ</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Bạn có {stats.studentTasks.doing} nhiệm vụ chưa hoàn thành. Hãy tập trung xử lý nhé!</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/member/tasks')}>Vào Kanban</button>
              </div>
            )}

            {role === 'STUDENT' && stats.studentTasks.doing === 0 && (
              <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
                <CheckSquare size={40} color="var(--success)" style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>Bạn đã hoàn thành mọi nhiệm vụ hiện tại. Xuất sắc!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {configs.length > 0 && (
            <div className="glass-card animate-slide-up" style={{ padding: '1.5rem', border: '1px solid rgba(10, 132, 255, 0.2)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} color="var(--primary)" />
                Liên kết Tích hợp
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {configs.map(cfg => {
                  const isJira = cfg.platformType === 'JIRA';
                  const linkUrl = isJira ? cfg.url : cfg.repoUrl;
                  if (!linkUrl) return null;
                  
                  return (
                    <a 
                      key={cfg.configId}
                      href={linkUrl}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="table-row-hover"
                      style={{ 
                        padding: '1rem', 
                        borderRadius: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem',
                        textDecoration: 'none',
                        color: 'inherit',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(255,255,255,0.02)'
                      }}
                    >
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '8px', 
                        background: isJira ? 'rgba(0, 82, 204, 0.1)' : 'rgba(110, 84, 148, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {isJira ? <Database size={16} color="#0052CC" /> : <GitCommit size={16} color="#6e5494" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: '700', margin: 0 }}>{isJira ? 'Jira Cloud' : 'GitHub Repository'}</p>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0 }}>Truy cập ngay</p>
                      </div>
                      <ArrowRight size={14} color="var(--text-muted)" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          <div className="glass-card" style={{ padding: '1.5rem' }}>
             <h3 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '1rem' }}>Thông tin Nhóm</h3>
             {stats.myGroups.length > 0 ? (
               <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>{stats.myGroups[0].groupName}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{stats.myGroups[0].projectTopic || 'Chưa có đề tài'}</p>
               </div>
             ) : (
               <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bạn chưa thuộc nhóm nào.</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
