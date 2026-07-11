import { treks as baseTreks } from "../data/treks";
import { loadCustomTreks } from "./custom-treks";

export type TrekEntry = {
  id: string;
  name: string;
  state: string;
  yourLines: string[];
  prompts: string[];
};

/**
 * Returns all treks — base treks merged with custom treks from data/custom-treks.json.
 * Only call from server components.
 */
export function getAllTreks(): TrekEntry[] {
  const custom = loadCustomTreks();
  return [...baseTreks, ...custom];
}
