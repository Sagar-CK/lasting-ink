(() => {
  if (globalThis.__lastingInkStarted) return;
  // Chromium's PDF MIME host is a small HTML wrapper around the handler.
  // Annotate inside that handler only, never put a second toolbar over it.
  const isPdf =
    document.contentType === "application/pdf" ||
    /\.pdf$/i.test(location.pathname) ||
    document.querySelector(
      'embed[type*="pdf"],object[type*="pdf"],embed[type*="mime-handler"]',
    );
  if (isPdf || !document.body) return;
  globalThis.__lastingInkStarted = true;
  globalThis.startLastingInk({
    url: location.href,
    surfaces: () => [{ id: "web", element: document.body }],
    pdf: false,
  });
})();
