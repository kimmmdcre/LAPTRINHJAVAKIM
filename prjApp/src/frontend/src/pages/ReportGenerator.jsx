import React, { useState, useEffect } from 'react';
import { Download, FileText, LayoutTemplate, Printer, FileDown } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { reportService, taskService, groupService } from '../services/api';

const ReportGenerator = () => {
  const [tasks, setTasks] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null);
  const [template, setTemplate] = useState('srs');
  const [loading, setLoading] = useState(false);
  const { showToast } = useUI();
  const groupId = localStorage.getItem('groupId') || 'd4c5b6a7-8901-2345-6789-0123456789ab';

  useEffect(() => {
    if (groupId) {
      fetchData();
    }
  }, [groupId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupRes, taskRes] = await Promise.all([
        groupService.getDetails(groupId),
        taskService.getGroupTasks(groupId)
      ]);
      setGroupInfo(groupRes.data);
      setTasks(taskRes.data);
    } catch (err) {
      console.error('Lỗi tải dữ liệu báo cáo:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (type) => {
    try {
      showToast(`Đang chuẩn bị file ${type.toUpperCase()}...`, 'info');
      const res = type === 'docx' 
        ? await reportService.exportDocx(groupId)
        : await reportService.exportPdf(groupId);
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bao-cao-${groupId}.${type}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Tải xuống thành công!', 'success');
    } catch (err) {
      showToast('Lỗi khi xuất file. Vui lòng thử lại.', 'danger');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div>Đang tải dữ liệu báo cáo...</div>;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <style>
        {`
          @media print {
            aside, nav, .no-print { display: none !important; }
            .print-area { width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; background: white !important; color: black !important; border: none !important; }
            body { background: white !important; color: black !important; }
            * { color: black !important; border-color: #ccc !important; }
          }
        `}
      </style>

      <div className="no-print" style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Trình tạo Tài liệu (Report Automation)</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Tự động ánh xạ dữ liệu Jira thành tài liệu SRS hoặc Báo cáo Tổng kết.</p>
      </div>

      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LayoutTemplate size={20} className="text-primary" />
            Cấu hình & Xuất bản
          </h3>

          <div className="input-group">
            <label className="input-label">Mẫu tài liệu</label>
            <select className="input-field" value={template} onChange={e => setTemplate(e.target.value)}>
              <option value="srs">Đặc tả Yêu cầu (SRS)</option>
              <option value="final">Báo cáo Tổng kết</option>
            </select>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <button className="btn btn-primary" onClick={handlePrint} style={{ width: '100%', justifyContent: 'center' }}>
              <Printer size={18} /> In / Lưu PDF (Browser)
            </button>
            <button className="btn btn-outline" onClick={() => downloadFile('docx')} style={{ width: '100%', justifyContent: 'center' }}>
              <FileText size={18} /> Tải Word (.docx)
            </button>
            <button className="btn btn-outline" onClick={() => downloadFile('pdf')} style={{ width: '100%', justifyContent: 'center' }}>
              <FileDown size={18} /> Tải PDF (Server-side)
            </button>
          </div>
        </div>

        <div className="glass-card print-area" style={{ padding: '3rem', background: '#ffffff', color: '#111827', minHeight: '800px' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #e5e7eb', paddingBottom: '2rem', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
              {template === 'srs' ? 'Software Requirements Specification' : 'Báo Cáo Tổng Kết Dự Án'}
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#4b5563', marginTop: '0.5rem' }}>
              Dự án: {groupInfo?.tenNhom || '[Tên Dự án]'}
            </p>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Ngày trích xuất: {new Date().toLocaleDateString('vi-VN')}</p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.4rem', marginBottom: '0.8rem' }}>
              1. Mục đích & Phạm vi
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#4b5563', lineHeight: '1.6' }}>
              Tài liệu này tổng hợp các yêu cầu phần mềm và trạng thái thực hiện của {groupInfo?.tenNhom}. 
              Toàn bộ dữ liệu được đồng bộ tự động từ Project Jira #{groupInfo?.keyJira || 'PRJ'}.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.4rem', marginBottom: '1rem' }}>
              2. Danh sách Chức năng (Requirements List)
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ border: '1px solid #e5e7eb', padding: '0.75rem', textAlign: 'left' }}>Mã Jira</th>
                  <th style={{ border: '1px solid #e5e7eb', padding: '0.75rem', textAlign: 'left' }}>Tên/Mô tả</th>
                  <th style={{ border: '1px solid #e5e7eb', padding: '0.75rem', textAlign: 'left' }}>Thực hiện</th>
                  <th style={{ border: '1px solid #e5e7eb', padding: '0.75rem', textAlign: 'center' }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.idNhiemVu}>
                    <td style={{ border: '1px solid #e5e7eb', padding: '0.6rem', fontWeight: '600', color: '#2563eb' }}>{task.idNhiemVu}</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: '0.6rem' }}>{task.tenNhiemVu}</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: '0.6rem' }}>{task.tenSinhVien || 'Chưa gán'}</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: '0.6rem', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700',
                        backgroundColor: task.trangThai === 'DONE' ? '#dcfce7' : task.trangThai === 'IN_PROGRESS' ? '#fef9c3' : '#f3f4f6',
                        color: task.trangThai === 'DONE' ? '#166534' : task.trangThai === 'IN_PROGRESS' ? '#854d0e' : '#374151'
                      }}>
                        {task.trangThai}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;
