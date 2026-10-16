import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { paths, svgIcon } from "./icons.mjs";
import sharp from "sharp";
import { format } from "prettier";
import { build } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const extension = path.join(root, "extension");
const modules = path.join(root, "node_modules");
const bundled = paths;
const sourcePath = path.join(extension, "annotator.js");
let source = await fs.readFile(sourcePath, "utf8");
source = source.replace(
  /const icons = [\s\S]*?;\s*function svgIcon/,
  `const icons = ${JSON.stringify(bundled)};\nfunction svgIcon`,
);
await fs.writeFile(sourcePath, await format(source, { parser: "babel" }));

const svg = (name) => svgIcon(name, "#292929");
await fs.mkdir(path.join(extension, "icons"), { recursive: true });
await fs.mkdir(path.join(root, "docs/icons"), { recursive: true });
for (const name of Object.keys(paths)) {
  await fs.writeFile(path.join(root, "docs/icons", name + ".svg"), svg(name));
  await fs.writeFile(path.join(extension, "icons", name + ".svg"), svg(name));
}
await fs.writeFile(
  path.join(extension, "icons/check-light.svg"),
  svgIcon("check", "#fff"),
);
const viewerIcons = Object.fromEntries(
  Object.keys(paths).map((key) => [key, svgIcon(key)]),
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
  ["pdfjs-dist/web/pdf_viewer.mjs", "vendor/pdf_viewer.mjs"],
  ["pdfjs-dist/web/images", "vendor/images"],
  ["tesseract.js/dist/tesseract.esm.min.js", "vendor/tesseract.mjs"],
  ["tesseract.js/dist/worker.min.js", "vendor/ocr-worker.js"],
  [
    "tesseract.js/dist/worker.min.js.LICENSE.txt",
    "vendor/TESSERACT-LICENSE.txt",
  ],
  ["tesseract.js/LICENSE.md", "vendor/TESSERACT-JS-LICENSE.md"],
  ["tesseract.js-core/LICENSE", "vendor/TESSERACT-CORE-LICENSE.txt"],
  ["@tesseract.js-data/eng/README.md", "vendor/OCR-DATA-README.md"],
  [
    "tesseract.js-core/tesseract-core-simd-lstm.wasm.js",
    "vendor/tesseract-core-simd-lstm.wasm.js",
  ],
  [
    "tesseract.js-core/tesseract-core-simd-lstm.wasm",
    "vendor/tesseract-core-simd-lstm.wasm",
  ],
  [
    "@tesseract.js-data/eng/4.0.0/eng.traineddata.gz",
    "vendor/eng.traineddata.gz",
  ],
  ["pdf-lib/LICENSE.md", "vendor/PDF-LIB-LICENSE.md"],
  ["pdfjs-dist/cmaps", "vendor/cmaps"],
  ["pdfjs-dist/standard_fonts", "vendor/standard_fonts"],
  ["pdfjs-dist/LICENSE", "vendor/LICENSE"],
  [
    "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2",
    "vendor/geist.woff2",
  ],
  ["@fontsource-variable/geist/LICENSE", "vendor/GEIST-LICENSE.txt"],
];
for (const [from, to] of copies) {
  await fs.cp(path.join(modules, from), path.join(extension, to), {
    recursive: true,
  });
}
// PDF.js uses these filenames for document comments and embedded files.
// Keep its interaction layer, with our own artwork and visual language.
const annotationIcons = {
  check: "check",
  comment: "note",
  help: "help",
  insert: "plus",
  key: "key",
  newparagraph: "note",
  noicon: "note",
  note: "note",
  paperclip: "attachment",
  paragraph: "note",
  pushpin: "pin",
};
for (const [name, icon] of Object.entries(annotationIcons)) {
  await fs.writeFile(
    path.join(extension, "vendor/images", `annotation-${name}.svg`),
    svg(icon),
  );
}
await build({
  stdin: { contents: 'export * from "pdf-lib";', resolveDir: root },
  bundle: true,
  platform: "browser",
  format: "esm",
  minify: true,
  outfile: path.join(extension, "vendor/pdf-lib.mjs"),
});
console.log("Extension assets ready.");
