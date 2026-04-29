import { homedir } from 'node:os';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';
import puppeteer from 'puppeteer';
import { startAstroDev } from './lib/dev-server.mjs';

const resume = yaml.load(readFileSync('./src/data/resume.yaml', 'utf-8'));
const filename = `${resume.basics.name.replace(/\s+/g, '_')}_Resume.pdf`;
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
  console.log(`Saved resume PDF to ${outPath}`);
} finally {
  cleanup();
}
