import React, { useState, useEffect } from 'react';
import { groupService, configService } from '../services/api';
import { useUI } from '../context/UIContext';
import { Settings, Link2, GitBranch, Globe, Save, Info, RefreshCw } from 'lucide-react';

const AdminConfig = () => {
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [jiraData, setJiraData] = useState({ url: '', token: '' });
  const [githubData, setGithubData] = useState({ repo: '', token: '', since: '2024-01-01T00:00:00Z' });

  const { showToast } = useUI();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await groupService.getAll();
      setGroups(res.data);
      if (res.data.length > 0) setActiveGroupId(res.data[0].idNhom);
    } catch (err) {
      console.error('Lỗi tải nhóm:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!activeGroupId) return;
    try {
      setIsSaving(true);
      await Promise.all([
        configService.saveJira(activeGroupId, jiraData),
        configService.saveGithub(activeGroupId, githubData)
      ]);
      showToast('Đã lưu cấu hình tích hợp thành công!');
    } catch (err) {
      showToast('Lỗi khi lưu cấu hình.', 'danger');
    } finally {
      setIsSaving(false);
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
                  <label className="input-label">Atlassian API Token</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Nhập API token..."
                    value={jiraData.token}
                    onChange={e => setJiraData({ ...jiraData, token: e.target.value })}
                  />
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
              </div>
            </div>

            <div style={{
              marginTop: '2rem',
              paddingTop: '2rem',
              borderTop: '1px solid var(--surface-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <Info size={16} />
                <span>Các cấu hình sẽ được lưu vào cơ sở dữ liệu sau khi nhấn Lưu.</span>
              </div>
              <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                {isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}
              </button>
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
