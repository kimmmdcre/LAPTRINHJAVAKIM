import React, { useState, useEffect } from 'react';
import { groupService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Users, Clock, ArrowRight, FolderKanban, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeacherClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
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
          <p style={{ color: 'var(--text-secondary)' }}>Liên hệ quản trị viên để được phân công nhóm hướng dẫn.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
          {classes.map((cls) => (
            <div key={cls.idNhom} className="glass-card" style={{ padding: '2rem', borderTop: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.05em', color: 'var(--primary)', padding: '0.25rem 0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '4px' }}>
                  NHÓM {cls.tenNhom.toUpperCase()}
                </span>
                <Clock size={18} style={{ color: 'var(--text-secondary)' }} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>{cls.deTai || 'Dự án chưa xác định'}</h3>

              <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>5</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Sinh viên</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>75%</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Tiến độ</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => navigate(`/teacher/reports?nhomId=${cls.idNhom}`)} // Connectivity: Pass group ID to reports
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                >
                  <ArrowRight size={18} />
                  Xem báo cáo
                </button>
                <button className="btn btn-outline" style={{ padding: '0.75rem' }}>
                  <Users size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherClasses;
