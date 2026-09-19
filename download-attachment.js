/* =========================================================
   دالة سيرفرلس (Vercel) لتحميل مرفق مرفوع سابقاً عبر بوت تيليجرام
   تاخذ file_id (المخزّن بالكتاب بـ Firestore ضمن رابط المرفق) وترجع
   محتوى الملف مباشرة، حتى يبقى توكن البوت على السيرفر فقط ولا ينكشف
   أبداً بالمتصفح (بعكس الربط المباشر برابط تيليجرام اللي يحتوي التوكن)
   ========================================================= */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export default async function handler(req, res) {
  // CORS (احتياطاً، للسماح بأي استخدام مستقبلي عبر fetch من نطاق مختلف)
  res.setHeader("Access-Control-Allow-Origin", "*");

  const fileId = req.query.file_id;
  const name = req.query.name || "مرفق";
  if (!fileId) return res.status(400).json({ error: "file_id مطلوب" });
  if (!BOT_TOKEN) return res.status(500).json({ error: "لم يتم إعداد TELEGRAM_BOT_TOKEN بمتغيرات بيئة Vercel" });

  try {
    const infoRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${encodeURIComponent(fileId)}`);
    const info = await infoRes.json();
    if (!info.ok) return res.status(404).json({ error: "تعذر العثور على الملف بتيليجرام", details: info.description });

    const filePath = info.result.file_path;
    const fileRes = await fetch(`https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`);
    if (!fileRes.ok) return res.status(502).json({ error: "تعذر تحميل الملف من تيليجرام" });

    const buffer = Buffer.from(await fileRes.arrayBuffer());
    res.setHeader("Content-Type", fileRes.headers.get("content-type") || "application/octet-stream");
    // filename* بترميز UTF-8 حتى تظهر أسماء الملفات العربية صحيحة عند التحميل،
    // مع اسم احتياطي بالإنكليزية للمتصفحات القديمة
    res.setHeader("Content-Disposition", `attachment; filename="attachment"; filename*=UTF-8''${encodeURIComponent(name)}`);
    res.status(200).send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "فشل تحميل المرفق", details: err.message });
  }
}
