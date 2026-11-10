import { homedir } from 'node:os';
import { join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import yaml from 'js-yaml';
import puppeteer from 'puppeteer';
import { startAstroDev } from './lib/dev-server.mjs';
import { assertPdfParsable } from './lib/check-pdf-fonts.mjs';
import { lintVariants, report } from './lint-variants.mjs';

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: npm run resume:pdf <slug>');
  console.error('       e.g. npm run resume:pdf clutch');
  process.exit(1);
}

// Gate: if a tailored variant exists for this slug, its facts must match base.
const variantPath = `./src/data/resume-${slug}.yaml`;
if (existsSync(variantPath)) {
  const lint = lintVariants([variantPath]);
  if (!lint.ok) {
    report(lint);
    console.error(`\nFix ${variantPath} (or pass --no-lint to skip) before generating the PDF.`);
    if (!process.argv.includes('--no-lint')) process.exit(1);
  }
}

// Prefer the cover letter's frontmatter company name for the filename; fall back to the slug.
const coverLetterPath = join(homedir(), 'Documents', 'JobApplications', slug, 'cover-letter.md');
let company = slug;
if (existsSync(coverLetterPath)) {
  const raw = readFileSync(coverLetterPath, 'utf-8');
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n/);
  const frontmatter = fmMatch ? (yaml.load(fmMatch[1]) || {}) : {};
  if (frontmatter.company) company = frontmatter.company;
}
const companyToken = String(company).replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');

const resume = yaml.load(readFileSync('./src/data/resume.yaml', 'utf-8'));
const filename = `${resume.basics.name.replace(/\s+/g, '_')}_Resume_${companyToken}.pdf`;
const outPath = join(homedir(), 'Downloads', filename);

const { url, cleanup } = await startAstroDev();

try {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.emulateMediaType('print');
  await page.evaluateHandle('document.fonts.ready');
  await page.pdf({
    path: outPath,
    format: 'Letter',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
  });
  await browser.close();
  assertPdfParsable(outPath);
  console.log(`Saved resume PDF to ${outPath} (fonts verified ATS-parsable)`);
} finally {
  cleanup();
}
