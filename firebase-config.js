/* =========================================================
   إعدادات Firebase — عدّل القيم التالية ببيانات مشروعك
   (Firebase Console → Project Settings → Your apps → SDK config)
   ========================================================= */
const firebaseConfig = {
  apiKey: "AIzaSyB-n8NZHf_31UhLES0306hkeUoOu9c0sEI",
  authDomain: "secretariat-2026.firebaseapp.com",
  projectId: "secretariat-2026",
  storageBucket: "secretariat-2026.firebasestorage.app",
  messagingSenderId: "46937013492",
  appId: "1:46937013492:web:09b95a7dc9d36d60c432a1"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

/* =========================================================
   إعدادات عامة للتطبيق — تقدر تغيرها هنا أو من صفحة الاعدادات
   داخل التطبيق (تُحفظ وقتها بمجموعة office/config في Firestore
   وتطغى على القيم الافتراضية أدناه)
   ========================================================= */
const APP_CONFIG = {
  // نقطة نهاية دالة الذكاء الاصطناعي (سيرفرلس على Vercel مثلاً)
  // شوف ملف api/generate-letter.js بنفس المشروع كمثال جاهز للنشر
  AI_ENDPOINT: "https://secretariat-2026.vercel.app/api/generate-letter",

  // نقطة نهاية رفع المرفقات (نفس مشروع Vercel، عبر بوت تيليجرام بدل Firebase Storage)
  // شوف ملف api/upload-attachment.js وتعليمات الإعداد بـ README.md، فقرة "رفع المرفقات"
  UPLOAD_ENDPOINT: "https://secretariat-2026.vercel.app/api/upload-attachment",
};

const DEFAULT_OFFICE = {
  officialName: "عدي عواد الحسين",
  officeName: "سكرتارية النائب",
  managerName: "",
  managerTitle: "سكرتير النائب",
  officeType: "خاص",
  photoUrl: "" // رابط صورة النائب (اختياري) — يفضل رفعها كرابط خارجي أو عبر بوت تيليجرام
};
