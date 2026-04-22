import React, { useState, useEffect } from 'react';
import { taskService, groupService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
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

  useEffect(() => {
    if (user?.id) {
      initLeaderData();
    }
  }, [user]);

  const initLeaderData = async () => {
    try {
      setLoading(true);
      // Find the group where current user is leader
      const groupsRes = await groupService.getAll();
      const myGroup = groupsRes.data.find(g => g.idTruongNhom === user.id);
      
      if (myGroup) {
        setGroupId(myGroup.idNhom);
        await Promise.all([
          fetchTasks(myGroup.idNhom),
          fetchMembers(myGroup.idNhom)
        ]);
      } else {
        // If not a leader, maybe they are a teacher? 
        // For simplicity, let's assume this page is for the group the user belongs to.
        const memberGroup = groupsRes.data.find(g => 
          g.thanhViens?.some(m => m.idSinhVien === user.id)
        );
        if (memberGroup) {
          setGroupId(memberGroup.idNhom);
          await Promise.all([
            fetchTasks(memberGroup.idNhom),
            fetchMembers(memberGroup.idNhom)
          ]);
        }
      }
    } catch (err) {
      console.error('Lỗi khởi tạo dữ liệu nhóm:', err);
      showToast('Không thể tải thông tin nhóm.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (nhomId) => {
    try {
      const res = await taskService.getGroupTasks(nhomId);
      setTasks(res.data);
    } catch (err) {
      console.error('Lỗi tải nhiệm vụ:', err);
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

  const handleSyncJira = async () => {
    if (!groupId) return;
    try {
      setIsSyncing(true);
      showToast('Đang yêu cầu Jira Cloud đồng bộ dữ liệu...', 'info');
      await taskService.syncJira(groupId);
      showToast('Đồng bộ Jira thành công!');
      fetchTasks(groupId);
    } catch (err) {
      console.error(err);
      showToast('Lỗi đồng bộ từ Jira Cloud.', 'danger');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAssignMember = async (memberId) => {
    if (!selectedTask || !groupId) return;
    try {
      showToast('Đang thực hiện phân công...', 'info');
      await taskService.assignMember(selectedTask.idNhiemVu, memberId);
      showToast(`Đã gán nhiệm vụ ${selectedTask.keyJira} thành công!`);
      setShowAssignModal(false);
      fetchTasks(groupId);
    } catch (err) {
      console.error(err);
      showToast('Không thể phân công nhiệm vụ.', 'danger');
    }
  };

  if (loading && !groupId) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '1rem' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      <p style={{ color: 'var(--text-secondary)' }}>Đang xác thực quyền Trưởng nhóm...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Quản lý Nhiệm vụ Nhóm</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Điều phối yêu cầu từ <strong>Jira Cloud</strong> và kiểm soát chất lượng đóng góp code
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => fetchTasks(groupId)} disabled={isSyncing}>
            <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
            Làm mới
          </button>
          <button className="btn btn-primary" onClick={handleSyncJira} disabled={isSyncing}>
            <LayoutGrid size={18} />
            {isSyncing ? 'Đang kết nối...' : 'Đồng bộ Jira'}
          </button>
        </div>
      </div>

      {!groupId ? (
        <div className="glass-card" style={{ padding: '6rem', textAlign: 'center' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--warning)', opacity: 0.5 }} />
          <h3>Bạn chưa có quyền hành động tại đây</h3>
          <p style={{ color: 'var(--text-muted)' }}>Chỉ trưởng nhóm hoặc giảng viên mới có thể quản lý nhiệm vụ cho nhóm này.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', alignItems: 'flex-start' }}>
          {['TODO', 'IN_PROGRESS', 'DONE'].map(status => (
            <div key={status} className="glass-card" style={{ padding: '1.25rem', minHeight: '700px', background: 'rgba(15, 23, 42, 0.2)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: '900', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                  {status === 'TODO' ? 'CHƯA PHÂN CÔNG' : status === 'IN_PROGRESS' ? 'ĐANG THỰC HIỆN' : 'ĐÃ HOÀN THÀNH'}
                </h3>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', background: 'rgba(255,255,255,0.05)', padding: '2px 10px', borderRadius: '20px', color: 'var(--text-secondary)' }}>
                  {tasks.filter(t => t.trangThai === status).length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tasks.filter(t => t.trangThai === status).map(task => (
                  <div key={task.idNhiemVu} className="glass-card table-row-hover animate-slide-up" style={{ 
                    padding: '1.25rem', 
                    background: 'rgba(255,255,255,0.02)',
                    borderLeft: `4px solid ${status === 'DONE' ? 'var(--success)' : status === 'IN_PROGRESS' ? 'var(--primary)' : 'var(--warning)'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                       <span style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                         {task.keyJira}
                       </span>
                       <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                         <MoreHorizontal size={14} />
                       </button>
                    </div>
                    <p style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                      {task.tenNhiemVu}
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: task.soCommit > 0 ? 'var(--success)' : '' }}>
                          <GitBranch size={12} />
                          {task.soCommit || 0} Commits
                       </div>
                       {status === 'DONE' && (task.soCommit || 0) === 0 && (
                         <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--danger)', fontWeight: '900', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                            <AlertCircle size={12} />
                            GHOST
                         </div>
                       )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {task.idSinhVien ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                           <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                             {task.tenNguoiNhan?.[0] || '?'}
                           </div>
                           <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{task.tenNguoiNhan}</span>
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            setSelectedTask(task);
                            setShowAssignModal(true);
                          }}
                          className="btn-hover"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--glass-border)', borderRadius: '6px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600' }}
                        >
                          <UserPlus size={14} /> Phân công
                        </button>
                      )}
                      
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                         {status !== 'DONE' && (
                            <button className="btn-hover" style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }} title="Xem chi tiết Jira">
                               <ExternalLink size={16} />
                            </button>
                         )}
                         {task.idSinhVien && (
                            <button 
                              onClick={() => {
                                setSelectedTask(task);
                                setShowAssignModal(true);
                              }}
                              className="btn-hover"
                              style={{ background: 'none', border: 'none', color: 'var(--primary)' }} 
                              title="Thay đổi người nhận"
                            >
                               <RefreshCw size={16} />
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
      )}

      {/* Task Assignment Modal */}
      {showAssignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card animate-scale-in" style={{ width: '450px', padding: '2.5rem', position: 'relative', border: '1px solid var(--primary)' }}>
            <button onClick={() => setShowAssignModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem' }}>Phân công Nhiệm vụ</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Chọn thành viên sẽ chịu trách nhiệm cho: <br/>
              <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{selectedTask?.keyJira}: {selectedTask?.tenNhiemVu}</strong>
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {members.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                   <Users size={32} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
                   <p style={{ color: 'var(--text-muted)' }}>Chưa có thành viên nào trong nhóm.</p>
                </div>
              ) : (
                members.map(member => (
                  <div 
                    key={member.idSinhVien}
                    onClick={() => handleAssignMember(member.idSinhVien)}
                    className="table-row-hover"
                    style={{ 
                      padding: '1rem', 
                      borderRadius: '12px', 
                      background: 'rgba(255,255,255,0.03)', 
                      border: '1px solid var(--glass-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        {member.hoTen?.[0]}
                      </div>
                      <div>
                        <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{member.hoTen}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.maSv || 'SV-XXX'} • {member.lop || 'Java Advanced'}</p>
                      </div>
                    </div>
                    {selectedTask?.idSinhVien === member.idSinhVien ? (
                       <CheckCircle size={20} color="var(--success)" />
                    ) : (
                       <ArrowRight size={18} color="var(--text-muted)" />
                    )}
                  </div>
                ))
              )}
            </div>

            <button className="btn btn-outline" style={{ width: '100%', marginTop: '2rem', padding: '1rem' }} onClick={() => setShowAssignModal(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderTasks;
