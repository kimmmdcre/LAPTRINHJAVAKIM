import React, { useState, useEffect, useCallback } from 'react';
import { groupService, userService, configService } from '../services/api';
import { useUI } from '../contexts/UIContext';
import {
  Plus,
  Users,
  Search,
  UserCheck,
  Trash2,
  FolderOpen,
  Settings,
  CheckCircle,
  GitBranch,
  Layers,
  UserPlus,
  UserMinus,
  GitCommit,
  Activity
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
    groupName: '',
    projectTopic: '',
    teacherId: ''
  });

  const { showToast } = useUI();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [groupsRes, teachersRes, unassignedRes] = await Promise.all([
        groupService.getAll(),
        userService.getTeachers(),
        userService.getUnassigned()
      ]);

      const fetchedGroups = Array.isArray(groupsRes.data) ? groupsRes.data : [];
      setGroups(fetchedGroups);
      setTeachers(Array.isArray(teachersRes.data) ? teachersRes.data : []);
      setStudents(Array.isArray(unassignedRes.data) ? unassignedRes.data : []);

      if (fetchedGroups.length > 0) {
        const configMap = {};
        for (const group of fetchedGroups) {
          if (!group?.groupId) continue;
          try {
            const configRes = await configService.getConfig(group.groupId);
            const configs = Array.isArray(configRes.data) ? configRes.data : [];
            configMap[group.groupId] = {
              hasJira: configs.some(c => c?.platformType === 'JIRA' && c?.url),
              hasGithub: configs.some(c => c?.platformType === 'GITHUB' && c?.repoUrl),
            };
          } catch {
            configMap[group.groupId] = { hasJira: false, hasGithub: false };
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssignStudent = async (groupId, studentId) => {
    if (!groupId || !studentId) return;
    try {
      await groupService.addMember(groupId, studentId);
      showToast('Đã gán sinh viên vào nhóm mới!');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Không thể thêm sinh viên vào nhóm.', 'danger');
    }
  };

  const handleRemoveMember = async (groupId, studentId) => {
    if (!studentId || !groupId) return;
    try {
      await groupService.removeMember(groupId, studentId);
      showToast('Thành viên đã được đưa về danh sách tự do.');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Thao tác thất bại.', 'danger');
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await groupService.create(newGroupData);
      showToast('Khởi tạo nhóm dự án thành công!', 'success');
      setShowCreateModal(false);
      setNewGroupData({ groupName: '', projectTopic: '', teacherId: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi tạo nhóm mới.', 'danger');
    }
  };

  const handleAssignTeacher = async () => {
    if (!selectedTeacherId || !selectedGroup?.groupId) return;
    try {
      await groupService.assignTeacher(selectedGroup.groupId, selectedTeacherId);
      showToast('Đã cập nhật giảng viên hướng dẫn.', 'success');
      setShowAssignModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi phân công giảng viên.', 'danger');
    }
  };

  const handleDeleteGroup = async (id) => {
    if (!id) return;
    if (window.confirm('Xóa nhóm sẽ giải tán toàn bộ thành viên. Xác nhận xóa?')) {
      try {
        await groupService.delete(id);
        showToast('Đã xóa nhóm dự án.');
        fetchData();
      } catch (err) {
        console.error(err);
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

  const filteredGroups = groups.filter(g => g && (
    (g.groupName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
    (g.projectTopic?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  ));

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
        {/* Sidebar: Unassigned Students */}
        <aside
          className="glass-card"
          style={{
            padding: '1.5rem',
            minHeight: '600px',
            background: 'rgba(15, 23, 42, 0.2)',
            border: draggedStudent?.isFromGroup ? '2px dashed var(--danger)' : '1px solid var(--glass-border)'
          }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            if (draggedStudent?.isFromGroup && draggedStudent?.studentId && draggedStudent?.groupId) {
              handleRemoveMember(draggedStudent.groupId, draggedStudent.studentId);
            }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Users size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: '800' }}>Sinh viên Tự do ({students.length})</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {students.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5, fontSize: '0.8rem' }}>
                 <UserCheck size={24} style={{ margin: '0 auto 0.5rem' }} />
                 <p>Đã hết sinh viên tự do</p>
               </div>
            ) : students.map(s => s && (
              <div
                key={s.id}
                draggable
                onDragStart={() => setDraggedStudent({ ...s, studentId: s.id, isFromGroup: false })}
                onDragEnd={() => setDraggedStudent(null)}
                className="table-row-hover"
                style={{
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '10px',
                  cursor: 'grab',
                  opacity: draggedStudent?.studentId === s.id ? 0.3 : 1
                }}
              >
                <p style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{s.fullName}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.studentCode}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content: Groups Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {filteredGroups.length === 0 ? (
            <div className="glass-card" style={{ gridColumn: '1/-1', padding: '5rem', textAlign: 'center', opacity: 0.5 }}>
              <Layers size={48} style={{ margin: '0 auto 1rem' }} />
              <p>Chưa có nhóm dự án nào được tìm thấy.</p>
            </div>
          ) : filteredGroups.map(group => (
            <div
              key={group.groupId}
              className="glass-card animate-slide-up"
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--glass-border)' }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                if (!draggedStudent?.isFromGroup && draggedStudent?.studentId) {
                  handleAssignStudent(group.groupId, draggedStudent.studentId);
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
                  <FolderOpen size={20} />
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="btn-hover" title="Cấu hình" onClick={() => navigate('/admin/config', { state: { groupId: group.groupId } })} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>
                    <Settings size={16} />
                  </button>
                  <button className="btn-hover" title="Lịch sử Commit" onClick={() => navigate(`/member/commits?groupId=${group.groupId}`)} style={{ background: 'none', border: 'none', color: 'var(--primary)' }}>
                    <GitCommit size={16} />
                  </button>
                  <button className="btn-hover" title="Phân tích" onClick={() => navigate(`/project/heatmap?groupId=${group.groupId}`)} style={{ background: 'none', border: 'none', color: 'var(--accent)' }}>
                    <Activity size={16} />
                  </button>
                  <button className="btn-hover" title="Xóa nhóm" onClick={() => handleDeleteGroup(group.groupId)} style={{ background: 'none', border: 'none', color: 'var(--danger)' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>{group.groupName}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{group.projectTopic || 'Chưa có đề tài'}</p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  <span>Thành viên</span>
                  <span>{group.members?.length || 0}/5</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {group.members?.map((m, idx) => (
                    <div
                      key={m.studentId || idx}
                      draggable
                      onDragStart={() => setDraggedStudent({ ...m, isFromGroup: true, groupId: group.groupId })}
                      onDragEnd={() => setDraggedStudent(null)}
                      style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '8px', fontSize: '0.75rem', cursor: 'grab', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: m.studentId === group.leaderId ? 'var(--warning)' : 'var(--primary)' }}></div>
                      {m.fullName}
                    </div>
                  ))}
                  {(!group.members || group.members.length < 5) && (
                    <div style={{ padding: '4px 10px', border: '1px dashed var(--glass-border)', borderRadius: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      + Drop here
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem' }}>
                 <span style={{ fontSize: '0.65rem', fontWeight: '800', padding: '4px 8px', borderRadius: '4px', background: groupConfigs[group.groupId]?.hasJira ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.05)', color: groupConfigs[group.groupId]?.hasJira ? 'var(--success)' : 'var(--text-muted)' }}>
                   JIRA
                 </span>
                 <span style={{ fontSize: '0.65rem', fontWeight: '800', padding: '4px 8px', borderRadius: '4px', background: groupConfigs[group.groupId]?.hasGithub ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.05)', color: groupConfigs[group.groupId]?.hasGithub ? 'var(--success)' : 'var(--text-muted)' }}>
                   GITHUB
                 </span>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                    {group.teacherName?.[0] || '?'}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>CỐ VẤN</p>
                    <p style={{ fontSize: '0.8rem', fontWeight: '700' }}>{group.teacherName || 'Chưa phân công'}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedGroup(group); setSelectedTeacherId(group.teacherId || ''); setShowAssignModal(true); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                >
                  <UserPlus size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card animate-slide-up" style={{ width: '450px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '1.5rem' }}>Khởi tạo Nhóm</h3>
            <form onSubmit={handleCreateGroup}>
              <div className="input-group">
                <label className="input-label">Tên nhóm</label>
                <input type="text" className="input-field" required value={newGroupData.groupName} onChange={e => setNewGroupData({ ...newGroupData, groupName: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Đề tài</label>
                <textarea className="input-field" rows={2} value={newGroupData.projectTopic} onChange={e => setNewGroupData({ ...newGroupData, projectTopic: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Giảng viên hướng dẫn</label>
                <select className="input-field" required value={newGroupData.teacherId} onChange={e => setNewGroupData({ ...newGroupData, teacherId: e.target.value })}>
                  <option value="">-- Chọn --</option>
                  {teachers.filter(t => t).map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Khởi tạo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card animate-slide-up" style={{ width: '400px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem' }}>Phân công Cố vấn</h3>
            <p style={{ marginBottom: '1.5rem', opacity: 0.8 }}>Nhóm: <strong>{selectedGroup?.groupName}</strong></p>
            <select className="input-field" value={selectedTeacherId} onChange={e => setSelectedTeacherId(e.target.value)}>
              <option value="">-- Chọn giảng viên --</option>
              {teachers.filter(t => t).map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
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
