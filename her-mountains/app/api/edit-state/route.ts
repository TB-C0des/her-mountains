import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { readJsonFile, commitFile } from "../../../lib/github";

// Stores tagline overrides for any state (base or custom), keyed by stateId
const OVERRIDES_PATH = "her-mountains/data/state-overrides.json";
const LOCAL_PATH = path.join(process.cwd(), "data", "state-overrides.json");

type Overrides = Record<string, { tagline?: string }>;

async function load(): Promise<Overrides> {
  if (process.env.GITHUB_TOKEN) return (await readJsonFile<Overrides>(OVERRIDES_PATH)) ?? {};
  if (!fs.existsSync(LOCAL_PATH)) return {};
  return JSON.parse(fs.readFileSync(LOCAL_PATH, "utf-8"));
}

async function save(data: Overrides) {
  if (process.env.GITHUB_TOKEN) {
    await commitFile(OVERRIDES_PATH, Buffer.from(JSON.stringify(data, null, 2)).toString("base64"), "Update state content");
  } else {
    fs.writeFileSync(LOCAL_PATH, JSON.stringify(data, null, 2));
  }
}

export async function POST(req: NextRequest) {
  try {
    const { stateId, tagline } = await req.json();
    if (!stateId || !tagline?.trim()) {
      return NextResponse.json({ ok: false, error: "Missing stateId or tagline." }, { status: 400 });
    }
    const all = await load();
    all[stateId] = { ...(all[stateId] ?? {}), tagline: tagline.trim() };
    await save(all);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
