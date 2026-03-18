import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { remark } from "remark";
import html from "remark-html";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const result = await remark().use(html).process(post.content);
  const contentHtml = result.toString();

  return (
    <div className="post-page">
      {/* Header */}
      <header className="post-header">
        <div className="post-header-inner">
          <Link href="/" className="post-logo">FANYAO&apos;STUDIO</Link>
          <nav className="post-nav">
            {["HOME", "HOLIDAYS", "TECHNOLOGY", "APPROACHING.AI", "OTHERS", "CONTACT"].map((item) => (
              <a
                key={item}
                href={item === "HOME" ? "/" : item === "TECHNOLOGY" ? "/technology" : "#"}
                className={`post-nav-item ${item === "TECHNOLOGY" ? "active" : ""}`}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Cover */}
      <div className="post-cover">
        <img src={post.cover} alt={post.title} />
      </div>

      {/* Article */}
      <article className="post-article">
        <div className="post-meta">
          <time className="post-date">{post.date}</time>
        </div>

        <h1 className="post-title">{post.title}</h1>

        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        <div className="post-back">
          <Link href="/technology" className="post-back-link">
            &larr; Back to articles
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer className="post-footer">
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

        @font-face {
          font-family: 'Alibaba PuHuiTi 3';
          font-weight: 400;
          font-style: normal;
          font-display: swap;
          src: url('https://cdn.jsdelivr.net/npm/alibabapuhuiti-3-55-regular@1.0.0/AlibabaPuHuiTi-3-55-Regular.woff2') format('woff2');
        }
        @font-face {
          font-family: 'Alibaba PuHuiTi 3';
          font-weight: 700;
          font-style: normal;
          font-display: swap;
          src: url('https://cdn.jsdelivr.net/npm/alibabapuhuiti-3-85-bold@1.0.0/AlibabaPuHuiTi-3-85-Bold.woff2') format('woff2');
        }

        .post-page {
          min-height: 100vh;
          background: #fafafa;
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
          color: #1a1a1a;
        }

        /* ── Header ── */
        .post-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #eee;
        }
        .post-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2.5em;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .post-logo {
          font-family: 'BiggerDisplay', sans-serif;
          font-size: 1.3rem;
          letter-spacing: 0.15em;
          text-decoration: none;
          color: #1a1a1a;
        }
        .post-nav {
          display: flex;
          gap: 2em;
        }
        .post-nav-item {
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          text-decoration: none;
          color: #888;
          transition: color 200ms;
          text-transform: uppercase;
          padding-bottom: 4px;
        }
        .post-nav-item::after {
          background: #f7ba53;
          content: '';
          display: block;
          height: 2px;
          transition: width 0.3s;
          width: 0;
        }
        .post-nav-item:hover::after {
          width: 100%;
        }
        .post-nav-item:hover, .post-nav-item.active {
          color: #1a1a1a;
        }
        .post-nav-item.active {
          font-weight: 600;
        }
        @media (max-width: 48em) {
          .post-nav { display: none; }
          .post-header-inner { padding: 0 1.2em; }
        }

        /* ── Cover ── */
        .post-cover {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2em 2.5em 0;
        }
        .post-cover img {
          width: 100%;
          height: 400px;
          object-fit: cover;
          border-radius: 16px;
        }
        @media (max-width: 48em) {
          .post-cover { padding: 1em 1.2em 0; }
          .post-cover img { height: 220px; border-radius: 12px; }
        }

        /* ── Article ── */
        .post-article {
          max-width: 760px;
          margin: 0 auto;
          padding: 2.5em 2em 4em;
        }
        .post-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5em;
        }
        .post-tags {
          display: flex;
          gap: 0.5em;
        }
        .post-tag {
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #f7ba53;
          background: rgba(247,186,83,0.1);
          padding: 0.25em 0.6em;
          border-radius: 4px;
          font-weight: 600;
        }
        .post-date {
          font-size: 0.8rem;
          color: #aaa;
          letter-spacing: 0.05em;
        }
        .post-title {
          font-family: 'Alibaba PuHuiTi 3', sans-serif;
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: 0.02em;
          margin: 0 0 1.5em;
          color: #000;
        }

        /* ── Markdown content ── */
        .post-content {
          font-family: 'Alibaba PuHuiTi 3', sans-serif;
          font-size: 1.05rem;
          line-height: 1.8;
          color: #333;
        }
        .post-content h2 {
          font-family: 'BiggerDisplay', sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
          margin: 2.5em 0 0.8em;
          letter-spacing: 0.02em;
          color: #1a1a1a;
        }
        .post-content h3 {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 2em 0 0.6em;
          color: #1a1a1a;
        }
        .post-content p {
          margin: 0 0 1.4em;
        }
        .post-content ul, .post-content ol {
          margin: 0 0 1.4em;
          padding-left: 1.5em;
        }
        .post-content li {
          margin-bottom: 0.5em;
        }
        .post-content strong {
          font-weight: 600;
          color: #1a1a1a;
        }
        .post-content a {
          color: #f7ba53;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .post-content blockquote {
          border-left: 3px solid #f7ba53;
          margin: 1.5em 0;
          padding: 0.8em 1.2em;
          background: rgba(247,186,83,0.05);
          border-radius: 0 8px 8px 0;
          color: #555;
        }
        .post-content pre {
          background: #1a1a1a;
          color: #e0e0e0;
          border-radius: 10px;
          padding: 1.2em 1.5em;
          overflow-x: auto;
          margin: 1.5em 0;
          font-size: 0.9rem;
          line-height: 1.6;
        }
        .post-content code {
          font-family: "SF Mono", "Fira Code", monospace;
          font-size: 0.88em;
        }
        .post-content p code {
          background: #f0f0f0;
          padding: 0.15em 0.4em;
          border-radius: 4px;
          color: #c7254e;
        }
        .post-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5em 0;
          font-size: 0.92rem;
        }
        .post-content th {
          text-align: left;
          padding: 0.7em 1em;
          background: #f5f5f5;
          border-bottom: 2px solid #eee;
          font-weight: 600;
          color: #1a1a1a;
        }
        .post-content td {
          padding: 0.7em 1em;
          border-bottom: 1px solid #eee;
        }
        .post-content img {
          max-width: 100%;
          border-radius: 10px;
          margin: 1em 0;
        }
        .post-content hr {
          border: none;
          border-top: 1px solid #eee;
          margin: 2.5em 0;
        }

        /* ── Back link ── */
        .post-back {
          margin-top: 3em;
          padding-top: 2em;
          border-top: 1px solid #eee;
        }
        .post-back-link {
          font-size: 0.9rem;
          color: #888;
          text-decoration: none;
          transition: color 200ms;
          letter-spacing: 0.03em;
        }
        .post-back-link:hover {
          color: #1a1a1a;
        }

        /* ── Footer ── */
        .post-footer {
          text-align: center;
          padding: 2em;
          color: #aaa;
          font-size: 0.8rem;
          border-top: 1px solid #eee;
        }

        @media (max-width: 48em) {
          .post-article { padding: 1.5em 1.2em 3em; }
          .post-content pre { padding: 1em; font-size: 0.82rem; }
        }
      `}</style>
    </div>
  );
}
