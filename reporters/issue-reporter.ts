import type { Reporter, FullConfig, Suite, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

/**
 * Reporter Playwright : crée un ticket Jira ou Linear pour chaque test en échec définitif.
 *
 * - Inactif si ISSUE_TRACKER est vide : aucun effet sur les runs locaux.
 * - Déduplication : un ticket dont le titre existe déjà n'est pas recréé.
 * - Titre du ticket = "[auto] <titre du test>" ; corps = projet, fichier, erreur, chemin des traces.
 *
 * Variables d'environnement : voir .env.example et 02-outils/{jira,linear}-setup.md.
 */

type Failure = {
  title: string;
  project: string;
  file: string;
  error: string;
  attachments: string[];
};

interface Tracker {
  name: string;
  exists(title: string): Promise<boolean>;
  create(f: Failure, body: string): Promise<string>;
}

const env = (k: string, fallback = ''): string => process.env[k] ?? fallback;

function required(keys: string[]): void {
  const missing = keys.filter((k) => !env(k));
  if (missing.length) throw new Error(`issue-reporter : variables manquantes ${missing.join(', ')}`);
}

// ---------- Jira Cloud ----------
class JiraTracker implements Tracker {
  name = 'jira';
  private base = env('JIRA_BASE_URL').replace(/\/$/, '');
  private auth = 'Basic ' + Buffer.from(`${env('JIRA_EMAIL')}:${env('JIRA_API_TOKEN')}`).toString('base64');
  private project = env('JIRA_PROJECT_KEY');
  private issueType = env('JIRA_ISSUE_TYPE', 'Bug');

  constructor() {
    required(['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN', 'JIRA_PROJECT_KEY']);
  }

  private async call(path: string, init: RequestInit): Promise<any> {
    const res = await fetch(`${this.base}/rest/api/3${path}`, {
      ...init,
      headers: { Authorization: this.auth, 'Content-Type': 'application/json', Accept: 'application/json', ...(init.headers ?? {}) },
    });
    if (!res.ok) throw new Error(`Jira ${init.method ?? 'GET'} ${path} → ${res.status} ${await res.text()}`);
    return res.json();
  }

  async exists(title: string): Promise<boolean> {
    const jql = `project = "${this.project}" AND summary ~ "\\"${title.replace(/"/g, '\\"')}\\"" AND statusCategory != Done`;
    const data = await this.call('/search/jql', { method: 'POST', body: JSON.stringify({ jql, maxResults: 1, fields: ['key'] }) });
    return (data.issues?.length ?? 0) > 0;
  }

  async create(f: Failure, body: string): Promise<string> {
    const doc = {
      type: 'doc',
      version: 1,
      content: body.split('\n').map((line) => ({ type: 'paragraph', content: line ? [{ type: 'text', text: line }] : [] })),
    };
    const data = await this.call('/issue', {
      method: 'POST',
      body: JSON.stringify({
        fields: {
          project: { key: this.project },
          issuetype: { name: this.issueType },
          summary: `[auto] ${f.title}`,
          description: doc,
          labels: ['qa', 'auto'],
        },
      }),
    });
    return `${this.base}/browse/${data.key}`;
  }
}

// ---------- Linear ----------
class LinearTracker implements Tracker {
  name = 'linear';
  private key = env('LINEAR_API_KEY');
  private team = env('LINEAR_TEAM_ID');
  private labels = env('LINEAR_LABEL_IDS').split(',').map((s) => s.trim()).filter(Boolean);

  constructor() {
    required(['LINEAR_API_KEY', 'LINEAR_TEAM_ID']);
  }

  private async gql(query: string, variables: Record<string, unknown>): Promise<any> {
    const res = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: { Authorization: this.key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    const data = await res.json();
    if (!res.ok || data.errors) throw new Error(`Linear → ${res.status} ${JSON.stringify(data.errors ?? data)}`);
    return data.data;
  }

  async exists(title: string): Promise<boolean> {
    const data = await this.gql(
      `query($team: ID!, $title: String!) {
        issues(filter: { team: { id: { eq: $team } }, title: { eq: $title }, state: { type: { nin: ["completed", "canceled"] } } }, first: 1) {
          nodes { id }
        }
      }`,
      { team: this.team, title: `[auto] ${title}` },
    );
    return data.issues.nodes.length > 0;
  }

  async create(f: Failure, body: string): Promise<string> {
    const data = await this.gql(
      `mutation($input: IssueCreateInput!) {
        issueCreate(input: $input) { success issue { url } }
      }`,
      {
        input: {
          teamId: this.team,
          title: `[auto] ${f.title}`,
          description: body,
          priority: 2,
          ...(this.labels.length ? { labelIds: this.labels } : {}),
        },
      },
    );
    return data.issueCreate.issue.url;
  }
}

// ---------- Reporter ----------
export default class IssueReporter implements Reporter {
  private failures = new Map<string, Failure>();
  private tracker: Tracker | null = null;

  onBegin(_config: FullConfig, _suite: Suite): void {
    const which = env('ISSUE_TRACKER').toLowerCase();
    if (!which) return;
    try {
      this.tracker = which === 'jira' ? new JiraTracker() : which === 'linear' ? new LinearTracker() : null;
      if (!this.tracker) console.warn(`issue-reporter : ISSUE_TRACKER="${which}" inconnu, remontée désactivée`);
    } catch (e) {
      console.warn(`issue-reporter : ${(e as Error).message} — remontée désactivée`);
    }
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    if (!this.tracker) return;
    // Ne remonter que les échecs définitifs (après retries), pas les flaky ni les skip.
    if (test.outcome() !== 'unexpected') return;
    const project = test.parent.project()?.name ?? 'default';
    const key = `${project}::${test.title}`;
    this.failures.set(key, {
      title: `${test.title} [${project}]`,
      project,
      file: `${test.location.file.split(/[\\/]/).slice(-2).join('/')}:${test.location.line}`,
      error: (result.errors[0]?.message ?? 'erreur inconnue').replace(/\u001b\[[0-9;]*m/g, '').slice(0, 2000),
      attachments: result.attachments.filter((a) => a.path).map((a) => `${a.name}: ${a.path}`),
    });
  }

  async onEnd(_result: FullResult): Promise<void> {
    if (!this.tracker || this.failures.size === 0) return;
    console.log(`\nissue-reporter : ${this.failures.size} échec(s) à remonter vers ${this.tracker.name}`);
    for (const f of this.failures.values()) {
      try {
        if (await this.tracker.exists(f.title)) {
          console.log(`  = déjà ouvert : ${f.title}`);
          continue;
        }
        const body = [
          `Sévérité : à qualifier (créé automatiquement par la suite Playwright)`,
          `Projet Playwright : ${f.project}`,
          `Fichier : ${f.file}`,
          `Environnement : ${env('BASE_URL', '(BASE_URL non défini)')} · CI : ${env('CI') ? 'oui' : 'non'} · commit : ${env('GITHUB_SHA', env('CI_COMMIT_SHA', 'local')).slice(0, 8)}`,
          ``,
          `Erreur :`,
          f.error,
          ``,
          f.attachments.length ? `Pièces jointes (dans les artefacts du run) :` : `Pièces jointes : aucune`,
          ...f.attachments.map((a) => `- ${a}`),
        ].join('\n');
        const url = await this.tracker.create(f, body);
        console.log(`  + créé : ${url}`);
      } catch (e) {
        console.warn(`  ! échec de création pour "${f.title}" : ${(e as Error).message}`);
      }
    }
  }

  printsToStdio(): boolean {
    return false;
  }
}
