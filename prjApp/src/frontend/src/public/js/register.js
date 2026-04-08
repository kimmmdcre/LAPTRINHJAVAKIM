(function () {
  const registerForm = document.getElementById("registerForm");
  const output = document.getElementById("output");
  const storageKey = "pm_tool_session";

  function show(data, isError = false) {
    output.style.display = "block";
    output.style.color = isError ? "var(--danger)" : "var(--success)";
    output.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  }

  const backendUrlInput = document.getElementById("backendUrl");
  const backendUrl = backendUrlInput ? backendUrlInput.value.trim().replace(/\/$/, "") : "http://localhost:8080";

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(registerForm);
    const data = Object.fromEntries(formData.entries());

    try {
      show("Đang tạo tài khoản...", false);
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || JSON.stringify(payload));
      }

      show("Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...", false);
      setTimeout(() => {
        window.location.href = "/dang-nhap?registered=true";
      }, 1500);

    } catch (err) {
      show(`Lỗi đăng ký: ${err.message}`, true);
    }
  });
})();
