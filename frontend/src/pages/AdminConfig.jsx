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
  ArrowLeft
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
  const [syncing, setSyncing] = useState({ jira: false, github: false, mapping: false });

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
      
      const payload = type === 'Jira' 
        ? { platformType: 'JIRA', url: jiraData.url, email: jiraData.email, apiToken: jiraData.token, projectKey: jiraData.projectKey }
        : { platformType: 'GITHUB', repoUrl: githubData.repo, apiToken: githubData.token };

      const res = await configService.testConnection(payload);
      showToast(res.data?.message || `Kết nối ${type} ổn định!`, 'success');
    } catch (err) {
      console.error('Test Connection Error:', err);
      showToast(`Ping ${type} thất bại. Vui lòng kiểm tra lại cấu hình.`, 'danger');
    }
  };

  const handleSync = async (type) => {
    try {
      setSyncing(prev => ({ ...prev, [type]: true }));
      showToast(`Bắt đầu tiến trình đồng bộ ${type.toUpperCase()}...`, 'info');

      if (type === 'jira') await taskService.syncJira(activeGroupId);
      else if (type === 'github') await taskService.syncGithub(activeGroupId);
      else if (type === 'mapping') await taskService.mapping();

      showToast(`Đồng bộ ${type.toUpperCase()} hoàn tất!`, 'success');
    } catch (err) {
      console.error('Sync error:', err);
      showToast(`Đồng bộ ${type} không thành công.`, 'danger');
    } finally {
      setSyncing(prev => ({ ...prev, [type]: false }));
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
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: stats.jira ? 'var(--success)' : 'rgba(255,255,255,0.1)' }}></div>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: stats.github ? 'var(--success)' : 'rgba(255,255,255,0.1)' }}></div>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {groupStats[activeGroupId]?.jira ? <Wifi size={14} color="var(--success)" /> : <WifiOff size={14} />}
                    Jira Connection: {groupStats[activeGroupId]?.jira ? 'READY' : 'NOT LINKED'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {groupStats[activeGroupId]?.github ? <Wifi size={14} color="var(--success)" /> : <WifiOff size={14} />}
                    GitHub Hook: {groupStats[activeGroupId]?.github ? 'CONNECTED' : 'DISCONNECTED'}
                  </div>
                </div>
              </div>
              <button
                className="btn btn-outline"
                style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                onClick={() => handleSync('mapping')}
                disabled={syncing.mapping}
              >
                {syncing.mapping ? <RefreshCw size={16} className="animate-spin" /> : <Activity size={16} />}
                Khớp dữ liệu (Jira-Git Mapping)
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Jira Card */}
              <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
                  <div style={{ padding: '10px', background: 'rgba(0, 82, 204, 0.1)', color: '#0052CC', borderRadius: '12px' }}>
                    <Link2 size={24} />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '900' }}>Jira Integration</h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="input-group">
                    <label className="input-label">Workspace Site URL</label>
                    <input type="text" className="input-field" placeholder="https://cacmkt.atlassian.net" value={jiraData.url} onChange={e => setJiraData({ ...jiraData, url: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Admin Identity (Email)</label>
                    <input type="email" className="input-field" value={jiraData.email} onChange={e => setJiraData({ ...jiraData, email: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Atlassian API Token</label>
                    <input type="password" className="input-field" value={jiraData.token} onChange={e => setJiraData({ ...jiraData, token: e.target.value })} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-group">
                      <label className="input-label">Project Key</label>
                      <input type="text" className="input-field" value={jiraData.projectKey} onChange={e => setJiraData({ ...jiraData, projectKey: e.target.value })} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Done State Name</label>
                      <input type="text" className="input-field" value={jiraData.doneStatusName} onChange={e => setJiraData({ ...jiraData, doneStatusName: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <button className="glass-button" style={{ justifyContent: 'center', padding: '0.75rem' }} onClick={() => handleTest('Jira')}>
                      <Wifi size={18} /> Test Ping
                    </button>
                    <button className="glass-button" style={{ justifyContent: 'center', padding: '0.75rem', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid var(--primary)' }} onClick={handleSaveJira} disabled={isSaving}>
                      <Save size={18} color="var(--primary)" /> <span style={{ color: 'var(--primary)', fontWeight: '800' }}>Lưu Jira</span>
                    </button>
                  </div>
                  <button
                    className="glass-button"
                    style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderStyle: 'dashed', background: 'rgba(99, 102, 241, 0.05)' }}
                    onClick={() => handleSync('jira')}
                    disabled={syncing.jira}
                  >
                    {syncing.jira ? <RefreshCw size={20} className="animate-spin" /> : <RefreshCw size={20} color="var(--primary)" />}
                    <span style={{ marginLeft: '0.5rem', fontWeight: '800' }}>FETCH JIRA TASKS</span>
                  </button>
                </div>
              </div>

              {/* GitHub Card */}
              <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
                  <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', borderRadius: '12px' }}>
                    <GitBranch size={24} />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '900' }}>GitHub Source Sync</h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="input-group">
                    <label className="input-label">GitHub Repository (user/repo)</label>
                    <input type="text" className="input-field" placeholder="toann-java/prj-backend" value={githubData.repo} onChange={e => setGithubData({ ...githubData, repo: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Dev Access Token (PAT)</label>
                    <input type="password" className="input-field" value={githubData.token} onChange={e => setGithubData({ ...githubData, token: e.target.value })} />
                  </div>

                  <div className="glass-card" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.6' }}>
                      <Terminal size={20} style={{ flexShrink: 0 }} />
                      <p>Hệ thống sử dụng PAT để quét Commit API. Đảm bảo Scope <strong>repo:status</strong> được bật.</p>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <button className="glass-button" style={{ justifyContent: 'center', padding: '0.75rem' }} onClick={() => handleTest('GitHub')}>
                      <Wifi size={18} /> Test Ping
                    </button>
                    <button className="glass-button" style={{ justifyContent: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', border: '1px solid white' }} onClick={handleSaveGithub} disabled={isSaving}>
                      <Save size={18} /> <span style={{ fontWeight: '800' }}>Lưu Git</span>
                    </button>
                  </div>
                  <button
                    className="glass-button"
                    style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderStyle: 'dashed', background: 'rgba(255,255,255,0.05)' }}
                    onClick={() => handleSync('github')}
                    disabled={syncing.github}
                  >
                    {syncing.github ? <RefreshCw size={20} className="animate-spin" /> : <RefreshCw size={20} color="var(--secondary)" />}
                    <span style={{ marginLeft: '0.5rem', fontWeight: '800' }}>FETCH GITHUB COMMITS</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '8rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Settings size={48} style={{ opacity: 0.1, marginBottom: '2rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Infrastructure Ready</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '300px', marginTop: '0.5rem' }}>Vui lòng chọn một hàng dự án để thực hiện cầu nối dữ liệu (Data Bridge).</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminConfig;
