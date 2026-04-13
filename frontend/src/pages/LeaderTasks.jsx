import React, { useState, useEffect } from 'react';
import { taskService, groupService } from '../services/api';
import { useUI } from '../context/UIContext';
import { Kanban, Filter, UserPlus, Calendar, MoreHorizontal, CheckCircle, RefreshCw, AlertCircle, X, Check, GitBranch } from 'lucide-react';

const LeaderTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const { showToast } = useUI();

  const groupId = localStorage.getItem('groupId') || 'd4c5b6a7-8901-2345-6789-0123456789ab';

  useEffect(() => {
    fetchTasks();
    fetchMembers(groupId); 
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await taskService.getGroupTasks(groupId);
      setTasks(res.data);
    } catch (err) {
      console.error('Lỗi tải nhiệm vụ:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (nhomId) => {
    try {
      const res = await groupService.getMembers(nhomId);
      setMembers(res.data);
    } catch (err) {
      console.error('Lỗi tải thành viên:', err);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await taskService.syncJira(groupId);
      showToast('Đã đồng bộ nhiệm vụ từ Jira.');
      fetchTasks();
    } catch (err) {
      console.error(err);
      showToast('Đồng bộ Jira thất bại.', 'danger');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAssignMember = async (memberId) => {
    try {
      if (!selectedTask) return;
      await taskService.assignMember(selectedTask.idNhiemVu, memberId);
      showToast(`Đã gán nhiệm vụ cho thành viên.`);
      setShowAssignModal(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi gán nhiệm vụ.', 'danger');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Bảng Nhiệm vụ Nhóm</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Điều phối yêu cầu từ Jira và phân công cho các thành viên</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={fetchTasks}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </button>
          <button className="btn btn-primary" onClick={handleSync} disabled={isSyncing}>
            <Kanban size={18} />
            {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ Jira'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {['TODO', 'IN_PROGRESS', 'DONE'].map(status => (
          <div key={status} className="glass-card" style={{ padding: '1rem', minHeight: '600px', background: 'rgba(15, 23, 42, 0.3)' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '1.5rem',
              padding: '0 0.5rem'
            }}>
              <h3 style={{ fontSize: '1.0rem', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                {status === 'TODO' ? 'CHƯA LÀM' : status === 'IN_PROGRESS' ? 'ĐANG LÀM' : 'HOÀN THÀNH'}
              </h3>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', background: 'var(--glass)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                {tasks.filter(t => t.trangThai === status).length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tasks.filter(t => t.trangThai === status).map(task => (
                <div key={task.idNhiemVu} className="glass-card" style={{ 
                  padding: '1.25rem', 
                  background: 'var(--surface)',
                  borderLeft: `4px solid ${status === 'DONE' ? 'var(--success)' : status === 'IN_PROGRESS' ? 'var(--warning)' : 'var(--text-secondary)'}`,
                  transition: 'transform 0.2s',
                  cursor: 'default'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'flex-start', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      {task.keyJira}
                    </span>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                  <p style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '1rem', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                    {task.tenNhiemVu}
                  </p>
                  
                  {/* Indicators for GitHub and Ghost Tasks */}
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    {task.commitCount > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '0.7rem', fontWeight: 'bold' }}>
                        <GitBranch size={12} />
                        {task.commitCount} Commits
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                        <GitBranch size={12} />
                        0 Commits
                      </div>
                    )}

                    {status === 'DONE' && task.commitCount === 0 && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        color: 'var(--danger)', 
                        fontSize: '0.7rem', 
                        fontWeight: 'bold',
                        background: 'rgba(239, 68, 68, 0.1)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        animation: 'pulse 2s infinite'
                      }}>
                        <AlertCircle size={12} />
                        GHOST TASK
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {task.idNguoiNhan ? (
                        <>
                          <div style={{ 
                            width: '24px', 
                            height: '24px', 
                            borderRadius: '50%', 
                            background: 'var(--accent)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            color: 'white'
                          }}>
                            {task.tenNguoiNhan[0]}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{task.tenNguoiNhan}</span>
                        </>
                      ) : (
                        <button 
                          onClick={() => {
                            setSelectedTask(task);
                            setShowAssignModal(true);
                          }}
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--surface-border)', borderRadius: '4px', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                        >
                          <UserPlus size={12} />
                          <span style={{ fontSize: '0.7rem' }}>Gán</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Task Assignment Modal */}
      {showAssignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card animate-scale-in" style={{ width: '400px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setShowAssignModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Gán nhiệm vụ</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Chọn thành viên phụ trách cho: <strong>{selectedTask?.keyJira}</strong>
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {members.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Không tìm thấy thành viên trong nhóm.</p>
              ) : (
                members.map(member => (
                  <div 
                    key={member.idSinhVien}
                    onClick={() => handleAssignMember(member.idSinhVien)}
                    style={{ 
                      padding: '0.75rem 1rem', 
                      borderRadius: '8px', 
                      background: 'rgba(255,255,255,0.03)', 
                      border: '1px solid var(--surface-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                      hover: { background: 'rgba(255,255,255,0.08)' }
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {member.hoTen[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{member.hoTen}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{member.maSv} - {member.lop}</div>
                      </div>
                    </div>
                    <Check size={16} style={{ color: 'var(--success)', opacity: 0.5 }} />
                  </div>
                ))
              )}
            </div>

            <button className="btn btn-outline" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => setShowAssignModal(false)}>Huỷ bỏ</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderTasks;
