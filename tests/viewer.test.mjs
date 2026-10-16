import { test } from "node:test";
import assert from "node:assert/strict";
test("native PDF streams are fetched once and supply progressive data without network re-requests", async () => {
  const { createPdfSource } = await import("../extension/stream-source.js");
  class Transport {
    constructor(length, initial) {
      this.length = length;
      this.initial = initial;
      this.ranges = [];
      this.chunks = [];
    }
    onDataRange(n, data) {
      this.ranges.push([n, Array.from(data)]);
    }
    onDataProgressiveRead(data) {
      this.chunks.push(Array.from(data));
    }
    onDataProgress() {}
    onDataProgressiveDone() {
      this.finished = true;
    }
  }
  const chunks = [new Uint8Array([1, 2, 3, 4]), new Uint8Array([5, 6, 7, 8])];
  const response = new Response(
    new ReadableStream({
      pull(c) {
        if (chunks.length) c.enqueue(chunks.shift());
        else c.close();
      },
    }),
    { headers: { "content-length": "8" } },
  );
  const { range } = await createPdfSource(
    response,
    { PDFDataRangeTransport: Transport },
    0,
  );
  range.requestDataRange(2, 7);
  await range.done;
  assert.deepEqual(range.ranges, [[2, [3, 4, 5, 6, 7]]]);
  assert.equal(range.finished, true);
  assert.equal(range.length, 8);
});
