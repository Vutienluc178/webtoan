import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const BASE = 'tools';
const GRADES = ['10','11','12'];

function walkHtml(dir, grade) {
  const abs = join(ROOT, dir);
  if (!readdirSync(abs, { withFileTypes: true }).length) return [];
  return readdirSync(abs, { withFileTypes: true }).flatMap(d => {
    const p = join(dir, d.name);
    if (d.isDirectory()) return walkHtml(p, grade);
    if (extname(d.name).toLowerCase() !== '.html') return [];
    const full = join(ROOT, p);
    const html = readFileSync(full, 'utf8');

    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : d.name.replace(/\.html$/i,'');
    const metaTagsMatch = html.match(/<meta[^>]+name=["']tool-tags["'][^>]+>/i);
    let tags = [];
    if (metaTagsMatch) {
      const contentMatch = metaTagsMatch[0].match(/content=["']([^"']+)["']/i);
      if (contentMatch) tags = contentMatch[1].split(',').map(s=>s.trim()).filter(Boolean);
    }
    const st = statSync(full);
    return [{
      title,
      path: p.replace(/^\/?/, ''),
      grade,
      tags,
      updatedAt: st.mtime.toISOString()
    }];
  });
}

const items = GRADES.flatMap(g => walkHtml(join(BASE, g), g));
items.sort((a,b) => a.grade.localeCompare(b.grade) || a.title.localeCompare(b.title));

writeFileSync('manifest.json', JSON.stringify(items, null, 2), 'utf8');
console.log(`Generated manifest with ${items.length} items`);
