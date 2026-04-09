import React, { useState, useEffect } from 'react';
import { groupService, userService } from '../services/api';
import { useUI } from '../context/UIContext';
import { Plus, Users, Search, MoreVertical, ExternalLink, UserCheck, Trash2, FolderOpen, X } from 'lucide-react';

const AdminGroups = () => {
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  
  const [newGroupData, setNewGroupData] = useState({
    tenNhom: '',
    deTai: '',
    idGiangVien: ''
  });
  
  const { showToast } = useUI();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupsRes, teachersRes] = await Promise.all([
        groupService.getAll(),
        userService.getTeachers()
      ]);
      setGroups(groupsRes.data);
      setTeachers(teachersRes.data);
    } catch (err) {
      console.error('Lỗi dữ liệu:', err);
    } finally {
      setLoading(false);
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
    } catch (err) {
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
    } catch (err) {
      showToast('Không thể phân công giảng viên.', 'danger');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xoá nhóm này?')) {
      try {
        await groupService.delete(id);
        showToast('Đã xoá nhóm.');
        fetchData();
      } catch (err) {
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {groups.map(group => (
          <div key={group.idNhom} className="glass-card" style={{ padding: '1.5rem', position: 'relative' }}>
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
              <button className="btn btn-outline" style={{ padding: '0.75rem' }}>
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
        ))}
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
