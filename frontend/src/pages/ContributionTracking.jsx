import React, { useState, useEffect } from 'react';
import { reportService } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { GitCommit, TrendingUp, Calendar, Activity } from 'lucide-react';

const ContributionTracking = () => {
  const [contributions, setContributions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const groupId = localStorage.getItem('groupId') || 'd4c5b6a7-8901-2345-6789-0123456789ab';

  useEffect(() => {
    if (groupId) {
      fetchData();
    }
  }, [groupId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contribRes, historyRes] = await Promise.all([
        reportService.getContributions(groupId),
        reportService.getCommitHistory(groupId)
      ]);
      setContributions(contribRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.error('Lỗi tải dữ liệu đóng góp:', err);
    } finally {
      setLoading(false);
    }
  };

  const getHeatmapColor = (count) => {
    if (count === 0) return 'rgba(255,255,255,0.05)';
    if (count <= 1) return '#0e4429';
    if (count <= 2) return '#006d32';
    if (count <= 3) return '#26a641';
    return '#39d353';
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Theo dõi Đóng góp (Analytics)</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Phân tích mã nguồn và tần suất hoàn thành nhiệm vụ của nhóm</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Left: Member Statistics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <GitCommit size={20} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.1rem' }}>So sánh Commits</h3>
            </div>
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contributions}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} vertical={false} />
                  <XAxis dataKey="tenSinhVien" fontSize={10} stroke="var(--text-secondary)" />
                  <YAxis fontSize={10} stroke="var(--text-secondary)" />
                  <Tooltip
                    contentStyle={{ background: 'var(--background)', border: '1px solid var(--surface-border)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="soCommit" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <TrendingUp size={20} style={{ color: 'var(--secondary)' }} />
              <h3 style={{ fontSize: '1.1rem' }}>Nhiệm vụ Hoàn thành</h3>
            </div>
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contributions}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} vertical={false} />
                  <XAxis dataKey="tenSinhVien" fontSize={10} stroke="var(--text-secondary)" />
                  <YAxis fontSize={10} stroke="var(--text-secondary)" />
                  <Tooltip
                    contentStyle={{ background: 'var(--background)', border: '1px solid var(--surface-border)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="soNhiemVuHoanThanh" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right: Heatmap Array & Daily History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Calendar size={20} style={{ color: 'var(--success)' }} />
              <h3 style={{ fontSize: '1.1rem' }}>Lịch sử Hoạt động (Heatmap)</h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '150px', overflowY: 'auto', padding: '10px', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
              {history.map((day, i) => (
                <div
                  key={i}
                  title={`${day.count} commits on ${day.date}`}
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '3px',
                    background: getHeatmapColor(day.count),
                    transition: 'var(--transition)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                ></div>
              ))}
              {history.length === 0 && <p style={{ fontSize: '0.875rem', opacity: 0.5 }}>Chưa có dữ liệu lịch sử commit.</p>}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Activity size={20} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.1rem' }}>Biến động Commit theo thời gian</h3>
            </div>
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} />
                  <XAxis dataKey="date" fontSize={10} stroke="var(--text-secondary)" />
                  <YAxis fontSize={10} stroke="var(--text-secondary)" />
                  <Tooltip
                    contentStyle={{ background: 'var(--background)', border: '1px solid var(--surface-border)', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)' }} name="Commits" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionTracking;
