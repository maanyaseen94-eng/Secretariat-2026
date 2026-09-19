/* =========================================================
   مثال دالة سيرفرلس (Vercel) لصياغة كتاب رسمي عبر Claude API
   نفس نمط مشروعك "Secretary-" السابق — انشرها كمشروع Vercel
   منفصل، وحط رابطها بـ APP_CONFIG.AI_ENDPOINT بملف firebase-config.js

   التثبيت:
     npm install @anthropic-ai/sdk formidable
   متغير البيئة المطلوب على Vercel:
     ANTHROPIC_API_KEY
   ========================================================= */

const Anthropic = require("@anthropic-ai/sdk");
const formidable = require("formidable");
const fs = require("fs");

export const config = { api: { bodyParser: false } };

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const form = formidable({ multiples: false });
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
    });

    const instructions = fields.instructions || "";
    const entity = fields.entity || "";

    // لو انرفع ملف (صورة/PDF لكتاب وارد)، نحوله base64 ونمرره كمرفق للنموذج
    const contentBlocks = [];
    if (files.file) {
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      const buffer = fs.readFileSync(file.filepath);
      const mediaType = file.mimetype || "application/octet-stream";
      if (mediaType.startsWith("image/")) {
        contentBlocks.push({
          type: "image",
          source: { type: "base64", media_type: mediaType, data: buffer.toString("base64") },
        });
      }
      // ملاحظة: لدعم ملفات PDF مباشرة راجع توثيق Claude لدعم مرفقات PDF
    }

    contentBlocks.push({
      type: "text",
      text: `صغ كتاباً رسمياً عراقياً باللغة العربية الفصحى وبأسلوب المراسلات الحكومية الرسمية.
الجهة المرسل إليها: ${entity || "غير محددة"}.
النقاط والتعليمات المطلوب تضمينها:
${instructions}

أرجع النتيجة بصيغة JSON فقط بدون أي نص إضافي، بالشكل التالي:
{"subject": "عنوان موجز للكتاب", "to": "الجهة المرسل إليها", "body": "نص الكتاب الرسمي الكامل"}`,
    });

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1500,
      messages: [{ role: "user", content: contentBlocks }],
    });

    const raw = msg.content[0].text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);

    res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "فشل توليد الكتاب", details: err.message });
  }
}
