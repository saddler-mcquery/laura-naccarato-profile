// Verify a generated PDF only embeds fonts that ATS parsers can read.
//
// Chrome/Puppeteer on macOS turns system fonts (system-ui, -apple-system,
// San Francisco) into Type 3 glyph fonts with a custom encoding. iCIMS and
// similar parsers read those as garbled text (dropped letters, random
// capitals). Real TrueType/OpenType fonts embed as CIDFontType2 with a
// ToUnicode map and parse cleanly. Keep the print font-family in
// src/styles/global.css on a real font (Arial) and let this gate catch drift.

import { readFileSync, unlinkSync } from 'node:fs';
import { basename } from 'node:path';

/** Return a list of problem strings for a PDF at `path`. Empty = clean. */
export function checkPdfFonts(path) {
  const bytes = readFileSync(path, 'latin1');
  const problems = [];
  const type3 = (bytes.match(/\/Subtype\s*\/Type3\b/g) || []).length;
  if (type3 > 0) {
    problems.push(`${type3} Type 3 font object(s) embedded — ATS parsers will garble the text`);
  }
  const trueType = (bytes.match(/\/Subtype\s*\/(CIDFontType2|TrueType)\b/g) || []).length;
  if (trueType === 0) {
    problems.push('no TrueType fonts embedded — text may not be extractable');
  }
  if (!/\/ToUnicode\b/.test(bytes)) {
    problems.push('no ToUnicode map — text cannot be mapped back to characters');
  }
  return problems;
}

/**
 * Gate for the print scripts: delete the PDF and exit non-zero if it would
 * not parse. A bad PDF must never sit in ~/Downloads waiting to be uploaded.
 */
export function assertPdfParsable(path) {
  const problems = checkPdfFonts(path);
  if (problems.length === 0) return;
  console.error(`\n✘ ${basename(path)} is not ATS-parsable:`);
  for (const p of problems) console.error(`    - ${p}`);
  console.error('\nCheck the @media print font-family in src/styles/global.css: it must be a real');
  console.error('TrueType font (Arial), never system-ui / -apple-system. Deleted the bad PDF.');
  unlinkSync(path);
  process.exit(1);
}

// --- CLI: node scripts/lib/check-pdf-fonts.mjs <file.pdf> [...] ---
if (process.argv[1] && basename(process.argv[1]) === 'check-pdf-fonts.mjs') {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error('Usage: node scripts/lib/check-pdf-fonts.mjs <file.pdf> [...]');
    process.exit(1);
  }
  let ok = true;
  for (const f of files) {
    const problems = checkPdfFonts(f);
    if (problems.length === 0) {
      console.log(`✔ ${basename(f)}`);
    } else {
      ok = false;
      console.log(`✘ ${basename(f)}`);
      for (const p of problems) console.log(`    - ${p}`);
    }
  }
  process.exit(ok ? 0 : 1);
}
