import React, { useState, useEffect, useCallback } from 'react';
import { reportService, groupService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
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
  Info,
  ArrowLeft,
  WifiOff,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContributionTracking = () => {
  const { user } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();
  const [contributions, setContributions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupInfo, setGroupInfo] = useState(null);
  const [connectionError, setConnectionError] = useState(false);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      // Ưu tiên lấy groupId từ URL (dành cho Admin/Teacher)
      const queryParams = new URLSearchParams(window.location.search);
      const groupIdFromUrl = queryParams.get('groupId');
      const groupId = groupIdFromUrl || user.groupId;

      if (groupId) {
        const groupRes = await groupService.getDetails(groupId);
        setGroupInfo(groupRes.data);
        const [contribRes, historyRes] = await Promise.all([
          reportService.getContributions(groupId),
          reportService.getCommitHistory(groupId)
        ]);
        setContributions(contribRes.data || []);
        setHistory(historyRes.data || []);
      } else {
        // fallback cho Sinh viên nếu groupId trong user context bị thiếu
        const groupsRes = await groupService.getAll();
        const allGroups = Array.isArray(groupsRes.data) ? groupsRes.data : [];
        const myGroup = allGroups.find(g => 
          g.members?.some(m => m.studentId === user.id)
        );
        if (myGroup) {
          setGroupInfo(myGroup);
          const [contribRes, historyRes] = await Promise.all([
            reportService.getContributions(myGroup.groupId),
            reportService.getCommitHistory(myGroup.groupId)
          ]);
          setContributions(contribRes.data || []);
          setHistory(historyRes.data || []);
        } else if (user.role === 'ADMIN' || user.role === 'TEACHER') {
          showToast('Vui lòng chọn một nhóm từ danh sách Lớp học để xem báo cáo đóng góp.', 'info');
        }
      }
    } catch (err) {
      console.error('Lỗi phân tích đóng góp:', err);
      setConnectionError(true);
      showToast('Không thể kết nối tới dữ liệu đóng góp.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    if (user?.id) {
      fetchAnalyticsData();
    }
  }, [user, fetchAnalyticsData]);

  const CHART_COLORS = [
    '#007AFF', // Royal Blue
    '#5AC8FA', // Sky Blue
    '#00D2FF', // Cyan
    '#6366F1', // Indigo
    '#A855F7', // Purple
    '#EC4899', // Pink
  ];

  const getHeatmapColor = (count) => {
    if (count === 0) return 'rgba(255,255,255,0.05)';
    if (count <= 1) return 'rgba(0, 122, 255, 0.15)';
    if (count <= 3) return 'rgba(0, 122, 255, 0.35)';
    if (count <= 5) return 'rgba(0, 122, 255, 0.6)';
    if (count <= 8) return 'rgba(0, 122, 255, 0.85)';
    return '#007AFF';
  };

  if (loading && !groupInfo) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '1rem' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      <p style={{ color: 'var(--text-secondary)' }}>Đang tính toán chỉ số đóng góp...</p>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
          <button 
            onClick={() => navigate(-1)} 
            className="glass-button" 
            style={{ padding: '0.75rem', borderRadius: '12px' }}
            title="Quay lại"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Báo cáo Đóng góp & Analytics</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Phân tích chuyên sâu về tần suất commit và chất lượng mã nguồn của từng thành viên</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="glass-card" style={{ 
               padding: '0.4rem 1rem', 
               display: 'flex', 
               alignItems: 'center', 
               gap: '0.6rem', 
               background: connectionError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', 
               color: connectionError ? 'var(--danger)' : 'var(--success)', 
               border: 'none',
               borderRadius: '10px'
            }}>
                {connectionError ? <WifiOff size={16} /> : <CheckCircle2 size={16} />}
                <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>{connectionError ? 'Connection Lost' : 'Live Connection'}</span>
            </div>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.6rem 1.25rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '800' }}>
               Group: {groupInfo?.groupName || 'N/A'}
            </div>
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
                <XAxis dataKey="studentName" fontSize={11} stroke="var(--text-muted)" axisLine={false} tickLine={false} />
                <YAxis fontSize={11} stroke="var(--text-muted)" axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{fill: 'rgba(255,255,255,0.12)'}}
                  contentStyle={{ 
                    background: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid var(--glass-border)', 
                    borderRadius: '12px', 
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                  }}
                  labelStyle={{ color: '#fff', fontWeight: '900', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}
                  itemStyle={{ color: '#00d2ff', fontWeight: '700', fontSize: '0.85rem' }}
                />
                <Bar name="Số Commits" dataKey="commitCount" radius={[6, 6, 0, 0]} barSize={40}>
                   {contributions.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CHART_COLORS[index % CHART_COLORS.length]} 
                      fillOpacity={entry.studentId === user.id ? 1 : 0.6} 
                    />
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
                <XAxis dataKey="studentName" fontSize={11} stroke="var(--text-muted)" axisLine={false} tickLine={false} />
                <YAxis fontSize={11} stroke="var(--text-muted)" axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{fill: 'rgba(255,255,255,0.12)'}}
                  contentStyle={{ 
                    background: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid var(--glass-border)', 
                    borderRadius: '12px', 
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                  }}
                  labelStyle={{ color: '#fff', fontWeight: '900', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}
                  itemStyle={{ color: '#4ade80', fontWeight: '700', fontSize: '0.85rem' }}
                />
                <Bar name="Nhiệm vụ hoàn thành" dataKey="completedTaskCount" radius={[6, 6, 0, 0]} barSize={40}>
                   {contributions.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CHART_COLORS[(index + 2) % CHART_COLORS.length]} 
                      fillOpacity={entry.studentId === user.id ? 1 : 0.6} 
                    />
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
                Ít <div style={{width:10, height:10, background:'rgba(255,255,255,0.05)', borderRadius:2 }}></div>
                <div style={{width:10, height:10, background:'rgba(0, 122, 255, 0.15)', borderRadius:2 }}></div>
                <div style={{width:10, height:10, background:'rgba(0, 122, 255, 0.35)', borderRadius:2 }}></div>
                <div style={{width:10, height:10, background:'rgba(0, 122, 255, 0.6)', borderRadius:2 }}></div>
                <div style={{width:10, height:10, background:'rgba(0, 122, 255, 0.85)', borderRadius:2 }}></div>
                <div style={{width:10, height:10, background:'#007AFF', borderRadius:2 }}></div> Nhiều
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
                   contentStyle={{ 
                     background: 'rgba(15, 23, 42, 0.95)', 
                     border: '1px solid var(--glass-border)', 
                     borderRadius: '12px', 
                     backdropFilter: 'blur(10px)',
                     boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                   }}
                   labelStyle={{ color: '#fff', fontWeight: '900' }}
                   itemStyle={{ color: '#00d2ff', fontWeight: '700' }}
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
                  {contributions.length > 0 ? (
                    (() => {
                      const sorted = [...contributions].sort((a, b) => b.commitCount - a.commitCount);
                      const top = sorted[0];
                      const totalCommits = contributions.reduce((sum, c) => sum + c.commitCount, 0);
                      const mappingRate = history.length > 0 ? Math.min(100, Math.round((totalCommits / (groupInfo?.memberCount || 5) * 10))) : 0;
                      
                      return (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255, 159, 10, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)', border: '2px solid var(--warning)' }}>
                              <Award size={20} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>TOP CONTRIBUTOR</p>
                                <p style={{ fontWeight: '800' }}>{top.commitCount > 0 ? top.studentName : 'Đang chờ bứt phá...'}</p>
                            </div>
                          </div>
                          
                          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--warning)' }}>
                             {totalCommits > 0 ? (
                               <span>
                                 Mức độ hoạt động của nhóm đang ở mức <strong>{totalCommits > 10 ? 'Sôi nổi' : 'Ổn định'}</strong>. 
                                 Dự án đã ghi nhận {totalCommits} đóng góp từ các thành viên.
                               </span>
                             ) : (
                               <span>Hãy bắt đầu commit để hệ thống phân tích insight cho nhóm của bạn.</span>
                             )}
                          </div>
                        </>
                      );
                    })()
                  ) : (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Chưa có dữ liệu đóng góp.</p>
                  )}
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
