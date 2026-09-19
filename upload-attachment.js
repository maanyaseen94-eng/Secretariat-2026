/* =========================================================
   دالة سيرفرلس (Vercel) لرفع مرفقات الكتب عبر بوت تيليجرام
   (بديل عن Firebase Storage المعطل بسبب قيود الفوترة بالعراق)
   انشرها بنفس مشروع Vercel اللي نشرت فيه api/generate-letter.js،
   وحط رابطها بـ APP_CONFIG.UPLOAD_ENDPOINT داخل firebase-config.js

   التثبيت:
     npm install formidable
   متغيرات البيئة المطلوبة على Vercel:
     TELEGRAM_BOT_TOKEN  — توكن البوت (تحصل عليه من @BotFather)
     TELEGRAM_CHAT_ID    — آيدي الشات/المجموعة/القناة اللي تنخزن فيها الملفات
                            (خلي البوت عضو/أدمن فيها أولاً)
   ملاحظة: الحد الأقصى لحجم الملف عبر Telegram Bot API هو 50 ميغابايت
   ========================================================= */

const formidable = require("formidable");
const fs = require("fs");

export const config = { api: { bodyParser: false } };

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export default async function handler(req, res) {
  // CORS: التطبيق منشور على نطاق مختلف (GitHub Pages) عن هذي الدالة (Vercel)،
  // فلازم نصرّح صراحة إن الطلبات من أي نطاق مسموحة، وإلا يرفضها المتصفح بخطأ
  // "Failed to fetch" حتى لو الدالة نفسها اشتغلت صح
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ error: "لم يتم إعداد TELEGRAM_BOT_TOKEN أو TELEGRAM_CHAT_ID بمتغيرات بيئة Vercel" });
  }

  try {
    const form = formidable({ multiples: false, maxFileSize: 50 * 1024 * 1024 });
    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
    });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) return res.status(400).json({ error: "لم يتم إرسال أي ملف" });

    const buffer = fs.readFileSync(file.filepath);
    const originalName = file.originalFilename || "مرفق";

    // نرسل الملف كـ "document" دايماً (حتى لو صورة) عشان تيليجرام يحفظه بجودته
    // الأصلية بدون ضغط، ونضمن رجوع نفس بنية النتيجة (result.document) دايماً
    const tgForm = new FormData();
    tgForm.append("chat_id", CHAT_ID);
    tgForm.append("document", new Blob([buffer], { type: file.mimetype || "application/octet-stream" }), originalName);

    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
      method: "POST",
      body: tgForm,
    });
    const tgData = await tgRes.json();

    if (!tgData.ok) {
      console.error("Telegram error:", tgData);
      return res.status(502).json({ error: "فشل رفع الملف عبر تيليجرام", details: tgData.description });
    }

    const fileId = tgData.result.document && tgData.result.document.file_id;
    if (!fileId) return res.status(502).json({ error: "لم يتم استلام معرّف الملف من تيليجرام" });

    // رابط دائم يمر عبر دالتنا (api/download-attachment.js) عشان توكن البوت
    // يبقى بالسيرفر فقط ولا ينكشف أبداً بالمتصفح
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host;
    const url = `${proto}://${host}/api/download-attachment?file_id=${encodeURIComponent(fileId)}&name=${encodeURIComponent(originalName)}`;

    res.status(200).json({ name: originalName, size: file.size, fileId, url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "فشل رفع المرفق", details: err.message });
  }
}
