import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as icons from "@hugeicons/core-free-icons";
import sharp from "sharp";
import { format } from "prettier";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const extension = path.join(root, "extension");
const modules = path.join(root, "node_modules");
const names = {
  select: "Cursor02Icon",
  highlight: "TextSelectionIcon",
  pen: "Pen01Icon",
  marker: "HighlighterIcon",
  note: "StickyNote03Icon",
  box: "SquareIcon",
  arrow: "ArrowUpRight01Icon",
  erase: "EraserIcon",
  undo: "Undo02Icon",
  redo: "Redo02Icon",
  export: "Download04Icon",
  close: "Cancel01Icon",
  minus: "MinusSignIcon",
  grip: "DragDropVerticalIcon",
};
const bundled = Object.fromEntries(
  Object.entries(names).map(([key, name]) => {
    if (!icons[name]) throw new Error(`Missing icon: ${name}`);
    return [key, icons[name]];
  }),
);
const sourcePath = path.join(extension, "annotator.js");
let source = await fs.readFile(sourcePath, "utf8");
source = source.replace(
  /const icons = [\s\S]*?;\s*function svgIcon/,
  `const icons = ${JSON.stringify(bundled)};\nfunction svgIcon`,
);
await fs.writeFile(sourcePath, await format(source, { parser: "babel" }));

function svg(name, source = bundled) {
  const shapes = source[name]
    .map(([tag, attrs]) => {
      const attributes = Object.entries(attrs)
        .filter(([key]) => key !== "key")
        .map(
          ([key, value]) =>
            `${key.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())}="${value}"`,
        )
        .join(" ");
      return `<${tag} ${attributes}/>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" color="#292929" stroke="#292929" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${shapes}</svg>`;
}
await fs.mkdir(path.join(extension, "icons"), { recursive: true });
await fs.mkdir(path.join(root, "docs/icons"), { recursive: true });
for (const name of Object.keys(names)) {
  await fs.writeFile(path.join(root, "docs/icons", name + ".svg"), svg(name));
}
const viewerNames = {
  previous: "ArrowUp01Icon",
  next: "ArrowDown01Icon",
  minus: "MinusSignIcon",
  plus: "Add01Icon",
  download: "Download04Icon",
};
const viewerIcons = Object.fromEntries(
  Object.entries(viewerNames).map(([key, name]) => [
    key,
    svg(key, { [key]: icons[name] })
      .replaceAll('color="#292929"', 'color="inherit"')
      .replaceAll('stroke="#292929"', 'stroke="currentColor"'),
  ]),
);
await fs.writeFile(
  path.join(extension, "viewer-icons.js"),
  await format(
    "export const viewerIcons = " + JSON.stringify(viewerIcons) + ";",
    { parser: "babel" },
  ),
);
const brand = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect x="1" y="1" width="126" height="126" rx="32" fill="#fff" stroke="#e8e8e8"/><svg x="30" y="30" width="68" height="68" viewBox="0 0 24 24">${svg(
  "pen",
)
  .replace(
    /^<svg[^>]*>/,
    '<g fill="none" color="#292929" stroke="#292929" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">',
  )
  .replace(/<\/svg>$/, "</g>")}</svg></svg>`;
for (const size of [16, 32, 48, 128]) {
  await sharp(Buffer.from(brand))
    .resize(size, size)
    .png()
    .toFile(path.join(extension, "icons", `icon-${size}.png`));
}
const copies = [
  ["pdfjs-dist/build/pdf.mjs", "vendor/pdf.mjs"],
  ["pdfjs-dist/build/pdf.worker.mjs", "vendor/pdf.worker.mjs"],
  ["pdfjs-dist/web/pdf_viewer.css", "vendor/pdf_viewer.css"],
  ["pdfjs-dist/cmaps", "vendor/cmaps"],
  ["pdfjs-dist/standard_fonts", "vendor/standard_fonts"],
  ["pdfjs-dist/LICENSE", "vendor/LICENSE"],
  [
    "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2",
    "vendor/geist.woff2",
  ],
  ["@fontsource-variable/geist/LICENSE", "vendor/GEIST-LICENSE.txt"],
  ["@hugeicons/core-free-icons/LICENSE.md", "vendor/HUGEICONS-LICENSE.txt"],
];
for (const [from, to] of copies) {
  await fs.cp(path.join(modules, from), path.join(extension, to), {
    recursive: true,
  });
}
console.log("Extension assets ready.");
