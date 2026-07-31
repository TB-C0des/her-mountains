import fs from "fs";
import path from "path";
import { readJsonFile } from "./github";

const PHOTOS_DIR = path.join(process.cwd(), "public", "photos");
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const COVER_OVERRIDES_PATH = "her-mountains/data/cover-overrides.json";
const LOCAL_COVER_OVERRIDES = path.join(process.cwd(), "data", "cover-overrides.json");

const useGitHub = () => !!process.env.GITHUB_TOKEN;

// ─── cover overrides (always fresh — read via GitHub API, not CDN) ───────────

async function getCoverOverrides(): Promise<Record<string, string>> {
  if (useGitHub()) {
    return (await readJsonFile<Record<string, string>>(COVER_OVERRIDES_PATH)) ?? {};
  }
  if (!fs.existsSync(LOCAL_COVER_OVERRIDES)) return {};
  return JSON.parse(fs.readFileSync(LOCAL_COVER_OVERRIDES, "utf-8"));
}

// ─── GitHub directory listing ─────────────────────────────────────────────────

function rawUrl(ghPath: string, bust?: number): string {
  const owner  = process.env.GITHUB_OWNER!;
  const repo   = process.env.GITHUB_REPO!;
  const branch = process.env.GITHUB_BRANCH ?? "main";
  // Use jsDelivr — properly purges cache on new commits, unlike raw.githubusercontent.com
  const t = bust ?? Date.now();
  return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${ghPath}?t=${t}`;
}

async function listGitHubDir(ghPath: string): Promise<string[]> {
  const token  = process.env.GITHUB_TOKEN!;
  const owner  = process.env.GITHUB_OWNER!;
  const repo   = process.env.GITHUB_REPO!;
  const branch = process.env.GITHUB_BRANCH ?? "main";

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${ghPath}?ref=${branch}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    }
  );
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return (data as Array<{ name: string; type: string }>)
    .filter((f) => f.type === "file")
    .map((f) => f.name);
}

function listLocalDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir);
}

function isImage(filename: string): boolean {
  return IMAGE_EXTS.has(path.extname(filename).toLowerCase());
}

// ─── public API ──────────────────────────────────────────────────────────────

export async function getTrekPhotos(trekId: string): Promise<string[]> {
  const ghPath = `her-mountains/public/photos/${trekId}`;
  const files = useGitHub()
    ? await listGitHubDir(ghPath)
    : listLocalDir(path.join(PHOTOS_DIR, trekId));

  return files
    .filter((f) => isImage(f) && !f.toLowerCase().startsWith("cover."))
    .sort()
    .map((f) =>
      useGitHub() ? rawUrl(`${ghPath}/${f}`) : `/photos/${trekId}/${f}`
    );
}

export async function getTrekCover(trekId: string): Promise<string | null> {
  // 1. Check cover-overrides.json first — always fresh, bypasses CDN
  const overrides = await getCoverOverrides();
  if (overrides[trekId]) return overrides[trekId];

  // 2. Fall back to directory listing
  const ghPath = `her-mountains/public/photos/${trekId}`;
  const files = useGitHub()
    ? await listGitHubDir(ghPath)
    : listLocalDir(path.join(PHOTOS_DIR, trekId));

  for (const name of ["cover.jpg", "cover.jpeg", "cover.png", "cover.webp"]) {
    if (files.includes(name)) {
      return useGitHub() ? rawUrl(`${ghPath}/${name}`) : `/photos/${trekId}/${name}`;
    }
  }

  const first = files.filter((f) => isImage(f) && !f.toLowerCase().startsWith("cover.")).sort()[0];
  if (!first) return null;
  return useGitHub() ? rawUrl(`${ghPath}/${first}`) : `/photos/${trekId}/${first}`;
}

export async function getStateBg(stateId: string): Promise<string | null> {
  // Check cover overrides first
  const overrides = await getCoverOverrides();
  const key = `states/${stateId}`;
  if (overrides[key]) return overrides[key];

  const ghPath = `her-mountains/public/photos/states/${stateId}`;
  const files = useGitHub()
    ? await listGitHubDir(ghPath)
    : listLocalDir(path.join(PHOTOS_DIR, "states", stateId));

  for (const name of ["bg.jpg", "bg.jpeg", "bg.png", "bg.webp"]) {
    if (files.includes(name)) {
      return useGitHub() ? rawUrl(`${ghPath}/${name}`) : `/photos/states/${stateId}/${name}`;
    }
  }
  return null;
}
