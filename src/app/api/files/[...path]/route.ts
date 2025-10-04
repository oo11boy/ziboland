import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const uploadBase = path.join(process.cwd(), "uploads");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  try {
    const resolved = await params;
    const filePath = path.join(uploadBase, ...resolved.path);

    if (!filePath.startsWith(uploadBase)) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const file = await readFile(filePath);
    const extension = path.extname(filePath).slice(1);
    const contentType = getContentType(extension);

    return new NextResponse(new Uint8Array(file), {
      headers: { "Content-Type": contentType },
    });
  } catch (error) {
    console.error("File fetch error:", error);
    return NextResponse.json({ error: "فایل یافت نشد" }, { status: 404 });
  }
}

function getContentType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    pdf: "application/pdf",
    mp4: "video/mp4",
    mp3: "audio/mpeg",
    txt: "text/plain",
  };
  return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
}
