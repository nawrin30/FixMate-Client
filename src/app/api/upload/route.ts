import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const key = process.env.IMGBB_API_KEY;
  if (!key) return NextResponse.json({ message: "ImgBB upload is not configured on the server" }, { status: 503 });

  const form = await request.formData();
  const image = form.get("image");
  if (!(image instanceof File)) return NextResponse.json({ message: "Image file is required" }, { status: 400 });
  if (!image.type.startsWith("image/")) return NextResponse.json({ message: "Only image files are allowed" }, { status: 400 });
  if (image.size > 5 * 1024 * 1024) return NextResponse.json({ message: "Image size must be less than 5 MB" }, { status: 413 });

  const upload = new FormData();
  upload.append("image", image);
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(key)}`, { method: "POST", body: upload, cache: "no-store" });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success || !result?.data?.url) {
    return NextResponse.json({ message: result?.error?.message || "ImgBB image upload failed" }, { status: 502 });
  }
  return NextResponse.json({ url: result.data.url });
}
