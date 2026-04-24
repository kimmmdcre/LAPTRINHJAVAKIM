import React, { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  AlertCircle, 
  ExternalLink, 
  Calendar, 
  Search, 
  GitBranch,
  Filter,
  CheckCircle,
  LayoutGrid,
  Zap,
  Activity,
  Info
} from 'lucide-react';

const MemberTasks = () => {
  const { user } = useAuth();
  const { showToast } = useUI();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await taskService.getMine(user.id);
      setTasks(res.data);
    } catch (err) {
      console.error('Lỗi tải nhiệm vụ:', err);
      showToast('Không thể kết nối danh sách nhiệm vụ.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [user.id, showToast]);

  useEffect(() => {
    if (user?.id) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  const updateStatus = async (taskId, newStatus) => {
    try {
      showToast('Đang cập nhật trạng thái...', 'info');
      await taskService.updateStatus(taskId, newStatus);
      showToast('Nhiệm vụ đã được cập nhật thành công!');
      fetchTasks();
    } catch (err) {
      console.error(err);
      showToast('Cập nhật trạng thái thất bại.', 'danger');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'DONE': return { bg: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', label: 'Hoàn thành', icon: CheckCircle };
      case 'IN_PROGRESS': return { bg: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', label: 'Đang thực hiện', icon: Activity };
      case 'TODO': return { bg: 'rgba(234, 179, 8, 0.1)', color: 'var(--warning)', label: 'Chưa làm', icon: Clock };
      default: return { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', label: 'N/A', icon: Info };
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesFilter = filter === 'ALL' || t.trangThai === filter;
    const matchesSearch = t.tieuDe?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.idYeuCau?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading && tasks.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '1rem' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      <p style={{ color: 'var(--text-secondary)' }}>Đang đồng bộ nhiệm vụ từ Jira Cloud...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Nhiệm vụ Cá nhân</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Toàn bộ công việc được đồng bộ thời gian thực từ <strong>Jira Cloud</strong>
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
           <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} size={16} />
              <input 
                type="text" 
                placeholder="Tìm mã Jira hoặc tên Task..." 
                className="input-field"
                style={{ paddingLeft: '36px', minWidth: '280px', margin: 0 }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
           </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', width: 'fit-content', border: '1px solid var(--glass-border)' }}>
        {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            style={{ 
              padding: '0.6rem 1.25rem', 
              borderRadius: '8px', 
              fontSize: '0.8rem', 
              fontWeight: '700',
              cursor: 'pointer', 
              border: 'none', 
              transition: 'all 0.3s ease', 
              background: filter === f ? 'var(--primary)' : 'transparent', 
              color: filter === f ? 'white' : 'var(--text-secondary)' 
            }}
          >
            {f === 'ALL' ? 'Tất cả' : f === 'TODO' ? 'Cần làm' : f === 'IN_PROGRESS' ? 'Đang làm' : 'Hoàn thành'}
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="glass-card" style={{ padding: '6rem', textAlign: 'center', borderStyle: 'dashed' }}>
          <CheckCircle2 size={64} style={{ margin: '0 auto 1.5rem', color: 'var(--success)', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>Tuyệt vời! Bạn đã bắt kịp mọi thứ</h3>
          <p style={{ color: 'var(--text-muted)' }}>Không có nhiệm vụ nào khớp với bộ lọc hiện tại của bạn.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredTasks.map(task => {
            const style = getStatusStyle(task.trangThai);
            return (
              <div key={task.idNhiemVu} className="glass-card table-row-hover animate-slide-up" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '2rem', borderLeft: `5px solid ${style.color}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                      {task.idYeuCau}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>{task.tieuDe}</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: (task.commitCount || 0) > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                      <GitBranch size={14} />
                      <strong>{task.commitCount || 0}</strong> Commits được ghi nhận
                    </div>
                    {task.trangThai === 'DONE' && (task.commitCount || 0) === 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--danger)', fontWeight: '900', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                        <AlertCircle size={12} />
                        GHOST TASK
                      </div>
                    )}
                    {task.tenSinhVien && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                        Giao cho: <strong>{task.tenSinhVien}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ padding: '6px 14px', borderRadius: '20px', background: style.bg, color: style.color, fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase' }}>
                    {style.label}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {task.trangThai === 'TODO' && (
                      <button 
                        onClick={() => updateStatus(task.idNhiemVu, 'IN_PROGRESS')}
                        className="btn btn-outline" 
                        style={{ padding: '0.6rem', color: 'var(--primary)', borderRadius: '10px' }}
                        title="Bắt đầu thực hiện"
                      >
                        <PlayCircle size={20} />
                      </button>
                    )}
                    {task.trangThai === 'IN_PROGRESS' && (
                      <button 
                        onClick={() => updateStatus(task.idNhiemVu, 'DONE')}
                        className="btn btn-outline" 
                        style={{ padding: '0.6rem', color: 'var(--success)', borderRadius: '10px' }}
                        title="Hoàn thành nhiệm vụ"
                      >
                        <CheckCircle2 size={20} />
                      </button>
                    )}
                    <button className="btn btn-outline" style={{ padding: '0.6rem', borderRadius: '10px' }} title="Xem ID Jira">
                      <ExternalLink size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MemberTasks;
