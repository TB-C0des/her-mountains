import { states as baseStates } from "../data/states";
import { readJsonFile } from "./github";
import fs from "fs";
import path from "path";

type StateEntry = { id: string; name: string; tagline: string; trekNames: string[] };

const CUSTOM_STATES_PATH  = "her-mountains/data/custom-states.json";
const REMOVED_STATES_PATH = "her-mountains/data/removed-states.json";
const STATE_OVERRIDES_PATH = "her-mountains/data/state-overrides.json";
const LOCAL_CUSTOM   = path.join(process.cwd(), "data", "custom-states.json");
const LOCAL_REMOVED  = path.join(process.cwd(), "data", "removed-states.json");
const LOCAL_OVERRIDES = path.join(process.cwd(), "data", "state-overrides.json");

async function readLocal<T>(p: string): Promise<T[]> {
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

async function readLocalObj<T>(p: string): Promise<T> {
  if (!fs.existsSync(p)) return {} as T;
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

export async function getAllStates(): Promise<StateEntry[]> {
  let customStates: StateEntry[] = [];
  let removedIds: string[] = [];
  let overrides: Record<string, { tagline?: string }> = {};

  if (process.env.GITHUB_TOKEN) {
    customStates = (await readJsonFile<StateEntry[]>(CUSTOM_STATES_PATH)) ?? [];
    removedIds   = (await readJsonFile<string[]>(REMOVED_STATES_PATH)) ?? [];
    overrides    = (await readJsonFile<Record<string, { tagline?: string }>>(STATE_OVERRIDES_PATH)) ?? {};
  } else {
    customStates = await readLocal<StateEntry>(LOCAL_CUSTOM);
    removedIds   = await readLocal<string>(LOCAL_REMOVED);
    overrides    = await readLocalObj<Record<string, { tagline?: string }>>(LOCAL_OVERRIDES);
  }

  const baseIds    = new Set(baseStates.map((s) => s.id));
  const activeBase = baseStates.filter((s) => !removedIds.includes(s.id));
  const newCustom  = customStates.filter((s) => !baseIds.has(s.id));
  const all        = [...activeBase, ...newCustom];

  // Apply tagline overrides
  return all.map((s) => {
    const ov = overrides[s.id];
    return ov?.tagline ? { ...s, tagline: ov.tagline } : s;
  });
}

export async function getActiveStateIds(): Promise<string[]> {
  const all = await getAllStates();
  return all.map((s) => s.id);
}
