// PDF points use 72 DPI; browser CSS pixels use 96 DPI.
export const CSS_UNITS = 96 / 72;
export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 5;
export const clampZoom = (value) =>
  Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));
export function fitZoom(mode, size, page) {
  const width = Math.max(1, size.width - 48) / (page.width * CSS_UNITS);
  const height = Math.max(1, size.height - 124) / (page.height * CSS_UNITS);
  return clampZoom(
    mode === "page"
      ? Math.min(width, height)
      : mode === "width"
        ? width
        : Math.min(1, width),
  );
}
export function parseZoom(value) {
  const text = String(value).trim().replace(/%$/, "").trim();
  if (!/^\d+(\.\d+)?$/.test(text)) return null;
  return clampZoom(Number(text) / 100);
}
export function nextZoom(current, direction) {
  const steps = [
    0.25, 0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5,
  ];
  return direction > 0
    ? (steps.find((n) => n > current + 0.001) ?? MAX_ZOOM)
    : (steps.findLast((n) => n < current - 0.001) ?? MIN_ZOOM);
}
export function pageNumber(value, count) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= count ? n : null;
}

// Preserve native scrolling inside the viewport and scrollable note textareas.
// An overlay sibling otherwise traps wheel events outside the scroll container.
export function routeWheel(event, viewport) {
  if (event.ctrlKey || event.defaultPrevented) return;
  const path = event.composedPath();
  if (path.includes(viewport)) return;
  const text = path.find((node) => node?.tagName === "TEXTAREA");
  if (
    text &&
    ((event.deltaY > 0 &&
      text.scrollTop + text.clientHeight < text.scrollHeight) ||
      (event.deltaY < 0 && text.scrollTop > 0))
  )
    return;
  const unit =
    event.deltaMode === 1
      ? 16
      : event.deltaMode === 2
        ? viewport.clientHeight
        : 1;
  viewport.scrollBy({
    left: event.deltaX * unit,
    top: event.deltaY * unit,
    behavior: "instant",
  });
  event.preventDefault();
}
