import { treks as baseTreks } from "../data/treks";
import { loadCustomTreks } from "./custom-treks";
import { readJsonFile } from "./github";
import fs from "fs";
import path from "path";

export type TrekEntry = {
  id: string;
  name: string;
  state: string;
  yourLines: string[];
  prompts: string[];
};

type CustomTrek = TrekEntry & { stateId: string };
type Overrides = Record<string, { yourLines?: string[]; prompts?: string[] }>;

const CUSTOM_TREKS_PATH  = "her-mountains/data/custom-treks.json";
const OVERRIDES_PATH     = "her-mountains/data/trek-overrides.json";
const LOCAL_OVERRIDES    = path.join(process.cwd(), "data", "trek-overrides.json");

export async function getAllTreks(): Promise<TrekEntry[]> {
  let custom: CustomTrek[] = [];
  let overrides: Overrides = {};

  if (process.env.GITHUB_TOKEN) {
    custom    = (await readJsonFile<CustomTrek[]>(CUSTOM_TREKS_PATH)) ?? [];
    overrides = (await readJsonFile<Overrides>(OVERRIDES_PATH)) ?? {};
  } else {
    custom    = loadCustomTreks() as CustomTrek[];
    if (fs.existsSync(LOCAL_OVERRIDES)) {
      overrides = JSON.parse(fs.readFileSync(LOCAL_OVERRIDES, "utf-8"));
    }
  }

  const all: TrekEntry[] = [...baseTreks, ...custom];

  // Apply overrides to yourLines/prompts
  return all.map((t) => {
    const ov = overrides[t.id];
    if (!ov) return t;
    return {
      ...t,
      yourLines: ov.yourLines ?? t.yourLines,
      prompts:   ov.prompts   ?? t.prompts,
    };
  });
}
