interface ResourceLink {
  label: string;
  url: string;
  desc: string;
}

interface EngineCard {
  name: string;
  tagline: string;
  links: ResourceLink[];
}

const engines: EngineCard[] = [
  {
    name: "SGLang",
    tagline: "Fast serving for LLMs & VLMs",
    links: [
      { label: "文档首页",     url: "https://docs.sglang.ai", desc: "官方文档（跳转至 sglang.io）" },
      { label: "安装指南",     url: "https://docs.sglang.ai/get_started/install.html", desc: "环境要求与安装步骤" },
      { label: "Ascend NPU",  url: "https://docs.sglang.ai/platforms/ascend_npu.html", desc: "华为昇腾适配指南" },
      { label: "GitHub",      url: "https://github.com/sgl-project/sglang", desc: "源码 / Issues / Releases" },
    ],
  },
  {
    name: "vLLM",
    tagline: "High-throughput LLM serving",
    links: [
      { label: "支持的模型", url: "https://docs.vllm.ai/en/latest/models/supported_models.html", desc: "数百个已验证模型" },
      { label: "安装指南",   url: "https://docs.vllm.ai/en/latest/getting_started/installation.html", desc: "NVIDIA / AMD / CPU / TPU" },
      { label: "快速上手",   url: "https://docs.vllm.ai/en/latest/getting_started/quickstart.html", desc: "5 分钟跑起来" },
      { label: "文档首页",   url: "https://docs.vllm.ai", desc: "官方文档" },
    ],
  },
  {
    name: "Mooncake",
    tagline: "KVCache-centric disaggregated serving",
    links: [
      { label: "项目介绍",   url: "https://github.com/kvcache-ai/Mooncake/blob/main/README.md", desc: "架构设计与核心特性" },
      { label: "快速上手",   url: "https://github.com/kvcache-ai/Mooncake/blob/main/docs/source/getting_started/quick-start.md", desc: "部署与接入" },
      { label: "论文",       url: "https://arxiv.org/abs/2407.00079", desc: "Mooncake: KVCache-Centric Serving" },
      { label: "GitHub",    url: "https://github.com/kvcache-ai/Mooncake", desc: "源码 / Issues / Releases" },
    ],
  },
  {
    name: "KTransformers",
    tagline: "Heterogeneous CPU+GPU inference",
    links: [
      { label: "项目介绍",   url: "https://github.com/kvcache-ai/ktransformers/blob/main/README.md", desc: "支持模型与性能数据" },
      { label: "安装指南",   url: "https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/install.md", desc: "CPU / GPU 配置要求" },
      { label: "优化教程",   url: "https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/optimize_your_model.md", desc: "模型适配与算子替换" },
      { label: "GitHub",    url: "https://github.com/kvcache-ai/ktransformers", desc: "源码 / Issues / Releases" },
    ],
  },
];

export function OfficialResources() {
  return (
    <div className="or-grid">
      {engines.map((e) => (
        <div key={e.name} className="or-card">
          <div className="or-card-head">
            <span className="or-name">{e.name}</span>
            <span className="or-tagline">{e.tagline}</span>
          </div>
          <ul className="or-links">
            {e.links.map((l) => (
              <li key={l.label} className="or-link-row">
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="or-link"
                >
                  {l.label}
                </a>
                <span className="or-link-desc">{l.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <style>{`
        .or-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.2em;
          margin-bottom: 2em;
        }
        @media (max-width: 64em) { .or-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 36em) { .or-grid { grid-template-columns: 1fr; } }

        .or-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          overflow: hidden;
          transition: transform 200ms, box-shadow 200ms;
        }
        .or-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
        }

        .or-card-head {
          padding: 1em 1.2em 0.8em;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          flex-direction: column;
          gap: 0.2em;
        }
        .or-name {
          font-family: 'Oswald', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: 0.04em;
        }
        .or-tagline {
          font-size: 0.72rem;
          color: #bbb;
          line-height: 1.4;
        }

        .or-links {
          list-style: none;
          margin: 0;
          padding: 0.4em 0;
        }
        .or-link-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.5em;
          padding: 0.55em 1.2em;
          border-bottom: 1px solid #f8f8f8;
          transition: background 120ms;
        }
        .or-link-row:last-child { border-bottom: none; }
        .or-link-row:hover { background: #fafafa; }

        .or-link {
          font-size: 0.82rem;
          font-weight: 500;
          color: #1a1a1a;
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .or-link:hover { color: #f7ba53; }

        .or-link-desc {
          font-size: 0.7rem;
          color: #ccc;
          text-align: right;
          line-height: 1.3;
          min-width: 0;
        }
      `}</style>
    </div>
  );
}
