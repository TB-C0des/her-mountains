import { treks as baseTreks } from "../data/treks";
import { loadCustomTreks } from "./custom-treks";
import { readJsonFile } from "./github";

export type TrekEntry = {
  id: string;
  name: string;
  state: string;
  yourLines: string[];
  prompts: string[];
};

type CustomTrek = TrekEntry & { stateId: string };

const CUSTOM_TREKS_PATH = "her-mountains/data/custom-treks.json";

/**
 * Returns all treks — base treks merged with custom treks.
 * On Vercel (GITHUB_TOKEN set): reads custom-treks.json from GitHub API.
 * Locally: reads from disk.
 */
export async function getAllTreks(): Promise<TrekEntry[]> {
  let custom: CustomTrek[] = [];
  if (process.env.GITHUB_TOKEN) {
    custom = (await readJsonFile<CustomTrek[]>(CUSTOM_TREKS_PATH)) ?? [];
  } else {
    custom = loadCustomTreks() as CustomTrek[];
  }
  return [...baseTreks, ...custom];
}
