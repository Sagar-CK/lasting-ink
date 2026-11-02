# Screenshots

The README images are captures of the real reader, framed in CleanShot X. The document is [Synthetic Scenario Generation for Evaluation of Industry 4.0 Agents](https://arxiv.org/abs/2607.22563) (arXiv 2607.22563).

The demo server runs the reader without installing the extension. A scene draws its annotations through the toolbar, the way a person would, then opens the sidebar.

```sh
curl -L -o /tmp/paper.pdf https://arxiv.org/pdf/2607.22563
npm run demo -- /tmp/paper.pdf
```

| Image                     | Page                                  |
| ------------------------- | ------------------------------------- |
| `docs/images/reader.png`  | `http://localhost:8765/?scene=reader` |
| `docs/images/outline.png` | `http://localhost:8765/?scene=table`  |

Open each page in a full-width browser window at 119% zoom (the reader's automatic fit on a 1512 × 982 display). Capture only the reader, from its toolbar to the bottom edge, without the browser's own tabs or address bar.

In CleanShot's background tool choose the soft gray/pink/cyan gradient (second row, second preset), padding 90, shadow 30 and corners 24. Save PNGs in `docs/images`.

Scenes live in `scripts/demo/scene.js`. Add one there rather than editing a capture by hand.
