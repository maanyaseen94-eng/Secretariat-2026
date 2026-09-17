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
