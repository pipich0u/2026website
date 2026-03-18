"use client";

import { useState } from "react";

export default function ShareBar({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  const shareToLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  return (
    <div className="share-bar">
      <span className="share-label">SHARE</span>
      <button className="share-btn" onClick={copyLink} title="Copy link">
        {copied ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
        <span>{copied ? "Copied!" : "Copy link"}</span>
      </button>
      <button className="share-btn" onClick={shareToTwitter} title="Share on X">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span>X</span>
      </button>
      <button className="share-btn" onClick={shareToLinkedIn} title="Share on LinkedIn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
        <span>LinkedIn</span>
      </button>

      <style>{`
        .share-bar {
          display: flex;
          align-items: center;
          gap: 0.8em;
          margin-top: 2em;
          padding-top: 1.5em;
          border-top: 1px solid #eee;
        }
        .share-label {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: #aaa;
          margin-right: 0.5em;
        }
        .share-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4em;
          padding: 0.5em 1em;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: white;
          color: #555;
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 200ms;
          font-family: inherit;
        }
        .share-btn:hover {
          border-color: #1a1a1a;
          color: #1a1a1a;
        }
        @media (max-width: 48em) {
          .share-bar { flex-wrap: wrap; }
          .share-btn span { display: none; }
          .share-btn { padding: 0.5em 0.7em; }
        }
      `}</style>
    </div>
  );
}
