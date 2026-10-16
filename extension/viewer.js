import * as pdfjs from "./vendor/pdf.mjs";
import {
  CSS_UNITS,
  MIN_ZOOM,
  MAX_ZOOM,
  clampZoom,
  fitZoom,
  parseZoom,
  nextZoom,
  pageNumber,
  routeWheel,
} from "./viewer-controls.js";
import { viewerIcons } from "./viewer-icons.js";
pdfjs.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL(
  "vendor/pdf.worker.mjs",
);
const $ = (selector) => document.querySelector(selector);
for (const button of document.querySelectorAll("[data-icon]"))
  button.innerHTML = viewerIcons[button.dataset.icon];

async function openPdf() {
  if (!chrome.mimeHandler)
    throw new Error("This PDF handler requires Chromium 151 or later.");
  const stream = await chrome.mimeHandler.getStreamInfo();
  const url = stream.originalUrl;
  let name = new URL(url).pathname.split("/").pop() || "Document.pdf";
  try {
    name = decodeURIComponent(name);
  } catch {
    /* Preserve malformed URL filenames. */
  }
  if (!/\.pdf$/i.test(name)) name += ".pdf";
  document.title = name;
  $("#title").textContent = name;
  $("#title").title = name;
  const response = await fetch(stream.streamUrl);
  if (!response.ok) throw new Error("PDF stream failed: " + response.status);
  const data = new Uint8Array(await response.arrayBuffer());
  // PDF.js transfers its buffer to the worker. Retain the received document first;
  // downloading must also work for POST responses and single-use URLs.
  const downloadUrl = URL.createObjectURL(
    new Blob([data], { type: "application/pdf" }),
  );
  const download = $("#download");
  download.href = downloadUrl;
  download.download = name;
  download.removeAttribute("aria-disabled");
  window.addEventListener("pagehide", () => URL.revokeObjectURL(downloadUrl), {
    once: true,
  });
  const task = pdfjs.getDocument({
    data,
    cMapUrl: chrome.runtime.getURL("vendor/cmaps/"),
    cMapPacked: true,
    standardFontDataUrl: chrome.runtime.getURL("vendor/standard_fonts/"),
  });
  task.onPassword = () => chrome.mimeHandler.abortAndFallbackToNativeHandler();
  const pdf = await task.promise;
  const viewport = $("#viewport"),
    pages = [],
    surfaces = [];
  let zoom = 1,
    mode = "auto",
    current = 1,
    generation = 0,
    queued = false,
    rendering = false,
    activeTask = null,
    scrollFrame = 0;
  const ink = await startLastingInk({
    url,
    surfaces: () => surfaces,
    pdf: true,
    topInset: 48,
  });
  // Create stable page surfaces once. Ink anchors survive every zoom change.
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n),
      base = page.getViewport({ scale: 1 });
    const element = document.createElement("section");
    element.className = "page";
    element.setAttribute("aria-label", "Page " + n);
    const canvas = document.createElement("canvas"),
      layer = document.createElement("div");
    layer.className = "textLayer";
    element.append(canvas, layer);
    $("#pages").append(element);
    pages.push({ page, base, element, canvas, layer, renderedZoom: 0 });
    surfaces.push({ id: String(n), element });
  }
  $("#page-count").textContent = "/ " + pdf.numPages;
  for (const control of document.querySelectorAll(
    "header input, header select, header button",
  ))
    control.disabled = false;

  function syncControls(force = false) {
    if (force || document.activeElement !== $("#page-number"))
      $("#page-number").value = current;
    if (force || document.activeElement !== $("#zoom"))
      $("#zoom").value = Math.round(zoom * 100) + "%";
    $("#fit").value = mode;
    $("#previous").disabled = current === 1;
    $("#next").disabled = current === pages.length;
    $("#zoom-out").disabled = zoom <= MIN_ZOOM;
    $("#zoom-in").disabled = zoom >= MAX_ZOOM;
  }
  function visiblePage() {
    const top = viewport.getBoundingClientRect().top;
    let best = 0,
      index = current - 1;
    pages.forEach((p, i) => {
      const r = p.element.getBoundingClientRect();
      const visible = Math.max(
        0,
        Math.min(r.bottom, top + viewport.clientHeight) - Math.max(r.top, top),
      );
      if (visible > best) {
        best = visible;
        index = i;
      }
    });
    return index;
  }
  function applyZoom(next, nextMode = "custom", preserve = true) {
    const index = visiblePage(),
      selected = pages[index],
      before = selected.element.getBoundingClientRect(),
      frame = viewport.getBoundingClientRect();
    const y = before.height ? (frame.top - before.top) / before.height : 0;
    const x = before.width
      ? (frame.left + viewport.clientWidth / 2 - before.left) / before.width
      : 0.5;
    zoom = clampZoom(next);
    mode = nextMode;
    generation++;
    activeTask?.cancel();
    for (const p of pages) {
      const view = p.page.getViewport({ scale: zoom * CSS_UNITS });
      p.element.style.width = view.width + "px";
      p.element.style.height = view.height + "px";
      if (p.renderedZoom)
        p.layer.style.transform = `scale(${zoom / p.renderedZoom})`;
    }
    if (preserve) {
      const after = selected.element.getBoundingClientRect();
      viewport.scrollTop += after.top + y * after.height - frame.top;
      viewport.scrollLeft +=
        after.left + x * after.width - (frame.left + viewport.clientWidth / 2);
    }
    syncControls();
    ink.refresh();
    requestRender();
  }
  function chooseFit(value, preserve = true) {
    const target = pages[current - 1];
    const next =
      value === "actual"
        ? 1
        : fitZoom(
            value,
            { width: viewport.clientWidth, height: viewport.clientHeight },
            target.base,
          );
    applyZoom(next, value, preserve);
    if (value === "page") goTo(current);
  }
  function goTo(n) {
    current = Math.max(1, Math.min(pages.length, n));
    const rect = pages[current - 1].element.getBoundingClientRect();
    viewport.scrollTop += rect.top - viewport.getBoundingClientRect().top - 24;
    $("#page-number").value = current;
    syncControls();
    requestRender();
  }
  async function renderPage(p) {
    const revision = generation,
      targetZoom = zoom;
    const view = p.page.getViewport({ scale: targetZoom * CSS_UNITS });
    // Limit backing-store memory at high zoom, while retaining CSS page geometry.
    const ratio = Math.min(
      devicePixelRatio || 1,
      Math.sqrt(16_000_000 / (view.width * view.height)),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(view.width * ratio));
    canvas.height = Math.max(1, Math.floor(view.height * ratio));
    try {
      activeTask = p.page.render({
        canvasContext: canvas.getContext("2d"),
        viewport: view,
        transform: [ratio, 0, 0, ratio, 0, 0],
      });
      await activeTask.promise;
      if (revision !== generation) return;
      p.canvas.replaceWith(canvas);
      p.canvas = canvas;
      const layer = document.createElement("div");
      layer.className = "textLayer";
      layer.style.setProperty("--scale-factor", targetZoom * CSS_UNITS);
      layer.style.width = view.width + "px";
      layer.style.height = view.height + "px";
      activeTask = new pdfjs.TextLayer({
        textContentSource: await p.page.getTextContent(),
        container: layer,
        viewport: view,
      });
      await activeTask.render();
      if (revision !== generation) return;
      p.layer.replaceWith(layer);
      p.layer = layer;
      p.renderedZoom = targetZoom;
      ink.refresh();
    } catch (error) {
      if (
        revision === generation &&
        error.name !== "RenderingCancelledException" &&
        error.name !== "AbortException"
      ) {
        console.error("PDF page render:", error);
        $("#error").textContent =
          "A page could not be rendered. You can still download the original PDF.";
      }
    } finally {
      activeTask = null;
    }
  }
  function requestRender() {
    queued = true;
    if (!rendering) drain();
  }
  async function drain() {
    rendering = true;
    try {
      while (queued) {
        queued = false;
        const frame = viewport.getBoundingClientRect();
        const near = pages.filter((p) => {
          const r = p.element.getBoundingClientRect();
          return r.bottom > frame.top - 400 && r.top < frame.bottom + 400;
        });
        for (const p of near) {
          if (queued) break;
          if (p.renderedZoom !== zoom) await renderPage(p);
        }
        // Keep a small neighborhood of rendered pages instead of every bitmap.
        for (const p of pages) {
          const r = p.element.getBoundingClientRect();
          if (
            p.renderedZoom &&
            (r.bottom < frame.top - viewport.clientHeight * 2 ||
              r.top > frame.bottom + viewport.clientHeight * 2)
          ) {
            p.canvas.width = p.canvas.height = 1;
            p.layer.replaceChildren();
            p.renderedZoom = 0;
          }
        }
      }
    } finally {
      rendering = false;
    }
  }
  $("#previous").onclick = () => goTo(current - 1);
  $("#next").onclick = () => goTo(current + 1);
  $("#page-number").onchange = () => {
    const n = pageNumber($("#page-number").value, pages.length);
    n === null ? ($("#page-number").value = current) : goTo(n);
  };
  $("#zoom-out").onclick = () => applyZoom(nextZoom(zoom, -1));
  $("#zoom-in").onclick = () => applyZoom(nextZoom(zoom, 1));
  $("#zoom").onchange = () => {
    const value = parseZoom($("#zoom").value);
    if (value !== null) applyZoom(value);
    syncControls(true);
  };
  $("#fit").onchange = () => chooseFit($("#fit").value);
  for (const input of document.querySelectorAll("header input")) {
    input.onfocus = () => input.select();
    input.onkeydown = (event) => {
      if (event.key === "Enter") {
        input.onchange();
        input.blur();
      }
      if (event.key === "Escape") {
        syncControls(true);
        input.blur();
      }
    };
  }
  viewport.addEventListener(
    "scroll",
    () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        current = visiblePage() + 1;
        syncControls();
        requestRender();
      });
    },
    { passive: true },
  );
  window.addEventListener("resize", () => {
    if (["auto", "width", "page"].includes(mode)) chooseFit(mode);
    else requestRender();
  });
  // The annotation overlay lives outside the scrolling document. Wheel events
  // over drawing tools, ink, or notes still need to reach the PDF viewport.
  document.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
        applyZoom(zoom * Math.exp(-event.deltaY * 0.002));
      } else routeWheel(event, viewport);
    },
    { passive: false },
  );
  document.addEventListener("keydown", (event) => {
    if (
      event.target.matches("input,textarea,select") ||
      event.composedPath().some((n) => n?.dataset?.lastingInk)
    )
      return;
    if (
      (event.ctrlKey || event.metaKey) &&
      ["+", "=", "-", "0", "s"].includes(event.key.toLowerCase())
    ) {
      event.preventDefault();
      if (event.key.toLowerCase() === "s") download.click();
      else if (event.key === "0") chooseFit("auto");
      else applyZoom(nextZoom(zoom, event.key === "-" ? -1 : 1));
    }
  });
  chooseFit("auto", false);
  const requestedPage = Number(
    new URLSearchParams(new URL(url).hash.slice(1)).get("page"),
  );
  if (pageNumber(requestedPage, pages.length)) goTo(requestedPage);
}
openPdf().catch(async (error) => {
  console.error("Lasting Ink PDF:", error);
  if (chrome.mimeHandler) {
    try {
      await chrome.mimeHandler.abortAndFallbackToNativeHandler();
      return;
    } catch {}
  }
  $("#error").textContent = "Could not open this PDF. " + error.message;
});
