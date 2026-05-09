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
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeacherClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroupId, setExpandedGroupId] = useState(null); // Chỉ lưu 1 ID duy nhất
  const [groupMembers, setGroupMembers] = useState({});
  const [groupStatus, setGroupStatus] = useState({});
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

  if (loading && classes.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '1rem' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      <p style={{ color: 'var(--text-secondary)' }}>Đang đồng bộ danh sách lớp hướng dẫn...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
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
                   <span style={{ fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '4px 10px', borderRadius: '6px', marginBottom: '0.5rem', display: 'inline-block' }}>
                     Project Group
                   </span>
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
                  <Activity size={18} color="var(--primary)" />
                  <span style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase' }}>Đóng góp</span>
                </button>
                
                <button 
                  onClick={() => navigate(`/project/sprint?groupId=${cls.groupId}`)}
                  className="glass-button" 
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 0.25rem' }}
                >
                  <TrendingUp size={18} color="var(--success)" />
                  <span style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase' }}>Sprint</span>
                </button>

                <button 
                  onClick={() => navigate(`/member/commits?groupId=${cls.groupId}`)}
                  className="glass-button" 
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 0.25rem' }}
                >
                  <GitCommit size={18} color="var(--accent)" />
                  <span style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase' }}>Commits</span>
                </button>

                <button 
                  onClick={() => navigate(`/teacher/reports?groupId=${cls.groupId}`)}
                  className="glass-button" 
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 0.25rem' }}
                >
                  <FileText size={18} color="var(--secondary)" />
                  <span style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase' }}>Báo cáo</span>
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
                                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                     <User size={16} />
                                  </div>
                                  <div>
                                     <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>{m.fullName}</p>
                                     <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.studentCode}</p>
                                  </div>
                               </div>
                               <button 
                                 onClick={() => navigate(`/teacher/reports?groupId=${cls.groupId}`)}
                                 style={{ background: 'none', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800', cursor: 'pointer' }}
                               >
                                 Chi tiết
                               </button>
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
