import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { groupService, userService, taskService, reportService } from '../services/api';
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
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGroups: 0,
    myGroups: [],
    studentTasks: { todo: 0, doing: 0, done: 0 },
    groupProgress: 0,
    topPerformers: []
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const role = user.role?.toUpperCase();

      if (role === 'ADMIN') {
        const [usersRes, groupsRes] = await Promise.all([
          userService.getAll(),
          groupService.getAll()
        ]);
        setStats(prev => ({
          ...prev,
          totalUsers: usersRes.data.length,
          totalGroups: groupsRes.data.length,
          topPerformers: groupsRes.data.slice(0, 5).map(g => ({ 
            name: g.groupName, 
            progress: Math.floor(Math.random() * 40) + 60 
          }))
        }));
      } else if (role === 'GIANG_VIEN') {
        const res = await groupService.getByTeacher(user.id);
        const myGroups = res.data;
        setStats(prev => ({
          ...prev,
          totalGroups: myGroups.length,
          myGroups: myGroups
        }));
      } else if (role === 'SINH_VIEN') {
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
    }
  }, [user, fetchDashboardData]);

  const renderAdminWidgets = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '14px' }}>
          <Users size={32} />
        </div>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Người dùng hệ thống</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '800' }}>{stats.totalUsers}</h3>
        </div>
      </div>
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent)', borderRadius: '14px' }}>
          <LayoutGrid size={32} />
        </div>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Nhóm dự án</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '800' }}>{stats.totalGroups}</h3>
        </div>
      </div>
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ padding: '12px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', borderRadius: '14px' }}>
          <Activity size={32} />
        </div>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Tình trạng Hệ thống</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--success)' }}>Ổn định</h3>
        </div>
      </div>
    </div>
  );

  const renderLecturerWidgets = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '14px' }}>
          <Trophy size={32} />
        </div>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Nhóm phụ trách</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '800' }}>{stats.myGroups.length}</h3>
        </div>
      </div>
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ padding: '12px', background: 'rgba(234, 179, 8, 0.1)', color: 'var(--warning)', borderRadius: '14px' }}>
          <Zap size={32} />
        </div>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Cần đánh giá</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '800' }}>{stats.myGroups.some(g => (g.progress || 0) > 80) ? '2 nhóm' : 'Sẵn sàng'}</h3>
        </div>
      </div>
    </div>
  );

  const renderStudentWidgets = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '14px' }}>
          <Clock size={32} />
        </div>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Nhiệm vụ đang làm</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '800' }}>{stats.studentTasks.doing}</h3>
        </div>
      </div>
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ padding: '12px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', borderRadius: '14px' }}>
          <CheckSquare size={32} />
        </div>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Đã hoàn thành</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '800' }}>{stats.studentTasks.done}</h3>
        </div>
      </div>
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ padding: '12px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', borderRadius: '14px' }}>
          <Activity size={32} />
        </div>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Tiến độ Nhóm</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '800' }}>{stats.groupProgress}%</h3>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '1rem' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      <p style={{ color: 'var(--text-secondary)' }}>Đang tổng hợp thông tin cá nhân...</p>
    </div>
  );

  const role = user?.role?.toUpperCase();

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
      {role === 'GIANG_VIEN' && renderLecturerWidgets()}
      {role === 'SINH_VIEN' && renderStudentWidgets()}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Main Section */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Zap size={20} color="var(--warning)" />
              Hoạt động quan trọng
            </h3>
            <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>Xem tất cả</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {role === 'ADMIN' && stats.topPerformers.map((g, i) => (
              <div key={i} className="table-row-hover" style={{ padding: '1rem', border: '1px solid var(--glass-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{i + 1}</div>
                  <div>
                    <p style={{ fontWeight: '700' }}>{g.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cần đồng bộ dữ liệu Jira gần nhất</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: '800', color: 'var(--success)' }}>{g.progress}%</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tiến độ</p>
                </div>
              </div>
            ))}

            {role === 'GIANG_VIEN' && stats.myGroups.map((g, i) => (
              <div key={i} onClick={() => navigate(`/teacher/reports?groupId=${g.groupId}`)} className="table-row-hover" style={{ padding: '1rem', border: '1px solid var(--glass-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '8px' }}><LayoutGrid size={20} /></div>
                  <div>
                    <p style={{ fontWeight: '700' }}>{g.groupName}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{g.projectTopic || 'Chưa cập nhật đề tài'}</p>
                  </div>
                </div>
                <ArrowRight size={18} color="var(--text-muted)" />
              </div>
            ))}

            {role === 'SINH_VIEN' && stats.studentTasks.doing > 0 && (
              <div className="table-row-hover" style={{ padding: '1.5rem', border: '1px solid var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', background: 'rgba(99, 102, 241, 0.05)' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: '800', color: 'var(--primary)', marginBottom: '0.25rem' }}>Đang thực hiện nhiệm vụ</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Bạn có {stats.studentTasks.doing} nhiệm vụ chưa hoàn thành. Hãy tập trung xử lý nhé!</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/member/tasks')}>Vào Kanban</button>
              </div>
            )}

            {role === 'SINH_VIEN' && stats.studentTasks.doing === 0 && (
              <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
                <CheckSquare size={40} color="var(--success)" style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>Bạn đã hoàn thành mọi nhiệm vụ hiện tại. Xuất sắc!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.25rem' }}>Lối tắt nhanh</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {role === 'ADMIN' && (
                <>
                  <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => navigate('/admin/users')}>
                    <Users size={16} /> Quản lý Nhân sự
                  </button>
                  <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => navigate('/admin/groups')}>
                    <LayoutGrid size={16} /> Thiết lập Nhóm
                  </button>
                  <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => navigate('/admin/config')}>
                    <Settings size={16} /> Cấu hình Jira/Git
                  </button>
                </>
              )}
              {role === 'GIANG_VIEN' && (
                <>
                  <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => navigate('/teacher/classes')}>
                    <LayoutGrid size={16} /> Danh sách Nhóm
                  </button>
                  <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => navigate('/teacher/reports')}>
                    <Activity size={16} /> Phân tích Tiến độ
                  </button>
                </>
              )}
              {role === 'SINH_VIEN' && (
                <>
                  <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => navigate('/member/tasks')}>
                    <CheckSquare size={16} /> Nhiệm vụ Jira
                  </button>
                  <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => navigate('/member/commits')}>
                    <FileText size={16} /> Lịch sử Commits
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '0.75rem' }}>Thông báo mới</h4>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Hệ thống vừa cập nhật thuật toán Mapping Task-Commit tự động. Hãy kiểm tra lại báo cáo đóng góp của bạn.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
