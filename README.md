<img src="extension/icons/icon-128.png" width="48" height="48" alt="">

# Lasting Ink

A local PDF reader and webpage annotation extension for Arc and Chrome (Chromium 151+).

The development build is **0.5.1**. Load the `extension/` folder to use it. The [last published release](https://github.com/Sagar-CK/lasting-ink/releases/tag/v0.4.1) predates the reader improvements below.

## Install

1. Keep the unpacked extension folder somewhere permanent.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Choose **Load unpacked** and select `extension/` (or the extracted `lasting-ink/` folder).
4. Reload a webpage or PDF. PDFs keep their original URLs.

## Read PDFs

All reader icons, including PDF comment and attachment markers, use the same Lasting Ink SVG set. Controls, menus, sidebars, and comments share a flat white/grey theme with consistent spacing.

The page controls stay in the center of the top bar. Zoom and page-fit are on the left; annotation tools and document options are on the right.

- **Find** (`Cmd/Ctrl+F`) searches all pages, including pages that have not rendered yet.
- **Sidebar** contains page thumbnails, the document outline, personal bookmarks, notes/highlights, and embedded files.
- Links inside PDFs work. Form values save locally and are included in annotated downloads.
- Reading position, zoom, page rotation, and two-page view are remembered. An explicit `#page=` link takes priority. Matching PDF fingerprints share annotations across URLs and local files.
- **Document options** provides rotation, two-page view, presentation mode, OCR, printing, local-file opening, backup/import, and optional browser sync.
- **Download with annotations** preserves the PDF's text and forms, draws marks into the pages, and adds comments as PDF note annotations. **Download original** leaves the source unchanged.
- **Print** supports including or excluding Lasting Ink annotations. Printing renders the document at 144 DPI and preserves individual page sizes.
- **Recognize scanned text** runs English OCR on this device. It adds searchable/selectable text in the reader without uploading the PDF. Existing text is kept. OCR language data is bundled, so it works offline.
- **Open a local PDF** uses a file picker and stores that file in the browser's local cache so the tab can reopen.

Pages render on demand using PDF.js. When the source provides a stream with a known size, PDF data loads progressively through a single request.

## Annotate

| Tool | Key |
| --- | --- |
| Select | V |
| Highlight text | H |
| Draw | P |
| Highlighter | M |
| Add comment | N |
| Rectangle | R |
| Arrow | A |
| Eraser | E |

Select a drawing to move it or use its corner handle to resize it. The Notes sidebar lets you recolor it, change stroke width, or delete it. Arrow keys move a selected drawing; Alt+Arrow resizes it; Shift uses larger steps. Text highlights support selections across rendered pages.

`Cmd/Ctrl+Z` undoes annotations; `Cmd/Ctrl+Shift+Z` redoes them. `Ctrl+Y` also redoes on Windows/Linux. Inside text fields, normal editing shortcuts apply. Undo history lasts for the current visit.

`Cmd/Ctrl +/−` zooms, `Cmd/Ctrl+0` resets zoom, `Cmd/Ctrl+S` saves an annotated PDF, and `Cmd/Ctrl+P` opens print options. Escape returns to selection mode. On webpages, the floating toolbar can be collapsed and reopened with the pen button.

## Storage and portability

Annotations, reading state, filled forms, and OCR results save in this browser profile. Export/import backup files to transfer annotations, reading state, and bookmarks. Imports merge by annotation identity and timestamps.

Browser sync is **off by default**. Enable it in Document options to sync annotations, reading state, and bookmarks using `chrome.storage.sync`. It requires a browser/account configuration that actually supports sync; Arc's behavior may differ from Chrome. Large libraries can exceed the browser's sync quota; the reader reports this and keeps local data intact. Backups remain available for larger transfers. PDF contents, OCR text, and form fields are not sent through browser sync.

Removing the extension clears its browser storage. Keep a backup if you need to reinstall.

## Limitations

- OCR currently includes English only. Recognition accuracy depends on scan quality. The OCR text layer is stored for this reader; the original PDF is not rewritten with searchable OCR text.
- Password-protected PDFs open after entering the password, which is not stored. If their encryption prevents vector editing, annotated export creates a flattened copy. Flattening removes interactive forms and searchable text from that exported copy.
- PDF JavaScript/calculation scripts are not executed. Ordinary text, checkbox, radio, and selection fields are supported.
- Exported drawing marks become page content. Original PDF comments remain interactive, and Lasting Ink comments export as PDF notes. Keep the backup if you want to continue editing drawn marks in Lasting Ink.
- Major webpage layout changes may move freehand annotations. Browser settings pages cannot be annotated.
- Manual screen-reader testing and additional real-world PDF compatibility testing remain useful beyond the automated fixtures.

## Development

Node.js 22.22.2+, 24.15+, or 26+, and Python 3 for packaging.

```sh
npm ci
npm run build
npm test
npm run package
```

The installable ZIP is written to `dist/`. All runtime code, fonts, OCR models, and licenses are bundled under `extension/`; the reader does not depend on remote script CDNs.

[Geist](https://github.com/vercel/geist-font) · [PDF.js](https://github.com/mozilla/pdf.js) · [pdf-lib](https://github.com/Hopding/pdf-lib) · [Tesseract.js](https://github.com/naptha/tesseract.js). Bundled licenses are under `extension/vendor/`.
