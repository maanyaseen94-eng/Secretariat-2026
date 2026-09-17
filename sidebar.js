/* =========================================================
   يبني القائمة الجانبية والشريط العلوي بشكل موحد بكل الصفحات
   استدعِ renderShell('key', 'عنوان الصفحة الحالي') بعد تحميل الصفحة
   ========================================================= */

const NAV_ITEMS = [
  { key: "dashboard", label: "الرئيسية", icon: "fa-house", href: "dashboard.html" },
  { key: "incoming", label: "الكتب الواردة", icon: "fa-envelope", href: "incoming-letters.html" },
  { key: "outgoing", label: "الكتب الرسمية الصادرة", icon: "fa-paper-plane", href: "outgoing-letters.html" },
  { key: "ai", label: "مولد الذكاء الاصطناعي", icon: "fa-wand-magic-sparkles", href: "ai-generator.html" },
  { key: "profile", label: "الملف الشخصي", icon: "fa-user", href: "profile.html" },
  { key: "settings", label: "الاعدادات", icon: "fa-gear", href: "settings.html" },
];

function renderShell(activeKey, pageTitle) {
  const sidebarHtml = `
    <div class="app-sidebar">
      <div class="sidebar-brand">سكرتارية النائب</div>
      <nav class="sidebar-nav">
        ${NAV_ITEMS.map(
          (item) => `
          <a href="${item.href}" class="sidebar-link ${item.key === activeKey ? "active" : ""}">
            <i class="fa-solid ${item.icon}"></i>
            <span>${item.label}</span>
          </a>`
        ).join("")}
        <a href="#" class="sidebar-link sidebar-logout" onclick="logout(); return false;">
          <i class="fa-solid fa-right-from-bracket"></i>
          <span>تسجيل خروج</span>
        </a>
      </nav>
    </div>`;

  const topbarHtml = `
    <div class="app-topbar">
      <div class="topbar-right">
        <button class="sidebar-toggle-btn d-lg-none" onclick="document.body.classList.toggle('sidebar-open')">
          <i class="fa-solid fa-bars"></i>
        </button>
        <span class="topbar-title">${pageTitle}</span>
      </div>
      <div class="topbar-left">
        <i class="fa-regular fa-bell"></i>
      </div>
    </div>`;

  const sidebarEl = document.getElementById("sidebar-placeholder");
  const topbarEl = document.getElementById("topbar-placeholder");
  if (sidebarEl) sidebarEl.innerHTML = sidebarHtml;
  if (topbarEl) topbarEl.innerHTML = topbarHtml;
}
