import fs from "fs";
import path from "path";

const PHOTOS_DIR = path.join(process.cwd(), "public", "photos");
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

// ─── helpers ────────────────────────────────────────────────────────────────

function rawUrl(ghPath: string): string {
  const owner  = process.env.GITHUB_OWNER!;
  const repo   = process.env.GITHUB_REPO!;
  const branch = process.env.GITHUB_BRANCH ?? "main";
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${ghPath}`;
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

const useGitHub = () => !!process.env.GITHUB_TOKEN;

// ─── public API ─────────────────────────────────────────────────────────────

export async function getTrekPhotos(trekId: string): Promise<string[]> {
  const ghPath = `her-mountains/public/photos/${trekId}`;
  const files = useGitHub()
    ? await listGitHubDir(ghPath)
    : listLocalDir(path.join(PHOTOS_DIR, trekId));

  return files
    .filter((f) => isImage(f) && f.toLowerCase() !== "cover.jpg")
    .sort()
    .map((f) =>
      useGitHub() ? rawUrl(`${ghPath}/${f}`) : `/photos/${trekId}/${f}`
    );
}

export async function getTrekCover(trekId: string): Promise<string | null> {
  const ghPath = `her-mountains/public/photos/${trekId}`;
  const files = useGitHub()
    ? await listGitHubDir(ghPath)
    : listLocalDir(path.join(PHOTOS_DIR, trekId));

  for (const name of ["cover.jpg", "cover.jpeg", "cover.png", "cover.webp"]) {
    if (files.includes(name)) {
      return useGitHub() ? rawUrl(`${ghPath}/${name}`) : `/photos/${trekId}/${name}`;
    }
  }

  const first = files.filter((f) => isImage(f) && f.toLowerCase() !== "cover.jpg").sort()[0];
  if (!first) return null;
  return useGitHub() ? rawUrl(`${ghPath}/${first}`) : `/photos/${trekId}/${first}`;
}

export async function getStateBg(stateId: string): Promise<string | null> {
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
