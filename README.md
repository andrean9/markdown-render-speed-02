# markdown-render-speed-02

[![make.fun](https://make.fun/badge/markdown-render-speed-02.svg)](https://make.fun/competitions/markdown-render-speed-02)
[![rank](https://make.fun/badge/markdown-render-speed-02/andrean9/markdown-render-speed-02/rank.svg)](https://make.fun/competitions/markdown-render-speed-02)
[![reward](https://make.fun/badge/markdown-render-speed-02/andrean9/markdown-render-speed-02/reward.svg)](https://make.fun/competitions/markdown-render-speed-02)

A fast CommonMark + GFM renderer, byte-identical to [marked](https://github.com/markedjs/marked) 18.1.3 with default options, built for the [markdown-render-speed-02 competition on make.fun](https://make.fun/competitions/markdown-render-speed-02).

## How it works

`parse.js` exports `parse(markdown)`, which returns exactly the HTML that `marked.parse(markdown)` returns with marked's defaults. It drives marked's own `Lexer` and `Parser` (vendored in `vendor/marked/`, MIT — see `vendor/marked/LICENSE` and `vendor/marked/NOTICE`) instead of calling `marked.parse()`, so the inline step can take a fast path: an inline run containing no character that could start a non-text inline token is emitted directly as the single text token marked's inline lexer would produce. Every other run goes through marked's inline lexer unchanged.

The vendored marked is a fork of 18.1.3 with three pure-speedup changes (documented in `vendor/marked/NOTICE`):
1. A chunked plain-text fast path in the inline lexer: a run of plain inline text is emitted directly as its text token, without running the tokenizers or the inline text regex. Runs holding `@` take no fast path (the email lookahead can otherwise expose a mid-word `www.` to the URL tokenizer).
2. The list tokenizer takes lines with `indexOf` + `slice` instead of `split`, avoiding an array allocation per line.
3. The list item loop skips its six block-start regex tests for a line whose first non-space character cannot start any of them.

`main.ts` is the competition driver: it reads `/input/cases.json`, renders each case alone through `parse()`, and writes the HTML strings in order to `/output/html.json`. Before the timed cases it parses one fixed synthetic document, so the JIT compiler optimizes the parser's hot paths on realistic shapes before the real work starts; the warmup's output is discarded and it changes no result.

## Layout

- `parse.js` — the entry point: `parse(markdown) -> string` (ES module, dependency-free).
- `main.ts` — the driver (Node 22, standard library only).
- `package.json` — `{"type": "module"}`.
- `vendor/marked/` — marked 18.1.3, forked under its MIT licence with attribution (see `vendor/marked/NOTICE` for the changes).

## Verification

On the competition's practice set (720 cases: 680 CommonMark/GFM spec examples plus 40 generated README documents), this entry renders all 720 byte-identically to the reference, verified with the kit's local scorer — and the same on four further instances drawn from fresh seeds (720/720 each). It also matches the unmodified marked 18.1.3 build exactly on all 264 of marked's own spec files and on 44,000 randomly generated differential fuzz cases. Measured locally, the parse loop runs about 12% faster than the unmodified build (warm median 644 ms vs 729 ms over the practice set).
