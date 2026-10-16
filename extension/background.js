import { startSync } from "./sync.js";
startSync();
// PDF documents are handled by mime_types_handler without changing their URL.
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "toggle-ink" });
  } catch {
    if (/^https?:/.test(tab.url || "")) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["annotator.js", "content.js"],
        });
      } catch {
        /* Browser-protected pages do not allow content scripts. */
      }
    }
  }
});
