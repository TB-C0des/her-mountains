import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { deleteFile } from "../../../lib/github";

export async function DELETE(req: NextRequest) {
  try {
    const { trekId, filename } = await req.json();
    if (!trekId || !filename) {
      return NextResponse.json({ ok: false, error: "Missing trekId or filename." }, { status: 400 });
    }

    if (process.env.GITHUB_TOKEN) {
      const ghPath = `her-mountains/public/photos/${trekId}/${filename}`;
      const result = await deleteFile(ghPath, `Remove photo from ${trekId}`);
      return NextResponse.json(result);
    } else {
      const filePath = path.join(process.cwd(), "public", "photos", trekId, filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return NextResponse.json({ ok: true });
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
