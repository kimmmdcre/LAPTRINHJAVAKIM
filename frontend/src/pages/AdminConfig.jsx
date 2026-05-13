import React, { useState, useEffect, useCallback, useRef } from 'react';
import { groupService, configService, taskService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import {
  Settings,
  Link2,
  GitBranch,
  Globe,
  Save,
  Info,
  RefreshCw,
  Layers,
  CheckCircle,
  AlertCircle,
  Activity,
  ArrowRight,
  Database,
  Terminal,
  Cpu,
  ChevronRight,
  Wifi,
  WifiOff,
  ArrowLeft,
  Zap
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const AdminConfig = () => {
  const location = useLocation();
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [groupStats, setGroupStats] = useState({});

  const [jiraData, setJiraData] = useState({ url: '', email: '', token: '', projectKey: '', doneStatusName: 'Done' });
  const [githubData, setGithubData] = useState({ repo: '', token: '', since: '2024-01-01T00:00:00Z' });
  const [syncing, setSyncing] = useState({ jira: false, github: false, mapping: false, full: false });
  const [connectionStatus, setConnectionStatus] = useState({ jira: false, github: false });

  const { user } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const fetchCurrentConfig = useCallback(async (groupId) => {
    if (!groupId) return;
    try {
      const res = await configService.getConfig(groupId);
      if (!isMounted.current) return;

      const configs = Array.isArray(res.data) ? res.data : [];

      const newJira = { url: '', email: '', token: '', projectKey: '', doneStatusName: 'Done' };
      const newGithub = { repo: '', token: '', since: '2024-01-01T00:00:00Z' };

      configs.forEach(conf => {
        if (!conf) return;
        if (conf.platformType === 'JIRA') {
          newJira.url = conf.url || '';
          newJira.email = conf.email || '';
          newJira.token = conf.apiToken || '';
          newJira.projectKey = conf.projectKey || '';
          newJira.doneStatusName = conf.doneStatusName || 'Done';
        } else if (conf.platformType === 'GITHUB') {
          newGithub.repo = conf.repoUrl || '';
          newGithub.token = conf.apiToken || '';
        }
      });

      setJiraData(newJira);
      setGithubData(newGithub);
      setConnectionStatus({
        jira: configs.some(c => c?.platformType === 'JIRA' && c?.url),
        github: configs.some(c => c?.platformType === 'GITHUB' && c?.repoUrl)
      });
    } catch (err) {
      console.error('Config Fetch Error:', err);
      showToast('Lỗi khi truy xuất dữ liệu cấu hình.', 'danger');
    }
  }, [showToast]);

  const fetchGroups = useCallback(async () => {
    try {
      // Chỉ hiện loading nếu chưa có gì
      setError(null);
      const res = await groupService.getAll();
      if (!isMounted.current) return;

      const rawGroups = Array.isArray(res.data) ? res.data : [];
      
      const filteredGroups = user?.role === 'STUDENT' 
        ? rawGroups.filter(g => g.members?.some(m => m.studentId === user.id))
        : rawGroups;
        
      setGroups(filteredGroups);

      if (filteredGroups.length > 0) {
        // Sử dụng một hàm local để tránh phụ thuộc vào activeGroupId trong dependency array
        setActiveGroupId(prevId => {
          const targetId = prevId || location.state?.groupId || user?.groupId || filteredGroups[0]?.groupId;
          if (targetId) {
            fetchCurrentConfig(targetId);
          }
          return targetId;
        });
      }
    } catch (err) {
      console.error('Groups Fetch Error:', err);
      setError('Không thể kết nối đến hệ thống máy chủ. Vui lòng kiểm tra lại đường truyền.');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [location.state?.groupId, user?.groupId, user?.role, user?.id, fetchCurrentConfig]);

  const handleRefresh = async () => {
    await fetchGroups();
    showToast('Đã làm mới trạng thái hệ thống!', 'success');
  };

  // Fetch stats separately to avoid blocking main UI
  useEffect(() => {
    if (groups.length > 0) {
      const fetchStats = async () => {
        const stats = {};
        for (const g of groups) {
          if (!g?.groupId) continue;
          try {
            const confRes = await configService.getConfig(g.groupId);
            if (!isMounted.current) return;
            const configs = Array.isArray(confRes.data) ? confRes.data : [];
            stats[g.groupId] = {
              jira: configs.some(c => c?.platformType === 'JIRA' && c?.url),
              github: configs.some(c => c?.platformType === 'GITHUB' && c?.repoUrl)
            };
          } catch {
            stats[g.groupId] = { jira: false, github: false };
          }
        }
        if (isMounted.current) setGroupStats(stats);
      };
      fetchStats();
    }
  }, [groups]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleJiraUrlChange = (val) => {
    let url = val;
    let projectKey = jiraData.projectKey;

    try {
      if (val.includes('atlassian.net')) {
        // Extract base URL: https://xxx.atlassian.net
        const match = val.match(/(https?:\/\/[^/]+\.atlassian\.net)/i);
        if (match) {
          url = match[1];
        }

        // Try to extract Project Key
        // Patterns: /projects/KEY, /browse/KEY-123, /board/KEY
        const projectMatch = val.match(/\/projects\/([^/?#]+)/i) || 
                           val.match(/\/browse\/([^/-]+)-/i) ||
                           val.match(/\/classic\/projects\/([^/?#]+)/i);
        
        if (projectMatch && projectMatch[1]) {
          projectKey = projectMatch[1].toUpperCase();
        }
      }
    } catch (e) {
      console.error('URL Parsing Error:', e);
    }

    setJiraData(prev => ({ 
      ...prev, 
      url: url,
      projectKey: projectKey 
    }));
    setConnectionStatus(prev => ({ ...prev, jira: false }));
  };

  const handleGithubRepoChange = (val) => {
    let repo = val;
    try {
      if (val.includes('github.com/')) {
        // Extract user/repo from https://github.com/user/repo
        const match = val.match(/github\.com\/([^/]+\/[^/?#]+)/i);
        if (match && match[1]) {
          repo = match[1];
        }
      }
    } catch (e) {
      console.error('GitHub Parsing Error:', e);
    }
    setGithubData(prev => ({ ...prev, repo }));
    setConnectionStatus(prev => ({ ...prev, github: false }));
  };

  const handleGroupChange = (id) => {
    setActiveGroupId(id);
    fetchCurrentConfig(id);
  };

  const handleSaveJira = async () => {
    if (!activeGroupId) return;
    try {
      setIsSaving(true);
      await configService.saveConfig({
        groupId: activeGroupId,
        platformType: 'JIRA',
        url: jiraData.url,
        email: jiraData.email,
        apiToken: jiraData.token,
        projectKey: jiraData.projectKey
      });
      showToast('Đã lưu cấu hình Jira Cloud thành công!', 'success');
      fetchGroups();
    } catch (err) {
      console.error('Save Jira Error:', err);
      showToast('Lỗi lưu cấu hình Jira.', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGithub = async () => {
    if (!activeGroupId) return;
    try {
      setIsSaving(true);
      await configService.saveConfig({
        groupId: activeGroupId,
        platformType: 'GITHUB',
        repoUrl: githubData.repo,
        apiToken: githubData.token
      });
      showToast('Đã lưu cấu hình GitHub Repository!', 'success');
      fetchGroups();
    } catch (err) {
      console.error('Save Github Error:', err);
      showToast('Lỗi lưu cấu hình GitHub.', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async (type) => {
    try {
      showToast(`Đang thực hiện Ping ${type}...`, 'info');
      setConnectionStatus(prev => ({ ...prev, [type.toLowerCase()]: false }));
      
      const payload = type === 'Jira' 
        ? { platformType: 'JIRA', url: jiraData.url, email: jiraData.email, apiToken: jiraData.token, projectKey: jiraData.projectKey }
        : { platformType: 'GITHUB', repoUrl: githubData.repo, apiToken: githubData.token };

      const res = await configService.testConnection(payload);
      
      if (res.data?.success) {
        showToast(res.data?.message || `Kết nối ${type} ổn định!`, 'success');
        setConnectionStatus(prev => ({ ...prev, [type.toLowerCase()]: true }));
      } else {
        showToast(res.data?.message || `Ping ${type} thất bại. Vui lòng kiểm tra lại cấu hình.`, 'danger');
        setConnectionStatus(prev => ({ ...prev, [type.toLowerCase()]: false }));
      }
    } catch (err) {
      console.error('Test Connection Error:', err);
      showToast(`Ping ${type} thất bại. Vui lòng kiểm tra lại cấu hình.`, 'danger');
      setConnectionStatus(prev => ({ ...prev, [type.toLowerCase()]: false }));
    }
  };

  const handleSync = async (type) => {
    try {      
      if (type === 'jira') {
        await taskService.syncJira(activeGroupId);
        setConnectionStatus(prev => ({ ...prev, jira: true }));
      }
      else if (type === 'github') {
        await taskService.syncGithub(activeGroupId);
        setConnectionStatus(prev => ({ ...prev, github: true }));
      }
      else if (type === 'mapping') {
        const res = await taskService.mapping(activeGroupId);
        showToast(`Đã khớp thành công ${res.data.mappedCount} mục dữ liệu!`, 'success');
        return;
      }

      showToast(`Đồng bộ ${type.toUpperCase()} hoàn tất!`, 'success');
    } catch (err) {
      console.error('Sync error:', err);
      showToast(`Đồng bộ ${type} không thành công. Kiểm tra lại kết nối.`, 'danger');
      if (type === 'jira' || type === 'github') {
        setConnectionStatus(prev => ({ ...prev, [type]: false }));
      }
    } finally {
      setSyncing(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleFullSync = async () => {
    if (!activeGroupId) return;
    try {
      setSyncing(prev => ({ ...prev, full: true }));
      showToast('Đang khởi động tiến trình đồng bộ toàn diện (Jira + GitHub + Mapping)...', 'info');
      await taskService.syncFull(activeGroupId);
      showToast('Đã hoàn tất đồng bộ toàn diện dữ liệu dự án!', 'success');
      setConnectionStatus({ jira: true, github: true });
      fetchGroups();
    } catch (err) {
      console.error('Full Sync Error:', err);
      showToast('Tiến trình đồng bộ toàn diện thất bại. Kết nối bị ngắt quãng.', 'danger');
      setConnectionStatus({ jira: false, github: false });
    } finally {
      setSyncing(prev => ({ ...prev, full: false }));
    }
  };

  if (error) return (
    <div className="glass-card animate-fade-in" style={{ margin: '2rem', padding: '5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
       <AlertCircle size={64} color="var(--danger)" style={{ opacity: 0.5 }} />
       <div>
         <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Trung tâm tích hợp đang gặp sự cố</h3>
         <p style={{ color: 'var(--text-secondary)', maxWidth: '500px' }}>
            {error}
         </p>
       </div>
       <div style={{ display: 'flex', gap: '1rem' }}>
         <button className="btn btn-primary" onClick={() => fetchGroups()}>
            <RefreshCw size={18} /> Thử lại ngay
         </button>
         <button className="btn btn-outline" onClick={() => setError(null)}>
            Bỏ qua
         </button>
       </div>
    </div>
  );

  if (loading && groups.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '1rem' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      <p style={{ color: 'var(--text-secondary)' }}>Đang truy xuất hệ thống cấu hình...</p>
    </div>
  );

  const activeGroup = Array.isArray(groups) ? groups.find(g => g?.groupId === activeGroupId) : null;

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
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Trung tâm Kết nối & Tích hợp</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Quản lý luồng dữ liệu Jira Cloud và GitHub Source Control</p>
          </div>
        </div>
        <button className="btn btn-outline" onClick={handleRefresh}>
          <RefreshCw size={18} /> Làm mới trạng thái
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Navigation Sidebar */}
        <aside className="glass-card" style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
            <Layers size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: '800' }}>Danh sách Nhóm Đồ án</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {!Array.isArray(groups) || groups.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '2rem 0' }}>Không có nhóm nào.</p>
            ) : groups.map(g => {
              if (!g) return null;
              const stats = groupStats[g.groupId] || { jira: false, github: false };
              const isActive = activeGroupId === g.groupId;
              return (
                <div
                  key={g.groupId}
                  onClick={() => handleGroupChange(g.groupId)}
                  className="table-row-hover"
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--primary)' : 'var(--glass-border)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: isActive ? 'white' : 'var(--text-secondary)' }}>{g.groupName || 'Chưa đặt tên'}</span>
                    <ChevronRight size={14} style={{ opacity: isActive ? 1 : 0.2 }} />
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ 
                      width: '4px', height: '4px', borderRadius: '50%', 
                      background: (isActive && !connectionStatus.jira) ? 'var(--danger)' : stats.jira ? 'var(--success)' : 'rgba(255,255,255,0.1)' 
                    }}></div>
                    <div style={{ 
                      width: '4px', height: '4px', borderRadius: '50%', 
                      background: (isActive && !connectionStatus.github) ? 'var(--danger)' : stats.github ? 'var(--success)' : 'rgba(255,255,255,0.1)' 
                    }}></div>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        {/* Configuration Hub */}
        {activeGroupId ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Status Header */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'linear-gradient(to right, rgba(99, 102, 241, 0.1), transparent)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                <Cpu size={32} color="var(--primary)" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.25rem' }}>{activeGroup?.groupName}</h3>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: (groupStats[activeGroupId]?.jira && connectionStatus.jira) ? 'var(--text-muted)' : 'var(--danger)' }}>
                    {(groupStats[activeGroupId]?.jira && connectionStatus.jira) ? <Wifi size={14} color="var(--success)" /> : <WifiOff size={14} color="var(--danger)" />}
                    Kết nối Jira: {(groupStats[activeGroupId]?.jira && connectionStatus.jira) ? 'SẴN SÀNG' : 'MẤT KẾT NỐI'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: (groupStats[activeGroupId]?.github && connectionStatus.github) ? 'var(--text-muted)' : 'var(--danger)' }}>
                    {(groupStats[activeGroupId]?.github && connectionStatus.github) ? <Wifi size={14} color="var(--success)" /> : <WifiOff size={14} color="var(--danger)" />}
                    Cầu nối GitHub: {(groupStats[activeGroupId]?.github && connectionStatus.github) ? 'ĐÃ KẾT NỐI' : 'MẤT KẾT NỐI'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  className="btn btn-outline"
                  style={{ 
                    borderColor: 'var(--accent)', 
                    color: 'var(--accent)', 
                    padding: '0.6rem 1rem',
                    opacity: (groupStats[activeGroupId]?.jira && groupStats[activeGroupId]?.github) ? 1 : 0.5,
                    cursor: (groupStats[activeGroupId]?.jira && groupStats[activeGroupId]?.github) ? 'pointer' : 'not-allowed'
                  }}
                  onClick={() => handleSync('mapping')}
                  disabled={syncing.mapping || syncing.full || !groupStats[activeGroupId]?.jira || !groupStats[activeGroupId]?.github}
                >
                  {syncing.mapping ? <RefreshCw size={16} className="animate-spin" /> : <Activity size={16} />}
                  Khớp (Mapping)
                </button>
                <button
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', border: 'none', padding: '0.6rem 1.25rem' }}
                  onClick={handleFullSync}
                  disabled={syncing.full || syncing.jira || syncing.github}
                >
                  {syncing.full ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                  {syncing.full ? 'Đang xử lý...' : 'ĐỒNG BỘ TOÀN DIỆN'}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Jira Card */}
              <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
                  <div style={{ padding: '10px', background: 'rgba(0, 82, 204, 0.1)', color: '#0052CC', borderRadius: '12px' }}>
                    <Link2 size={24} />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '900' }}>Tích hợp Jira Cloud</h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="input-group">
                    <label className="input-label">Jira Software URL</label>
                    <input type="text" className="input-field" placeholder="https://cacmkt.atlassian.net" value={jiraData.url} onChange={e => handleJiraUrlChange(e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Email Quản trị (Admin)</label>
                    <input type="email" className="input-field" value={jiraData.email} onChange={e => { setJiraData({ ...jiraData, email: e.target.value }); setConnectionStatus(prev => ({ ...prev, jira: false })); }} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Personal access token</label>
                    <input type="password" className="input-field" value={jiraData.token} onChange={e => { setJiraData({ ...jiraData, token: e.target.value }); setConnectionStatus(prev => ({ ...prev, jira: false })); }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-group">
                      <label className="input-label">Project Key</label>
                      <input type="text" className="input-field" value={jiraData.projectKey} onChange={e => setJiraData({ ...jiraData, projectKey: e.target.value })} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Done status name</label>
                      <input type="text" className="input-field" value={jiraData.doneStatusName} onChange={e => { setJiraData({ ...jiraData, doneStatusName: e.target.value }); setConnectionStatus(prev => ({ ...prev, jira: false })); }} />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <button className="glass-button" style={{ justifyContent: 'center', padding: '0.75rem' }} onClick={() => handleTest('Jira')}>
                      <Wifi size={18} /> Kiểm tra kết nối
                    </button>
                    <button 
                      className="glass-button" 
                      style={{ 
                        justifyContent: 'center', 
                        padding: '0.75rem', 
                        background: connectionStatus.jira ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)', 
                        border: connectionStatus.jira ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                        opacity: connectionStatus.jira ? 1 : 0.5,
                        cursor: connectionStatus.jira ? 'pointer' : 'not-allowed'
                      }} 
                      onClick={handleSaveJira} 
                      disabled={isSaving || !connectionStatus.jira}
                    >
                      <Save size={18} color={connectionStatus.jira ? "var(--primary)" : "var(--text-muted)"} /> 
                      <span style={{ color: connectionStatus.jira ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '800' }}>Lưu cấu hình Jira</span>
                    </button>
                  </div>
                  <button
                    className="glass-button"
                    style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderStyle: 'dashed', background: 'rgba(99, 102, 241, 0.05)' }}
                    onClick={() => handleSync('jira')}
                    disabled={syncing.jira}
                  >
                    {syncing.jira ? <RefreshCw size={20} className="animate-spin" /> : <RefreshCw size={20} color="var(--primary)" />}
                    <span style={{ marginLeft: '0.5rem', fontWeight: '800' }}>ĐỒNG BỘ TASK JIRA</span>
                  </button>
                </div>
              </div>

              {/* GitHub Card */}
              <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
                  <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', borderRadius: '12px' }}>
                    <GitBranch size={24} />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '900' }}>Đồng bộ Source GitHub</h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="input-group">
                    <label className="input-label">GitHub Repository (user/repo)</label>
                    <input type="text" className="input-field" placeholder="toann-java/prj-backend" value={githubData.repo} onChange={e => handleGithubRepoChange(e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Personal access token</label>
                    <input type="password" className="input-field" value={githubData.token} onChange={e => { setGithubData({ ...githubData, token: e.target.value }); setConnectionStatus(prev => ({ ...prev, github: false })); }} />
                  </div>

                  <div className="glass-card" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.6' }}>
                      <Terminal size={20} style={{ flexShrink: 0 }} />
                      <p>Hệ thống sử dụng PAT để quét Commit API. Đảm bảo Scope <strong>repo:status</strong> đã được kích hoạt.</p>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <button className="glass-button" style={{ justifyContent: 'center', padding: '0.75rem' }} onClick={() => handleTest('GitHub')}>
                      <Wifi size={18} /> Kiểm tra kết nối
                    </button>
                    <button 
                      className="glass-button" 
                      style={{ 
                        justifyContent: 'center', 
                        padding: '0.75rem', 
                        background: connectionStatus.github ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)', 
                        border: connectionStatus.github ? '1px solid white' : '1px solid var(--glass-border)',
                        opacity: connectionStatus.github ? 1 : 0.5,
                        cursor: connectionStatus.github ? 'pointer' : 'not-allowed'
                      }} 
                      onClick={handleSaveGithub} 
                      disabled={isSaving || !connectionStatus.github}
                    >
                      <Save size={18} /> <span style={{ fontWeight: '800' }}>Lưu cấu hình Git</span>
                    </button>
                  </div>
                  <button
                    className="glass-button"
                    style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderStyle: 'dashed', background: 'rgba(255,255,255,0.05)' }}
                    onClick={() => handleSync('github')}
                    disabled={syncing.github}
                  >
                    {syncing.github ? <RefreshCw size={20} className="animate-spin" /> : <RefreshCw size={20} color="var(--secondary)" />}
                    <span style={{ marginLeft: '0.5rem', fontWeight: '800' }}>ĐỒNG BỘ COMMIT GITHUB</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '8rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Settings size={48} style={{ opacity: 0.1, marginBottom: '2rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Sẵn sàng Cấu hình</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '300px', marginTop: '0.5rem' }}>Vui lòng chọn một nhóm dự án từ danh sách bên trái để thiết lập cầu nối dữ liệu (Data Bridge).</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminConfig;
