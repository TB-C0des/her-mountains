import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { readJsonFile, commitFile } from "../../../lib/github";
import { states as baseStates } from "../../../data/states";

const STATES_PATH = "her-mountains/data/custom-states.json";
const LOCAL_PATH  = path.join(process.cwd(), "data", "custom-states.json");

type StateEntry = { id: string; [key: string]: unknown };

export async function DELETE(req: NextRequest) {
  try {
    const { stateId } = await req.json();
    if (!stateId) return NextResponse.json({ ok: false, error: "Missing stateId." }, { status: 400 });

    // Base states cannot be deleted via API
    if (baseStates.some((s) => s.id === stateId)) {
      return NextResponse.json({ ok: false, error: "Base states cannot be removed from the UI." });
    }

    let existing: StateEntry[] = [];
    if (process.env.GITHUB_TOKEN) {
      existing = (await readJsonFile<StateEntry[]>(STATES_PATH)) ?? [];
    } else {
      if (fs.existsSync(LOCAL_PATH)) existing = JSON.parse(fs.readFileSync(LOCAL_PATH, "utf-8"));
    }

    const updated = existing.filter((s) => s.id !== stateId);

    if (process.env.GITHUB_TOKEN) {
      const content = Buffer.from(JSON.stringify(updated, null, 2)).toString("base64");
      await commitFile(STATES_PATH, content, `Remove state: ${stateId}`);
    } else {
      fs.writeFileSync(LOCAL_PATH, JSON.stringify(updated, null, 2));
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
