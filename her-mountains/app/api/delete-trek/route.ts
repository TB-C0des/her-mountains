import { NextRequest, NextResponse } from "next/server";
import { loadCustomTreks, saveCustomTreks } from "../../../lib/custom-treks";
import { readJsonFile, commitFile } from "../../../lib/github";

const CUSTOM_TREKS_PATH = "her-mountains/data/custom-treks.json";

type Trek = { id: string; [key: string]: unknown };

export async function DELETE(req: NextRequest) {
  try {
    const { trekId } = await req.json();
    if (!trekId) return NextResponse.json({ ok: false, error: "Missing trekId." }, { status: 400 });

    if (process.env.GITHUB_TOKEN) {
      const existing = (await readJsonFile<Trek[]>(CUSTOM_TREKS_PATH)) ?? [];
      const updated = existing.filter((t) => t.id !== trekId);
      if (updated.length === existing.length) {
        return NextResponse.json({ ok: false, error: "Trek not found in custom treks." });
      }
      const content = Buffer.from(JSON.stringify(updated, null, 2)).toString("base64");
      await commitFile(CUSTOM_TREKS_PATH, content, `Remove trek: ${trekId}`);
    } else {
      const existing = loadCustomTreks();
      saveCustomTreks(existing.filter((t) => t.id !== trekId));
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
