import React, { useState, useEffect } from 'react';
import { groupService, userService, configService } from '../services/api';
import { useUI } from '../context/UIContext';
import { Plus, Users, Search, MoreVertical, ExternalLink, UserCheck, Trash2, FolderOpen, X, Settings, CheckCircle, GitBranch, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminGroups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [students, setStudents] = useState([]);
  const [draggedStudent, setDraggedStudent] = useState(null);
  
  const [newGroupData, setNewGroupData] = useState({
    tenNhom: '',
    deTai: '',
    idGiangVien: ''
  });
  const [groupConfigs, setGroupConfigs] = useState({}); // { [idNhom]: { hasJira, hasGithub } }
  
  const { showToast } = useUI();

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      setLoading(true);
      let fetchedGroups = [];
      try {
        const groupsRes = await groupService.getAll();
        fetchedGroups = groupsRes.data;
        setGroups(fetchedGroups);
      } catch (err) {
        console.error('Lỗi tải danh sách nhóm:', err);
        showToast('Không thể tải danh sách nhóm.', 'warning');
      }

      try {
        const teachersRes = await userService.getTeachers();
        setTeachers(teachersRes.data);
      } catch (err) {
        console.error('Lỗi tải danh sách giảng viên:', err);
      }

      try {
        const unassignedRes = await userService.getUnassigned();
        setStudents(unassignedRes.data);
      } catch (err) {
        console.error('Lỗi tải danh sách sinh viên tự do:', err);
      }

      // Fetch config status for each group in parallel
      if (fetchedGroups.length > 0) {
        const configResults = await Promise.allSettled(
          fetchedGroups.map(g => configService.getConfig(g.idNhom))
        );
        const configMap = {};
        configResults.forEach((result, idx) => {
          const groupId = fetchedGroups[idx].idNhom;
          if (result.status === 'fulfilled') {
            const configs = result.value.data;
            configMap[groupId] = {
              hasJira: configs.some(c => c.loaiNenTang === 'JIRA' && c.url),
              hasGithub: configs.some(c => c.loaiNenTang === 'GITHUB' && c.repoUrl),
            };
          } else {
            configMap[groupId] = { hasJira: false, hasGithub: false };
          }
        });
        setGroupConfigs(configMap);
      }

    } catch (err) {
      console.error('Lỗi hệ thống:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStudent = async (groupId, studentId) => {
    try {
      await groupService.addMember(groupId, studentId);
      showToast('Đã thêm thành viên vào nhóm!');
      fetchData(); // Reload all data to update UI lists
    } catch (err) {
      console.error('Lỗi gán sinh viên:', err);
      showToast('Không thể thêm thành viên vào nhóm.', 'danger');
    }
  };

  const handleRemoveMember = async (studentId) => {
    try {
      await groupService.removeMember(studentId);
      showToast('Đã loại sinh viên khỏi nhóm.');
      fetchData();
    } catch (err) {
      console.error('Lỗi xoá thành viên:', err);
      showToast('Không thể loại sinh viên khỏi nhóm.', 'danger');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (!newGroupData.idGiangVien) {
        showToast('Vui lòng chọn giảng viên hướng dẫn.', 'danger');
        return;
      }
      await groupService.create(newGroupData);
      showToast('Đã tạo nhóm thành công!');
      setShowCreateModal(false);
      setNewGroupData({ tenNhom: '', deTai: '', idGiangVien: '' });
      fetchData();
    } catch {
      showToast('Lỗi khi tạo nhóm.', 'danger');
    }
  };

  const handleAssign = async () => {
    if (!selectedTeacherId) return;
    try {
      await groupService.assignTeacher(selectedGroup.idNhom, selectedTeacherId);
      showToast('Đã cập nhật giảng viên hướng dẫn.');
      setShowAssignModal(false);
      fetchData();
    } catch {
      showToast('Không thể phân công giảng viên.', 'danger');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xoá nhóm này?')) {
      try {
        await groupService.delete(id);
        showToast('Đã xoá nhóm.');
        fetchData();
      } catch {
        showToast('Lỗi khi xoá.', 'danger');
      }
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Quản lý Nhóm & Dự án</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Điều phối các nhóm sinh viên và giảng viên hướng dẫn</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} />
          Tạo nhóm mới
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr', gap: '2rem' }}>
        {/* Left Sidebar: Unassigned Students + Drop zone for removal */}
        <div 
          className="glass-card" 
          style={{ padding: '1rem', height: 'calc(100vh - 200px)', overflowY: 'auto', border: '2px solid transparent', transition: 'border-color 0.2s' }}
          onDragOver={(e) => {
            e.preventDefault();
            if (draggedStudent && draggedStudent.isFromGroup) {
              e.currentTarget.style.borderColor = 'var(--danger)';
            }
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = 'transparent';
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = 'transparent';
            if (draggedStudent && draggedStudent.id) {
              handleRemoveMember(draggedStudent.id);
              setDraggedStudent(null);
            }
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--surface-border)' }}>
            <Users size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Sinh viên tự do ({students.length})
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Kéo thả sinh viên vào nhóm hoặc kéo từ nhóm về đây để loại bỏ.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {students.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>Hết sinh viên tự do</p>}
            {students.map(student => (
              <div 
                key={student.id} 
                draggable
                onDragStart={() => setDraggedStudent({ ...student, isFromGroup: false })}
                onDragEnd={() => setDraggedStudent(null)}
                style={{
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '6px',
                  cursor: 'grab',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  opacity: draggedStudent?.id === student.id ? 0.5 : 1,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                  {student.hoTen[0]}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{student.hoTen}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{student.username}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Area: Groups Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', alignContent: 'start' }}>
          {groups.map(group => (
            <div 
              key={group.idNhom} 
              className="glass-card" 
              style={{ padding: '1.5rem', position: 'relative', border: '2px solid transparent', transition: 'border-color 0.2s' }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'transparent';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'transparent';
                if (draggedStudent) {
                  handleAssignStudent(group.idNhom, draggedStudent.id);
                  setDraggedStudent(null);
                }
              }}
            >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: 'rgba(99, 102, 241, 0.1)', 
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FolderOpen size={24} />
              </div>
              <button 
                onClick={() => handleDelete(group.idNhom)}
                className="btn btn-outline" 
                style={{ padding: '0.4rem', borderRadius: '50%', color: 'var(--danger)' }}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{group.tenNhom}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
              {group.deTai || 'Chưa có đề tài cụ thể'}
            </p>

            <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Thành viên nhóm ({group.thanhViens?.length || 0})</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {group.thanhViens && group.thanhViens.length > 0 ? (
                        group.thanhViens.map((member, idx) => (
                            <span 
                                key={idx} 
                                draggable
                                onDragStart={() => setDraggedStudent({ id: member.idSinhVien, hoTen: member.hoTen, isFromGroup: true })}
                                onDragEnd={() => setDraggedStudent(null)}
                                style={{ 
                                    padding: '0.2rem 0.6rem', 
                                    background: 'rgba(99, 102, 241, 0.15)', 
                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    color: 'var(--text-primary)',
                                    cursor: 'grab',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }}
                            >
                                <Users size={10} />
                                {member.hoTen}
                            </span>
                        ))
                    ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Chưa có thành viên</span>
                    )}
                </div>
            </div>

            {/* Integration Status Badges */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {(() => {
                const cfg = groupConfigs[group.idNhom];
                if (!cfg) return (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Đang kiểm tra cấu hình...</span>
                );
                return (
                  <>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      fontSize: '0.72rem', fontWeight: 'bold', padding: '3px 8px',
                      borderRadius: '20px',
                      background: cfg.hasJira ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.10)',
                      border: `1px solid ${cfg.hasJira ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.3)'}`,
                      color: cfg.hasJira ? '#4ade80' : '#f87171',
                    }}>
                      {cfg.hasJira ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
                      Jira {cfg.hasJira ? '✓' : '✗'}
                    </span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      fontSize: '0.72rem', fontWeight: 'bold', padding: '3px 8px',
                      borderRadius: '20px',
                      background: cfg.hasGithub ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.10)',
                      border: `1px solid ${cfg.hasGithub ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.3)'}`,
                      color: cfg.hasGithub ? '#4ade80' : '#f87171',
                    }}>
                      {cfg.hasGithub ? <GitBranch size={11} /> : <AlertCircle size={11} />}
                      GitHub {cfg.hasGithub ? '✓' : '✗'}
                    </span>
                    {cfg.hasJira && cfg.hasGithub && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '0.72rem', fontWeight: 'bold', padding: '3px 8px',
                        borderRadius: '20px',
                        background: 'rgba(99,102,241,0.15)',
                        border: '1px solid rgba(99,102,241,0.4)',
                        color: 'var(--primary)',
                      }}>
                        <CheckCircle size={11} />
                        Đã cấu hình đầy đủ
                      </span>
                    )}
                  </>
                );
              })()}
            </div>

            <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {group.tenGiangVien ? group.tenGiangVien.charAt(0) : '?'}
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Giảng viên hướng dẫn</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{group.tenGiangVien || 'Chưa phân công'}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                className="btn btn-outline" 
                style={{ flex: 1, fontSize: '0.875rem' }}
                onClick={() => {
                  setSelectedGroup(group);
                  setSelectedTeacherId(group.idGiangVien || '');
                  setShowAssignModal(true);
                }}
              >
                <UserCheck size={16} />
                Phân công
              </button>
              <button 
                className="btn btn-outline" 
                style={{
                  padding: '0.75rem',
                  ...(groupConfigs[group.idNhom]?.hasJira && groupConfigs[group.idNhom]?.hasGithub
                    ? { background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.4)', color: '#4ade80' }
                    : {})
                }}
                title="Cấu hình Jira/GitHub cho nhóm này"
                onClick={() => navigate('/admin/config', { state: { groupId: group.idNhom } })}
              >
                <Settings size={16} />
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card animate-scale-in" style={{ width: '500px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setShowCreateModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)' }}>
              <X size={24} />
            </button>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Tạo nhóm dự án mới</h3>
            <form onSubmit={handleCreate}>
              <div className="input-group">
                <label className="input-label">Tên nhóm</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  value={newGroupData.tenNhom}
                  onChange={e => setNewGroupData({...newGroupData, tenNhom: e.target.value})}
                  placeholder="VD: Nhóm 1 - K70" 
                />
              </div>
              <div className="input-group">
                <label className="input-label">Đề tài dự án</label>
                <textarea 
                  className="input-field" 
                  rows={3}
                  value={newGroupData.deTai}
                  onChange={e => setNewGroupData({...newGroupData, deTai: e.target.value})}
                  placeholder="Mô tả ngắn gọn về đề tài..." 
                />
              </div>
              <div className="input-group">
                <label className="input-label">Giảng viên hướng dẫn</label>
                <select 
                  className="input-field" 
                  required
                  value={newGroupData.idGiangVien}
                  onChange={e => setNewGroupData({...newGroupData, idGiangVien: e.target.value})}
                >
                  <option value="">-- Chọn giảng viên --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.hoTen}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>Huỷ</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Tạo nhóm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {showAssignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card animate-scale-in" style={{ width: '400px', padding: '2rem', position: 'relative' }}>
             <button onClick={() => setShowAssignModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)' }}>
              <X size={24} />
            </button>
            <h3 style={{ marginBottom: '1.5rem' }}>Thay đổi Giảng viên</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Phân công giảng viên mới cho nhóm <strong>{selectedGroup?.tenNhom}</strong>
            </p>
            
            <select 
              value={selectedTeacherId} 
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="input-field"
              style={{ marginBottom: '2rem' }}
            >
              <option value="">-- Chọn giảng viên --</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.hoTen}</option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAssignModal(false)}>Huỷ</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAssign}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGroups;
