import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { readJsonFile, commitFile } from "../../../lib/github";
import { allIndiaStates } from "../../../data/all-india-states";

type StateEntry = {
  id: string;
  name: string;
  tagline: string;
  trekNames: string[];
};

const STATES_PATH = "her-mountains/data/custom-states.json";
const LOCAL_PATH  = path.join(process.cwd(), "data", "custom-states.json");

async function loadCustomStates(): Promise<StateEntry[]> {
  if (process.env.GITHUB_TOKEN) {
    return (await readJsonFile<StateEntry[]>(STATES_PATH)) ?? [];
  }
  if (!fs.existsSync(LOCAL_PATH)) return [];
  return JSON.parse(fs.readFileSync(LOCAL_PATH, "utf-8"));
}

async function saveCustomStates(states: StateEntry[]): Promise<void> {
  if (process.env.GITHUB_TOKEN) {
    const content = Buffer.from(JSON.stringify(states, null, 2)).toString("base64");
    await commitFile(STATES_PATH, content, `Update custom states`);
  } else {
    fs.writeFileSync(LOCAL_PATH, JSON.stringify(states, null, 2));
  }
}

export async function POST(req: NextRequest) {
  try {
    const { stateId } = await req.json();
    if (!stateId) return NextResponse.json({ ok: false, error: "Missing stateId." }, { status: 400 });

    const meta = allIndiaStates.find((s) => s.id === stateId);
    if (!meta) return NextResponse.json({ ok: false, error: "Unknown state." }, { status: 400 });

    const existing = await loadCustomStates();
    if (existing.some((s) => s.id === stateId)) {
      return NextResponse.json({ ok: false, error: "State already unlocked." });
    }

    const newState: StateEntry = {
      id: meta.id,
      name: meta.name,
      tagline: `Waiting to be explored.`,
      trekNames: [],
    };

    await saveCustomStates([...existing, newState]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const custom = await loadCustomStates();
    return NextResponse.json({ ok: true, states: custom });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
