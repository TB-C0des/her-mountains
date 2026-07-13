import { states as baseStates } from "../data/states";
import { readJsonFile } from "./github";
import fs from "fs";
import path from "path";

type StateEntry = { id: string; name: string; tagline: string; trekNames: string[] };

const CUSTOM_STATES_PATH  = "her-mountains/data/custom-states.json";
const REMOVED_STATES_PATH = "her-mountains/data/removed-states.json";
const LOCAL_CUSTOM  = path.join(process.cwd(), "data", "custom-states.json");
const LOCAL_REMOVED = path.join(process.cwd(), "data", "removed-states.json");

async function readLocal<T>(p: string): Promise<T[]> {
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

export async function getAllStates(): Promise<StateEntry[]> {
  let customStates: StateEntry[] = [];
  let removedIds: string[] = [];

  if (process.env.GITHUB_TOKEN) {
    customStates = (await readJsonFile<StateEntry[]>(CUSTOM_STATES_PATH)) ?? [];
    removedIds   = (await readJsonFile<string[]>(REMOVED_STATES_PATH)) ?? [];
  } else {
    customStates = await readLocal<StateEntry>(LOCAL_CUSTOM);
    removedIds   = await readLocal<string>(LOCAL_REMOVED);
  }

  const baseIds = new Set(baseStates.map((s) => s.id));
  const activeBase = baseStates.filter((s) => !removedIds.includes(s.id));
  const newCustom  = customStates.filter((s) => !baseIds.has(s.id));
  return [...activeBase, ...newCustom];
}

// Returns IDs of all states that are currently active (for the manage UI)
export async function getActiveStateIds(): Promise<string[]> {
  const all = await getAllStates();
  return all.map((s) => s.id);
}
