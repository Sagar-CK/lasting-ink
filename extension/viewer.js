import * as pdfjs from "./vendor/pdf.mjs";
import {
  EventBus,
  PDFViewer,
  PDFLinkService,
  PDFFindController,
  DownloadManager,
  LinkTarget,
  SpreadMode,
  ScrollMode,
} from "./vendor/pdf_viewer.mjs";
import { viewerIcons } from "./viewer-icons.js";
import {
  clampZoom,
  nextZoom,
  pageNumber,
  routeWheel,
  wheelZoom,
} from "./viewer-controls.js";
import {
  cleanUrl,
  documentId,
  migrateDocument,
  exportBackup,
  importBackup,
  VIEW_PREFIX,
  SETTINGS_KEY,
} from "./records.js";
import { parsePageRange } from "./viewer-state.js";
import { createPdfSource } from "./stream-source.js";
const $ = (s) => document.querySelector(s);
const asset = (p) => chrome.runtime.getURL(p);
pdfjs.GlobalWorkerOptions.workerSrc = asset("vendor/pdf.worker.mjs");
for (const button of document.querySelectorAll("[data-icon]"))
  button.innerHTML = viewerIcons[button.dataset.icon] || "";
for (const button of document.querySelectorAll("[data-menu-icon]")) {
  const icon = document.createElement("span");
  icon.className = "menu-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML = viewerIcons[button.dataset.menuIcon] || "";
  button.prepend(icon);
}
const viewport = $("#viewport"),
  bus = new EventBus(),
  downloads = new DownloadManager();
const links = new PDFLinkService({
  eventBus: bus,
  externalLinkTarget: LinkTarget.BLANK,
  externalLinkRel: "noopener noreferrer",
});
const find = new PDFFindController({ eventBus: bus, linkService: links });
const viewer = new PDFViewer({
  container: viewport,
  viewer: $("#pages"),
  eventBus: bus,
  linkService: links,
  findController: find,
  downloadManager: downloads,
  imageResourcesPath: asset("vendor/images/"),
  annotationMode: pdfjs.AnnotationMode.ENABLE_FORMS,
  maxCanvasPixels: 16000000,
  enablePermissions: true,
});
links.setViewer(viewer);
let pdf,
  ink,
  sourceUrl,
  filename = "Document.pdf",
  id,
  viewKey,
  ready = false,
  busy = false,
  saveTimer,
  formTimer,
  statusTimer,
  loadingTask;
let lastLocation,
  baseViewports = new Map(),
  ocrPages = new Map(),
  thumbs = new Map(),
  thumbObserver;
let presentationState,
  findQuery = "",
  sidebarPanel = "thumbnails",
  noteUpdate;
function status(text, persistent = false) {
  clearTimeout(statusTimer);
  $("#status").textContent = text;
  if (!persistent)
    statusTimer = setTimeout(() => ($("#status").textContent = ""), 4000);
}
function menu(show = false) {
  $("#document-menu").hidden = !show;
  $("#menu-toggle").setAttribute("aria-expanded", String(show));
}
function syncControls() {
  if (!pdf) return;
  if (document.activeElement !== $("#page-number"))
    $("#page-number").value = viewer.currentPageNumber;
  if (document.activeElement !== $("#zoom"))
    $("#zoom").value = Math.round(viewer.currentScale * 100) + "%";
  $("#page-count").textContent = "/ " + pdf.numPages;
  $("#previous").disabled = viewer.currentPageNumber === 1;
  $("#next").disabled = viewer.currentPageNumber === pdf.numPages;
  const fitPage = viewer.currentScaleValue === "page-width";
  const label = fitPage ? "Fit to page" : "Fit to width";
  $("#fit").title = label;
  $("#fit").setAttribute("aria-label", label);
  $("#fit").innerHTML = viewerIcons[fitPage ? "fitPage" : "fitWidth"];
  $("#two-page").checked = viewer.spreadMode !== SpreadMode.NONE;
  for (const [n, button] of thumbs)
    button.setAttribute(
      "aria-current",
      n === viewer.currentPageNumber ? "page" : "false",
    );
}
function goTo(n) {
  if (pdf) viewer.currentPageNumber = Math.max(1, Math.min(pdf.numPages, n));
  syncControls();
  saveSoon();
}
function setZoom(value) {
  viewer.currentScale = clampZoom(value);
  syncControls();
  saveSoon();
}
function baseViewport(n) {
  return baseViewports.get(n);
}
function surfaces() {
  if (!pdf) return [];
  const result = [];
  for (let i = 0; i < pdf.numPages; i++) {
    const view = viewer.getPageView(i);
    if (!view?.div) continue;
    result.push({
      id: String(i + 1),
      element: view.div,
      scale: () => view.viewport.scale,
      toNormalized(x, y) {
        const r = view.div.getBoundingClientRect(),
          native = view.viewport.convertToPdfPoint(x - r.left, y - r.top);
        const base = baseViewport(i + 1) || view.viewport,
          point = base.convertToViewportPoint(...native);
        return [point[0] / base.width, point[1] / base.height];
      },
      toScreen(p) {
        const base = baseViewport(i + 1) || view.viewport,
          native = base.convertToPdfPoint(
            p[0] * base.width,
            p[1] * base.height,
          );
        const point = view.viewport.convertToViewportPoint(...native),
          r = view.div.getBoundingClientRect();
        return [r.left + point[0], r.top + point[1]];
      },
    });
  }
  return result;
}
function snapshot() {
  const loc = lastLocation;
  if (!loc) return null;
  return {
    fingerprint: pdf.fingerprints?.[0] || null,
    page: loc.pageNumber,
    zoom: viewer.currentScale,
    scale: viewer.currentScaleValue,
    left: loc.left,
    top: loc.top,
    rotation: viewer.pagesRotation,
    spread: viewer.spreadMode,
    updated: Date.now(),
  };
}
function saveSoon() {
  if (!ready) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveView, 180);
}
async function saveView() {
  clearTimeout(saveTimer);
  if (!ready || !pdf) return;
  const state = snapshot();
  if (!state) return;
  try {
    await chrome.storage.local.set({ [viewKey]: state });
  } catch (error) {
    status("Could not save reading position: " + error.message);
  }
}
function restoreView(saved) {
  if (!saved) return;
  if ([0, 90, 180, 270].includes(saved.rotation))
    viewer.pagesRotation = saved.rotation;
  if ([SpreadMode.NONE, SpreadMode.ODD, SpreadMode.EVEN].includes(saved.spread))
    viewer.spreadMode = saved.spread;
  const scale =
    saved.scale ||
    (saved.mode === "width"
      ? "page-width"
      : saved.mode === "page"
        ? "page-fit"
        : saved.zoom);
  if (["page-width", "page-fit", "auto", "page-actual"].includes(scale))
    viewer.currentScaleValue = scale;
  else if (Number.isFinite(Number(scale)) && Number(scale) > 0)
    viewer.currentScale = clampZoom(Number(scale));
  const page = Math.max(1, Math.min(pdf.numPages, Number(saved.page) || 1));
  if (Number.isFinite(saved.left) && Number.isFinite(saved.top))
    viewer.scrollPageIntoView({
      pageNumber: page,
      destArray: [null, { name: "XYZ" }, saved.left, saved.top, null],
      allowNegativeOffset: true,
    });
  else {
    goTo(page);
    const view = viewer.getPageView(page - 1);
    if (Number.isFinite(saved.y))
      viewport.scrollTop += saved.y * view.div.clientHeight;
  }
}
async function loadDocument(input) {
  await saveView();
  ready = false;
  menu(false);
  $("#progress").hidden = false;
  $("#progress").removeAttribute("value");
  if (pdf) {
    await loadingTask?.destroy();
    viewer.setDocument(null);
    pdf = null;
  }
  sourceUrl = input.originalUrl;
  filename =
    input.name ||
    decodeURIComponent(
      new URL(sourceUrl).pathname.split("/").pop() || "Document.pdf",
    );
  if (!/\.pdf$/i.test(filename)) filename += ".pdf";
  document.title = filename;
  $("#title").textContent = filename;
  let documentSource;
  if (input.data) documentSource = { data: input.data };
  else {
    // Chromium MIME-handler streams are single-use browser-owned resources.
    // Fetch them once; XHR/range re-requests can invalidate the native stream.
    const response = await fetch(input.streamUrl);
    documentSource = await createPdfSource(response, pdfjs);
  }
  loadingTask = pdfjs.getDocument({
    ...documentSource,
    cMapUrl: asset("vendor/cmaps/"),
    cMapPacked: true,
    standardFontDataUrl: asset("vendor/standard_fonts/"),
    disableAutoFetch: true,
    isEvalSupported: false,
    enableXfa: true,
  });
  loadingTask.onProgress = ({ loaded, total }) => {
    if (total) {
      $("#progress").max = total;
      $("#progress").value = loaded;
    }
  };
  loadingTask.onPassword = async (update, reason) => {
    $("#password-message").textContent =
      reason === pdfjs.PasswordResponses.INCORRECT_PASSWORD
        ? "That password was incorrect. Try again."
        : "Enter the password for this PDF.";
    const dialog = $("#password-dialog");
    dialog.returnValue = "";
    dialog.showModal();
    $("#password").focus();
    const result = await new Promise((resolve) =>
      dialog.addEventListener("close", () => resolve(dialog.returnValue), {
        once: true,
      }),
    );
    if (result === "open") {
      const password = $("#password").value;
      $("#password").value = "";
      update(password);
    } else {
      loadingTask.destroy();
      status("PDF opening cancelled.");
    }
  };
  pdf = await loadingTask.promise;
  id = documentId(pdf.fingerprints?.[0], sourceUrl);
  viewKey = VIEW_PREFIX + id;
  await migrateDocument(chrome.storage.local, sourceUrl, id);
  const record = await chrome.storage.local.get([
    viewKey,
    "lasting-ink:forms:" + id,
    "lasting-ink:ocr:" + id,
  ]);
  const formValues = record["lasting-ink:forms:" + id];
  if (formValues)
    for (const [key, val] of Object.entries(formValues))
      pdf.annotationStorage.setValue(
        key,
        typeof val.value === "string"
          ? { ...val, formattedValue: val.value }
          : val,
      );
  pdf.annotationStorage.onSetModified = scheduleFormSave;
  baseViewports = new Map();
  ocrPages = new Map(
    Object.entries(record["lasting-ink:ocr:" + id] || {}).map(([n, v]) => [
      Number(n),
      v,
    ]),
  );
  const originalGetPage = pdf.getPage.bind(pdf);
  pdf.getPage = async (n) => {
    const page = await originalGetPage(n);
    if (!baseViewports.has(n))
      baseViewports.set(
        n,
        page.getViewport({ scale: 1, rotation: page.rotate }),
      );
    patchOcr(page, n);
    return page;
  };
  links.setDocument(pdf, sourceUrl);
  find.setDocument(pdf);
  const init = new Promise((resolve) =>
    bus.on("pagesinit", function done() {
      bus.off("pagesinit", done);
      resolve();
    }),
  );
  viewer.setDocument(pdf);
  await init;
  viewer.currentScaleValue = "auto";
  if (!ink)
    ink = await startLastingInk({
      url: sourceUrl,
      storageKey: id,
      viewportElement: viewport,
      surfaces,
      pdf: true,
      toolbarMount: $("#annotation-tools"),
      onTopInsetChange: () => measureHeader(),
      onChange: () => {
        clearTimeout(noteUpdate);
        noteUpdate = setTimeout(updateNotes, 80);
      },
    });
  else {
    location.reload();
    return;
  }
  restoreView(record[viewKey]);
  const hash = new URL(sourceUrl).hash.slice(1);
  if (hash) links.setHash(hash);
  await nextFrame();
  viewer.update();
  ready = true;
  saveView();
  syncControls();
  $("#progress").hidden = true;
  initThumbnails();
  loadOutline();
  loadAttachments();
  updateNotes();
  loadSettings();
  globalThis.lastingInkViewer = {
    viewer,
    pdf,
    ink,
    goTo,
    exportCurrent,
    runOcr,
    saveView,
    surfaces,
  };
}
function nextFrame() {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve)),
  );
}
function measureHeader() {
  document.documentElement.style.setProperty(
    "--pdf-top-inset",
    $("header").getBoundingClientRect().height + "px",
  );
  viewer.update();
  ink?.refresh();
}
new ResizeObserver(measureHeader).observe($("header"));
new ResizeObserver(() => {
  if (pdf) {
    const scale = viewer.currentScaleValue;
    if (["auto", "page-width", "page-fit"].includes(scale))
      viewer.currentScaleValue = scale;
    viewer.update();
    ink?.refresh();
  }
}).observe(viewport);
for (const event of [
  "pagechanging",
  "scalechanging",
  "rotationchanging",
  "spreadmodechanged",
])
  bus.on(event, () => {
    syncControls();
    ink?.refresh();
    saveSoon();
  });
bus.on("updateviewarea", ({ location }) => {
  lastLocation = location;
  saveSoon();
  ink?.refresh();
});
bus.on("pagerendered", () => ink?.refresh());
function labelPdfAnnotations({ pageNumber }) {
  const page = viewer.getPageView(pageNumber - 1)?.div;
  if (!page) return;
  for (const field of page.querySelectorAll(
    ".annotationLayer input, .annotationLayer textarea, .annotationLayer select",
  )) {
    if (
      field.getAttribute("aria-label") ||
      field.getAttribute("aria-labelledby") ||
      field.title ||
      field.labels?.length
    )
      continue;
    field.setAttribute(
      "aria-label",
      field.name?.replace(/[_-]+/g, " ") || "PDF form field",
    );
  }
  for (const link of page.querySelectorAll(".annotationLayer a[href]")) {
    if (
      link.textContent.trim() ||
      link.getAttribute("aria-label") ||
      link.title
    )
      continue;
    const box = link.getBoundingClientRect();
    const text = [...page.querySelectorAll(".textLayer span")]
      .filter((span) => {
        const r = span.getBoundingClientRect();
        return (
          r.right > box.left &&
          r.left < box.right &&
          r.bottom > box.top &&
          r.top < box.bottom
        );
      })
      .map((span) => span.textContent)
      .join(" ")
      .trim();
    const target = new URL(link.href, sourceUrl);
    link.setAttribute(
      "aria-label",
      text ||
        (cleanUrl(target.href) === cleanUrl(sourceUrl)
          ? "Go to linked page"
          : "Open link to " + target.hostname),
    );
  }
}
bus.on("annotationlayerrendered", labelPdfAnnotations);
bus.on("textlayerrendered", (event) => {
  ink?.refresh();
  labelPdfAnnotations(event);
});
window.addEventListener("pagehide", () => {
  saveView();
  saveForms();
  ink?.flush();
});
async function saveForms() {
  clearTimeout(formTimer);
  if (!pdf) return;
  const values = pdf.annotationStorage.getAll();
  if (values)
    await chrome.storage.local.set({ ["lasting-ink:forms:" + id]: values });
}
function scheduleFormSave() {
  clearTimeout(formTimer);
  formTimer = setTimeout(saveForms, 180);
}
document.addEventListener("input", (e) => {
  if (e.target.closest?.(".annotationLayer")) {
    if (
      e.target.dataset.elementId &&
      ["text", "textarea"].includes(e.target.type)
    )
      pdf.annotationStorage.setValue(e.target.dataset.elementId, {
        formattedValue: e.target.value,
      });
    scheduleFormSave();
  }
});
document.addEventListener("change", (e) => {
  if (e.target.closest?.(".annotationLayer")) scheduleFormSave();
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") saveView();
});
$("#previous").onclick = () => goTo(viewer.currentPageNumber - 1);
$("#next").onclick = () => goTo(viewer.currentPageNumber + 1);
$("#page-number").onchange = () => {
  const n = pageNumber($("#page-number").value, pdf.numPages);
  if (n) goTo(n);
  else syncControls();
};
$("#zoom-out").onclick = () => setZoom(nextZoom(viewer.currentScale, -1));
$("#zoom-in").onclick = () => setZoom(nextZoom(viewer.currentScale, 1));
$("#zoom").onchange = () => {
  const n = Number($("#zoom").value.replace("%", ""));
  if (n > 0) setZoom(n / 100);
  else syncControls();
};
$("#fit").onclick = () => {
  viewer.currentScaleValue =
    viewer.currentScaleValue === "page-width" ? "page-fit" : "page-width";
  syncControls();
};
for (const input of [$("#page-number"), $("#zoom")]) {
  input.onfocus = () => input.select();
  input.onkeydown = (e) => {
    if (e.key === "Enter") {
      input.onchange();
      input.blur();
    }
    if (e.key === "Escape") {
      input.blur();
      syncControls();
    }
  };
}
function showFind() {
  $("#findbar").hidden = false;
  measureHeader();
  $("#find-query").focus();
  $("#find-query").select();
}
function search(previous = false, type = "") {
  findQuery = $("#find-query").value;
  bus.dispatch("find", {
    source: window,
    type,
    query: findQuery,
    caseSensitive: $("#find-case").checked,
    entireWord: false,
    highlightAll: true,
    findPrevious: previous,
    matchDiacritics: false,
  });
}
$("#find-toggle").onclick = showFind;
$("#find-query").oninput = () => search();
$("#find-case").onchange = () => search();
$("#find-next").onclick = () => search(false, "again");
$("#find-previous").onclick = () => search(true, "again");
$("#find-query").onkeydown = (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    search(e.shiftKey, "again");
  }
  if (e.key === "Escape") $("#find-close").click();
};
$("#find-close").onclick = () => {
  $("#findbar").hidden = true;
  bus.dispatch("findbarclose", { source: window });
  measureHeader();
  viewport.focus();
};
bus.on("updatefindmatchescount", ({ matchesCount }) => {
  $("#find-count").textContent =
    `${matchesCount.current} / ${matchesCount.total}`;
});
bus.on("updatefindcontrolstate", ({ state, matchesCount }) => {
  $("#find-count").textContent =
    state === 1
      ? "No matches"
      : state === 3
        ? "Searching…"
        : `${matchesCount?.current || 0} / ${matchesCount?.total || 0}`;
});
function openSidebar(panel = sidebarPanel) {
  sidebarPanel = panel;
  $("#sidebar").hidden = false;
  document.body.classList.add("sidebar-open");
  $("#sidebar-toggle").setAttribute("aria-expanded", "true");
  for (const tab of document.querySelectorAll("[data-panel]")) {
    const selected = tab.dataset.panel === panel;
    tab.setAttribute("aria-selected", String(selected));
    $("#" + tab.dataset.panel).hidden = !selected;
  }
  viewer.update();
  ink?.refresh();
}
$("#sidebar-toggle").onclick = () => {
  if ($("#sidebar").hidden) openSidebar();
  else {
    $("#sidebar").hidden = true;
    document.body.classList.remove("sidebar-open");
    $("#sidebar-toggle").setAttribute("aria-expanded", "false");
    viewer.update();
  }
};
for (const button of document.querySelectorAll("[data-panel]"))
  button.onclick = () => openSidebar(button.dataset.panel);
async function initThumbnails() {
  $("#thumbnails").replaceChildren();
  thumbs.clear();
  thumbObserver?.disconnect();
  thumbObserver = new IntersectionObserver(
    async (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        thumbObserver.unobserve(e.target);
        try {
          const page = await pdf.getPage(Number(e.target.dataset.page)),
            v = page.getViewport({ scale: 0.22 });
          const canvas = document.createElement("canvas");
          canvas.width = v.width;
          canvas.height = v.height;
          await page.render({
            canvasContext: canvas.getContext("2d"),
            viewport: v,
            annotationMode: pdfjs.AnnotationMode.ENABLE,
          }).promise;
          e.target.prepend(canvas);
        } catch (error) {
          console.warn("Thumbnail:", error);
        }
      }
    },
    { root: $("#sidebar"), rootMargin: "200px" },
  );
  for (let n = 1; n <= pdf.numPages; n++) {
    const button = document.createElement("button");
    button.className = "thumbnail";
    button.dataset.page = n;
    button.textContent = "Page " + n;
    button.setAttribute("aria-label", "Go to page " + n);
    button.onclick = () => goTo(n);
    $("#thumbnails").append(button);
    thumbs.set(n, button);
    thumbObserver.observe(button);
  }
}
function empty(container, text) {
  const p = document.createElement("p");
  p.className = "empty";
  p.textContent = text;
  container.replaceChildren(p);
}
async function bookmarkPage() {
  const key = "lasting-ink:bookmarks:" + id;
  const values = (await chrome.storage.local.get(key))[key] || [];
  const page = viewer.currentPageNumber;
  if (!values.some((b) => b.page === page && !b.removed))
    values.push({ page, title: "Page " + page, updated: Date.now() });
  await chrome.storage.local.set({ [key]: values });
  menu(false);
  await loadOutline();
  openSidebar("outline");
}
$("#bookmark-current").onclick = bookmarkPage;
async function loadOutline() {
  const outline = await pdf.getOutline(),
    root = $("#outline");
  root.replaceChildren();
  const key = "lasting-ink:bookmarks:" + id;
  const bookmarks = (await chrome.storage.local.get(key))[key] || [];
  for (const mark of bookmarks.filter((b) => !b.removed)) {
    const row = document.createElement("div"),
      button = document.createElement("button"),
      remove = document.createElement("button");
    row.className = "bookmark-row";
    button.className = "outline-item";
    button.innerHTML = viewerIcons.bookmark;
    button.append(document.createTextNode(mark.title));
    button.onclick = () => goTo(mark.page);
    remove.className = "remove-bookmark";
    remove.innerHTML = viewerIcons.close;
    remove.title = "Remove bookmark";
    remove.setAttribute("aria-label", "Remove " + mark.title);
    remove.onclick = async () => {
      await chrome.storage.local.set({
        [key]: bookmarks.map((b) =>
          b.page === mark.page
            ? { ...b, removed: true, updated: Date.now() }
            : b,
        ),
      });
      loadOutline();
    };
    row.append(button, remove);
    root.append(row);
  }
  if (!outline?.length && !bookmarks.some((b) => !b.removed)) {
    empty(
      root,
      "No outline or bookmarks. Use Document options to bookmark a page.",
    );
    return;
  }
  function add(items, parent) {
    for (const entry of items) {
      const wrap = document.createElement("div"),
        button = document.createElement("button");
      button.className = "outline-item";
      button.textContent = entry.title;
      button.onclick = () =>
        entry.url
          ? /^(https?:|mailto:)/i.test(entry.url)
            ? window.open(entry.url, "_blank", "noopener,noreferrer")
            : null
          : links.goToDestination(entry.dest);
      wrap.append(button);
      parent.append(wrap);
      if (entry.items?.length) {
        const group = document.createElement("div");
        group.className = "outline-children";
        wrap.append(group);
        add(entry.items, group);
      }
    }
  }
  add(outline, root);
}
async function loadAttachments() {
  const root = $("#attachments");
  const attachments = await pdf.getAttachments();
  root.replaceChildren();
  if (!attachments) {
    empty(root, "No embedded files.");
    return;
  }
  for (const item of Object.values(attachments)) {
    const button = document.createElement("button");
    button.className = "attachment";
    button.innerHTML = viewerIcons.attachment;
    button.append(document.createTextNode(item.filename));
    button.onclick = () =>
      downloads.downloadData(
        item.content,
        item.filename,
        "application/octet-stream",
      );
    root.append(button);
  }
}
function updateNotes() {
  if (!ink) return;
  const root = $("#note-list"),
    query = $("#note-filter").value.toLowerCase();
  root.replaceChildren();
  const selected = ink.list().find((a) => a.id === ink.selected());
  $("#annotation-editor").hidden = !selected;
  if (selected) {
    $("#annotation-color").value = selected.color;
    $("#annotation-width").value = selected.width || 3;
    $("#annotation-width").disabled =
      selected.type === "highlight" || selected.type === "note";
  }
  const list = ink
    .list()
    .filter((a) => (a.text || a.quote || a.type).toLowerCase().includes(query));
  if (!list.length) {
    empty(
      root,
      query
        ? "No matching annotations."
        : "Your notes and highlights will appear here.",
    );
    return;
  }
  for (const a of list) {
    const b = document.createElement("button");
    b.className = "note-card";
    b.setAttribute("aria-pressed", String(a.id === ink.selected()));
    const title = document.createElement("small");
    const labels = {
      pen: "Drawing",
      marker: "Highlighter",
      box: "Rectangle",
      arrow: "Arrow",
      highlight: "Highlight",
      note: "Comment",
    };
    title.textContent = `Page ${a.surface || a.anchor?.surface || "?"} · ${labels[a.type] || a.type}`;
    const text = document.createElement("span");
    text.textContent =
      a.text ||
      a.quote ||
      {
        pen: "Drawing",
        box: "Rectangle",
        marker: "Highlighter",
        arrow: "Arrow",
      }[a.type] ||
      a.type;
    b.append(title, text);
    b.onclick = () => {
      goTo(Number(a.surface || a.anchor?.surface));
      ink.select(a.id);
      updateNotes();
    };
    root.append(b);
  }
}
$("#note-filter").oninput = updateNotes;
$("#annotation-color").oninput = (e) => {
  if (ink.selected() && /^#[0-9a-f]{6}$/i.test(e.target.value))
    ink.update(ink.selected(), { color: e.target.value });
};
$("#annotation-width").oninput = (e) => {
  if (ink.selected())
    ink.update(ink.selected(), { width: Number(e.target.value) });
};
$("#delete-annotation").onclick = () => {
  ink.remove(ink.selected());
  updateNotes();
};
$("#menu-toggle").onclick = () => menu($("#document-menu").hidden);
document.addEventListener("pointerdown", (e) => {
  if (
    !e.composedPath().includes($("#document-menu")) &&
    !e.composedPath().includes($("#menu-toggle"))
  )
    menu(false);
});
$("#rotate").onclick = () => {
  viewer.pagesRotation = (viewer.pagesRotation + 90) % 360;
  menu(false);
  syncControls();
};
$("#two-page").onchange = (e) => {
  viewer.spreadMode = e.target.checked ? SpreadMode.ODD : SpreadMode.NONE;
  viewer.update();
};
$("#present").onclick = async () => {
  menu(false);
  presentationState = {
    scale: viewer.currentScaleValue,
    scroll: viewer.scrollMode,
    spread: viewer.spreadMode,
  };
  await document.documentElement.requestFullscreen();
  viewer.spreadMode = SpreadMode.NONE;
  viewer.scrollMode = ScrollMode.PAGE;
  viewer.currentScaleValue = "page-fit";
};
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement && presentationState) {
    viewer.scrollMode = presentationState.scroll;
    viewer.spreadMode = presentationState.spread;
    viewer.currentScaleValue = presentationState.scale;
    presentationState = null;
  }
});
async function exportCurrent(includeAnnotations = true) {
  if (busy) throw new Error("Wait for the current PDF operation to finish.");
  busy = true;
  status("Preparing PDF…", true);
  try {
    await ink.flush();
    const bytes = includeAnnotations
      ? await pdf.saveDocument()
      : await pdf.getData();
    if (!includeAnnotations) {
      downloads.downloadData(bytes, filename, "application/pdf");
      return bytes;
    }
    let annotations = ink.list();
    for (const a of annotations.filter(
      (a) => a.type === "highlight" && !a.quads?.length,
    )) {
      const view = viewer.getPageView(Number(a.surface) - 1);
      if (view && view.renderingState !== 3) {
        await view.draw();
        await nextFrame();
        ink.refresh();
        await nextFrame();
      }
    }
    await ink.flush();
    annotations = ink.list();
    const infos = [];
    for (let n = 1; n <= pdf.numPages; n++) {
      const p = await pdf.getPage(n),
        v = baseViewport(n) || p.getViewport({ scale: 1 });
      infos.push({
        toPdf: (pt) => v.convertToPdfPoint(pt[0] * v.width, pt[1] * v.height),
      });
    }
    const { exportPdf } = await import("./pdf-export.js");
    const result = await exportPdf({
      bytes,
      annotations,
      pageInfos: infos,
      rasterize: async (i) => {
        const p = await pdf.getPage(i + 1),
          v = p.getViewport({ scale: 1.5 });
        const c = document.createElement("canvas");
        c.width = v.width;
        c.height = v.height;
        await p.render({
          canvasContext: c.getContext("2d"),
          viewport: v,
          annotationMode: pdfjs.AnnotationMode.ENABLE_STORAGE,
          annotationStorage: pdf.annotationStorage,
        }).promise;
        return {
          png: await (
            await new Promise((r) => c.toBlob(r, "image/png"))
          ).arrayBuffer(),
          width: v.width / 1.5,
          height: v.height / 1.5,
        };
      },
    });
    if (result.flattened)
      status("Saved a flattened copy of the password-protected PDF.");
    return result.bytes;
  } finally {
    busy = false;
    if ($("#status").textContent === "Preparing PDF…") status("");
  }
}
async function saveAnnotated() {
  try {
    const data = await exportCurrent();
    downloads.downloadData(
      data,
      filename.replace(/\.pdf$/i, "-annotated.pdf"),
      "application/pdf",
    );
    menu(false);
  } catch (e) {
    status(e.message, true);
  }
}
$("#download").onclick = saveAnnotated;
$("#save-annotated").onclick = saveAnnotated;
$("#save-original").onclick = () =>
  exportCurrent(false).catch((e) => status(e.message));
$("#print").onclick = async () => {
  menu(false);
  const dialog = $("#print-dialog");
  dialog.returnValue = "";
  dialog.showModal();
  const answer = await new Promise((r) =>
    dialog.addEventListener("close", () => r(dialog.returnValue), {
      once: true,
    }),
  );
  if (answer !== "print") return;
  await printPdf($("#print-annotations").checked);
};
async function printPdf(annotated) {
  try {
    const bytes = annotated ? await exportCurrent() : await pdf.saveDocument();
    const doc = await pdfjs.getDocument({
      data: bytes.slice(),
      isEvalSupported: false,
      standardFontDataUrl: asset("vendor/standard_fonts/"),
    }).promise;
    const frame = document.createElement("iframe");
    frame.title = "Print PDF";
    frame.style.cssText =
      "position:fixed;left:-10000px;width:800px;height:1000px";
    document.body.append(frame);
    const target = frame.contentDocument;
    target.open();
    target.write(
      "<!doctype html><html><head><title>Print PDF</title><style>@page{margin:0}body{margin:0}img{display:block;width:100%;height:100%;object-fit:contain}.page{break-after:page}.page:last-child{break-after:auto}</style></head><body></body></html>",
    );
    target.close();
    status("Preparing print pages…", true);
    for (let n = 1; n <= doc.numPages; n++) {
      const p = await doc.getPage(n),
        v = p.getViewport({ scale: 2 });
      const c = document.createElement("canvas");
      c.width = v.width;
      c.height = v.height;
      await p.render({ canvasContext: c.getContext("2d"), viewport: v })
        .promise;
      const div = target.createElement("div");
      div.className = "page";
      div.style.width = v.width / 2 + "pt";
      div.style.height = v.height / 2 + "pt";
      div.style.page = "sheet" + n;
      const pageStyle = target.createElement("style");
      pageStyle.textContent = `@page sheet${n}{size:${v.width / 2}pt ${v.height / 2}pt;margin:0}`;
      target.head.append(pageStyle);
      const img = target.createElement("img");
      img.src = c.toDataURL("image/png");
      div.append(img);
      target.body.append(div);
    }
    status("");
    await Promise.all([...target.images].map((img) => img.decode()));
    frame.contentWindow.addEventListener(
      "afterprint",
      () => {
        frame.remove();
        doc.destroy();
      },
      { once: true },
    );
    frame.contentWindow.focus();
    frame.contentWindow.print();
  } catch (e) {
    status("Could not print: " + e.message, true);
  }
}
$("#backup").onclick = async () => {
  await ink.flush();
  const value = await exportBackup(chrome.storage.local);
  downloads.downloadData(
    new TextEncoder().encode(JSON.stringify(value, null, 2)),
    "lasting-ink-backup.json",
    "application/json",
  );
  menu(false);
};
$("#restore").onclick = () => {
  $("#backup-file").click();
  menu(false);
};
$("#backup-file").onchange = async (e) => {
  try {
    const file = e.target.files[0];
    if (!file) return;
    const count = await importBackup(
      chrome.storage.local,
      JSON.parse(await file.text()),
    );
    status(`Imported ${count} annotations.`);
  } catch (e) {
    status("Could not import: " + e.message, true);
  }
  e.target.value = "";
};
$("#open-local").onclick = () => {
  $("#local-file").click();
  menu(false);
};
$("#local-file").onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const cache = await caches.open("lasting-ink-local-pdfs");
  const name = "local-" + crypto.randomUUID();
  await cache.put(
    new Request(new URL(name, location.href)),
    new Response(await file.arrayBuffer()),
  );
  location.href =
    asset("viewer.html") +
    "?local=" +
    encodeURIComponent(name) +
    "&name=" +
    encodeURIComponent(file.name);
};
async function loadSettings() {
  const s = await chrome.storage.local.get([
    SETTINGS_KEY,
    "lasting-ink:sync-status",
  ]);
  $("#sync-enabled").checked = !!s[SETTINGS_KEY]?.sync;
  $("#sync-status").textContent =
    s["lasting-ink:sync-status"]?.message ||
    "Off until enabled. Uses your browser’s sync account.";
}
$("#sync-enabled").onchange = async (e) => {
  const current =
    (await chrome.storage.local.get(SETTINGS_KEY))[SETTINGS_KEY] || {};
  await chrome.storage.local.set({
    [SETTINGS_KEY]: { ...current, sync: e.target.checked },
  });
  loadSettings();
};
$("#sync-now").onclick = () =>
  chrome.runtime
    .sendMessage({ type: "sync-now" })
    .then(loadSettings)
    .catch((e) => status(e.message));
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes["lasting-ink:sync-status"]) loadSettings();
});
let ocrWorker;
function patchOcr(page, n) {
  if (!ocrPages.has(n) || page._lastingOcr) return;
  const content = ocrPages.get(n);
  page._lastingOcr = true;
  page.getTextContent = async () => content;
  page.streamTextContent = () =>
    new ReadableStream({
      start(controller) {
        controller.enqueue(content);
        controller.close();
      },
    });
}
async function runOcr(numbers) {
  if (busy) throw new Error("Wait for the current PDF operation.");
  busy = true;
  let recognized = 0;
  try {
    status("Loading on-device OCR…", true);
    const {
      default: { createWorker },
    } = await import("./vendor/tesseract.mjs");
    ocrWorker ||= await createWorker("eng", 1, {
      workerPath: asset("vendor/ocr-worker.js"),
      corePath: asset("vendor/tesseract-core-simd-lstm.wasm.js"),
      langPath: asset("vendor"),
      workerBlobURL: false,
      gzip: true,
      logger: (m) => {
        if (m.status === "recognizing text")
          $("#status").textContent =
            `Recognizing page text… ${Math.round(m.progress * 100)}%`;
      },
    });
    for (const n of numbers) {
      const page = await pdf.getPage(n),
        native = await page.getTextContent();
      if (native.items.some((i) => i.str?.trim()) && !ocrPages.has(n)) continue;
      const v = page.getViewport({ scale: 2 }),
        canvas = document.createElement("canvas");
      canvas.width = v.width;
      canvas.height = v.height;
      await page.render({ canvasContext: canvas.getContext("2d"), viewport: v })
        .promise;
      const result = await ocrWorker.recognize(
        canvas,
        {},
        { text: true, blocks: true },
      );
      const items = [];
      for (const block of result.data.blocks || [])
        for (const para of block.paragraphs || [])
          for (const line of para.lines || [])
            for (const word of line.words || []) {
              const b = word.bbox;
              const a = v.convertToPdfPoint(b.x0, b.y1),
                end = v.convertToPdfPoint(b.x1, b.y0);
              const height = Math.abs(end[1] - a[1]);
              items.push({
                str: word.text + " ",
                dir: "ltr",
                width: Math.abs(end[0] - a[0]),
                height,
                transform: [height, 0, 0, height, a[0], a[1]],
                fontName: "ocr",
                hasEOL: false,
              });
            }
      ocrPages.set(n, {
        items,
        styles: {
          ocr: {
            fontFamily: "sans-serif",
            ascent: 0.85,
            descent: -0.15,
            vertical: false,
          },
        },
        lang: "en",
      });
      patchOcr(page, n);
      recognized++;
      const view = viewer.getPageView(n - 1);
      view?.reset();
      status(`Recognized page ${n} (${recognized} scanned pages).`, true);
    }
    await chrome.storage.local.set({
      ["lasting-ink:ocr:" + id]: Object.fromEntries(ocrPages),
    });
    find.setDocument(null);
    find.setDocument(pdf);
    viewer.update();
    if (findQuery) search();
    status(`Text recognition complete: ${recognized} scanned pages.`);
    return recognized;
  } finally {
    busy = false;
  }
}
$("#ocr").onclick = async () => {
  menu(false);
  const dialog = $("#ocr-dialog");
  dialog.returnValue = "";
  dialog.showModal();
  const answer = await new Promise((r) =>
    dialog.addEventListener("close", () => r(dialog.returnValue), {
      once: true,
    }),
  );
  if (answer !== "run") return;
  try {
    await runOcr(parsePageRange($("#ocr-pages").value, pdf.numPages));
  } catch (e) {
    status(e.message, true);
  }
};
document.addEventListener(
  "wheel",
  (e) => {
    if (!ready) return;
    const zoom = wheelZoom(e, viewer.currentScale, viewport.clientHeight);
    if (zoom !== null) {
      e.preventDefault();
      setZoom(zoom);
    } else if (
      !e
        .composedPath()
        .some((n) => n === $("#sidebar") || n === $("#document-menu"))
    )
      routeWheel(e, viewport);
  },
  { passive: false },
);
document.addEventListener("keydown", (e) => {
  const edit = e
    .composedPath()
    .some((n) =>
      n?.matches?.('input,textarea,select,[contenteditable="true"]'),
    );
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
    e.preventDefault();
    showFind();
    return;
  }
  if (edit) return;
  if (
    (e.metaKey || e.ctrlKey) &&
    ["+", "=", "-", "0", "s", "p"].includes(e.key.toLowerCase())
  ) {
    e.preventDefault();
    const k = e.key.toLowerCase();
    if (k === "s") saveAnnotated();
    else if (k === "p") $("#print").click();
    else if (k === "0") viewer.currentScaleValue = "auto";
    else setZoom(nextZoom(viewer.currentScale, k === "-" ? -1 : 1));
  }
  if (
    document.fullscreenElement &&
    [
      "ArrowRight",
      "ArrowDown",
      "PageDown",
      "ArrowLeft",
      "ArrowUp",
      "PageUp",
    ].includes(e.key)
  ) {
    e.preventDefault();
    goTo(
      viewer.currentPageNumber +
        (["ArrowRight", "ArrowDown", "PageDown"].includes(e.key) ? 1 : -1),
    );
  }
  if (e.key === "Escape") menu(false);
  if ((e.key === "Delete" || e.key === "Backspace") && ink?.selected()) {
    e.preventDefault();
    ink.remove(ink.selected());
  }
});
try {
  const params = new URLSearchParams(location.search);
  if (params.has("local")) {
    const cache = await caches.open("lasting-ink-local-pdfs"),
      response = await cache.match(
        new Request(new URL(params.get("local"), location.href)),
      );
    if (!response)
      throw new Error(
        "This local PDF is no longer cached. Open the file again from Document options.",
      );
    await loadDocument({
      data: new Uint8Array(await response.arrayBuffer()),
      originalUrl:
        "file:///" + encodeURIComponent(params.get("name") || "Document.pdf"),
      name: params.get("name"),
    });
  } else {
    if (!chrome.mimeHandler)
      throw new Error(
        "Open a PDF file from Document options, or open a PDF link in Arc.",
      );
    await loadDocument(await chrome.mimeHandler.getStreamInfo());
  }
} catch (error) {
  $("#progress").hidden = true;
  status(error.message, true);
  console.error(error);
}
