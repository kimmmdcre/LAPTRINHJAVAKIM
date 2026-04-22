import React, { useState, useEffect, useCallback } from 'react';
import { groupService, userService, configService } from '../services/api';
import { useUI } from '../context/UIContext';
import {
  Plus,
  Users,
  Search,
  ExternalLink,
  UserCheck,
  Trash2,
  FolderOpen,
  X,
  Settings,
  CheckCircle,
  GitBranch,
  AlertCircle,
  LayoutGrid,
  MoreVertical,
  UserPlus,
  ArrowRight,
  Filter,
  RefreshCw,
  Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminGroups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [draggedStudent, setDraggedStudent] = useState(null);
  const [groupConfigs, setGroupConfigs] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const [newGroupData, setNewGroupData] = useState({
    tenNhom: '',
    deTai: '',
    idGiangVien: ''
  });

  const { showToast } = useUI();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [groupsRes, teachersRes, unassignedRes] = await Promise.all([
        groupService.getAll(),
        userService.getTeachers(),
        userService.getUnassigned()
      ]);

      const fetchedGroups = groupsRes.data;
      setGroups(fetchedGroups);
      setTeachers(teachersRes.data);
      setStudents(unassignedRes.data);

      if (fetchedGroups.length > 0) {
        const configMap = {};
        for (const group of fetchedGroups) {
          try {
            const configRes = await configService.getConfig(group.idNhom);
            const configs = configRes.data;
            configMap[group.idNhom] = {
              hasJira: configs.some(c => c.loaiNenTang === 'JIRA' && c.url),
              hasGithub: configs.some(c => c.loaiNenTang === 'GITHUB' && c.repoUrl),
            };
          } catch {
            configMap[group.idNhom] = { hasJira: false, hasGithub: false };
          }
        }
        setGroupConfigs(configMap);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      showToast('Có lỗi khi tải dữ liệu hệ thống.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const handleAssignStudent = async (groupId, studentId) => {
    try {
      await groupService.addMember(groupId, studentId);
      showToast('Đã gán sinh viên vào nhóm mới!');
      fetchData();
    } catch {
      showToast('Không thể thêm sinh viên vào nhóm.', 'danger');
    }
  };

  const handleRemoveMember = async (studentId) => {
    try {
      await groupService.removeMember(studentId);
      showToast('Thành viên đã được đưa về danh sách tự do.');
      fetchData();
    } catch {
      showToast('Thao tác thất bại.', 'danger');
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await groupService.create(newGroupData);
      showToast('Khởi tạo nhóm dự án thành công!', 'success');
      setShowCreateModal(false);
      setNewGroupData({ tenNhom: '', deTai: '', idGiangVien: '' });
      fetchData();
    } catch {
      showToast('Lỗi khi tạo nhóm mới.', 'danger');
    }
  };

  const handleAssignTeacher = async () => {
    if (!selectedTeacherId) return;
    try {
      await groupService.assignTeacher(selectedGroup.idNhom, selectedTeacherId);
      showToast('Đã cập nhật giảng viên hướng dẫn.', 'success');
      setShowAssignModal(false);
      fetchData();
    } catch {
      showToast('Lỗi khi phân công giảng viên.', 'danger');
    }
  };

  const handleDeleteGroup = async (id) => {
    if (window.confirm('Xóa nhóm sẽ giải tán toàn bộ thành viên. Xác nhận xóa?')) {
      try {
        await groupService.delete(id);
        showToast('Đã xóa nhóm dự án.');
        fetchData();
      } catch {
        showToast('Lỗi khi xóa nhóm.', 'danger');
      }
    }
  };

  if (loading && groups.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '1rem' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      <p style={{ color: 'var(--text-secondary)' }}>Đang đồng bộ trung tâm điều phối...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Trung tâm Điều phối Nhóm</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Quan sát toàn cảnh hệ thống, phân bổ nhân sự và cố vấn học tập</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Tìm nhóm, đề tài..."
              className="input-field"
              style={{ paddingLeft: '40px', marginBottom: 0, width: '250px' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} /> Khởi tạo Nhóm
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Left: Free Students Panel */}
        <aside
          className="glass-card"
          style={{
            padding: '1.5rem',
            minHeight: '600px',
            border: draggedStudent?.isFromGroup ? '2px dashed var(--danger)' : '1px solid var(--glass-border)',
            background: 'rgba(15, 23, 42, 0.2)'
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (draggedStudent?.isFromGroup) e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
          }}
          onDragLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.background = 'transparent';
            if (draggedStudent?.isFromGroup) handleRemoveMember(draggedStudent.idSinhVien);
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', color: 'var(--primary)' }}>
              <Users size={20} />
            </div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '800' }}>Sinh viên Tự do</h3>
            <span style={{ marginLeft: 'auto', background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: '800' }}>{students?.length || 0}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(!students || students.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', opacity: 0.3 }}>
                <UserCheck size={32} style={{ margin: '0 auto 1rem' }} />
                <p style={{ fontSize: '0.8rem' }}>Mọi sinh viên đã được phân nhóm</p>
              </div>
            ) : students?.map(student => (
              <div
                key={student.id}
                draggable
                onDragStart={() => setDraggedStudent({ ...student, idSinhVien: student.id, isFromGroup: false })}
                onDragEnd={() => setDraggedStudent(null)}
                className="table-row-hover"
                style={{
                  padding: '0.85rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  cursor: 'grab',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'transform 0.2s',
                  opacity: draggedStudent?.idSinhVien === student.id ? 0.3 : 1
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(45deg, #1e293b, #334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-secondary)' }}>
                  {student.hoTen?.[0]}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: '700', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{student.hoTen}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{student.maSv || 'UNRANKED'}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right: Group Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
           {(!groups || groups.length === 0) ? (
             <div className="glass-card" style={{ gridColumn: '1/-1', padding: '5rem', textAlign: 'center', opacity: 0.5 }}>
                <Layers size={48} style={{ margin: '0 auto 1rem' }} />
                <p>Chưa có nhóm dự án nào được tạo.</p>
             </div>
           ) : groups?.filter(g => g.tenNhom.toLowerCase().includes(searchQuery.toLowerCase()) || g.deTai?.toLowerCase().includes(searchQuery.toLowerCase())).map(group => (
             <div 
               key={group.idNhom} 
               className="glass-card animate-slide-up"
               style={{ 
                 display: 'flex', flexDirection: 'column', padding: '1.75rem', 
                 transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                 border: '1px solid var(--glass-border)'
               }}
               onDragOver={(e) => {
                 e.preventDefault();
                 if (!draggedStudent?.isFromGroup) e.currentTarget.style.borderColor = 'var(--primary)';
               }}
               onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
               onDrop={(e) => {
                 e.preventDefault();
                 e.currentTarget.style.borderColor = 'var(--glass-border)';
                 if (!draggedStudent?.isFromGroup && draggedStudent) handleAssignStudent(group.idNhom, draggedStudent.idSinhVien);
               }}
             >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '14px', color: 'var(--primary)' }}>
                  <FolderOpen size={24} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn-hover" onClick={() => navigate('/admin/config', { state: { groupId: group.idNhom } })} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }} title="Tích hợp hệ thống">
                    <Settings size={18} />
                  </button>
                  <button className="btn-hover" onClick={() => handleDeleteGroup(group.idNhom)} style={{ background: 'none', border: 'none', color: 'var(--danger)' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>{group.tenNhom}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5', minHeight: '3rem' }}>
                {group.deTai || 'Đề tài đang được xây dựng...'}
              </p>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                  <span>Nhân sự dự án</span>
                  <span>{group.thanhViens?.length || 0}/5</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {group.thanhViens?.map((m, i) => (
                    <div
                      key={i}
                      draggable
                      onDragStart={() => setDraggedStudent({ ...m, isFromGroup: true })}
                      onDragEnd={() => setDraggedStudent(null)}
                      style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'grab' }}
                    >
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: m.idSinhVien === group.idTruongNhom ? 'var(--warning)' : 'var(--primary)' }}></div>
                      {m.hoTen}
                    </div>
                  ))}
                  {(!group.thanhViens || group.thanhViens.length < 5) && (
                    <div style={{ width: '100%', padding: '0.75rem', border: '1px dashed var(--glass-border)', borderRadius: '10px', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Drop here to add member
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px', background: groupConfigs[group.idNhom]?.hasJira ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.03)', color: groupConfigs[group.idNhom]?.hasJira ? 'var(--success)' : 'var(--text-muted)' }}>
                  <CheckCircle size={10} /> JIRA
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px', background: groupConfigs[group.idNhom]?.hasGithub ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.03)', color: groupConfigs[group.idNhom]?.hasGithub ? 'var(--success)' : 'var(--text-muted)' }}>
                  <GitBranch size={10} /> GITHUB
                </span>
              </div>

              <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {group.tenGiangVien?.[0] || '?'}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Cố vấn học tập</p>
                    <p style={{ fontSize: '0.8rem', fontWeight: '700' }}>{group.tenGiangVien || 'N/A'}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedGroup(group); setSelectedTeacherId(group.idGiangVien || ''); setShowAssignModal(true); }}
                  className="btn-hover" style={{ background: 'none', border: 'none', color: 'var(--primary)' }}
                >
                  <UserPlus size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Modals */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card animate-scale-in" style={{ width: '500px', padding: '2.5rem', border: '1px solid var(--primary)' }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Khởi tạo Nhóm</h3>
            <form onSubmit={handleCreateGroup}>
              <div className="input-group">
                <label className="input-label">Tên nhóm / Dự án</label>
                <input type="text" className="input-field" required value={newGroupData.tenNhom} onChange={e => setNewGroupData({ ...newGroupData, tenNhom: e.target.value })} placeholder="Project Crimson..." />
              </div>
              <div className="input-group">
                <label className="input-label">Mô tả đề tài</label>
                <textarea className="input-field" rows={3} value={newGroupData.deTai} onChange={e => setNewGroupData({ ...newGroupData, deTai: e.target.value })} placeholder="Hệ thống quản lý..." />
              </div>
              <div className="input-group">
                <label className="input-label">Chỉ định Gi giảng viên</label>
                <select className="input-field" required value={newGroupData.idGiangVien} onChange={e => setNewGroupData({ ...newGroupData, idGiangVien: e.target.value })}>
                  <option value="">-- Chọn cố vấn --</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.hoTen}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>Huỷ bỏ</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Khởi tạo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card animate-scale-in" style={{ width: '400px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem' }}>Phân công Cố vấn</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Dự án: <strong style={{ color: 'white' }}>{selectedGroup?.tenNhom}</strong></p>
            <select className="input-field" value={selectedTeacherId} onChange={e => setSelectedTeacherId(e.target.value)}>
              <option value="">-- Chọn giảng viên --</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.hoTen}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAssignModal(false)}>Đóng</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAssignTeacher}>Cập nhật</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGroups;
