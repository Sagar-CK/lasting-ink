import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";
const code = fs.readFileSync(
  new URL("../extension/annotator.js", import.meta.url),
  "utf8",
);
const tick = () => new Promise((r) => setTimeout(r, 35));
async function page({
  url = "https://example.test/reading",
  pdf = false,
  store = {},
} = {}) {
  const dom = new JSDOM(
    '<body><main><p id="text">Read this important sentence carefully.</p></main></body>',
    { url, runScripts: "outside-only", pretendToBeVisual: true },
  );
  const w = dom.window,
    listeners = [];
  w.structuredClone = structuredClone;
  w.ResizeObserver = class {
    observe() {}
  };
  w.CSS = { escape: (s) => s };
  w.Element.prototype.setPointerCapture = () => {};
  Object.defineProperty(w.document.documentElement, "clientWidth", {
    value: 1000,
  });
  let top = 100,
    scale = 1;
  const rect = () => ({
    left: 100,
    top,
    width: 800 * scale,
    height: 1000 * scale,
    right: 100 + 800 * scale,
    bottom: top + 1000 * scale,
  });
  w.document.body.getBoundingClientRect = rect;
  w.document.querySelector("main").getBoundingClientRect = rect;
  w.document.querySelector("p").getBoundingClientRect = () => ({
    ...rect(),
    height: 50,
    bottom: top + 50,
  });
  w.document.elementFromPoint = () => w.document.querySelector("p");
  let lastSelected = "";
  w.Range.prototype.getClientRects = function () {
    lastSelected = this.toString();
    return [{ x: 100, y: top, width: 120, height: 20 }];
  };
  w.chrome = {
    runtime: {
      getURL: (p) => "chrome-extension://test/" + p,
      onMessage: { addListener() {} },
    },
    storage: {
      onChanged: { addListener: (f) => listeners.push(f) },
      local: {
        async get() {
          return structuredClone(store);
        },
        async set(values) {
          const changes = {};
          for (const [k, v] of Object.entries(values)) {
            changes[k] = { newValue: structuredClone(v) };
            store[k] = structuredClone(v);
          }
          for (const f of listeners) f(changes, "local");
        },
        async remove(key) {
          delete store[key];
          for (const f of listeners) f({ [key]: {} }, "local");
        },
      },
    },
  };
  w.eval(code);
  await w.startLastingInk({
    url,
    pdf,
    surfaces: () => [
      {
        id: pdf ? "1" : "web",
        element: pdf ? w.document.querySelector("main") : w.document.body,
      },
    ],
  });
  await tick();
  const root = w.document.querySelector("[data-lasting-ink]").shadowRoot;
  const click = (s) => root.querySelector(s).click();
  const pointer = (type, x, y) =>
    root
      .querySelector(".capture")
      .dispatchEvent(
        new w.MouseEvent(type, {
          bubbles: true,
          clientX: x,
          clientY: y,
          button: 0,
        }),
      );
  return {
    w,
    dom,
    root,
    store,
    click,
    pointer,
    selected: () => lastSelected,
    layout(y, z = 1) {
      top = y;
      scale = z;
      w.dispatchEvent(new w.Event("resize"));
    },
    close() {
      w.close();
    },
  };
}
test("PDF ink and editable notes survive closing and reopening with normalized page coordinates", async () => {
  const store = {};
  let p = await page({
    pdf: true,
    store,
    url: "https://example.test/paper.pdf#page=1",
  });
  p.click('[data-mode="pen"]');
  p.pointer("pointerdown", 180, 200);
  p.pointer("pointermove", 300, 300);
  p.pointer("pointerup", 300, 300);
  p.click('[data-mode="note"]');
  p.pointer("pointerdown", 450, 250);
  await tick();
  const input = p.root.querySelector("textarea");
  input.value = "Remember this";
  input.dispatchEvent(new p.w.Event("input", { bubbles: true }));
  await tick();
  assert.equal(Object.keys(store).length, 2);
  assert.match(
    p.root.querySelector(".overlay path").getAttribute("d"),
    /180,200/,
  );
  p.close();
  p = await page({
    pdf: true,
    store,
    url: "https://example.test/paper.pdf#page=4",
  });
  assert.equal(p.root.querySelector("textarea").value, "Remember this");
  assert.equal(p.root.querySelectorAll(".overlay path").length, 1);
  p.layout(50, 0.5);
  await tick();
  assert.match(
    p.root.querySelector(".overlay path").getAttribute("d"),
    /140,100/,
  );
  assert.equal(p.root.querySelector(".note").style.top, "125px");
  p.close();
});
test("text highlights re-anchor after inserted content, including element selection boundaries", async () => {
  const store = {};
  let p = await page({ store });
  p.click('[data-mode="highlight"]');
  const n = p.w.document.querySelector("p").firstChild,
    r = p.w.document.createRange();
  r.setStart(n, 10);
  r.setEnd(n, 28);
  p.w.getSelection().addRange(r);
  p.w.document.dispatchEvent(
    new p.w.MouseEvent("pointerup", { bubbles: true }),
  );
  await tick();
  assert.equal(Object.values(store)[0].quote, "important sentence");
  assert.equal(p.selected(), "important sentence");
  p.w.document
    .querySelector("main")
    .prepend(
      p.w.document.createTextNode("New content before the existing text. "),
    );
  await tick();
  assert.equal(p.selected(), "important sentence");
  p.close();
  p = await page({ store });
  assert.equal(p.root.querySelectorAll(".overlay rect").length, 1);
  p.close();
});
test("notes preserve edited text through undo/redo; controls have no save count", async () => {
  const p = await page();
  p.click('[data-mode="note"]');
  p.pointer("pointerdown", 450, 250);
  await tick();
  const input = p.root.querySelector("textarea");
  input.value = "Edited note";
  input.dispatchEvent(new p.w.Event("input", { bubbles: true }));
  await tick();
  p.click('[data-action="undo"]');
  await tick();
  assert.equal(p.root.querySelectorAll(".note").length, 0);
  p.click('[data-action="redo"]');
  await tick();
  assert.equal(p.root.querySelector("textarea").value, "Edited note");
  assert.equal(p.root.querySelector(".toolbar").textContent.trim(), "");
  assert.equal(p.root.querySelector(".status").textContent, "");
  p.click('[data-action="color"]');
  assert.equal(
    p.root.querySelector(".color-popover").classList.contains("hidden"),
    false,
  );
  p.click('[data-color="#d35e65"]');
  assert.equal(
    p.root.querySelector(".color-dot").style.getPropertyValue("--ink"),
    "#d35e65",
  );
  p.close();
});
test("annotations stay isolated across URLs and hash-based app routes", async () => {
  const store = {};
  let p = await page({ store, url: "https://example.test/app#/one" });
  p.click('[data-mode="pen"]');
  p.pointer("pointerdown", 150, 200);
  p.pointer("pointermove", 200, 230);
  p.pointer("pointerup", 200, 230);
  await tick();
  p.close();
  p = await page({ store, url: "https://example.test/app#/two" });
  assert.equal(p.root.querySelectorAll(".overlay path").length, 0);
  p.close();
  p = await page({ store, url: "https://example.test/app#/one" });
  assert.equal(p.root.querySelectorAll(".overlay path").length, 1);
  p.close();
});
