// Génère les pages HTML de la démonstration à partir des Markdown de examples/saucedemo.
// Usage : node site/build.js <dossier public>   (appelé par la CI après avoir copié site/ dans public/)
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const root = path.join(__dirname, '..');
const ex = path.join(root, 'examples', 'saucedemo');
const out = path.resolve(process.argv[2] || 'public');
fs.mkdirSync(out, { recursive: true });

const pages = [
  { src: 'tickets/tickets.md', dest: 'tickets.html', title: '12 tickets de bug' },
  { src: 'cas-de-test.md', dest: 'cas-de-test.html', title: '28 cas de test' },
  { src: 'plan-de-test.md', dest: 'plan-de-test.html', title: 'Plan de test' },
  { src: 'comptes-rendus.md', dest: 'comptes-rendus.html', title: 'Comptes-rendus de session' },
  { src: 'checklist-demarrage.md', dest: 'checklist-demarrage.html', title: 'Checklist de démarrage' },
  { src: 'rapport-fin-mission.md', dest: 'rapport-fin-mission.html', title: 'Rapport de fin de mission' },
];

// Captures des tickets, servies à côté des pages.
const caps = path.join(ex, 'tickets', 'captures');
if (fs.existsSync(caps)) {
  fs.mkdirSync(path.join(out, 'captures'), { recursive: true });
  for (const f of fs.readdirSync(caps)) fs.copyFileSync(path.join(caps, f), path.join(out, 'captures', f));
}

const css = `
:root{--bg:#F7F8F6;--surface:#fff;--ink:#14201F;--muted:#5B6866;--line:#D8DEDC;--accent:#0F766E;--accent-ink:#0B5B55;--accent-soft:#DDF1ED;--crit:#B42318}
@media (prefers-color-scheme:dark){:root{--bg:#0F1615;--surface:#161E1D;--ink:#E8EEEC;--muted:#98A6A3;--line:#263331;--accent:#3FB8AA;--accent-ink:#7ED4C9;--accent-soft:#163C38;--crit:#F58A7C}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:"Segoe UI",system-ui,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55}
.wrap{max-width:960px;margin:0 auto;padding:28px 24px 64px}
.top{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:center;font-size:.9rem;color:var(--muted);border-bottom:1px solid var(--line);padding-bottom:14px;margin-bottom:24px}
.top a{color:var(--accent-ink);text-decoration:none}
.top a:hover{text-decoration:underline}
h1{font-family:Georgia,"Times New Roman",serif;font-size:clamp(1.6rem,3.5vw,2.2rem);line-height:1.2;margin:0 0 6px;text-wrap:balance}
h2{font-family:Georgia,"Times New Roman",serif;font-size:1.3rem;margin:32px 0 10px;padding-bottom:4px;border-bottom:1.5px solid var(--accent);color:var(--accent-ink)}
h3{font-size:1.05rem;margin:22px 0 8px}
p{margin:0 0 10px}
blockquote{margin:12px 0;padding:10px 14px;border-left:3px solid var(--accent);background:var(--accent-soft);border-radius:4px}
blockquote p{margin:0}
.table-wrap{overflow-x:auto;margin:8px 0 16px;border:1px solid var(--line);border-radius:8px;background:var(--surface)}
table{border-collapse:collapse;width:100%;font-size:.88rem;min-width:600px}
th,td{border-bottom:1px solid var(--line);padding:7px 10px;vertical-align:top;text-align:left}
th{background:var(--bg);font-weight:600;white-space:nowrap}
tr:last-child td{border-bottom:0}
code{font-family:Consolas,"Courier New",monospace;font-size:.86em;background:var(--surface);border:1px solid var(--line);border-radius:4px;padding:1px 5px}
pre{background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:12px 14px;overflow-x:auto;font-size:.85rem}
pre code{border:0;padding:0;background:none}
ul,ol{margin:0 0 10px;padding-left:22px}
li{margin:3px 0}
hr{border:0;border-top:1px solid var(--line);margin:28px 0}
a{color:var(--accent-ink)}
strong{color:var(--ink)}
img{max-width:100%;border:1px solid var(--line);border-radius:6px}
.cap{display:inline-block;margin:2px 8px 2px 0}
`;

marked.use({ gfm: true });

for (const p of pages) {
  const file = path.join(ex, p.src);
  if (!fs.existsSync(file)) { console.warn('absent : ' + p.src); continue; }
  let md = fs.readFileSync(file, 'utf8');
  // Les mentions de captures deviennent des liens vers les images servies ici.
  md = md.replace(/`captures\/([\w.-]+\.png)`/g, (_, f) => `<a class="cap" href="captures/${f}">${f}</a>`);
  const body = marked.parse(md).split('<table>').join('<div class="table-wrap"><table>').split('</table>').join('</table></div>');
  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${p.title} · Exemple de mission QA</title>
<style>${css}</style>
</head>
<body>
<main class="wrap">
  <nav class="top"><a href="./">← Exemple de mission QA · Swag Labs</a><span>Hugo Gaveau · ingénieur QA freelance</span></nav>
  ${body}
  <nav class="top" style="border-bottom:0;border-top:1px solid var(--line);padding-top:14px;margin-top:40px"><a href="./">← Retour à la démonstration</a><a href="https://github.com/G-Hugo/playwright-qa-kit/blob/main/examples/saucedemo/${p.src}">Source Markdown sur GitHub</a></nav>
</main>
</body>
</html>`;
  fs.writeFileSync(path.join(out, p.dest), html);
  console.log('page : ' + p.dest);
}
