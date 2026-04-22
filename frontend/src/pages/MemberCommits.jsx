import React, { useState, useEffect } from 'react';
import { reportService, groupService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import {
  GitCommit,
  Clock,
  ExternalLink,
  Code,
  Search,
  Filter,
  Calendar,
  GitBranch,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const MemberCommits = () => {
  const { user } = useAuth();
  const { showToast } = useUI();
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupInfo, setGroupInfo] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchMyCommits();
    }
  }, [user]);

  const fetchMyCommits = async () => {
    try {
      setLoading(true);
      // First find my group
      const groupsRes = await groupService.getAll();
      const myGroup = groupsRes.data.find(g =>
        g.thanhViens?.some(m => m.idSinhVien === user.id)
      );

      if (myGroup) {
        setGroupInfo(myGroup);
        const res = await reportService.getCommitHistory(myGroup.idNhom);
        // Filter only my commits or show all for the group? 
        // Showing all for the group is better for transparency, but highlight mine.
        setCommits(res.data || []);
      }
    } catch (err) {
      console.error('Lỗi tải commit:', err);
      showToast('Không thể tải lịch sử đóng góp GitHub.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const filteredCommits = commits.filter(c =>
    c.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.taskKey?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && commits.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '1rem' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      <p style={{ color: 'var(--text-secondary)' }}>Đang truy xuất lịch sử GitHub...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Lịch sử Đóng góp Code</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Dòng thời gian các bản cập nhật mã nguồn từ <strong>Repository</strong> của nhóm
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} size={16} />
            <input
              type="text"
              placeholder="Tìm lời nhắn hoặc mã Task..."
              className="input-field"
              style={{ paddingLeft: '36px', minWidth: '300px', margin: 0 }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {!groupInfo ? (
        <div className="glass-card" style={{ padding: '6rem', textAlign: 'center' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--warning)', opacity: 0.5 }} />
          <h3>Bạn chưa thuộc nhóm nào</h3>
          <p style={{ color: 'var(--text-muted)' }}>Vui lòng liên hệ quản trị viên hoặc trưởng nhóm để tham gia dự án.</p>
        </div>
      ) : filteredCommits.length === 0 ? (
        <div className="glass-card" style={{ padding: '6rem', textAlign: 'center', borderStyle: 'dashed' }}>
          <Code size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--text-muted)', opacity: 0.3 }} />
          <h3>Chưa có dữ liệu đóng góp</h3>
          <p style={{ color: 'var(--text-muted)' }}>Hãy bắt đầu bằng cách commit mã nguồn với định dạng kèm mã Jira Task.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
          {/* Vertical line indicator */}
          <div style={{ position: 'absolute', left: '26px', top: '20px', bottom: '20px', width: '2px', background: 'linear-gradient(to bottom, var(--primary), var(--accent), transparent)', opacity: 0.2 }}></div>

          {filteredCommits.map((commit, idx) => {
            const isMine = commit.author?.toLowerCase().includes(user?.hoTen?.toLowerCase()) || commit.author?.toLowerCase().includes(user?.tenDangNhap?.toLowerCase());

            return (
              <div key={idx} className="animate-slide-up" style={{ display: 'flex', gap: '1.5rem', position: 'relative' }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: isMine ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'rgba(255,255,255,0.05)',
                  border: '2px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                  boxShadow: isMine ? '0 0 20px rgba(99, 102, 241, 0.3)' : 'none'
                }}>
                  <GitCommit size={24} color="white" />
                </div>

                <div className="glass-card" style={{ flex: 1, padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: isMine ? '3px solid var(--primary)' : '1px solid var(--glass-border)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                      <p style={{ fontWeight: '800', fontSize: '1.1rem' }}>{commit.message}</p>
                      {commit.taskKey && (
                        <span style={{ fontSize: '0.65rem', fontWeight: '900', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', padding: '2px 8px', borderRadius: '4px' }}>
                          {commit.taskKey}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={14} />
                        {commit.timestamp ? new Date(commit.timestamp).toLocaleString() : 'Vừa xong'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isMine ? 'var(--primary)' : 'var(--text-muted)' }}>
                        <GitBranch size={14} />
                        Tác giả: <strong>{commit.author}</strong> {isMine && '(Bạn)'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right', paddingRight: '1rem', borderRight: '1px solid var(--glass-border)', fontSize: '0.75rem' }}>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>Hash</p>
                      <p style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{commit.hash?.substring(0, 7) || '7fb3a12'}</p>
                    </div>
                    <a href={commit.url || '#'} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '0.6rem' }}>
                      <ExternalLink size={18} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MemberCommits;
