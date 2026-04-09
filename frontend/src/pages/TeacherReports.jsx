import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { reportService, groupService } from '../services/api';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Download, Filter, Calendar, Users, TrendingUp, GitCommit, ListChecks } from 'lucide-react';

const TeacherReports = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const nhomId = queryParams.get('nhomId');

  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);
  const [gitData, setGitData] = useState([]);

  useEffect(() => {
    if (nhomId) {
      fetchReportData();
    }
  }, [nhomId]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [infoRes, progressRes, gitRes] = await Promise.all([
        groupService.getDetails(nhomId),
        reportService.getProgress(nhomId),
        reportService.getCommits(nhomId)
      ]);
      setGroupInfo(infoRes.data);
      setProgressData(progressRes.data);
      setGitData(gitRes.data);
    } catch (err) {
      console.error('Lỗi tải báo cáo:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!nhomId) return (
    <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
      <Filter size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
      <h3>Vui lòng chọn một nhóm từ danh sách Lớp học để xem báo cáo</h3>
    </div>
  );

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '0.25rem' }}>
             Dự án: {groupInfo?.tenNhom}
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Báo cáo & Phân tích Tiến độ</h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline">
            <Calendar size={18} />
            Tuần này
          </button>
          <button className="btn btn-primary" onClick={() => window.print()}>
            <Download size={18} />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Hoàn thành', value: '72%', icon: TrendingUp, color: 'var(--success)' },
          { label: 'Nhiệm vụ', value: '48/65', icon: ListChecks, color: 'var(--primary)' },
          { label: 'Commits', value: '124', icon: GitCommit, color: 'var(--accent)' },
          { label: 'Thành viên', value: '5', icon: Users, color: 'var(--text-primary)' },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{stat.label}</div>
              <stat.icon size={20} style={{ color: stat.color }} />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Burn-down Chart */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>Tiểu đồ tiến độ (Burn-down)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="ngay" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--surface-border)', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="hoanThanh" stroke="var(--primary)" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Git Contributions per member */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>Đóng góp mã nguồn</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gitData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="username" type="category" stroke="var(--text-secondary)" fontSize={11} width={80} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--surface-border)', borderRadius: '8px' }}
                />
                <Bar dataKey="commits" radius={[0, 4, 4, 0]}>
                  {gitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--primary)' : 'var(--accent)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherReports;
