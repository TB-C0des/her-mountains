import { states as baseStates } from "../data/states";
import { readJsonFile } from "./github";
import fs from "fs";
import path from "path";

type StateEntry = {
  id: string;
  name: string;
  tagline: string;
  trekNames: string[];
};

const STATES_PATH = "her-mountains/data/custom-states.json";
const LOCAL_PATH  = path.join(process.cwd(), "data", "custom-states.json");

export async function getAllStates(): Promise<StateEntry[]> {
  let custom: StateEntry[] = [];
  if (process.env.GITHUB_TOKEN) {
    custom = (await readJsonFile<StateEntry[]>(STATES_PATH)) ?? [];
  } else {
    if (fs.existsSync(LOCAL_PATH)) {
      custom = JSON.parse(fs.readFileSync(LOCAL_PATH, "utf-8"));
    }
  }
  // Merge — custom states not already in base
  const baseIds = new Set(baseStates.map((s) => s.id));
  const newCustom = custom.filter((s) => !baseIds.has(s.id));
  return [...baseStates, ...newCustom];
}
