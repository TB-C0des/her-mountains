import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { readJsonFile, commitFile } from "../../../lib/github";

// Stores per-trek content overrides (yourLines + prompts) keyed by trekId
// Works for both base and custom treks
const OVERRIDES_PATH = "her-mountains/data/trek-overrides.json";
const LOCAL_PATH = path.join(process.cwd(), "data", "trek-overrides.json");

type Overrides = Record<string, { yourLines?: string[]; prompts?: string[] }>;

async function load(): Promise<Overrides> {
  if (process.env.GITHUB_TOKEN) return (await readJsonFile<Overrides>(OVERRIDES_PATH)) ?? {};
  if (!fs.existsSync(LOCAL_PATH)) return {};
  return JSON.parse(fs.readFileSync(LOCAL_PATH, "utf-8"));
}

async function save(data: Overrides) {
  if (process.env.GITHUB_TOKEN) {
    await commitFile(OVERRIDES_PATH, Buffer.from(JSON.stringify(data, null, 2)).toString("base64"), "Update trek content");
  } else {
    fs.writeFileSync(LOCAL_PATH, JSON.stringify(data, null, 2));
  }
}

export async function POST(req: NextRequest) {
  try {
    const { trekId, yourLines, prompts } = await req.json();
    if (!trekId) return NextResponse.json({ ok: false, error: "Missing trekId." }, { status: 400 });

    const all = await load();
    all[trekId] = {
      ...(all[trekId] ?? {}),
      ...(yourLines ? { yourLines } : {}),
      ...(prompts   ? { prompts   } : {}),
    };
    await save(all);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
