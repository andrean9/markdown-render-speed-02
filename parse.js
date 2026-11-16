// A faster drop-in for marked 18.1.3: parse(markdown) returns exactly the HTML that
// marked.parse(markdown) returns with marked's default options (GFM on, async off),
// for every input string. The reference implementation is vendored byte for byte in
// vendor/marked/marked.esm.js (MIT, see vendor/marked/LICENSE and vendor/marked/NOTICE).
//
// Instead of calling marked.parse(), this module drives marked's own Lexer and Parser
// directly, in the same order marked does: normalize carriage returns, lex the blocks,
// then lex the inline runs the blocks queued, then render. Driving the pieces directly
// lets the inline step below take a fast path for plain-text runs; every other run
// goes through marked's inline lexer unchanged, so the output is marked's output.

import { Lexer, Parser, defaults } from './vendor/marked/marked.esm.js';

/** marked's carriage-return normalization: CRLF and lone CR both become LF. */
const CARRIAGE_RETURN = /\r\n|\r/g;

/**
 * A run of inline text is plain when it contains none of these: every inline
 * tokenizer other than plain text needs at least one of them to match. Backslash
 * (escape, and backslash-newline breaks), `<` (raw HTML and autolinks), `[` and
 * `!` (links, images, reference links), backtick (code spans), `*` and `_`
 * (emphasis), `~` (strikethrough), `&` (numeric character references, which the
 * text tokenizer decodes), `@` (email autolinks), `www.` and `://` (bare URLs),
 * `mailto:` (email protocol), and two spaces before a newline (hard break). A run
 * with none of them is tokenized by marked as exactly one text token whose raw
 * and text are the run itself, so it can be emitted directly.
 */
const INLINE_SPECIAL = /[\\<\[!`*~_&@]|www\.|:\/\/|mailto:|  \n/;

/** The HTML marked 18.1.3 renders for `markdown`, with marked's defaults. */
export function parse(markdown) {
  const opt = { ...defaults };
  const lexer = new Lexer(opt);
  const src = markdown.replace(CARRIAGE_RETURN, '\n');
  const tokens = lexer.blockTokens(src, lexer.tokens);
  const queue = lexer.inlineQueue;
  for (let i = 0; i < queue.length; i++) {
    const entry = queue[i];
    lexer.state.inRawBlock = false;
    if (!INLINE_SPECIAL.test(entry.src)) {
      // Plain text: one text token, exactly what marked's inline lexer produces.
      entry.tokens.push({ type: 'text', raw: entry.src, text: entry.src });
    } else {
      lexer.inlineTokens(entry.src, entry.tokens);
    }
  }
  lexer.inlineQueue = [];
  return Parser.parse(tokens, opt);
}
