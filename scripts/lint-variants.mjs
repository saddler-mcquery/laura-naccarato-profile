#!/usr/bin/env node
// Lint tailored resume variants against the base resume.
//
// Rule: tailoring may change label, summary, bullet wording/order, and skill
// ordering. It must NEVER change facts — company names, titles, dates,
// location, education, or profile links. Those come from src/data/resume.yaml.
//
// Usage:
//   npm run resume:lint            # lint every src/data/resume-*.yaml
//   npm run resume:lint -- knotch  # lint one variant
//
// Exit code 1 on any failure, so it can gate resume:pdf.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import yaml from 'js-yaml';

const DATA_DIR = './src/data';
const BASE_PATH = join(DATA_DIR, 'resume.yaml');

const load = (p) => yaml.load(readFileSync(p, 'utf-8'));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';

/** Return a list of problem strings for one variant. Empty list = clean. */
export function lintVariant(base, variant) {
  const problems = [];
  const vb = variant.basics ?? {};
  const bb = base.basics ?? {};

  // --- basics: identity fields must match, location must exist ---
  if (vb.name !== bb.name) problems.push(`basics.name differs ("${vb.name}" vs base "${bb.name}")`);
  if (vb.url !== bb.url) problems.push(`basics.url differs ("${vb.url}" vs base "${bb.url}")`);
  if (isBlank(vb.location)) problems.push('basics.location is missing (ATS location filters need it)');
  else if (vb.location !== bb.location) problems.push(`basics.location differs ("${vb.location}" vs base "${bb.location}")`);
  if (!same(vb.profiles, bb.profiles)) problems.push('basics.profiles differ from base (GitHub/LinkedIn links)');

  // --- education must be identical ---
  if (!same(variant.education, base.education)) problems.push('education differs from base');

  // --- work: same jobs, same order, same facts; bullets are free ---
  const vw = variant.work ?? [];
  const bw = base.work ?? [];
  if (vw.length !== bw.length) {
    problems.push(`work has ${vw.length} entries, base has ${bw.length}`);
  }
  const n = Math.min(vw.length, bw.length);
  for (let i = 0; i < n; i++) {
    const v = vw[i];
    const b = bw[i];
    const where = `work[${i}] (${b.company})`;
    for (const key of ['company', 'position', 'startDate', 'endDate']) {
      if (v[key] !== b[key]) {
        problems.push(`${where}.${key} differs ("${v[key] ?? ''}" vs base "${b[key] ?? ''}")`);
      }
    }
    if (isBlank(v.endDate)) problems.push(`${where}.endDate is blank — renders as "Present"`);
    if (!Array.isArray(v.highlights) || v.highlights.length === 0) problems.push(`${where} has no highlights`);
  }
  return problems;
}

/** Lint the given variant paths (or all resume-*.yaml). Returns { ok, results }. */
export function lintVariants(paths) {
  if (!existsSync(BASE_PATH)) throw new Error(`Base resume not found at ${BASE_PATH}`);
  const base = load(BASE_PATH);
  const targets = paths?.length
    ? paths
    : readdirSync(DATA_DIR)
        .filter((f) => /^resume-.+\.ya?ml$/.test(f))
        .sort()
        .map((f) => join(DATA_DIR, f));

  const results = targets.map((p) => {
    let problems;
    try {
      problems = lintVariant(base, load(p));
    } catch (err) {
      problems = [`could not parse: ${err.message}`];
    }
    return { path: p, problems };
  });
  return { ok: results.every((r) => r.problems.length === 0), results };
}

export function report({ ok, results }) {
  for (const { path, problems } of results) {
    const name = basename(path);
    if (problems.length === 0) {
      console.log(`✔ ${name}`);
    } else {
      console.log(`✘ ${name}`);
      for (const p of problems) console.log(`    - ${p}`);
    }
  }
  const bad = results.filter((r) => r.problems.length).length;
  console.log(ok ? `\nAll ${results.length} variants match base facts.` : `\n${bad} of ${results.length} variants drift from base.`);
}

// --- CLI ---
const isMain = process.argv[1] && basename(process.argv[1]) === 'lint-variants.mjs';
if (isMain) {
  const slug = process.argv[2];
  const paths = slug ? [join(DATA_DIR, `resume-${slug}.yaml`)] : undefined;
  if (paths && !existsSync(paths[0])) {
    console.error(`No variant at ${paths[0]}`);
    process.exit(1);
  }
  const outcome = lintVariants(paths);
  report(outcome);
  process.exit(outcome.ok ? 0 : 1);
}
