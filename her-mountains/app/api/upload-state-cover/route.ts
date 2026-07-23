import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { commitFile } from "../../../lib/github";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const stateId = formData.get("stateId") as string;
    const file = formData.getAll("photos")[0] as File;

    if (!stateId || !file) {
      return NextResponse.json({ ok: false, error: "Missing stateId or file." }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const allowed = ["jpg", "jpeg", "png", "webp"];
    if (!allowed.includes(ext)) {
      return NextResponse.json({ ok: false, error: "Only JPG, PNG or WebP allowed." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // Always save as bg.jpg (overwrite previous cover)
    const filename = `bg.${ext}`;

    if (process.env.GITHUB_TOKEN) {
      const ghPath = `her-mountains/public/photos/states/${stateId}/${filename}`;
      await commitFile(ghPath, buffer.toString("base64"), `Update cover for ${stateId}`);
    } else {
      const dir = path.join(process.cwd(), "public", "photos", "states", stateId);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, filename), buffer);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
