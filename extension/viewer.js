import * as pdfjs from "./vendor/pdf.mjs";
pdfjs.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL(
  "vendor/pdf.worker.mjs",
);
async function openPdf() {
  if (!chrome.mimeHandler)
    throw new Error("This PDF handler requires Chromium 151 or later.");
  const stream = await chrome.mimeHandler.getStreamInfo();
  const url = stream.originalUrl;
  const name =
    decodeURIComponent(new URL(url).pathname.split("/").pop()) ||
    "PDF document";
  document.title = name;
  document.querySelector("#title").textContent = name;
  const response = await fetch(stream.streamUrl);
  if (!response.ok) throw new Error("PDF stream failed: " + response.status);
  const data = new Uint8Array(await response.arrayBuffer());
  const task = pdfjs.getDocument({
    data,
    cMapUrl: chrome.runtime.getURL("vendor/cmaps/"),
    cMapPacked: true,
    standardFontDataUrl: chrome.runtime.getURL("vendor/standard_fonts/"),
  });
  task.onPassword = () => {
    chrome.mimeHandler.abortAndFallbackToNativeHandler();
  };
  const pdf = await task.promise;
  const surfaces = [];
  const ink = await startLastingInk({
    url,
    surfaces: () => surfaces,
    pdf: true,
  });
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n),
      base = page.getViewport({ scale: 1 });
    const scale = Math.min(
        1.35,
        Math.max(320, document.documentElement.clientWidth - 32) / base.width,
      ),
      viewport = page.getViewport({ scale });
    const el = document.createElement("section");
    el.className = "page";
    el.setAttribute("aria-label", "Page " + n);
    el.style.width = viewport.width + "px";
    el.style.height = viewport.height + "px";
    const canvas = document.createElement("canvas"),
      ratio = devicePixelRatio || 1;
    canvas.width = Math.floor(viewport.width * ratio);
    canvas.height = Math.floor(viewport.height * ratio);
    el.append(canvas);
    const layer = document.createElement("div");
    layer.className = "textLayer";
    layer.style.setProperty("--scale-factor", scale);
    el.append(layer);
    document.querySelector("#pages").append(el);
    await page.render({
      canvasContext: canvas.getContext("2d"),
      viewport,
      transform: [ratio, 0, 0, ratio, 0, 0],
    }).promise;
    await new pdfjs.TextLayer({
      textContentSource: await page.getTextContent(),
      container: layer,
      viewport,
    }).render();
    surfaces.push({ id: String(n), element: el });
    ink.refresh();
    document.querySelector("#progress").textContent =
      n + " / " + pdf.numPages + " pages";
  }
}
openPdf().catch(async (e) => {
  console.error("Lasting Ink PDF:", e);
  if (chrome.mimeHandler) {
    try {
      await chrome.mimeHandler.abortAndFallbackToNativeHandler();
      return;
    } catch {}
  }
  document.querySelector("#error").textContent =
    "Could not open this PDF. " + e.message;
});
