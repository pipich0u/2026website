"use client";

import { useState, useRef, useEffect } from "react";

interface ModelEntry {
  name: string;
  family: string;
  params: string;
  precision: string;
  type: string;
  releaseDate: string;
  isFlagship: boolean;
  order: number;
}

interface ModelFamily {
  family: string;
  type: string;
  flagship: ModelEntry;
  models: ModelEntry[];
  logo?: string;
}

const familyColors: Record<string, string> = {
  GLM: "#4285f4",
  DeepSeek: "#4d6bfe",
  Qwen: "#6236ff",
  Kimi: "#000000",
  Doubao: "#325aff",
  Yi: "#7c3aed",
  Baichuan: "#1a56db",
  MiniMax: "#ff6b35",
};

export default function ModelSection({ families }: { families: ModelFamily[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const active = families[activeIdx];
  const color = active ? familyColors[active.family] || "#888" : "#888";

  function go(dir: "left" | "right") {
    if (dir === "left" && activeIdx > 0) {
      setDirection("left");
      setActiveIdx(activeIdx - 1);
    } else if (dir === "right" && activeIdx < families.length - 1) {
      setDirection("right");
      setActiveIdx(activeIdx + 1);
    }
  }

  // scroll carousel to keep active item centered
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const item = track.children[activeIdx] as HTMLElement;
    if (!item) return;
    const scrollLeft = item.offsetLeft - track.offsetWidth / 2 + item.offsetWidth / 2;
    track.scrollTo({ left: scrollLeft, behavior: "smooth" });
  }, [activeIdx]);

  if (!families.length) return null;

  return (
    <div className="ml">
      {/* Carousel */}
      <div className="ml-carousel">
        <button
          className="ml-arrow ml-arrow-l"
          onClick={() => go("left")}
          disabled={activeIdx === 0}
          aria-label="Previous model"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="ml-track" ref={trackRef}>
          {families.map((f, idx) => {
            const fc = familyColors[f.family] || "#888";
            const hasLogo = f.logo && f.logo.length > 0;
            return (
              <button
                key={f.family}
                className={`ml-pill ${idx === activeIdx ? "ml-pill-active" : ""}`}
                onClick={() => { setDirection(idx > activeIdx ? "right" : "left"); setActiveIdx(idx); }}
                style={{ "--pill-color": fc } as React.CSSProperties}
              >
                {hasLogo ? (
                  <img src={f.logo!} alt={f.family} className="ml-pill-logo" />
                ) : (
                  <span className="ml-pill-letter" style={{ background: fc }}>{f.family[0]}</span>
                )}
                <span className="ml-pill-name">{f.flagship.name}</span>
              </button>
            );
          })}
        </div>

        <button
          className="ml-arrow ml-arrow-r"
          onClick={() => go("right")}
          disabled={activeIdx === families.length - 1}
          aria-label="Next model"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Dots */}
      <div className="ml-dots">
        {families.map((_, i) => (
          <span
            key={i}
            className={`ml-dot ${i === activeIdx ? "ml-dot-active" : ""}`}
            style={i === activeIdx ? { background: color } : undefined}
            onClick={() => { setDirection(i > activeIdx ? "right" : "left"); setActiveIdx(i); }}
          />
        ))}
      </div>

      {/* Detail Panel */}
      {active && (
        <div className="ml-detail" key={active.family} style={{ "--accent": color } as React.CSSProperties}>
          {/* Family Header */}
          <div className="ml-detail-header">
            <div className="ml-detail-title-row">
              <h3 className="ml-detail-family" style={{ color }}>{active.family}</h3>
              <span className={`ml-detail-badge ${active.type === "Open" ? "ml-badge-open" : "ml-badge-closed"}`}>
                {active.type === "Open" ? "OPEN SOURCE" : "CLOSED SOURCE"}
              </span>
            </div>
            <div className="ml-detail-subtitle">
              <span className="ml-detail-count">{active.models.length} models in family</span>
              <span className="ml-detail-flagship">Flagship: {active.flagship.name}</span>
            </div>
          </div>

          {/* Model Table */}
          <div className="ml-table-wrap">
            <table className="ml-table">
              <thead>
                <tr>
                  <th className="ml-th ml-th-rank">#</th>
                  <th className="ml-th ml-th-name">Model</th>
                  <th className="ml-th ml-th-params">Parameters</th>
                  <th className="ml-th ml-th-prec">Precision</th>
                  <th className="ml-th ml-th-date">Release Date</th>
                </tr>
              </thead>
              <tbody>
                {active.models.map((m, i) => (
                  <tr key={m.name} className={`ml-tr ${m.isFlagship ? "ml-tr-flagship" : ""}`}>
                    <td className="ml-td ml-td-rank">
                      {m.isFlagship ? (
                        <span className="ml-rank-star">★</span>
                      ) : (
                        <span className="ml-rank-num">{i + 1}</span>
                      )}
                    </td>
                    <td className="ml-td ml-td-name">
                      <span className="ml-model-name">{m.name}</span>
                      {m.isFlagship && <span className="ml-flagship-tag">FLAGSHIP</span>}
                    </td>
                    <td className="ml-td ml-td-params">
                      <span className="ml-mono">{m.params}</span>
                    </td>
                    <td className="ml-td ml-td-prec">
                      <span className="ml-mono">{m.precision}</span>
                    </td>
                    <td className="ml-td ml-td-date">{m.releaseDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        .ml {
          animation: mlFadeIn 500ms ease;
        }
        @keyframes mlFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Carousel ── */
        .ml-carousel {
          display: flex;
          align-items: center;
          gap: 0.5em;
          margin-bottom: 0.8em;
        }

        .ml-arrow {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1.5px solid #e0e0e0;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #666;
          transition: all 200ms;
        }
        .ml-arrow:hover:not(:disabled) {
          border-color: #ccc;
          background: #f8f8f8;
          color: #333;
          transform: scale(1.05);
        }
        .ml-arrow:disabled {
          opacity: 0.3;
          cursor: default;
        }

        .ml-track {
          flex: 1;
          display: flex;
          gap: 0.6em;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding: 0.4em 0;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .ml-track::-webkit-scrollbar { display: none; }

        .ml-pill {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 0.5em;
          padding: 0.55em 1em;
          border-radius: 28px;
          border: 1.5px solid #eee;
          background: white;
          cursor: pointer;
          transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
        }
        .ml-pill:hover {
          border-color: #ddd;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          transform: translateY(-1px);
        }
        .ml-pill-active {
          border-color: var(--pill-color);
          background: var(--pill-color);
          color: white;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          transform: translateY(-2px) scale(1.03);
        }
        .ml-pill-active:hover {
          border-color: var(--pill-color);
          transform: translateY(-2px) scale(1.03);
        }

        .ml-pill-logo {
          width: 22px;
          height: 22px;
          border-radius: 5px;
          object-fit: contain;
        }
        .ml-pill-letter {
          width: 22px;
          height: 22px;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-family: 'Oswald', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
        }
        .ml-pill-active .ml-pill-letter {
          background: rgba(255,255,255,0.3) !important;
        }
        .ml-pill-name {
          font-family: 'Oswald', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        /* ── Dots ── */
        .ml-dots {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-bottom: 1.2em;
        }
        .ml-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ddd;
          cursor: pointer;
          transition: all 250ms;
        }
        .ml-dot-active {
          width: 20px;
          border-radius: 3px;
        }

        /* ── Detail Panel ── */
        .ml-detail {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          animation: mlSlideUp 350ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes mlSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ml-detail-header {
          padding: 1.5em 2em 1em;
          border-bottom: 1px solid #f0f0f0;
        }

        .ml-detail-title-row {
          display: flex;
          align-items: center;
          gap: 0.8em;
          margin-bottom: 0.4em;
        }

        .ml-detail-family {
          font-family: 'Oswald', sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
          margin: 0;
          letter-spacing: 0.02em;
        }

        .ml-detail-badge {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 0.25em 0.6em;
          border-radius: 4px;
        }
        .ml-badge-open {
          background: rgba(34,197,94,0.1);
          color: #16a34a;
        }
        .ml-badge-closed {
          background: rgba(100,100,100,0.08);
          color: #999;
        }

        .ml-detail-subtitle {
          display: flex;
          align-items: center;
          gap: 1.5em;
          font-size: 0.78rem;
          color: #aaa;
        }
        .ml-detail-flagship {
          color: #ccc;
        }

        /* ── Table ── */
        .ml-table-wrap {
          overflow-x: auto;
        }
        .ml-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }
        .ml-th {
          text-align: left;
          padding: 0.8em 1em;
          font-family: 'Oswald', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: #bbb;
          text-transform: uppercase;
          border-bottom: 1px solid #f0f0f0;
        }
        .ml-th-rank { width: 3em; text-align: center; }
        .ml-th-params, .ml-th-prec { text-align: right; }
        .ml-th-date { text-align: right; }

        .ml-tr {
          transition: background 150ms;
        }
        .ml-tr:hover {
          background: #fafafa;
        }
        .ml-tr-flagship {
          background: linear-gradient(90deg, rgba(247,186,83,0.04), transparent);
        }
        .ml-tr-flagship:hover {
          background: linear-gradient(90deg, rgba(247,186,83,0.08), rgba(250,250,250,0.5));
        }

        .ml-td {
          padding: 0.75em 1em;
          border-bottom: 1px solid #f8f8f8;
          vertical-align: middle;
        }

        .ml-td-rank {
          text-align: center;
        }
        .ml-rank-star {
          color: #f7ba53;
          font-size: 1rem;
        }
        .ml-rank-num {
          font-family: "SF Mono", "Fira Code", monospace;
          font-size: 0.75rem;
          color: #ccc;
        }

        .ml-td-name {
          display: flex;
          align-items: center;
          gap: 0.6em;
        }
        .ml-model-name {
          font-weight: 500;
          color: #333;
        }
        .ml-flagship-tag {
          font-size: 0.55rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 0.15em 0.4em;
          border-radius: 3px;
          background: rgba(247,186,83,0.15);
          color: #d4940a;
        }

        .ml-td-params, .ml-td-prec {
          text-align: right;
        }
        .ml-mono {
          font-family: "SF Mono", "Fira Code", monospace;
          font-size: 0.78rem;
          color: #888;
          background: #f6f6f8;
          padding: 0.15em 0.5em;
          border-radius: 4px;
        }

        .ml-td-date {
          text-align: right;
          font-size: 0.78rem;
          color: #bbb;
        }

        /* ── Mobile ── */
        @media (max-width: 48em) {
          .ml-carousel { gap: 0.3em; }
          .ml-arrow { width: 30px; height: 30px; }
          .ml-pill { padding: 0.4em 0.7em; gap: 0.3em; }
          .ml-pill-name { font-size: 0.72rem; }
          .ml-pill-logo, .ml-pill-letter { width: 18px; height: 18px; }
          .ml-detail-header { padding: 1em 1.2em 0.8em; }
          .ml-detail-family { font-size: 1.3rem; }
          .ml-th, .ml-td { padding: 0.6em 0.5em; }
          .ml-th-params, .ml-th-prec { display: none; }
          .ml-td-params, .ml-td-prec { display: none; }
        }
      `}</style>
    </div>
  );
}
