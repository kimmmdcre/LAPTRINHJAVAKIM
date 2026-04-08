const path = require("path");
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.redirect("/dang-nhap");
});

app.get("/dang-nhap", (req, res) => {
  res.render("pages/login", { backendUrl: BACKEND_URL });
});

app.get("/dang-ky", (req, res) => {
  res.render("pages/register", { backendUrl: BACKEND_URL });
});

function renderDashboard(roleKey, roleLabel, pageTitle) {
  return (req, res) => {
    res.render("layouts/dashboard", {
      backendUrl: BACKEND_URL,
      roleKey,
      roleLabel,
      pageTitle
    });
  };
}

app.get("/admin", renderDashboard("ADMIN", "Quản trị viên", "Quản trị viên — Hệ thống"));
app.get("/giang-vien", renderDashboard("GIANG_VIEN", "Giảng viên", "Giảng viên — Giám sát nhóm"));
app.get("/truong-nhom", renderDashboard("TRUONG_NHOM", "Trưởng nhóm", "Trưởng nhóm — Điều phối dự án"));
app.get("/thanh-vien", renderDashboard("THANH_VIEN", "Thành viên", "Thành viên — Nhiệm vụ của tôi"));

app.get("/health", (req, res) => {
  res.json({ status: "ok", frontend: "running" });
});

app.listen(PORT, () => {
  console.log(`Frontend started at http://localhost:${PORT}`);
});
