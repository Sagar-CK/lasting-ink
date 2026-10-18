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
  const api = await w.startLastingInk({
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
    root.querySelector(".capture").dispatchEvent(
      new w.MouseEvent(type, {
        bubbles: true,
        clientX: x,
        clientY: y,
        button: 0,
      }),
    );
  return {
    api,
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
test("Escape and a blank PDF click clear drawing selection for page navigation", async () => {
  const p = await page({ pdf: true });
  try {
    p.click('[data-mode="box"]');
    p.pointer("pointerdown", 200, 200);
    p.pointer("pointermove", 300, 300);
    p.pointer("pointerup", 300, 300);
    const id = p.api.list()[0].id;
    p.api.select(id);
    p.w.document.dispatchEvent(
      new p.w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    assert.equal(p.api.selected(), null);
    p.api.select(id);
    p.w.document
      .querySelector("main")
      .dispatchEvent(new p.w.MouseEvent("pointerdown", { bubbles: true }));
    assert.equal(p.api.selected(), null);
    assert.equal(p.api.list().length, 1);
  } finally {
    p.close();
  }
});
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

test("Cmd/Ctrl undo and redo work on webpages and PDFs without taking text-editor shortcuts", async () => {
  for (const pdf of [false, true]) {
    const p = await page({ pdf });
    try {
      if (!pdf) p.click(".launcher");
      const key = (target, options) => {
        const event = new p.w.KeyboardEvent("keydown", {
          bubbles: true,
          composed: true,
          cancelable: true,
          ...options,
        });
        target.dispatchEvent(event);
        return event.defaultPrevented;
      };
      assert.equal(key(p.w.document, { key: "z", metaKey: true }), false);
      p.click('[data-mode="pen"]');
      p.pointer("pointerdown", 180, 200);
      p.pointer("pointermove", 300, 300);
      p.pointer("pointerup", 300, 300);
      await tick();
      assert.equal(key(p.w.document, { key: "z", metaKey: true }), true);
      await tick();
      assert.equal(Object.keys(p.store).length, 0);
      assert.equal(
        key(p.w.document, { key: "Z", metaKey: true, shiftKey: true }),
        true,
      );
      await tick();
      assert.equal(Object.keys(p.store).length, 1);
      assert.equal(key(p.w.document, { key: "z", ctrlKey: true }), true);
      await tick();
      assert.equal(key(p.w.document, { key: "y", ctrlKey: true }), true);
      await tick();
      assert.equal(Object.keys(p.store).length, 1);
      const input = p.w.document.createElement("input");
      p.w.document.body.append(input);
      assert.equal(key(input, { key: "z", metaKey: true }), false);
      const editable = p.w.document.createElement("div");
      editable.setAttribute("contenteditable", "plaintext-only");
      p.w.document.body.append(editable);
      assert.equal(key(editable, { key: "z", ctrlKey: true }), false);
      p.click('[data-mode="note"]');
      p.pointer("pointerdown", 450, 250);
      await tick();
      assert.equal(
        key(p.root.querySelector("textarea"), { key: "z", metaKey: true }),
        false,
      );
      assert.equal(Object.keys(p.store).length, 2);
      p.click('[data-action="hide"]');
      assert.equal(key(p.w.document, { key: "z", metaKey: true }), false);
      assert.equal(Object.keys(p.store).length, 2);
    } finally {
      p.close();
    }
  }
});

test("PDF drawings support recolor, keyboard move/resize, deletion, and undo", async () => {
  const p = await page({ pdf: true });
  try {
    p.click('[data-mode="pen"]');
    p.pointer("pointerdown", 200, 200);
    p.pointer("pointermove", 300, 300);
    p.pointer("pointerup", 300, 300);
    await tick();
    const item = p.api.list()[0];
    p.api.select(item.id);
    p.api.update(item.id, { color: "#ff0000", width: 8 });
    await p.api.flush();
    assert.equal(p.api.list()[0].color, "#ff0000");
    assert.equal(p.api.list()[0].pdfWidth, 6);
    p.w.document.dispatchEvent(
      new p.w.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    await tick();
    assert.ok(p.api.list()[0].points[0][0] > item.points[0][0]);
    p.w.document.dispatchEvent(
      new p.w.KeyboardEvent("keydown", {
        key: "ArrowDown",
        altKey: true,
        bubbles: true,
      }),
    );
    await tick();
    p.api.remove(item.id);
    await tick();
    assert.equal(p.api.list().length, 0);
    p.click('[data-action="undo"]');
    await tick();
    assert.equal(p.api.list().length, 1);
  } finally {
    p.close();
  }
});
