import React, { useState, useEffect } from 'react';
import { reportService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { GitBranch, GitPullRequest, GitCommit, Activity, RefreshCw } from 'lucide-react';

const MemberCommits = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 42, prs: 12, branches: 3, freq: 4.5 });

  useEffect(() => {
    if (user?.id) {
      fetchCommitHistory();
    }
  }, [user]);

  const fetchCommitHistory = async () => {
    try {
      setLoading(true);
      const res = await reportService.getPersonalHistory(user.id);
      setHistory(res.data);
    } catch (err) {
      console.error('Lỗi tải lịch sử commit:', err);
    } finally {
      setLoading(false);
    }
  };

  const recentCommits = [
    { sha: 'a1b2c3d', message: 'TASK-102: Tích hợp API VNPay', time: '2 giờ trước', branch: 'feat/vnpay' },
    { sha: 'e5f6g7h', message: 'TASK-101: Thiết kế Database', time: '1 ngày trước', branch: 'main' },
    { sha: 'i9j0k1l', message: 'TASK-101: Fix bug login', time: '2 ngày trước', branch: 'fix/auth' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Thống kê Đóng góp</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Phân tích hiệu suất và lịch sử cam kết mã nguồn trên GitHub</p>
        </div>
        <button className="btn btn-outline" onClick={fetchCommitHistory}>
          <RefreshCw size={18} />
          Làm mới
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Tổng Commit', value: stats.total, icon: <GitCommit />, color: 'var(--primary)' },
          { label: 'PR Hoàn thành', value: stats.prs, icon: <GitPullRequest />, color: 'var(--secondary)' },
          { label: 'Branch hoạt động', value: stats.branches, icon: <GitBranch />, color: 'var(--accent)' },
          { label: 'Tần suất/ngày', value: stats.freq, icon: <Activity />, color: 'var(--success)' },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ color: stat.color, marginBottom: '1rem' }}>{stat.icon}</div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{stat.label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) 1fr', gap: '2rem' }}>
        {/* Chart */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Lịch sử Commit (7 ngày qua)</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--surface-border)', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="count" stroke="var(--primary)" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* List */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Cam kết gần đây</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {recentCommits.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', marginTop: '6px' }}></div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.95rem', fontWeight: '500', marginBottom: '0.25rem' }}>{c.message}</p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <a href={`https://github.com/example/repo/commit/${c.sha}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>
                      {c.sha}
                    </a>
                    <span>{c.time}</span>
                    <span style={{ color: 'var(--accent)' }}>#{c.branch}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-outline" style={{ width: '100%', marginTop: '2rem', justifyContent: 'center' }}>
            Xem tất cả trên GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberCommits;
