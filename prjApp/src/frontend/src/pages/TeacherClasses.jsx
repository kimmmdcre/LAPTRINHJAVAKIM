import React, { useState, useEffect } from 'react';
import { groupService, reportService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Clock, ArrowRight, FolderKanban, TrendingUp, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeacherClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandingGroupId, setExpandingGroupId] = useState(null);
  const [groupMembers, setGroupMembers] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchClasses();
    }
  }, [user]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await groupService.getByTeacher(user.id);
      setClasses(res.data);
    } catch (err) {
      console.error('Lỗi tải nhóm:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMembers = async (groupId) => {
    if (expandingGroupId === groupId) {
      setExpandingGroupId(null);
      return;
    }

    setExpandingGroupId(groupId);
    if (!groupMembers[groupId]) {
      try {
        const res = await groupService.getMembers(groupId);
        setGroupMembers(prev => ({ ...prev, [groupId]: res.data }));
      } catch (err) {
        console.error('Lỗi tải thành viên:', err);
      }
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Lớp học & Nhóm hướng dẫn</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Quản lý tiến độ và hỗ trợ sinh viên trong các dự án của bạn</p>
      </div>

      {classes.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
          <FolderKanban size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--text-secondary)', opacity: 0.5 }} />
          <h3 style={{ marginBottom: '0.5rem' }}>Chưa có nhóm nào được phân công</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Liên hệ quản trị viên để được phân công nhóm hướng dẫn hướng dẫn.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '2rem' }}>
          {classes.map((cls) => (
            <div key={cls.idNhom} className="glass-card" style={{ padding: '2rem', borderTop: '4px solid var(--primary)', height: 'fit-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.05em', color: 'white', padding: '0.25rem 0.75rem', background: 'var(--primary)', borderRadius: '20px' }}>
                  NHÓM: {cls.tenNhom.toUpperCase()}
                </span>
                <Clock size={18} style={{ color: 'var(--text-secondary)' }} />
              </div>

              <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'white' }}>
                {cls.deTai || 'Dự án chưa xác định'}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Thành viên</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={18} color="var(--primary)" />
                    {cls.soLuongThanhVien || '0'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Tiến độ chung</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
                    <TrendingUp size={18} />
                    {cls.tienDo || '0'}%
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                    onClick={() => navigate(`/teacher/reports?nhomId=${cls.idNhom}`)}
                    className="btn btn-primary" 
                    style={{ flex: 1, justifyContent: 'center' }}
                    >
                    <ArrowRight size={18} />
                    Xem Báo cáo Tổng hợp
                    </button>
                    <button 
                    onClick={() => toggleMembers(cls.idNhom)}
                    className="btn btn-outline" 
                    style={{ padding: '0.75rem', borderColor: expandingGroupId === cls.idNhom ? 'var(--primary)' : '' }}
                    >
                    <Users size={18} />
                    </button>
                </div>

                {/* Animated Member List */}
                {expandingGroupId === cls.idNhom && (
                  <div className="animate-fade-in" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={14} /> Danh sách Thành viên
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {groupMembers[cls.idNhom]?.map(member => (
                        <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                             <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={16} />
                             </div>
                             <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{member.hoTen}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{member.maSinhVien}</div>
                             </div>
                          </div>
                          <button 
                            onClick={() => navigate(`/teacher/contributions?nhomId=${cls.idNhom}&sinhVienId=${member.id}`)}
                            style={{ padding: '0.4rem', borderRadius: '4px', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem' }}
                            title="Xem báo cáo cá nhân"
                          >
                             Chi tiết
                          </button>
                        </div>
                      ))}
                      {!groupMembers[cls.idNhom] && <div className="animate-spin" style={{ width: '20px', height: '20px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto' }}></div>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherClasses;
