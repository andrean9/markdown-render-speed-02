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

const cases = JSON.parse(readFileSync(join(inputDir, 'cases.json'), 'utf8')) as Case[];
const out: string[] = new Array(cases.length);
for (let i = 0; i < cases.length; i++) {
  out[i] = parse(cases[i]!.markdown);
}
writeFileSync(join(outputDir, 'html.json'), JSON.stringify(out));
