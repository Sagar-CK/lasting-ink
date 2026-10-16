(() => {
  if (globalThis.startLastingInk) return;
  const NS = "http://www.w3.org/2000/svg";
  const palette = [
    "#292929",
    "#767676",
    "#d35e65",
    "#d49b49",
    "#efd27f",
    "#6b987b",
    "#6f9fc5",
    "#9684b6",
  ];
  // Hugeicons free stroke set (MIT), bundled locally.
  const icons = {
    select: [
      [
        "path",
        {
          d: "M9.80282 4.62973L15.8364 6.99069C19.3164 8.35243 21.0564 9.03329 20.9987 10.1133C20.941 11.1934 19.1251 11.6886 15.4933 12.6791C14.412 12.974 13.8713 13.1215 13.4964 13.4963C13.1215 13.8712 12.9741 14.4119 12.6791 15.4933C11.6887 19.125 11.1934 20.9409 10.1134 20.9986C9.03335 21.0563 8.35249 19.3163 6.99075 15.8363L4.62979 9.80276C3.20411 6.15934 2.49127 4.33764 3.41448 3.41442C4.3377 2.49121 6.15941 3.20405 9.80282 4.62973Z",
          stroke: "currentColor",
          strokeLinejoin: "round",
          strokeWidth: "1.5",
          key: "0",
        },
      ],
    ],
    highlight: [
      [
        "path",
        {
          d: "M2.99792 3.02212C5.19555 2.97 6.26962 2.90514 6.99792 4.51533M6.99792 4.51533C7.55517 3.2634 8.38712 2.90727 10.9979 3.02212M6.99792 4.51533V18.9497M6.99792 18.9497C7.22891 20.6878 8.13357 21.1034 10.9979 20.9406M6.99792 18.9497C6.6944 20.7313 5.77226 21.1738 2.99792 20.9406M3.99792 11.9814H9.99792",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "1.5",
          key: "0",
        },
      ],
      [
        "path",
        {
          d: "M20.9698 15.9631V20.4428M20.9698 15.9631C21.017 15.1437 21.0187 14.5196 20.92 14.0101C20.6874 12.8091 19.4287 12.0854 18.2108 11.9382C17.0451 11.7973 16.1094 12.0965 15.1629 13.4715M20.9698 15.9631L18.1305 15.9631C17.6943 15.9631 17.2543 15.9841 16.834 16.1006C14.2653 16.8125 14.4536 20.404 17.0299 20.8467C17.316 20.8959 17.6082 20.9169 17.8979 20.904C18.5745 20.8739 19.1988 20.5481 19.7345 20.135C20.3621 19.6511 20.9698 18.9757 20.9698 17.9541V15.9631Z",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "1.5",
          key: "1",
        },
      ],
    ],
    pen: [
      [
        "path",
        {
          d: "M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "1.5",
          key: "0",
        },
      ],
      [
        "path",
        {
          d: "M13.5 6.5L17.5 10.5",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "1.5",
          key: "1",
        },
      ],
    ],
    marker: [
      [
        "path",
        {
          d: "M6.6777 16.2071L8.79289 18.3223M6.6777 16.2071L2.5 20.5H6.5L8.79289 18.3223M6.6777 16.2071C6.28717 15.8166 6.29534 15.1872 6.63537 14.752C7.42742 13.7383 7.71531 12.8216 7.79924 12.1382C7.89158 11.3863 8.07366 10.5734 8.60933 10.0377L9.50122 9.14828M8.79289 18.3223C9.18342 18.7128 9.81278 18.7047 10.248 18.3646C11.2617 17.5726 12.1784 17.2847 12.8618 17.2008C13.6137 17.1084 14.4266 16.9263 14.9623 16.3907L15.8517 15.4988M15.8517 15.4988L9.50122 9.14828M15.8517 15.4988C16.2422 15.8893 16.8754 15.8893 17.2659 15.4988L21.5 11.2647M9.50122 9.14828C9.1107 8.75776 9.1107 8.12459 9.50122 7.73407L13.7353 3.5",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "1.5",
          key: "0",
        },
      ],
    ],
    note: [
      [
        "path",
        {
          d: "M14 20.5V20C14 17.1716 14 15.7574 14.8787 14.8787C15.7574 14 17.1716 14 20 14H20.5",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "1.5",
          key: "0",
        },
      ],
      [
        "path",
        {
          d: "M13 3H11C7.22876 3 5.34315 3 4.17157 4.17157C3 5.34315 3 7.22876 3 11V13C3 16.7712 3 18.6569 4.17157 19.8284C5.34315 21 7.22876 21 11 21H12.3431C13.1606 21 13.5694 21 13.9369 20.8478C14.3045 20.6955 14.5935 20.4065 15.1716 19.8284L19.8284 15.1716C20.4065 14.5935 20.6955 14.3045 20.8478 13.9369C21 13.5694 21 13.1606 21 12.3431V11C21 7.22876 21 5.34315 19.8284 4.17157C18.6569 3 16.7712 3 13 3Z",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "1.5",
          key: "1",
        },
      ],
    ],
    box: [
      [
        "path",
        {
          d: "M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z",
          stroke: "currentColor",
          strokeWidth: "1.5",
          key: "0",
        },
      ],
    ],
    arrow: [
      [
        "path",
        {
          d: "M9 6.65032C9 6.65032 15.9383 6.10759 16.9154 7.08463C17.8924 8.06167 17.3496 15 17.3496 15M16.5 7.5L6.5 17.5",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "1.5",
          key: "0",
        },
      ],
    ],
    erase: [
      [
        "path",
        {
          d: "M8.73792 7.78021L4.84693 11.7574C3.67722 12.953 3.09236 13.5508 3.01263 14.2802C2.99579 14.4343 2.99579 14.5899 3.01263 14.744C3.09236 15.4733 3.67722 16.0711 4.84693 17.2668L4.99601 17.4191C5.62049 18.0575 5.93274 18.3766 6.30638 18.5911C6.5236 18.7157 6.75482 18.8134 6.99505 18.882C7.40827 19 7.85149 19 8.73792 19C9.62436 19 10.0676 19 10.4808 18.882C10.721 18.8134 10.9522 18.7157 11.1695 18.5911C11.5431 18.3766 11.8554 18.0575 12.4798 17.4191L15.3239 14.5121M8.73792 7.78021L12.3199 4.12313C13.7065 2.70754 14.3997 1.99974 15.2627 2C16.1256 2.00026 16.8185 2.70846 18.2042 4.12487L18.9473 4.8845C20.3159 6.28342 21.0002 6.98288 21 7.85008C20.9997 8.71728 20.315 9.41633 18.9456 10.8144L15.3239 14.5121M8.73792 7.78021L15.3239 14.5121",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "1.5",
          key: "0",
        },
      ],
      [
        "path",
        {
          d: "M10 22L21 22",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "1.5",
          key: "1",
        },
      ],
    ],
    undo: [
      [
        "path",
        {
          d: "M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C8.66873 3 5.76018 4.80989 4.20404 7.5",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "1.5",
          key: "0",
        },
      ],
      [
        "path",
        {
          d: "M3 3V4.27816C3 6.47004 3 7.56599 3.70725 8.16512C4.4145 8.76425 5.49553 8.58408 7.6576 8.22373L9 8",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "1.5",
          key: "1",
        },
      ],
    ],
    redo: [
      [
        "path",
        {
          d: "M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C15.3313 3 18.2398 4.80989 19.796 7.5",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "1.5",
          key: "0",
        },
      ],
      [
        "path",
        {
          d: "M20.9991 3V4.27816C20.9991 6.47004 20.9991 7.56599 20.2918 8.16512C19.5846 8.76425 18.5036 8.58408 16.3415 8.22373L14.9991 8",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "1.5",
          key: "1",
        },
      ],
    ],
    export: [
      [
        "path",
        {
          d: "M16.9504 12.1817C17.1981 12.814 16.5076 13.5726 15.1267 15.0899C13.6702 16.6902 12.9201 17.4904 12 17.5C11.0799 17.4904 10.3298 16.6902 8.87331 15.0899C7.49239 13.5726 6.80193 12.814 7.04964 12.1817C7.05868 12.1586 7.06851 12.1359 7.0791 12.1135C7.34928 11.542 8.24477 11.5029 10 11.5002V4.99998C10 4.53501 10 4.30253 10.0511 4.11179C10.1898 3.59414 10.5941 3.1898 11.1118 3.05111C11.3025 3 11.535 3 12 3C12.4649 3 12.6974 3 12.8882 3.05111C13.4058 3.1898 13.8102 3.59414 13.9489 4.11179C14 4.30253 14 4.53501 14 4.99998V11.5002C15.7552 11.5029 16.6507 11.542 16.9209 12.1135C16.9315 12.1359 16.9413 12.1586 16.9504 12.1817Z",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "1.5",
          key: "0",
        },
      ],
      [
        "path",
        {
          d: "M5.00006 21H19.0001",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "1.5",
          key: "1",
        },
      ],
    ],
    close: [
      [
        "path",
        {
          d: "M18 6L6.00081 17.9992M17.9992 18L6 6.00085",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "1.5",
          key: "0",
        },
      ],
    ],
    minus: [
      [
        "path",
        {
          d: "M20 12L4 12",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "1.5",
          key: "0",
        },
      ],
    ],
    grip: [
      [
        "path",
        {
          d: "M16 6C16 6.55228 15.5523 7 15 7C14.4477 7 14 6.55228 14 6C14 5.44772 14.4477 5 15 5C15.5523 5 16 5.44772 16 6Z",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "1.5",
          key: "0",
        },
      ],
      [
        "path",
        {
          d: "M10 6C10 6.55228 9.55228 7 9 7C8.44772 7 8 6.55228 8 6C8 5.44772 8.44772 5 9 5C9.55228 5 10 5.44772 10 6Z",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "1.5",
          key: "1",
        },
      ],
      [
        "path",
        {
          d: "M16 18C16 18.5523 15.5523 19 15 19C14.4477 19 14 18.5523 14 18C14 17.4477 14.4477 17 15 17C15.5523 17 16 17.4477 16 18Z",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "1.5",
          key: "2",
        },
      ],
      [
        "path",
        {
          d: "M16 12C16 12.5523 15.5523 13 15 13C14.4477 13 14 12.5523 14 12C14 11.4477 14.4477 11 15 11C15.5523 11 16 11.4477 16 12Z",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "1.5",
          key: "3",
        },
      ],
      [
        "path",
        {
          d: "M10 18C10 18.5523 9.55228 19 9 19C8.44772 19 8 18.5523 8 18C8 17.4477 8.44772 17 9 17C9.55228 17 10 17.4477 10 18Z",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "1.5",
          key: "4",
        },
      ],
      [
        "path",
        {
          d: "M10 12C10 12.5523 9.55228 13 9 13C8.44772 13 8 12.5523 8 12C8 11.4477 8.44772 11 9 11C9.55228 11 10 11.4477 10 12Z",
          stroke: "currentColor",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "1.5",
          key: "5",
        },
      ],
    ],
  };
  function svgIcon(name) {
    const attrs = (a) =>
      Object.entries(a)
        .filter(([k]) => k !== "key")
        .map(
          ([k, v]) =>
            k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()) + '="' + v + '"',
        )
        .join(" ");
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      icons[name]
        .map(([tag, a]) => "<" + tag + " " + attrs(a) + "></" + tag + ">")
        .join("") +
      "</svg>"
    );
  }
  function canonical(url, pdf = false) {
    const u = new URL(url);
    if (pdf || u.hash.startsWith("#:~:text=")) u.hash = "";
    return u.href;
  }
  function el(tag, attrs = {}) {
    const node = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    return node;
  }
  function textMap(root) {
    let text = "",
      nodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const p = n.parentElement;
        return !p ||
          p.closest(
            'script,style,noscript,textarea,input,select,[contenteditable="true"],[data-lasting-ink]',
          ) ||
          !n.textContent
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT;
      },
    });
    let n;
    while ((n = walker.nextNode())) {
      nodes.push({ node: n, start: text.length, end: text.length + n.length });
      text += n.textContent;
    }
    return { text, nodes };
  }
  function locate(map, a) {
    let start = a.start;
    if (map.text.slice(start, start + a.quote.length) !== a.quote) {
      let best = -1,
        bestScore = -Infinity,
        pos = map.text.indexOf(a.quote);
      while (pos !== -1) {
        const pre = map.text.slice(
            Math.max(0, pos - (a.prefix || "").length),
            pos,
          ),
          post = map.text.slice(
            pos + a.quote.length,
            pos + a.quote.length + (a.suffix || "").length,
          );
        const score =
          (pre === a.prefix ? 10000 : 0) +
          (post === a.suffix ? 10000 : 0) -
          Math.abs(pos - a.start);
        if (score > bestScore) {
          best = pos;
          bestScore = score;
        }
        pos = map.text.indexOf(a.quote, pos + 1);
      }
      if (best < 0) return null;
      start = best;
    }
    const end = start + a.quote.length,
      s = map.nodes.find((n) => n.end > start),
      e = map.nodes.find((n) => n.end >= end);
    if (!s || !e) return null;
    const range = document.createRange();
    range.setStart(s.node, start - s.start);
    range.setEnd(e.node, end - e.start);
    return range;
  }
  function selector(node) {
    if (node.id) return "#" + CSS.escape(node.id);
    const parts = [];
    while (node && node !== document.body && parts.length < 7) {
      const tag = node.localName;
      let i = 1;
      for (let n = node.previousElementSibling; n; n = n.previousElementSibling)
        if (n.localName === tag) i++;
      parts.unshift(tag + ":nth-of-type(" + i + ")");
      node = node.parentElement;
    }
    return (node === document.body ? "body > " : "") + parts.join(" > ");
  }
  globalThis.startLastingInk = async function ({
    url,
    surfaces,
    pdf = false,
    topInset = 0,
    onTopInsetChange = () => {},
    toolbarMount = null,
    storageKey = null,
    viewportElement = null,
    onChange = () => {},
  }) {
    let currentUrl = canonical(url, pdf),
      prefix = "lasting-ink:v1:" + (storageKey || currentUrl) + "|",
      items = new Map(),
      undo = [],
      redo = [],
      mode = "select",
      color = palette[0],
      inkColor = palette[0],
      highlightColor = "#efd27f",
      width = 3,
      hidden = false;
    let maps = new Map(),
      dirty = true,
      frame = 0,
      active = null,
      savedCount = 0,
      saveError = false,
      loadGeneration = 0,
      selectedId = null;
    const pendingSaves = new Set();
    if (typeof FontFace !== "undefined") {
      const face = new FontFace(
        "Lasting Ink Geist",
        'url("' + chrome.runtime.getURL("vendor/geist.woff2") + '")',
        { weight: "100 900" },
      );
      face
        .load()
        .then((font) => document.fonts.add(font))
        .catch(() => {});
    }
    const host = document.createElement("div");
    host.dataset.lastingInk = "true";
    if (pdf) host.dataset.pdf = "true";
    host.style.cssText =
      "position:fixed!important;inset:0!important;z-index:2147483646!important;pointer-events:none!important;display:block!important;contain:layout style!important;";
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>
    :host{all:initial;color:#282828;font-family:"Lasting Ink Geist",Geist,Arial,sans-serif;font-size:13px;-webkit-font-smoothing:antialiased}
    *{box-sizing:border-box}button,input,textarea,select{font:inherit}button{cursor:pointer}button:focus-visible,input:focus-visible,textarea:focus-visible{outline:2px solid #737373;outline-offset:2px}
    .overlay{position:fixed;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}
    .capture{position:fixed;inset:0;pointer-events:none;touch-action:none}.capture.on{pointer-events:auto;cursor:crosshair}.capture.erase{cursor:cell}
    .toolbar{pointer-events:auto;position:fixed;left:50%;bottom:24px;transform:translateX(-50%);display:flex;align-items:center;gap:2px;padding:6px;border-radius:28px;background:#fff;box-shadow:0 0 0 1px #0000000a,0 2px 6px #00000008,0 8px 28px #00000012;max-width:calc(100vw - 24px)}
    .tools{display:flex;gap:2px}.tool{background:transparent;border:0;color:#777;border-radius:50%;min-width:40px;width:40px;height:40px;display:grid;place-items:center;padding:10px;transition:background .12s,color .12s,transform .12s}.tool svg{width:20px;height:20px}.tool:hover{background:#f4f4f4;color:#242424}.tool:active{transform:scale(.96)}.tool[aria-pressed=true]{background:#ededed;color:#111}.tool:disabled{opacity:.26;cursor:default}.tool:disabled:hover{background:transparent}
    .divider{width:1px;height:19px;background:#ededed;margin:0 4px}.color-dot{width:19px;height:19px;background:var(--ink,#292929);border-radius:50%;box-shadow:inset 0 0 0 1px #00000012}.width-dot{display:block;width:var(--width,3px);height:var(--width,3px);background:currentColor;border-radius:50%}
    .popover{pointer-events:auto;position:absolute;bottom:62px;right:110px;display:flex;gap:4px;padding:8px;border-radius:18px;background:#fff;box-shadow:0 0 0 1px #0000000a,0 8px 30px #00000016}.popover button{border:0;background:transparent;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;color:#444;cursor:pointer}.popover button:hover{background:#f0f0f0}.popover button[aria-pressed=true]{box-shadow:inset 0 0 0 1px #d4d4d4}.swatch{width:20px;height:20px;border-radius:50%;background:var(--swatch);box-shadow:inset 0 0 0 1px #0000000c}.custom-color{width:32px;height:32px;border:0;padding:6px;cursor:pointer;background:transparent;border-radius:50%}.custom-color::-webkit-color-swatch-wrapper{padding:0}.custom-color::-webkit-color-swatch{border:1px solid #ddd;border-radius:50%}.width-popover{right:98px}
    .hint{pointer-events:none;position:fixed;bottom:87px;left:50%;transform:translateX(-50%);padding:8px 13px;border-radius:12px;background:#262626;color:white;font-size:12px;white-space:nowrap;opacity:0;transition:opacity .15s}.hint.show{opacity:1}
    .notes{position:fixed;inset:0;pointer-events:none}.note{position:absolute;pointer-events:auto;width:220px;background:#fff;box-shadow:0 0 0 1px #0000000b,0 3px 8px #00000006,0 10px 24px #0000000d;border-radius:14px;overflow:hidden;color:#303030}.note-head{height:30px;padding:4px 6px 0 10px;display:flex;align-items:center;justify-content:space-between;cursor:grab;user-select:none;color:#b5b5b5}.note-head:active{cursor:grabbing}.note-head>svg{width:14px;height:14px}.note-head>div{display:flex;gap:1px}.note-head button{display:grid;place-items:center;width:25px;height:25px;padding:5px;border:0;background:transparent;color:#999;border-radius:50%}.note-head button:hover{background:#f1f1f1;color:#444}.note-head button svg{width:14px;height:14px}.note textarea{display:block;resize:vertical;min-height:100px;width:100%;padding:4px 14px 14px;border:0;outline:none;background:transparent;color:inherit;line-height:1.55;font-size:13px}.note textarea::placeholder{color:#aaa}.note.collapsed textarea{display:none}.note.collapsed{width:110px}
    .launcher{position:fixed;right:22px;bottom:22px;pointer-events:auto;display:grid;place-items:center;width:44px;height:44px;padding:12px;background:#fff;color:#555;border:0;border-radius:50%;box-shadow:0 0 0 1px #0000000a,0 3px 14px #00000012}.launcher:hover{color:#111;background:#fafafa}.launcher svg{width:20px;height:20px}.hidden{display:none!important}.status{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
    @media(max-width:650px){.toolbar{gap:0;padding:4px;bottom:12px;flex-wrap:wrap;justify-content:center;border-radius:23px}.tools{gap:0}.tool{min-width:36px;width:36px;height:36px;padding:9px}.divider{margin:0 2px}.hint{bottom:100px}.popover{right:10px;bottom:58px}}
    :host([data-pdf]) .toolbar{top:48px;bottom:auto;left:0;transform:none;width:100%;max-width:none;min-height:52px;justify-content:center;flex-wrap:wrap;border-radius:0;background:#fafafa;box-shadow:0 1px 0 #00000009}
    :host([data-pdf]) .tools{flex-wrap:wrap;justify-content:center}
    :host([data-pdf]) .popover{top:calc(100% + 8px);bottom:auto;right:8px;max-width:calc(100vw - 16px);flex-wrap:wrap}
    :host([data-pdf]) .launcher{top:48px;bottom:auto;right:8px;width:44px;height:44px;border-radius:0 0 14px 14px;background:#fafafa}
    :host([data-pdf]) .hint{top:calc(var(--ink-top-inset,100px) + 8px);bottom:auto;max-width:calc(100vw - 24px);white-space:normal}
    @media(prefers-reduced-motion:reduce){*{transition:none!important}}
    </style><svg class="overlay" aria-hidden="true"></svg><div class="capture"></div><div class="notes"></div><div class="hint" role="status"></div><div class="toolbar" role="toolbar" aria-label="Lasting Ink annotation tools"><div class="tools">${[
      ["select", "Select (V)"],
      ["highlight", "Highlight text (H)"],
      ["pen", "Draw (P)"],
      ["marker", "Highlighter (M)"],
      ["note", "Add comment (N)"],
      ["box", "Rectangle (R)"],
      ["arrow", "Arrow (A)"],
      ["erase", "Eraser (E)"],
    ]
      .map(
        ([id, label]) =>
          `<button class="tool" data-mode="${id}" title="${label}" aria-label="${label}" aria-pressed="${id === "select"}">${svgIcon(id)}</button>`,
      )
      .join(
        "",
      )}</div><div class="divider"></div><button class="tool color-button" data-action="color" title="Color" aria-label="Ink color" aria-expanded="false"><span class="color-dot"></span></button><button class="tool width-button" data-action="width" title="Stroke size" aria-label="Stroke size" aria-expanded="false"><span class="width-dot"></span></button><div class="popover color-popover hidden" role="group" aria-label="Colors">${palette.map((c) => `<button data-color="${c}" aria-label="Color ${c}" aria-pressed="${c === color}"><span class="swatch" style="--swatch:${c}"></span></button>`).join("")}<input class="custom-color" type="color" value="${color}" title="Custom color" aria-label="Custom color"></div><div class="popover width-popover hidden" role="group" aria-label="Stroke sizes">${[2, 3, 5, 8].map((w) => `<button data-width="${w}" aria-label="${w} pixel stroke" aria-pressed="${w === width}"><span class="width-dot" style="--width:${w}px"></span></button>`).join("")}</div><div class="divider"></div><button class="tool" data-action="undo" title="Undo (Cmd/Ctrl+Z)" aria-label="Undo last annotation">${svgIcon("undo")}</button><button class="tool" data-action="redo" title="Redo (Cmd/Ctrl+Shift+Z)" aria-label="Redo annotation">${svgIcon("redo")}</button><button class="tool" data-action="export" title="Export annotations as JSON" aria-label="Export annotations as JSON">${svgIcon("export")}</button><button class="tool" data-action="hide" title="Collapse toolbar" aria-label="Collapse toolbar">${svgIcon("close")}</button></div><button class="launcher hidden" title="Annotate" aria-label="Open annotation tools">${svgIcon("pen")}</button><span class="status" role="status"></span>`;
    document.documentElement.append(host);
    let dockShadow;
    if (toolbarMount) {
      const dock = document.createElement("div");
      dock.dataset.lastingInk = "true";
      dock.style.cssText = "display:flex;justify-content:center;min-width:0";
      dockShadow = dock.attachShadow({ mode: "open" });
      dockShadow.append(shadow.querySelector("style").cloneNode(true));
      const style = document.createElement("style");
      style.textContent = `
        .toolbar{position:relative;inset:auto;transform:none;max-width:none;min-height:32px;padding:0;gap:4px;border-radius:8px;background:transparent;box-shadow:none;flex-wrap:nowrap}
        .tools{gap:4px}.tool{width:32px;min-width:32px;height:32px;padding:8px;border-radius:6px}.tool svg{width:16px;height:16px}
        .divider{height:16px;margin:0 4px}.color-dot{width:16px;height:16px}
        .popover{top:calc(100% + 12px);bottom:auto;right:0;padding:8px;border-radius:10px;gap:4px;max-width:calc(100vw - 24px);flex-wrap:wrap}
        .more-popover{right:auto;left:0;min-width:164px;flex-direction:column;gap:4px}
        .more-popover .tool{width:100%;justify-content:start;display:flex;gap:8px;height:32px;padding:8px;border-radius:6px}
        .more-popover .tool:hover,.more-popover .tool[aria-pressed=true]{border-radius:6px;background:#f1f1f1}
        .more-popover .tool span{font-size:12px;white-space:nowrap}
        .more-button{font-size:20px;line-height:1}
        .launcher{position:static;width:32px;height:32px;padding:8px;border-radius:6px;background:transparent;box-shadow:none}
        @media(max-width:600px){.toolbar,.tools{gap:2px}.tool{width:28px;min-width:28px}.divider{margin:0 2px}}
        @media(max-width:340px){.tool{width:24px;min-width:24px;padding:4px}}
      `;
      dockShadow.append(
        style,
        shadow.querySelector(".toolbar"),
        shadow.querySelector(".launcher"),
      );
      toolbarMount.append(dock);
      dockShadow.querySelector('[data-action="hide"]').remove();
      const more = document.createElement("button");
      more.className = "tool more-button";
      more.dataset.action = "more";
      more.title = "More drawing tools";
      more.setAttribute("aria-label", "More drawing tools");
      more.setAttribute("aria-expanded", "false");
      more.textContent = "⋯";
      const menu = document.createElement("div");
      menu.className = "popover more-popover hidden";
      menu.setAttribute("role", "group");
      menu.setAttribute("aria-label", "More drawing tools");
      for (const [mode, label] of [
        ["marker", "Highlighter"],
        ["box", "Rectangle"],
        ["arrow", "Arrow"],
      ]) {
        const button = dockShadow.querySelector(`[data-mode="${mode}"]`);
        const text = document.createElement("span");
        text.textContent = label;
        button.append(text);
        menu.append(button);
      }
      dockShadow.querySelector(".tools").append(more);
      dockShadow.querySelector(".toolbar").append(menu);
    }
    const roots = dockShadow ? [shadow, dockShadow] : [shadow];
    const all = (s) => roots.flatMap((root) => [...root.querySelectorAll(s)]);
    const $ = (s) => roots.map((root) => root.querySelector(s)).find(Boolean),
      overlay = $(".overlay"),
      capture = $(".capture"),
      notes = $(".notes");
    if (pdf) $('[data-action="export"]').remove();
    function clipToViewport() {
      if (!viewportElement) return;
      const r = viewportElement.getBoundingClientRect();
      capture.style.inset = `${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px`;
      overlay.style.clipPath =
        notes.style.clipPath = `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px)`;
    }
    function updateTopInset() {
      const inset = toolbarMount
        ? toolbarMount.closest("header").getBoundingClientRect().bottom
        : pdf
          ? topInset +
            (hidden ? 44 : $(".toolbar").getBoundingClientRect().height)
          : topInset;
      capture.style.top = inset + "px";
      overlay.style.clipPath = notes.style.clipPath = `inset(${inset}px 0 0 0)`;
      host.style.setProperty("--ink-top-inset", inset + "px");
      onTopInsetChange(inset);
      clipToViewport();
      request();
    }
    if (pdf || topInset) {
      updateTopInset();
      if (pdf)
        new ResizeObserver(updateTopInset).observe(
          toolbarMount ? toolbarMount.closest("header") : $(".toolbar"),
        );
    }
    let hintTimer;
    function hint(text, sticky = false) {
      $(".hint").textContent = text;
      $(".hint").classList.add("show");
      clearTimeout(hintTimer);
      if (!sticky)
        hintTimer = setTimeout(() => $(".hint").classList.remove("show"), 2600);
    }
    function status() {
      $(".status").textContent = saveError
        ? "Could not save. Export a backup."
        : "";
      $(".toolbar").setAttribute("aria-busy", savedCount ? "true" : "false");
      $('[data-action="undo"]').disabled = !undo.length;
      $('[data-action="redo"]').disabled = !redo.length;
    }
    async function load() {
      const g = ++loadGeneration,
        pre = prefix;
      const all = await chrome.storage.local.get(null);
      if (g !== loadGeneration) return;
      items = new Map(
        Object.entries(all)
          .filter(([k]) => k.startsWith(pre))
          .map(([, v]) => [v.id, v]),
      );
      status();
      request();
    }
    async function writeItem(id, item) {
      savedCount++;
      status();
      const key = prefix + id;
      try {
        if (item) await chrome.storage.local.set({ [key]: item });
        else await chrome.storage.local.remove(key);
        saveError = false;
      } catch (e) {
        saveError = true;
        hint("Could not save. Export a backup before closing.", true);
        console.error("Lasting Ink save:", e);
      } finally {
        savedCount--;
        status();
      }
    }
    function persist(id, item) {
      const promise = writeItem(id, item);
      pendingSaves.add(promise);
      promise.finally(() => pendingSaves.delete(promise));
      return promise;
    }
    function change(id, value, record = true) {
      const prev = items.get(id);
      if (record) {
        undo.push({
          id,
          before: prev ? structuredClone(prev) : null,
          after: value ? structuredClone(value) : null,
        });
        redo = [];
      }
      if (value) {
        value.updated = Date.now();
        items.set(id, value);
      } else {
        items.delete(id);
        if (selectedId === id) selectedId = null;
      }
      persist(id, value);
      onChange([...items.values()]);
      status();
      request();
    }
    function add(data) {
      const item = {
        ...data,
        id: crypto.randomUUID(),
        created: Date.now(),
        url: currentUrl,
        ...(storageKey ? { documentId: storageKey } : {}),
      };
      change(item.id, item);
      return item;
    }
    function setMode(next) {
      mode = next;
      capture.className =
        "capture" +
        (["pen", "marker", "note", "box", "arrow", "erase"].includes(mode)
          ? " on"
          : "") +
        (mode === "erase" ? " erase" : "");
      all("[data-mode]").forEach((b) =>
        b.setAttribute("aria-pressed", b.dataset.mode === mode),
      );
      color = ["highlight", "marker"].includes(mode)
        ? highlightColor
        : inkColor;
      syncControls();
      closePopovers();
      request();
    }
    function toggle() {
      if (toolbarMount) {
        setMode("select");
        return;
      }
      hidden = !hidden;
      $(".toolbar").classList.toggle("hidden", hidden);
      $(".launcher").classList.toggle("hidden", !hidden);
      if (hidden) setMode("select");
      if (pdf) updateTopInset();
    }
    function surface(id) {
      return surfaces().find((s) => s.id === id);
    }
    function mapFor(s) {
      if (!maps.has(s.id))
        maps.set(
          s.id,
          textMap(
            pdf
              ? s.element.querySelector(".textLayer") || s.element
              : s.element,
          ),
        );
      return maps.get(s.id);
    }
    function anchorAt(x, y, s) {
      if (pdf) return { kind: "page", surface: s.id };
      host.style.setProperty("visibility", "hidden", "important");
      let target = document.elementFromPoint(x, y);
      host.style.removeProperty("visibility");
      target =
        target?.closest(
          "p,h1,h2,h3,h4,h5,h6,li,article,section,main,figure,img,table,div",
        ) || document.body;
      // Margin ink follows the nearest content block when a page reflows.
      if (target.matches("body,main,article,section,div")) {
        let nearest = null,
          distance = 180;
        for (const node of target.querySelectorAll(
          "p,h1,h2,h3,h4,h5,h6,li,figure,pre,table,img",
        )) {
          const r = node.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          const d = Math.hypot(
            Math.max(r.left - x, 0, x - r.right),
            Math.max(r.top - y, 0, y - r.bottom),
          );
          if (d < distance) {
            distance = d;
            nearest = node;
          }
        }
        if (nearest) target = nearest;
      }
      const rect = target.getBoundingClientRect();
      if (target === document.body || rect.width < 10 || rect.height < 10)
        return { kind: "document", surface: "web" };
      return {
        kind: "element",
        surface: "web",
        selector: selector(target),
        sample: target.textContent.trim().slice(0, 90),
        fallback: {
          x: rect.left + scrollX,
          y: rect.top + scrollY,
          w: rect.width,
        },
      };
    }
    function base(a) {
      if (a.kind === "page") {
        const r = surface(a.surface)?.element.getBoundingClientRect();
        return r ? { x: r.left, y: r.top, w: r.width, h: r.height } : null;
      }
      if (a.kind === "element") {
        let node;
        try {
          node = document.querySelector(a.selector);
        } catch {}
        if (
          node &&
          a.sample &&
          !node.id &&
          !node.textContent.trim().startsWith(a.sample)
        )
          node = null;
        if (!node && a.sample) {
          const matches = [
            ...document.querySelectorAll(
              "p,h1,h2,h3,h4,h5,h6,li,figure,pre,table",
            ),
          ].filter((n) => n.textContent.trim().startsWith(a.sample));
          if (matches.length === 1) node = matches[0];
        }
        if (node) {
          const r = node.getBoundingClientRect();
          return { x: r.left, y: r.top, w: r.width, h: r.width };
        }
        const f = a.fallback;
        return { x: f.x - scrollX, y: f.y - scrollY, w: f.w, h: f.w };
      }
      return {
        x: -scrollX,
        y: -scrollY,
        w: document.documentElement.clientWidth,
        h: document.documentElement.clientWidth,
      };
    }
    function point(x, y, a) {
      if (a.kind === "page" && surface(a.surface)?.toNormalized)
        return surface(a.surface).toNormalized(x, y);
      const b = base(a);
      return [(x - b.x) / b.w, (y - b.y) / b.h];
    }
    function xy(p, a) {
      if (a.kind === "page" && surface(a.surface)?.toScreen)
        return surface(a.surface).toScreen(p);
      const b = base(a);
      return b ? [b.x + p[0] * b.w, b.y + p[1] * b.h] : null;
    }
    function surfaceAt(x, y) {
      return surfaces().find((s) => {
        const r = s.element.getBoundingClientRect();
        return (
          !pdf || (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom)
        );
      });
    }
    function pathFor(a) {
      const pts = a.points.map((p) => xy(p, a.anchor));
      if (!pts[0]) return "";
      if (a.type === "box") {
        const [p, q] = [a.points[0], a.points.at(-1)];
        return (
          [p, [q[0], p[1]], q, [p[0], q[1]]]
            .map((v, i) => (i ? "L" : "M") + xy(v, a.anchor).join(","))
            .join(" ") + "Z"
        );
      }
      let d = pts.map((p, i) => (i ? "L" : "M") + p.join(",")).join(" ");
      if (a.type === "arrow" && pts.length > 1) {
        const p = pts[0],
          q = pts.at(-1),
          theta = Math.atan2(q[1] - p[1], q[0] - p[0]),
          len = 14 + a.width;
        d = `M${p}L${q}M${q[0] - len * Math.cos(theta - 0.5)},${q[1] - len * Math.sin(theta - 0.5)}L${q}L${q[0] - len * Math.cos(theta + 0.5)},${q[1] - len * Math.sin(theta + 0.5)}`;
      }
      return d;
    }
    function drawItem(a) {
      if (a.type === "note") {
        drawNote(a);
        return;
      }
      if (a.type === "highlight") {
        const s = surface(a.surface);
        if (!s) return;
        const range = locate(mapFor(s), a);
        if (pdf && range && !a.quads) {
          a.quads = [...range.getClientRects()]
            .filter((r) => r.width > 0.5 && r.height > 0.5)
            .map((r) =>
              [
                [r.left, r.top],
                [r.right, r.top],
                [r.right, r.bottom],
                [r.left, r.bottom],
              ].map((p) => point(p[0], p[1], { kind: "page", surface: s.id })),
            );
          persist(a.id, a);
        }
        if (pdf && a.quads)
          for (const quad of a.quads) {
            overlay.append(
              el("polygon", {
                points: quad
                  .map((p) => xy(p, { kind: "page", surface: s.id })?.join(","))
                  .join(" "),
                fill: a.color,
                opacity: ".35",
                "data-id": a.id,
              }),
            );
          }
        else if (range)
          for (const r of range.getClientRects()) {
            if (r.width > 0.5 && r.height > 0.5)
              overlay.append(
                el("rect", {
                  x: r.x,
                  y: r.y,
                  width: r.width,
                  height: r.height,
                  fill: a.color,
                  opacity: ".35",
                  "data-id": a.id,
                }),
              );
          }
        return;
      }
      overlay.append(
        el("path", {
          d: pathFor(a),
          fill: "none",
          stroke: a.color,
          "stroke-width":
            (a.pdfWidth
              ? a.pdfWidth * (surface(a.anchor?.surface)?.scale?.() || 1)
              : a.width) * (a.type === "marker" ? 5 : 1),
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          opacity: a.type === "marker" ? ".3" : "1",
          "data-id": a.id,
        }),
      );
    }
    function drawNote(a) {
      const p = xy(a.point, a.anchor);
      if (!p) return;
      let node = notes.querySelector(`[data-id="${a.id}"]`);
      if (!node) {
        node = document.createElement("div");
        node.className = "note";
        node.dataset.id = a.id;
        node.innerHTML = `<div class="note-head" title="Drag note">${svgIcon("grip")}<div><button data-fold title="Collapse note" aria-label="Collapse note">${svgIcon("minus")}</button><button data-remove title="Delete note" aria-label="Delete note">${svgIcon("close")}</button></div></div><textarea placeholder="Add a note…" aria-label="Sticky note text" spellcheck="true"></textarea>`;
        node.querySelector("textarea").value = a.text || "";
        node.querySelector("textarea").addEventListener("input", (e) => {
          const current = items.get(a.id);
          if (current)
            change(a.id, { ...current, text: e.target.value }, false);
        });
        node.querySelector("[data-remove]").onclick = () => change(a.id, null);
        node.querySelector("[data-fold]").onclick = () => {
          const current = items.get(a.id);
          change(a.id, { ...current, collapsed: !current.collapsed });
        };
        node
          .querySelector(".note-head")
          .addEventListener("pointerdown", (e) => {
            if (e.target.closest("button")) return;
            e.preventDefault();
            const original = structuredClone(items.get(a.id)),
              origin = xy(original.point, original.anchor),
              sx = e.clientX,
              sy = e.clientY;
            const move = (ev) => {
              const cur = items.get(a.id);
              items.set(a.id, {
                ...cur,
                point: point(
                  origin[0] + ev.clientX - sx,
                  origin[1] + ev.clientY - sy,
                  cur.anchor,
                ),
              });
              request();
            };
            const up = () => {
              document.removeEventListener("pointermove", move, true);
              document.removeEventListener("pointerup", up, true);
              const updated = structuredClone(items.get(a.id));
              undo.push({ id: a.id, before: original, after: updated });
              redo = [];
              persist(a.id, updated);
              status();
            };
            document.addEventListener("pointermove", move, true);
            document.addEventListener("pointerup", up, true);
          });
        notes.append(node);
      }
      node.style.left = p[0] + "px";
      node.style.top = p[1] + "px";
      node.classList.toggle("collapsed", !!a.collapsed);
      const input = node.querySelector("textarea");
      if (shadow.activeElement !== input && input.value !== a.text)
        input.value = a.text || "";
    }
    function render() {
      frame = 0;
      if (dirty) {
        maps.clear();
        dirty = false;
      }
      overlay.replaceChildren();
      for (const a of items.values()) drawItem(a);
      if (pdf && mode === "select") {
        overlay.querySelectorAll("[data-id]").forEach((node) => {
          node.style.pointerEvents = "visiblePainted";
          node.style.cursor = "move";
        });
        const a = items.get(selectedId);
        if (a?.points?.length) {
          const pts = a.points.map((p) => xy(p, a.anchor)).filter(Boolean);
          const left = Math.min(...pts.map((p) => p[0])),
            right = Math.max(...pts.map((p) => p[0]));
          const top = Math.min(...pts.map((p) => p[1])),
            bottom = Math.max(...pts.map((p) => p[1]));
          overlay.append(
            el("rect", {
              x: left - 5,
              y: top - 5,
              width: right - left + 10,
              height: bottom - top + 10,
              fill: "none",
              stroke: "#777",
              "stroke-dasharray": "4 3",
              "pointer-events": "none",
            }),
          );
          const handle = el("rect", {
            x: right - 4,
            y: bottom - 4,
            width: 8,
            height: 8,
            fill: "white",
            stroke: "#555",
            "data-resize": a.id,
          });
          handle.style.pointerEvents = "all";
          handle.style.cursor = "nwse-resize";
          overlay.append(handle);
        }
      }
      if (active) drawItem(active);
      notes.querySelectorAll(".note").forEach((n) => {
        if (!items.has(n.dataset.id)) n.remove();
      });
    }
    function request() {
      if (!frame) frame = requestAnimationFrame(render);
    }
    overlay.addEventListener("pointerdown", (e) => {
      if (mode !== "select" || e.button !== 0) return;
      const id = e.target.dataset.resize || e.target.dataset.id;
      const original = items.get(id);
      if (!original) return;
      e.preventDefault();
      e.stopPropagation();
      selectedId = id;
      onChange([...items.values()]);
      request();
      if (!original.points?.length) return;
      const before = structuredClone(original);
      const start = point(e.clientX, e.clientY, before.anchor);
      const resize = !!e.target.dataset.resize;
      const min = [
        Math.min(...before.points.map((p) => p[0])),
        Math.min(...before.points.map((p) => p[1])),
      ];
      const max = [
        Math.max(...before.points.map((p) => p[0])),
        Math.max(...before.points.map((p) => p[1])),
      ];
      const move = (ev) => {
        const now = point(ev.clientX, ev.clientY, before.anchor);
        const points = before.points.map((p) =>
          resize
            ? [
                min[0] +
                  ((p[0] - min[0]) * (now[0] - min[0])) /
                    (max[0] - min[0] || 1),
                min[1] +
                  ((p[1] - min[1]) * (now[1] - min[1])) /
                    (max[1] - min[1] || 1),
              ]
            : [p[0] + now[0] - start[0], p[1] + now[1] - start[1]],
        );
        items.set(id, { ...before, points });
        request();
      };
      const up = () => {
        document.removeEventListener("pointermove", move, true);
        document.removeEventListener("pointerup", up, true);
        const updated = items.get(id);
        items.set(id, before);
        change(id, updated);
      };
      document.addEventListener("pointermove", move, true);
      document.addEventListener("pointerup", up, true);
    });
    capture.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      if (mode === "erase") {
        // Hit test annotations in screen coordinates, including broad highlight rectangles.
        for (const node of [...overlay.children].reverse()) {
          let hit = false;
          const p = new DOMPoint(e.clientX, e.clientY);
          if (node.tagName === "rect") {
            const r = node.getBoundingClientRect();
            hit =
              e.clientX >= r.left &&
              e.clientX <= r.right &&
              e.clientY >= r.top &&
              e.clientY <= r.bottom;
          } else if (node.isPointInStroke) {
            const old = node.getAttribute("stroke-width");
            node.setAttribute("stroke-width", Math.max(14, Number(old)));
            hit = node.isPointInStroke(p);
            node.setAttribute("stroke-width", old);
          }
          if (hit) {
            change(node.dataset.id, null);
            return;
          }
        }
        return;
      }
      const s = surfaceAt(e.clientX, e.clientY);
      if (!s) return;
      const anchor = anchorAt(e.clientX, e.clientY, s),
        p = point(e.clientX, e.clientY, anchor);
      if (mode === "note") {
        const item = add({ type: "note", anchor, point: p, text: "", color });
        setMode("select");
        requestAnimationFrame(() =>
          notes.querySelector(`[data-id="${item.id}"] textarea`)?.focus(),
        );
        return;
      }
      active = {
        id: "draft",
        type: mode,
        anchor,
        points: [p, p],
        color,
        width,
        ...(pdf ? { pdfWidth: width / (s.scale?.() || 4 / 3) } : {}),
      };
      capture.setPointerCapture(e.pointerId);
      request();
    });
    capture.addEventListener("pointermove", (e) => {
      if (!active) return;
      const p = point(e.clientX, e.clientY, active.anchor);
      if (["box", "arrow"].includes(active.type)) active.points[1] = p;
      else {
        const last = xy(active.points.at(-1), active.anchor);
        if (Math.hypot(e.clientX - last[0], e.clientY - last[1]) > 1.5)
          active.points.push(p);
      }
      request();
    });
    function finish() {
      if (active) {
        const a = active;
        active = null;
        add(a);
        request();
      }
    }
    capture.addEventListener("pointerup", finish);
    capture.addEventListener("pointercancel", () => {
      active = null;
      request();
    });
    document.addEventListener("pointerup", (e) => {
      if (
        mode !== "highlight" ||
        e.composedPath().includes(host) ||
        e.composedPath().includes(toolbarMount)
      )
        return;
      setTimeout(() => {
        const selection = getSelection();
        if (!selection || selection.isCollapsed || !selection.rangeCount)
          return;
        const r = selection.getRangeAt(0);
        const targets = surfaces().filter((s) => r.intersectsNode(s.element));
        for (const s of targets) {
          const map = mapFor(s),
            selected = map.nodes.filter((n) => r.intersectsNode(n.node));
          const first = selected[0],
            last = selected.at(-1);
          if (!first || !last) continue;
          const start =
            first.start + (r.startContainer === first.node ? r.startOffset : 0);
          const end =
            last.start +
            (r.endContainer === last.node ? r.endOffset : last.node.length);
          const quote = map.text.slice(start, end);
          if (!quote.trim()) continue;
          add({
            type: "highlight",
            surface: s.id,
            start,
            quote,
            prefix: map.text.slice(Math.max(0, start - 40), start),
            suffix: map.text.slice(end, end + 40),
            color,
          });
        }
        selection.removeAllRanges();
      }, 0);
    });
    for (const root of roots)
      root.addEventListener("click", async (e) => {
        const tool = e.target.closest("[data-mode]");
        if (tool) {
          setMode(tool.dataset.mode);
          return;
        }
        const action = e.target.closest("[data-action]")?.dataset.action;
        if (["color", "width", "more"].includes(action)) {
          const pop = $("." + action + "-popover"),
            wasHidden = pop.classList.contains("hidden");
          closePopovers();
          pop.classList.toggle("hidden", !wasHidden);
          $("." + action + "-button").setAttribute("aria-expanded", wasHidden);
          return;
        }
        const swatch = e.target.closest("[data-color]");
        if (swatch) {
          setColor(swatch.dataset.color);
          closePopovers();
          return;
        }
        const size = e.target.closest("[data-width]");
        if (size) {
          width = Number(size.dataset.width);
          syncControls();
          closePopovers();
          return;
        }
        if (action === "hide") toggle();
        if (action === "undo") {
          const op = undo.pop();
          if (op) {
            op.after = items.has(op.id)
              ? structuredClone(items.get(op.id))
              : null;
            redo.push(op);
            change(op.id, op.before, false);
            status();
          }
        }
        if (action === "redo") {
          const op = redo.pop();
          if (op) {
            undo.push(op);
            change(op.id, op.after, false);
            status();
          }
        }
        if (action === "export") {
          const all = await chrome.storage.local.get(null),
            annotations = Object.entries(all)
              .filter(([k]) => k.startsWith("lasting-ink:v1:"))
              .map(([, v]) => v);
          const blob = new Blob(
              [
                JSON.stringify(
                  {
                    app: "Lasting Ink",
                    version: 1,
                    exported: new Date().toISOString(),
                    annotations,
                  },
                  null,
                  2,
                ),
              ],
              { type: "application/json" },
            ),
            link = document.createElement("a"),
            href = URL.createObjectURL(blob);
          link.href = href;
          link.download = "lasting-ink-backup.json";
          link.click();
          setTimeout(() => URL.revokeObjectURL(href), 10000);
          hint("Exported all saved annotations");
        }
      });
    function closePopovers() {
      all(".popover").forEach((p) => p.classList.add("hidden"));
      all("[aria-expanded]").forEach((b) =>
        b.setAttribute("aria-expanded", "false"),
      );
    }
    function syncControls() {
      $(".color-dot").style.setProperty("--ink", color);
      $(".width-button .width-dot").style.setProperty("--width", width + "px");
      all("[data-color]").forEach((b) =>
        b.setAttribute("aria-pressed", b.dataset.color === color),
      );
      all("[data-width]").forEach((b) =>
        b.setAttribute("aria-pressed", Number(b.dataset.width) === width),
      );
      $(".custom-color").value = color;
    }
    function setColor(value) {
      color = value;
      if (["highlight", "marker"].includes(mode)) highlightColor = value;
      else inkColor = value;
      syncControls();
    }
    $(".launcher").onclick = toggle;
    $(".custom-color").oninput = (e) => setColor(e.target.value);
    syncControls();
    document.addEventListener("pointerdown", (e) => {
      if (
        !e.composedPath().includes(host) &&
        !e.composedPath().includes(toolbarMount)
      )
        closePopovers();
    });
    document.addEventListener(
      "keydown",
      (e) => {
        if (
          e
            .composedPath()
            .some(
              (n) =>
                n instanceof Element &&
                n.matches(
                  'input,textarea,select,[role="textbox"],[contenteditable]:not([contenteditable="false"])',
                ),
            )
        )
          return;
        if (e.defaultPrevented || e.isComposing) return;
        if (
          pdf &&
          selectedId &&
          ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
        ) {
          const item = items.get(selectedId);
          if (item?.points?.length) {
            e.preventDefault();
            e.stopPropagation();
            const step = e.shiftKey ? 10 : 1,
              dx =
                e.key === "ArrowLeft"
                  ? -step
                  : e.key === "ArrowRight"
                    ? step
                    : 0,
              dy =
                e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
            const origin = xy(item.points[0], item.anchor),
              a = point(origin[0], origin[1], item.anchor),
              b = point(origin[0] + dx, origin[1] + dy, item.anchor);
            const delta = [b[0] - a[0], b[1] - a[1]];
            let points;
            if (e.altKey) {
              const min = [
                  Math.min(...item.points.map((p) => p[0])),
                  Math.min(...item.points.map((p) => p[1])),
                ],
                max = [
                  Math.max(...item.points.map((p) => p[0])),
                  Math.max(...item.points.map((p) => p[1])),
                ];
              points = item.points.map((p) => [
                min[0] +
                  ((p[0] - min[0]) * (max[0] - min[0] + delta[0])) /
                    (max[0] - min[0] || 1),
                min[1] +
                  ((p[1] - min[1]) * (max[1] - min[1] + delta[1])) /
                    (max[1] - min[1] || 1),
              ]);
            } else
              points = item.points.map((p) => [
                p[0] + delta[0],
                p[1] + delta[1],
              ]);
            change(item.id, { ...item, points });
            return;
          }
        }
        if (!e.altKey && (e.metaKey || e.ctrlKey) && !hidden && !active) {
          const key = e.key.toLowerCase();
          const action =
            key === "z"
              ? e.shiftKey
                ? "redo"
                : "undo"
              : key === "y" && e.ctrlKey && !e.metaKey && !e.shiftKey
                ? "redo"
                : null;
          const button = action && $('[data-action="' + action + '"]');
          // Leave page shortcuts alone when there is no annotation to undo.
          if (button && !button.disabled) {
            e.preventDefault();
            e.stopPropagation();
            button.click();
            return;
          }
        }
        if (e.key === "Escape") {
          setMode("select");
          return;
        }
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const next = {
          v: "select",
          h: "highlight",
          p: "pen",
          m: "marker",
          n: "note",
          r: "box",
          a: "arrow",
          e: "erase",
        }[e.key.toLowerCase()];
        if (next && !hidden) {
          e.preventDefault();
          setMode(next);
        }
      },
      true,
    );
    window.addEventListener("scroll", request, true);
    window.addEventListener("resize", () => {
      dirty = true;
      request();
    });
    const observer = new MutationObserver((records) => {
      if (records.some((r) => r.target !== host && !host.contains(r.target))) {
        dirty = true;
        request();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    new ResizeObserver(request).observe(document.body);
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "local") return;
      for (const [key, { newValue }] of Object.entries(changes))
        if (key.startsWith(prefix)) {
          const id = key.slice(prefix.length);
          if (newValue) items.set(id, newValue);
          else items.delete(id);
        }
      status();
      request();
      onChange([...items.values()]);
    });
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === "toggle-ink") toggle();
    });
    if (!pdf)
      setInterval(() => {
        const next = canonical(location.href);
        if (next !== currentUrl) {
          currentUrl = next;
          prefix = "lasting-ink:v1:" + next + "|";
          undo = [];
          redo = [];
          items.clear();
          maps.clear();
          load();
        }
      }, 1000);
    await load();
    onChange([...items.values()]);
    if (!pdf && items.size === 0) {
      hidden = true;
      $(".toolbar").classList.add("hidden");
      $(".launcher").classList.remove("hidden");
    }
    return {
      list() {
        return [...items.values()].map((a) => structuredClone(a));
      },
      selected() {
        return selectedId;
      },
      select(id) {
        selectedId = items.has(id) ? id : null;
        setMode("select");
        request();
        onChange([...items.values()]);
      },
      update(id, patch) {
        if (items.has(id)) {
          const original = items.get(id);
          if (pdf && patch.width && original.anchor?.kind === "page")
            patch = {
              ...patch,
              pdfWidth:
                patch.width /
                (surface(original.anchor.surface)?.scale?.() || 4 / 3),
            };
          change(id, { ...original, ...patch });
        }
      },
      remove(id) {
        if (items.has(id)) change(id, null);
      },
      async flush() {
        await Promise.all([...pendingSaves]);
      },
      refresh() {
        clipToViewport();
        dirty = true;
        request();
      },
    };
  };
})();
