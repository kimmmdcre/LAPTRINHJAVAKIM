import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { reportService, taskService, groupService } from '../services/api';
import { 
  Download, 
  FileText, 
  LayoutTemplate, 
  Printer, 
  FileDown, 
  ArrowLeft,
  ChevronRight,
  Settings,
  Eye,
  CheckCircle2,
  FileSearch,
  BookOpen
} from 'lucide-react';

const ReportGenerator = () => {
  const { user } = useAuth();
  const { showToast } = useUI();
  const [tasks, setTasks] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null);
  const [template, setTemplate] = useState('srs');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const initReportData = useCallback(async () => {
    try {
      setLoading(true);
      const groupsRes = await groupService.getAll();
      const myGroup = groupsRes.data.find(g => 
        g.thanhViens?.some(m => m.idSinhVien === user?.id)
      );

      if (myGroup) {
        setGroupInfo(myGroup);
        const taskRes = await taskService.getGroupTasks(myGroup.idNhom);
        setTasks(taskRes.data || []);
      }
    } catch (err) {
      console.error('Lỗi khởi tạo báo cáo:', err);
      showToast('Không thể tải dữ liệu cho trình tạo báo cáo.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [user?.id, showToast]);

  useEffect(() => {
    if (user?.id) {
      initReportData();
    }
  }, [user?.id, initReportData]);

  const handleDownload = async (type) => {
    if (!groupInfo) return;
    try {
      setExporting(true);
      showToast(`Đang chuẩn bị file ${type.toUpperCase()}...`, 'info');
      const res = type === 'docx' 
        ? await reportService.exportDocx(groupInfo.idNhom)
        : await reportService.exportPdf(groupInfo.idNhom);
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${template}-nhom-${groupInfo.tenNhom}.${type}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Tải xuống tài liệu thành công!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi xuất file báo cáo.', 'danger');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '1rem' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      <p style={{ color: 'var(--text-secondary)' }}>Đang soạn thảo tài liệu dự án...</p>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <style>
        {`
          @media print {
            aside, nav, .no-print { display: none !important; }
            .print-area { width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; background: white !important; color: black !important; border: none !important; }
            body { background: white !important; color: black !important; }
            * { color: black !important; border-color: #eee !important; box-shadow: none !important; }
            .glass-card { background: white !important; border: 1px solid #eee !important; }
          }
          .document-preview {
            background: white;
            color: #1f2937;
            padding: 50px 70px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            min-height: 1000px;
            width: 100%;
            max-width: 850px;
            margin: 0 auto;
            position: relative;
            transform-origin: top center;
          }
          .document-preview h1 { color: #111827; }
          .document-preview table th { background: #f9fafb; color: #374151; font-weight: 700; border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
          .document-preview table td { border: 1px solid #e5e7eb; padding: 12px; }
        `}
      </style>

      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Report Studio</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Tự động hóa tài liệu SRS và Báo cáo kiểm thử từ dữ liệu Jira Cloud</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
           <button className="btn btn-outline" onClick={() => window.print()}>
             <Printer size={18} /> In ngay
           </button>
           <button className="btn btn-primary" onClick={() => handleDownload('pdf')} disabled={exporting}>
             <Download size={18} /> {exporting ? 'Đang xuất...' : 'Xuất PDF'}
           </button>
        </div>
      </div>

      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem' }}>
        {/* Left Control Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Settings size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Cấu hình Văn bản</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                 <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Loại tài liệu</label>
                    <select 
                      className="input-field" 
                      style={{ margin: 0, width: '100%' }}
                      value={template}
                      onChange={e => setTemplate(e.target.value)}
                    >
                       <option value="srs">Đặc tả Yêu cầu (SRS)</option>
                       <option value="final">Báo cáo Tổng kết</option>
                       <option value="test">Báo cáo Kiểm thử</option>
                    </select>
                 </div>

                 <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Nhóm kết xuất</label>
                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '10px' }}>
                       <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{groupInfo?.tenNhom}</p>
                       <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Project Key: {groupInfo?.keyJira || 'PRJ'}</p>
                    </div>
                 </div>

                 <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '10px', display: 'flex', gap: '0.75rem' }}>
                    <CheckCircle2 size={18} color="var(--success)" />
                    <p style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: '600' }}>Toàn bộ dữ liệu đã sẵn sàng để xuất bản.</p>
                 </div>
              </div>
           </div>

           <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '1rem' }}>Mẹo trình bày</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Hệ thống sẽ tự động lấy <strong>Description</strong> và <strong>Acceptance Criteria</strong> từ Jira để đưa vào mục <strong>Chi tiết chức năng</strong>.
              </p>
           </div>
        </div>

        {/* Right Preview Area */}
        <div style={{ position: 'relative' }}>
           <div style={{ position: 'sticky', top: '2rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0 1rem' }}>
               <Eye size={18} color="var(--text-muted)" />
               <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Chế độ Xem trước Tài liệu</span>
             </div>

             <div className="document-preview print-area" id="printable-doc">
                {/* Header Page */}
                <div style={{ textAlign: 'center', marginBottom: '50px', paddingBottom: '30px', borderBottom: '2px solid #111827' }}>
                   <p style={{ fontSize: '1rem', fontWeight: '700' }}>TRƯỜNG ĐẠI HỌC CÔNG NGHỆ</p>
                   <p style={{ fontSize: '0.9rem', marginBottom: '40px' }}>KHOA CÔNG NGHỆ THÔNG TIN</p>
                   
                   <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '20px', lineHeight: '1.2' }}>
                     {template === 'srs' ? 'SOFTWARE REQUIREMENTS SPECIFICATION' : 'BÁO CÁO TỔNG KẾT ĐỒ ÁN'}
                   </h1>
                   <div style={{ width: '60px', height: '4px', background: '#111827', margin: '0 auto 20px' }}></div>
                   <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>Dự án: {groupInfo?.tenNhom}</p>
                   <p style={{ fontSize: '1.1rem', color: '#4b5563' }}>Phân hệ: {groupInfo?.deTai || 'Quản lý Dự án Tích hợp'}</p>
                </div>

                {/* Section 1 */}
                <div style={{ marginBottom: '40px' }}>
                   <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '15px' }}>1. TỔNG QUAN HỆ THỐNG</h2>
                   <p style={{ lineHeight: '1.8', color: '#374151' }}>
                     Tài liệu này cung cấp các thông số kỹ thuật và đặc tả yêu cầu cho dự án <strong>{groupInfo?.tenNhom}</strong>. 
                     Mục tiêu của dự án là xây dựng một nền tảng hỗ trợ sinh viên trong quá trình phát triển phần mềm, 
                     tích hợp chặt chẽ với các nền tảng quản lý dự án hàng đầu như <strong>Jira</strong> và hệ quản trị phiên bản <strong>GitHub</strong>.
                   </p>
                </div>

                {/* Section 2 - Member List */}
                <div style={{ marginBottom: '40px' }}>
                   <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '15px' }}>2. ĐỘI NGŨ PHÁT TRIỂN</h2>
                   <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                         <tr>
                            <th>Vai trò</th>
                            <th>Họ và Tên</th>
                            <th>Mã Sinh Viên</th>
                         </tr>
                      </thead>
                      <tbody>
                         {groupInfo?.thanhViens?.map((m, i) => (
                           <tr key={i}>
                              <td style={{ fontWeight: '600' }}>{m.idSinhVien === groupInfo.idTruongNhom ? 'Trưởng nhóm' : 'Thành viên'}</td>
                              <td>{m.hoTen}</td>
                              <td>{m.maSv || 'SV' + (i+1)}</td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>

                {/* Section 3 - Requirements */}
                <div>
                   <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '15px' }}>3. DANH SÁCH YÊU CẦU CHỨC NĂNG</h2>
                   <p style={{ marginBottom: '20px', color: '#4b5563', fontStyle: 'italic', fontSize: '0.9rem' }}>
                      Danh sách dưới đây được trích xuất trực tiếp từ Project Jira của nhóm.
                   </p>
                   <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                         <tr>
                            <th style={{ width: '80px' }}>ID</th>
                            <th>Tên Chức Năng / Nhiệm Vụ</th>
                            <th style={{ width: '100px', textAlign: 'center' }}>Trạng thái</th>
                         </tr>
                      </thead>
                      <tbody>
                         {tasks.map((task, i) => (
                           <tr key={i}>
                              <td style={{ fontWeight: 'bold' }}>{task.keyJira}</td>
                              <td>
                                 <p style={{ fontWeight: '600' }}>{task.tenNhiemVu}</p>
                                 <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px' }}>Giao cho: {task.tenNguoiNhan || 'Chưa phân công'}</p>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                 <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '4px 8px', borderRadius: '4px', background: task.trangThai === 'DONE' ? '#dcfce7' : '#f3f4f6' }}>
                                    {task.trangThai}
                                 </span>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>

                <div style={{ marginTop: '60px', textAlign: 'right' }}>
                   <p style={{ fontStyle: 'italic', color: '#6b7280' }}>Ngày ký xác nhận: {new Date().toLocaleDateString('vi-VN')}</p>
                   <div style={{ height: '100px' }}></div>
                   <p style={{ fontWeight: 'bold' }}>BỘ MÔN CÔNG NGHỆ PHẦN MỀM</p>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;
