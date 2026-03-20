"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { MODEL_META, CHINA_ORGS, OPEN_SOURCE_ORGS, BENCH_COLS, type BenchKey } from "@/data/llm-models";
import type { OpenCompassModel } from "@/lib/approaching";

interface Props {
  ocModels: OpenCompassModel[];
  eloByArenaName: Record<string, number>;
  orContexts: Record<string, number>;  // openrouter slug → context in K
  hfContexts: Record<string, number>;  // OC model name → context in K (from HuggingFace config.json)
  hfDtypes:   Record<string, string>;  // OC model name → native dtype (from HuggingFace config.json)
}

type RegionFilter   = "all" | "china" | "global";
type TypeFilter     = "all" | "open" | "closed";
type ModalityFilter = "all" | "language" | "multimodal";
type SortKey = BenchKey | "elo" | "params" | "context";

interface EnrichedModel extends OpenCompassModel {
  region: "global" | "china";
  type: "open" | "closed";
  modality: "language" | "multimodal";
  context?: number;
  dtype?: string;
  arenaElo?: number;
  paramsNum: number;
}

// Org → brand color (background for letter fallback)
const ORG_COLORS: Record<string, string> = {
  OpenAI:           "#10a37f",
  Anthropic:        "#c95c36",
  Google:           "#4285f4",
  Meta:             "#0082fb",
  Mistral:          "#ff7000",
  DeepSeek:         "#1a6ef5",
  Alibaba:          "#ff6a00",
  Qwen:             "#ff6a00",
  "Zhipu AI":       "#4e70ff",
  "Moonshot AI":    "#1a1a1a",
  MiniMax:          "#7c3aed",
  Tencent:          "#07c160",
  "Baichuan AI":    "#3b82f6",
  StepFun:          "#f59e0b",
  "01.AI":          "#6366f1",
  OpenBMB:          "#10b981",
  "Shanghai AI Lab":"#ef4444",
};

function orgColor(org: string): string {
  for (const [key, color] of Object.entries(ORG_COLORS)) {
    if (org.includes(key)) return color;
  }
  let h = 0;
  for (let i = 0; i < org.length; i++) h = (h * 31 + org.charCodeAt(i)) % 360;
  return `hsl(${h}, 55%, 48%)`;
}

// Normalize model/series name for fuzzy logo matching
function normStr(s: string) {
  return s.toLowerCase().replace(/[-_.\s]/g, "");
}

// Match OpenCompass model name → aiping.cn model_series for context lookup
function findAipingContext(model: string, ctxMap: Map<string, number>): number | undefined {
  const nm = normStr(model);
  // Exact key match
  for (const [series, k] of ctxMap) {
    if (normStr(series) === nm) return k;
  }
  // Prefix match (model name starts with or equals series)
  for (const [series, k] of ctxMap) {
    const ns = normStr(series);
    if (nm.startsWith(ns) || ns.startsWith(nm)) return k;
  }
  return undefined;
}

function findLogo(model: string, logoMap: Map<string, string>): string {
  const nm = normStr(model);
  // Exact match
  if (logoMap.has(nm)) return logoMap.get(nm)!;
  // Prefix: logoMap key is prefix of model name (e.g. "deepseekr1" matches "deepseekr1-0528")
  for (const [key, url] of logoMap) {
    if (nm.startsWith(key) || key.startsWith(nm)) return url;
  }
  return "";
}

function ModelLogo({ model, org, logoMap }: { model: string; org: string; logoMap: Map<string, string> }) {
  const [imgFailed, setImgFailed] = useState(false);
  const onError = useCallback(() => setImgFailed(true), []);
  const url = findLogo(model, logoMap);
  const color = orgColor(org);
  const letter = org.replace(/[^a-zA-Z\u4e00-\u9fa5]/g, "")[0]?.toUpperCase() ?? "?";

  if (url && !imgFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={model} width={28} height={28} onError={onError}
        className="ml-logo-img" />
    );
  }
  return (
    <span className="ml-logo" style={{ background: color }}>{letter}</span>
  );
}

function inferRegion(org: string): "global" | "china" {
  for (const cn of CHINA_ORGS) {
    if (org.toLowerCase().includes(cn.toLowerCase())) return "china";
  }
  return "global";
}

function inferType(org: string, release: string): "open" | "closed" {
  if (release.includes("OpenSource")) return "open";
  for (const o of OPEN_SOURCE_ORGS) {
    if (org.includes(o)) return "open";
  }
  return "closed";
}

function parseParams(s: string): number {
  const m = s.match(/[\d.]+/);
  if (!m) return 0;
  const n = parseFloat(m[0]);
  if (s.includes("T")) return n * 1000;
  return n;
}

export function ModelLandscape({ ocModels, eloByArenaName, orContexts, hfContexts, hfDtypes }: Props) {
  const [region,   setRegion]   = useState<RegionFilter>("all");
  const [typeF,    setTypeF]    = useState<TypeFilter>("all");
  const [modality, setModality] = useState<ModalityFilter>("all");
  const [sortKey,  setSortKey]  = useState<SortKey>("average");
  const [sortAsc,  setSortAsc]  = useState(false);
  const [logoMap,   setLogoMap]   = useState<Map<string, string>>(new Map());
  const [aipingCtx, setAipingCtx] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    const API = "https://www.aiping.cn/api/v1";
    const post = (path: string, body: object) =>
      fetch(`${API}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => r.json());

    Promise.all([
      post("/maashub/display/icon", {}),
      post("/entry_sys/available/testing/history", { page: 1, size: 500 }),
    ]).then(([iconData, histData]) => {
      // Logo map
      const logos = new Map<string, string>();
      for (const item of iconData?.data?.model ?? []) {
        if (item.model_series && item.url)
          logos.set(normStr(item.model_series as string), item.url as string);
      }
      setLogoMap(logos);

      // Context map: model_series → max contextK across providers
      const ctx = new Map<string, number>();
      for (const item of histData?.data ?? []) {
        if (item.model_series && (item.context_length ?? 0) > 0) {
          const k = Math.round((item.context_length as number) / 1024);
          const series = item.model_series as string;
          ctx.set(series, Math.max(ctx.get(series) ?? 0, k));
        }
      }
      setAipingCtx(ctx);
    }).catch(() => {});
  }, []);

  const models: EnrichedModel[] = useMemo(() => ocModels.map((m) => {
    const meta = MODEL_META[m.model];
    const arenaElo = meta?.arenaName ? (eloByArenaName[meta.arenaName] || undefined) : undefined;
    // Context priority: OpenRouter → HuggingFace config.json → static MODEL_META → aiping.cn
    const orCtx = meta?.openRouterSlug ? orContexts[meta.openRouterSlug] : undefined;
    const hfCtx = hfContexts[m.model];
    const apCtx = findAipingContext(m.model, aipingCtx);
    const context = orCtx || hfCtx || meta?.context || apCtx;
    // Dtype priority: HuggingFace config.json → static MODEL_META
    const dtype = hfDtypes[m.model] || meta?.dtype;
    return {
      ...m,
      region:    meta?.region   ?? inferRegion(m.org),
      type:      meta?.type     ?? inferType(m.org, m.release),
      modality:  meta?.modality ?? "language",
      context,
      dtype,
      arenaElo,
      paramsNum: parseParams(m.params),
    };
  }), [ocModels, eloByArenaName, orContexts, hfContexts, aipingCtx]);

  const filtered = useMemo(() => models
    .filter((m) => region   === "all" || m.region   === region)
    .filter((m) => typeF    === "all" || m.type     === typeF)
    .filter((m) => modality === "all" || m.modality === modality)
    .sort((a, b) => {
      let av: number, bv: number;
      if      (sortKey === "elo")     { av = a.arenaElo  ?? 0; bv = b.arenaElo  ?? 0; }
      else if (sortKey === "params")  { av = a.paramsNum;       bv = b.paramsNum; }
      else if (sortKey === "context") { av = a.context   ?? 0; bv = b.context   ?? 0; }
      else { av = (a[sortKey] as number) ?? 0; bv = (b[sortKey] as number) ?? 0; }
      return sortAsc ? av - bv : bv - av;
    }),
  [models, region, typeF, modality, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(false); }
  };

  const Arrow = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? <span className="ml-arrow ml-arrow-active">{sortAsc ? "↑" : "↓"}</span>
      : <span className="ml-arrow">↕</span>;

  return (
    <div className="ml-wrap">
      {/* Filters */}
      <div className="ml-filters">
        <div className="ml-filter-group">
          {(["all", "china", "global"] as RegionFilter[]).map((r) => (
            <button key={r} className={`ml-chip ${region === r ? "ml-chip-on" : ""}`}
              onClick={() => setRegion(r)}>
              {r === "all" ? "全部" : r === "china" ? "国产" : "海外"}
            </button>
          ))}
        </div>
        <div className="ml-filter-group">
          {(["all", "language", "multimodal"] as ModalityFilter[]).map((m) => (
            <button key={m} className={`ml-chip ${modality === m ? "ml-chip-on" : ""}`}
              onClick={() => setModality(m)}>
              {m === "all" ? "全部" : m === "language" ? "语言模型" : "多模态"}
            </button>
          ))}
        </div>
        <div className="ml-filter-group">
          {(["all", "open", "closed"] as TypeFilter[]).map((t) => (
            <button key={t} className={`ml-chip ${typeF === t ? "ml-chip-on" : ""}`}
              onClick={() => setTypeF(t)}>
              {t === "all" ? "全部" : t === "open" ? "开源" : "闭源"}
            </button>
          ))}
        </div>
        <span className="ml-count">{filtered.length} 个模型</span>
      </div>

      {ocModels.length === 0 && (
        <div className="ml-offline">OpenCompass 数据加载失败，请稍后重试</div>
      )}

      <div className="ml-table-wrap">
        <table className="ml-table">
          <thead>
            <tr>
              <th className="ml-th ml-th-rank">#</th>
              <th className="ml-th ml-th-model">模型</th>
              <th className="ml-th ml-th-r" onClick={() => handleSort("params")} title="参数量">
                参数 <Arrow k="params" />
              </th>
              <th className="ml-th ml-th-r" onClick={() => handleSort("context")} title="上下文窗口">
                上下文 <Arrow k="context" />
              </th>
              <th className="ml-th ml-th-r" title="原生精度（模型权重数据类型）">精度</th>
              {BENCH_COLS.map((col) => (
                <th key={col.key} className="ml-th ml-th-r"
                  onClick={() => handleSort(col.key as SortKey)} title={col.title}>
                  {col.label} <Arrow k={col.key as SortKey} />
                </th>
              ))}
              <th className="ml-th ml-th-r" onClick={() => handleSort("elo")} title="Chatbot Arena ELO">
                ELO <Arrow k="elo" />
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, idx) => (
              <tr key={m.model} className="ml-row">
                <td className="ml-td ml-td-rank">{idx + 1}</td>

                <td className="ml-td ml-td-model">
                  <div className="ml-model-inner">
                    <ModelLogo model={m.model} org={m.org} logoMap={logoMap} />
                    <div className="ml-model-name">{m.model}</div>
                  </div>
                </td>

                <td className="ml-td ml-td-r">
                  {m.params
                    ? <span className="ml-mono">{m.params}</span>
                    : <span className="ml-na">—</span>}
                </td>
                <td className="ml-td ml-td-r">
                  {m.context
                    ? <span className="ml-mono">{m.context}K</span>
                    : <span className="ml-na">—</span>}
                </td>
                <td className="ml-td ml-td-r">
                  {m.dtype
                    ? <span className={`ml-dtype ml-dtype-${m.dtype.toLowerCase()}`}>{m.dtype}</span>
                    : <span className="ml-na">—</span>}
                </td>

                {BENCH_COLS.map((col) => {
                  const val = m[col.key as BenchKey] as number | undefined;
                  return (
                    <td key={col.key} className="ml-td ml-td-r">
                      {val != null
                        ? <span className="ml-score">{val.toFixed(1)}</span>
                        : <span className="ml-na">—</span>}
                    </td>
                  );
                })}

                <td className="ml-td ml-td-r">
                  {m.arenaElo
                    ? <span className="ml-score ml-elo">{m.arenaElo}</span>
                    : <span className="ml-na">—</span>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={12} className="ml-empty">无符合条件的模型</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="ml-footer">
        数据来源：OpenCompass Research Leaderboard · Chatbot Arena &nbsp;·&nbsp; 每小时更新
      </div>

      <style>{`
        .ml-wrap {
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
          margin-bottom: 3em;
        }
        .ml-offline {
          background: #fff8e8; border: 1px solid #f0d9a0; border-radius: 8px;
          padding: 0.75em 1.1em; font-size: 0.78rem; color: #b07800; margin-bottom: 1em;
        }

        /* ── Filters ── */
        .ml-filters {
          display: flex; flex-wrap: wrap;
          gap: 0.5em 1.4em; margin-bottom: 1.1em; align-items: center;
        }
        .ml-filter-group { display: flex; gap: 0.3em; }
        .ml-count { margin-left: auto; font-size: 0.7rem; color: #ccc; letter-spacing: 0.03em; }

        .ml-chip {
          padding: 0.3em 0.85em; border-radius: 20px;
          border: 1px solid #e8e8e8; background: white;
          font-size: 0.72rem; color: #999; cursor: pointer;
          letter-spacing: 0.03em; transition: all 140ms; line-height: 1.6;
        }
        .ml-chip:hover { border-color: #ccc; color: #555; }
        .ml-chip-on { background: #1a1a1a; border-color: #1a1a1a; color: #fff; }

        /* ── Table ── */
        .ml-table-wrap {
          overflow-x: auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .ml-table {
          width: 100%; border-collapse: collapse; min-width: 820px;
        }

        /* Header */
        .ml-th {
          padding: 0.7em 1em;
          font-family: 'Oswald', sans-serif;
          font-size: 0.68rem; font-weight: 700;
          color: #bbb; letter-spacing: 0.1em; text-transform: uppercase;
          background: #fafafa; border-bottom: 2px solid #f0f0f0;
          white-space: nowrap; user-select: none; cursor: default;
        }
        .ml-th-rank  { width: 3em; text-align: center; cursor: default !important; }
        .ml-th-model { min-width: 220px; cursor: default !important; }
        .ml-th-r     { width: 6em; text-align: right; cursor: pointer; }
        .ml-th-r:hover { color: #888; }

        .ml-arrow { font-size: 0.6rem; color: #ddd; margin-left: 0.15em; }
        .ml-arrow-active { color: #1a1a1a; }

        /* Rows */
        .ml-row:last-child td { border-bottom: none; }
        .ml-row:hover td { background: #fafafa; }

        .ml-td {
          padding: 0.7em 1em;
          border-bottom: 1px solid #f5f5f7;
          vertical-align: middle;
        }
        .ml-td-rank {
          text-align: center;
          font-family: 'Oswald', sans-serif;
          font-size: 0.72rem; font-weight: 700; color: #ddd;
        }
        .ml-td-model { padding-left: 1em; }
        .ml-td-r { text-align: right; }

        /* Logo */
        .ml-logo {
          display: inline-flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 7px;
          font-size: 0.72rem; font-weight: 800;
          color: white; flex-shrink: 0;
          letter-spacing: 0;
          font-family: 'Oswald', sans-serif;
        }
        .ml-logo-img {
          width: 28px; height: 28px;
          object-fit: contain; border-radius: 7px;
          flex-shrink: 0; display: block;
        }
        .ml-model-inner {
          display: flex; align-items: center; gap: 0.75em;
        }
        .ml-model-name {
          font-size: 0.84rem; font-weight: 600;
          color: #1a1a1a; line-height: 1.3; letter-spacing: -0.01em;
        }
        .ml-model-org {
          font-size: 0.68rem; color: #bbb;
          margin-top: 0.1em; letter-spacing: 0.01em;
        }

        /* Values */
        .ml-mono { font-family: monospace; font-size: 0.78rem; color: #666; }
        .ml-dtype {
          font-family: 'Oswald', monospace; font-size: 0.66rem; font-weight: 700;
          letter-spacing: 0.05em; padding: 0.15em 0.45em; border-radius: 4px;
        }
        .ml-dtype-bf16 { background: #edf4ff; color: #3b7dd8; }
        .ml-dtype-fp16 { background: #f0fdf4; color: #2d9b6a; }
        .ml-dtype-fp32 { background: #fff8e8; color: #b07800; }
        .ml-dtype-int8 { background: #fdf2f8; color: #9b2d80; }
        .ml-dtype-int4 { background: #fef2f2; color: #c0392b; }
        .ml-score { font-size: 0.82rem; font-weight: 600; color: #333; letter-spacing: 0.01em; }
        .ml-elo { color: #5472d4; }
        .ml-na { color: #ddd; font-size: 0.75rem; }

        .ml-empty {
          text-align: center; color: #ccc;
          font-size: 0.82rem; padding: 3em;
        }

        /* Footer */
        .ml-footer {
          margin-top: 0.75em;
          font-size: 0.62rem; color: #ccc;
          letter-spacing: 0.02em; text-align: right;
        }

        @media (max-width: 48em) {
          .ml-count { display: none; }
          .ml-filters { gap: 0.4em 0.8em; }
        }
      `}</style>
    </div>
  );
}
