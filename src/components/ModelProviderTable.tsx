"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const API = "https://www.aiping.cn/api/v1";

interface Provider {
  id: number;
  supplier: string;
  isOfficial: boolean;
  inputPrice: number;
  outputPrice: number;
  currency: string;
  contextK: number;
  throughput: number;
  ttft: number;
  availability: number;
  accuracy: number;
}

interface ModelEntry {
  series: string;
  logo: string;
  providers: Provider[] | null; // null = not yet fetched
}

type SortKey = "inputPrice" | "outputPrice" | "contextK" | "throughput" | "ttft" | "availability" | "accuracy";
type SortDir = "asc" | "desc";

const COL_DEFAULT_DIR: Record<SortKey, SortDir> = {
  inputPrice: "asc",
  outputPrice: "asc",
  contextK: "desc",
  throughput: "desc",
  ttft: "asc",
  availability: "desc",
  accuracy: "desc",
};

async function fetchTopSeries(logoMap: Map<string, string>): Promise<ModelEntry[]> {
  const res = await fetch(`${API}/entry_sys/available/testing/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page: 1, size: 500 }),
  });
  const data = await res.json();
  const raw = (data?.data ?? []).filter(
    (d: any) =>
      d.availability > 0 &&
      d.time_to_first_token > 0 &&
      !d.supplier_name?.includes("AI Ping") &&
      !d.supplier_name?.includes("aiping"),
  );
  const countMap = new Map<string, number>();
  for (const item of raw) {
    const k = item.model_series as string;
    countMap.set(k, (countMap.get(k) ?? 0) + 1);
  }
  return [...countMap.entries()]
    .filter(([, c]) => c >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([series]) => ({
      series,
      logo: findLogo(series, logoMap),
      providers: null,
    }));
}

function findLogo(series: string, logoMap: Map<string, string>): string {
  if (logoMap.has(series)) return logoMap.get(series)!;
  for (const [key, url] of logoMap) {
    const brand = key.split("-")[0].toLowerCase();
    if (series.toLowerCase().startsWith(brand)) return url;
  }
  return "";
}

async function fetchProviders(series: string): Promise<Provider[]> {
  const res = await fetch(`${API}/maashub/supplier/filter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model_series: series, size: 100, page: 1 }),
  });
  const data = await res.json();
  return (data?.data?.array_data ?? [])
    .filter((d: any) => d.is_visible !== false)
    .map((d: any) => {
      const inputPrice = d.input_price_discounted > 0 ? d.input_price_discounted : d.input_price_original;
      const outputPrice = d.output_price_discounted > 0 ? d.output_price_discounted : d.output_price_original;
      return {
        id: d.id,
        supplier: d.supplier_name,
        isOfficial: d.is_official ?? false,
        inputPrice,
        outputPrice,
        currency: d.currency ?? "CNY",
        contextK: Math.round(d.context_length / 1024),
        throughput: d.throughput ?? 0,
        ttft: d.time_to_first_token ?? 0,
        availability: Math.round((d.availability ?? 0) * 100),
        accuracy: d.accuracy > 0 ? Math.round(d.accuracy * 1000) / 10 : 0,
      } as Provider;
    });
}

export default function ModelProviderTable() {
  const [models, setModels] = useState<ModelEntry[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("throughput");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [officialOnly, setOfficialOnly] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const cacheRef = useRef<Map<string, Provider[]>>(new Map());

  useEffect(() => {
    (async () => {
      try {
        const iconRes = await fetch(`${API}/maashub/display/icon`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const icons = await iconRes.json();
        const logoMap = new Map<string, string>();
        for (const item of icons?.data?.model ?? []) {
          if (item.model_series) logoMap.set(item.model_series, item.url);
        }
        const entries = await fetchTopSeries(logoMap);
        setModels(entries);
        setLoading(false);
        // Pre-fetch first model
        if (entries.length > 0) {
          setTableLoading(true);
          const providers = await fetchProviders(entries[0].series);
          cacheRef.current.set(entries[0].series, providers);
          setModels((prev) =>
            prev.map((m, i) => (i === 0 ? { ...m, providers } : m))
          );
          setTableLoading(false);
        }
      } catch {
        setLoading(false);
      }
    })();
  }, []);

  const selectModel = useCallback(async (idx: number) => {
    if (idx === activeIdx) return;
    setActiveIdx(idx);
    const series = models[idx]?.series;
    if (!series) return;
    if (cacheRef.current.has(series)) {
      setModels((prev) =>
        prev.map((m, i) => (i === idx ? { ...m, providers: cacheRef.current.get(series)! } : m))
      );
      return;
    }
    setTableLoading(true);
    try {
      const providers = await fetchProviders(series);
      cacheRef.current.set(series, providers);
      setModels((prev) =>
        prev.map((m, i) => (i === idx ? { ...m, providers } : m))
      );
    } finally {
      setTableLoading(false);
    }
  }, [activeIdx, models]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(COL_DEFAULT_DIR[key]);
    }
  };

  const current = models[activeIdx];
  const rawProviders = current?.providers ?? [];

  const filtered = rawProviders
    .filter((p) => !officialOnly || p.isOfficial)
    .filter((p) => !searchQ || p.supplier.toLowerCase().includes(searchQ.toLowerCase()));

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey] as number;
    const bv = b[sortKey] as number;
    return sortDir === "asc" ? av - bv : bv - av;
  });

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <span className="mpt-sort-idle">⇅</span>;
    return <span className="mpt-sort-active">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  const ColHead = ({ label, k }: { label: string; k: SortKey }) => (
    <th className="mpt-th mpt-th-sortable" onClick={() => handleSort(k)}>
      {label} <SortIcon k={k} />
    </th>
  );

  const fmtPrice = (v: number, cur: string) => {
    if (v === 0) return <span className="mpt-free">免费</span>;
    return <>{v}<span className="mpt-unit"> {cur === "CNY" ? "¥" : "$"}</span></>;
  };

  return (
    <section className="mpt-wrap">
      <h2 className="ai-section-title" style={{ marginBottom: "1.5em" }}>PROVIDER COMPARISON</h2>

      {loading ? (
        <div className="mpt-skeleton-wrap">
          <div className="mpt-skeleton mpt-skeleton-sidebar" />
          <div className="mpt-skeleton mpt-skeleton-table" />
        </div>
      ) : models.length === 0 ? (
        <p className="mpt-empty">暂无数据</p>
      ) : (
        <div className="mpt-layout">
          {/* Left sidebar: model list */}
          <div className="mpt-sidebar">
            {models.map((m, idx) => (
              <button
                key={m.series}
                className={`mpt-model-item ${idx === activeIdx ? "active" : ""}`}
                onClick={() => selectModel(idx)}
              >
                {m.logo ? (
                  <img src={m.logo} alt="" className="mpt-model-logo" />
                ) : (
                  <div className="mpt-model-logo mpt-logo-placeholder" />
                )}
                <span className="mpt-model-name">{m.series}</span>
              </button>
            ))}
          </div>

          {/* Right panel */}
          <div className="mpt-panel">
            {/* Filter bar */}
            <div className="mpt-filterbar">
              <input
                className="mpt-search"
                placeholder="搜索服务商…"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
              />
              <button
                className={`mpt-chip ${officialOnly ? "active" : ""}`}
                onClick={() => setOfficialOnly((v) => !v)}
              >
                仅官方
              </button>
              <span className="mpt-count">{sorted.length} 家服务商</span>
            </div>

            {/* Table */}
            <div className="mpt-table-wrap">
              {tableLoading ? (
                <div className="mpt-table-loading">
                  <div className="mpt-spinner" />
                </div>
              ) : (
                <table className="mpt-table">
                  <thead>
                    <tr>
                      <th className="mpt-th mpt-th-supplier">服务商</th>
                      <ColHead label="输入价" k="inputPrice" />
                      <ColHead label="输出价" k="outputPrice" />
                      <ColHead label="上下文" k="contextK" />
                      <ColHead label="吞吐 tok/s" k="throughput" />
                      <ColHead label="首字延迟 s" k="ttft" />
                      <ColHead label="可用率" k="availability" />
                      <ColHead label="精度" k="accuracy" />
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.length === 0 ? (
                      <tr><td colSpan={8} className="mpt-no-results">无匹配结果</td></tr>
                    ) : sorted.map((p) => (
                      <tr key={p.id} className="mpt-row">
                        <td className="mpt-td mpt-td-supplier">
                          {p.supplier}
                          {p.isOfficial && <span className="mpt-badge-official">官方</span>}
                        </td>
                        <td className="mpt-td mpt-td-num">{fmtPrice(p.inputPrice, p.currency)}</td>
                        <td className="mpt-td mpt-td-num">{fmtPrice(p.outputPrice, p.currency)}</td>
                        <td className="mpt-td mpt-td-num">{p.contextK}K</td>
                        <td className="mpt-td mpt-td-num">{p.throughput > 0 ? p.throughput.toFixed(1) : "—"}</td>
                        <td className="mpt-td mpt-td-num">{p.ttft > 0 ? p.ttft.toFixed(2) : "—"}</td>
                        <td className="mpt-td mpt-td-num">
                          {p.availability > 0 ? (
                            <span className={`mpt-avail ${p.availability >= 99 ? "high" : p.availability >= 95 ? "mid" : "low"}`}>
                              {p.availability}%
                            </span>
                          ) : "—"}
                        </td>
                        <td className="mpt-td mpt-td-num">
                          {p.accuracy > 0 ? (
                            <span className="mpt-accuracy">{p.accuracy.toFixed(1)}%</span>
                          ) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <p className="mpt-footnote">价格单位：元/百万 tokens · 吞吐/延迟为近7日均值 · 精度为基准测试得分 · 数据来源 aiping.cn</p>
          </div>
        </div>
      )}

      <style>{`
        .mpt-wrap { margin-top: 4em; }

        /* ── Skeleton ── */
        .mpt-skeleton-wrap { display: flex; gap: 1.2em; height: 420px; }
        .mpt-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: mpt-shimmer 1.4s infinite;
          border-radius: 10px;
        }
        @keyframes mpt-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .mpt-skeleton-sidebar { width: 180px; flex-shrink: 0; }
        .mpt-skeleton-table { flex: 1; }
        .mpt-empty { color: #ccc; font-size: 0.85rem; text-align: center; }

        /* ── Layout ── */
        .mpt-layout {
          display: flex;
          gap: 1.2em;
          align-items: stretch;
        }

        /* ── Sidebar ── */
        .mpt-sidebar {
          width: 172px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .mpt-model-item {
          display: flex;
          align-items: center;
          gap: 0.55em;
          padding: 0.6em 0.75em;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          text-align: left;
          transition: background 150ms;
          width: 100%;
          flex: 1;
        }
        .mpt-model-item:hover { background: #f0f0f0; }
        .mpt-model-item.active { background: #1a1a1a; }
        .mpt-model-item.active .mpt-model-name { color: #fff; }
        .mpt-model-logo {
          width: 22px; height: 22px;
          object-fit: contain;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .mpt-logo-placeholder {
          background: #e8e8e8;
          border-radius: 4px;
        }
        .mpt-model-name {
          font-family: 'Oswald', sans-serif;
          font-size: 0.8rem;
          color: #444;
          letter-spacing: 0.03em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.3;
        }

        /* ── Panel ── */
        .mpt-panel {
          flex: 1;
          min-width: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          overflow: hidden;
        }

        /* ── Filter bar ── */
        .mpt-filterbar {
          display: flex;
          align-items: center;
          gap: 0.7em;
          padding: 0.85em 1.2em;
          border-bottom: 1px solid #f0f0f0;
          flex-wrap: wrap;
        }
        .mpt-search {
          border: 1px solid #eee;
          border-radius: 6px;
          padding: 0.3em 0.65em;
          font-size: 0.78rem;
          color: #444;
          outline: none;
          width: 140px;
          transition: border-color 150ms;
          font-family: inherit;
        }
        .mpt-search:focus { border-color: #1a1a1a; }
        .mpt-chip {
          border: 1px solid #e8e8e8;
          background: white;
          border-radius: 6px;
          padding: 0.3em 0.7em;
          font-size: 0.75rem;
          color: #888;
          cursor: pointer;
          transition: all 150ms;
          font-family: inherit;
        }
        .mpt-chip:hover { border-color: #1a1a1a; color: #1a1a1a; }
        .mpt-chip.active { background: #1a1a1a; border-color: #1a1a1a; color: #fff; }
        .mpt-count {
          font-size: 0.72rem;
          color: #ccc;
          margin-left: auto;
          letter-spacing: 0.02em;
        }

        /* ── Table ── */
        .mpt-table-wrap { overflow-x: auto; }
        .mpt-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.82rem;
          min-width: 680px;
        }
        .mpt-th {
          padding: 0.55em 0.9em;
          font-weight: 500;
          color: #bbb;
          font-size: 0.73rem;
          text-align: right;
          border-bottom: 1px solid #f0f0f0;
          background: #fafafa;
          white-space: nowrap;
          letter-spacing: 0.03em;
          user-select: none;
        }
        .mpt-th-supplier { text-align: left; }
        .mpt-th-sortable { cursor: pointer; }
        .mpt-th-sortable:hover { color: #666; }
        .mpt-sort-idle { color: #ddd; font-size: 0.65rem; margin-left: 2px; }
        .mpt-sort-active { color: #1a1a1a; font-size: 0.72rem; margin-left: 2px; }

        .mpt-row:hover .mpt-td { background: #fafafa; }
        .mpt-td {
          padding: 0.65em 0.9em;
          color: #555;
          border-bottom: 1px solid #f5f5f7;
          transition: background 120ms;
          white-space: nowrap;
        }
        .mpt-td-supplier { color: #222; font-weight: 500; text-align: left; }
        .mpt-td-num { text-align: right; font-variant-numeric: tabular-nums; }
        .mpt-table tbody tr:last-child .mpt-td { border-bottom: none; }

        .mpt-unit { font-size: 0.68rem; color: #bbb; }
        .mpt-free { color: #52b788; font-weight: 600; font-size: 0.75rem; }
        .mpt-badge-official {
          display: inline-block;
          margin-left: 0.4em;
          font-size: 0.62rem;
          background: #fff8e8;
          color: #d4861a;
          border: 1px solid #f0d080;
          border-radius: 3px;
          padding: 0 0.35em;
          font-weight: 600;
          vertical-align: middle;
          letter-spacing: 0.02em;
        }
        .mpt-avail { font-weight: 600; }
        .mpt-avail.high { color: #52b788; }
        .mpt-avail.mid  { color: #f7ba53; }
        .mpt-avail.low  { color: #e07070; }
        .mpt-accuracy { color: #6a9fd8; font-weight: 500; }

        .mpt-no-results {
          padding: 2.5em;
          text-align: center;
          color: #ccc;
          font-size: 0.82rem;
        }

        /* ── Loading spinner ── */
        .mpt-table-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
        }
        .mpt-spinner {
          width: 28px; height: 28px;
          border: 2px solid #eee;
          border-top-color: #1a1a1a;
          border-radius: 50%;
          animation: mpt-spin 0.7s linear infinite;
        }
        @keyframes mpt-spin { to { transform: rotate(360deg); } }

        /* ── Footnote ── */
        .mpt-footnote {
          font-size: 0.7rem;
          color: #ccc;
          padding: 0.6em 1.2em;
          border-top: 1px solid #f5f5f7;
          margin: 0;
          letter-spacing: 0.02em;
        }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .mpt-layout { flex-direction: column; }
          .mpt-sidebar {
            width: 100%;
            flex-direction: row;
            overflow-x: auto;
            overflow-y: hidden;
            gap: 4px;
            padding-bottom: 4px;
          }
          .mpt-model-item { flex-direction: column; width: auto; min-width: 68px; padding: 0.5em; }
          .mpt-model-name { font-size: 0.68rem; text-align: center; max-width: 64px; }
          .mpt-count { display: none; }
        }
      `}</style>
    </section>
  );
}
