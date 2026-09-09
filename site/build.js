// Génère les pages HTML de la démonstration à partir des Markdown de examples/saucedemo.
// Usage : node site/build.js <dossier public>   (appelé par la CI après avoir copié site/ dans public/)
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const root = path.join(__dirname, '..');
const ex = path.join(root, 'examples', 'saucedemo');
const out = path.resolve(process.argv[2] || 'public');
fs.mkdirSync(out, { recursive: true });
marked.use({ gfm: true });

const pages = [
  { src: 'tickets/tickets.md', dest: 'tickets.html', title: '12 tickets de bug', render: renderTickets },
  { src: 'cas-de-test.md', dest: 'cas-de-test.html', title: '28 cas de test', render: renderDoc },
  { src: 'plan-de-test.md', dest: 'plan-de-test.html', title: 'Plan de test', render: renderDoc },
  { src: 'comptes-rendus.md', dest: 'comptes-rendus.html', title: 'Comptes-rendus de session', render: renderDoc },
  { src: 'checklist-demarrage.md', dest: 'checklist-demarrage.html', title: 'Checklist de démarrage', render: renderDoc },
  { src: 'rapport-fin-mission.md', dest: 'rapport-fin-mission.html', title: 'Rapport de fin de mission', render: renderDoc },
];

// Captures des tickets, servies à côté des pages.
const caps = path.join(ex, 'tickets', 'captures');
if (fs.existsSync(caps)) {
  fs.mkdirSync(path.join(out, 'captures'), { recursive: true });
  for (const f of fs.readdirSync(caps)) fs.copyFileSync(path.join(caps, f), path.join(out, 'captures', f));
}

const css = `
:root{--bg:#F7F8F6;--surface:#fff;--ink:#14201F;--muted:#5B6866;--line:#D8DEDC;--accent:#0F766E;--accent-ink:#0B5B55;--accent-soft:#DDF1ED;
--crit:#B42318;--crit-soft:#FCE9E6;--maj:#B54708;--maj-soft:#FDEFDF;--min:#4B5563;--min-soft:#E5E7EB;--ok:#0F766E;--warn:#B54708}
@media (prefers-color-scheme:dark){:root{--bg:#0F1615;--surface:#161E1D;--ink:#E8EEEC;--muted:#98A6A3;--line:#263331;--accent:#3FB8AA;--accent-ink:#7ED4C9;--accent-soft:#163C38;
--crit:#F58A7C;--crit-soft:#3A1A17;--maj:#F2B06B;--maj-soft:#3A2712;--min:#B7C2BF;--min-soft:#263331;--ok:#3FB8AA;--warn:#F2B06B}}
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
.note{margin:12px 0 20px;padding:12px 16px;border-left:3px solid var(--accent);background:var(--accent-soft);border-radius:4px;max-width:46em}
.note p{margin:0 0 6px}.note p:last-child{margin:0}
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
img{max-width:100%}
.st-ok{color:var(--ok);font-weight:700}.st-ko{color:var(--crit);font-weight:700}.st-warn{color:var(--warn);font-weight:700}
/* tickets */
.chip{display:inline-block;padding:2px 10px;border-radius:999px;font-family:Consolas,"Courier New",monospace;font-size:.74rem;letter-spacing:.04em;font-weight:600;white-space:nowrap}
.chip-bloquant,.chip-critique{background:var(--crit-soft);color:var(--crit)}
.chip-majeur{background:var(--maj-soft);color:var(--maj)}
.chip-mineur{background:var(--min-soft);color:var(--min)}
.summary table{min-width:0}
.summary td:first-child{white-space:nowrap;font-family:Consolas,"Courier New",monospace;font-size:.85rem}
.summary a{text-decoration:none}
.counts{display:flex;gap:10px;flex-wrap:wrap;margin:6px 0 18px}
.ticket{background:var(--surface);border:1px solid var(--line);border-radius:12px;margin:22px 0;overflow:hidden;scroll-margin-top:16px}
.ticket-head{display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid var(--line);background:var(--bg);flex-wrap:wrap}
.ticket-head .key{font-family:Consolas,"Courier New",monospace;font-weight:700;color:var(--accent-ink)}
.ticket-head .prio{font-family:Consolas,"Courier New",monospace;font-size:.78rem;color:var(--muted);margin-left:auto}
.ticket-title{font-size:1.12rem;font-weight:600;line-height:1.35;padding:14px 18px 6px}
.ticket-meta{display:grid;grid-template-columns:auto 1fr;gap:4px 16px;padding:6px 18px 12px;font-size:.86rem}
.ticket-meta dt{color:var(--muted);margin:0}
.ticket-meta dd{margin:0}
.ticket-sec{padding:10px 18px;border-top:1px dashed var(--line)}
.ticket-sec .lbl{display:block;font-family:Consolas,"Courier New",monospace;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:4px}
.ticket-sec ol{margin:0;padding-left:22px}
.ticket-sec p{margin:0}
.ticket-got{background:var(--crit-soft)}
.ticket-got p{color:var(--crit)}
.ticket-exp{background:var(--accent-soft)}
.ticket-exp p{color:var(--accent-ink)}
.ticket-notes p{color:var(--muted);font-size:.93rem}
.shots{display:flex;gap:10px;flex-wrap:wrap;margin-top:6px}
.shots a{display:block;border:1px solid var(--line);border-radius:6px;overflow:hidden;background:#fff}
.shots img{display:block;height:130px;width:auto;max-width:260px;object-fit:cover;object-position:top left}
@media (max-width:600px){.ticket-meta{grid-template-columns:1fr}.ticket-meta dt{margin-top:6px}}
`;

const statuses = (html) => html
  .replace(/(<td[^>]*>)\s*✔/g, '$1<span class="st-ok">✔</span>')
  .replace(/(<td[^>]*>)\s*✘/g, '$1<span class="st-ko">✘</span>')
  .replace(/(<td[^>]*>)\s*⚠/g, '$1<span class="st-warn">⚠</span>');

const wrapTables = (html) => html.split('<table>').join('<div class="table-wrap"><table>').split('</table>').join('</table></div>');

function renderDoc(md) {
  md = md.replace(/`captures\/([\w.-]+\.png)`/g, (_, f) => `<a href="captures/${f}">${f}</a>`);
  return statuses(wrapTables(marked.parse(md)));
}

function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function inline(s) { return marked.parseInline(s); }
function sevClass(s) { return 'chip chip-' + s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

function renderTickets(md) {
  const blocks = md.split(/\n---\n/).map((b) => b.trim());
  const intro = blocks.shift();
  const tickets = blocks.map(parseTicket).filter(Boolean);

  const counts = {};
  for (const t of tickets) counts[t.sev] = (counts[t.sev] || 0) + 1;
  const order = ['Bloquant', 'Critique', 'Majeur', 'Mineur'];

  let html = marked.parse(intro.replace(/^# .*\n/, '').replace('Captures dans `captures/`. ', ''));
  html = `<h1>12 tickets de bug</h1>
<div class="note">
<p><strong>Format et outil.</strong> Ces tickets sont rédigés au format Linear, parce que ce client n'avait pas d'outil. En mission, ils sont créés directement dans l'outil de l'équipe : Jira, Mantis Bug Tracker, GitHub Issues, Azure DevOps, Redmine, ou un tableau partagé s'il n'y a rien. La structure reste la même partout : un titre qui dit le symptôme, la sévérité, les étapes, l'obtenu, l'attendu, une preuve.</p>
</div>
${html}
<div class="counts">${order.filter((s) => counts[s]).map((s) => `<span class="${sevClass(s)}">${counts[s]} ${s.toLowerCase()}${counts[s] > 1 ? 's' : ''}</span>`).join('')}</div>
<div class="table-wrap summary"><table><thead><tr><th>Ticket</th><th>Sévérité</th><th>Titre</th></tr></thead><tbody>
${tickets.map((t) => `<tr><td><a href="#${t.id}">${t.id}</a></td><td><span class="${sevClass(t.sev)}">${t.sev}</span></td><td><a href="#${t.id}">${inline(t.title)}</a></td></tr>`).join('\n')}
</tbody></table></div>
${tickets.map(ticketHtml).join('\n')}`;
  return html;
}

function parseTicket(block) {
  const m = block.match(/^## (SD-\d+) · (.+)$/m);
  if (!m) return null;
  const t = { id: m[1], title: m[2].trim(), meta: [], steps: '', got: '', exp: '', shots: [], notes: '', sev: 'Mineur', prio: '' };
  const paras = block.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  for (const p of paras) {
    if (p.startsWith('## ')) continue;
    if (/^\*\*Étapes\*\*/.test(p)) { t.steps = marked.parse(p.replace(/^\*\*Étapes\*\*\s*/, '')); continue; }
    if (/^\*\*Obtenu\*\*/.test(p)) { t.got = inline(p.replace(/^\*\*Obtenu\*\*\s*/, '')); continue; }
    if (/^\*\*Attendu\*\*/.test(p)) { t.exp = inline(p.replace(/^\*\*Attendu\*\*\s*/, '')); continue; }
    if (/^\*\*Pièces jointes\*\*/.test(p)) { t.shots = [...p.matchAll(/captures\/([\w.-]+\.png)/g)].map((x) => x[1]); continue; }
    if (/^\*\*Notes\*\*/.test(p)) { t.notes = inline(p.replace(/^\*\*Notes\*\*\s*:\s*/, '')); continue; }
    if (/^\*\*(Sévérité|Compte)\*\*/.test(p)) {
      for (const x of p.matchAll(/\*\*([^*]+)\*\*\s*:\s*([\s\S]*?)(?=\s*·\s*\*\*|\n|$)/g)) {
        const k = x[1].trim(), v = x[2].trim();
        if (k === 'Sévérité') t.sev = v;
        else if (k === 'Priorité suggérée') t.prio = v;
        else if (k !== 'Labels') t.meta.push([k, v]);
      }
      continue;
    }
  }
  return t;
}

function ticketHtml(t) {
  return `<article class="ticket" id="${t.id}">
  <div class="ticket-head"><span class="key">${t.id}</span><span class="${sevClass(t.sev)}">${t.sev}</span>${t.prio ? `<span class="prio">priorité suggérée ${esc(t.prio)}</span>` : ''}</div>
  <div class="ticket-title">${inline(t.title)}</div>
  <dl class="ticket-meta">${t.meta.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${inline(v)}</dd>`).join('')}</dl>
  ${t.steps ? `<div class="ticket-sec"><span class="lbl">Étapes pour reproduire</span>${t.steps}</div>` : ''}
  ${t.got ? `<div class="ticket-sec ticket-got"><span class="lbl">Obtenu</span><p>${t.got}</p></div>` : ''}
  ${t.exp ? `<div class="ticket-sec ticket-exp"><span class="lbl">Attendu</span><p>${t.exp}</p></div>` : ''}
  ${t.shots.length ? `<div class="ticket-sec"><span class="lbl">Captures</span><div class="shots">${t.shots.map((f) => `<a href="captures/${f}" title="${f}"><img src="captures/${f}" alt="${f}" loading="lazy"></a>`).join('')}</div></div>` : ''}
  ${t.notes ? `<div class="ticket-sec ticket-notes"><span class="lbl">Notes</span><p>${t.notes}</p></div>` : ''}
</article>`;
}

for (const p of pages) {
  const file = path.join(ex, p.src);
  if (!fs.existsSync(file)) { console.warn('absent : ' + p.src); continue; }
  const body = p.render(fs.readFileSync(file, 'utf8'));
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
