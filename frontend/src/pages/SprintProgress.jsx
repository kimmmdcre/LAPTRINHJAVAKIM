import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { reportService, groupService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  AlertCircle, 
  ArrowLeft,
  Activity,
  Layers,
  CheckCircle2,
  Calendar
} from 'lucide-react';

const SprintProgress = () => {
  const { user } = useAuth();
  const { showToast } = useUI();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const urlGroupId = queryParams.get('nhomId');
  
  const [groupId, setGroupId] = useState(urlGroupId);
  const [loading, setLoading] = useState(true);
  const [progressSummary, setProgressSummary] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    if (user?.id) {
      initProgressData();
    }
  }, [user, urlGroupId]);

  const initProgressData = async () => {
    try {
      setLoading(true);
      let targetGroupId = urlGroupId;

      if (!targetGroupId) {
        // Find current user's group if not provided via URL
        const groupsRes = await groupService.getAll();
        const myGroup = groupsRes.data.find(g => 
          g.thanhViens?.some(m => m.idSinhVien === user.id)
        );
        if (myGroup) targetGroupId = myGroup.idNhom;
      }

      if (targetGroupId) {
        setGroupId(targetGroupId);
        const [summaryRes, historyRes] = await Promise.all([
          reportService.getProgress(targetGroupId),
          reportService.getHistory(targetGroupId)
        ]);
        setProgressSummary(summaryRes.data);
        setHistoryData(historyRes.data);
      }
    } catch (err) {
      console.error('Lỗi tải tiến độ:', err);
      showToast('Không thể tải dữ liệu tiến độ dự án.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const pieData = progressSummary ? [
    { name: 'Hoàn thành', value: progressSummary.hoanThanh || progressSummary.nhiemVuHoanThanh, color: 'var(--success)' },
    { name: 'Chưa xong', value: (progressSummary.tongNhiemVu || progressSummary.tongSoNhiemVu) - (progressSummary.hoanThanh || progressSummary.nhiemVuHoanThanh), color: 'rgba(255,255,255,0.05)' },
  ] : [];

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '1rem' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      <p style={{ color: 'var(--text-secondary)' }}>Đang tính toán vận tốc hoàn thành của nhóm...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Tiến độ Dự án (Sprint Status)</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Trực quan hóa khối lượng công việc và vận tốc (Velocity) của nhóm</p>
        </div>
        {!urlGroupId && (
          <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', padding: '0.6rem 1.25rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Activity size={18} />
             Active Sprint
          </div>
        )}
      </div>

      {!groupId ? (
        <div className="glass-card" style={{ padding: '6rem', textAlign: 'center' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--warning)', opacity: 0.5 }} />
          <h3>Chưa xác định được nhóm</h3>
          <p style={{ color: 'var(--text-muted)' }}>Bạn cần được phân vào một nhóm dự án để theo dõi tiến độ.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Progress History Chart */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <TrendingUp size={20} color="var(--primary)" />
                  Tốc độ Hoàn thành (Velocity Chart)
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <div style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Dữ liệu Jira Cloud
                   </div>
                </div>
            </div>
            <div style={{ height: '380px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="colorSprint" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} vertical={false} />
                  <XAxis dataKey="ngay" stroke="var(--text-hidden)" hide />
                  <YAxis stroke="var(--text-muted)" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--glass-border)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: 'white', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="hoanThanh" stroke="var(--primary)" fillOpacity={1} fill="url(#colorSprint)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '2rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={14} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bắt đầu: {historyData[0]?.ngay || 'N/A'}</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={14} color="var(--success)" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hiện tại: {progressSummary?.hoanThanh || progressSummary?.nhiemVuHoanThanh} Nhiệm vụ</span>
               </div>
            </div>
          </div>

          {/* Status Breakdown Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
                <PieIcon size={20} color="var(--secondary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Tỷ lệ Trạng thái</h3>
              </div>
              
              <div style={{ height: '240px', width: '100%', position: 'relative', marginBottom: '2rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={5}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--glass-border)', borderRadius: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '900', color: 'white' }}>{(progressSummary?.phanTram || progressSummary?.phanTramTienDo || 0).toFixed(0)}%</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Done</div>
                </div>
              </div>

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Tổng số nhiệm vụ</span>
                  <span style={{ fontWeight: '800', color: 'white' }}>{progressSummary?.tongNhiemVu || progressSummary?.tongSoNhiemVu}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: '600' }}>Đã hoàn thành</span>
                  <span style={{ fontWeight: '800', color: 'var(--success)' }}>{progressSummary?.hoanThanh || progressSummary?.nhiemVuHoanThanh}</span>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))' }}>
               <h4 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={16} />
                  Phân tích Sprint
               </h4>
               <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                 Nhóm của bạn đang duy trì vận tốc ổn định. Để đạt mục tiêu 100%, hãy tập trung giải quyết các bài toán tồn đọng trước ngày <strong>{historyData[historyData.length - 1]?.ngay || 'cuối kỳ'}</strong>.
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintProgress;
