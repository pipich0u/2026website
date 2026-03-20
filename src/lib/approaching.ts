import { Client } from "@notionhq/client";

export interface SupplierRank {
  rank: number;
  supplier: string;
  value: number;
}

export interface ModelSeriesRanking {
  modelSeries: string;
  latency: SupplierRank[];    // P90 TTFT (s), ascending
  availability: SupplierRank[]; // availability %, descending
}

export interface AipingRanking {
  models: ModelSeriesRanking[];
  updated_at: string;
}

export async function getAipingRanking(): Promise<AipingRanking> {
  try {
    const res = await fetch(
      "https://www.aiping.cn/api/v1/entry_sys/available/testing/history",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: 1, size: 500 }),
      }
    );
    const json = await res.json();
    const raw: any[] = (json?.data ?? []).filter(
      (d: any) =>
        d.availability > 0 &&
        d.time_to_first_token > 0 &&
        !d.supplier_name?.includes("AI Ping") &&
        !d.supplier_name?.includes("aiping")
    );

    // Group by model_series
    const bySeriesMap = new Map<string, any[]>();
    for (const item of raw) {
      const key = item.model_series as string;
      if (!bySeriesMap.has(key)) bySeriesMap.set(key, []);
      bySeriesMap.get(key)!.push(item);
    }

    // Keep only series with 3+ suppliers (meaningful comparison)
    const filtered = [...bySeriesMap.entries()]
      .filter(([, items]) => items.length >= 3)
      .sort((a, b) => b[1].length - a[1].length) // sort by supplier count desc
      .slice(0, 12); // top 12 model series

    const models: ModelSeriesRanking[] = filtered.map(([modelSeries, items]) => {
      const byLatency = [...items]
        .sort((a, b) => a.time_to_first_token - b.time_to_first_token)
        .slice(0, 5)
        .map((item, i) => ({
          rank: i + 1,
          supplier: item.supplier_name,
          value: Math.round(item.time_to_first_token * 100) / 100,
        }));

      const byAvail = [...items]
        .sort((a, b) => b.availability - a.availability)
        .slice(0, 5)
        .map((item, i) => ({
          rank: i + 1,
          supplier: item.supplier_name,
          value: Math.round(item.availability * 100),
        }));

      return { modelSeries, latency: byLatency, availability: byAvail };
    });

    return { models, updated_at: new Date().toISOString().slice(0, 10) };
  } catch {
    return { models: [], updated_at: "" };
  }
}

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const communityDbId = process.env.NOTION_COMMUNITY_DB!;
const modelDbId = process.env.NOTION_MODEL_DB!;

export interface CommunityUpdate {
  title: string;
  slug: string;
  date: string;
  summary: string;
  community: string;
}

export interface ModelEntry {
  name: string;
  family: string;
  params: string;
  precision: string;
  type: string;
  releaseDate: string;
  isFlagship: boolean;
  order: number;
  logo?: string;
}

export interface ModelFamily {
  family: string;
  type: string;
  flagship: ModelEntry;
  models: ModelEntry[];
  logo?: string;
}

export async function getCommunityUpdates(): Promise<CommunityUpdate[]> {
  const response = await notion.databases.query({
    database_id: communityDbId,
    filter: { property: "Published", checkbox: { equals: true } },
    sorts: [{ property: "Date", direction: "descending" }],
  });

  return response.results.map((page: any) => {
    const p = page.properties;
    return {
      title: p.Title?.title?.[0]?.plain_text ?? "",
      slug: p.Slug?.rich_text?.[0]?.plain_text ?? "",
      date: p.Date?.date?.start ?? "",
      summary: p.Summary?.rich_text?.[0]?.plain_text ?? "",
      community: p.Community?.select?.name ?? "",
    };
  });
}

export async function getModelFamilies(): Promise<ModelFamily[]> {
  const response = await notion.databases.query({
    database_id: modelDbId,
    sorts: [
      { property: "Family", direction: "ascending" },
      { property: "Order", direction: "ascending" },
    ],
  });

  const entries: ModelEntry[] = response.results.map((page: any) => {
    const p = page.properties;
    return {
      name: p.Name?.title?.[0]?.plain_text ?? "",
      family: p.Family?.select?.name ?? "",
      params: p.Parameters?.rich_text?.[0]?.plain_text ?? "",
      precision: p.Precision?.rich_text?.[0]?.plain_text ?? "",
      type: p.Type?.select?.name ?? "",
      releaseDate: p["Release Date"]?.date?.start ?? "",
      isFlagship: p["Is Flagship"]?.checkbox ?? false,
      order: p.Order?.number ?? 0,
      logo: p.Logo?.url ?? "",
    };
  });

  const familyMap: Record<string, ModelEntry[]> = {};
  for (const e of entries) {
    if (!familyMap[e.family]) familyMap[e.family] = [];
    familyMap[e.family].push(e);
  }

  const families: ModelFamily[] = Object.entries(familyMap).map(([family, models]) => {
    models.sort((a, b) => a.order - b.order);
    const flagship = models.find((m) => m.isFlagship) || models[0];
    const logo = models.find((m) => m.logo)?.logo;
    return { family, type: flagship.type, flagship, models, logo };
  });

  // Sort by flagship release date descending (newest first)
  families.sort((a, b) => (a.flagship.releaseDate > b.flagship.releaseDate ? -1 : 1));

  return families;
}

// ── Arena ELO ──────────────────────────────────────────────────────────────

export async function getArenaElo(): Promise<Record<string, number>> {
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/nakasyou/lmarena-history/main/output/scores.json",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return {};
    const data = await res.json();
    const dates = Object.keys(data).sort();
    const latest = dates[dates.length - 1];
    return (data[latest]?.text ?? {}) as Record<string, number>;
  } catch {
    return {};
  }
}

// ── OpenRouter Model Specs ──────────────────────────────────────────────────

// Returns map of model slug → context_length (in K tokens)
export async function getOpenRouterContexts(): Promise<Record<string, number>> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return {};
    const data = await res.json();
    const result: Record<string, number> = {};
    for (const m of data?.data ?? []) {
      if (m.id && m.context_length) {
        result[m.id as string] = Math.round((m.context_length as number) / 1000);
      }
    }
    return result;
  } catch {
    return {};
  }
}

// ── HuggingFace model info ───────────────────────────────────────────────────
// One config.json fetch per open-source model → context window + native dtype.

import { MODEL_META } from "@/data/llm-models";

export interface HFModelInfo {
  contexts: Record<string, number>; // OC model name → contextK
  dtypes:   Record<string, string>; // OC model name → e.g. "BF16" | "FP16"
}

function normDtype(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const s = raw.toLowerCase().replace(/[_\-]/g, "");
  if (s.includes("bfloat16") || s === "bf16") return "BF16";
  if (s.includes("float16") || s === "fp16") return "FP16";
  if (s.includes("float32") || s === "fp32") return "FP32";
  if (s.includes("int8"))  return "INT8";
  if (s.includes("int4"))  return "INT4";
  return null;
}

export async function getHFModelInfo(): Promise<HFModelInfo> {
  const entries = Object.entries(MODEL_META).filter(([, m]) => m.hfRepo);

  const results = await Promise.allSettled(
    entries.map(async ([modelName, meta]) => {
      const url = `https://huggingface.co/${meta.hfRepo!}/resolve/main/config.json`;
      const res = await fetch(url, { next: { revalidate: 86400 } });
      if (!res.ok) return null;
      const cfg = await res.json() as Record<string, unknown>;

      const rawCtx = cfg.max_position_embeddings ?? cfg.seq_length ?? cfg.max_seq_len;
      const contextK = typeof rawCtx === "number" && rawCtx > 0
        ? Math.round(rawCtx / 1024)
        : null;

      const dtype = normDtype(cfg.torch_dtype) ?? normDtype(cfg.dtype);

      return { modelName, contextK, dtype };
    })
  );

  const contexts: Record<string, number> = {};
  const dtypes:   Record<string, string> = {};
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) {
      const { modelName, contextK, dtype } = r.value;
      if (contextK) contexts[modelName] = contextK;
      if (dtype)    dtypes[modelName]   = dtype;
    }
  }
  return { contexts, dtypes };
}

// ── OpenCompass Leaderboard ─────────────────────────────────────────────────

export interface OpenCompassModel {
  model: string;
  org: string;
  params: string;
  releaseDate: string;
  chatOrBase: string;
  release: string;       // "API" | "OpenSource" | "API|OpenSource"
  average: number;
  mmluPro?: number;
  aime2025?: number;
  liveCodeBench?: number;
  gpqaDiamond?: number;
  ifeval?: number;
  hle?: number;
}

export async function getOpenCompassData(): Promise<OpenCompassModel[]> {
  const base = "http://opencompass.oss-cn-shanghai.aliyuncs.com/assets/research-rank";
  const now = new Date();

  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, "");
    try {
      const res = await fetch(`${base}/research-data.REALTIME.${dateStr}.json`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) continue;
      const data = await res.json();
      const table: any[] = data?.OverallTable ?? [];
      if (!table.length) continue;

      return table.map((r) => ({
        model: (r.model as string) ?? "",
        org: (r.org as string) ?? "",
        params: (r.num as string) ?? "",
        releaseDate: (r.time as string) ?? "",
        chatOrBase: (r.chat_or_base as string) ?? "Chat",
        release: (r.release as string) ?? "",
        average: (r.Average as number) ?? 0,
        mmluPro: r["MMLU-Pro"] as number | undefined,
        aime2025: r["AIME2025"] as number | undefined,
        liveCodeBench: r["LiveCodeBenchV6"] as number | undefined,
        gpqaDiamond: r["GPQA-Diamond"] as number | undefined,
        ifeval: r["IFEval"] as number | undefined,
        hle: r["HLE"] as number | undefined,
      }));
    } catch {
      continue;
    }
  }
  return [];
}

// ── Weekly AI Summary ──────────────────────────────────────────────────────

export interface SummaryHighlight {
  title: string;
  background: string;  // 这个技术是什么，之前有什么问题
  change: string;      // 这次更新做了什么
  impact: string;      // 为什么能解决，对用户意味着什么
  link: string;
  isPR: boolean;
}

export interface CommunitySummary {
  key: string;
  name: string;
  org: string;
  repo: string;
  version: string;
  weekNum: number;
  year: number;
  summary: string;
  highlights: SummaryHighlight[];
  commitCount: number;
  since: string;
}

function isoWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

async function ghFetch(path: string): Promise<any> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`https://api.github.com${path}`, { headers, next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

async function fetchLatestVersion(org: string, repo: string): Promise<string> {
  const data = await ghFetch(`/repos/${org}/${repo}/releases/latest`);
  return (data?.tag_name as string) ?? "";
}

async function fetchRecentCommits(
  org: string,
  repo: string
): Promise<{ title: string; sha: string }[]> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const data = await ghFetch(`/repos/${org}/${repo}/commits?since=${since}&per_page=50`);
  if (!Array.isArray(data)) return [];
  return data
    .map((c: any) => ({
      title: (c?.commit?.message?.split("\n")[0] as string) ?? "",
      sha: (c?.sha as string) ?? "",
    }))
    .filter((c) => c.title)
    .slice(0, 30);
}

async function summarizeWithGLM(
  repoName: string,
  org: string,
  repo: string,
  commits: { title: string; sha: string }[]
): Promise<{ summary: string; highlights: SummaryHighlight[] }> {
  const apiKey = process.env.GLM_API_KEY;
  if (!apiKey || commits.length === 0) return { summary: "", highlights: [] };

  const commitList = commits
    .map((c, i) => `${i + 1}. [${c.sha.slice(0, 7)}] ${c.title}`)
    .join("\n");

  const prompt = `你是 AI 推理引擎领域的技术编辑，读者是有一定基础但希望深入学习的工程师。以下是开源项目 ${repoName} 过去一周的 commit 记录（${commits.length} 条）：

${commitList}

请返回**纯 JSON**，不要有任何多余文字，格式如下：
{
  "summary": "本周技术方向概述，3-4句，说清楚重点改动类型和背景意义",
  "highlights": [
    {
      "title": "改动标题（不超过20字）",
      "background": "这个技术模块/概念是什么，在此次更新之前存在什么局限或问题（50-80字）",
      "change": "这次具体更新了什么，核心实现思路或方案是什么（50-80字）",
      "impact": "为什么这样做能解决之前的问题，对用户或系统性能有什么实际影响（50-80字）",
      "pr": PR编号（整数，从commit message中提取如 #1234 或 Merge pull request #1234，没有则填0）,
      "sha": "对应的7位commit hash（pr为0时必填）"
    }
  ]
}
highlights 选技术含量最高、最有学习价值的 4-5 条，优先选有 PR 编号的。`;

  const res = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "glm-4-flash",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1800,
      temperature: 0.4,
    }),
    next: { revalidate: 3600 },
  });

  if (!res.ok) return { summary: "", highlights: [] };
  const data = await res.json();
  const raw = (data?.choices?.[0]?.message?.content as string) ?? "";

  try {
    const jsonStr = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(jsonStr);
    const highlights: SummaryHighlight[] = (parsed.highlights ?? []).map((h: any) => {
      const prNum = typeof h.pr === "number" ? h.pr : parseInt(h.pr, 10);
      const hasPR = prNum > 0;
      return {
        title: h.title ?? "",
        background: h.background ?? "",
        change: h.change ?? "",
        impact: h.impact ?? "",
        isPR: hasPR,
        link: hasPR
          ? `https://github.com/${org}/${repo}/pull/${prNum}`
          : h.sha
            ? `https://github.com/${org}/${repo}/commit/${h.sha}`
            : `https://github.com/${org}/${repo}/commits`,
      };
    });
    return { summary: parsed.summary ?? "", highlights };
  } catch {
    return { summary: raw, highlights: [] };
  }
}

export async function getCommunitySummaries(
  repos: { key: string; name: string; org: string; repo: string }[]
): Promise<CommunitySummary[]> {
  const now = new Date();
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const weekNum = isoWeekNumber(now);
  const year = now.getFullYear();

  const results = await Promise.all(
    repos.map(async ({ key, name, org, repo }) => {
      try {
        const [commits, version] = await Promise.all([
          fetchRecentCommits(org, repo),
          fetchLatestVersion(org, repo),
        ]);
        const { summary, highlights } = await summarizeWithGLM(repo, org, repo, commits);
        return { key, name, org, repo, version, weekNum, year, summary, highlights, commitCount: commits.length, since };
      } catch {
        return { key, name, org, repo, version: "", weekNum, year, summary: "", highlights: [], commitCount: 0, since };
      }
    })
  );

  return results;
}

// ── Support Matrix ─────────────────────────────────────────────────────────

export type SupportStatus = "yes" | "partial" | "no" | "unknown";

export interface SupportCell {
  status: SupportStatus;
  prTitle: string;
  link: string;
}

export interface MatrixRow {
  name: string;
  cells: Record<string, SupportCell>; // engineKey → cell
}

export interface SupportMatrixData {
  engines: { key: string; label: string }[];
  models: MatrixRow[];
  chips: MatrixRow[];
  updatedAt: string;
}

const MATRIX_MODELS = [
  { name: "DeepSeek-V3",  terms: ["DeepSeek-V3"] },
  { name: "DeepSeek-R1",  terms: ["DeepSeek-R1"] },
  { name: "Qwen3",        terms: ["Qwen3", "qwen3"] },
  { name: "Kimi-K2",      terms: ["Kimi-K2", "Kimi K2"] },
  { name: "GLM-4",        terms: ["GLM-4", "glm-4"] },
  { name: "MiniMax",      terms: ["MiniMax", "minimax"] },
  { name: "InternLM",     terms: ["InternLM", "internlm"] },
  { name: "Hunyuan",      terms: ["Hunyuan", "hunyuan"] },
  { name: "Baichuan",     terms: ["Baichuan", "baichuan"] },
  { name: "Yi",           terms: ["Yi-Lightning", "Yi-34B", "01-ai"] },
];

const MATRIX_CHIPS = [
  { name: "Ascend 910B",  terms: ["Ascend", "910B", "NPU"] },
  { name: "寒武纪 MLU",   terms: ["Cambricon", "MLU370", "MLU590"] },
  { name: "海光 DCU",     terms: ["Hygon", "DCU"] },
  { name: "昆仑芯 XPU",  terms: ["Kunlun", "XPU", "kunlun"] },
  { name: "摩尔线程",     terms: ["Moore Threads", "MUSA"] },
];

const MATRIX_ENGINES = [
  { key: "sglang",       org: "sgl-project",  repo: "sglang" },
  { key: "vllm",         org: "vllm-project", repo: "vllm" },
  { key: "mooncake",     org: "kvcache-ai",   repo: "Mooncake" },
  { key: "ktransformers",org: "kvcache-ai",   repo: "ktransformers" },
];

// Sequential queue with delay to respect GitHub Search 30 req/min limit
function makeSearchQueue(delayMs: number) {
  let chain = Promise.resolve();
  return function <T>(fn: () => Promise<T>): Promise<T> {
    chain = chain.then(() => new Promise((r) => setTimeout(r, delayMs)));
    return chain.then(fn) as Promise<T>;
  };
}

async function searchMergedPR(
  org: string,
  repo: string,
  terms: string[]
): Promise<{ found: boolean; link: string; title: string }> {
  // Try each term until we find a result
  for (const term of terms) {
    const q = encodeURIComponent(`is:pr is:merged repo:${org}/${repo} "${term}"`);
    const data = await ghFetch(`/search/issues?q=${q}&sort=updated&per_page=3`);
    if (data?.items?.length > 0) {
      return {
        found: true,
        link: data.items[0].html_url as string,
        title: data.items[0].title as string,
      };
    }
  }
  return { found: false, link: "", title: "" };
}

export async function getSupportMatrix(): Promise<SupportMatrixData> {
  const allItems = [...MATRIX_MODELS, ...MATRIX_CHIPS];

  // Per item: search all 4 engines in parallel, then wait 2s before next item
  // Total: 15 items × 2s = ~30s, well within build timeout
  const results: { engineKey: string; itemName: string; result: Awaited<ReturnType<typeof searchMergedPR>> }[] = [];

  for (const item of allItems) {
    const itemResults = await Promise.all(
      MATRIX_ENGINES.map(async (engine) => ({
        engineKey: engine.key,
        itemName: item.name,
        result: await searchMergedPR(engine.org, engine.repo, item.terms),
      }))
    );
    results.push(...itemResults);
    await new Promise((r) => setTimeout(r, 2000));
  }

  // Build lookup: itemName → engineKey → cell
  const lookup = new Map<string, Map<string, SupportCell>>();
  for (const { engineKey, itemName, result } of results) {
    if (!lookup.has(itemName)) lookup.set(itemName, new Map());
    lookup.get(itemName)!.set(engineKey, {
      status: result.found ? "yes" : "unknown",
      prTitle: result.title,
      link: result.link,
    });
  }

  const engineKeys = MATRIX_ENGINES.map((e) => e.key);

  const toRow = (item: { name: string }): MatrixRow => ({
    name: item.name,
    cells: Object.fromEntries(
      engineKeys.map((k) => [k, lookup.get(item.name)?.get(k) ?? { status: "unknown", prTitle: "", link: "" }])
    ),
  });

  return {
    engines: [
      { key: "sglang",        label: "SGLang" },
      { key: "vllm",          label: "vLLM" },
      { key: "mooncake",      label: "Mooncake" },
      { key: "ktransformers", label: "KTransformers" },
    ],
    models: MATRIX_MODELS.map(toRow),
    chips:  MATRIX_CHIPS.map(toRow),
    updatedAt: new Date().toISOString().slice(0, 10),
  };
}
