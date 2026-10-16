import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fitZoom,
  parseZoom,
  nextZoom,
  pageNumber,
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
