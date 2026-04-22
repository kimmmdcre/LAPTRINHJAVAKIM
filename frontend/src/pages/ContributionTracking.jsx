import React, { useState, useEffect } from 'react';
import { reportService, groupService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell, AreaChart, Area
} from 'recharts';
import { 
  GitCommit, 
  TrendingUp, 
  Calendar, 
  Activity, 
  Zap, 
  Users, 
  Award,
  ChevronRight,
  Info
} from 'lucide-react';

const ContributionTracking = () => {
  const { user } = useAuth();
  const { showToast } = useUI();
  const [contributions, setContributions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupInfo, setGroupInfo] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchAnalyticsData();
    }
  }, [user]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // Find current user's group
      const groupsRes = await groupService.getAll();
      const myGroup = groupsRes.data.find(g => 
        g.thanhViens?.some(m => m.idSinhVien === user.id)
      );

      if (myGroup) {
        setGroupInfo(myGroup);
        const [contribRes, historyRes] = await Promise.all([
          reportService.getContributions(myGroup.idNhom),
          reportService.getCommitHistory(myGroup.idNhom)
        ]);
        setContributions(contribRes.data || []);
        setHistory(historyRes.data || []);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu phân tích:', err);
      showToast('Không thể kết nối máy chủ phân tích.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const getHeatmapColor = (count) => {
    if (count === 0) return 'rgba(255,255,255,0.03)';
    if (count <= 1) return '#1e3a8a'; // Deep blue
    if (count <= 3) return '#3b82f6'; // Bright blue
    if (count <= 5) return '#60a5fa'; // Light blue
    return 'var(--primary)'; // Accent blue
  };

  if (loading && !groupInfo) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '1rem' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      <p style={{ color: 'var(--text-secondary)' }}>Đang tính toán chỉ số đóng góp...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Báo cáo Đóng góp & Analytics</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Phân tích sâu hiệu năng lập trình và tần suất hoàn thành mục tiêu</p>
        </div>
        <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.6rem 1.25rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '800' }}>
           Group: {groupInfo?.tenNhom || 'N/A'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Commits distribution */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', color: 'var(--primary)' }}>
               <GitCommit size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Phân bổ Commits GitHub</h3>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contributions}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} vertical={false} />
                <XAxis dataKey="hoTen" fontSize={11} stroke="var(--text-muted)" axisLine={false} tickLine={false} />
                <YAxis fontSize={11} stroke="var(--text-muted)" axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{fill: 'rgba(255,255,255,0.03)'}}
                  contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                />
                <Bar dataKey="soCommit" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={40}>
                   {contributions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fillOpacity={entry.idSinhVien === user.id ? 1 : 0.4} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task completion rate */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ padding: '8px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', color: 'var(--success)' }}>
               <TrendingUp size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Khối lượng Nhiệm vụ (Jira)</h3>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contributions}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} vertical={false} />
                <XAxis dataKey="hoTen" fontSize={11} stroke="var(--text-muted)" axisLine={false} tickLine={false} />
                <YAxis fontSize={11} stroke="var(--text-muted)" axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{fill: 'rgba(255,255,255,0.03)'}}
                  contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                />
                <Bar dataKey="nhiemVuHoanThanh" fill="var(--success)" radius={[6, 6, 0, 0]} barSize={40}>
                   {contributions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fillOpacity={entry.idSinhVien === user.id ? 1 : 0.4} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Heatmap & Line chart */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
             <h3 style={{ fontSize: '1.15rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <Calendar size={20} color="var(--primary)" />
               Chỉ số Nỗ lực (Activity Heatmap)
             </h3>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Less <div style={{width:10, height:10, background:'rgba(255,255,255,0.03)', borderRadius:2 }}></div>
                <div style={{width:10, height:10, background:'#1e3a8a', borderRadius:2 }}></div>
                <div style={{width:10, height:10, background:'#3b82f6', borderRadius:2 }}></div>
                <div style={{width:10, height:10, background:'var(--primary)', borderRadius:2 }}></div> More
             </div>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '3rem', padding: '1.5rem', background: 'rgba(0,0,0,0.1)', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
             {history.length > 0 ? history.map((day, i) => (
               <div
                 key={i}
                 title={`${day.count} commits vào ngày ${day.date || 'unknown'}`}
                 style={{
                   width: '16px',
                   height: '16px',
                   borderRadius: '4px',
                   background: getHeatmapColor(day.count),
                   transition: 'all 0.2s',
                   cursor: 'pointer'
                 }}
                 className="btn-hover"
               ></div>
             )) : (
               <div style={{ padding: '2rem', textAlign: 'center', width: '100%' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chưa ghi nhận hoạt động commit nào trong giai đoạn này.</p>
               </div>
             )}
          </div>

          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="count" stroke="var(--primary)" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Contribution Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <div className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Award size={18} color="var(--warning)" />
                 Insight & Phần thưởng
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                 {contributions.slice(0, 1).map((top, i) => (
                   <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', background: 'var(--warning)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>
                         <Zap size={20} fill="black" />
                      </div>
                      <div>
                         <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>TOP CONTRIBUTOR</p>
                         <p style={{ fontWeight: '800' }}>{top.hoTen}</p>
                      </div>
                   </div>
                 ))}
                 <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--warning)' }}>
                    Mức độ đồng đều của nhóm đang đạt <strong>tốt</strong>. 80% nhiệm vụ đã được mapping với commit tương ứng.
                 </div>
              </div>
           </div>

           <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '1rem' }}>Mẹo tối ưu Analytics</h4>
              <ul style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '1.25rem', lineHeight: '1.8' }}>
                 <li>Luôn để mã Jira (VD: JT-1) ở đầu commit message.</li>
                 <li>Một task nên có ít nhất 2 commit (Start & Review).</li>
                 <li>Nhiệm vụ "GHOST" sẽ làm giảm điểm đóng góp cuối kỳ.</li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionTracking;
