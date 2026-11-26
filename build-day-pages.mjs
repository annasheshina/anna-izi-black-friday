import { readFile, writeFile } from 'node:fs/promises';

const template = await readFile(new URL('./dist/index.html', import.meta.url), 'utf8');
for (const day of [1, 2]) {
  const html = template.replace('<head>', `<head><meta name="campaign-preview-day" content="${day}">`);
  await writeFile(new URL(`./dist/day-${day}.html`, import.meta.url), html);
}
