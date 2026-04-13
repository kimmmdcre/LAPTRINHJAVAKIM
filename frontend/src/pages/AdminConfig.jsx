import React, { useState, useEffect } from 'react';
import { groupService, configService } from '../services/api';
import { useUI } from '../context/UIContext';
import { Settings, Link2, GitBranch, Globe, Save, Info, RefreshCw, Layers } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { taskService } from '../services/api';

const AdminConfig = () => {
  const location = useLocation();
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [jiraData, setJiraData] = useState({ url: '', email: '', token: '', projectKey: '', doneStatusName: 'Done' });
  const [githubData, setGithubData] = useState({ repo: '', token: '', since: '2024-01-01T00:00:00Z' });
  const [syncing, setSyncing] = useState({ jira: false, github: false, mapping: false });

  const { showToast } = useUI();

  useEffect(() => {
    fetchGroups();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeGroupId) {
      fetchCurrentConfig();
    }
  }, [activeGroupId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCurrentConfig = async () => {
    try {
      const res = await configService.getConfig(activeGroupId);
      const configs = res.data;
      
      // Reset forms first
      setJiraData({ url: '', email: '', token: '', projectKey: '', doneStatusName: 'Done' });
      setGithubData({ repo: '', token: '', since: '2024-01-01T00:00:00Z' });

      configs.forEach(conf => {
        if (conf.loaiNenTang === 'JIRA') {
          setJiraData({
            url: conf.url || '',
            email: conf.email || '',
            token: conf.apiToken || '',
            projectKey: conf.projectKey || '',
            doneStatusName: conf.doneStatusName || 'Done'
          });
        } else if (conf.loaiNenTang === 'GITHUB') {
          setGithubData({
            repo: conf.repoUrl || '',
            token: conf.apiToken || '',
            since: '2024-01-01T00:00:00Z'
          });
        }
      });
    } catch (err) {
      console.error('Lỗi tải cấu hình hiện tại:', err);
    }
  };

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await groupService.getAll();
      setGroups(res.data);
      if (res.data.length > 0) {
        if (location.state?.groupId) {
          setActiveGroupId(location.state.groupId);
          // Optional: clear state so refresh doesn't force it again
          window.history.replaceState({}, document.title);
        } else {
          setActiveGroupId(res.data[0].idNhom);
        }
      }
    } catch (err) {
      console.error('Lỗi tải nhóm:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJira = async () => {
    if (!activeGroupId) {
      showToast('Chưa chọn nhóm nào.', 'danger');
      return;
    }
    if (!jiraData.url || !jiraData.email || !jiraData.token || !jiraData.projectKey) {
      showToast('Vui lòng điền đầy đủ thông tin Jira trước khi lưu.', 'warning');
      return;
    }
    try {
      setIsSaving(true);
      await configService.saveJira(activeGroupId, jiraData);
      showToast('Đã lưu cấu hình Jira thành công!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Lưu Jira thất bại.';
      console.error('Lỗi lưu Jira:', err);
      showToast(msg, 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGithub = async () => {
    if (!activeGroupId) {
      showToast('Chưa chọn nhóm nào.', 'danger');
      return;
    }
    if (!githubData.repo || !githubData.token) {
      showToast('Vui lòng điền Repository và Token trước khi lưu.', 'warning');
      return;
    }
    try {
      setIsSaving(true);
      await configService.saveGithub(activeGroupId, githubData);
      showToast('Đã lưu cấu hình GitHub thành công!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Lưu GitHub thất bại.';
      console.error('Lỗi lưu GitHub:', err);
      showToast(msg, 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async (type) => {
    const lcType = type.toLowerCase();
    if (lcType === 'jira' && (!jiraData.url || !jiraData.email || !jiraData.token || !jiraData.projectKey)) {
      showToast('Vui lòng điền đầy đủ thông tin Jira trước khi test.', 'warning');
      return;
    }
    if (lcType === 'github' && (!githubData.repo || !githubData.token)) {
      showToast('Vui lòng điền Repository và Token trước khi test.', 'warning');
      return;
    }
    try {
      showToast(`Đang kiểm tra kết nối tới ${type}...`, 'info');
      
      let res;
      if (lcType === 'jira') {
        res = await configService.testJira(jiraData);
      } else {
        res = await configService.testGithub(githubData);
      }
      
      showToast(res.data.message || `Kết nối ${type} thành công!`, 'success');
    } catch (err) {
      console.error(`Lỗi test ${type}:`, err);
      const errorMsg = err.response?.data?.message || err.message || `Không thể kết nối tới ${type}.`;
      showToast(errorMsg, 'danger');
    }
  };

  const handleSync = async (type) => {
    if (!activeGroupId) return;
    try {
      setSyncing(prev => ({ ...prev, [type]: true }));
      showToast(`Đang bắt đầu đồng bộ ${type}...`, 'info');
      
      if (type === 'jira') await taskService.syncJira(activeGroupId);
      else if (type === 'github') await taskService.syncGithub(activeGroupId);
      else if (type === 'mapping') await taskService.mapping();
      
      showToast(`Đồng bộ ${type} thành công!`);
    } catch (err) {
      console.error('Lỗi sync:', err);
      showToast('Đồng bộ thất bại.', 'danger');
    } finally {
      setSyncing(prev => ({ ...prev, [type]: false }));
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
    </div>
  );

  const activeGroup = groups.find(g => g.idNhom === activeGroupId);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Cấu hình Tích hợp</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Kết nối dự án Jira và Kho chứa mã nguồn GitHub cho từng nhóm</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr', gap: '2rem' }}>
        {/* Left: Group Selection */}
        <div className="glass-card" style={{ padding: '1rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', padding: '0.5rem', fontWeight: 'bold' }}>Danh sách Nhóm</h3>
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {groups.map(group => (
              <div
                key={group.idNhom}
                onClick={() => setActiveGroupId(group.idNhom)}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '0.5rem',
                  transition: 'var(--transition)',
                  background: activeGroupId === group.idNhom ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  color: activeGroupId === group.idNhom ? 'white' : 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              >
                {group.tenNhom}
              </div>
            ))}
          </div>
          {groups.length === 0 && <p style={{ textAlign: 'center', fontSize: '0.875rem', opacity: 0.5 }}>Chưa có nhóm nào</p>}
        </div>

        {/* Right: Config Forms */}
        {activeGroupId ? (
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)' }}>
                <Settings size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>Thiết lập cho: <strong>{activeGroup?.tenNhom}</strong></h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
              {/* Jira Section */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#0052CC' }}>
                  <Link2 size={24} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white' }}>Jira Integration</h4>
                </div>

                <div className="input-group">
                  <label className="input-label">Jira Host URL</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="https://domain.atlassian.net"
                    value={jiraData.url}
                    onChange={e => setJiraData({ ...jiraData, url: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Jira Email</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="example@company.com"
                    value={jiraData.email}
                    onChange={e => setJiraData({ ...jiraData, email: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Atlassian API Token</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Nhập API token..."
                    value={jiraData.token}
                    onChange={e => setJiraData({ ...jiraData, token: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Project Key</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. PROJ"
                    value={jiraData.projectKey}
                    onChange={e => setJiraData({ ...jiraData, projectKey: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Done Status Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Done or Hoàn thành"
                    value={jiraData.doneStatusName}
                    onChange={e => setJiraData({ ...jiraData, doneStatusName: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ justifyContent: 'center' }}
                    onClick={() => handleTestConnection('Jira')}
                  >
                    <Globe size={16} />
                    Test
                  </button>
                  <button 
                    className="btn btn-primary" 
                    style={{ justifyContent: 'center' }}
                    onClick={handleSaveJira}
                    disabled={isSaving}
                  >
                    <Save size={16} />
                    Lưu Jira
                  </button>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                    onClick={() => handleSync('jira')}
                    disabled={syncing.jira}
                  >
                    {syncing.jira ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    Sync Jira Data
                  </button>
                </div>
              </div>

              {/* GitHub Section */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#f0f6fc' }}>
                  <GitBranch size={24} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white' }}>GitHub Integration</h4>
                </div>

                <div className="input-group">
                  <label className="input-label">GitHub Repository</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="owner/repo-name"
                    value={githubData.repo}
                    onChange={e => setGithubData({ ...githubData, repo: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Personal Access Token</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Nhập GitHub PAT..."
                    value={githubData.token}
                    onChange={e => setGithubData({ ...githubData, token: e.target.value })}
                  />
                </div>
                
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ justifyContent: 'center' }}
                    onClick={() => handleTestConnection('GitHub')}
                  >
                    <Globe size={16} />
                    Test
                  </button>
                  <button 
                    className="btn btn-primary" 
                    style={{ justifyContent: 'center', background: 'linear-gradient(135deg, #24292f, #444d56)' }}
                    onClick={handleSaveGithub}
                    disabled={isSaving}
                  >
                    <Save size={16} />
                    Lưu GitHub
                  </button>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ width: '100%', justifyContent: 'center', borderColor: '#f0f6fc', color: '#f0f6fc' }}
                    onClick={() => handleSync('github')}
                    disabled={syncing.github}
                  >
                    {syncing.github ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    Sync GitHub Data
                  </button>
                </div>

                <button 
                  className="btn btn-outline" 
                  style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', background: 'rgba(255,255,255,0.05)' }}
                  onClick={() => handleSync('mapping')}
                  disabled={syncing.mapping}
                >
                  <RefreshCw size={16} className={syncing.mapping ? "animate-spin" : ""} />
                  Mapping Task-Commit
                </button>
              </div>
            </div>

            <div style={{
              marginTop: '2rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--surface-border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <Info size={16} />
                <span>Các cấu hình đã lưu sẽ được áp dụng ngay khi nhấn Đồng bộ (Sync).</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
            <Settings size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Vui lòng chọn một nhóm từ danh sách bên trái để cấu hình.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminConfig;
