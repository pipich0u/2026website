interface PrItem { title: string; desc: string; open: boolean; }

interface Community {
  key: string;
  name: string;
  org: string;
  repo: string;
  desc: string;
  stars: string;
  prs: PrItem[];
}

interface Props {
  communities: Community[];
  versionByKey?: Record<string, string>;
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="2em" height="2em" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 16 16" width="1em" height="1em" fill="#797d86">
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
    </svg>
  );
}

function PrOpenIcon() {
  return (
    <svg viewBox="0 0 16 16" width="1em" height="1em" fill="#63d188">
      <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z" />
    </svg>
  );
}

function PrMergedIcon() {
  return (
    <svg viewBox="0 0 16 16" width="1em" height="1em" fill="#a371f7">
      <path d="M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218ZM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm8-9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM4.25 3.5a.75.75 0 1 0 0 .5.75.75 0 0 0 0-.5Z" />
    </svg>
  );
}

function CodeTabIcon() {
  return (
    <svg viewBox="0 0 16 16" width="1em" height="1.25em" fill="#797d86">
      <path d="m11.28 3.22 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L13.94 8l-3.72-3.72a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215Zm-6.56 0a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.06 8l3.72 3.72a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L.47 8.53a.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

export function CommunityCards({ communities, versionByKey = {} }: Props) {
  return (
    <div className="cc-wrap">
      {/* Cards row */}
      <div className="cc-grid">
        {communities.map((c) => {
          const version = versionByKey[c.key];
          return (
          <a
            key={c.key}
            href={`https://github.com/${c.org}/${c.repo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="gh-card-container"
          >
            <div className="gh-card-border" />
            <div className="gh-card">
              <div className="gh-header">
                <div className="gh-top-header">
                  <span className="gh-icon"><GitHubIcon /></span>
                  <div className="gh-repo">
                    <span className="gh-repo-owner">{c.org}</span>
                    <span className="gh-repo-slash">/</span>
                    <span className="gh-repo-name">{c.repo}</span>
                  </div>
                  <div className="gh-space" />
                  {version && <span className="gh-version">{version}</span>}
                  <span className="gh-stars">
                    <StarIcon />
                    <span>{c.stars}</span>
                  </span>
                </div>
                <p className="gh-desc">{c.desc}</p>
                <div className="gh-btm-header">
                  {["Code", "Issues", "Pull requests"].map((tab, i) => (
                    <div key={tab} className={`gh-tab ${i === 2 ? "gh-tab-active" : ""}`}>
                      {i === 0 && <CodeTabIcon />}
                      <span>{tab}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="gh-content">
                <div className="gh-prs">
                  {c.prs.map((pr, i) => (
                    <div key={i} className="gh-pr">
                      <span className="gh-pr-icon">
                        {pr.open ? <PrOpenIcon /> : <PrMergedIcon />}
                      </span>
                      <div className="gh-pr-text">
                        <span className="gh-pr-title">{pr.title}</span>
                        <span className="gh-pr-desc">{pr.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </a>
          );
        })}
      </div>


      <style>{`
        .cc-wrap { margin-bottom: 2em; }

        /* ── Cards ── */
        .cc-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.2em;
          margin-bottom: 1.5em;
        }
        @media (max-width: 64em) { .cc-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 36em) { .cc-grid { grid-template-columns: 1fr; } }

        .gh-card-container {
          position: relative;
          height: 320px;
          border-radius: 1em;
          display: block;
          cursor: pointer;
          transition: transform 0.3s;
          text-decoration: none;
        }
        .gh-card-container:hover { transform: translateY(-2px); }

        .gh-card-border {
          position: absolute;
          inset: 0;
          background: #0005;
          border-radius: inherit;
        }

        .gh-card {
          position: absolute;
          inset: 0.125em;
          border-radius: 0.875em;
          background: #111215;
          display: flex;
          flex-direction: column;
          color: #fff;
          overflow: hidden;
          z-index: 1;
        }

        .gh-header {
          background: #0b0d10;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .gh-top-header {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 8px;
          padding: 10px 12px 0;
        }

        .gh-repo {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          min-width: 0;
        }
        .gh-repo-owner { color: #bebebe; font-weight: 300; white-space: nowrap; }
        .gh-repo-slash { font-size: 10px; color: #555; }
        .gh-repo-name { color: #fff; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .gh-space { flex-grow: 1; }

        .gh-version {
          font-size: 10px;
          color: #52b788;
          background: #f0faf4;
          border: 1px solid #b7e4c7;
          border-radius: 4px;
          padding: 2px 6px;
          font-weight: 600;
          flex-shrink: 0;
          font-family: monospace;
        }

        .gh-stars {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #797d86;
          background: #1c1e22;
          padding: 3px 8px;
          border-radius: 6px;
          border: 1px solid #303236;
          flex-shrink: 0;
        }

        .gh-desc {
          font-size: 11px;
          color: #9198a1;
          padding: 4px 12px 8px;
          line-height: 1.5;
          margin: 0;
        }

        .gh-btm-header {
          display: flex;
          flex-direction: row;
          padding: 0 10px;
          gap: 8px;
        }

        .gh-tab {
          position: relative;
          padding: 4px 4px 10px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #797d86;
        }
        .gh-tab-active { color: #fff; border-bottom: 2px solid #e98463; }
        .gh-tab::before {
          content: "";
          position: absolute;
          background: #fff;
          border-radius: 8px;
          opacity: 0;
          inset: 0;
          bottom: 8px;
          z-index: -1;
          transition: 0.3s;
        }
        .gh-tab:hover::before { opacity: 0.07; }

        .gh-content { flex: 1; overflow: hidden; }

        .gh-prs {
          margin: 8px;
          height: calc(100% - 16px);
          display: flex;
          flex-direction: column;
          gap: 1px;
          border: 1px solid #343539;
          border-radius: 6px;
          overflow: auto;
          scrollbar-width: none;
        }
        .gh-prs::-webkit-scrollbar { width: 0; }

        .gh-pr {
          display: flex;
          flex-direction: row;
          gap: 8px;
          width: 100%;
          outline: 1px solid #343539;
          padding: 8px;
        }
        .gh-pr-icon {
          display: flex;
          width: 1em;
          height: 1em;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .gh-pr-text { display: flex; flex-direction: column; }
        .gh-pr-title {
          font-size: 12px;
          font-weight: 600;
          transition: color 0.2s;
        }
        .gh-pr:hover .gh-pr-title { color: #4493f8; }
        .gh-pr-desc {
          padding-left: 2px;
          font-size: 10px;
          color: #797d86;
        }

        .gh-icon { display: flex; height: 2em; width: 2em; }


      `}</style>
    </div>
  );
}
