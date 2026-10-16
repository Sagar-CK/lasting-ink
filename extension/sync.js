import {
  ANNOTATION_PREFIX,
  VIEW_PREFIX,
  BOOKMARK_PREFIX,
  SETTINGS_KEY,
} from "./records.js";
const TOMBSTONE = "lasting-ink:deleted:";
const MANIFEST = "lastingInkManifest";
const STATUS = "lasting-ink:sync-status";
let timer,
  merging = false,
  running = false;
const relevant = (key) =>
  key.startsWith(ANNOTATION_PREFIX) ||
  key.startsWith(VIEW_PREFIX) ||
  key.startsWith(BOOKMARK_PREFIX) ||
  key.startsWith(TOMBSTONE);

export function mergeRecords(local, remote) {
  const result = { ...local };
  for (const [key, value] of Object.entries(remote)) {
    if (!relevant(key)) continue;
    if (key.startsWith(BOOKMARK_PREFIX) && Array.isArray(value)) {
      const marks = new Map(
        (result[key] || []).map((item) => [item.page, item]),
      );
      for (const item of value)
        if (
          !marks.has(item.page) ||
          (item.updated || 0) > (marks.get(item.page).updated || 0)
        )
          marks.set(item.page, item);
      result[key] = [...marks.values()].sort((a, b) => a.page - b.page);
      continue;
    }
    const stamp = (v) =>
      typeof v === "number" ? v : v?.updated || v?.created || 0;
    if (!(key in result) || stamp(value) > stamp(result[key]))
      result[key] = value;
  }
  for (const [key, time] of Object.entries(result)) {
    if (!key.startsWith(TOMBSTONE)) continue;
    const target = decodeURIComponent(key.slice(TOMBSTONE.length));
    if (
      result[target] &&
      time >= (result[target].updated || result[target].created || 0)
    )
      delete result[target];
  }
  return result;
}
async function encode(value) {
  const stream = new Blob([JSON.stringify(value)])
    .stream()
    .pipeThrough(new CompressionStream("gzip"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  let result = "";
  for (let i = 0; i < bytes.length; i += 8192)
    result += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(result);
}
async function decode(value) {
  const bytes = Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  return JSON.parse(await new Response(stream).text());
}
async function readRemote() {
  const remote = await chrome.storage.sync.get(null);
  const manifest = remote[MANIFEST];
  if (!manifest) return {};
  const encoded = Array.from(
    { length: manifest.count },
    (_, i) => remote[manifest.id + i],
  );
  if (encoded.some((part) => typeof part !== "string"))
    throw new Error("Sync is still downloading. Try again shortly.");
  const records = await decode(encoded.join(""));
  if (!records || typeof records !== "object")
    throw new Error("Invalid sync data.");
  return records;
}
export async function syncNow() {
  if (running) return;
  running = true;
  try {
    const all = await chrome.storage.local.get(null);
    if (!all[SETTINGS_KEY]?.sync) return;
    const local = Object.fromEntries(
      Object.entries(all).filter(([key]) => relevant(key)),
    );
    const remote = await readRemote();
    const merged = mergeRecords(local, remote);
    merging = true;
    const remove = Object.keys(local).filter((key) => !(key in merged));
    if (remove.length) await chrome.storage.local.remove(remove);
    const updates = Object.fromEntries(
      Object.entries(merged).filter(
        ([key, val]) => JSON.stringify(val) !== JSON.stringify(local[key]),
      ),
    );
    if (Object.keys(updates).length) await chrome.storage.local.set(updates);
    merging = false;
    const ordered = (value) =>
      Object.fromEntries(
        Object.entries(value).sort(([a], [b]) => a.localeCompare(b)),
      );
    if (JSON.stringify(ordered(merged)) === JSON.stringify(ordered(remote))) {
      await chrome.storage.local.set({
        [STATUS]: {
          updated: Date.now(),
          message: "Saved to browser sync storage.",
        },
      });
      return;
    }
    const encoded = await encode(ordered(merged));
    if (encoded.length > 80000)
      throw new Error(
        "Browser sync is full. Export a backup to transfer this larger library.",
      );
    const id = "ink_" + Date.now().toString(36) + "_";
    const chunks = {};
    for (let i = 0; i < encoded.length; i += 7000)
      chunks[id + i / 7000] = encoded.slice(i, i + 7000);
    const old = await chrome.storage.sync.get(null);
    // Free previous chunks first to stay within the browser's 100 KB quota.
    // A missing chunk is detected on readers; the manifest is committed last.
    const obsolete = Object.keys(old).filter((key) => key.startsWith("ink_"));
    if (obsolete.length) await chrome.storage.sync.remove(obsolete);
    await chrome.storage.sync.set(chunks);
    await chrome.storage.sync.set({
      [MANIFEST]: { id, count: Object.keys(chunks).length },
    });
    await chrome.storage.local.set({
      [STATUS]: {
        updated: Date.now(),
        message: "Saved to browser sync storage.",
      },
    });
  } catch (error) {
    merging = false;
    await chrome.storage.local.set({
      [STATUS]: { error: true, message: error.message },
    });
  } finally {
    running = false;
  }
}
export function startSync() {
  chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area === "sync" && changes[MANIFEST] && !running) {
      clearTimeout(timer);
      timer = setTimeout(syncNow, 1000);
      return;
    }
    if (area !== "local" || merging) return;
    const deleted = {};
    for (const [key, change] of Object.entries(changes)) {
      if (key.startsWith(ANNOTATION_PREFIX) && change.newValue === undefined)
        deleted[TOMBSTONE + encodeURIComponent(key)] = Date.now();
    }
    if (Object.keys(deleted).length) await chrome.storage.local.set(deleted);
    if (
      Object.keys(changes).some((key) => relevant(key) || key === SETTINGS_KEY)
    ) {
      clearTimeout(timer);
      timer = setTimeout(syncNow, 5000);
    }
  });
  chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (message.type === "sync-now") {
      syncNow().then(() => respond({ ok: true }));
      return true;
    }
  });
  syncNow();
}
