// Live project data for the BMO chat, read from Jake's GitHub. Only PUBLIC repos
// are ever read (the /users/:user/repos endpoint never returns private ones, and
// we filter again), so nothing private can reach the chat even with a token.
// GITHUB_TOKEN is optional: it only raises GitHub's rate limit (60 -> 5000/hr).
// The leading underscore keeps Vercel from serving this file as its own route.

const OWNER = 'Jekx-geidi';
const EXCLUDE = new Set(['TEST']);
const CACHE_MS = 15 * 60 * 1000;
const README_CHARS = 6000;

// Words too generic to identify one repo on their own.
const GENERIC = new Set([
  'ai', 'app', 'apps', 'web', 'webapp', 'website', 'site', 'system', 'agent', 'project', 'projects',
  'the', 'and', 'for', 'of', 'poc', 'analyzer', 'improvement', 'management', 'matching', 'item', 'items',
  'game', 'seo', 'api', 'portfolio', 'jake', 'his', 'about', 'what', 'tell', 'me',
  'link', 'links', 'live', 'code', 'repo', 'github', 'demo',
]);

export type Repo = {
  name: string;
  description: string;
  url: string;
  homepage: string;
  language: string;
  updated: string;
  aliases: string[];
};

type Cached<T> = { at: number; value: T };
let repoCache: Cached<Repo[]> | null = null;
const readmeCache = new Map<string, Cached<string>>();

const headers = (token?: string, raw = false): Record<string, string> => ({
  Accept: raw ? 'application/vnd.github.raw' : 'application/vnd.github+json',
  'User-Agent': 'jake-portfolio-bmo',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// Ways a visitor might name a repo: distinctive words from its name, ALL-CAPS
// acronyms and **bold phrases** from its description, and its live-site subdomain.
const aliasesFor = (name: string, description: string, homepage: string) => {
  const out = new Set<string>();
  const words = name.split(/[-_.\s]+/).map((w) => w.toLowerCase()).filter(Boolean);
  words.filter((w) => w.length >= 3 && !GENERIC.has(w)).forEach((w) => out.add(w));
  words.slice(1).forEach((w, i) => out.add(words[i] + w)); // "Lost-Link" -> "lostlink"
  (description.match(/\b[A-Z]{3,}\b/g) ?? []).map((w) => w.toLowerCase()).filter((w) => !GENERIC.has(w)).forEach((w) => out.add(w));
  (description.match(/\*\*([^*]+)\*\*/g) ?? []).forEach((p) => {
    const phrase = p.replace(/\*/g, '').trim().toLowerCase();
    out.add(phrase);
    out.add(phrase.split(/\s+/).slice(0, 3).join(' ')); // "before you dig"
  });
  const sub = homepage.match(/^https?:\/\/([^./]+)/)?.[1];
  if (sub) sub.split('-').filter((w) => w.length >= 4 && !GENERIC.has(w)).forEach((w) => out.add(w.toLowerCase()));
  return [...out].filter((a) => /[a-z]{3}/.test(a) && !GENERIC.has(a));
};

export async function getRepos(token?: string): Promise<Repo[]> {
  if (repoCache && Date.now() - repoCache.at < CACHE_MS) return repoCache.value;
  const res = await fetch(`https://api.github.com/users/${OWNER}/repos?type=owner&sort=pushed&per_page=100`, {
    headers: headers(token),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`GitHub repos ${res.status}`);
  const data = (await res.json()) as Array<Record<string, any>>;
  const repos = data
    .filter((r) => !r.private && !r.fork && !r.archived && !EXCLUDE.has(r.name))
    .map((r) => {
      const description = String(r.description ?? '').trim();
      const homepage = String(r.homepage ?? '').trim();
      return {
        name: r.name,
        description,
        url: r.html_url,
        homepage,
        language: r.language ?? '',
        updated: String(r.pushed_at ?? '').slice(0, 10),
        aliases: aliasesFor(r.name, description, homepage),
      };
    });
  repoCache = { at: Date.now(), value: repos };
  return repos;
}

// The repo the visitor's message names, if exactly one scores best. Deterministic: plain word/phrase matching.
export function matchRepo(repos: Repo[], message: string): Repo | null {
  const text = ` ${message.toLowerCase().replace(/[^a-z0-9\s.-]/g, ' ')} `;
  let best: Repo | null = null;
  let bestScore = 0;
  let tie = false;
  for (const repo of repos) {
    const score = repo.aliases.reduce((n, a) => (text.includes(` ${a} `) || (a.includes(' ') && text.includes(a)) ? n + a.length : n), 0);
    if (score > bestScore) { best = repo; bestScore = score; tie = false; }
    else if (score && score === bestScore) tie = true;
  }
  return bestScore && !tie ? best : null;
}

export async function getReadme(repo: Repo, token?: string): Promise<string> {
  const hit = readmeCache.get(repo.name);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value;
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${repo.name}/readme`, {
    headers: headers(token, true),
    signal: AbortSignal.timeout(8000),
  });
  const text = res.ok ? (await res.text()).replace(/<[^>]+>/g, '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').slice(0, README_CHARS) : '';
  readmeCache.set(repo.name, { at: Date.now(), value: text });
  return text;
}

export const catalogText = (repos: Repo[]) =>
  repos
    .map((r) => `- ${r.name}: ${r.description || '(no description)'} | code: ${r.url}${r.homepage ? ` | live: ${r.homepage}` : ''}${r.language ? ` | ${r.language}` : ''} | last updated ${r.updated}`)
    .join('\n');
