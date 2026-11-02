// Optional demo scenes, chosen with ?scene=. They drive the real toolbar the
// way a person would: select text, draw, type. Used for README screenshots.
const scene = new URLSearchParams(location.search).get("scene");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(test, timeout = 15000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const value = test();
    if (value) return value;
    await wait(50);
  }
  throw new Error("Demo scene timed out");
}
const hosts = () => [...document.querySelectorAll("[data-lasting-ink]")];
const toolbar = () =>
  document.querySelector("#annotation-tools [data-lasting-ink]")?.shadowRoot;
const layer = () =>
  hosts().find((h) => !h.closest("#annotation-tools"))?.shadowRoot;
const pageBox = (n) =>
  document
    .querySelector(`.page[data-page-number="${n}"]`)
    .getBoundingClientRect();
const at = (n, fx, fy) => {
  const r = pageBox(n);
  return [r.left + r.width * fx, r.top + r.height * fy];
};
function pointer(type, target, [x, y]) {
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      composed: true,
      cancelable: true,
      button: 0,
      buttons: type === "pointerup" ? 0 : 1,
      clientX: x,
      clientY: y,
      pointerId: 1,
      isPrimary: true,
    }),
  );
}
function tool(mode) {
  const button = toolbar().querySelector(`[data-mode="${mode}"]`);
  if (button.getAttribute("aria-pressed") !== "true") button.click();
}
function color(value) {
  toolbar().querySelector('[data-action="color"]').click();
  toolbar().querySelector(`[data-color="${value}"]`).click();
}
function size(points) {
  toolbar().querySelector('[data-action="size"]').click();
  toolbar().querySelector(`[data-text-size="${points}"]`).click();
}
async function page(n) {
  const input = document.querySelector("#page-number");
  input.value = n;
  input.dispatchEvent(new Event("change", { bubbles: true }));
  input.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
  );
  await until(() =>
    document.querySelector(`.page[data-page-number="${n}"] .textLayer span`),
  );
  await wait(400);
}
// Select a phrase in the page's text layer and lift the highlighter.
async function highlight(n, phrase) {
  const nodes = [];
  let text = "";
  const walker = document.createTreeWalker(
    document.querySelector(`.page[data-page-number="${n}"] .textLayer`),
    NodeFilter.SHOW_TEXT,
  );
  while (walker.nextNode()) {
    nodes.push({ node: walker.currentNode, start: text.length });
    text += walker.currentNode.data;
  }
  // Lines are separate spans without spaces between them, so match the
  // phrase with whitespace removed and map back to real offsets.
  const kept = [];
  for (let i = 0; i < text.length; i++) if (!/\s/.test(text[i])) kept.push(i);
  const squeezed = kept.map((i) => text[i]).join("");
  const found = squeezed.indexOf(phrase.replace(/\s+/g, ""));
  if (found < 0) throw new Error("Phrase not found: " + phrase);
  const start = kept[found],
    end = kept[found + phrase.replace(/\s+/g, "").length - 1] + 1;
  const find = (offset, last) => {
    const hit = last
      ? nodes.findLast((n) => n.start < offset)
      : nodes.findLast((n) => n.start <= offset);
    return [hit.node, offset - hit.start];
  };
  const range = document.createRange();
  range.setStart(...find(start));
  range.setEnd(...find(end, true));
  tool("highlight");
  getSelection().removeAllRanges();
  getSelection().addRange(range);
  pointer("pointerup", document.body, at(n, 0.5, 0.5));
  await wait(150);
}
async function shape(mode, n, from, to, ink) {
  tool(mode);
  if (ink) color(ink);
  const capture = layer().querySelector(".capture");
  pointer("pointerdown", capture, at(n, ...from));
  for (let i = 1; i <= 6; i++)
    pointer(
      "pointermove",
      capture,
      at(
        n,
        from[0] + ((to[0] - from[0]) * i) / 6,
        from[1] + ((to[1] - from[1]) * i) / 6,
      ),
    );
  pointer("pointerup", capture, at(n, ...to));
  await wait(80);
}
async function write(n, where, words, ink, points) {
  tool("note");
  if (ink) color(ink);
  if (points) size(points);
  const capture = layer().querySelector(".capture");
  pointer("pointerdown", capture, at(n, ...where));
  pointer("pointerup", capture, at(n, ...where));
  const input = await until(() =>
    [...layer().querySelectorAll(".note textarea")].at(-1),
  );
  input.focus();
  input.value = words;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );
  pointer("pointerdown", document.body, [4, 4]);
  await wait(80);
}
function finish(panel) {
  tool("select");
  getSelection().removeAllRanges();
  document.querySelector("#sidebar-toggle").click();
  if (panel) document.querySelector(`[data-panel="${panel}"]`).click();
  document.documentElement.dataset.demo = "ready";
}

const scenes = {
  async reader() {
    await highlight(
      1,
      "We extend AssetOpsBench with a Smart Grid Transformer asset class and four IEC-grounded diagnostic tools",
    );
    await write(
      1,
      [0.815, 0.5],
      "New asset class\n+ 4 IEC tools",
      "#d35e65",
      11,
    );
    await shape("arrow", 1, [0.83, 0.497], [0.775, 0.478], "#d35e65");
    finish("thumbnails");
  },
  async table() {
    await page(4);
    await shape("box", 4, [0.153, 0.08], [0.85, 0.41], "#6f9fc5");
    await write(
      4,
      [0.862, 0.085],
      "Four new\ndiagnostic\ntools",
      "#6f9fc5",
      11,
    );
    await highlight(4, "IEC 60599");
    finish("outline");
    // Open the first section with subsections to show the outline's depth.
    document.querySelector("#outline .outline-toggle")?.click();
  },
};

if (scenes[scene]) {
  await until(
    () =>
      toolbar() &&
      layer() &&
      document.querySelector('.page[data-page-number="1"] .textLayer span'),
  );
  await wait(600);
  await scenes[scene]();
}
