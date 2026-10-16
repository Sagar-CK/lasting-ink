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
  // Generated from Lasting Ink's shared icon set in scripts/icons.mjs.
  const icons = {
    select: '<path d="m5 3 14 9-7 1-3 7Z"/>',
    highlight:
      '<path d="M5 4h10M10 4v13M7 17h6M4 21h16"/><path d="m17 7 3 3-3 3"/>',
    pen: '<path d="m4 16 12-12 4 4L8 20H4Z"/><path d="m13 7 4 4M4 16l4 4"/>',
    marker: '<path d="m6 13 8-9 6 5-8 9-6-5Zm2 2-4 5h6l2-2M3 22h12"/>',
    note: '<path d="M20 14a3 3 0 0 1-3 3H9l-5 4V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3Z"/>',
    box: '<rect x="4" y="4" width="16" height="16" rx="2"/>',
    arrow: '<path d="M5 19 19 5M7 5h12v12"/>',
    erase:
      '<path d="m4 13 9-9a2 2 0 0 1 3 0l4 4a2 2 0 0 1 0 3l-8 8H8l-4-4a1.5 1.5 0 0 1 0-2ZM9 8l8 8M11 21h10"/>',
    undo: '<path d="m8 4-5 5 5 5M3 9h11a6 6 0 0 1 0 12"/>',
    redo: '<path d="m16 4 5 5-5 5m5-5H10a6 6 0 0 0 0 12"/>',
    download: '<path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    minus: '<path d="M5 12h14"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    grip: '<path d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01" stroke-width="3"/>',
    sidebar:
      '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M5.5 8h1M5.5 12h1"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    menu: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    previous: '<path d="m6 15 6-6 6 6"/>',
    next: '<path d="m6 9 6 6 6-6"/>',
    fitPage:
      '<path d="M3 8V3h5m8 0h5v5m0 8v5h-5M8 21H3v-5"/><rect x="8" y="6" width="8" height="12" rx="1"/>',
    fitWidth:
      '<rect x="6" y="3" width="12" height="18" rx="1"/><path d="M2 12h20m-3-3 3 3-3 3M5 9l-3 3 3 3"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    print:
      '<path d="M7 8V3h10v5M7 17H4V9h16v8h-3M7 14h10v7H7Z"/><path d="M17 11h.01"/>',
    rotate: '<path d="M4 9a8 8 0 1 1 1 9M4 4v5h5"/>',
    bookmark: '<path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16l-6-4Z"/>',
    spread:
      '<path d="M12 5v16M3 3h6a3 3 0 0 1 3 3 3 3 0 0 1 3-3h6v16h-6a3 3 0 0 0-3 2 3 3 0 0 0-3-2H3Z"/>',
    present: '<path d="M3 3h18v13H3ZM12 16v5m-4 0 4-5 4 5"/>',
    ocr: '<path d="M7 3H3v4m14-4h4v4M3 17v4h4m10 0h4v-4M8 8h8m-4 0v8m-2 0h4"/>',
    folder: '<path d="M3 7V5h7l2 2h9v13H3Z"/>',
    upload: '<path d="M12 16V4m-4 4 4-4 4 4M4 17v4h16v-4"/>',
    sync: '<path d="M20 7a9 9 0 0 0-15-1L3 9m0-5v5h5M4 17a9 9 0 0 0 15 1l2-3m0 5v-5h-5"/>',
    file: '<path d="M14 3H5v18h14V8ZM14 3v5h5M8 12h8m-8 4h6"/>',
    attachment:
      '<path d="m8 12 7-7a4 4 0 0 1 6 6L10 22a6 6 0 0 1-8-8L13 3m-8 14a2 2 0 0 0 3 0l9-9"/>',
    key: '<circle cx="8" cy="8" r="5"/><path d="m12 12 9 9m-4-4 3-3m-6 0 3-3"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 5 2c-2 1-2 2-2 3m0 3h.01"/>',
    pin: '<path d="m9 3 12 12M14 4l6 6-5 3-2 5-7-7 5-2ZM7 17l-4 4"/>',
    export: '<path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/>',
  };
  function svgIcon(name) {
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      icons[name] +
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
    :host{all:initial;color:#292929;font-family:"Lasting Ink Geist",Geist,Arial,sans-serif;font-size:13px;-webkit-font-smoothing:antialiased}
    *{box-sizing:border-box}button,input,textarea{font:inherit}button{cursor:pointer}button:focus-visible,input:focus-visible,textarea:focus-visible{outline:2px solid #777;outline-offset:2px}
    .overlay{position:fixed;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}
    .capture{position:fixed;inset:0;pointer-events:none;touch-action:none}.capture.on{pointer-events:auto;cursor:crosshair}.capture.erase{cursor:cell}
    .toolbar{pointer-events:auto;position:fixed;left:50%;bottom:24px;transform:translateX(-50%);display:flex;align-items:center;gap:2px;padding:6px;border:1px solid #e4e4e4;border-radius:9px;background:#fff;box-shadow:0 4px 16px #0000000a;max-width:calc(100vw - 24px)}
    .tools{display:flex;gap:2px}.tool{background:transparent;border:0;color:#666;border-radius:5px;min-width:32px;width:32px;height:32px;display:grid;place-items:center;padding:7px;transition:background .12s,color .12s}.tool svg{width:18px;height:18px}.tool:hover{background:#f1f1f1;color:#222}.tool:active{background:#e8e8e8}.tool[aria-pressed=true]{background:#ededed;color:#171717}.tool:disabled{opacity:.28;cursor:default}.tool:disabled:hover{background:transparent}
    .divider{width:1px;height:16px;background:#e7e7e7;margin:0 5px}.color-dot{width:14px;height:14px;background:var(--ink,#292929);border-radius:4px;box-shadow:inset 0 0 0 1px #00000012}.width-dot{display:block;width:var(--width,3px);height:var(--width,3px);background:currentColor;border-radius:50%}
    .popover{pointer-events:auto;position:absolute;bottom:50px;right:70px;display:flex;align-items:center;gap:2px;padding:6px;border:1px solid #e4e4e4;border-radius:8px;background:#fff;box-shadow:0 4px 16px #0000000d}.popover button{border:0;background:transparent;width:28px;height:28px;border-radius:5px;display:grid;place-items:center;color:#444;cursor:pointer}.popover button:hover{background:#f1f1f1}.popover button[aria-pressed=true]{box-shadow:inset 0 0 0 1px #aaa}.swatch{width:16px;height:16px;border-radius:4px;background:var(--swatch);box-shadow:inset 0 0 0 1px #00000010}.color-popover{display:grid;grid-template-columns:repeat(8,28px)}.custom-color{grid-column:1/-1;width:100%;height:28px;border:1px solid #e7e7e7;padding:0 8px;margin-top:4px;color:#444;background:#fafafa;border-radius:4px;font-size:12px}.width-popover{right:40px}
    .hint{pointer-events:none;position:fixed;bottom:79px;left:50%;transform:translateX(-50%);padding:7px 10px;border-radius:6px;background:#252525;color:white;font-size:12px;white-space:nowrap;opacity:0;transition:opacity .15s}.hint.show{opacity:1}
    .notes{position:fixed;inset:0;pointer-events:none}.note{position:absolute;pointer-events:auto;width:232px;background:#fff;border:1px solid #dedede;box-shadow:0 4px 16px #0000000a;border-radius:8px;overflow:hidden;color:#303030}.note-head{height:32px;padding:4px 6px 0 10px;display:flex;align-items:center;justify-content:space-between;cursor:grab;user-select:none;color:#999}.note-head:active{cursor:grabbing}.note-head>svg{width:14px;height:14px}.note-head>div{display:flex;gap:2px}.note-head button{display:grid;place-items:center;width:24px;height:24px;padding:5px;border:0;background:transparent;color:#777;border-radius:4px}.note-head button:hover{background:#f1f1f1;color:#222}.note-head button svg{width:14px;height:14px}.note textarea{display:block;resize:none;min-height:104px;width:100%;padding:6px 12px 14px;border:0;outline:none;background:transparent;color:inherit;line-height:1.55;font-size:13px}.note textarea::placeholder{color:#999}.note.collapsed textarea{display:none}.note.collapsed{width:104px}
    .launcher{position:fixed;right:20px;bottom:20px;pointer-events:auto;display:grid;place-items:center;width:36px;height:36px;padding:9px;background:#fff;color:#555;border:1px solid #e4e4e4;border-radius:7px;box-shadow:0 3px 12px #00000008}.launcher:hover{color:#111;background:#fafafa}.launcher svg{width:18px;height:18px}.hidden{display:none!important}.status{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
    @media(max-width:650px){.toolbar{bottom:12px;flex-wrap:wrap;justify-content:center}.tools{gap:0}.tool{min-width:30px;width:30px;padding:6px}.divider{margin:0 3px}.hint{bottom:100px}.popover{right:0;bottom:48px}}
    :host([data-pdf]) .toolbar{top:48px;bottom:auto;left:0;transform:none;width:100%;max-width:none;min-height:44px;justify-content:center;flex-wrap:wrap;border:0;border-radius:0;background:#fff;box-shadow:0 1px 0 #e8e8e8}
    :host([data-pdf]) .tools{flex-wrap:wrap;justify-content:center}
    :host([data-pdf]) .popover{top:calc(100% + 8px);bottom:auto;right:8px;max-width:calc(100vw - 16px)}
    :host([data-pdf]) .launcher{top:48px;bottom:auto;right:8px;background:#fff}
    :host([data-pdf]) .hint{top:calc(var(--ink-top-inset,92px) + 8px);bottom:auto;max-width:calc(100vw - 24px);white-space:normal}
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
      )}</div><div class="divider"></div><button class="tool color-button" data-action="color" title="Color" aria-label="Ink color" aria-expanded="false"><span class="color-dot"></span></button><button class="tool width-button" data-action="width" title="Stroke size" aria-label="Stroke size" aria-expanded="false"><span class="width-dot"></span></button><div class="popover color-popover hidden" role="group" aria-label="Colors">${palette.map((c) => `<button data-color="${c}" aria-label="Color ${c}" aria-pressed="${c === color}"><span class="swatch" style="--swatch:${c}"></span></button>`).join("")}<input class="custom-color" type="text" value="${color}" maxlength="7" spellcheck="false" title="Hex color" aria-label="Custom hex color"></div><div class="popover width-popover hidden" role="group" aria-label="Stroke sizes">${[2, 3, 5, 8].map((w) => `<button data-width="${w}" aria-label="${w} pixel stroke" aria-pressed="${w === width}"><span class="width-dot" style="--width:${w}px"></span></button>`).join("")}</div><div class="divider"></div><button class="tool" data-action="undo" title="Undo (Cmd/Ctrl+Z)" aria-label="Undo last annotation">${svgIcon("undo")}</button><button class="tool" data-action="redo" title="Redo (Cmd/Ctrl+Shift+Z)" aria-label="Redo annotation">${svgIcon("redo")}</button><button class="tool" data-action="export" title="Export annotations as JSON" aria-label="Export annotations as JSON">${svgIcon("export")}</button><button class="tool" data-action="hide" title="Collapse toolbar" aria-label="Collapse toolbar">${svgIcon("close")}</button></div><button class="launcher hidden" title="Annotate" aria-label="Open annotation tools">${svgIcon("pen")}</button><span class="status" role="status"></span>`;
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
        .toolbar{position:relative;inset:auto;transform:none;max-width:none;min-height:32px;padding:0;gap:2px;border:0;border-radius:0;background:transparent;box-shadow:none;flex-wrap:nowrap}
        .tools{gap:2px}.tool{width:30px;min-width:30px;height:32px;padding:6px;border-radius:5px}.tool svg{width:18px;height:18px}
        .divider{height:16px;margin:0 4px}.color-dot{width:14px;height:14px}
        .popover{top:calc(100% + 12px);bottom:auto;right:0;max-width:calc(100vw - 24px)}
        .more-popover{right:auto;left:0;min-width:176px;flex-direction:column;align-items:stretch;gap:2px}
        .more-popover .tool{width:100%;justify-content:start;display:flex;gap:10px;height:32px;padding:8px;border-radius:5px}
        .more-popover .tool:hover,.more-popover .tool[aria-pressed=true]{background:#f1f1f1}
        .more-popover .tool span{font-size:12px;white-space:nowrap}
        .launcher{position:static;width:32px;height:32px;padding:8px;border-radius:5px;background:transparent;box-shadow:none}
        @media(max-width:600px){.toolbar,.tools{gap:1px}.tool{width:28px;min-width:28px}.divider{margin:0 3px}}
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
      more.innerHTML = svgIcon("menu");
      const menu = document.createElement("div");
      menu.className = "popover more-popover hidden";
      menu.setAttribute("role", "group");
      menu.setAttribute("aria-label", "More drawing tools");
      for (const [mode, label] of [
        ["marker", "Highlighter"],
        ["box", "Rectangle"],
        ["arrow", "Arrow"],
        ["erase", "Eraser"],
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
    $(".custom-color").oninput = (e) => {
      if (/^#[0-9a-f]{6}$/i.test(e.target.value)) setColor(e.target.value);
    };
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
