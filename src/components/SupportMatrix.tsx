"use client";

import { useState } from "react";
import type { SupportMatrixData, SupportCell } from "@/lib/approaching";

interface Props {
  data: SupportMatrixData;
}

function Cell({ cell }: { cell: SupportCell }) {
  const [tip, setTip] = useState(false);

  const icon =
    cell.status === "yes"     ? "✓" :
    cell.status === "partial" ? "~" :
    cell.status === "no"      ? "✗" : "?";

  const cls =
    cell.status === "yes"     ? "sm-yes" :
    cell.status === "partial" ? "sm-partial" :
    cell.status === "no"      ? "sm-no" : "sm-unknown";

  if (cell.status === "yes" && cell.link) {
    return (
      <td className={`sm-cell ${cls}`}>
        <div
          className="sm-cell-inner"
          onMouseEnter={() => setTip(true)}
          onMouseLeave={() => setTip(false)}
        >
          <a href={cell.link} target="_blank" rel="noopener noreferrer" className="sm-icon-link">
            {icon}
          </a>
          {tip && cell.prTitle && (
            <div className="sm-tooltip">{cell.prTitle}</div>
          )}
        </div>
      </td>
    );
  }

  return (
    <td className={`sm-cell ${cls}`}>
      <span className="sm-icon">{icon}</span>
    </td>
  );
}

function Section({
  title,
  rows,
  engines,
}: {
  title: string;
  rows: SupportMatrixData["models"];
  engines: SupportMatrixData["engines"];
}) {
  return (
    <>
      <tr className="sm-section-header">
        <td colSpan={engines.length + 1}>{title}</td>
      </tr>
      {rows.map((row) => (
        <tr key={row.name} className="sm-row">
          <td className="sm-row-name">{row.name}</td>
          {engines.map((e) => (
            <Cell key={e.key} cell={row.cells[e.key]} />
          ))}
        </tr>
      ))}
    </>
  );
}

export function SupportMatrix({ data }: Props) {
  return (
    <div className="sm-wrap">
      <div className="sm-legend">
        <span className="sm-yes">✓ 有 PR 记录</span>
        <span className="sm-unknown">? 未检索到</span>
        <span className="sm-meta">数据来源 GitHub merged PR · {data.updatedAt} · 悬停查看 PR 标题</span>
      </div>

      <div className="sm-table-wrap">
        <table className="sm-table">
          <thead>
            <tr>
              <th className="sm-th-name" />
              {data.engines.map((e) => (
                <th key={e.key} className="sm-th">{e.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Section title="国产模型" rows={data.models} engines={data.engines} />
            <Section title="国产芯片" rows={data.chips}  engines={data.engines} />
          </tbody>
        </table>
      </div>

      <style>{`
        .sm-wrap {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          overflow: hidden;
          margin-bottom: 2em;
        }

        .sm-legend {
          display: flex;
          align-items: center;
          gap: 1.2em;
          padding: 0.75em 1.3em;
          border-bottom: 1px solid #f0f0f0;
          background: #fafafa;
          flex-wrap: wrap;
        }
        .sm-legend span { font-size: 0.72rem; letter-spacing: 0.02em; }
        .sm-meta { color: #bbb; margin-left: auto; }

        .sm-table-wrap { overflow-x: auto; }

        .sm-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 520px;
        }

        .sm-th-name { width: 140px; }
        .sm-th {
          padding: 0.6em 0.5em;
          font-family: 'Oswald', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          color: #888;
          letter-spacing: 0.08em;
          text-align: center;
          border-bottom: 1px solid #f0f0f0;
          background: #fafafa;
          white-space: nowrap;
        }

        .sm-section-header td {
          padding: 0.5em 1.3em;
          font-family: 'Oswald', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          color: #ccc;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: #f8f8f8;
          border-top: 1px solid #f0f0f0;
          border-bottom: 1px solid #f0f0f0;
        }

        .sm-row:hover td { background: #fafafa; }

        .sm-row-name {
          padding: 0.6em 1.3em;
          font-size: 0.82rem;
          font-weight: 500;
          color: #333;
          border-bottom: 1px solid #f5f5f7;
          white-space: nowrap;
        }

        .sm-cell {
          text-align: center;
          border-bottom: 1px solid #f5f5f7;
          width: 80px;
          position: relative;
        }

        .sm-cell-inner {
          position: relative;
          display: inline-block;
        }

        .sm-icon, .sm-icon-link {
          font-size: 0.85rem;
          font-weight: 700;
          display: inline-block;
          width: 1.6em;
          height: 1.6em;
          line-height: 1.6em;
          text-align: center;
          border-radius: 4px;
          text-decoration: none;
        }

        .sm-yes     .sm-icon,
        .sm-yes     .sm-icon-link { color: #2d9b6a; background: #edfaf4; }
        .sm-partial .sm-icon      { color: #c9820a; background: #fff8e8; }
        .sm-no      .sm-icon      { color: #d45a5a; background: #fdf0f0; }
        .sm-unknown .sm-icon      { color: #ccc;    background: #f5f5f5; }

        .sm-icon-link:hover { background: #d0f0e0; }

        /* Legend colors */
        .sm-legend .sm-yes     { color: #2d9b6a; font-weight: 600; }
        .sm-legend .sm-unknown { color: #aaa; }

        /* Tooltip */
        .sm-tooltip {
          position: absolute;
          bottom: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%);
          background: #1a1a1a;
          color: #fff;
          font-size: 0.7rem;
          line-height: 1.4;
          padding: 0.4em 0.7em;
          border-radius: 6px;
          white-space: nowrap;
          max-width: 260px;
          white-space: normal;
          z-index: 100;
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .sm-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 4px solid transparent;
          border-top-color: #1a1a1a;
        }
      `}</style>
    </div>
  );
}
