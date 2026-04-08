(function () {
  // --- Constants & State ---
  const storageKey = "pm_tool_session";
  const currentRole = window.APP_ROLE || "THANH_VIEN";
  let state = {
    user: null,
    groups: [],
    currentView: 'dashboard',
    selectedGroupId: null,
    latestData: null
  };

  // --- DOM Elements ---
  const output = document.getElementById("output");
  const tokenInput = document.getElementById("token");
  const backendUrlInput = document.getElementById("backendUrl");
  const logoutBtn = document.getElementById("logoutBtn");
  const displayUsername = document.getElementById("displayUsername");
  
  // Context inputs (now hidden)
  const ctxGroupIdInput = document.getElementById("ctxGroupId");
  const ctxLecturerIdInput = document.getElementById("ctxLecturerId");
  const ctxStudentIdInput = document.getElementById("ctxStudentId");

  // View Containers
  const views = document.querySelectorAll('.view-container');
  const navItems = document.querySelectorAll('.nav-item');

  // --- Core Functions ---
  function getBackendUrl() {
    return backendUrlInput.value.trim().replace(/\/$/, "");
  }

  function getToken() {
    return tokenInput.value.trim();
  }

  async function callApi(path, options = {}) {
    const token = getToken();
    const headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
    if (token) headers.Authorization = `Bearer ${token}`;
    
    const response = await fetch(`${getBackendUrl()}${path}`, { ...options, headers });
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json") ? await response.json() : await response.text();
    
    if (!response.ok) {
        throw new Error(typeof payload === "string" ? payload : (payload.message || JSON.stringify(payload)));
    }
    return payload;
  }

  function show(data) {
    state.latestData = data;
    if (output) {
      output.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    }
    // Optionally console log for debugging
    console.log("API Response:", data);
  }

  // --- View Routing ---
  function switchView(viewId) {
    state.currentView = viewId;
    views.forEach(v => v.classList.remove('active'));
    navItems.forEach(n => n.classList.remove('active'));

    const activeView = document.getElementById(`view-${viewId}`);
    if (activeView) activeView.classList.add('active');

    const activeNav = document.querySelector(`.nav-item[data-view="${viewId}"]`);
    if (activeNav) activeNav.classList.add('active');

    // Trigger data loading based on view
    if (viewId === 'projects') loadProjects();
    if (viewId === 'tasks') loadPersonalTasks();
    if (viewId === 'users') loadAllUsers();
    if (viewId === 'reports') loadReports(state.selectedGroupId);
  }

  // --- Data Loading & Rendering ---
  async function initUser() {
    try {
      const user = await callApi("/api/auth/me");
      state.user = user;
      if (displayUsername) displayUsername.textContent = user.hoTen || user.username;
      
      // Auto-fill student/lecturers IDs into context if applicable
      if (user.id) {
          if (currentRole === 'SINH_VIEN' || currentRole === 'THANH_VIEN') ctxStudentIdInput.value = user.id;
          if (currentRole === 'GIANG_VIEN') ctxLecturerIdInput.value = user.id;
      }
      
      loadDashboardSummary();
    } catch (err) {
      console.error("Failed to init user:", err);
      // If token expired, logout
      if (err.message.includes("401") || err.message.includes("token")) clearSession();
    }
  }

  async function loadDashboardSummary() {
      // For now, just show a few stats or recent activities
      const container = document.getElementById('dashboard-summary');
      if (!container) return;
      
      // We can fetch projects here too to show a quick count
      try {
          const groups = await fetchGroupsByRole();
          container.innerHTML = `
            <div class="card section-card">
              <h3 class="section-title">Tổng quan</h3>
              <div class="project-meta" style="margin-top: 1rem; font-size: 1rem;">
                <span>📂 <strong>${groups.length}</strong> Dự án tham gia</span>
              </div>
              <p class="section-desc" style="margin-top: 0.5rem;">Cập nhật mới nhất từ Jira & GitHub đang được đồng bộ.</p>
            </div>
            <div class="card section-card" style="border-left: 4px solid var(--success)">
               <h3 class="section-title">Hệ thống sẵn sàng</h3>
               <p class="section-desc">Tất cả các dịch vụ đang hoạt động bình thường.</p>
            </div>
          `;
      } catch (e) {
          container.innerHTML = `<p class="hint">Lỗi tải thông tin: ${e.message}</p>`;
      }
  }

  async function fetchGroupsByRole() {
      const userId = state.user?.id;
      if (!userId) return [];
      
      if (currentRole === 'ADMIN') {
          // Admin might need a different endpoint or just a specific lecturer ID (themselves)
          return await callApi(`/api/groups?idGiangVien=${userId}`);
      } else if (currentRole === 'GIANG_VIEN') {
          return await callApi(`/api/groups?idGiangVien=${userId}`);
      } else {
          // For students, we might need to find which group they are in.
          // Backend has @GetMapping("/{id}") for specific group. 
          // If the backend doesn't have "get my groups", we might need to iterate or use context.
          // Assuming common pattern:
          return await callApi(`/api/groups?idGiangVien=${userId}`); // Fallback
      }
  }

  async function loadProjects() {
    const container = document.getElementById('project-list-container');
    if (!container) return;
    
    container.innerHTML = '<p class="hint">Đang tải...</p>';
    try {
      const groups = await fetchGroupsByRole();
      state.groups = groups;
      renderProjectList(groups);
    } catch (err) {
      container.innerHTML = `<p class="hint" style="color: var(--danger)">Lỗi: ${err.message}</p>`;
    }
  }

  function renderProjectList(groups) {
    const container = document.getElementById('project-list-container');
    if (groups.length === 0) {
      container.innerHTML = '<p class="hint">Bạn chưa tham gia dự án nào.</p>';
      return;
    }

    container.innerHTML = groups.map(g => `
      <div class="card project-card" data-id="${g.idNhom}">
        <div class="project-name">${g.tenNhom || 'Dự án không tên'}</div>
        <p class="section-desc">${g.deTai || 'Chưa có mô tả đề tài'}</p>
        <div class="project-meta">
          <span>👥 ${g.soLuongThanhVien || 0} thành viên</span>
          <span>📅 ${g.ngayTao ? new Date(g.ngayTao).toLocaleDateString('vi-VN') : 'N/A'}</span>
        </div>
        <div class="project-progress-wrap">
          <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: 0%"></div></div>
          <div class="project-meta"><span>Tiến độ: 0%</span></div>
        </div>
      </div>
    `).join('');

    // Add click listeners
    container.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', () => openProjectDetail(card.dataset.id));
    });
  }

  async function openProjectDetail(id) {
    state.selectedGroupId = id;
    ctxGroupIdInput.value = id; // Sync with legacy forms
    switchView('project-detail');
    
    const content = document.getElementById('project-detail-content');
    content.innerHTML = '<p class="hint">Đang tải chi tiết...</p>';
    
    try {
      const g = await callApi(`/api/groups/${id}`);
      content.innerHTML = `
        <div class="section-head">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 class="section-title">${g.tenNhom}</h2>
            <button class="btn btn-secondary btn-sm" onclick="location.reload()">🔄 Làm mới</button>
          </div>
          <p class="section-desc">${g.deTai || ''}</p>
        </div>
      `;
      
      // Re-trigger form autofills for the sections
      document.querySelectorAll('input[name="groupId"], input[name="idNhom"]').forEach(i => i.value = id);
      state.selectedGroupId = id; // Store for global access
      
      // Load sub-data
      if (typeof loadRequirements === 'function') loadRequirements(id);
      if (typeof loadTasks === 'function') loadTasks(id);
      if (typeof loadMembers === 'function') loadMembers(id);
      if (typeof loadReports === 'function') loadReports(id);
      
    } catch (err) {
      content.innerHTML = `<p class="hint" style="color: var(--danger)">Lỗi: ${err.message}</p>`;
    }
  }

  async function loadReports(idNhom) {
      if (!idNhom) return;
      try {
          const stats = await callApi(`/api/reports/group/${idNhom}`);
          
          document.getElementById('stat-tasks-total').textContent = stats.totalTasks || 0;
          document.getElementById('stat-tasks-done').textContent = stats.completedTasks || 0;
          document.getElementById('stat-commits-total').textContent = stats.totalCommits || 0;

          const chartContainer = document.getElementById('contribution-chart');
          if (chartContainer) {
              const entries = Object.entries(stats.contributions || {});
              if (entries.length === 0) {
                  chartContainer.innerHTML = '<p class="hint">Chưa có đóng góp nào.</p>';
              } else {
                  chartContainer.innerHTML = entries.map(([name, count]) => `
                    <div class="stack" style="margin-bottom: 0.75rem;">
                        <div class="btn-row" style="justify-content: space-between; margin-bottom: 0.25rem;">
                            <span style="font-size: 0.85rem;">${name}</span>
                            <span style="font-size: 0.85rem; font-weight: bold;">${count} commits</span>
                        </div>
                        <div style="height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; background: var(--primary); width: ${Math.min(100, (count / (stats.totalCommits || 1)) * 100)}%;"></div>
                        </div>
                    </div>
                  `).join('');
              }
          }
      } catch (e) { console.error("Lỗi tải báo cáo:", e); }
  }

  async function loadAllUsers() {
      const container = document.getElementById('user-list-body');
      if (!container) return;
      try {
          const users = await callApi('/api/users');
          container.innerHTML = users.map(u => `
            <tr>
              <td><strong>${u.hoTen}</strong></td>
              <td>${u.username}</td>
              <td>${u.email}</td>
              <td><span class="badge-label">${u.maVaiTro}</span></td>
              <td>
                <button class="btn btn-secondary btn-sm" onclick="alert('Tính năng đổi vai trò đang phát triển cho ID: ${u.id}')">Sửa</button>
              </td>
            </tr>
          `).join('');
      } catch (e) { container.innerHTML = `<tr><td colspan="5" class="hint">Lỗi: ${e.message}</td></tr>`; }
  }

  async function loadRequirements(idNhom) {
      const container = document.getElementById('requirement-list');
      if (!container) return;
      try {
          const reqs = await callApi(`/api/tasks/yeu-cau?idNhom=${idNhom}`);
          if (!reqs || reqs.length === 0) {
              container.innerHTML = '<p class="hint">Chưa có yêu cầu nào từ Jira.</p>';
              return;
          }
          container.innerHTML = '<strong>Yêu cầu (Jira):</strong>' + (Array.isArray(reqs) ? reqs.map(r => `
            <div class="card" style="padding: 0.75rem; border-left: 3px solid var(--info); margin-top: 0.5rem">
                <div style="font-weight: 600; font-size: 0.9rem;">[${r.maYeuCau || r.id || 'JIRA'}] ${r.tenYeuCau || r.title}</div>
                <div class="section-desc">${r.moTa || ''}</div>
            </div>
          `).join('') : '<p class="hint">Dữ liệu yêu cầu không hợp lệ.</p>');
      } catch (e) { container.innerHTML = `<p class="hint">Không thể tải yêu cầu: ${e.message}</p>`; }
  }

  async function loadTasks(idNhom) {
      const container = document.getElementById('task-list');
      if (!container) return;
      try {
          const tasks = await callApi(`/api/tasks/nhiem-vu/nhom?idNhom=${idNhom}`);
          
          if (!tasks || tasks.length === 0) {
              container.innerHTML = '<p class="hint">Chưa có nhiệm vụ nào được phân công trong dự án này.</p>';
              return;
          }

          container.innerHTML = `
            <h3 class="section-title" style="font-size: 1rem; margin-bottom: 1rem;">Nhiệm vụ (${tasks.length})</h3>
            <div class="stack" style="gap: 1rem;">
                ${tasks.map(t => `
                  <div class="card task-card" style="border-left: 4px solid ${getStatusColor(t.trangThai)}">
                    <div class="btn-row" style="justify-content: space-between; align-items: flex-start; margin: 0;">
                        <div class="stack" style="gap: 0.25rem;">
                            <strong style="font-size: 0.9rem;">${t.tenNhiemVu || t.idNhiemVu}</strong>
                            <span class="hint">${t.idYeuCau || 'General'} | 👤 ${t.tenSinhVien || 'Chưa phân công'}</span>
                        </div>
                        <span class="status-badge status-${(t.trangThai || 'TODO').toLowerCase().replace(/_/g,'')}">${t.trangThai || 'TODO'}</span>
                    </div>
                    <div class="btn-row" style="margin-top: 1rem; gap: 0.5rem;">
                        <button class="btn btn-secondary btn-sm status-btn ${t.trangThai === 'TODO' ? 'active' : ''}" data-id="${t.idNhiemVu}" data-status="TODO">Todo</button>
                        <button class="btn btn-secondary btn-sm status-btn ${t.trangThai === 'IN_PROGRESS' ? 'active' : ''}" data-id="${t.idNhiemVu}" data-status="IN_PROGRESS">Doing</button>
                        <button class="btn btn-primary btn-sm status-btn ${t.trangThai === 'DONE' ? 'active' : ''}" data-id="${t.idNhiemVu}" data-status="DONE">Done</button>
                    </div>
                  </div>
                `).join('')}
            </div>
          `;

          container.querySelectorAll('.status-btn').forEach(btn => {
              btn.addEventListener('click', async () => {
                  const id = btn.dataset.id;
                  const status = btn.dataset.status;
                  try {
                      await callApi(`/api/tasks/nhiem-vu/${id}/status`, {
                          method: 'PATCH',
                          body: JSON.stringify({ status })
                      });
                      loadTasks(idNhom);
                      if (typeof loadReports === 'function') loadReports(idNhom);
                  } catch (e) { alert("Lỗi cập nhật: " + e.message); }
              });
          });

      } catch (e) { 
          container.innerHTML = `<p class="hint">Không thể tải nhiệm vụ: ${e.message}</p>`;
      }
  }

  function getStatusColor(status) {
      switch(status) {
          case 'DONE': return '#10b981';
          case 'IN_PROGRESS': return '#f59e0b';
          default: return '#3b82f6';
      }
  }

  async function smartSync() {
      const id = state.selectedGroupId;
      if (!id) return alert("Vui lòng chọn một dự án trước!");
      
      const status = document.getElementById('sync-status');
      const btn = document.getElementById('smartSyncBtn');
      if (status) status.textContent = "⏳ Bắt đầu đồng bộ...";
      if (btn) btn.disabled = true;

      try {
          if (status) status.innerHTML = "📡 Đang đồng bộ Jira (1/3)...";
          await callApi(`/api/sync/${id}/jira`, { method: 'POST' });
          
          if (status) status.innerHTML = "📁 Đang lấy Commits từ GitHub (2/3)...";
          await callApi(`/api/sync/${id}/github`, { method: 'POST' });
          
          if (status) status.innerHTML = "🔗 Khớp nối dữ liệu (3/3)...";
          await callApi(`/api/sync/mapping`, { method: 'POST' });
          
          if (status) {
              status.innerHTML = "✅ Kết nối Jira ↔ GitHub thành công!";
              status.style.color = "var(--success)";
          }
          
          // Refresh views
          loadRequirements(id);
          loadTasks(id);
          
      } catch (err) {
          if (status) {
              status.innerHTML = `❌ Lỗi: ${err.message}`;
              status.style.color = "var(--danger)";
          }
          alert(`Đồng bộ thất bại: ${err.message}`);
      } finally {
          if (btn) btn.disabled = false;
      }
  }

  async function loadMembers(idNhom) {
      const container = document.getElementById('member-list');
      if (!container) return;
      try {
          const members = await callApi(`/api/groups/${idNhom}/members`);
          if (!members || members.length === 0) {
              container.innerHTML = '<p class="hint">Nhóm chưa có thành viên.</p>';
              return;
          }
          container.innerHTML = members.map(m => `
            <div class="card" style="padding: 0.75rem; display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 32px; height: 32px; background: var(--border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold;">
                    ${(m.tenSinhVien || m.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${m.tenSinhVien || m.username}</div>
                    <div class="badge-label" style="font-size: 0.6rem;">${m.vaiTro || 'MEMBER'}</div>
                </div>
            </div>
          `).join('');
      } catch (e) { container.innerHTML = `<p class="hint">Không thể tải thành viên: ${e.message}</p>`; }
  }

  async function loadPersonalTasks() {
      if (!ctxStudentIdInput.value) return;
      try {
          const tasks = await callApi(`/api/tasks/nhiem-vu?idSinhVien=${ctxStudentIdInput.value}`);
          show(tasks);
      } catch (e) {
          console.error(e);
      }
  }

  // --- Session Management ---
  function loadSession() {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data.backendUrl) backendUrlInput.value = data.backendUrl;
      if (data.token) tokenInput.value = data.token;
      
      if (data.token) initUser();
    } catch (err) {
      console.error("Load session error:", err);
    }
  }

  function clearSession() {
    localStorage.removeItem(storageKey);
    window.location.href = "/dang-nhap";
  }

  // --- Event Listeners ---
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      switchView(item.dataset.view);
    });
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await callApi("/api/auth/logout", { method: "POST" });
      } catch (err) {}
      clearSession();
    });
  }

  const smartSyncBtn = document.getElementById("smartSyncBtn");
  if (smartSyncBtn) smartSyncBtn.addEventListener("click", smartSync);

  const standaloneCreateGroupForm = document.getElementById("standaloneCreateGroupForm");
  if (standaloneCreateGroupForm) {
      standaloneCreateGroupForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const data = formDataToObject(standaloneCreateGroupForm);
          try {
              const res = await callApi("/api/groups", {
                  method: "POST",
                  body: JSON.stringify(data)
              });
              alert("Tạo đồ án thành công!");
              standaloneCreateGroupForm.reset();
              switchView("projects");
          } catch (err) { alert("Lỗi: " + err.message); }
      });
  }

  // --- User Search & Selection Logic ---
  const userSearchInput = document.getElementById("userSearchInput");
  const userSearchBtn = document.getElementById("userSearchBtn");
  const searchResults = document.getElementById("search-results");
  const selectedUserId = document.getElementById("selectedUserId");
  const selectedUserCard = document.getElementById("selectedUserCard");
  const addMemberBtn = document.getElementById("addMemberBtn");

  if (userSearchBtn) {
    userSearchBtn.addEventListener("click", async () => {
        const q = userSearchInput.value.trim();
        if (!q) return;
        try {
            searchResults.innerHTML = '<p class="hint" style="padding:0.5rem">Đang tìm...</p>';
            searchResults.style.display = "block";
            const users = await callApi(`/api/users/search?q=${encodeURIComponent(q)}`);
            if (users.length === 0) {
                searchResults.innerHTML = '<p class="hint" style="padding:0.5rem">Không tìm thấy ai.</p>';
            } else {
                searchResults.innerHTML = users.map(u => `
                    <div class="search-item" data-id="${u.id}" data-name="${u.hoTen}" data-username="${u.username}" 
                         style="padding: 0.5rem; cursor: pointer; border-bottom: 1px solid var(--border); font-size: 0.85rem;">
                        <strong>${u.hoTen}</strong> (@${u.username})<br/>
                        <span class="hint">${u.email}</span>
                    </div>
                `).join('');
                
                searchResults.querySelectorAll('.search-item').forEach(item => {
                    item.addEventListener('click', () => {
                        selectedUserId.value = item.dataset.id;
                        selectedUserCard.textContent = `✅ Đã chọn: ${item.dataset.name} (@${item.dataset.username})`;
                        selectedUserCard.style.display = "block";
                        addMemberBtn.disabled = false;
                        searchResults.style.display = "none";
                    });
                });
            }
        } catch (e) { searchResults.innerHTML = `<p class="hint" style="padding:0.5rem; color:var(--danger)">Lỗi: ${e.message}</p>`; }
    });
  }

  // --- Legacy Form Interop ---
  function formDataToObject(form) {
    const data = new FormData(form);
    return Object.fromEntries(data.entries());
  }

  function bindForm(formId, handler) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const result = await handler(formDataToObject(form));
        show(result);
        if (result.message) alert(result.message);
      } catch (err) {
        show(`Lỗi: ${err.message}`);
        alert(`Lỗi: ${err.message}`);
      }
    });
  }

  // Re-bind all existing forms from original dashboard.js
  bindForm("createUserForm", (f) => callApi("/api/users", { method: "POST", body: JSON.stringify(f) }));
  bindForm("createGroupForm", (f) => callApi("/api/groups", { method: "POST", body: JSON.stringify(f) }));
  bindForm("addMemberForm", (f) => callApi(`/api/groups/${f.groupId}/members`, { method: "POST", body: JSON.stringify(f) }));
  bindForm("assignTaskForm", (f) => callApi(`/api/tasks/nhiem-vu/${f.taskId}/assign`, { method: "PATCH", body: JSON.stringify(f) }));
  bindForm("updateTaskStatusForm", (f) => callApi(`/api/tasks/nhiem-vu/${f.taskId}/status`, { method: "PATCH", body: JSON.stringify(f) }));

  // Initialize
  loadSession();
})();
