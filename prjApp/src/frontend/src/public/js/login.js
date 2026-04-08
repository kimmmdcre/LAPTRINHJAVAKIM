(function () {
  const output = document.getElementById("output");
  const backendUrlInput = document.getElementById("backendUrl");
  const loginForm = document.getElementById("loginForm");
  const storageKey = "pm_tool_session";

  function show(data) {
    output.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  }

  function roleToPath(role) {
    if (role === "ADMIN") return "/admin";
    if (role === "GIANG_VIEN") return "/giang-vien";
    if (role === "TRUONG_NHOM") return "/truong-nhom";
    return "/thanh-vien";
  }

  function safeNextPath(role) {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    const allowed = ["/admin", "/giang-vien", "/truong-nhom", "/thanh-vien"];
    const expected = roleToPath(role);
    if (next && allowed.includes(next) && next === expected) return next;
    return expected;
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(loginForm).entries());
    const base = backendUrlInput.value.trim().replace(/\/$/, "");

    try {
      const response = await fetch(`${base}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: data.username, password: data.password })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(JSON.stringify(payload));
      }

      const role = payload.role || "THANH_VIEN";
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          backendUrl: base,
          token: payload.token || "",
          role
        })
      );

      show({ message: "Đăng nhập thành công, đang chuyển trang...", role });
      window.location.href = safeNextPath(role);
    } catch (err) {
      show(`Lỗi đăng nhập: ${err.message}`);
    }
  });
})();
