import { startSync } from "./sync.js";
startSync();
// PDFs open in the viewer through mime_types_handler. The toolbar button
// opens an empty viewer for local files.
chrome.action.onClicked.addListener(() =>
  chrome.tabs.create({ url: chrome.runtime.getURL("viewer.html") }),
);
