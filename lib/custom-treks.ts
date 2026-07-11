import fs from "fs";
import path from "path";

const CUSTOM_TREKS_FILE = path.join(process.cwd(), "data", "custom-treks.json");

export type CustomTrek = {
  id: string;
  name: string;
  state: string;
  stateId: string;
  yourLines: string[];
  prompts: string[];
};

export function loadCustomTreks(): CustomTrek[] {
  if (!fs.existsSync(CUSTOM_TREKS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(CUSTOM_TREKS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

export function saveCustomTreks(treks: CustomTrek[]): void {
  fs.writeFileSync(CUSTOM_TREKS_FILE, JSON.stringify(treks, null, 2));
}
