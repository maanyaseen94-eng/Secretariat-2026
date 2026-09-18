/* =========================================================
   حماية الصفحات الداخلية: يحول لصفحة الدخول اذا المستخدم مب مسجل
   ضيف <script src="firebase-config.js"></script> ثم هذا الملف
   بأي صفحة داخلية (بعد تحميل Firebase SDK)
   ========================================================= */
let CURRENT_USER = null;

const AUTH_READY = new Promise((resolve) => {
  auth.onAuthStateChanged(function (user) {
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    CURRENT_USER = user;
    resolve(user);
  });
});

function logout() {
  auth.signOut().then(function () {
    window.location.href = "login.html";
  });
}

/* =========================================================
   الأدوار والصلاحيات: كل مستخدم إله مستند بمجموعة users/{uid}
   يحدد role ("admin" أو "staff") وخارطة permissions.
   المدير (admin) عنده كل الصلاحيات دائماً بغض النظر عن الخارطة.
   إذا ما إله مستند بعد (موظف جديد لسا المدير ما أضافه من صفحة
   "إدارة المستخدمين")، تُعتبر صلاحياته كلها معطّلة احتياطاً.
   ========================================================= */
let CURRENT_ROLE = "staff";
let CURRENT_PERMS = { settings: false, deleteArchive: false, aiGenerator: false };
// بروفايل المستخدم كامل (اسم، منصب وظيفي، جهة مستلمة ثابتة لكتبه...) — يُقرأ من users/{uid}
let CURRENT_PROFILE = null;

const PERMS_READY = AUTH_READY.then(async (user) => {
  try {
    const snap = await db.collection("users").doc(user.uid).get();
    if (snap.exists) {
      const data = snap.data();
      CURRENT_PROFILE = data;
      CURRENT_ROLE = data.role === "admin" ? "admin" : "staff";
      CURRENT_PERMS = Object.assign(
        { settings: false, deleteArchive: false, aiGenerator: false },
        data.permissions || {}
      );
    }
  } catch (e) {
    console.warn("تعذر جلب صلاحيات المستخدم:", e);
  }
  if (typeof applyPermissions === "function") applyPermissions(CURRENT_ROLE, CURRENT_PERMS);
  return { role: CURRENT_ROLE, perms: CURRENT_PERMS, profile: CURRENT_PROFILE };
});

function hasPermission(perm) {
  return CURRENT_ROLE === "admin" || !!CURRENT_PERMS[perm];
}

// تحوّل المستخدم للرئيسية إذا ما يملك الصلاحية المطلوبة لهذي الصفحة
function requirePermission(perm) {
  PERMS_READY.then(() => {
    if (!hasPermission(perm)) {
      alert("عذراً، لا تملك صلاحية الوصول لهذه الصفحة");
      window.location.href = "dashboard.html";
    }
  });
}

// تحوّل المستخدم للرئيسية إذا مو مدير (لصفحات خاصة بالمدير فقط)
function requireAdmin() {
  PERMS_READY.then(() => {
    if (CURRENT_ROLE !== "admin") {
      alert("هذه الصفحة خاصة بالمدير فقط");
      window.location.href = "dashboard.html";
    }
  });
}

/* =========================================================
   رفع مرفق (صور/PDF/مستندات وغيرها)
   Firebase Storage غير مفعل بسبب قيود الفوترة بالعراق —
   استبدل هذي الدالة بمنطق الرفع عبر بوت تيليجرام (Telegram Bot API)
   متل باقي مشاريعك: أرسل الملف كـ document للبوت واحفظ رابط/معرف الملف
   ========================================================= */
async function uploadAttachment(file) {
  console.warn("uploadAttachment: لم يتم ربط التخزين الفعلي بعد →", file.name);
  // TODO: استدعِ endpoint سيرفرلس يرفع الملف لبوت تيليجرام ويرجع رابط
  return { name: file.name, size: file.size, url: "#" };
}

/* =========================================================
   جلب إعدادات المكتب من Firestore (أو القيم الافتراضية إذا ما زالت غير محفوظة)
   ========================================================= */
async function getOfficeConfig() {
  try {
    const snap = await db.collection("office").doc("config").get();
    if (snap.exists) return Object.assign({}, DEFAULT_OFFICE, snap.data());
  } catch (e) {
    console.warn("تعذر جلب إعدادات المكتب، استخدام القيم الافتراضية", e);
  }
  return DEFAULT_OFFICE;
}
