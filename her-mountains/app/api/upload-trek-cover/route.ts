import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { commitFile, readJsonFile } from "../../../lib/github";

// cover-overrides.json stores the definitive cover URL for each trek/state
// keyed by id. This bypasses raw.githubusercontent.com CDN caching entirely.
const COVER_OVERRIDES_PATH = "her-mountains/data/cover-overrides.json";
const LOCAL_COVER_OVERRIDES = path.join(process.cwd(), "data", "cover-overrides.json");

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
    const filename = `cover.${ext}`;

    if (process.env.GITHUB_TOKEN) {
      const owner  = process.env.GITHUB_OWNER!;
      const repo   = process.env.GITHUB_REPO!;
      const branch = process.env.GITHUB_BRANCH ?? "main";

      // 1. Commit the actual image file
      const ghPath = `her-mountains/public/photos/${trekId}/${filename}`;
      await commitFile(ghPath, buffer.toString("base64"), `Update cover for ${trekId}`);

      // 2. Store the cover URL in cover-overrides.json
      // Use jsDelivr — properly respects cache invalidation on new commits
      const bust = Date.now();
      const coverUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${ghPath}?t=${bust}`;

      const overrides = (await readJsonFile<Record<string, string>>(COVER_OVERRIDES_PATH)) ?? {};
      overrides[trekId] = coverUrl;
      await commitFile(
        COVER_OVERRIDES_PATH,
        Buffer.from(JSON.stringify(overrides, null, 2)).toString("base64"),
        `Update cover URL for ${trekId}`
      );

      return NextResponse.json({ ok: true, url: coverUrl });
    } else {
      // Local dev — write to disk
      const dir = path.join(process.cwd(), "public", "photos", trekId);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, filename), buffer);

      // Update local cover-overrides.json
      let overrides: Record<string, string> = {};
      if (fs.existsSync(LOCAL_COVER_OVERRIDES)) {
        overrides = JSON.parse(fs.readFileSync(LOCAL_COVER_OVERRIDES, "utf-8"));
      }
      overrides[trekId] = `/photos/${trekId}/${filename}`;
      fs.writeFileSync(LOCAL_COVER_OVERRIDES, JSON.stringify(overrides, null, 2));

      return NextResponse.json({ ok: true, url: `/photos/${trekId}/${filename}` });
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
