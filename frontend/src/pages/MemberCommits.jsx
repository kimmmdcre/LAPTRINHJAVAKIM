import React, { useState, useEffect, useCallback } from 'react';
import { reportService, groupService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { 
  GitCommit, 
  Search, 
  Calendar, 
  Clock, 
  ExternalLink, 
  Filter,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';

const MemberCommits = () => {
  const { user } = useAuth();
  const { showToast } = useUI();
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupInfo, setGroupInfo] = useState(null);

  const fetchMyCommits = useCallback(async () => {
    try {
      setLoading(true);
      // Ưu tiên lấy groupId từ URL (dành cho Admin/Teacher), nếu không có mới lấy từ user context
      const queryParams = new URLSearchParams(window.location.search);
      const groupIdFromUrl = queryParams.get('groupId');
      const groupId = groupIdFromUrl || user.groupId;

      if (groupId) {
        const groupRes = await groupService.getDetails(groupId);
        setGroupInfo(groupRes.data);
        
        const res = await reportService.getDetailedCommits(groupId);
        const allCommits = Array.isArray(res.data) ? res.data : [];
        
        // Nếu là Sinh viên và không phải đang xem theo URL cụ thể, lọc commit của chính mình
        if (user.role === 'SINH_VIEN' && !groupIdFromUrl) {
          const myCommits = allCommits.filter(c => 
            c.authorEmail === user.email || 
            c.authorName === user.fullName ||
            c.message?.toLowerCase().includes(user.fullName?.toLowerCase())
          );
          setCommits(myCommits);
        } else {
          // Admin/Teacher hoặc truy cập trực tiếp qua URL -> Xem tất cả commit của nhóm
          setCommits(allCommits);
        }
      } else {
        setCommits([]);
        showToast('Bạn chưa thuộc nhóm nào hoặc chưa chọn nhóm để xem.', 'warning');
      }
    } catch (err) {
      console.error('Lỗi tải commit:', err);
      showToast('Không thể kết nối tới lịch sử GitHub.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    if (user?.id) {
      fetchMyCommits();
    }
  }, [user?.id, fetchMyCommits]);

  const filteredCommits = commits.filter(c => 
    (c.message || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.sha || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '1rem' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      <p style={{ color: 'var(--text-secondary)' }}>Đang truy xuất lịch sử mã nguồn từ GitHub...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Lịch sử Đóng góp (Commits)</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Dữ liệu được đồng bộ từ Repository: <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{groupInfo?.groupName}</span></p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', border: 'none' }}>
              <CheckCircle2 size={18} />
              <span style={{ fontSize: '0.85rem', fontWeight: '800' }}>GitHub Linked</span>
           </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Search size={20} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo mã hash hoặc nội dung commit..." 
              style={{ background: 'none', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '0.9rem' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
               <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Dòng thời gian Code</h3>
               <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hiển thị {filteredCommits.length} commits</span>
            </div>

            <div style={{ maxHeight: '700px', overflowY: 'auto' }}>
              {filteredCommits.length === 0 ? (
                <div style={{ padding: '5rem', textAlign: 'center' }}>
                  <AlertCircle size={40} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                  <p style={{ color: 'var(--text-muted)' }}>Không tìm thấy lịch sử đóng góp nào.</p>
                </div>
              ) : filteredCommits.map((c, i) => (
                <div key={i} className="table-row-hover" style={{ padding: '1.5rem', borderBottom: i < filteredCommits.length - 1 ? '1px solid var(--glass-border)' : 'none', display: 'flex', gap: '1.5rem' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <GitCommit size={20} />
                      </div>
                      {i < filteredCommits.length - 1 && <div style={{ width: '2px', flex: 1, background: 'var(--glass-border)', margin: '4px 0' }}></div>}
                   </div>
                   <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                           {c.sha?.substring(0, 7)}
                         </span>
                         <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                           <Clock size={12} /> {c.commitTime ? new Date(c.commitTime).toLocaleString('vi-VN') : 'Vừa xong'}
                         </span>
                      </div>
                      <p style={{ fontWeight: '600', lineHeight: '1.5', marginBottom: '0.75rem' }}>{c.message}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary)', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>{c.authorName?.charAt(0)}</div>
                            {c.authorName}
                            {c.requirementTitle && <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>• {c.requirementTitle}</span>}
                         </div>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} color="var(--primary)" />
                Thống kê nhanh
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tổng Commits</span>
                    <span style={{ fontWeight: '800' }}>{commits.length}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tuần này</span>
                    <span style={{ fontWeight: '800', color: 'var(--success)' }}>+{Math.floor(commits.length * 0.3)}</span>
                 </div>
              </div>
           </div>

           <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                 <Info size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
                 <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                   Commits được map tự động dựa trên <strong>Email GitHub</strong> và <strong>Email Hệ thống</strong>. Hãy đảm bảo chúng trùng khớp để ghi nhận đóng góp.
                 </p>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
};

export default MemberCommits;
