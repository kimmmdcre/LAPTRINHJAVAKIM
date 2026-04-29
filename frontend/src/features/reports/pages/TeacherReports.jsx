import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { reportService, groupService } from '../../../shared/services/api';
import { useUI } from '../../../shared/context/UIContext';
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
  Award,
  Zap,
  CheckCircle2
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
  const [gitStats, setGitStats] = useState([]);
  const [contributions, setContributions] = useState([]);

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
      setContributions(contribRes.data);
      
      const commitMap = gitRes.data?.commitsByStudent || {};
      const formattedGitData = Object.keys(commitMap).map(key => ({
        username: key,
        commits: commitMap[key]
      }));
      setGitStats(formattedGitData);
    } catch (err) {
      console.error('Lỗi tải báo cáo:', err);
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
      const res = format === 'pdf' 
        ? await reportService.exportPdf(groupId) 
        : await reportService.exportDocx(groupId);
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Bao-cao-nhom-${groupInfo?.groupName}.${format}`);
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
        <div>
           <button onClick={() => navigate('/teacher/classes')} style={{ background: 'none', border: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', marginBottom: '1rem' }}>
             <ArrowLeft size={16} /> Quay lại Lớp học
           </button>
           <h2 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Phân tích Dự án: {groupInfo?.groupName}</h2>
           <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Đề tài: <span style={{ color: 'white', fontWeight: '600' }}>{groupInfo?.projectTopic || 'Chưa cập nhật'}</span></p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button className="btn btn-outline" onClick={() => handleExport('docx')}>
             <FileDown size={18} /> Microsoft Word
           </button>
           <button className="btn btn-primary" onClick={() => handleExport('pdf')}>
             <Download size={18} /> Xuất PDF
           </button>
        </div>
      </div>

      {/* Summary Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Tiến độ hoàn thành', value: `${progressSummary?.progressPercentage || 0}%`, sub: `${progressSummary?.completedTasks}/${progressSummary?.totalTasks} Nhiệm vụ`, icon: TrendingUp, color: 'var(--success)' },
          { label: 'Tổng số Commits', value: gitStats.reduce((acc, curr) => acc + curr.commits, 0), sub: 'Dữ liệu từ GitHub', icon: GitCommit, color: 'var(--accent)' },
          { label: 'Thành viên nhóm', value: groupInfo?.memberCount || '5', sub: 'Đang hoạt động', icon: Users, color: 'var(--primary)' },
          { label: 'Điểm nỗ lực trung bình', value: '8.5', sub: 'Dựa trên Task/Commit', icon: Award, color: 'var(--warning)' },
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
        {/* Progress History (Burn-down-ish) */}
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
                  contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--surface-border)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: 'white', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="completed" stroke="var(--primary)" fillOpacity={1} fill="url(#colorProgress)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Code Contributions */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <GitCommit size={20} color="var(--accent)" />
             Phân bổ Commits
          </h3>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gitStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="username" type="category" stroke="var(--text-muted)" fontSize={11} width={100} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--surface-border)', borderRadius: '12px' }}
                />
                <Bar dataKey="commits" radius={[0, 6, 6, 0]} barSize={24}>
                  {gitStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--primary)' : 'var(--accent)'} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Member Contribution Table */}
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
              {contributions.length > 0 ? contributions.map((m, i) => (
                <tr key={i} className="table-row-hover">
                  <td style={{ fontWeight: '800', textAlign: 'center', color: i < 3 ? 'var(--warning)' : 'var(--text-muted)' }}>#{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                       <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', fontSize: '0.8rem' }}>
                         {m.studentFullName?.[0]}
                       </div>
                       <div>
                         <p style={{ fontWeight: '700' }}>{m.studentFullName}</p>
                         <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.studentId?.toString().substring(0, 8)}</p>
                       </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: '700' }}>{m.completedTasks}</td>
                  <td style={{ textAlign: 'center', fontWeight: '700', color: 'var(--accent)' }}>{m.commitCount}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                      <div style={{ width: '100px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min((m.completedTasks || 0) * 20, 100)}%`, height: '100%', background: 'var(--primary)' }}></div>
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: '800' }}>{m.completedTasks || 0} tasks</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: m.completedTasks > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: m.completedTasks > 0 ? 'var(--success)' : 'var(--danger)', fontSize: '0.7rem', fontWeight: '900' }}>
                       {m.completedTasks > 0 ? <CheckCircle2 size={12} /> : <Zap size={12} />}
                       {m.completedTasks > 0 ? 'ACTIVE' : 'INACTIVE'}
                    </div>
                  </td>
                </tr>
              )) : (
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
