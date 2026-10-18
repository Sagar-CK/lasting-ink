import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import {
  fitZoom,
  parseZoom,
  nextZoom,
  pageNumber,
  pageKeyStep,
  wheelZoom,
  routeWheel,
} from "../extension/viewer-controls.js";

test("fit modes account for PDF points, viewport padding, and page orientation", () => {
  const size = { width: 1200, height: 800 };
  assert.equal(fitZoom("width", size, { width: 612, height: 792 }), 1152 / 816);
  assert.equal(fitZoom("page", size, { width: 612, height: 792 }), 752 / 1056);
  assert.equal(fitZoom("auto", size, { width: 612, height: 792 }), 1);
  assert.equal(
    fitZoom("page", { width: 800, height: 1200 }, { width: 792, height: 612 }),
    752 / 1056,
  );
});
test("typed percentages and stepping reject invalid input and stay bounded", () => {
  assert.equal(parseZoom("125%"), 1.25);
  assert.equal(parseZoom(" 80.5 % "), 0.805);
  assert.equal(parseZoom("900%"), 5);
  assert.equal(parseZoom("0"), 0.25);
  for (const value of ["", "Infinity", "abc", "100x", "-5"])
    assert.equal(parseZoom(value), null);
  assert.equal(nextZoom(1.41, 1), 1.5);
  assert.equal(nextZoom(1.41, -1), 1.25);
  assert.equal(nextZoom(5, 1), 5);
  assert.equal(nextZoom(0.25, -1), 0.25);
});
test("page navigation only accepts whole pages in the document", () => {
  assert.equal(pageNumber("12", 12), 12);
  for (const n of ["", 0, 13, 1.5, "abc"])
    assert.equal(pageNumber(n, 12), null);
});

test("Left/Right turn pages only in reading context, preserving selections and control keys", () => {
  const dom = new JSDOM(`<body><header><button>Tools</button></header>
    <aside><button>Page thumbnail</button></aside><dialog open><button>Cancel</button></dialog>
    <div id="viewport"><p>PDF text</p><input><textarea></textarea><select><option>One</option></select>
    <div contenteditable="true"><span>Editable text</span></div><div role="textbox"></div></div>
    <div id="document-menu"><button>Rotate</button></div><div id="shadow-host"></div></body>`);
  const w = dom.window,
    d = w.document,
    turns = [];
  let state = {};
  d.addEventListener("keydown", (event) => {
    const step = pageKeyStep(event, state);
    if (step) {
      event.preventDefault();
      turns.push(step);
    }
  });
  const press = (target, key = "ArrowRight", options = {}) => {
    const event = new w.KeyboardEvent("keydown", {
      key,
      bubbles: true,
      cancelable: true,
      composed: true,
      ...options,
    });
    target.dispatchEvent(event);
    return event.defaultPrevented;
  };
  assert.equal(press(d.querySelector("p")), true);
  assert.equal(press(d.body, "ArrowLeft"), true);
  assert.deepEqual(turns, [1, -1]);
  for (const selector of [
    "input",
    "textarea",
    "select",
    "[contenteditable] span",
    '[role="textbox"]',
    "header button",
    "aside button",
    "dialog button",
    "#document-menu button",
  ])
    assert.equal(press(d.querySelector(selector)), false, selector);
  const shadow = d.querySelector("#shadow-host").attachShadow({ mode: "open" });
  shadow.innerHTML = '<textarea aria-label="Note"></textarea>';
  assert.equal(press(shadow.querySelector("textarea")), false);
  for (const modifier of [
    "shiftKey",
    "metaKey",
    "ctrlKey",
    "altKey",
    "isComposing",
  ])
    assert.equal(
      press(d.body, "ArrowRight", { [modifier]: true }),
      false,
      modifier,
    );
  for (const selection of ["annotationSelected", "textSelected"]) {
    state = { [selection]: true };
    assert.equal(press(d.body), false, selection);
  }
  state = {};
  assert.equal(press(d.body, "ArrowDown"), false);
  assert.equal(press(d.body, "PageDown"), false);
  assert.deepEqual(turns, [1, -1]);
  state = { presentation: true };
  press(d.body, "ArrowDown");
  press(d.body, "PageUp");
  assert.deepEqual(turns, [1, -1, 1, -1]);
  const consumed = new w.KeyboardEvent("keydown", {
    key: "ArrowRight",
    cancelable: true,
  });
  consumed.preventDefault();
  assert.equal(pageKeyStep(consumed), 0);
  dom.window.close();
});

test("Cmd/Ctrl wheel zoom handles mouse and trackpad deltas without ordinary scrolling", () => {
  for (const modifier of ["metaKey", "ctrlKey"]) {
    const up = { [modifier]: true, deltaY: -100, deltaMode: 0 };
    const down = { ...up, deltaY: 100 };
    assert.ok(wheelZoom(up, 1) > 1);
    assert.ok(wheelZoom(down, 1) < 1);
    assert.equal(
      wheelZoom({ ...up, deltaY: -3, deltaMode: 1 }, 1),
      wheelZoom({ ...up, deltaY: -48 }, 1),
    );
    assert.equal(wheelZoom(up, 5), 5);
    assert.equal(wheelZoom(down, 0.25), 0.25);
    assert.equal(wheelZoom({ ...up, defaultPrevented: true }, 1), null);
    assert.equal(wheelZoom({ ...up, deltaY: 0 }, 1), null);
    const viewport = {
      scrollBy() {
        assert.fail("Zoom must not scroll the PDF");
      },
    };
    routeWheel(up, viewport);
  }
  assert.equal(wheelZoom({ deltaY: -100 }, 1), null);
});

test("wheel scrolling reaches the PDF through the drawing overlay without double-scrolling", async () => {
  const { routeWheel } = await import("../extension/viewer-controls.js");
  const calls = [],
    viewport = { clientHeight: 800, scrollBy: (value) => calls.push(value) };
  const event = (path, deltaY = 120, deltaMode = 0) => ({
    deltaX: 10,
    deltaY,
    deltaMode,
    composedPath: () => path,
    preventDefault() {
      this.defaultPrevented = true;
    },
  });
  let e = event([{}]);
  routeWheel(e, viewport);
  assert.equal(e.defaultPrevented, true);
  assert.deepEqual(calls.pop(), { left: 10, top: 120, behavior: "instant" });
  e = event([viewport]);
  routeWheel(e, viewport);
  assert.equal(calls.length, 0);
  assert.equal(e.defaultPrevented, undefined);
  e = event([{}], 3, 1);
  routeWheel(e, viewport);
  assert.equal(calls.pop().top, 48);
  const note = {
    tagName: "TEXTAREA",
    scrollTop: 0,
    clientHeight: 100,
    scrollHeight: 250,
  };
  e = event([note]);
  routeWheel(e, viewport);
  assert.equal(calls.length, 0);
  note.scrollTop = 150;
  e = event([note]);
  routeWheel(e, viewport);
  assert.equal(calls.pop().top, 120);
});
