import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
// SITE_ROOT: the site repo (defaults to the git checkout this skill lives in).
const SITE_ROOT = process.env.SITE_ROOT || new URL('../../../../../', import.meta.url).pathname.replace(/\/$/, '');
const doc = await pdfjs.getDocument('' + (process.argv[2]||SITE_ROOT + '/public/resume.pdf') + '').promise;
for (let i = 1; i <= doc.numPages; i++) { const c = await (await doc.getPage(i)).getTextContent(); console.log(c.items.map(t => t.str).join(' ')); }
