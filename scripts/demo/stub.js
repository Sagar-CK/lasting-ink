// Stand-ins for the extension APIs the viewer uses, kept in memory.
(() => {
  const store = {};
  const listeners = [];
  const area = (shared) => ({
    async get(keys) {
      if (keys == null) return structuredClone(shared);
      const list =
        typeof keys === "string"
          ? [keys]
          : Array.isArray(keys)
            ? keys
            : Object.keys(keys);
      return Object.fromEntries(
        list
          .filter((k) => k in shared)
          .map((k) => [k, structuredClone(shared[k])]),
      );
    },
    async set(values) {
      const changes = {};
      for (const [k, v] of Object.entries(values)) {
        changes[k] = { oldValue: shared[k], newValue: structuredClone(v) };
        shared[k] = structuredClone(v);
      }
      for (const f of listeners) f(changes, "local");
    },
    async remove(keys) {
      for (const k of [keys].flat()) delete shared[k];
    },
  });
  window.chrome = {
    runtime: {
      getURL: (p) => new URL(p, location.origin).href,
      sendMessage: async () => ({}),
      onMessage: { addListener() {} },
    },
    storage: {
      local: area(store),
      sync: area({}),
      onChanged: { addListener: (f) => listeners.push(f) },
    },
  };
  // The viewer opens local files from this cache; serve the demo PDF instead.
  const open = caches.open.bind(caches);
  caches.open = async (name) =>
    name === "lasting-ink-local-pdfs"
      ? { match: () => fetch("/demo.pdf") }
      : open(name);
})();
