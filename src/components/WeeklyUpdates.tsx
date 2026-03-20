"use client";

import { useState } from "react";
import type { CommunitySummary } from "@/lib/approaching";

interface Props {
  summaries: CommunitySummary[];
}

export function WeeklyUpdates({ summaries }: Props) {
  const [active, setActive] = useState<CommunitySummary | null>(null);

  if (summaries.every((s) => !s.summary)) return null;

  return (
    <>
      <div className="wu-grid">
        {summaries.map((s) => (
          <div key={s.key} className="wu-col">
            <div className="wu-col-label">{s.name}</div>
            {s.summary ? (
              <button className="wu-article" onClick={() => setActive(s)}>
                <span className="wu-article-title">
                  {s.name} {s.year} 第{s.weekNum}周更新
                </span>
                <span className="wu-article-meta">{s.commitCount} commits · {s.since}</span>
              </button>
            ) : (
              <div className="wu-article wu-article-empty">暂无数据</div>
            )}
          </div>
        ))}
      </div>

      {/* Modal overlay */}
      {active && (
        <div className="wu-overlay" onClick={() => setActive(null)}>
          <div className="wu-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wu-modal-header">
              <div>
                <div className="wu-modal-label">{active.name}</div>
                <h3 className="wu-modal-title">
                  {active.name} {active.year} 第{active.weekNum}周更新
                </h3>
              </div>
              <button className="wu-close" onClick={() => setActive(null)}>✕</button>
            </div>

            {active.summary && (
              <p className="wu-modal-summary">{active.summary}</p>
            )}

            {active.highlights.length > 0 && (
              <div className="wu-highlights">
                {active.highlights.map((h, i) => (
                  <div key={i} className="wu-highlight">
                    <div className="wu-highlight-top">
                      <span className="wu-highlight-num">{i + 1}</span>
                      <span className="wu-highlight-title">{h.title}</span>
                      {h.link && (
                        <a
                          href={h.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`wu-highlight-link ${h.isPR ? "wu-highlight-link-pr" : ""}`}
                        >
                          {h.isPR ? "查看 PR →" : "查看 commit →"}
                        </a>
                      )}
                    </div>
                    <div className="wu-highlight-body">
                      {h.background && (
                        <div className="wu-highlight-row">
                          <span className="wu-highlight-tag wu-tag-bg">背景</span>
                          <p className="wu-highlight-text">{h.background}</p>
                        </div>
                      )}
                      {h.change && (
                        <div className="wu-highlight-row">
                          <span className="wu-highlight-tag wu-tag-change">改动</span>
                          <p className="wu-highlight-text">{h.change}</p>
                        </div>
                      )}
                      {h.impact && (
                        <div className="wu-highlight-row">
                          <span className="wu-highlight-tag wu-tag-impact">意义</span>
                          <p className="wu-highlight-text">{h.impact}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="wu-modal-footer">
              <a
                href={`https://github.com/${active.org}/${active.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="wu-repo-link"
              >
                {active.org}/{active.repo} →
              </a>
              <span className="wu-footer-meta">数据来源 GitHub · AI 摘要由 GLM 生成</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .wu-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.2em;
          margin-bottom: 2em;
        }
        @media (max-width: 64em) { .wu-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 36em) { .wu-grid { grid-template-columns: 1fr; } }

        .wu-col {
          display: flex;
          flex-direction: column;
          gap: 0.5em;
        }
        .wu-col-label {
          font-family: 'Oswald', sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          color: #ccc;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0 0.2em;
        }

        .wu-article {
          background: white;
          border-radius: 10px;
          padding: 0.9em 1.1em;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          border: none;
          text-align: left;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 0.4em;
          transition: transform 150ms, box-shadow 150ms;
          width: 100%;
        }
        .wu-article:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.09);
        }
        .wu-article-empty {
          color: #ddd;
          font-size: 0.78rem;
          cursor: default;
        }
        .wu-article-empty:hover { transform: none; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }

        .wu-article-title {
          font-size: 0.83rem;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.4;
        }
        .wu-article-meta {
          font-size: 0.7rem;
          color: #bbb;
          letter-spacing: 0.02em;
        }

        /* ── Overlay ── */
        .wu-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.35);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2em;
          backdrop-filter: blur(3px);
          animation: wu-fade-in 180ms ease;
        }
        @keyframes wu-fade-in { from { opacity: 0; } to { opacity: 1; } }

        /* ── Modal ── */
        .wu-modal {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 640px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.18);
          animation: wu-slide-up 220ms cubic-bezier(0.34,1.56,0.64,1);
          scrollbar-width: thin;
          scrollbar-color: #eee transparent;
        }
        @keyframes wu-slide-up {
          from { transform: translateY(24px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }

        .wu-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 1.5em 1.8em 1em;
          border-bottom: 1px solid #f0f0f0;
          position: sticky;
          top: 0;
          background: white;
          z-index: 1;
        }
        .wu-modal-label {
          font-family: 'Oswald', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          color: #f7ba53;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 0.3em;
        }
        .wu-modal-title {
          font-family: 'Oswald', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
          letter-spacing: 0.04em;
        }
        .wu-close {
          border: none;
          background: none;
          font-size: 1rem;
          color: #bbb;
          cursor: pointer;
          padding: 0.2em;
          line-height: 1;
          flex-shrink: 0;
          margin-top: 0.2em;
          transition: color 150ms;
        }
        .wu-close:hover { color: #1a1a1a; }

        .wu-modal-summary {
          font-size: 0.85rem;
          color: #555;
          line-height: 1.7;
          padding: 1.2em 1.8em;
          margin: 0;
          border-bottom: 1px solid #f5f5f7;
        }

        /* ── Highlights ── */
        .wu-highlights {
          padding: 1em 1.8em;
          display: flex;
          flex-direction: column;
          gap: 1em;
        }
        .wu-highlight {
          border-left: 2px solid #f0f0f0;
          padding-left: 1em;
        }
        .wu-highlight-top {
          display: flex;
          align-items: center;
          gap: 0.6em;
          margin-bottom: 0.3em;
        }
        .wu-highlight-num {
          font-family: 'Oswald', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          color: #ddd;
          width: 1.2em;
          text-align: center;
          flex-shrink: 0;
        }
        .wu-highlight-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: #1a1a1a;
          flex: 1;
        }
        .wu-highlight-link {
          font-size: 0.72rem;
          color: #aaa;
          text-decoration: none;
          font-weight: 500;
          flex-shrink: 0;
          letter-spacing: 0.03em;
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 0.1em 0.5em;
          transition: border-color 150ms, color 150ms;
        }
        .wu-highlight-link:hover { border-color: #ddd; color: #555; text-decoration: none; }
        .wu-highlight-link-pr { color: #2d9b6a; border-color: #b7e4c7; }
        .wu-highlight-link-pr:hover { border-color: #2d9b6a; color: #1a7a52; }
        .wu-highlight-body {
          padding-left: 1.8em;
          display: flex;
          flex-direction: column;
          gap: 0.5em;
          margin-top: 0.4em;
        }
        .wu-highlight-row {
          display: flex;
          align-items: flex-start;
          gap: 0.6em;
        }
        .wu-highlight-tag {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          border-radius: 3px;
          padding: 0.15em 0.5em;
          flex-shrink: 0;
          margin-top: 0.2em;
          font-family: 'Oswald', sans-serif;
        }
        .wu-tag-bg     { background: #f0f4ff; color: #5472d4; }
        .wu-tag-change { background: #fff8e8; color: #b07800; }
        .wu-tag-impact { background: #edfaf4; color: #2d9b6a; }
        .wu-highlight-text {
          font-size: 0.82rem;
          color: #555;
          line-height: 1.7;
          margin: 0;
        }

        /* ── Footer ── */
        .wu-modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.9em 1.8em;
          border-top: 1px solid #f0f0f0;
          background: #fafafa;
          border-radius: 0 0 16px 16px;
        }
        .wu-repo-link {
          font-size: 0.78rem;
          color: #1a1a1a;
          text-decoration: none;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .wu-repo-link:hover { text-decoration: underline; }
        .wu-footer-meta {
          font-size: 0.68rem;
          color: #ccc;
          letter-spacing: 0.02em;
        }

        @media (max-width: 48em) {
          .wu-overlay { padding: 1em; align-items: flex-end; }
          .wu-modal { max-height: 90vh; border-radius: 16px 16px 0 0; }
        }
      `}</style>
    </>
  );
}
