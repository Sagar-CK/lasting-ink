export function parsePageRange(value, count) {
  if (!value.trim() || value.trim().toLowerCase() === "all")
    return Array.from({ length: count }, (_, i) => i + 1);
  const result = new Set();
  for (const piece of value.split(",")) {
    const m = piece.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!m) throw new Error("Use page numbers or ranges, such as 1-5, 8.");
    const start = Number(m[1]),
      end = Number(m[2] || m[1]);
    if (start < 1 || end > count || end < start)
      throw new Error(`Choose pages between 1 and ${count}.`);
    for (let n = start; n <= end; n++) result.add(n);
  }
  return [...result].sort((a, b) => a - b);
}
