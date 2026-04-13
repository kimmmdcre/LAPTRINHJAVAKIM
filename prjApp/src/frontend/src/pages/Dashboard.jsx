import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { groupService } from '../services/api';
import { Layers, CheckSquare, Trophy, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ groups: 0, tasks: 0, topStudents: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetching of stats for the dashboard.
    // In a real app, this would be an API call like reportService.getDashboardStats()
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await groupService.getAll();
        
        // Simulating data
        setStats({
          groups: res.data.length || 5, // Fallback dummy data if no groups
          tasks: 124, 
          topStudents: [
            { id: 1, name: 'Nguyễn Văn A', score: 98 },
            { id: 2, name: 'Trần Thị B', score: 85 },
            { id: 3, name: 'Lê Văn C', score: 76 },
            { id: 4, name: 'Phạm Thị D', score: 64 },
            { id: 5, name: 'Tôn Thất E', score: 50 },
          ]
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Chào {user?.hoTen}! 🚀</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Bạn đang đăng nhập với vai trò <strong>{user?.role}</strong>. Cùng xem báo cáo tổng hợp hôm nay nhé!
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Widget 1 */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
            <Layers size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tổng số nhóm</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{loading ? '-' : stats.groups}</h3>
          </div>
        </div>

        {/* Widget 2 */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', color: 'var(--success)' }}>
            <CheckSquare size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tổng số Task hoàn thành</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{loading ? '-' : stats.tasks}</h3>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Trophy size={20} color="var(--warning)" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Top 5 Sinh viên Nổi bật</h3>
        </div>
        
        {loading ? (
          <div className="animate-spin" style={{ margin: '2rem auto', width: '30px', height: '30px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats.topStudents.map((s, index) => (
              <div key={s.id} style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                padding: '1rem', borderRadius: '8px', 
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', 
                    background: index === 0 ? 'var(--warning)' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : 'var(--surface)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: index < 3 ? 'black' : 'white'
                  }}>
                    {index + 1}
                  </div>
                  <span style={{ fontWeight: '500' }}>{s.name}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--success)' }}>
                  {s.score} điểm đóng góp
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
