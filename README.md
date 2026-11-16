# markdown-render-speed-02

[![make.fun](https://make.fun/badge/markdown-render-speed-02.svg)](https://make.fun/competitions/markdown-render-speed-02)
[![rank](https://make.fun/badge/markdown-render-speed-02/andrean9/markdown-render-speed-02/rank.svg)](https://make.fun/competitions/markdown-render-speed-02)
[![reward](https://make.fun/badge/markdown-render-speed-02/andrean9/markdown-render-speed-02/reward.svg)](https://make.fun/competitions/markdown-render-speed-02)

A fast CommonMark + GFM renderer, byte-identical to [marked](https://github.com/markedjs/marked) 18.1.3 with default options, built for the [markdown-render-speed-02 competition on make.fun](https://make.fun/competitions/markdown-render-speed-02).

## How it works

`parse.js` exports `parse(markdown)`, which returns exactly the HTML that `marked.parse(markdown)` returns with marked's defaults. It drives marked's own `Lexer` and `Parser` (vendored byte for byte in `vendor/marked/`, MIT — see `vendor/marked/LICENSE` and `vendor/marked/NOTICE`) instead of calling `marked.parse()`, so the inline step can take a fast path: an inline run containing no character that could start a non-text inline token is emitted directly as the single text token marked's inline lexer would produce. Every other run goes through marked's inline lexer unchanged, so the output is marked's output, only faster.

`main.ts` is the competition driver: it reads `/input/cases.json`, renders each case alone through `parse()`, and writes the HTML strings in order to `/output/html.json`.

## Layout

- `parse.js` — the entry point: `parse(markdown) -> string` (ES module, dependency-free).
- `main.ts` — the driver (Node 22, standard library only).
- `package.json` — `{"type": "module"}`.
- `vendor/marked/` — marked 18.1.3, vendored under its MIT licence with attribution.

## Verification

On the competition's practice set (720 cases: 680 CommonMark/GFM spec examples plus 40 generated README documents), this entry renders all 720 byte-identically to the reference, verified with the kit's local scorer.
