import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";
import * as helpers from "../extension/viewer-controls.js";
import { viewerIcons } from "../extension/viewer-icons.js";
const html = fs.readFileSync(
  new URL("../extension/viewer.html", import.meta.url),
  "utf8",
);
const source = fs
  .readFileSync(new URL("../extension/viewer.js", import.meta.url), "utf8")
  .replace(/^import[\s\S]*?;\n/gm, "");
const waitFor = async (check) => {
  for (let i = 0; i < 100; i++) {
    if (check()) return;
    await new Promise((r) => setTimeout(r, 5));
  }
  throw new Error("Timed out waiting for PDF viewer");
};

test("viewer downloads received bytes and navigates/zooms stable annotation surfaces", async () => {
  const dom = new JSDOM(html, {
    url: "https://viewer.test/",
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  const w = dom.window,
    $ = (s) => w.document.querySelector(s),
    viewport = $("#viewport");
  const original = new TextEncoder().encode(
    "%PDF-1.5\noriginal document bytes",
  );
  let fetched = 0,
    blob,
    inkOptions,
    refreshes = 0;
  w.Blob = Blob;
  w.URL.createObjectURL = (value) => {
    blob = value;
    return "blob:retained-pdf";
  };
  w.URL.revokeObjectURL = () => {};
  w.fetch = async (url) => {
    assert.equal(url, "https://stream.test/once");
    fetched++;
    return { ok: true, arrayBuffer: async () => original.slice().buffer };
  };
  w.chrome = {
    runtime: { getURL: (p) => "https://viewer.test/" + p },
    mimeHandler: {
      getStreamInfo: async () => ({
        originalUrl: "https://example.test/reading.pdf",
        streamUrl: "https://stream.test/once",
      }),
      abortAndFallbackToNativeHandler: async () => {
        throw new Error("Unexpected fallback");
      },
    },
  };
  w.startLastingInk = async (options) => {
    inkOptions = options;
    return {
      refresh() {
        refreshes++;
      },
    };
  };
  Object.defineProperties(viewport, {
    clientWidth: { value: 1200 },
    clientHeight: { value: 800 },
  });
  viewport.scrollTop = 0;
  viewport.scrollLeft = 0;
  viewport.getBoundingClientRect = () => ({
    top: 56,
    left: 0,
    right: 1200,
    bottom: 856,
    width: 1200,
    height: 800,
  });
  w.HTMLElement.prototype.getBoundingClientRect = function () {
    if (!this.classList.contains("page"))
      return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 };
    const width = parseFloat(this.style.width) || 0,
      height = parseFloat(this.style.height) || 0;
    let top = 80 - viewport.scrollTop;
    for (const el of this.parentElement.children) {
      if (el === this) break;
      top += (parseFloat(el.style.height) || 0) + 24;
    }
    const left = Math.max(24, (1200 - width) / 2) - viewport.scrollLeft;
    return {
      top,
      left,
      right: left + width,
      bottom: top + height,
      width,
      height,
    };
  };
  w.HTMLCanvasElement.prototype.getContext = () => ({});
  const pdfjs = {
    GlobalWorkerOptions: {},
    getDocument({ data }) {
      data.fill(0); // Emulate losing ownership of the PDF.js worker input.
      return {
        promise: Promise.resolve({
          numPages: 3,
          getPage: async (n) => ({
            getViewport: ({ scale }) => ({
              width: 612 * scale,
              height: 792 * scale,
            }),
            render: () => ({ promise: Promise.resolve(), cancel() {} }),
            getTextContent: async () => ({ text: "Page " + n }),
          }),
        }),
      };
    },
    TextLayer: class {
      constructor({ container, textContentSource }) {
        this.container = container;
        this.text = textContentSource.text;
      }
      async render() {
        this.container.textContent = this.text;
      }
      cancel() {}
    },
  };
  const run = new w.Function(
    "pdfjs",
    "helpers",
    "viewerIcons",
    `const {CSS_UNITS,MIN_ZOOM,MAX_ZOOM,clampZoom,fitZoom,parseZoom,nextZoom,pageNumber,routeWheel}=helpers;\n${source}`,
  );
  try {
    run(pdfjs, helpers, viewerIcons);
    await waitFor(() => $(".textLayer")?.textContent === "Page 1");
    assert.equal(fetched, 1);
    assert.deepEqual(new Uint8Array(await blob.arrayBuffer()), original);
    assert.equal($("#download").download, "reading.pdf");
    assert.equal($("#download").getAttribute("href"), "blob:retained-pdf");
    assert.equal(inkOptions.topInset, 48);
    const surface = inkOptions.surfaces()[0].element;
    $("#fit").value = "width";
    $("#fit").dispatchEvent(new w.Event("change"));
    await waitFor(() => $("#zoom").value === "141%");
    assert.equal(Math.round(parseFloat(surface.style.width)), 1152);
    $("#fit").value = "page";
    $("#fit").dispatchEvent(new w.Event("change"));
    assert.equal($("#zoom").value, "64%");
    assert.equal(Math.round(parseFloat(surface.style.height)), 676);
    $("#zoom").value = "125%";
    $("#zoom").dispatchEvent(new w.Event("change"));
    assert.equal($("#zoom").value, "125%");
    assert.equal($("#fit").value, "custom");
    assert.equal(inkOptions.surfaces()[0].element, surface);
    $("#page-number").value = "3";
    $("#page-number").dispatchEvent(new w.Event("change"));
    assert.equal($("#next").disabled, true);
    assert.ok(viewport.scrollTop > 2000);
    $("#page-number").value = "99";
    $("#page-number").dispatchEvent(new w.Event("change"));
    assert.equal($("#page-number").value, "3");
    $("#page-number").focus();
    $("#page-number").value = "1";
    $("#page-number").dispatchEvent(
      new w.KeyboardEvent("keydown", { key: "Escape" }),
    );
    assert.equal($("#page-number").value, "3");
    $("#zoom").focus();
    $("#zoom").value = "140";
    viewport.dispatchEvent(new w.Event("scroll"));
    await new Promise((r) => setTimeout(r, 30));
    assert.equal($("#zoom").value, "140");
    $("#zoom").dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape" }));
    assert.equal($("#zoom").value, "125%");
    assert.ok(refreshes > 0);
    await waitFor(() =>
      Array.from(w.document.querySelectorAll(".textLayer")).some(
        (el) => el.textContent === "Page 3",
      ),
    );
  } finally {
    w.close();
  }
});
