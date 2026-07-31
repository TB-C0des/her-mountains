import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { commitFile, readJsonFile } from "../../../lib/github";

const COVER_OVERRIDES_PATH = "her-mountains/data/cover-overrides.json";
const LOCAL_COVER_OVERRIDES = path.join(process.cwd(), "data", "cover-overrides.json");

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
    const filename = `bg.${ext}`;

    if (process.env.GITHUB_TOKEN) {
      const owner  = process.env.GITHUB_OWNER!;
      const repo   = process.env.GITHUB_REPO!;
      const branch = process.env.GITHUB_BRANCH ?? "main";

      // 1. Commit the image
      const ghPath = `her-mountains/public/photos/states/${stateId}/${filename}`;
      await commitFile(ghPath, buffer.toString("base64"), `Update cover for state ${stateId}`);

      // 2. Store URL in cover-overrides.json with unique bust timestamp
      const bust = Date.now();
      const coverUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${ghPath}?t=${bust}`;
      const key = `states/${stateId}`;

      const overrides = (await readJsonFile<Record<string, string>>(COVER_OVERRIDES_PATH)) ?? {};
      overrides[key] = coverUrl;
      await commitFile(
        COVER_OVERRIDES_PATH,
        Buffer.from(JSON.stringify(overrides, null, 2)).toString("base64"),
        `Update cover URL for state ${stateId}`
      );

      return NextResponse.json({ ok: true, url: coverUrl });
    } else {
      const dir = path.join(process.cwd(), "public", "photos", "states", stateId);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, filename), buffer);

      // Update local overrides
      let overrides: Record<string, string> = {};
      if (fs.existsSync(LOCAL_COVER_OVERRIDES)) {
        overrides = JSON.parse(fs.readFileSync(LOCAL_COVER_OVERRIDES, "utf-8"));
      }
      overrides[`states/${stateId}`] = `/photos/states/${stateId}/${filename}`;
      fs.writeFileSync(LOCAL_COVER_OVERRIDES, JSON.stringify(overrides, null, 2));

      return NextResponse.json({ ok: true });
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
