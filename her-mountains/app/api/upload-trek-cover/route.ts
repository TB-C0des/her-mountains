import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { commitFile } from "../../../lib/github";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const trekId = formData.get("trekId") as string;
    const file = formData.getAll("photos")[0] as File;

    if (!trekId || !file) {
      return NextResponse.json({ ok: false, error: "Missing trekId or file." }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const allowed = ["jpg", "jpeg", "png", "webp"];
    if (!allowed.includes(ext)) {
      return NextResponse.json({ ok: false, error: "Only JPG, PNG or WebP allowed." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // Always save as cover.jpg — overwrites the existing cover
    const filename = `cover.${ext}`;

    if (process.env.GITHUB_TOKEN) {
      const ghPath = `her-mountains/public/photos/${trekId}/${filename}`;
      await commitFile(ghPath, buffer.toString("base64"), `Update cover for ${trekId}`);
      // Return the raw URL so the client can update immediately
      const owner  = process.env.GITHUB_OWNER!;
      const repo   = process.env.GITHUB_REPO!;
      const branch = process.env.GITHUB_BRANCH ?? "main";
      // Use a per-second cache-buster so CDN serves the new file
      const bust = Date.now();
      const newUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${ghPath}?t=${bust}`;
      return NextResponse.json({ ok: true, url: newUrl });
    } else {
      const dir = path.join(process.cwd(), "public", "photos", trekId);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, filename), buffer);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
