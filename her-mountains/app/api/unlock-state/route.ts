import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { readJsonFile, commitFile } from "../../../lib/github";
import { allIndiaStates } from "../../../data/all-india-states";
import { states as baseStates } from "../../../data/states";

type StateEntry = { id: string; name: string; tagline: string; trekNames: string[] };

const CUSTOM_STATES_PATH  = "her-mountains/data/custom-states.json";
const REMOVED_STATES_PATH = "her-mountains/data/removed-states.json";
const LOCAL_CUSTOM  = path.join(process.cwd(), "data", "custom-states.json");
const LOCAL_REMOVED = path.join(process.cwd(), "data", "removed-states.json");

async function readJson<T>(ghPath: string, localPath: string): Promise<T[]> {
  if (process.env.GITHUB_TOKEN) return (await readJsonFile<T[]>(ghPath)) ?? [];
  if (!fs.existsSync(localPath)) return [];
  return JSON.parse(fs.readFileSync(localPath, "utf-8"));
}

async function writeJson<T>(data: T[], ghPath: string, localPath: string, msg: string) {
  if (process.env.GITHUB_TOKEN) {
    await commitFile(ghPath, Buffer.from(JSON.stringify(data, null, 2)).toString("base64"), msg);
  } else {
    fs.writeFileSync(localPath, JSON.stringify(data, null, 2));
  }
}

// POST — toggle a state on/off
export async function POST(req: NextRequest) {
  try {
    const { stateId } = await req.json();
    if (!stateId) return NextResponse.json({ ok: false, error: "Missing stateId." }, { status: 400 });

    const meta = allIndiaStates.find((s) => s.id === stateId);
    if (!meta) return NextResponse.json({ ok: false, error: "Unknown state." }, { status: 400 });

    const isBase = baseStates.some((s) => s.id === stateId);
    const customStates = await readJson<StateEntry>(CUSTOM_STATES_PATH, LOCAL_CUSTOM);
    const removedIds   = await readJson<string>(REMOVED_STATES_PATH, LOCAL_REMOVED);

    if (isBase) {
      // Toggle base state visibility via removed-states list
      if (removedIds.includes(stateId)) {
        // Re-add it
        await writeJson(removedIds.filter((id) => id !== stateId), REMOVED_STATES_PATH, LOCAL_REMOVED, `Restore state: ${stateId}`);
        return NextResponse.json({ ok: true, action: "restored" });
      } else {
        // Remove it
        await writeJson([...removedIds, stateId], REMOVED_STATES_PATH, LOCAL_REMOVED, `Hide state: ${stateId}`);
        return NextResponse.json({ ok: true, action: "removed" });
      }
    } else {
      // Toggle custom state
      if (customStates.some((s) => s.id === stateId)) {
        // Remove it
        await writeJson(customStates.filter((s) => s.id !== stateId), CUSTOM_STATES_PATH, LOCAL_CUSTOM, `Remove state: ${stateId}`);
        return NextResponse.json({ ok: true, action: "removed" });
      } else {
        // Add it
        const newState: StateEntry = { id: meta.id, name: meta.name, tagline: "Waiting to be explored.", trekNames: [] };
        await writeJson([...customStates, newState], CUSTOM_STATES_PATH, LOCAL_CUSTOM, `Add state: ${stateId}`);
        return NextResponse.json({ ok: true, action: "added" });
      }
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const custom   = await readJson<StateEntry>(CUSTOM_STATES_PATH, LOCAL_CUSTOM);
    const removed  = await readJson<string>(REMOVED_STATES_PATH, LOCAL_REMOVED);
    return NextResponse.json({ ok: true, customStates: custom, removedIds: removed });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
