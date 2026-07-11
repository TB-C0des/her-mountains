/**
 * Thin wrapper around the GitHub Contents API.
 * Reads GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH from env.
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

function repoInfo() {
  const owner = process.env.GITHUB_OWNER;
  const repoName = process.env.GITHUB_REPO;
  if (!owner || !repoName) throw new Error("GITHUB_OWNER / GITHUB_REPO env vars are not set.");
  return { owner, repo: repoName };
}

function branch() {
  return process.env.GITHUB_BRANCH ?? "main";
}

/** Get the current SHA + content of a file. Returns null if file doesn't exist. */
export async function getFileInfo(filePath: string): Promise<{ sha: string; content: string } | null> {
  const { owner, repo } = repoInfo();
  const res = await fetch(
    `${BASE}/repos/${owner}/${repo}/contents/${filePath}?ref=${branch()}`,
    { headers: headers(), cache: "no-store" }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${filePath} failed: ${res.status}`);
  const data = await res.json();
  return { sha: data.sha as string, content: data.content as string };
}

/** Get just the SHA of a file. Returns null if it doesn't exist. */
export async function getFileSha(filePath: string): Promise<string | null> {
  const info = await getFileInfo(filePath);
  return info?.sha ?? null;
}

/** Commit a file to the repo. content must be a base64 string. */
export async function commitFile(
  filePath: string,
  contentBase64: string,
  message: string
): Promise<void> {
  const { owner, repo } = repoInfo();
  const sha = await getFileSha(filePath);

  const body: Record<string, unknown> = {
    message,
    content: contentBase64,
    branch: branch(),
  };
  if (sha) body.sha = sha;

  const res = await fetch(`${BASE}/repos/${owner}/${repo}/contents/${filePath}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub commit failed (${res.status}): ${err}`);
  }
}

/** Delete a file from the repo. */
export async function deleteFile(
  filePath: string,
  message: string
): Promise<{ ok: boolean; error?: string }> {
  const { owner, repo } = repoInfo();
  const sha = await getFileSha(filePath);
  if (!sha) return { ok: false, error: "File not found." };

  const res = await fetch(`${BASE}/repos/${owner}/${repo}/contents/${filePath}`, {
    method: "DELETE",
    headers: headers(),
    body: JSON.stringify({ message, sha, branch: branch() }),
  });

  if (!res.ok) {
    const err = await res.text();
    return { ok: false, error: `GitHub delete failed (${res.status}): ${err}` };
  }
  return { ok: true };
}

/** Read a JSON file from the repo. Returns null if it doesn't exist. */
export async function readJsonFile<T>(filePath: string): Promise<T | null> {
  const info = await getFileInfo(filePath);
  if (!info) return null;
  // GitHub returns content with newlines — strip them before decoding
  const cleaned = info.content.replace(/\n/g, "");
  const text = Buffer.from(cleaned, "base64").toString("utf-8");
  return JSON.parse(text) as T;
}
