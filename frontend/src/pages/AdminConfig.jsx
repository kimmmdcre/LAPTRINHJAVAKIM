import React, { useState, useEffect, useCallback } from 'react';
import { groupService, configService, taskService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
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
  WifiOff
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

const AdminConfig = () => {
  const location = useLocation();
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [groupStats, setGroupStats] = useState({});

  const [jiraData, setJiraData] = useState({ url: '', email: '', token: '', projectKey: '', doneStatusName: 'Done' });
  const [githubData, setGithubData] = useState({ repo: '', token: '', since: '2024-01-01T00:00:00Z' });
  const [syncing, setSyncing] = useState({ jira: false, github: false, mapping: false });

  const { user } = useAuth();
  const { showToast } = useUI();

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const fetchCurrentConfig = useCallback(async (groupId) => {
    if (!groupId) return;
    try {
      const res = await configService.getConfig(groupId);
      const configs = res.data;

      const newJira = { url: '', email: '', token: '', projectKey: '', doneStatusName: 'Done' };
      const newGithub = { repo: '', token: '', since: '2024-01-01T00:00:00Z' };

      if (configs && Array.isArray(configs)) {
        configs.forEach(conf => {
          if (conf.loaiNenTang === 'JIRA') {
            newJira.url = conf.url || '';
            newJira.email = conf.email || '';
            newJira.token = conf.apiToken || '';
            newJira.projectKey = conf.projectKey || '';
            newJira.doneStatusName = conf.doneStatusName || 'Done';
          } else if (conf.loaiNenTang === 'GITHUB') {
            newGithub.repo = conf.repoUrl || '';
            newGithub.token = conf.apiToken || '';
          }
        });
      }

      setJiraData(newJira);
      setGithubData(newGithub);
    } catch {
      showToast('Lỗi khi truy xuất dữ liệu cấu hình.', 'danger');
    }
  }, [showToast]);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await groupService.getAll();
      const fetchedGroups = res.data || [];
      
      // Lọc nhóm nếu là sinh viên (chỉ thấy nhóm mình)
      const filteredGroups = user?.role === 'SINH_VIEN' 
        ? fetchedGroups.filter(g => g.idNhom === user.idNhom)
        : fetchedGroups;
        
      setGroups(filteredGroups);

      if (filteredGroups.length > 0) {
        // Ưu tiên groupId từ location state, sau đó là idNhom của user, sau đó là nhóm đầu tiên
        const targetId = location.state?.groupId || user?.idNhom || filteredGroups[0].idNhom;
        setActiveGroupId(targetId);
        fetchCurrentConfig(targetId);

        const stats = {};
        for (const g of filteredGroups) {
          try {
            const confRes = await configService.getConfig(g.idNhom);
            const configs = confRes.data;
            stats[g.idNhom] = {
              jira: configs?.some(c => c.loaiNenTang === 'JIRA' && c.url),
              github: configs?.some(c => c.loaiNenTang === 'GITHUB' && c.repoUrl)
            };
          } catch {
            stats[g.idNhom] = { jira: false, github: false };
          }
        }
        setGroupStats(stats);
      }
    } catch {
      showToast('Không thể kết nối đến danh sách nhóm.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [location.state?.groupId, user?.idNhom, user?.role, fetchCurrentConfig, showToast]);

  const handleGroupChange = (id) => {
    setActiveGroupId(id);
    fetchCurrentConfig(id);
  };

  const handleSaveJira = async () => {
    if (!activeGroupId) return;
    try {
      setIsSaving(true);
      await configService.saveJira(activeGroupId, jiraData);
      showToast('Đã lưu cấu hình Jira Cloud thành công!', 'success');
      fetchGroups();
    } catch {
      showToast('Lỗi lưu cấu hình Jira.', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGithub = async () => {
    if (!activeGroupId) return;
    try {
      setIsSaving(true);
      await configService.saveGithub(activeGroupId, githubData);
      showToast('Đã lưu cấu hình GitHub Repository!', 'success');
      fetchGroups();
    } catch {
      showToast('Lỗi lưu cấu hình GitHub.', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async (type) => {
    try {
      showToast(`Đang thực hiện Ping ${type}...`, 'info');
      const res = type === 'Jira'
        ? await configService.testJira(jiraData)
        : await configService.testGithub(githubData);
      showToast(res.data.message || `Kết nối ${type} ổn định!`, 'success');
    } catch {
      showToast('Ping failed. Vui lòng kiểm tra lại cấu hình.', 'danger');
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
    } catch {
      showToast(`Đồng bộ ${type} không thành công.`, 'danger');
    } finally {
      setSyncing(prev => ({ ...prev, [type]: false }));
    }
  };

  if (loading && groups.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '1rem' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      <p style={{ color: 'var(--text-secondary)' }}>Đang truy xuất hệ thống cấu hình...</p>
    </div>
  );

  const activeGroup = groups?.find(g => g.idNhom === activeGroupId);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Trung tâm Kết nối & Tích hợp</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Quản lý luồng dữ liệu Jira Cloud và GitHub Source Control</p>
        </div>
        <button className="btn btn-outline" onClick={fetchGroups}>
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
            {groups?.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '2rem 0' }}>Không có nhóm nào.</p>
            ) : groups?.map(g => {
              const stats = groupStats[g.idNhom] || { jira: false, github: false };
              const isActive = activeGroupId === g.idNhom;
              return (
                <div
                  key={g.idNhom}
                  onClick={() => handleGroupChange(g.idNhom)}
                  className="table-row-hover"
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: isActive ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--primary)' : 'var(--glass-border)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: isActive ? 'white' : 'var(--text-secondary)' }}>{g.tenNhom}</span>
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
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'linear-gradient(to right, var(--primary-glow), transparent)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                <Cpu size={32} color="var(--primary)" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.25rem' }}>{activeGroup?.tenNhom}</h3>
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
              {/* Jira Crystal Card */}
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

                <div style={{ marginTop: 'auto', paddingTop: '2.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '1rem', marginBottom: '1rem' }}>
                    <button className="btn btn-outline" style={{ justifyContent: 'center' }} onClick={() => handleTest('Jira')}>
                      Test Ping
                    </button>
                    <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={handleSaveJira} disabled={isSaving}>
                      <Save size={18} /> Lưu Cấu hình Jira
                    </button>
                  </div>
                  <button
                    className="btn btn-outline"
                    style={{ width: '100%', justifyContent: 'center', background: 'rgba(99, 102, 241, 0.03)', borderStyle: 'dashed' }}
                    onClick={() => handleSync('jira')}
                    disabled={syncing.jira}
                  >
                    {syncing.jira ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                    Fetch & Synchronize Tasks
                  </button>
                </div>
              </div>

              {/* GitHub Crystal Card */}
              <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
                  <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', borderRadius: '12px' }}>
                    <GitBranch size={24} />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '900' }}>GitHub Source Sync</h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="input-group">
                    <label className="input-label">Repository Repository (user/repo)</label>
                    <input type="text" className="input-field" placeholder="toann-java/prj-backend" value={githubData.repo} onChange={e => setGithubData({ ...githubData, repo: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Dev Access Token (PAT)</label>
                    <input type="password" className="input-field" value={githubData.token} onChange={e => setGithubData({ ...githubData, token: e.target.value })} />
                  </div>

                  <div className="glass-card" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.6' }}>
                      <Terminal size={20} style={{ flexShrink: 0 }} />
                      <p>Hệ thống sử dụng PAT để quét Commit API. Đảm bảo Scope <strong>repo:status</strong> được bật để xem tiến độ thực tế.</p>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '2.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '1rem', marginBottom: '1rem' }}>
                    <button className="btn btn-outline" style={{ justifyContent: 'center' }} onClick={() => handleTest('GitHub')}>
                      Ping Git
                    </button>
                    <button className="btn btn-primary" style={{ justifyContent: 'center', background: 'linear-gradient(135deg, #24292f, #444d56)' }} onClick={handleSaveGithub} disabled={isSaving}>
                      <Save size={18} /> Lưu Cấu hình Git
                    </button>
                  </div>
                  <button
                    className="btn btn-outline"
                    style={{ width: '100%', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', borderStyle: 'dashed' }}
                    onClick={() => handleSync('github')}
                    disabled={syncing.github}
                  >
                    {syncing.github ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                    Fetch & Map Commit History
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '8rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Settings size={48} style={{ opacity: 0.1, marginBottom: '2rem' }} className="animate-spin" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Infrastructure Ready</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '300px', marginTop: '0.5rem' }}>Vui lòng chọn một hàng dự án để thực hiện cầu nối dữ liệu (Data Bridge).</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminConfig;
