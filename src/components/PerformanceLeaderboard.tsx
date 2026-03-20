"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const API = "https://www.aiping.cn/api/v1";

interface SupplierRank { rank: number; supplier: string; value: number; }
interface ModelRanking { modelSeries: string; logo: string; throughput: SupplierRank[]; latency: SupplierRank[]; }

async function fetchRanking(): Promise<ModelRanking[]> {
  // Step 1: Get history to find top model series
  const [histRes, iconRes] = await Promise.all([
    fetch(`${API}/entry_sys/available/testing/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: 1, size: 500 }),
    }),
    fetch(`${API}/maashub/display/icon`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }),
  ]);

  const [hist, icons] = await Promise.all([histRes.json(), iconRes.json()]);

  // Build logo map: modelSeries → url
  const logoMap = new Map<string, string>();
  for (const item of icons?.data?.model ?? []) {
    if (item.model_series) logoMap.set(item.model_series, item.url);
  }

  function findLogo(series: string): string {
    if (logoMap.has(series)) return logoMap.get(series)!;
    for (const [key, url] of logoMap) {
      const brand = key.split("-")[0].toLowerCase();
      if (series.toLowerCase().startsWith(brand)) return url;
    }
    return "";
  }

  const raw = (hist?.data ?? []).filter(
    (d: any) =>
      d.availability > 0 &&
      d.time_to_first_token > 0 &&
      !d.supplier_name?.includes("AI Ping") &&
      !d.supplier_name?.includes("aiping"),
  );

  // Group by model_series, pick top 12 with ≥3 suppliers
  const bySeriesMap = new Map<string, any[]>();
  for (const item of raw) {
    const key = item.model_series as string;
    if (!bySeriesMap.has(key)) bySeriesMap.set(key, []);
    bySeriesMap.get(key)!.push(item);
  }

  const topSeries = [...bySeriesMap.entries()]
    .filter(([, items]) => items.length >= 3)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 12)
    .map(([modelSeries]) => modelSeries);

  // Step 2: For each series, get model IDs via supplier/filter, then fetch throughput + ttft
  const results = await Promise.all(
    topSeries.map(async (modelSeries) => {
      const filterRes = await fetch(`${API}/maashub/supplier/filter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model_series: modelSeries, size: 50, page: 1 }),
      });
      const filterData = await filterRes.json();
      const modelIds: number[] = (filterData?.data?.array_data ?? [])
        .filter((m: any) => m.id)
        .map((m: any) => m.id as number);

      if (modelIds.length === 0) return null;

      const [tpRes, ttftRes] = await Promise.all([
        fetch(`${API}/entry_sys/maas/testing/format/throughput/v2`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model_id: modelIds, time_window: "week" }),
        }),
        fetch(`${API}/entry_sys/maas/testing/format/ttft/v2`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model_id: modelIds, time_window: "week" }),
        }),
      ]);

      const [tpData, ttftData] = await Promise.all([tpRes.json(), ttftRes.json()]);

      const throughput: SupplierRank[] = (tpData?.data ?? [])
        .filter((d: any) => d.avg_output > 0 && !d.supplier_name?.includes("AI Ping") && !d.supplier_name?.includes("aiping"))
        .sort((a: any, b: any) => b.avg_output - a.avg_output)
        .slice(0, 5)
        .map((d: any, i: number) => ({
          rank: i + 1,
          supplier: d.supplier_name,
          value: Math.round(d.avg_output * 10) / 10,
        }));

      const latency: SupplierRank[] = (ttftData?.data ?? [])
        .filter((d: any) => d.p90_ttft > 0 && !d.supplier_name?.includes("AI Ping") && !d.supplier_name?.includes("aiping"))
        .sort((a: any, b: any) => a.p90_ttft - b.p90_ttft)
        .slice(0, 5)
        .map((d: any, i: number) => ({
          rank: i + 1,
          supplier: d.supplier_name,
          value: Math.round(d.p90_ttft * 100) / 100,
        }));

      if (throughput.length === 0 && latency.length === 0) return null;

      return { modelSeries, logo: findLogo(modelSeries), throughput, latency };
    }),
  );

  return results.filter((r): r is ModelRanking => r !== null);
}

export default function PerformanceLeaderboard() {
  const [models, setModels] = useState<ModelRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [sliding, setSliding] = useState<"left" | "right" | null>(null);
  const [displayed, setDisplayed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchRanking().then((data) => { setModels(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const go = useCallback((dir: "left" | "right") => {
    if (sliding || models.length === 0) return;
    const next = dir === "right"
      ? (activeIdx + 1) % models.length
      : (activeIdx - 1 + models.length) % models.length;
    setSliding(dir);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDisplayed(next);
      setActiveIdx(next);
      setSliding(null);
    }, 300);
  }, [sliding, activeIdx, models.length]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const current = models[displayed];
  const prevModel = models.length > 0 ? models[(activeIdx - 1 + models.length) % models.length] : null;
  const nextModel = models.length > 0 ? models[(activeIdx + 1) % models.length] : null;

  return (
    <section className="perf-wrap">
      <h2 className="ai-section-title" style={{ marginBottom: "1.5em" }}>PERFORMANCE RANKING</h2>

      {loading ? (
        <div className="perf-skeleton-wrap">
          <div className="perf-skeleton perf-skeleton-carousel" />
          <div className="perf-skeleton-tables">
            <div className="perf-skeleton perf-skeleton-card" />
            <div className="perf-skeleton perf-skeleton-card" />
          </div>
        </div>
      ) : models.length === 0 ? (
        <p className="perf-empty">暂无数据</p>
      ) : (
        <>
          {/* Carousel */}
          <div className="perf-carousel">
            <button className="perf-arrow" onClick={() => go("left")} aria-label="previous">‹</button>
            <div className="perf-carousel-track">
              {prevModel && (
                <span className="perf-model-side" onClick={() => go("left")}>
                  {prevModel.logo && <img src={prevModel.logo} alt="" className="perf-logo-side" />}
                  {prevModel.modelSeries}
                </span>
              )}
              <span className="perf-model-center">
                {current.logo && <img src={current.logo} alt="" className="perf-logo-center" />}
                {current.modelSeries}
              </span>
              {nextModel && (
                <span className="perf-model-side" onClick={() => go("right")}>
                  {nextModel.logo && <img src={nextModel.logo} alt="" className="perf-logo-side" />}
                  {nextModel.modelSeries}
                </span>
              )}
            </div>
            <button className="perf-arrow" onClick={() => go("right")} aria-label="next">›</button>
          </div>

          <p className="perf-subtitle">近7日数据 · 每日更新 · 实时加载</p>

          {/* Tables */}
          <div className="perf-slider-viewport">
            <div className="perf-tables" data-sliding={sliding ?? ""}>
              <div className="perf-card">
                <div className="perf-card-head">
                  <span className="perf-card-title">吞吐 Throughput</span>
                </div>
                <table className="perf-table">
                  <thead><tr><th>#</th><th>服务商</th><th>平均吞吐（tokens/s）</th></tr></thead>
                  <tbody>
                    {current.throughput.map((row) => (
                      <tr key={row.rank} className={row.rank === 1 ? "perf-row-top" : ""}>
                        <td className="perf-rank-cell">{row.rank}</td>
                        <td>{row.supplier}</td>
                        <td>{row.value.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="perf-card">
                <div className="perf-card-head">
                  <span className="perf-card-title">延迟 Latency</span>
                </div>
                <table className="perf-table">
                  <thead><tr><th>#</th><th>服务商</th><th>P90首字延迟（s）</th></tr></thead>
                  <tbody>
                    {current.latency.map((row) => (
                      <tr key={row.rank} className={row.rank === 1 ? "perf-row-top" : ""}>
                        <td className="perf-rank-cell">{row.rank}</td>
                        <td>{row.supplier}</td>
                        <td>{row.value.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .perf-wrap { margin-top: 3em; }

        /* ── Skeleton ── */
        .perf-skeleton-wrap { display: flex; flex-direction: column; gap: 1.2em; }
        .perf-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: perf-shimmer 1.4s infinite;
          border-radius: 10px;
        }
        @keyframes perf-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .perf-skeleton-carousel { height: 40px; width: 60%; margin: 0 auto; }
        .perf-skeleton-tables { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2em; }
        .perf-skeleton-card { height: 260px; }
        .perf-empty { color: #ccc; font-size: 0.85rem; text-align: center; }

        /* ── Carousel ── */
        .perf-carousel {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.8em;
          margin-bottom: 0.5em;
        }
        .perf-arrow {
          background: none;
          border: 1px solid #e8e8e8;
          border-radius: 50%;
          width: 2em; height: 2em;
          font-size: 1.2rem;
          color: #bbb;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 180ms, color 180ms;
          flex-shrink: 0;
        }
        .perf-arrow:hover { border-color: #1a1a1a; color: #1a1a1a; }

        .perf-carousel-track {
          display: flex;
          align-items: center;
          gap: 2em;
          overflow: hidden;
          min-width: 0;
        }
        .perf-model-side {
          display: flex;
          align-items: center;
          gap: 0.35em;
          font-size: 0.82rem;
          color: #ccc;
          cursor: pointer;
          white-space: nowrap;
          max-width: 130px;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 180ms;
          font-family: 'Oswald', sans-serif;
          letter-spacing: 0.04em;
        }
        .perf-model-side:hover { color: #aaa; }
        .perf-model-center {
          display: flex;
          align-items: center;
          gap: 0.4em;
          font-family: 'Oswald', sans-serif;
          font-size: 1.05rem;
          font-weight: 600;
          color: #1a1a1a;
          white-space: nowrap;
          letter-spacing: 0.04em;
        }
        .perf-logo-center {
          width: 20px; height: 20px;
          object-fit: contain;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .perf-logo-side {
          width: 14px; height: 14px;
          object-fit: contain;
          border-radius: 3px;
          flex-shrink: 0;
          opacity: 0.6;
        }

        .perf-subtitle {
          font-size: 0.75rem;
          color: #ccc;
          margin: 0 0 1.6em;
          text-align: center;
          letter-spacing: 0.03em;
        }

        /* ── Slide ── */
        .perf-slider-viewport { overflow: hidden; }
        .perf-tables {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.2em;
          text-align: left;
          transition: transform 300ms cubic-bezier(0.4,0,0.2,1), opacity 300ms ease;
        }
        .perf-tables[data-sliding="right"] { transform: translateX(-6%); opacity: 0; }
        .perf-tables[data-sliding="left"]  { transform: translateX(6%);  opacity: 0; }
        .perf-tables[data-sliding=""]      { transform: translateX(0);    opacity: 1; }

        @media (max-width: 640px) {
          .perf-tables { grid-template-columns: 1fr; }
          .perf-skeleton-tables { grid-template-columns: 1fr; }
          .perf-carousel-track { gap: 1em; }
          .perf-model-side { max-width: 72px; font-size: 0.72rem; }
        }

        /* ── Cards ── */
        .perf-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          transition: transform 200ms, box-shadow 200ms;
        }
        .perf-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
        .perf-card-head { padding: 0.9em 1.3em; border-bottom: 1px solid #f0f0f0; }
        .perf-card-title {
          font-family: 'Oswald', sans-serif;
          font-size: 0.88rem;
          font-weight: 600;
          color: #1a1a1a;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* ── Table ── */
        .perf-table { width: 100%; border-collapse: collapse; font-size: 0.83rem; }
        .perf-table thead tr { background: #fafafa; }
        .perf-table th {
          padding: 0.5em 1em;
          font-weight: 500;
          color: #bbb;
          font-size: 0.75rem;
          text-align: center;
          border-bottom: 1px solid #f0f0f0;
          letter-spacing: 0.03em;
        }
        .perf-table th:nth-child(2) { text-align: left; }
        .perf-table td {
          padding: 0.68em 1em;
          color: #666;
          text-align: center;
          border-bottom: 1px solid #f5f5f7;
          transition: background 150ms;
        }
        .perf-table td:nth-child(2) { text-align: left; color: #333; }
        .perf-table tbody tr:last-child td { border-bottom: none; }
        .perf-table tbody tr:hover td { background: #fafafa; }
        .perf-rank-cell {
          font-family: 'Oswald', sans-serif;
          font-weight: 600;
          color: #ddd !important;
          width: 2em;
        }
        .perf-row-top td { font-weight: 700; color: #1a1a1a !important; }
        .perf-row-top .perf-rank-cell { color: #f7ba53 !important; }
      `}</style>
    </section>
  );
}
