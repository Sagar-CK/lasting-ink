import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PDFDocument,
  PDFName,
  PDFArray,
} from "../extension/vendor/pdf-lib.mjs";
import { exportPdf } from "../extension/pdf-export.js";
import { parsePageRange } from "../extension/viewer-state.js";
import {
  cleanUrl,
  documentId,
  migrateDocument,
  exportBackup,
  importBackup,
  validateBackup,
} from "../extension/records.js";
import { mergeRecords, syncNow } from "../extension/sync.js";
const storage = (data = {}) => ({
  data,
  async get(keys) {
    if (keys === null) return structuredClone(data);
    return Object.fromEntries(
      (Array.isArray(keys) ? keys : [keys]).map((k) => [
        k,
        structuredClone(data[k]),
      ]),
    );
  },
  async set(value) {
    Object.assign(data, structuredClone(value));
  },
});
test("document fingerprints share state across URLs while fragments do not change identity", () => {
  assert.equal(cleanUrl("https://test/doc.pdf#page=8"), "https://test/doc.pdf");
  assert.equal(
    documentId("abc", "https://a/doc.pdf"),
    documentId("abc", "https://b/other.pdf"),
  );
  assert.notEqual(
    documentId("abc", "https://a/doc.pdf"),
    documentId("def", "https://a/doc.pdf"),
  );
});
test("old annotations and reading positions migrate without overwriting newer data", async () => {
  const item = {
    id: "old",
    type: "note",
    url: "https://test/doc.pdf",
    text: "hello",
    point: [0.1, 0.2],
    anchor: { kind: "page", surface: "1" },
    color: "#333333",
  };
  const s = storage({
    "lasting-ink:v1:https://test/doc.pdf|old": item,
    "lasting-ink:view:v1:https://test/doc.pdf": { page: 3, zoom: 1.2 },
  });
  await migrateDocument(s, "https://test/doc.pdf#page=2", "pdf:abc");
  assert.equal(s.data["lasting-ink:v1:pdf:abc|old"].text, "hello");
  assert.equal(s.data["lasting-ink:view:v1:pdf:abc"].page, 3);
  s.data["lasting-ink:v1:pdf:abc|old"].text = "new";
  await migrateDocument(s, "https://test/doc.pdf", "pdf:abc");
  assert.equal(s.data["lasting-ink:v1:pdf:abc|old"].text, "new");
});
test("backup roundtrip preserves annotations and rejects malformed content", async () => {
  const key = "lasting-ink:v1:pdf:abc|one",
    item = {
      id: "one",
      documentId: "pdf:abc",
      url: "https://test/doc.pdf",
      type: "note",
      color: "#333333",
      point: [0.2, 0.3],
      anchor: { kind: "page", surface: "1" },
      text: "<script>plain text</script>",
      updated: 8,
    };
  const source = storage({ [key]: item }),
    target = storage();
  await importBackup(target, await exportBackup(source));
  assert.deepEqual(target.data[key], item);
  assert.throws(() =>
    validateBackup({
      app: "Lasting Ink",
      annotations: [{ ...item, color: "javascript:bad" }],
    }),
  );
  assert.throws(() =>
    validateBackup({
      app: "Lasting Ink",
      annotations: [{ ...item, point: [Infinity, 3] }],
    }),
  );
});
test("sync resolves conflicts and newer deletion timestamps", () => {
  const key = "lasting-ink:v1:pdf:abc|one",
    deleted = "lasting-ink:deleted:" + encodeURIComponent(key);
  assert.equal(
    mergeRecords({ [key]: { updated: 5 } }, { [key]: { updated: 9 } })[key]
      .updated,
    9,
  );
  assert.equal(
    mergeRecords({ [key]: { updated: 5 } }, { [deleted]: 8 })[key],
    undefined,
  );
  assert.equal(
    mergeRecords({ [key]: { updated: 12 } }, { [deleted]: 8 })[key].updated,
    12,
  );
});
test("sync uploads and restores on a second device without echoing unchanged data", async () => {
  const key = "lasting-ink:v1:pdf:abc|one";
  let local = storage({
    "lasting-ink:settings": { sync: true },
    [key]: { id: "one", updated: 1 },
  });
  const remote = storage();
  let writes = 0;
  const write = remote.set;
  remote.set = async (v) => {
    writes++;
    await write.call(remote, v);
  };
  remote.remove = async (keys) => {
    for (const k of keys) delete remote.data[k];
  };
  const previous = globalThis.chrome;
  globalThis.chrome = { storage: { local, sync: remote } };
  try {
    await syncNow();
    assert.ok(remote.data.lastingInkManifest);
    const count = writes;
    await syncNow();
    assert.equal(writes, count);
    local = storage({ "lasting-ink:settings": { sync: true } });
    globalThis.chrome.storage.local = local;
    await syncNow();
    assert.equal(local.data[key].id, "one");
    assert.equal(writes, count);
  } finally {
    globalThis.chrome = previous;
  }
});
test("OCR ranges validate and deduplicate page numbers", () => {
  assert.deepEqual(parsePageRange("1-3,2,5", 5), [1, 2, 3, 5]);
  assert.deepEqual(parsePageRange("all", 3), [1, 2, 3]);
  for (const v of ["0", "4", "3-1", "hello"])
    assert.throws(() => parsePageRange(v, 3));
});
test("PDF export retains forms and creates Unicode notes and vector marks", async () => {
  const src = await PDFDocument.create();
  src.addPage([600, 800]);
  const field = src.getForm().createTextField("name");
  field.setText("Saved value");
  field.addToPage(src.getPage(0), { x: 40, y: 40, width: 140, height: 24 });
  const annotations = [
    {
      type: "pen",
      points: [
        [0.1, 0.2],
        [0.5, 0.6],
      ],
      width: 3,
      color: "#ff0000",
      anchor: { surface: "1" },
    },
    {
      type: "highlight",
      surface: "1",
      color: "#ffff00",
      quads: [
        [
          [0.1, 0.1],
          [0.5, 0.1],
          [0.5, 0.15],
          [0.1, 0.15],
        ],
      ],
    },
    {
      type: "note",
      text: "café 中文",
      point: [0.3, 0.4],
      color: "#222222",
      anchor: { surface: "1" },
    },
  ];
  const out = await exportPdf({
    bytes: await src.save(),
    annotations,
    pageInfos: [{ toPdf: (p) => [p[0] * 600, (1 - p[1]) * 800] }],
  });
  const d = await PDFDocument.load(out.bytes);
  assert.equal(d.getForm().getTextField("name").getText(), "Saved value");
  const a = d.getPage(0).node.lookup(PDFName.of("Annots"), PDFArray);
  assert.equal(a.size(), 2);
  assert.equal(
    d.context.lookup(a.get(1)).lookup(PDFName.of("Contents")).decodeText(),
    "café 中文",
  );
  assert.equal(out.flattened, false);
});
