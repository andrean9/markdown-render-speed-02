// Driver for the markdown-render-speed-02 entry. The harness runs `node /bot/main.ts`
// on Node 22. It reads every case from cases.json in the input directory, renders each
// one alone through parse() from parse.js, and writes the HTML strings, in the cases'
// order, as a JSON array to html.json in the output directory. Outside the sandbox the
// MAKEFUN_INPUT_DIR and MAKEFUN_OUTPUT_DIR environment variables stand in for /input
// and /output. Nothing here is timed separately: the whole run is the entry's time.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from './parse.js';

const inputDir = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

interface Case {
  id: string;
  markdown: string;
}

// A short representative document, parsed once before the timed cases so the JIT
// compiler optimizes the parser's hot paths (lists, emphasis, links, tables) on
// realistic shapes before the real work starts. It is a fixed synthetic string,
// not any case's input, and its output is discarded: it changes no result, it only
// moves JIT warm-up ahead of the timed loop. Measured locally: it costs ~30 ms and
// saves ~100 ms of parse time over the 720 cases.
const WARMUP = `# Warmup Heading

This is a paragraph with **bold** and *italic* and ~~strikethrough~~ and \`code\`
and [a link](https://example.com/page) and ![an image](https://example.com/i.png)
and an autolink <https://example.com> and www.example.com and user@example.com
and an entity &copy; and &#65; and a hard break.  
Next line here.

## Second Heading

- bullet one with **emphasis**
- bullet two with [link](https://example.com)
  - nested bullet
  - another nested
- [ ] task unchecked
- [x] task checked

1. ordered one
2. ordered two with \`code span\`

| Col A | Col B | Col C |
|:------|------:|:-:|
| a | b | c |
| d | e | f |

> A blockquote with **bold** text.
> > Nested quote here.
> More quote.

\`\`\`js
const x = 1;
// fenced code
\`\`\`

---

Setext heading
=============

Another paragraph to finish the warmup document off properly.
`.repeat(8);

parse(WARMUP);

const cases = JSON.parse(readFileSync(join(inputDir, 'cases.json'), 'utf8')) as Case[];
const out: string[] = new Array(cases.length);
for (let i = 0; i < cases.length; i++) {
  out[i] = parse(cases[i]!.markdown);
}
writeFileSync(join(outputDir, 'html.json'), JSON.stringify(out));
