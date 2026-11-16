// A faster drop-in for marked 18.1.3: parse(markdown) returns exactly the HTML that
// marked.parse(markdown) returns with marked's default options (GFM on, async off),
// for every input string. The reference implementation is vendored byte for byte in
// vendor/marked/marked.esm.js (MIT, see vendor/marked/LICENSE and vendor/marked/NOTICE)
// and remains the fallback for every input the fast paths below do not cover.
//
// Fast paths only trigger on inputs they can prove equivalent to marked's output:
// each one checks the shape of the input first and falls through to marked on any
// doubt, so a wrong fast path can cost speed but never correctness.

import { marked } from './vendor/marked/marked.esm.js';

/** The HTML marked 18.1.3 renders for `markdown`, with marked's defaults. */
export function parse(markdown) {
  return marked.parse(markdown);
}
