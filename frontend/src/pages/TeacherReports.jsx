import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { reportService, groupService } from '../services/api';
import { useUI } from '../contexts/UIContext';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { 
  Download, 
  Filter, 
  Calendar, 
  Users, 
  TrendingUp, 
  GitCommit, 
  ListChecks, 
  Activity, 
  ArrowLeft,
  FileDown,
  FileText,
  Award,
  Zap,
  CheckCircle2,
  WifiOff
} from 'lucide-react';

const TeacherReports = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useUI();
  const queryParams = new URLSearchParams(location.search);
  const groupId = queryParams.get('groupId');

  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progressSummary, setProgressSummary] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [gitStats, setGitStats] = useState({ chartData: [], totalCommits: 0 });
  const [contributions, setContributions] = useState([]);
  const [connectionError, setConnectionError] = useState(false);

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      const [infoRes, progressRes, historyRes, gitRes, contribRes] = await Promise.all([
        groupService.getDetails(groupId),
        reportService.getProgress(groupId),
        reportService.getHistory(groupId),
        reportService.getCommits(groupId),
        reportService.getContributions(groupId)
      ]);

      setGroupInfo(infoRes.data);
      setProgressSummary(progressRes.data);
      setHistoryData(historyRes.data);
      
      // Sort contributions by completed tasks (primary) and commit count (secondary)
      const sortedContributions = (contribRes.data || []).sort((a, b) => {
        if (b.completedTaskCount !== a.completedTaskCount) {
          return b.completedTaskCount - a.completedTaskCount;
        }
        return (b.commitCount || 0) - (a.commitCount || 0);
      });
      setContributions(sortedContributions);
      
      const gitData = gitRes.data || {};
      const commitMap = gitData.commitsByStudent || {};
      const formattedGitData = Object.keys(commitMap).map(key => ({
        username: key,
        commits: commitMap[key]
      }));

      // Calculate Smart Effort Score
      const progressWeight = (progressRes.data.progressPercentage || 0) * 0.7;
      const freqValues = Object.values(gitData.frequencyIndex || {});
      const avgFreq = freqValues.length > 0 ? (freqValues.reduce((a, b) => a + b, 0) / freqValues.length) : 0;
      const frequencyWeight = (avgFreq * 100) * 0.3;
      const smartScore = ((progressWeight + frequencyWeight) / 10).toFixed(1);

      setGitStats({
        chartData: formattedGitData,
        totalCommits: gitData.totalCommits || 0,
        effortScore: smartScore
      });
    } catch (err) {
      console.error('Lỗi tải báo cáo:', err);
      setConnectionError(true);
      showToast('Có lỗi khi trích xuất dữ liệu báo cáo.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [groupId, showToast]);

  useEffect(() => {
    if (groupId) {
      fetchReportData();
    }
  }, [groupId, fetchReportData]);

  const handleExport = async (format) => {
    try {
      showToast(`Đang khởi tạo tệp ${format.toUpperCase()}...`, 'info');
      let res;
      if (format === 'pdf') res = await reportService.exportPdf(groupId);
      else if (format === 'docx') res = await reportService.exportDocx(groupId);
      else if (format === 'srs') res = await reportService.exportSRS(groupId);
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = format === 'srs' ? `SRS-Nhom-${groupInfo?.groupName}.pdf` : `Bao-cao-nhom-${groupInfo?.groupName}.${format}`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Xuất báo cáo thành công!');
    } catch (error) {
      console.error('Export error:', error);
      showToast('Lỗi khi xuất file báo cáo.', 'danger');
    }
  };

  if (!groupId) return (
    <div className="glass-card animate-fade-in" style={{ padding: '6rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
        <Filter size={48} color="var(--primary)" style={{ opacity: 0.3 }} />
      </div>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Chọn nhóm để xem phân tích</h3>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px', marginBottom: '2rem' }}>Vui lòng quay lại danh sách lớp học và chọn một nhóm cụ thể để bắt đầu xem báo cáo chi tiết.</p>
      <button className="btn btn-primary" onClick={() => navigate('/teacher/classes')}>
        <ArrowLeft size={18} /> Quay lại danh sách
      </button>
    </div>
  );

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '1rem' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      <p style={{ color: 'var(--text-secondary)' }}>Đang tổng hợp dữ liệu phân tích...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
          <button 
            onClick={() => navigate('/teacher/classes')} 
            className="glass-button" 
            style={{ padding: '0.75rem', borderRadius: '12px' }}
            title="Quay lại Lớp học"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
             <h2 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Phân tích Dự án: {groupInfo?.groupName}</h2>
             <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Đề tài: <span style={{ color: 'white', fontWeight: '600' }}>{groupInfo?.projectTopic || 'Chưa cập nhật'}</span></p>
          </div>
        </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div className="glass-card" style={{ 
               padding: '0.5rem 1.25rem', 
               display: 'flex', 
               alignItems: 'center', 
               gap: '0.75rem', 
               background: connectionError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', 
               color: connectionError ? 'var(--danger)' : 'var(--success)', 
               border: 'none',
               borderRadius: '12px'
             }}>
                {connectionError ? <WifiOff size={18} /> : <CheckCircle2 size={18} />}
                <span style={{ fontSize: '0.85rem', fontWeight: '900' }}>{connectionError ? 'Integration Loss' : 'Systems Connected'}</span>
             </div>
             <div style={{ display: 'flex', gap: '0.75rem' }}>
               <button className="btn btn-outline" onClick={() => handleExport('srs')}>
                 <FileText size={18} /> Xuất SRS
               </button>
               <button className="btn btn-primary" onClick={() => handleExport('pdf')}>
                 <Download size={18} /> Xuất PDF
               </button>
             </div>
          </div>
        </div>

      {/* Summary Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Tiến độ hoàn thành', value: `${progressSummary?.progressPercentage || 0}%`, sub: `${progressSummary?.completedTasks}/${progressSummary?.totalTasks} Nhiệm vụ`, icon: TrendingUp, color: 'var(--success)' },
          { label: 'Tổng số Commits', value: gitStats.totalCommits, sub: 'Dữ liệu từ GitHub', icon: GitCommit, color: 'var(--accent)' },
          { label: 'Thành viên nhóm', value: groupInfo?.members?.length || '0', sub: 'Đang hoạt động', icon: Users, color: 'var(--primary)' },
          { label: 'Điểm nỗ lực trung bình', value: `${gitStats.effortScore || '0.0'}/10`, sub: 'Dựa trên Task & Commit', icon: Award, color: 'var(--warning)' },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.25rem' }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
             <h3 style={{ fontSize: '1.15rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <Activity size={20} color="var(--primary)" />
               Lịch sử Phát triển dự án
             </h3>
             <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px' }}>Toàn thời gian</div>
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ stroke: 'var(--primary)', strokeWidth: 2, strokeDasharray: '5 5' }}
                  contentStyle={{ 
                    background: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid var(--glass-border)', 
                    borderRadius: '12px', 
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                  }}
                  labelStyle={{ color: '#fff', fontWeight: '900' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="completed" stroke="var(--primary)" fillOpacity={1} fill="url(#colorProgress)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <GitCommit size={20} color="var(--accent)" />
             Phân bổ Commits
          </h3>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gitStats.chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="username" type="category" stroke="var(--text-muted)" fontSize={11} width={100} axisLine={false} tickLine={false} />
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
                <Bar dataKey="commits" radius={[0, 6, 6, 0]} barSize={24}>
                  {gitStats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--primary)' : 'var(--accent)'} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
           <Zap size={20} color="var(--warning)" />
           Bảng xếp hạng Đóng góp Thành viên
        </h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Vị trí</th>
                <th>Họ tên & Mã SV</th>
                <th style={{ textAlign: 'center' }}>Nhiệm vụ (DONE)</th>
                <th style={{ textAlign: 'center' }}>Commits</th>
                <th style={{ textAlign: 'center' }}>Tỷ lệ Đóng góp</th>
                <th style={{ textAlign: 'center' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {contributions.length > 0 ? (
                contributions.map((m, i) => {
                  const totalCompleted = contributions.reduce((acc, curr) => acc + (curr.completedTaskCount || 0), 0);
                  const contribPercent = totalCompleted > 0 ? Math.round(((m.completedTaskCount || 0) / totalCompleted) * 100) : 0;
                  
                  return (
                    <tr key={i} className="table-row-hover">
                      <td style={{ fontWeight: '800', textAlign: 'center', color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--text-muted)' }}>
                        {i === 0 ? <Award size={20} /> : `#${i + 1}`}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                           <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', border: '1px solid rgba(99, 102, 241, 0.2)', fontWeight: '800', fontSize: '0.8rem' }}>
                             {m.studentName?.charAt(0)}
                           </div>
                           <div>
                             <p style={{ fontWeight: '700' }}>{m.studentName}</p>
                             <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700' }}>{m.studentCode || 'N/A'}</p>
                           </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '700' }}>{m.completedTaskCount}</td>
                      <td style={{ textAlign: 'center', fontWeight: '700', color: 'var(--accent)' }}>{m.commitCount}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                          <div style={{ width: '100px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ width: `${contribPercent}%`, height: '100%', background: i === 0 ? 'var(--warning)' : 'var(--primary)' }}></div>
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: '800' }}>{contribPercent}%</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          padding: '4px 12px', 
                          borderRadius: '20px', 
                          background: m.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                          color: m.status === 'ACTIVE' ? 'var(--success)' : 'var(--danger)', 
                          fontSize: '0.7rem', 
                          fontWeight: '900' 
                        }}>
                           {m.status === 'ACTIVE' ? <CheckCircle2 size={12} /> : <Zap size={12} />}
                           {m.status || 'INACTIVE'}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Chưa có dữ liệu đóng góp thực tế.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherReports;
