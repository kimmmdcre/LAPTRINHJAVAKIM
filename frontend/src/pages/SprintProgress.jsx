import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { reportService } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, PieChart as PieIcon, AlertCircle } from 'lucide-react';

const SprintProgress = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const urlGroupId = queryParams.get('nhomId');
  
  const groupId = urlGroupId || localStorage.getItem('groupId');
  const [loading, setLoading] = useState(true);
  const [progressSummary, setProgressSummary] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    if (groupId) {
      fetchData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, historyRes] = await Promise.all([
        reportService.getProgress(groupId),
        reportService.getHistory(groupId)
      ]);
      setProgressSummary(summaryRes.data);
      setHistoryData(historyRes.data);
    } catch (err) {
      console.error('Lỗi tải tiến độ:', err);
    } finally {
      setLoading(false);
    }
  };

  const pieData = progressSummary ? [
    { name: 'Hoàn thành', value: progressSummary.nhiemVuHoanThanh, color: 'var(--success)' },
    { name: 'Chưa xong', value: progressSummary.tongSoNhiemVu - progressSummary.nhiemVuHoanThanh, color: 'var(--glass-border)' },
  ] : [];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Tiến độ Dự án (Sprint Status)</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Biểu đồ phản ánh tốc độ hoàn thành nhiệm vụ của nhóm</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Progress History Chart */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Tiến độ Hoàn thành theo thời gian</h3>
          </div>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} />
                <XAxis dataKey="ngay" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} />
                <Tooltip 
                  contentStyle={{ background: 'var(--background)', border: '1px solid var(--surface-border)', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="hoanThanh" stroke="var(--primary)" fillOpacity={1} fill="url(#colorProgress)" strokeWidth={3} name="Đã hoàn thành" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <PieIcon size={20} style={{ color: 'var(--secondary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Tỷ lệ Trạng thái</h3>
          </div>
          
          <div style={{ height: '220px', position: 'relative', marginBottom: '2rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--background)', border: '1px solid var(--surface-border)', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{progressSummary?.phanTramTienDo.toFixed(0)}%</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Tiến độ</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tổng nhiệm vụ</span>
              <span style={{ fontWeight: 'bold' }}>{progressSummary?.tongSoNhiemVu}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--success)' }}>Hoàn thành</span>
              <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>{progressSummary?.nhiemVuHoanThanh}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SprintProgress;
