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

5. **مولد الذكاء الاصطناعي (اختياري)**:
   - انشر ملف `api/generate-letter.js` كمشروع Vercel منفصل (نفس نمط مشروعك "Secretary-" السابق).
   - ثبت `npm install @anthropic-ai/sdk formidable` بذلك المشروع.
   - أضف متغير البيئة `ANTHROPIC_API_KEY` بإعدادات Vercel.
   - انسخ رابط الدالة المنشورة وحطه بـ `APP_CONFIG.AI_ENDPOINT` داخل `firebase-config.js`.

6. **رفع المرفقات (عبر بوت تيليجرام)**: التطبيق ما يستخدم Firebase Storage (بسبب قيود الفوترة بالعراق) — الرفع يصير عبر بوت تيليجرام:
   - أنشئ بوت جديد بمحادثة مع [@BotFather](https://t.me/BotFather) على تيليجرام بأمر `/newbot`، وخذ الـ Token اللي يعطيك ياه.
   - أنشئ مجموعة أو قناة خاصة (تخزين فقط، تقدر تخليها مخفية)، وضيف البوت فيها كـ **أدمن**.
   - احصل على `chat_id` تبع هذي المجموعة/القناة (مثلاً بإضافة بوت [@userinfobot](https://t.me/userinfobot) مؤقتاً، أو بمراسلة البوت وفتح `https://api.telegram.org/bot<TOKEN>/getUpdates`).
   - انشر ملفي `api/upload-attachment.js` و `api/download-attachment.js` بنفس مشروع Vercel اللي نشرت فيه `api/generate-letter.js` (نفس الخطوة 5 أدناه)، وثبت `npm install formidable` إذا ما كان مثبت.
   - أضف بإعدادات Vercel متغيرين بيئة: `TELEGRAM_BOT_TOKEN` و `TELEGRAM_CHAT_ID`.
   - حدّث `APP_CONFIG.UPLOAD_ENDPOINT` بملف `firebase-config.js` برابط الدالة المنشورة، مثلاً:
     `https://your-project.vercel.app/api/upload-attachment`
   - بدون هذا الإعداد، تبقى المرفقات تُحفظ بالاسم فقط بدون رابط تحميل فعلي (زي ما كانت سابقاً).

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
```

## مجموعات Firestore المتوقعة

- `incoming_letters/{id}` — subject, number, date, senderEntity, recipientEntity, receivedAt, readAt, status (`read`|`unread`|`archived`), attachments
- `outgoing_letters/{id}` — number, date, subject, to, body, attachments, createdAt, createdBy
- `ai_templates/{id}` — entity, greeting (قوالب التحية حسب الجهة)
- `office/config` — officeName, officialName, photoUrl, managerName, managerTitle, officeType

## ملاحظة عن ترويسة الكتاب

الشعار (emblem) وختم المكتب بمعاينة الكتاب حالياً حقول فارغة (مربع بحدود منقطة) عمداً — عوضها بصورة الشعار وختم مكتبك الفعلي (كـ صورة PNG شفافة) بملف `style.css` أو مباشرة بالـ HTML، بدل استخدام رسم تقريبي غير دقيق.
