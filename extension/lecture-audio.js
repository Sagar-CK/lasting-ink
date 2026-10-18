// Keep the fix local to this course; never change system-wide audio settings.
(() => {
  if (window.__lastingInkLectureAudio) return;
  const course = () =>
    location.hostname === "cvn.hosted.panopto.com" &&
    /\/Panopto\/Pages\/Viewer\.aspx$/i.test(location.pathname) &&
    /\bCOMSW?4776(?=_|\s|$)/i.test(document.title) &&
    /Neural Networks\s*&\s*Deep Learning/i.test(document.title);
  const tracks = new Map();
  let context;
  let pending = false;
  let timer;
  const safeSource = (media) => {
    if (!media.currentSrc) return false;
    try {
      const url = new URL(media.currentSrc, location.href);
      // Cross-origin media without CORS would become silent in Web Audio.
      return url.origin === location.origin || Boolean(media.crossOrigin);
    } catch {
      return false;
    }
  };
  const refresh = async () => {
    const enabled = course();
    for (const { mono } of tracks.values()) {
      mono.channelCount = enabled ? 1 : 2;
      mono.channelCountMode = enabled ? "explicit" : "max";
    }
    if (!enabled || pending) return;
    const candidates = [...document.querySelectorAll("video,audio")].filter(
      (media) => !tracks.has(media) && safeSource(media),
    );
    if (!candidates.length && !context) return;
    pending = true;
    try {
      context ||= new AudioContext();
      if (context.state !== "running") await context.resume();
      // Do not intercept the original audio until the replacement can play.
      if (context.state !== "running" || !course()) return;
      for (const media of candidates) {
        if (!media.isConnected || !safeSource(media)) continue;
        const mono = context.createGain();
        mono.channelCount = 1;
        mono.channelCountMode = "explicit";
        mono.channelInterpretation = "speakers";
        mono.connect(context.destination);
        try {
          const source = context.createMediaElementSource(media);
          source.connect(mono);
          tracks.set(media, { source, mono });
        } catch {
          // Another audio processor may already own this element.
          mono.disconnect();
        }
      }
    } finally {
      pending = false;
    }
  };
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      refresh().catch(() => {});
    }, 50);
  };
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  // resume() must run inside the trusted event, not in the delayed scan.
  // Autoplay can leave the first resume pending indefinitely in Chromium.
  const unlock = () => {
    if (!course()) return;
    context ||= new AudioContext();
    if (context.state !== "running") context.resume().then(schedule, () => {});
    schedule();
  };
  for (const event of ["pointerdown", "keydown", "click"]) {
    document.addEventListener(event, unlock, true);
  }
  for (const event of ["loadedmetadata", "play"]) {
    document.addEventListener(event, schedule, true);
  }
  window.__lastingInkLectureAudio = {
    get enabled() {
      return course();
    },
    get state() {
      return context?.state || "idle";
    },
    tracks,
    refresh,
  };
  schedule();
})();
