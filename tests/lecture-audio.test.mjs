import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";

const script = await readFile(
  new URL("../extension/lecture-audio.js", import.meta.url),
  "utf8",
);
const title =
  "COMSW4776_001_2026_3 Neural Networks & Deep Learning on 10/6/2026 (Tue)";
function setup({
  pageTitle = title,
  host = "cvn.hosted.panopto.com",
  source,
} = {}) {
  const dom = new JSDOM("<title></title><video></video>", {
    url: `https://${host}/Panopto/Pages/Viewer.aspx?id=test`,
    runScripts: "outside-only",
  });
  const { window: w } = dom;
  w.document.title = pageTitle;
  const media = w.document.querySelector("video");
  Object.defineProperty(media, "currentSrc", {
    value: source || `blob:https://${host}/recording`,
  });
  const contexts = [];
  w.AudioContext = class {
    state = "running";
    destination = {};
    sources = [];
    constructor() {
      contexts.push(this);
    }
    createGain() {
      return { connect() {}, disconnect() {} };
    }
    createMediaElementSource(element) {
      const source = {
        element,
        connect(node) {
          this.output = node;
        },
      };
      this.sources.push(source);
      return source;
    }
  };
  w.eval(script);
  return { dom, w, media, contexts, audio: w.__lastingInkLectureAudio };
}

test("Neural Networks recordings mix to mono, reuse each source, and revert if course changes", async () => {
  const { dom, w, audio, contexts } = setup();
  try {
    await audio.refresh();
    assert.equal(audio.enabled, true);
    assert.equal(audio.tracks.size, 1);
    const [{ mono }] = audio.tracks.values();
    assert.equal(mono.channelCount, 1);
    assert.equal(mono.channelCountMode, "explicit");
    assert.equal(mono.channelInterpretation, "speakers");
    await audio.refresh();
    assert.equal(contexts[0].sources.length, 1);
    w.document.title = "COMSW4111 Database lectures";
    await audio.refresh();
    assert.equal(mono.channelCount, 2);
    assert.equal(mono.channelCountMode, "max");
    w.document.title = title;
    await audio.refresh();
    assert.equal(mono.channelCount, 1);
  } finally {
    dom.window.close();
  }
});

test("other courses and websites keep their original audio", async () => {
  for (const options of [
    { pageTitle: "COMSW4111 Databases" },
    { host: "example.com" },
  ]) {
    const { dom, audio, contexts } = setup(options);
    try {
      await audio.refresh();
      assert.equal(audio.enabled, false);
      assert.equal(contexts.length, 0);
    } finally {
      dom.window.close();
    }
  }
});

test("cross-origin audio without CORS is left untouched to avoid silence", async () => {
  const { dom, audio, contexts } = setup({
    source: "https://media.example.com/video.mp4",
  });
  try {
    await audio.refresh();
    assert.equal(audio.tracks.size, 0);
    assert.equal(contexts.length, 0);
  } finally {
    dom.window.close();
  }
});

test("a playback gesture synchronously unlocks audio after autoplay was blocked", async () => {
  const { dom, w, audio, contexts } = setup();
  const waiting = [];
  let inGesture = false;
  w.AudioContext.prototype.resume = function () {
    if (inGesture) {
      this.state = "running";
      waiting.splice(0).forEach((resolve) => resolve());
      return Promise.resolve();
    }
    return new Promise((resolve) => waiting.push(resolve));
  };
  try {
    // Create the context, then simulate Chromium suspending it before playback.
    await audio.refresh();
    contexts[0].state = "suspended";
    const blockedRefresh = audio.refresh();
    inGesture = true;
    w.document.dispatchEvent(new w.Event("pointerdown", { bubbles: true }));
    inGesture = false;
    assert.equal(
      contexts[0].state,
      "running",
      "resume must happen in the gesture",
    );
    await blockedRefresh;
    assert.equal(audio.tracks.size, 1);
  } finally {
    dom.window.close();
  }
});
