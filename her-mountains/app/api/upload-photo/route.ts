import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { commitFile } from "../../../lib/github";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const trekId = formData.get("trekId") as string;
    const files = formData.getAll("photos") as File[];

    if (!trekId || files.length === 0) {
      return NextResponse.json({ ok: false, error: "Missing trekId or files." }, { status: 400 });
    }

    const allowed = ["jpg", "jpeg", "png", "webp", "avif"];
    let uploaded = 0;

    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      if (!allowed.includes(ext)) continue;

      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      if (process.env.GITHUB_TOKEN) {
        // Production: commit to GitHub repo
        // The Next.js app lives in a subfolder "her-mountains/" within the repo
        const ghPath = `her-mountains/public/photos/${trekId}/${filename}`;
        await commitFile(ghPath, buffer.toString("base64"), `Add photo to ${trekId}`);
      } else {
        // Local dev: write to disk
        const dir = path.join(process.cwd(), "public", "photos", trekId);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, filename), buffer);
      }

      uploaded++;
    }

    return NextResponse.json({ ok: true, uploaded });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
