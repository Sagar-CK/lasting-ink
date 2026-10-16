export const ANNOTATION_PREFIX = "lasting-ink:v1:";
export const VIEW_PREFIX = "lasting-ink:view:v1:";
export const BOOKMARK_PREFIX = "lasting-ink:bookmarks:";
export const SETTINGS_KEY = "lasting-ink:settings";

export function cleanUrl(url) {
  const value = new URL(url);
  value.hash = "";
  return value.href;
}

export function documentId(fingerprint, url) {
  return fingerprint ? "pdf:" + fingerprint : cleanUrl(url);
}

export async function migrateDocument(storage, url, id) {
  const legacy = ANNOTATION_PREFIX + cleanUrl(url) + "|";
  const next = ANNOTATION_PREFIX + id + "|";
  const all = await storage.get(null);
  const migrated = {};
  for (const [key, value] of Object.entries(all)) {
    if (key.startsWith(legacy) && !all[next + value.id]) {
      migrated[next + value.id] = { ...value, documentId: id };
    }
  }
  const oldView = all[VIEW_PREFIX + cleanUrl(url)];
  if (oldView && !all[VIEW_PREFIX + id]) migrated[VIEW_PREFIX + id] = oldView;
  if (Object.keys(migrated).length) await storage.set(migrated);
}

export function validateBackup(value) {
  if (
    !value ||
    value.app !== "Lasting Ink" ||
    !Array.isArray(value.annotations)
  )
    throw new Error("Choose a Lasting Ink backup file.");
  if (value.annotations.length > 50000)
    throw new Error("This backup is too large.");
  const annotations = value.annotations.map((item) => {
    if (
      !item ||
      typeof item.id !== "string" ||
      !/^[\w-]{1,100}$/.test(item.id) ||
      !["pen", "marker", "box", "arrow", "note", "highlight"].includes(
        item.type,
      ) ||
      typeof item.url !== "string" ||
      item.url.length > 10000 ||
      !/^#[0-9a-f]{6}$/i.test(item.color)
    )
      throw new Error("Invalid annotation in backup.");
    if (item.documentId != null && !/^pdf:[\w-]{1,128}$/.test(item.documentId))
      throw new Error("Invalid document identity in backup.");
    const point = (p) =>
      Array.isArray(p) && p.length === 2 && p.every(Number.isFinite);
    if (
      ["pen", "marker", "box", "arrow"].includes(item.type) &&
      (!Array.isArray(item.points) ||
        item.points.length > 100000 ||
        !item.points.every(point) ||
        !Number.isFinite(item.width) ||
        item.width < 0 ||
        item.width > 100)
    )
      throw new Error("Invalid drawing in backup.");
    if (
      item.type === "note" &&
      (!point(item.point) || typeof item.text !== "string")
    )
      throw new Error("Invalid comment in backup.");
    if (
      item.type === "highlight" &&
      (typeof item.quote !== "string" || typeof item.surface !== "string")
    )
      throw new Error("Invalid highlight in backup.");
    if (
      item.type !== "highlight" &&
      (!item.anchor ||
        !["page", "element", "document"].includes(item.anchor.kind))
    )
      throw new Error("Invalid annotation anchor.");
    return structuredClone(item);
  });
  return {
    annotations,
    views: value.views || {},
    bookmarks: value.bookmarks || {},
  };
}

export async function exportBackup(storage) {
  const all = await storage.get(null);
  return {
    app: "Lasting Ink",
    version: 2,
    exported: new Date().toISOString(),
    annotations: Object.entries(all)
      .filter(([k]) => k.startsWith(ANNOTATION_PREFIX))
      .map(([, v]) => v),
    views: Object.fromEntries(
      Object.entries(all).filter(([k]) => k.startsWith(VIEW_PREFIX)),
    ),
    bookmarks: Object.fromEntries(
      Object.entries(all).filter(([k]) => k.startsWith(BOOKMARK_PREFIX)),
    ),
  };
}

export async function importBackup(storage, input) {
  const { annotations, views, bookmarks } = validateBackup(input);
  const existing = await storage.get(null);
  const values = {};
  for (const item of annotations) {
    const key =
      ANNOTATION_PREFIX + (item.documentId || item.url) + "|" + item.id;
    if (
      !existing[key] ||
      (item.updated || item.created || 0) >
        (existing[key].updated || existing[key].created || 0)
    )
      values[key] = item;
  }
  for (const [key, value] of Object.entries(views)) {
    if (
      key.startsWith(VIEW_PREFIX) &&
      !existing[key] &&
      value &&
      Number.isFinite(value.page)
    )
      values[key] = value;
  }
  for (const [key, list] of Object.entries(bookmarks)) {
    if (!key.startsWith(BOOKMARK_PREFIX) || !Array.isArray(list)) continue;
    const valid = list.filter(
      (b) =>
        b &&
        Number.isInteger(b.page) &&
        b.page > 0 &&
        typeof b.title === "string",
    );
    const merged = new Map((existing[key] || []).map((b) => [b.page, b]));
    for (const b of valid)
      if (
        !merged.has(b.page) ||
        (b.updated || 0) > (merged.get(b.page).updated || 0)
      )
        merged.set(b.page, b);
    values[key] = [...merged.values()];
  }
  if (Object.keys(values).length) await storage.set(values);
  return annotations.length;
}
