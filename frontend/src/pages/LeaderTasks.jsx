import React, { useState, useEffect, useCallback } from 'react';
import { taskService, groupService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { 
  Kanban, 
  Filter, 
  UserPlus, 
  Calendar, 
  MoreHorizontal, 
  CheckCircle, 
  RefreshCw, 
  AlertCircle, 
  X, 
  Check, 
  GitBranch,
  LayoutGrid,
  Zap,
  PlayCircle,
  ExternalLink,
  Users,
  ArrowRight
} from 'lucide-react';

const LeaderTasks = () => {
  const { user } = useAuth();
  const { showToast } = useUI();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [groupId, setGroupId] = useState(null);

  const fetchTasks = async (groupId) => {
    try {
      const res = await taskService.getByGroup(groupId);
      setTasks(res.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách nhiệm vụ:', err);
    }
  };

  const fetchMembers = async (groupId) => {
    try {
      const res = await groupService.getDetails(groupId);
      setMembers(res.data.members || []);
    } catch (err) {
      console.error('Lỗi tải danh sách thành viên:', err);
    }
  };

  const initLeaderData = useCallback(async () => {
    try {
      setLoading(true);
      const targetGroupId = user.groupId;
      if (!targetGroupId) {
        showToast('Bạn chưa được phân vào nhóm nào.', 'warning');
        setLoading(false);
        return;
      }
      setGroupId(targetGroupId);
      await Promise.all([
        fetchTasks(targetGroupId),
        fetchMembers(targetGroupId)
      ]);
    } catch (err) {
      console.error('Lỗi khởi tạo dữ liệu nhóm:', err);
      showToast('Không thể tải thông tin nhóm.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    if (user?.id) {
      initLeaderData();
    }
  }, [user, initLeaderData]);

  const handleSyncJira = async () => {
    if (!groupId) return;
    try {
      setIsSyncing(true);
      showToast('Đang kết nối tới Jira Cloud để đồng bộ...', 'info');
      await taskService.syncJira(groupId);
      await fetchTasks(groupId);
      showToast('Đồng bộ dữ liệu Jira thành công!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Lỗi đồng bộ Jira. Vui lòng kiểm tra lại cấu hình.', 'danger');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAssignTask = async (studentId) => {
    if (!selectedTask || !studentId) return;
    try {
      showToast('Đang thực hiện phân công...', 'info');
      await taskService.assign(selectedTask.taskId, studentId);
      await fetchTasks(groupId);
      setShowAssignModal(false);
      showToast('Đã phân công nhiệm vụ thành công!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Lỗi phân công nhiệm vụ.', 'danger');
    }
  };

  const renderTaskColumn = (status, title, color) => {
    const filteredTasks = tasks.filter(t => t.status === status);
    return (
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '600px', background: 'rgba(15, 23, 42, 0.3)' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }}></div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
            <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', color: 'var(--text-muted)' }}>{filteredTasks.length}</span>
          </div>
          <MoreHorizontal size={16} color="var(--text-muted)" />
        </div>
        
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
          {filteredTasks.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', border: '2px dashed var(--glass-border)', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Trống</p>
            </div>
          ) : filteredTasks.map(task => (
            <div key={task.taskId} className="task-card" style={{ 
              padding: '1.25rem', 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid var(--glass-border)', 
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>{task.jiraKey || 'JIRA'}</span>
                {task.commitCount > 0 && (
                   <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '0.7rem', fontWeight: 'bold' }}>
                      <GitBranch size={12} /> {task.commitCount}
                   </div>
                )}
              </div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '1rem', lineHeight: '1.5' }}>{task.taskName}</h4>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <div 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTask(task);
                    setShowAssignModal(true);
                  }}
                >
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: task.studentFullName ? 'var(--primary)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold' }}>
                    {task.studentFullName ? task.studentFullName.charAt(0) : <UserPlus size={12} />}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: task.studentFullName ? 'var(--text-secondary)' : 'var(--warning)', fontWeight: '600' }}>
                    {task.studentFullName || 'Chưa phân công'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '1rem' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      <p style={{ color: 'var(--text-secondary)' }}>Đang chuẩn bị bảng Kanban của nhóm...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Quản lý Nhiệm vụ Nhóm</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Đồng bộ hóa dữ liệu trực tiếp từ Jira Cloud</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => fetchTasks(groupId)}>
            <RefreshCw size={18} /> Làm mới
          </button>
          <button className="btn btn-primary" onClick={handleSyncJira} disabled={isSyncing}>
            {isSyncing ? <RefreshCw size={18} className="animate-spin" /> : <Kanban size={18} />}
            {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ từ Jira'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', alignItems: 'flex-start' }}>
        {renderTaskColumn('TODO', 'Việc cần làm', 'var(--text-muted)')}
        {renderTaskColumn('IN_PROGRESS', 'Đang thực hiện', 'var(--warning)')}
        {renderTaskColumn('DONE', 'Đã hoàn thành', 'var(--success)')}
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card animate-scale-up" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Phân công nhiệm vụ</h3>
               <button onClick={() => setShowAssignModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24}/></button>
            </div>
            
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
               <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Nhiệm vụ:</p>
               <p style={{ fontWeight: '700', lineHeight: '1.5' }}>{selectedTask?.taskName}</p>
            </div>

            <p style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Chọn thành viên đảm nhiệm:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
               {members.map(m => (
                 <div 
                  key={m.studentId}
                  onClick={() => handleAssignTask(m.studentId)}
                  className="table-row-hover"
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    cursor: 'pointer',
                    border: '1px solid var(--glass-border)',
                    background: selectedTask?.studentId === m.studentId ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                  }}
                 >
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                        {m.fullName.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{m.fullName}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.studentCode}</p>
                      </div>
                   </div>
                   {selectedTask?.studentId === m.studentId && <Check size={18} color="var(--success)" />}
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderTasks;
