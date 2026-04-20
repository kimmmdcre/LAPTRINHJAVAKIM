import React, { useState, useEffect } from 'react';
import { taskService } from '../services/api';
import { CheckCircle2, Clock, PlayCircle, AlertCircle, ExternalLink, Calendar, Search, GitBranch } from 'lucide-react';

const MemberTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await taskService.getMine();
      setTasks(res.data);
    } catch (err) {
      console.error('Lỗi tải nhiệm vụ:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (taskId, newStatus) => {
    try {
      await taskService.updateStatus(taskId, newStatus);
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert('Không thể cập nhật trạng thái.');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'DONE': return { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', label: 'Hoàn thành' };
      case 'IN_PROGRESS': return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', label: 'Đang làm' };
      default: return { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', label: 'Chưa làm' };
    }
  };

  const filteredTasks = filter === 'ALL' ? tasks : tasks.filter(t => t.trangThai === filter);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Nhiệm vụ của tôi</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Danh sách công việc được đồng bộ từ Jira</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '8px' }}>
          {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{ padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', border: 'none', transition: '0.2s', background: filter === f ? 'var(--primary)' : 'transparent', color: filter === f ? 'white' : 'var(--text-secondary)' }}
            >
              {f === 'ALL' ? 'Tất cả' : getStatusStyle(f).label}
            </button>
          ))}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
          <CheckCircle2 size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--success)', opacity: 0.5 }} />
          <h3>Tuyệt vời!</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Bạn không có nhiệm vụ nào cần xử lý lúc này.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredTasks.map(task => {
            const style = getStatusStyle(task.trangThai);
            return (
              <div key={task.idNhiemVu} className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: `4px solid ${style.color}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      {task.keyJira || 'JIRA-XXX'}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{task.tenNhiemVu}</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={14} />
                      {task.ngayHetHan || 'Chưa có hạn'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <AlertCircle size={14} />
                      Độ ưu tiên: Cao
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: task.commitCount > 0 ? 'var(--success)' : 'var(--text-secondary)' }}>
                      <GitBranch size={14} />
                      {task.commitCount} Commits
                    </div>
                    {task.trangThai === 'DONE' && task.commitCount === 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--danger)', fontWeight: 'bold' }}>
                        <AlertCircle size={14} />
                        GHOST TASK
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ padding: '0.5rem 1rem', borderRadius: '20px', background: style.bg, color: style.color, fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {style.label}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {task.trangThai !== 'DONE' && (
                      <button 
                        onClick={() => updateStatus(task.idNhiemVu, task.trangThai === 'TODO' ? 'IN_PROGRESS' : 'DONE')}
                        className="btn btn-outline" 
                        style={{ padding: '0.5rem', color: task.trangThai === 'TODO' ? 'var(--primary)' : 'var(--success)' }}
                      >
                        {task.trangThai === 'TODO' ? <PlayCircle size={18} /> : <CheckCircle2 size={18} />}
                      </button>
                    )}
                    <button className="btn btn-outline" style={{ padding: '0.5rem' }}>
                      <ExternalLink size={18} />
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
