import {
  PDFDocument,
  PDFName,
  PDFHexString,
  rgb,
  degrees,
} from "./vendor/pdf-lib.mjs";

function color(value) {
  const hex = /^#[\da-f]{6}$/i.test(value) ? value.slice(1) : "292929";
  return rgb(...[0, 2, 4].map((n) => parseInt(hex.slice(n, n + 2), 16) / 255));
}

export async function exportPdf({ bytes, annotations, pageInfos, rasterize }) {
  let document,
    flattened = false;
  try {
    document = await PDFDocument.load(bytes);
  } catch (error) {
    if (!/encrypt/i.test(error.message) || !rasterize) throw error;
    document = await PDFDocument.create();
    flattened = true;
    for (let i = 0; i < pageInfos.length; i++) {
      const { png, width, height } = await rasterize(i);
      const image = await document.embedPng(png);
      document
        .addPage([width, height])
        .drawImage(image, { x: 0, y: 0, width, height });
    }
  }
  const pages = document.getPages();
  for (const item of annotations) {
    const index = Number(item.surface || item.anchor?.surface) - 1;
    if (!pages[index] || !pageInfos[index]) continue;
    const page = pages[index],
      info = pageInfos[index];
    const convert = (p) => {
      if (flattened)
        return [p[0] * page.getWidth(), (1 - p[1]) * page.getHeight()];
      return info.toPdf(p);
    };
    const ink = color(item.color),
      lineWidth = Math.max(0.5, item.pdfWidth || (item.width || 3) * 0.75);
    const line = (a, b, opacity = 1, width = lineWidth) =>
      page.drawLine({
        start: { x: a[0], y: a[1] },
        end: { x: b[0], y: b[1] },
        thickness: width,
        color: ink,
        opacity,
      });
    if (item.type === "highlight") {
      if (!item.quads?.length)
        throw new Error(
          "A highlight could not be located. Reopen its page before exporting.",
        );
      for (const quad of item.quads) {
        const pts = quad.map(convert);
        const path =
          pts.map((p, i) => (i ? "L" : "M") + p[0] + "," + -p[1]).join(" ") +
          "Z";
        page.drawSvgPath(path, { x: 0, y: 0, color: ink, opacity: 0.3 });
      }
    } else if (item.type === "note") {
      const [x, y] = convert(item.point);
      const note = document.context.obj({
        Type: "Annot",
        Subtype: "Text",
        Rect: [x, y - 18, x + 18, y],
        Contents: PDFHexString.fromText(item.text || ""),
        T: PDFHexString.fromText("Lasting Ink"),
        C: [ink.red, ink.green, ink.blue],
        Name: "Comment",
        F: 4,
        Open: false,
      });
      page.node.addAnnot(document.context.register(note));
    } else {
      const points = (item.points || []).map(convert);
      if (!points.length) continue;
      if (item.type === "box") {
        const [a, b] = [item.points[0], item.points.at(-1)];
        const corners = [a, [b[0], a[1]], b, [a[0], b[1]], a].map(convert);
        for (let i = 1; i < corners.length; i++)
          line(corners[i - 1], corners[i]);
      } else {
        for (let i = 1; i < points.length; i++)
          line(
            points[i - 1],
            points[i],
            item.type === "marker" ? 0.3 : 1,
            item.type === "marker" ? lineWidth * 5 : lineWidth,
          );
        if (item.type === "arrow" && points.length > 1) {
          const a = points.at(-2),
            b = points.at(-1),
            angle = Math.atan2(b[1] - a[1], b[0] - a[0]),
            length = 10 + lineWidth;
          for (const offset of [-0.5, 0.5])
            line(b, [
              b[0] - length * Math.cos(angle + offset),
              b[1] - length * Math.sin(angle + offset),
            ]);
        }
      }
    }
  }
  return { bytes: await document.save(), flattened };
}
