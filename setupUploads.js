const { mkdir, access } = require("fs/promises");
const path = require("path");
const { constants } = require("fs");

async function setupUploads() {
  try {
    const uploadBase = path.join(process.cwd(), "public", "uploads");

    // بررسی وجود پوشه
    try {
      await access(uploadBase, constants.F_OK);
      console.log("✅ پوشه uploads موجود است");
    } catch {
      await mkdir(uploadBase, { recursive: true, mode: 0o775 });
      console.log("✅ پوشه uploads ساخته شد و مجوزها تنظیم شد");
    }
  } catch (err) {
    console.error("❌ خطا در setupUploads:", err);
  }
}

// اجرای تابع هنگام import یا اجرا
setupUploads();
