// Feed PDF.js from a single Fetch stream. Native MIME streams must never be
// reopened using XHR or network range requests.
export async function createPdfSource(response, pdfjs, minLength = 65536) {
  if (!response.ok) throw new Error("PDF stream failed: " + response.status);
  const length = Number(response.headers.get("content-length"));
  if (
    !response.body ||
    !Number.isSafeInteger(length) ||
    length < minLength ||
    response.headers.get("content-encoding") ||
    !pdfjs.PDFDataRangeTransport
  )
    return { data: new Uint8Array(await response.arrayBuffer()) };
  const reader = response.body.getReader(),
    first = await reader.read();
  if (first.done) return { data: new Uint8Array() };
  class FetchTransport extends pdfjs.PDFDataRangeTransport {
    constructor() {
      super(length, first.value, false);
      this.chunks = [first.value.slice()];
      this.loaded = first.value.length;
      this.pending = [];
      this.done = this.pump();
    }
    flush() {
      this.pending = this.pending.filter(([begin, end]) => {
        if (end > this.loaded && !this.failed) return true;
        end = Math.min(end, this.loaded);
        const bytes = new Uint8Array(Math.max(0, end - begin));
        let offset = 0;
        for (const chunk of this.chunks) {
          const start = Math.max(begin, offset),
            stop = Math.min(end, offset + chunk.length);
          if (stop > start)
            bytes.set(
              chunk.subarray(start - offset, stop - offset),
              start - begin,
            );
          offset += chunk.length;
          if (offset >= end) break;
        }
        this.onDataRange(begin, bytes);
        return false;
      });
    }
    requestDataRange(begin, end) {
      this.pending.push([begin, end]);
      this.flush();
    }
    async pump() {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          this.chunks.push(value.slice());
          this.loaded += value.length;
          this.onDataProgressiveRead(value);
          this.onDataProgress(this.loaded, length);
          this.flush();
        }
        this.failed = this.loaded !== length;
      } catch (error) {
        this.failed = true;
      } finally {
        this.flush();
        this.onDataProgressiveDone();
      }
    }
    abort() {
      reader.cancel().catch(() => {});
    }
  }
  return { range: new FetchTransport(), disableAutoFetch: true };
}
