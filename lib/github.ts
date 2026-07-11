/**
 * Thin wrapper around the GitHub Contents API.
 * Reads GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO from env.
 * All functions are server-only (Node.js fetch).
 */

const BASE = "https://api.github.com";

function headers() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN env var is not set.");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

function repo() {
  const owner = process.env.GITHUB_OWNER;
  const repo  = process.env.GITHUB_REPO;
  if (!owner || !repo) throw new Error("GITHUB_OWNER / GITHUB_REPO env vars are not set.");
  return { owner, repo };
}

/** Get the current SHA of a file (needed to update it). Returns null if file doesn't exist. */
export async function getFileSha(path: string): Promise<string | null> {
  const { owner, repo: r } = repo();
  const res = await fetch(`${BASE}/repos/${owner}/${r}/contents/${path}`, {
    headers: headers(),
    // bypass Next.js cache so we always get the latest SHA
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${path} failed: ${res.status}`);
  const data = await res.json();
  return data.sha as string;
}

/** Commit a file to the repo. content is a base64 string. */
export async function commitFile(
  filePath: string,
  contentBase64: string,
  message: string
): Promise<void> {
  const { owner, repo: r } = repo();
  const sha = await getFileSha(filePath);

  const body: Record<string, unknown> = {
    message,
    content: contentBase64,
    branch: process.env.GITHUB_BRANCH ?? "main",
  };
  if (sha) body.sha = sha; // required when updating an existing file

  const res = await fetch(`${BASE}/repos/${owner}/${r}/contents/${filePath}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub commit failed (${res.status}): ${err}`);
  }
}

/** Read a JSON file from the repo. Returns null if it doesn't exist. */
export async function readJsonFile<T>(filePath: string): Promise<T | null> {
  const { owner, repo: r } = repo();
  const res = await fetch(`${BASE}/repos/${owner}/${r}/contents/${filePath}`, {
    headers: headers(),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${path} failed: ${res.status}`);
  const data = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return JSON.parse(content) as T;
}
