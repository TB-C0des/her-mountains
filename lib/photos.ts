import fs from "fs";
import path from "path";

const PHOTOS_DIR = path.join(process.cwd(), "public", "photos");
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

/**
 * Returns all gallery photos for a trek (everything except cover.jpg),
 * sorted alphabetically. Adding any image file to the folder is enough —
 * no code changes needed.
 *
 * @param trekId  e.g. "brahmatal"
 */
export function getTrekPhotos(trekId: string): string[] {
  const dir = path.join(PHOTOS_DIR, trekId);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return IMAGE_EXTS.has(ext) && f.toLowerCase() !== "cover.jpg";
    })
    .sort()
    .map((f) => `/photos/${trekId}/${f}`);
}

/**
 * Returns the cover photo path if it exists, otherwise null.
 * Falls back to the first gallery photo if no cover.jpg.
 *
 * @param trekId  e.g. "brahmatal"
 */
export function getTrekCover(trekId: string): string | null {
  const dir = path.join(PHOTOS_DIR, trekId);
  if (!fs.existsSync(dir)) return null;

  // Try cover.jpg first, then cover.jpeg, cover.png, cover.webp
  for (const name of ["cover.jpg", "cover.jpeg", "cover.png", "cover.webp"]) {
    if (fs.existsSync(path.join(dir, name))) {
      return `/photos/${trekId}/${name}`;
    }
  }

  // Fall back to first gallery photo
  const gallery = getTrekPhotos(trekId);
  return gallery[0] ?? null;
}

/**
 * Returns the state hero background if it exists, otherwise null.
 *
 * @param stateId  e.g. "maharashtra"
 */
export function getStateBg(stateId: string): string | null {
  const dir = path.join(PHOTOS_DIR, "states", stateId);
  if (!fs.existsSync(dir)) return null;

  for (const name of ["bg.jpg", "bg.jpeg", "bg.png", "bg.webp"]) {
    if (fs.existsSync(path.join(dir, name))) {
      return `/photos/states/${stateId}/${name}`;
    }
  }
  return null;
}
