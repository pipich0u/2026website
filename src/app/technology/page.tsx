import { getAllPosts } from "@/lib/posts";
import Link from "next/link";

export default function TechnologyPage() {
  const posts = getAllPosts();

  return (
    <div className="blog-page">
      {/* Header */}
      <header className="blog-header">
        <div className="blog-header-inner">
          <Link href="/" className="blog-logo">FANYAO&apos;STUDIO</Link>
          <nav className="blog-nav">
            {["HOME", "HOLIDAYS", "TECHNOLOGY", "APPROACHING.AI", "OTHERS", "CONTACT"].map((item) => (
              <a
                key={item}
                href={item === "HOME" ? "/" : item === "TECHNOLOGY" ? "/technology" : "#"}
                className={`blog-nav-item ${item === "TECHNOLOGY" ? "active" : ""}`}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="blog-hero">
        <h1 className="blog-hero-title">TECHNOLOGY</h1>
        <p className="blog-hero-desc">
          Thoughts on AI, engineering, and the future of software.
        </p>
      </section>

      {/* Post List */}
      <main className="blog-main">
        <div className="blog-grid">
          {posts.map((post) => (
            <Link key={post.slug} href={`/technology/${post.slug}`} className="blog-card">
              <div className="blog-card-cover">
                <img src={post.cover} alt={post.title} />
              </div>
              <div className="blog-card-body">
                <h2 className="blog-card-title">{post.title}</h2>
                <p className="blog-card-summary">{post.summary}</p>
                <time className="blog-card-date">{post.date}</time>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="blog-footer">
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

        .blog-page {
          min-height: 100vh;
          background: #fafafa;
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
          color: #1a1a1a;
        }

        /* ── Header ── */
        .blog-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #eee;
        }
        .blog-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2.5em;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .blog-logo {
          font-family: 'BiggerDisplay', sans-serif;
          font-size: 1.3rem;
          letter-spacing: 0.15em;
          text-decoration: none;
          color: #1a1a1a;
        }
        .blog-nav {
          display: flex;
          gap: 2em;
        }
        .blog-nav-item {
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          text-decoration: none;
          color: #888;
          transition: color 200ms;
          text-transform: uppercase;
          padding-bottom: 4px;
        }
        .blog-nav-item::after {
          background: #f7ba53;
          content: '';
          display: block;
          height: 2px;
          transition: width 0.3s;
          width: 0;
        }
        .blog-nav-item:hover::after {
          width: 100%;
        }
        .blog-nav-item:hover, .blog-nav-item.active {
          color: #1a1a1a;
        }
        .blog-nav-item.active {
          font-weight: 600;
        }
        @media (max-width: 48em) {
          .blog-nav { display: none; }
          .blog-header-inner { padding: 0 1.2em; }
        }

        /* ── Hero ── */
        .blog-hero {
          max-width: 1200px;
          margin: 0 auto;
          padding: 5em 2.5em 3em;
        }
        .blog-hero-title {
          font-family: 'BiggerDisplay', sans-serif;
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 700;
          letter-spacing: 0.05em;
          margin: 0 0 0.3em;
          color: #1a1a1a;
          line-height: 1;
        }
        .blog-hero-desc {
          font-family: 'Oswald', sans-serif;
          font-weight: 300;
          font-size: 1.2rem;
          color: #666;
          margin: 0;
          max-width: 500px;
          line-height: 1.6;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        @media (max-width: 48em) {
          .blog-hero { padding: 3em 1.2em 2em; }
        }

        /* ── Post Grid ── */
        .blog-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2.5em 4em;
        }
        .blog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 2em;
        }
        @media (max-width: 48em) {
          .blog-main { padding: 0 1.2em 3em; }
          .blog-grid { grid-template-columns: 1fr; }
        }

        /* ── Card ── */
        .blog-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          transition: transform 200ms, box-shadow 200ms;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
        }
        .blog-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.1);
        }
        .blog-card-cover {
          height: 200px;
          overflow: hidden;
        }
        .blog-card-cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 400ms;
        }
        .blog-card:hover .blog-card-cover img {
          transform: scale(1.05);
        }
        .blog-card-body {
          padding: 1.5em;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .blog-card-tags {
          display: flex;
          gap: 0.5em;
          margin-bottom: 0.8em;
        }
        .blog-tag {
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #f7ba53;
          background: rgba(247,186,83,0.1);
          padding: 0.25em 0.6em;
          border-radius: 4px;
          font-weight: 600;
        }
        .blog-card-title {
          font-family: 'BiggerDisplay', sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          margin: 0 0 0.6em;
          line-height: 1.2;
          letter-spacing: 0.02em;
        }
        .blog-card-summary {
          font-size: 0.9rem;
          color: #666;
          line-height: 1.6;
          margin: 0 0 1em;
          flex: 1;
        }
        .blog-card-date {
          font-size: 0.78rem;
          color: #aaa;
          letter-spacing: 0.05em;
        }

        /* ── Footer ── */
        .blog-footer {
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
