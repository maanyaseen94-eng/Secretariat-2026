/* =========================================================
   يبني القائمة الجانبية والشريط العلوي بشكل موحد بكل الصفحات
   استدعِ renderShell('key', 'عنوان الصفحة الحالي') بعد تحميل الصفحة
   ========================================================= */

const NAV_ITEMS = [
  { key: "dashboard", label: "الرئيسية", icon: "fa-house", href: "dashboard.html" },
  { key: "incoming", label: "الطلبات الواردة", icon: "fa-envelope", href: "incoming-letters.html" },
  { key: "outgoing", label: "الكتب الرسمية الصادرة", icon: "fa-paper-plane", href: "outgoing-letters.html" },
  { key: "ai", label: "مولد الذكاء الاصطناعي", icon: "fa-wand-magic-sparkles", href: "ai-generator.html", perm: "aiGenerator" },
  { key: "profile", label: "الملف الشخصي", icon: "fa-user", href: "profile.html" },
  { key: "users", label: "إدارة المستخدمين", icon: "fa-users-gear", href: "users.html", adminOnly: true },
  { key: "settings", label: "الاعدادات", icon: "fa-gear", href: "settings.html", perm: "settings" },
];

function renderShell(activeKey, pageTitle) {
  const sidebarHtml = `
    <div class="app-sidebar">
      <div class="sidebar-brand">سكرتارية النائب</div>
      <nav class="sidebar-nav">
        ${NAV_ITEMS.map((item) => {
          const restricted = !!(item.perm || item.adminOnly);
          return `
          <a href="${item.href}" class="sidebar-link ${item.key === activeKey ? "active" : ""} ${restricted ? "nav-restricted" : ""}"
             data-perm="${item.perm || ""}" data-admin-only="${item.adminOnly ? "1" : "0"}"
             ${restricted ? 'style="display:none"' : ""}>
            <i class="fa-solid ${item.icon}"></i>
            <span>${item.label}</span>
          </a>`;
        }).join("")}
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

  // إذا صلاحيات المستخدم متوفرة مسبقاً (تجهزت قبل تحميل القائمة الجانبية)، طبّقها فوراً
  if (typeof CURRENT_ROLE !== "undefined" && typeof CURRENT_PERMS !== "undefined") {
    applyPermissions(CURRENT_ROLE, CURRENT_PERMS);
  }

  updateIncomingBadge();
}

/* =========================================================
   مربع أحمر بعدد "الطلبات الواردة" غير المقروءة أمام رابطها بالقائمة
   الجانبية، بكل صفحات التطبيق، حتى يتم الانتباه لها بسرعة. يحسب نفس
   منطق حالة "غير مقروء" المستخدم بصفحة الطلبات الواردة (نفس المصدرين:
   incoming_letters الخارجية + outgoing_letters الداخلية الواصلة لهذا الحساب)
   ========================================================= */
async function updateIncomingBadge() {
  if (typeof db === "undefined" || typeof AUTH_READY === "undefined") return;
  const link = document.querySelector('.sidebar-link[href="incoming-letters.html"]');
  if (!link) return;
  try {
    const user = await AUTH_READY;
    const [incSnap, outSnap] = await Promise.all([
      db.collection("incoming_letters").get(),
      db.collection("outgoing_letters").where("toUid", "==", user.uid).get(),
    ]);
    let count = 0;
    incSnap.docs.forEach((d) => {
      const status = d.data().status;
      if (!status || status === "unread") count++;
    });
    outSnap.docs.forEach((d) => {
      if (!d.data().readAt) count++;
    });

    let badge = link.querySelector(".sidebar-badge");
    if (count > 0) {
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "sidebar-badge";
        link.appendChild(badge);
      }
      badge.textContent = count > 99 ? "99+" : String(count);
    } else if (badge) {
      badge.remove();
    }
  } catch (e) {
    console.warn("تعذر تحديث عداد الطلبات الواردة بالقائمة الجانبية:", e);
  }
}

/* =========================================================
   تُستدعى تلقائياً من auth-guard.js بعد جلب دور وصلاحيات
   المستخدم الحالي — تُظهر بالقائمة الجانبية بس العناصر المسموحة
   ========================================================= */
function applyPermissions(role, perms) {
  document.querySelectorAll(".nav-restricted").forEach((el) => {
    const isAdmin = role === "admin";
    const adminOnly = el.dataset.adminOnly === "1";
    const perm = el.dataset.perm;
    let allowed = isAdmin;
    if (!allowed && !adminOnly && perm) allowed = !!(perms && perms[perm]);
    el.style.display = allowed ? "" : "none";
  });
}
