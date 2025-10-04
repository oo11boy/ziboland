import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink, readdir, stat } from "fs/promises";
import path from "path";

const uploadBase = path.join(process.cwd(), "uploads");

// 📌 آپلود فایل جدید
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const blob = formData.get("file") as Blob;

    if (!blob) {
      return NextResponse.json({ error: "هیچ فایلی ارسال نشده است" }, { status: 400 });
    }

    // گرفتن پسوند فایل از MIME type
    const mime = blob.type;
    const extension = mime ? `.${mime.split("/")[1]}` : "";

    const uniqueName = `${Date.now()}${extension}`;
    const bytes = await blob.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const uploadDir = path.join(uploadBase, year.toString(), month);
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    // URL برای دسترسی به فایل از طریق API Route
    const url = `/api/files/${year}/${month}/${uniqueName}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "خطا در آپلود فایل" }, { status: 500 });
  }
}

// 📌 گرفتن لیست فایل‌ها
export async function GET() {
  try {
    let files: { url: string; name: string; time: number }[] = [];

    const years = await readdir(uploadBase);
    for (const year of years) {
      const months = await readdir(path.join(uploadBase, year));
      for (const month of months) {
        const dir = path.join(uploadBase, year, month);
        const filenames = await readdir(dir);

        for (const file of filenames) {
          const filePath = path.join(dir, file);
          const stats = await stat(filePath);
          files.push({
            url: `/api/files/${year}/${month}/${file}`,
            name: file,
            time: stats.mtimeMs,
          });
        }
      }
    }

    // مرتب‌سازی: آخرین فایل‌ها اول
    files = files.sort((a, b) => b.time - a.time);

    return NextResponse.json({ files });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "خطا در دریافت فایل‌ها" }, { status: 500 });
  }
}

// 📌 حذف فایل
export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "آدرس فایل ارسال نشده است" }, { status: 400 });
    }

    // استخراج مسیر فایل از URL
    const relativePath = url.replace("/api/files/", "");
    const filePath = path.join(uploadBase, relativePath);

    // اعتبارسنجی مسیر برای جلوگیری از path traversal
    if (!filePath.startsWith(uploadBase)) {
      return NextResponse.json({ error: "دسترسی غیرمجاز به فایل" }, { status: 403 });
    }

    await unlink(filePath);

    return NextResponse.json({ success: true, message: "فایل با موفقیت حذف شد" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "خطا در حذف فایل" }, { status: 500 });
  }
}