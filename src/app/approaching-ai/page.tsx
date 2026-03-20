import { getCommunitySummaries, getArenaElo, getOpenCompassData, getOpenRouterContexts, getHFModelInfo } from "@/lib/approaching";
import Link from "next/link";
import type { Metadata } from "next";
import MobileNav from "@/components/MobileNav";
import PerformanceLeaderboard from "@/components/PerformanceLeaderboard";
import ModelProviderTable from "@/components/ModelProviderTable";
import { CommunityCards } from "@/components/CommunityCards";
import { WeeklyUpdates } from "@/components/WeeklyUpdates";
import { ModelLandscape } from "@/components/ModelLandscape";

export const metadata: Metadata = {
  title: "APPROACHING.AI | FANYAO'STUDIO",
  description: "Tracking open-source AI infrastructure and model landscape.",
};

const communities = [
  {
    key: "sglang", name: "SGLang", org: "sgl-project", repo: "sglang", stars: "24.4k",
    desc: "SGLang is a fast serving framework for large language models and vision language models.",
    prs: [
      { title: "Radix attention for prefix caching", desc: "#1280 merged last week", open: false },
      { title: "Multi-modal support for VLMs", desc: "#1195 opened 3 days ago", open: true },
      { title: "FlashInfer backend integration", desc: "#1102 merged 2 weeks ago", open: false },
    ],
  },
  {
    key: "vllm", name: "vLLM", org: "vllm-project", repo: "vllm", stars: "42k",
    desc: "High-throughput and memory-efficient inference and serving engine for LLMs.",
    prs: [
      { title: "Disaggregated prefill support", desc: "#6786 merged last week", open: false },
      { title: "FP8 KV cache quantization", desc: "#6492 merged 2 weeks ago", open: false },
      { title: "Multi-step scheduling", desc: "#7023 opened 2 days ago", open: true },
    ],
  },
  {
    key: "mooncake", name: "Mooncake", org: "kvcache-ai", repo: "Mooncake", stars: "4.8k",
    desc: "KVCache-centric disaggregated serving platform for LLM inference. Production backend for Kimi.",
    prs: [
      { title: "Joined PyTorch Ecosystem", desc: "#512 merged last month", open: false },
      { title: "Transfer Engine: TCP/RDMA/NVMe-oF support", desc: "#489 merged 2 months ago", open: false },
      { title: "vLLM v1 KV Connector integration", desc: "#456 merged 3 months ago", open: false },
    ],
  },
  {
    key: "ktransformers", name: "KTransformers", org: "kvcache-ai", repo: "ktransformers", stars: "16.7k",
    desc: "A flexible framework for experiencing heterogeneous (CPU+GPU) LLM inference and fine-tuning optimizations.",
    prs: [
      { title: "Day-0 support for Qwen3.5 MoE", desc: "#1024 opened 2 days ago", open: true },
      { title: "AMX kernel: 27x speedup over llama.cpp", desc: "#982 merged last week", open: false },
      { title: "1M context length on single 24GB GPU", desc: "#945 merged 3 weeks ago", open: false },
    ],
  },
];

export default async function ApproachingAIPage() {
  const [summaries, eloByArenaName, ocModels, orContexts, hfInfo] = await Promise.all([
    getCommunitySummaries(communities.map((c) => ({ key: c.key, name: c.name, org: c.org, repo: c.repo }))),
    getArenaElo(),
    getOpenCompassData(),
    getOpenRouterContexts(),
    getHFModelInfo(),
  ]);
  const versionByKey = Object.fromEntries(summaries.map((s) => [s.key, s.version]));



  return (
    <div className="ai-page">
      {/* Header */}
      <header className="ai-header">
        <div className="ai-header-inner">
          <Link href="/" className="ai-logo">FANYAO&apos;STUDIO</Link>
          <nav className="ai-nav">
            {["HOME", "HOLIDAYS", "THOUGHTS", "TECHNOLOGY", "ABOUT ME"].map((item) => (
              <a
                key={item}
                href={item === "HOME" ? "/" : item === "THOUGHTS" ? "/technology" : item === "TECHNOLOGY" ? "/approaching-ai" : "#"}
                className={`ai-nav-item ${item === "TECHNOLOGY" ? "active" : ""}`}
              >
                {item}
              </a>
            ))}
          </nav>
          <MobileNav />
        </div>
      </header>

      {/* Hero */}
      <section className="ai-hero">
        <h1 className="ai-hero-title">TECHNOLOGY</h1>
        <p className="ai-hero-desc">Tracking open-source AI infrastructure and model landscape.</p>
      </section>

      <main className="ai-main">
        {/* Community Cards */}
        <h2 className="ai-section-title">INFRA TRACKING</h2>
        <CommunityCards communities={communities} versionByKey={versionByKey} />

        {/* Weekly AI summaries */}
        <h2 className="ai-section-title" style={{ marginTop: "3em", marginBottom: "1.5em" }}>WEEKLY UPDATES</h2>
        <WeeklyUpdates summaries={summaries} />

        {/* Model Landscape */}
        <h2 className="ai-section-title" style={{ marginTop: "3em", marginBottom: "1.5em" }}>MODEL LANDSCAPE</h2>
        <ModelLandscape ocModels={ocModels} eloByArenaName={eloByArenaName} orContexts={orContexts} hfContexts={hfInfo.contexts} hfDtypes={hfInfo.dtypes} />

        {/* Performance Ranking */}
        <PerformanceLeaderboard />

        {/* Provider Comparison */}
        <ModelProviderTable />
      </main>

      {/* Footer */}
      <footer className="ai-footer">
        <p>&copy; {new Date().getFullYear()} Fan Yao</p>
      </footer>

      <style>{`
        @font-face {
          font-family: 'BiggerDisplay';
          src: url('/assets/fonts/biggerdisplay.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        .ai-page {
          min-height: 100vh;
          background: #fafafa;
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
          color: #1a1a1a;
        }

        /* ── Header ── */
        .ai-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #eee;
        }
        .ai-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2.5em;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ai-logo {
          font-family: 'BiggerDisplay', sans-serif;
          font-size: 1.3rem;
          letter-spacing: 0.15em;
          text-decoration: none;
          color: #1a1a1a;
        }
        .ai-nav {
          display: flex;
          gap: 2em;
        }
        .ai-nav-item {
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          text-decoration: none;
          color: #888;
          transition: color 200ms;
          text-transform: uppercase;
          padding-bottom: 4px;
        }
        .ai-nav-item::after {
          background: #f7ba53;
          content: '';
          display: block;
          height: 2px;
          transition: width 0.3s;
          width: 0;
        }
        .ai-nav-item:hover::after { width: 100%; }
        .ai-nav-item:hover, .ai-nav-item.active { color: #1a1a1a; }
        .ai-nav-item.active { font-weight: 600; }
        @media (max-width: 48em) {
          .ai-nav { display: none; }
          .ai-header-inner { padding: 0 1.2em; }
        }

        /* ── Hero ── */
        .ai-hero {
          max-width: 1200px;
          margin: 0 auto;
          padding: 5em 2.5em 3em;
        }
        .ai-hero-title {
          font-family: 'BiggerDisplay', sans-serif;
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 700;
          letter-spacing: 0.05em;
          margin: 0 0 0.3em;
          color: #1a1a1a;
          line-height: 1;
        }
        .ai-hero-desc {
          font-size: 1.15rem;
          color: #666;
          margin: 0;
          max-width: 700px;
          line-height: 1.6;
        }
        @media (max-width: 48em) {
          .ai-hero { padding: 3em 1.2em 2em; }
        }

        /* ── Main ── */
        .ai-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2.5em 4em;
        }
        @media (max-width: 48em) {
          .ai-main { padding: 0 1.2em 3em; }
        }

        .ai-section-title {
          font-family: 'Oswald', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #aaa;
          margin: 0 0 1.5em;
          text-transform: uppercase;
        }
        .ai-section-desc {
          font-size: 0.85rem;
          color: #bbb;
          margin: -1em 0 1.5em;
        }

        /* ── Community Cards ── */
        .ai-comm-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.2em;
          margin-bottom: 2em;
        }
        @media (max-width: 64em) {
          .ai-comm-cards { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 36em) {
          .ai-comm-cards { grid-template-columns: 1fr; }
        }
        .ai-comm-card {
          background: white;
          border-radius: 12px;
          padding: 1.3em;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          transition: transform 200ms, box-shadow 200ms;
        }
        .ai-comm-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
        }
        .ai-comm-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.4em;
        }
        .ai-comm-name {
          font-family: 'Oswald', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0;
          color: #1a1a1a;
        }
        .ai-comm-link {
          font-size: 0.72rem;
          color: #f7ba53;
          text-decoration: none;
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        .ai-comm-link:hover { text-decoration: underline; }
        .ai-comm-desc {
          font-size: 0.8rem;
          color: #999;
          margin: 0;
          line-height: 1.4;
        }

        /* ── Updates Section ── */
        .ai-updates-section {
          background: white;
          border-radius: 14px;
          padding: 1.5em 2em;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          margin-bottom: 1em;
        }
        .ai-updates-title {
          font-family: 'Oswald', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: #ccc;
          margin: 0 0 1.2em;
        }
        .ai-updates-group {
          margin-bottom: 1.5em;
        }
        .ai-updates-group:last-child {
          margin-bottom: 0;
        }
        .ai-updates-comm-label {
          font-family: 'Oswald', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          color: #f7ba53;
          margin-bottom: 0.6em;
          letter-spacing: 0.05em;
        }
        .ai-updates-list {
          border-left: 2px solid #f0f0f0;
          padding-left: 1.2em;
        }
        .ai-update-row {
          display: flex;
          gap: 1em;
          margin-bottom: 1em;
          align-items: flex-start;
        }
        .ai-update-row:last-child {
          margin-bottom: 0;
        }
        .ai-update-date {
          font-size: 0.72rem;
          color: #bbb;
          letter-spacing: 0.03em;
          white-space: nowrap;
          padding-top: 0.15em;
          min-width: 6em;
        }
        .ai-update-content {
          flex: 1;
        }
        .ai-update-title {
          font-family: 'Oswald', sans-serif;
          font-size: 0.88rem;
          font-weight: 600;
          margin: 0 0 0.2em;
          color: #1a1a1a;
          line-height: 1.3;
        }
        .ai-update-summary {
          font-size: 0.78rem;
          color: #888;
          margin: 0;
          line-height: 1.5;
        }
        @media (max-width: 48em) {
          .ai-updates-section { padding: 1.2em; }
          .ai-update-row { flex-direction: column; gap: 0.2em; }
          .ai-update-date { min-width: auto; }
        }

        /* ── Footer ── */
        .ai-footer {
          text-align: center;
          padding: 2em;
          color: #aaa;
          font-size: 0.8rem;
          border-top: 1px solid #eee;
        }
      `}</style>
    </div>
  );
}
