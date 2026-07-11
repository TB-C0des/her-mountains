"use server";

import { loadCustomTreks, saveCustomTreks } from "../../lib/custom-treks";
import { commitFile, readJsonFile } from "../../lib/github";

const CUSTOM_TREKS_PATH = "data/custom-treks.json";

export async function addTrek(formData: FormData): Promise<{ ok: boolean; trekId?: string; error?: string }> {
  const name     = (formData.get("name")      as string)?.trim();
  const stateId  = (formData.get("stateId")   as string)?.trim();
  const stateName= (formData.get("stateName") as string)?.trim();
  const yourLine = (formData.get("yourLine")  as string)?.trim();
  const prompt   = (formData.get("prompt")    as string)?.trim();

  if (!name || !stateId || !stateName) {
    return { ok: false, error: "Trek name and state are required." };
  }

  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const trek = {
    id,
    name,
    state: stateName,
    stateId,
    yourLines: yourLine ? [yourLine] : ["A trek worth remembering."],
    prompts:   prompt   ? [prompt]   : ["What moment stands out from this trek?"],
  };

  if (process.env.GITHUB_TOKEN) {
    // Production: read from GitHub, append, commit back
    const existing = (await readJsonFile<typeof trek[]>(CUSTOM_TREKS_PATH)) ?? [];
    if (existing.some((t) => t.id === id)) {
      return { ok: false, error: "A trek with this name already exists." };
    }
    const updated = [...existing, trek];
    const content = Buffer.from(JSON.stringify(updated, null, 2)).toString("base64");
    await commitFile(CUSTOM_TREKS_PATH, content, `Add trek: ${name}`);
  } else {
    // Local dev: write to disk
    const existing = loadCustomTreks();
    if (existing.some((t) => t.id === id)) {
      return { ok: false, error: "A trek with this name already exists." };
    }
    saveCustomTreks([...existing, trek]);
  }

  return { ok: true, trekId: id };
}
