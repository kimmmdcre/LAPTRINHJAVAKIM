import React, { useState, useEffect, useCallback } from 'react';
import { groupService, configService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { 
  Users, 
  Clock, 
  ArrowRight, 
  FolderKanban, 
  TrendingUp, 
  User, 
  CheckCircle, 
  AlertCircle,
  GitBranch,
  ChevronDown,
  ChevronUp,
  FileText,
  GitCommit,
  Activity,
  Crown,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { reportService, userService } from '../services/api';
import { 
  Phone, 
  Mail, 
  User as UserIcon, 
  MapPin, 
  ShieldCheck, 
  Calendar,
  Contact
} from 'lucide-react';

const TeacherClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroupId, setExpandedGroupId] = useState(null); 
  const [groupMembers, setGroupMembers] = useState({});
  const [groupStatus, setGroupStatus] = useState({});
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberHistory, setMemberHistory] = useState([]);
  const { user } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      const res = user?.role === 'ADMIN' 
        ? await groupService.getAll() 
        : await groupService.getByTeacher(user.id);
        
      const fetchedGroups = Array.isArray(res.data) ? res.data : [];
      setClasses(fetchedGroups);

      // Fetch status for each group
      if (fetchedGroups.length > 0) {
        const statuses = {};
        for (const g of fetchedGroups) {
          try {
            const confRes = await configService.getConfig(g.groupId);
            const configs = Array.isArray(confRes.data) ? confRes.data : [];
            statuses[g.groupId] = {
              hasJira: configs.some(c => c.platformType === 'JIRA' && c.url),
              hasGithub: configs.some(c => c.platformType === 'GITHUB' && c.repoUrl)
            };
          } catch {
            statuses[g.groupId] = { hasJira: false, hasGithub: false };
          }
        }
        setGroupStatus(statuses);
      }
    } catch (err) {
      console.error('Lỗi tải nhóm:', err);
      showToast('Không thể tải danh sách nhóm hướng dẫn.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [user?.id, showToast]);

  useEffect(() => {
    if (user?.id) {
      fetchClasses();
    }
  }, [user, fetchClasses]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) setShowModal(false);
    };
    if (showModal) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [showModal]);

  const toggleMembers = async (groupId) => {
    if (expandedGroupId === groupId) {
      setExpandedGroupId(null);
      return;
    }

    setExpandedGroupId(groupId);

    if (!groupMembers[groupId]) {
      try {
        const res = await groupService.getMembers(groupId);
        setGroupMembers(prev => ({
          ...prev,
          [groupId]: res.data
        }));
      } catch (err) {
        console.error('Lỗi tải thành viên:', err);
        showToast('Không thể tải danh sách thành viên nhóm này.', 'warning');
      }
    }
  };

  const handleShowMemberInfo = async (member) => {
    setShowModal(true);
    setMemberLoading(true);
    try {
      const memberId = (typeof member === 'string') ? member : (member.userId || member.id);
      
      const [userRes, historyRes] = await Promise.all([
        userService.getById(memberId),
        reportService.getPersonalHistory(memberId)
      ]);
      setSelectedMember(userRes.data);
      setMemberHistory(historyRes.data || []);
    } catch (err) {
      console.error('Lỗi tải chi tiết thành viên:', err);
      setSelectedMember(typeof member === 'string' ? { id: member, fullName: 'Đang tải...' } : member);
      setMemberHistory([]);
    } finally {
      setMemberLoading(false);
    }
  };
  
  const handleSetLeader = async (groupId, studentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn phân quyền Trưởng nhóm cho sinh viên này?')) return;
    try {
      await groupService.setLeader(groupId, studentId);
      showToast('Đã thay đổi trưởng nhóm thành công!', 'success');
      fetchClasses();
      // Also refresh members for this group to update roles
      const res = await groupService.getMembers(groupId);
      setGroupMembers(prev => ({
        ...prev,
        [groupId]: res.data
      }));
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi thiết lập trưởng nhóm.', 'danger');
    }
  };

  if (loading && classes.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '1rem' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      <p style={{ color: 'var(--text-secondary)' }}>Đang đồng bộ danh sách lớp hướng dẫn...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Member Info Modal */}
      {showModal && (
        <div 
          onClick={(e) => { if(e.target === e.currentTarget) setShowModal(false); }}
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(5, 5, 10, 0.85)', backdropFilter: 'blur(20px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div className="glass-card animate-scale-in custom-scrollbar" style={{ 
            width: '95%', 
            maxWidth: '800px', 
            maxHeight: '90vh', 
            padding: 0, 
            overflowY: 'auto', 
            position: 'relative', 
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            background: 'rgba(20, 20, 25, 0.9)',
            display: 'block'
          }}>
            
            {/* Close Button Overlay */}
            <button 
              onClick={() => setShowModal(false)} 
              style={{ 
                position: 'absolute', 
                top: '1rem', 
                right: '1rem', 
                background: 'rgba(0, 0, 0, 0.5)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                color: 'white', 
                cursor: 'pointer', 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              &times;
            </button>

            {/* Premium Header */}
            <div style={{ 
              height: '140px', 
              background: 'linear-gradient(135deg, #0062ff 0%, #00a2ff 50%, #00d2ff 100%)', 
              position: 'relative'
            }}>
              <div style={{ position: 'absolute', bottom: '-40px', left: '2rem', display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                <div style={{ 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '24px', 
                  background: '#0f0f13', 
                  border: '4px solid #141419', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'var(--primary)', 
                  boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                }}>
                  <UserIcon size={50} />
                </div>
              </div>
            </div>

            <div style={{ padding: '50px 2rem 2rem 2rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '900', letterSpacing: '-0.03em', color: '#fff' }}>
                      {selectedMember?.fullName}
                    </h2>
                        <span style={{ 
                          padding: '3px 10px', 
                          background: selectedMember?.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.1)' : 
                                     selectedMember?.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                          color: selectedMember?.status === 'ACTIVE' ? '#4ade80' : 
                                 selectedMember?.status === 'PENDING' ? '#fbbf24' : '#f87171', 
                          borderRadius: '100px', 
                          fontSize: '0.65rem', 
                          fontWeight: '800', 
                          textTransform: 'uppercase',
                          border: `1px solid ${selectedMember?.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.2)' : 
                                               selectedMember?.status === 'PENDING' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                        }}>
                          {selectedMember?.status === 'ACTIVE' ? 'Đang hoạt động' : 
                           selectedMember?.status === 'BANNED' ? 'Bị chặn' : 
                           selectedMember?.status === 'INACTIVE' ? 'Ngưng hoạt động' : 
                           selectedMember?.status === 'PENDING' ? 'Đang chờ' : 'Không xác định'}
                        </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><ShieldCheck size={14} color="var(--accent)" /> {selectedMember?.roleCode || 'N/A'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Mail size={14} color="var(--primary)" /> {selectedMember?.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Left: Contact Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <section>
                    <h4 style={{ fontSize: '0.7rem', fontWeight: '800', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '15px', height: '1px', background: 'currentColor' }}></div>
                      Thông tin chi tiết
                    </h4>
                    
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Phone size={18} color="#c084fc" />
                        <div>
                          <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700' }}>SỐ ĐIỆN THOẠI</p>
                          <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#e2e8f0' }}>{selectedMember?.phoneNumber || 'N/A'}</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1, padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                           <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700' }}>GIỚI TÍNH</p>
                           <p style={{ fontSize: '0.9rem', fontWeight: '700' }}>{selectedMember?.gender || 'N/A'}</p>
                        </div>
                        <div style={{ flex: 1, padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                           <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700' }}>THAM GIA</p>
                           <p style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                             {selectedMember?.createdAt ? new Date(selectedMember.createdAt).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }) : '12/2024'}
                           </p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right: Contributions (Hide for Teachers/Admins) */}
                {selectedMember?.roleCode !== 'TEACHER' && selectedMember?.roleCode !== 'ADMIN' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <section>
                      <h4 style={{ fontSize: '0.7rem', fontWeight: '800', color: '#00a2ff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '15px', height: '1px', background: 'currentColor' }}></div>
                        Đóng góp dự án
                      </h4>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(0, 122, 255, 0.1)', borderRadius: '16px', border: '1px solid rgba(0, 122, 255, 0.2)', textAlign: 'center' }}>
                          <p style={{ fontSize: '1.5rem', fontWeight: '900', color: '#007AFF', margin: 0 }}>{memberHistory.filter(h => h.type === 'TASK').length}</p>
                          <p style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)' }}>TASKS</p>
                        </div>
                        <div style={{ padding: '1rem', background: 'rgba(90, 200, 250, 0.1)', borderRadius: '16px', border: '1px solid rgba(90, 200, 250, 0.2)', textAlign: 'center' }}>
                          <p style={{ fontSize: '1.5rem', fontWeight: '900', color: '#5AC8FA', margin: 0 }}>{memberHistory.filter(h => h.type === 'COMMIT').length}</p>
                          <p style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)' }}>COMMITS</p>
                        </div>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.01)', borderRadius: '16px', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '0.75rem' }}>Hoạt động mới nhất</p>
                        <div style={{ maxHeight: '120px', overflowY: 'auto' }} className="custom-scrollbar">
                          {memberHistory.length > 0 ? (
                            memberHistory.slice(0, 3).map((h, i) => (
                              <div key={i} style={{ padding: '0.5rem 0', borderBottom: i === 2 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '2px' }}>{h.description}</p>
                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{new Date(h.timestamp).toLocaleDateString()}</p>
                              </div>
                            ))
                          ) : <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chưa có dữ liệu.</p>}
                        </div>
                      </div>
                    </section>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                     <ShieldCheck size={48} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                     <h4 style={{ color: 'white', fontWeight: '700', marginBottom: '0.5rem' }}>Hồ sơ Nhân sự</h4>
                     <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tài khoản này thuộc quyền quản lý/giảng dạy, không tham gia trực tiếp vào việc thực hiện dự án.</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: '1.5rem 2rem', background: 'rgba(15, 15, 20, 0.6)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
               <button onClick={() => setShowModal(false)} className="glass-button" style={{ padding: '0.6rem 1.5rem', borderRadius: '10px', fontSize: '0.85rem' }}>Đóng</button>
               {selectedMember?.roleCode !== 'TEACHER' && selectedMember?.roleCode !== 'ADMIN' && (
                 <button 
                   onClick={() => { setShowModal(false); navigate(`/member/commits?groupId=${expandedGroupId}`); }} 
                   className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '10px', fontSize: '0.85rem' }}
                 >
                   Chi tiết đóng góp
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Lớp học & Nhóm Hướng dẫn</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Theo dõi sát sao tiến độ và chất lượng mã nguồn thực tế của từng nhóm dự án</p>
        </div>
        <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.75rem 1.25rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <Users size={18} />
           {classes.length} Nhóm dự án
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="glass-card" style={{ padding: '6rem', textAlign: 'center', borderStyle: 'dashed' }}>
          <FolderKanban size={64} style={{ margin: '0 auto 1.5rem', color: 'var(--text-muted)', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>Chưa được phân công nhóm nào</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>Dữ liệu nhóm sẽ xuất hiện tại đây khi quản trị viên phân công giảng viên hướng dẫn cho các dự án.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', 
          gap: '2rem',
          alignItems: 'flex-start' 
        }}>
          {classes.map((cls) => (
            <div key={cls.groupId} className="glass-card animate-slide-up" style={{ padding: '2rem', borderTop: '4px solid var(--primary)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                   <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '4px 10px', borderRadius: '6px', display: 'inline-block' }}>
                        Project Group
                      </span>
                      {cls.teacherName && (
                        <span 
                          onClick={() => handleShowMemberInfo(cls.teacherId)}
                          style={{ 
                            fontSize: '0.65rem', 
                            fontWeight: '900', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.1em', 
                            color: '#00d2ff', 
                            background: 'rgba(0, 210, 255, 0.1)', 
                            padding: '4px 10px', 
                            borderRadius: '6px', 
                            display: 'inline-block',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          className="hover-glow"
                          title="Xem thông tin Giảng viên"
                        >
                          GV: {cls.teacherName}
                        </span>
                      )}
                   </div>
                   <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white' }}>{cls.groupName}</h3>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                   {groupStatus[cls.groupId]?.hasJira ? <CheckCircle size={18} color="var(--success)" title="Jira Connected" /> : <AlertCircle size={18} color="var(--danger)" title="Jira Missing" />}
                   {groupStatus[cls.groupId]?.hasGithub ? <GitBranch size={18} color="var(--success)" title="GitHub Connected" /> : <AlertCircle size={18} color="var(--danger)" title="GitHub Missing" />}
                </div>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6', minHeight: '3.5rem' }}>
                {cls.projectTopic || 'Đề tài dự án hiện đang được cập nhật bởi sinh viên...'}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '14px', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                   <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '8px', borderRadius: '10px' }}>
                      <Users size={20} />
                   </div>
                   <div>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Thành viên</p>
                      <p style={{ fontSize: '1.15rem', fontWeight: '800' }}>{cls.members?.length || 0}</p>
                   </div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '14px', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                   <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', padding: '8px', borderRadius: '10px' }}>
                      <TrendingUp size={20} />
                   </div>
                   <div>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Tiến độ</p>
                      <p style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--success)' }}>{cls.progressPercentage || '0'}%</p>
                   </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginTop: 'auto' }}>
                <button 
                  onClick={() => navigate(`/project/heatmap?groupId=${cls.groupId}`)}
                  className="glass-button" 
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 0.25rem' }}
                >
                  <Activity size={20} color="var(--primary)" />
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)' }}>Đóng góp</span>
                </button>
                
                <button 
                  onClick={() => navigate(`/project/sprint?groupId=${cls.groupId}`)}
                  className="glass-button" 
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 0.25rem' }}
                >
                  <TrendingUp size={20} color="var(--success)" />
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--success)' }}>Sprint</span>
                </button>

                <button 
                  onClick={() => navigate(`/member/commits?groupId=${cls.groupId}`)}
                  className="glass-button" 
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 0.25rem' }}
                >
                  <GitCommit size={20} color="var(--accent)" />
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--accent)' }}>Commits</span>
                </button>

                <button 
                  onClick={() => navigate(`/teacher/reports?groupId=${cls.groupId}`)}
                  className="glass-button" 
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 0.25rem' }}
                >
                  <FileText size={20} color="var(--secondary)" />
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--secondary)' }}>Báo cáo</span>
                </button>
              </div>

              <button 
                onClick={() => toggleMembers(cls.groupId)}
                className="btn btn-outline" 
                style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', padding: '0.5rem', borderColor: expandedGroupId === cls.groupId ? 'var(--primary)' : 'rgba(255,255,255,0.05)' }}
              >
                {expandedGroupId === cls.groupId ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                  {expandedGroupId === cls.groupId ? 'Ẩn thành viên' : 'Xem thành viên'}
                </span>
              </button>

              {/* Member Area */}
              {expandedGroupId === cls.groupId && (
                <div className="animate-fade-in" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {groupMembers[cls.groupId] ? (
                        groupMembers[cls.groupId].length > 0 ? (
                          groupMembers[cls.groupId].map((m, idx) => (
                            <div key={idx} className="table-row-hover" style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                         <User size={16} />
                                      </div>
                                      <div>
                                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>{m.fullName}</p>
                                            {cls.leaderId === (m.studentId || m.id) && (
                                              <span style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '4px', 
                                                background: 'rgba(255, 215, 0, 0.15)', 
                                                color: '#FFD700', 
                                                padding: '2px 8px', 
                                                borderRadius: '6px', 
                                                fontSize: '0.65rem', 
                                                fontWeight: '900',
                                                border: '1px solid rgba(255, 215, 0, 0.3)'
                                              }}>
                                                <Crown size={12} /> LEADER
                                              </span>
                                            )}
                                            <span style={{ 
                                               padding: '2px 6px', 
                                               background: m.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.1)' : 
                                                          m.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                                               color: m.status === 'ACTIVE' ? '#4ade80' : 
                                                      m.status === 'PENDING' ? '#fbbf24' : '#f87171', 
                                               borderRadius: '4px', 
                                               fontSize: '0.6rem', 
                                               fontWeight: '800', 
                                               textTransform: 'uppercase',
                                               border: `1px solid ${m.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.2)' : 
                                                                    m.status === 'PENDING' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                            }}>
                                               {m.status === 'ACTIVE' ? 'Đang hoạt động' : 
                                                m.status === 'BANNED' ? 'Bị chặn' : 
                                                m.status === 'INACTIVE' ? 'Ngưng hoạt động' : 
                                                m.status === 'PENDING' ? 'Đang chờ' : 'Không xác định'}
                                            </span>
                                         </div>
                                         <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.studentCode}</p>
                                      </div>
                                   </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {cls.leaderId !== (m.studentId || m.id) && (
                                      <button 
                                        onClick={() => handleSetLeader(cls.groupId, m.studentId || m.id)}
                                        className="hover-glow"
                                        style={{ 
                                          background: 'rgba(255, 215, 0, 0.1)', 
                                          border: '1px solid rgba(255, 215, 0, 0.3)', 
                                          color: '#FFD700', 
                                          padding: '4px 10px', 
                                          borderRadius: '6px', 
                                          fontSize: '0.65rem', 
                                          fontWeight: '800', 
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '4px'
                                        }}
                                        title="Chỉ định làm Trưởng nhóm"
                                      >
                                        <Star size={12} fill="#FFD700" /> Leader
                                      </button>
                                    )}
                                    <button 
                                      onClick={() => handleShowMemberInfo(m)}
                                      style={{ background: 'none', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800', cursor: 'pointer' }}
                                    >
                                      Thông tin
                                    </button>
                                </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                             Chưa có thành viên nào trong nhóm này.
                          </div>
                        )
                      ) : (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                           <div className="animate-spin" style={{ width: '20px', height: '20px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto' }}></div>
                        </div>
                      )}
                   </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherClasses;
