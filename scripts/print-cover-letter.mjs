import { homedir } from 'node:os';
import { join } from 'node:path';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';
import yaml from 'js-yaml';
import puppeteer from 'puppeteer';
import { startAstroDev } from './lib/dev-server.mjs';

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: npm run cover-letter:pdf <slug>');
  console.error('       e.g. npm run cover-letter:pdf practice-better');
  process.exit(1);
}

const sourcePath = join(homedir(), 'Documents', 'JobApplications', slug, 'cover-letter.md');
if (!existsSync(sourcePath)) {
  console.error(`No cover letter found at ${sourcePath}`);
  console.error('Create that file (with optional --- frontmatter for company/date ---) and try again.');
  process.exit(1);
}

const stagedPath = './src/data/cover-letter-active.md';
const raw = readFileSync(sourcePath, 'utf-8');
writeFileSync(stagedPath, raw);

const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n/);
const frontmatter = fmMatch ? (yaml.load(fmMatch[1]) || {}) : {};
const company = frontmatter.company || slug;
const companyToken = String(company).replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');

const resume = yaml.load(readFileSync('./src/data/resume.yaml', 'utf-8'));
const filename = `${resume.basics.name.replace(/\s+/g, '_')}_Cover_Letter_${companyToken}.pdf`;
const outPath = join(homedir(), 'Downloads', filename);

const { url, cleanup } = await startAstroDev();

try {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(new URL('cover-letter', url).toString(), { waitUntil: 'networkidle0' });
  await page.emulateMediaType('print');
  await page.evaluateHandle('document.fonts.ready');
  await page.pdf({
    path: outPath,
    format: 'Letter',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0.75in', right: '0.75in', bottom: '0.75in', left: '0.75in' },
  });
  await browser.close();
  console.log(`Saved cover letter PDF to ${outPath}`);
} finally {
  cleanup();
  if (existsSync(stagedPath)) unlinkSync(stagedPath);
}
