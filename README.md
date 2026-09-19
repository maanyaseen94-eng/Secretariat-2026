# نظام سكرتارية النائب

مشروع جديد ومستقل، بنفس الستايل والوظائف الأساسية اللي شفتها بتطبيق مكتب النائب المهندس عدي عواد الحسين: تسجيل دخول، لوحة تحكم، كتب واردة، كتب رسمية صادرة بمعاينة A4 حية وتصدير PNG، مولد ذكاء اصطناعي لصياغة الكتب، ملف شخصي، واعدادات.

HTML/CSS/JS خام بدون أي Build step — نفس نمط مشاريعك السابقة، تقدر تنشره مباشرة على GitHub Pages أو Firebase Hosting.

## خطوات التشغيل

1. **Firebase**: أنشئ مشروع Firebase جديد، فعّل:
   - Authentication → Email/Password
   - Firestore Database
   
   انسخ بيانات SDK config لملف `firebase-config.js` مكان القيم `YOUR_...`.

2. **إنشاء مستخدم أول**: من Firebase Console → Authentication → Add user، أضف بريد وكلمة مرور لأول موظف سكرتارية.

3. **قواعد Firestore**: انشر محتوى `firestore.rules` من تبويب Rules بقاعدة بيانات Firestore.

4. **الاعدادات داخل التطبيق**: بعد تسجيل الدخول، روح لصفحة "الاعدادات" وعبّي اسم النائب واسم المكتب — هذا يظهر تلقائياً بشاشة الترحيب وترويسة الكتب الرسمية.

5. **نشر دوال Vercel** (مطلوب لرفع/تحميل المرفقات، واختياري لمولد الذكاء الاصطناعي) — إذا ما عندك حساب/مشروع Vercel أصلاً:

   **أ) إنشاء الحساب والمشروع (مرة وحدة فقط)**
   1. تأكد إن كل ملفات هذا التطبيق (بما فيها `package.json` و`api/`) موجودة بمستودع GitHub تبعك (نفس مستودع `Secretariat-2026`، أو مستودع منفصل إذا تفضل).
   2. افتح [vercel.com](https://vercel.com) وسجل دخول بخيار **Continue with GitHub**.
   3. اضغط **Add New... → Project**، واختر نفس مستودع GitHub تبع التطبيق، ثم **Deploy** (بدون أي إعدادات إضافية — Vercel يتعرف تلقائياً على مجلد `api/` ويشغّله كدوال سيرفرلس، ويثبت `package.json` تلقائياً).
   4. بعد ما ينتهي النشر، راح ياخذ مشروعك رابط شبيه بـ: `https://secretariat-2026.vercel.app`.

   **ب) متغيرات البيئة**
   من صفحة المشروع بـ Vercel → **Settings → Environment Variables**، أضف حسب الميزة اللي تريدها:
   - لرفع/تحميل المرفقات (عبر بوت تيليجرام):
     - `TELEGRAM_BOT_TOKEN` — توكن البوت (تحصل عليه من محادثة [@BotFather](https://t.me/BotFather) بأمر `/newbot`).
     - `TELEGRAM_CHAT_ID` — آيدي مجموعة أو قناة خاصة تنخزن فيها الملفات: أنشئها، ضيف البوت فيها كـ **أدمن**، أرسل أي رسالة داخلها، وبعدين افتح بمتصفحك (من جهازك مباشرة، مو من هنا) الرابط:
       `https://api.telegram.org/bot<التوكن>/getUpdates`
       وراح تلقى `"chat":{"id": ...}` — هذا الرقم هو الـ chat_id (ممكن يكون بالسالب إذا مجموعة).
   - لمولد الذكاء الاصطناعي (اختياري): `ANTHROPIC_API_KEY`.

   بعد إضافة أي متغير بيئة لازم تعمل **Redeploy** للمشروع من تبويب Deployments حتى تنطبق.

   **ج) ربط الروابط بالتطبيق**
   حدّث بملف `firebase-config.js`:
   ```js
   UPLOAD_ENDPOINT: "https://your-project.vercel.app/api/upload-attachment",
   AI_ENDPOINT: "https://your-project.vercel.app/api/generate-letter", // إذا فعّلت مولد الذكاء الاصطناعي
   ```
   بدون إعداد `UPLOAD_ENDPOINT`، تبقى المرفقات تُحفظ بالاسم فقط بدون رابط تحميل فعلي (زي ما كانت سابقاً).

   > تنويه أمان: توكن بوت تيليجرام والـ API keys بيانات حساسة — لا تحطها إلا بخانة Environment Variables بـ Vercel (تنخزن مشفّرة وما تظهر بالكود المنشور للعامة). إذا صار وانكشف توكن البوت بالغلط بأي مكان، تقدر تلغيه وتنشئ وحدة جديدة له عبر أمر `/revoke` بمحادثة BotFather.

## بنية المشروع

```
login.html            تسجيل الدخول
dashboard.html         الرئيسية / لوحة التحكم
incoming-letters.html  جدول الكتب الواردة (فلاتر، بحث، Excel، أرشفة)
outgoing-letters.html  قائمة الكتب الرسمية الصادرة
create-letter.html     إنشاء كتاب رسمي + معاينة A4 حية + تصدير PNG/طباعة
view-letter.html       عرض تفاصيل كتاب وارد أو صادر
ai-generator.html      صياغة كتاب بالذكاء الاصطناعي + قوالب تحية حسب الجهة
profile.html           الملف الشخصي
settings.html          اعدادات المكتب
style.css              التصميم المشترك لكل الصفحات
firebase-config.js     إعدادات Firebase + إعدادات عامة (AI_ENDPOINT, DEFAULT_OFFICE)
auth-guard.js          حماية الصفحات + تسجيل خروج + رفع مرفقات + جلب اعدادات المكتب
sidebar.js             القائمة الجانبية الموحدة (زيادة عنصر تنقّل = سطر واحد بـ NAV_ITEMS)
firestore.rules        قواعد أمان أساسية لـ Firestore
api/generate-letter.js     دالة Vercel لتوليد الكتب عبر Claude API
api/upload-attachment.js   دالة Vercel لرفع مرفق للكتب عبر بوت تيليجرام
api/download-attachment.js دالة Vercel لتحميل مرفق سابق عبر بوت تيليجرام
package.json               اعتماديات دوال Vercel (formidable + @anthropic-ai/sdk)
```

## مجموعات Firestore المتوقعة

- `incoming_letters/{id}` — subject, number, date, senderEntity, recipientEntity, receivedAt, readAt, status (`read`|`unread`|`archived`), attachments
- `outgoing_letters/{id}` — number, date, subject, to, body, attachments, createdAt, createdBy
- `ai_templates/{id}` — entity, greeting (قوالب التحية حسب الجهة)
- `office/config` — officeName, officialName, photoUrl, managerName, managerTitle, officeType

## ملاحظة عن ترويسة الكتاب

الشعار (emblem) وختم المكتب بمعاينة الكتاب حالياً حقول فارغة (مربع بحدود منقطة) عمداً — عوضها بصورة الشعار وختم مكتبك الفعلي (كـ صورة PNG شفافة) بملف `style.css` أو مباشرة بالـ HTML، بدل استخدام رسم تقريبي غير دقيق.
