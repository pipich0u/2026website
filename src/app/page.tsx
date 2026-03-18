"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

const cardData = [
  {
    id: 1,
    image: "/assets/images/large/saint-antonien-2000w",
    background: "/assets/images/small/saint-antonien",
    title: "Switzerland - Alps",
    subtitle: "Saint Antönien",
  },
  {
    id: 2,
    image: "/assets/images/large/japan-alps-2000w",
    background: "/assets/images/small/japan-alps",
    title: "Japan Alps",
    subtitle: "Nagano Prefecture",
  },
  {
    id: 3,
    image: "/assets/images/large/morocco-2000w",
    background: "/assets/images/small/morocco",
    title: "Saharan Desert - Morocco",
    subtitle: "Marrakech Merzouga",
  },
  {
    id: 4,
    image: "/assets/images/large/yosemite-2000w",
    background: "/assets/images/small/yosemite",
    title: "Sierra Nevada - United States",
    subtitle: "Yosemite National Park",
  },
  {
    id: 5,
    image: "/assets/images/large/los-lances-2000w",
    background: "/assets/images/small/los-lances",
    title: "Tarifa - Spain",
    subtitle: "Los Lances Beach",
  },
  {
    id: 6,
    image: "/assets/images/large/cappadocia-2000w",
    background: "/assets/images/small/cappadocia",
    title: "Cappadocia - Turkey",
    subtitle: "Göreme Valley",
  },
  {
    id: 7,
    image: "/assets/images/large/serengeti-2000w",
    background: "/assets/images/small/serengeti",
    title: "Serengeti - Tanzania",
    subtitle: "African Savanna",
  },
];

// Card dimensions
const CARD_W = 329;
const CARD_GAP = 40;
const CARD_STEP = CARD_W + CARD_GAP; // 369

function detectWebP(): boolean {
  if (typeof document === "undefined") return true;
  const canvas = document.createElement("canvas");
  return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
}

/* ── Icons ── */
function GlobeIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" width="24" height="24">
      <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855-.143.268-.276.56-.395.872.705.157 1.472.257 2.282.287V1.077zM4.249 3.539c.142-.384.304-.744.481-1.078a6.7 6.7 0 0 0-1.668.86c.29.174.6.333.929.47l.258-.252zM3.82 7.5H1.063a6.95 6.95 0 0 1 .67-2.668c.456.18.942.332 1.451.452A13.9 13.9 0 0 0 3.82 7.5zm.056 1H1.062a6.95 6.95 0 0 0 .672 2.668c.456-.18.942-.332 1.451-.452A13.9 13.9 0 0 1 3.877 8.5zM4.25 12.46c.142.384.304.744.481 1.078a6.7 6.7 0 0 1-1.668-.86c.29-.174.6-.333.929-.47l.258.252zM7.5 14.923v-2.216c.81.03 1.577.13 2.282.287.12.312.252.604.395.872-.552 1.035-1.218 1.65-1.887 1.855V14.923zM11.75 12.46c-.142.384-.304.744-.481 1.078a6.7 6.7 0 0 0 1.668-.86 5.7 5.7 0 0 0-.929-.47l-.258.252zM12.18 8.5h2.757a6.95 6.95 0 0 1-.67 2.668c-.456-.18-.942-.332-1.451-.452.116-.716.18-1.46.194-2.216h-.83zm.056-1h2.757a6.95 6.95 0 0 0-.672-2.668c-.456.18-.942.332-1.451.452.116.716.18 1.46.194 2.216h-.828zM11.75 3.539c-.142-.384-.304-.744-.481-1.078a6.7 6.7 0 0 1 1.668.86 5.7 5.7 0 0 1-.929.47l-.258-.252zM8.5 1.077v2.216c-.81-.03-1.577-.13-2.282-.287a7.7 7.7 0 0 1-.395-.872C6.382 1.206 7.047.59 7.718.386 7.979.32 8.242.29 8.5.289V1.077z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" width="22" height="22">
      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
      <path d="M8 17l4 4 4-4h-3V3h-2v14H8z" />
      <path d="M2 18h20v2H2z" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15-5-2.18L7 18V5h10v13z" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" width="22" height="22">
      <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" width="22" height="22">
      <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}

function GithubIcon({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" width={size} height={size}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function LinkedInIcon({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" width={size} height={size}>
      <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
    </svg>
  );
}

/* ── Loading Screen ── */
function LoadingScreen() {
  return (
    <div
      style={{
        background: "white",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000000,
        overflow: "hidden",
      }}
    >
      <div style={{ margin: "auto", textAlign: "center" }}>
        <img
          src="/assets/icons8-globe.gif"
          width={96}
          height={96}
          alt="Loading"
          style={{ display: "block", marginBottom: "1em" }}
        />
        <p style={{ fontSize: "1.1rem", color: "#333" }}>
          Travelling<span className="loading-dots" />
        </p>
      </div>
    </div>
  );
}

/* ── Detail Page (full-screen, flies out from card) ── */
function DetailPage({
  card,
  ext,
  sourceRect,
  onClose,
}: {
  card: (typeof cardData)[0];
  ext: string;
  sourceRect: DOMRect | null;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<"enter" | "active" | "exit">("enter");
  const overlayRef = useRef<HTMLDivElement>(null);

  // Trigger enter animation on mount
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase("active"));
    });
  }, []);

  const handleClose = () => {
    setPhase("exit");
    setTimeout(onClose, 500);
  };

  // Calculate the starting transform from source card rect
  const startStyle = sourceRect
    ? {
        left: sourceRect.left,
        top: sourceRect.top,
        width: sourceRect.width,
        height: sourceRect.height,
        borderRadius: "20px",
      }
    : {
        left: "50%",
        top: "50%",
        width: 0,
        height: 0,
        borderRadius: "20px",
      };

  const isExpanded = phase === "active";
  const isExiting = phase === "exit";

  return (
    <div
      ref={overlayRef}
      className="ge-detail-overlay"
      style={{ opacity: isExiting ? 0 : 1 }}
    >
      <div
        className="ge-detail-page"
        style={{
          backgroundImage: `url(${card.image}${ext})`,
          // Animate from card position to full screen
          ...(isExpanded && !isExiting
            ? {
                left: 0,
                top: 0,
                width: "100vw",
                height: "100vh",
                borderRadius: 0,
              }
            : {
                left: startStyle.left,
                top: startStyle.top,
                width: typeof startStyle.width === "number" ? startStyle.width + "px" : startStyle.width,
                height: typeof startStyle.height === "number" ? startStyle.height + "px" : startStyle.height,
                borderRadius: startStyle.borderRadius,
              }),
        }}
      >
        {/* Dark overlay for readability */}
        <div className="ge-detail-dim" />

        {/* Close button */}
        <button
          className="ge-detail-close"
          onClick={handleClose}
          style={{ opacity: isExpanded && !isExiting ? 1 : 0 }}
        >
          <CloseIcon />
        </button>

        {/* Content - same layout as homepage hero */}
        <div
          className="ge-detail-content"
          style={{
            opacity: isExpanded && !isExiting ? 1 : 0,
            transform: isExpanded && !isExiting ? "translateY(0)" : "translateY(40px)",
          }}
        >
          <h2 className="ge-detail-label">{card.title}</h2>
          <h1 className="ge-detail-title">{card.subtitle}</h1>
          <p className="ge-detail-desc">
            Explore the breathtaking landscapes and immerse yourself in the beauty of {card.subtitle}.
            This destination offers unforgettable experiences, from stunning natural vistas to rich cultural heritage.
          </p>
          <button className="ge-detail-btn" onClick={handleClose}>
            BACK TO GALLERY
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Mobile Nav ── */
function MobileNav({
  isActive,
  onClose,
}: {
  isActive: boolean;
  onClose: () => void;
}) {
  return (
    <nav
      className="mobile-nav-overlay"
      style={{
        transform: isActive ? "translateY(0)" : "translateY(-100%)",
      }}
    >
      <ul className="mobile-nav-list">
        {["Home", "Holidays", "Destinations", "Flights", "Offers", "Contacts"].map(
          (item, i) => (
            <li key={item} className="mobile-nav-item" style={i === 0 ? { borderTopWidth: 1 } : {}}>
              <a onClick={onClose}>{item}</a>
            </li>
          )
        )}
      </ul>
      <div style={{ display: "flex", justifyContent: "center", gap: 15, marginBottom: "1em" }}>
        <a href="https://github.com/pipich0u" target="_blank" rel="noopener noreferrer" style={{ color: "black" }}>
          <GithubIcon size={36} />
        </a>
      </div>
      <p style={{ textAlign: "center", padding: "0.5em", color: "#333" }}>
        &copy; {new Date().getFullYear()} Fan Yao
      </p>
    </nav>
  );
}

/* ── Main Page ── */
export default function HomePage() {
  const [sliderIndex, setSliderIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [isWebP, setIsWebP] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedCard, setSelectedCard] = useState<(typeof cardData)[0] | null>(null);
  const [cardRect, setCardRect] = useState<DOMRect | null>(null);
  const [progress, setProgress] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // All cards go into the slider (not slice(1))
  const sliderCards = cardData;
  const total = sliderCards.length;
  // We prepend a clone of the last card and append a clone of the first card
  // for seamless infinite loop: [clone-last, 0, 1, 2, ..., n-1, clone-first]
  // So real index 0 is at position 1 in the extended array.
  const extendedCards = [sliderCards[total - 1], ...sliderCards, sliderCards[0]];

  useEffect(() => {
    setIsWebP(detectWebP());
    const mql = window.matchMedia("(max-width: 64em)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    const timer = setTimeout(() => setShowLoading(false), 800);
    return () => {
      clearTimeout(timer);
      mql.removeEventListener("change", handler);
    };
  }, []);

  const ext = isWebP ? ".webp" : ".jpg";
  const currentBg = isMobile
    ? cardData[0].background + ext
    : cardData[0].image + ext;

  // The visual offset: sliderIndex 0 -> show position 1 (the real first card)
  const visualPos = sliderIndex + 1;
  const translateX = -(visualPos * CARD_STEP);

  // After transition ends on a clone, snap to the real card without animation
  const handleTransitionEnd = useCallback(() => {
    setIsTransitioning(false);
    if (sliderIndex >= total) {
      // We're on clone-first -> snap to real first
      setSliderIndex(0);
    } else if (sliderIndex < 0) {
      // We're on clone-last -> snap to real last
      setSliderIndex(total - 1);
    }
  }, [sliderIndex, total]);

  const goNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setSliderIndex((prev) => prev + 1);
  }, [isTransitioning]);

  const goPrev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setSliderIndex((prev) => prev - 1);
  }, [isTransitioning]);

  // Auto-play with progress bar (fills over 4s, then slides)
  useEffect(() => {
    if (showLoading || selectedCard) return;
    setProgress(0);
    const DURATION = 8000;
    const INTERVAL = 30;
    const step = 100 / (DURATION / INTERVAL);
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev + step >= 100) {
          return 100;
        }
        return prev + step;
      });
    }, INTERVAL);
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [showLoading, selectedCard, sliderIndex]);

  // When progress hits 100, trigger next slide
  useEffect(() => {
    if (progress >= 100 && !isTransitioning) {
      goNext();
    }
  }, [progress, isTransitioning, goNext]);

  const handleManualPrev = () => {
    setProgress(0);
    goPrev();
  };

  const handleManualNext = () => {
    setProgress(0);
    goNext();
  };

  const handleCardClick = (card: (typeof cardData)[0], e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCardRect(rect);
    setSelectedCard(card);
  };

  // Current real index for display (wrapping)
  const displayIndex = ((sliderIndex % total) + total) % total;

  if (showLoading) return <LoadingScreen />;

  return (
    <div
      className="ge-background"
      style={{ backgroundImage: `url(${currentBg})` }}
    >
      {/* Detail page */}
      {selectedCard && (
        <DetailPage
          card={selectedCard}
          ext={ext}
          sourceRect={cardRect}
          onClose={() => { setSelectedCard(null); setCardRect(null); }}
        />
      )}

      {/* Mobile nav overlay */}
      <MobileNav isActive={showMobileNav} onClose={() => setShowMobileNav(false)} />

      {/* Header */}
      <header className="ge-header">
        <div className="ge-logo-wrapper">
          <h1 className="ge-logo-text">FANYAO&apos;STUDIO</h1>
        </div>
        <div className="ge-header-right">
          <nav className="ge-nav">
            <ul className="ge-menu">
              {["HOME", "HOLIDAYS", "TECHNOLOGY", "APPROACHING.AI", "OTHERS", "CONTACT"].map((item) => (
                <li key={item} className="ge-menu-item">
                  <a>{item}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ge-header-buttons">
          </div>
          <button
            className="ge-hamburger-btn"
            onClick={() => setShowMobileNav(!showMobileNav)}
            aria-label="Menu"
          >
            <span className="ge-hamburger-icon" data-active={showMobileNav} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="ge-main">
        <div className="ge-content">
          <div className="ge-content-wrapper">
            {/* Hero - left side */}
            <div className="ge-hero">
              <h2 className="ge-hero-title">Welcome to my space</h2>
              <div className="ge-hero-wrapper">
                <h3 className="ge-hero-subtitle">FANYAO MY.WEBSITE</h3>
                <p className="ge-hero-text">
                  Hi, I&apos;m Fan Yao. This is my personal website, where I document my thoughts, keep learning, and share insights with others. I serve as the Director of Solutions at APPROACHING.AI.
                </p>
                <div className="ge-hero-actions">
                  <button className="ge-bookmark-btn" aria-label="Add bookmark">
                    <BookmarkIcon />
                  </button>
                  <button className="ge-discover-btn">DISCOVER LOCATION</button>
                </div>
              </div>
            </div>

            {/* Card slider - right side */}
            <div className="ge-card-slider">
                <div
                  ref={sliderRef}
                  className="ge-card-slider-wrapper"
                  style={{
                    transform: `translateX(${translateX}px)`,
                    transition: isTransitioning ? `transform 500ms ease` : "none",
                  }}
                  onTransitionEnd={handleTransitionEnd}
                >
                  {extendedCards.map((data, i) => (
                    <div
                      key={`${data.id}-${i}`}
                      className="ge-card"
                      style={{
                        backgroundImage: `url(${data.background}${ext})`,
                        boxShadow: "15px 15px 50px #000",
                        cursor: "pointer",
                      }}
                      onClick={(e) => handleCardClick(data, e)}
                    >
                      <h2 className="ge-card-title">{data.title}</h2>
                      <h3 className="ge-card-subtitle">{data.subtitle}</h3>
                    </div>
                  ))}
                </div>

              {/* Controls */}
              <div className="ge-controls">
                <button className="ge-control-btn" onClick={handleManualPrev} aria-label="Previous">
                  <ChevronLeftIcon />
                </button>
                <button className="ge-control-btn ge-control-btn-next" onClick={handleManualNext} aria-label="Next">
                  <ChevronRightIcon />
                </button>
                <div className="ge-progress-bar-wrapper">
                  <div
                    className="ge-progress-bar"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="ge-counter">
                  {String(displayIndex + 1).padStart(2, "0")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="ge-footer">
        <p style={{ display: "inline-block" }}>
          &copy; {new Date().getFullYear()} Fan Yao
        </p>
      </footer>

      <style>{`
        @font-face {
          font-family: 'BiggerDisplay';
          src: url('/assets/fonts/biggerdisplay.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        .ge-background {
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          min-height: 100dvh;
          min-width: 265px;
          position: relative;
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
          color: #333;
          overflow: hidden;
        }
        @media (max-width: 64em) {
          .ge-background {
            background-attachment: scroll;
          }
        }
        .ge-background::after {
          background-color: rgba(0, 0, 0, 0.1);
          bottom: 0;
          content: '';
          display: block;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: 100%;
          pointer-events: none;
        }

        .ge-header {
          align-items: center;
          color: white;
          display: flex;
          height: 50px;
          justify-content: space-between;
          padding: 0 2.5em;
          padding-top: 1.2em;
          position: relative;
          z-index: 110;
        }
        .ge-logo-wrapper {
          align-items: center;
          display: flex;
        }
        .ge-logo-text {
          font-family: 'BiggerDisplay', sans-serif;
          font-size: 1.3rem;
          user-select: none;
          font-weight: normal;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }
        @media (max-width: 64em) {
          .ge-logo-text { display: none; }
        }
        .ge-header-right {
          align-items: center;
          display: flex;
        }
        @media (max-width: 64em) {
          .ge-header-right { width: 100%; }
        }
        @media (max-width: 48em) {
          .ge-header-right { justify-content: flex-end; }
        }

        .ge-nav { margin-right: 0; }
        @media (max-width: 64em) {
          .ge-nav { margin: 0; width: 100%; }
        }
        @media (max-width: 48em) {
          .ge-nav { display: none; }
        }
        .ge-menu {
          align-items: center;
          display: flex;
          padding-top: 5px;
          list-style: none;
          margin: 0;
          padding-left: 0;
        }
        @media (max-width: 64em) {
          .ge-menu { margin: 0 auto; width: max-content; }
        }
        .ge-menu-item {
          cursor: pointer;
          margin-bottom: -2px;
          margin-right: 35px;
          padding: 5px 0;
          transition: color 0.2s;
          color: rgba(255,255,255,1);
          font-size: 0.95rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .ge-menu-item:last-child { margin-right: 0; }
        .ge-menu-item:hover { color: rgba(255,255,255,0.87); }
        .ge-menu-item::after {
          background: #f7ba53;
          content: '';
          display: block;
          height: 2px;
          transition: width 0.3s;
          width: 0;
        }
        .ge-menu-item:hover::after { width: 100%; }
        .ge-menu-item a {
          text-decoration: none;
          color: inherit;
          cursor: pointer;
        }

        .ge-header-buttons {
          align-items: center;
          display: flex;
        }
        .ge-header-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: white;
          transition: color 150ms;
          padding: 0;
        }
        .ge-header-btn:hover { color: rgba(255,255,255,0.76); }
        .ge-header-btn-search { margin-right: 15px; }
        @media (max-width: 50em) {
          .ge-header-btn-search { margin-right: 0; }
          .ge-header-btn-download { display: none; }
        }
        @media (max-width: 48em) {
          .ge-header-btn-search { display: none; }
        }

        .ge-hamburger-btn {
          background: none;
          border: none;
          cursor: pointer;
          display: none;
          height: 30px;
          position: relative;
          z-index: 1000;
          align-items: center;
        }
        @media (max-width: 48em) {
          .ge-hamburger-btn { display: flex; }
        }
        .ge-hamburger-icon {
          display: inline-block;
          height: 2px;
          position: relative;
          width: 25px;
          background-color: white;
          transition: background-color 300ms;
        }
        .ge-hamburger-icon[data-active="true"] {
          background-color: transparent;
        }
        .ge-hamburger-icon::before,
        .ge-hamburger-icon::after {
          content: '';
          background-color: white;
          display: inline-block;
          height: 2px;
          left: 0;
          position: absolute;
          transition: 300ms;
          transition-property: background-color, transform, top;
          width: 25px;
        }
        .ge-hamburger-icon::before { top: -8px; }
        .ge-hamburger-icon::after { top: 8px; }
        .ge-hamburger-icon[data-active="true"]::before,
        .ge-hamburger-icon[data-active="true"]::after {
          background-color: black;
        }
        .ge-hamburger-icon[data-active="true"]::before {
          top: 0;
          transform: rotate(135deg);
        }
        .ge-hamburger-icon[data-active="true"]::after {
          top: 0;
          transform: rotate(-135deg);
        }

        .ge-main {
          align-items: flex-end;
          display: flex;
          flex: 1;
          position: relative;
          z-index: 1;
          padding-bottom: 120px;
        }
        @media (max-width: 64em) {
          .ge-main {
            align-items: center;
            padding-bottom: 2em;
          }
        }
        .ge-content {
          padding: 0 2.5em 0 5em;
          width: 100%;
        }
        @media (max-width: 64em) {
          .ge-content {
            padding: 0 1.5em;
          }
        }
        .ge-content-wrapper {
          display: flex;
          align-items: flex-start;
        }
        @media (max-width: 64em) {
          .ge-content-wrapper {
            align-items: center;
            flex-direction: column;
            justify-content: center;
          }
        }

        .ge-hero {
          color: white;
          flex-shrink: 0;
          position: relative;
          width: 42%;
          padding-bottom: 60px;
        }
        @media (max-width: 64em) {
          .ge-hero { padding: 0; width: initial; }
        }
        .ge-hero-title {
          font-size: 1.8rem;
          font-weight: 300;
          margin: -2em 0 0.3em;
          color: rgba(255,255,255,0.8);
          letter-spacing: 0.05em;
        }
        @media (max-width: 64em) {
          .ge-hero-title { text-align: center; margin-top: 0; }
        }
        .ge-hero-wrapper {
          display: flex;
          flex-direction: column;
        }
        @media (max-width: 64em) {
          .ge-hero-wrapper { text-align: center; }
        }
        .ge-hero-subtitle {
          font-family: 'BiggerDisplay', sans-serif;
          font-size: clamp(4.5rem, 9vw, 10.5rem);
          text-transform: uppercase;
          font-weight: 700;
          line-height: 1.1;
          margin: 0 0 0.1em;
          letter-spacing: 0.05em;
          max-width: 6ch;
          font-stretch: condensed;
        }
        @media (max-width: 64em) {
          .ge-hero-subtitle { max-width: none; margin: 0 auto 0.1em; font-size: clamp(2.5rem, 8vw, 5rem); }
        }
        .ge-hero-text {
          font-size: 1rem;
          line-height: 1.7;
          color: rgba(255,255,255,0.65);
          max-width: 760px;
          margin: 0 0 1.8em;
        }
        @media (max-width: 64em) {
          .ge-hero-text { margin-bottom: 2em; }
        }
        .ge-hero-actions {
          display: flex;
          align-items: center;
        }
        @media (max-width: 64em) {
          .ge-hero-actions { justify-content: center; }
        }
        .ge-bookmark-btn {
          background: #f7ba53;
          border: none;
          border-radius: 50%;
          color: white;
          padding: 0.65rem;
          margin-right: 16px;
          cursor: pointer;
          transition: background 200ms;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ge-bookmark-btn:hover { background: #f7ba53d6; }
        @media (max-width: 64em) {
          .ge-bookmark-btn { display: none; }
        }
        .ge-discover-btn {
          background: none;
          border: 1px solid rgba(255,255,255,0.5);
          border-radius: 20px;
          color: white;
          padding: 0.6rem 1.4rem;
          cursor: pointer;
          transition: background 200ms;
          font-size: 0.85rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .ge-discover-btn:hover { background: rgba(220,220,220,0.37); }

        /* ── Card Slider ── */
        .ge-card-slider {
          flex-shrink: 0;
          min-width: 58%;
          overflow: hidden;
        }
        .ge-card-slider-wrapper {
          display: flex;
          padding-bottom: 20px;
          gap: ${CARD_GAP}px;
        }
        @media (max-width: 64em) {
          .ge-card-slider-wrapper { display: none; }
        }
        .ge-card {
          box-sizing: border-box;
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center;
          border-radius: 18px;
          color: whitesmoke;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          height: 520px;
          justify-content: flex-end;
          padding: 1.2rem;
          white-space: normal;
          width: ${CARD_W}px;
          transition: transform 300ms ease, box-shadow 200ms;
          border: 1px solid rgba(255,255,255,0.15);
          backdrop-filter: blur(2px);
        }
        .ge-card:hover {
          transform: scale(1.03);
          border-color: rgba(255,255,255,0.3);
        }
        .ge-card-title {
          font-size: 0.65rem;
          line-height: 2em;
          font-weight: 300;
          color: rgba(255,255,255,0.7);
          letter-spacing: 0.05em;
        }
        .ge-card-subtitle {
          font-family: 'BiggerDisplay', sans-serif;
          text-transform: uppercase;
          max-width: 120px;
          font-size: 1.3rem;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: 0.05em;
        }

        /* ── Controls ── */
        .ge-controls {
          align-items: center;
          display: flex;
          gap: 14px;
          padding-top: 16px;
        }
        @media (max-width: 64em) {
          .ge-controls { justify-content: center; }
        }
        .ge-control-btn {
          background: none;
          border: 1px solid rgba(255,255,255,0.4);
          border-radius: 50%;
          color: rgba(255,255,255,0.6);
          padding: 16px;
          transition: all 200ms ease;
          outline: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ge-control-btn:hover {
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.6);
          color: white;
        }
        .ge-progress-bar-wrapper {
          width: ${CARD_W * 3 + CARD_GAP * 2 + CARD_W / 4}px;
          height: 2px;
          background: rgba(255,255,255,0.2);
          border-radius: 1px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .ge-progress-bar {
          height: 100%;
          background: #f7ba53;
          transition: width 30ms linear;
          border-radius: 1px;
        }
        .ge-counter {
          font-family: 'BiggerDisplay', sans-serif;
          color: whitesmoke;
          font-size: 2.6rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          flex-shrink: 0;
          margin: 0;
        }

        /* ── Footer ── */
        .ge-footer {
          color: white;
          line-height: 1.4em;
          padding: 0.3em 2.5em;
          position: relative;
          z-index: 1;
          font-size: 0.75rem;
          opacity: 0.7;
        }
        @media (max-width: 64em) {
          .ge-footer { text-align: center; }
        }
        @media (max-width: 30em) {
          .ge-footer { padding: 0.2em; }
        }
        .ge-footer-link {
          color: inherit;
          text-decoration: none;
          transition: color 100ms;
          display: inline-block;
          vertical-align: text-bottom;
        }
        .ge-footer-link:hover { color: #ededed; text-decoration: underline; }

        /* ── Mobile nav overlay ── */
        .mobile-nav-overlay {
          align-items: center;
          background: whitesmoke;
          display: none;
          flex-direction: column;
          min-height: 100vh;
          justify-content: space-between;
          left: 0;
          position: fixed;
          transition: transform 0.4s;
          top: 0;
          width: 100vw;
          z-index: 100;
        }
        @media (max-width: 48em) {
          .mobile-nav-overlay { display: flex; }
        }
        .mobile-nav-list {
          margin-bottom: 1em;
          margin-top: 6em;
          width: 100%;
          list-style: none;
          padding: 0;
        }
        .mobile-nav-item {
          border-color: black;
          border-style: solid;
          border-width: 0 0 1px 0;
          cursor: pointer;
          font-size: 1.6rem;
          padding: 1em 0;
          text-align: center;
          transition: background-color 200ms;
          color: #333;
        }
        .mobile-nav-item:hover { background: white; }
        .mobile-nav-item a {
          text-decoration: none;
          color: inherit;
          cursor: pointer;
        }
        @media (max-width: 40em) {
          .mobile-nav-item { padding: 0.5em; }
        }

        /* ── Detail Page ── */
        .ge-detail-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          transition: opacity 400ms ease;
        }
        .ge-detail-page {
          position: fixed;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          overflow: hidden;
          transition: all 600ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ge-detail-dim {
          display: none;
        }
        .ge-detail-close {
          position: absolute;
          top: 2rem;
          right: 2rem;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 50%;
          color: white;
          width: 52px;
          height: 52px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 400ms ease 300ms;
          z-index: 10;
        }
        .ge-detail-close:hover {
          background: rgba(255,255,255,0.25);
          transform: rotate(90deg);
        }
        .ge-detail-content {
          position: absolute;
          bottom: 0;
          left: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 0 2.5em 120px 5em;
          color: white;
          transition: all 600ms cubic-bezier(0.4, 0, 0.2, 1) 200ms;
          z-index: 5;
          width: 50%;
          top: 0;
          background: none;
        }
        .ge-detail-label {
          font-size: 1.8rem;
          font-weight: 300;
          color: rgba(255,255,255,0.8);
          letter-spacing: 0.05em;
          margin: 0 0 0.3em;
        }
        .ge-detail-title {
          font-family: 'BiggerDisplay', sans-serif;
          font-size: clamp(4.5rem, 9vw, 10.5rem);
          font-weight: 700;
          text-transform: uppercase;
          margin: 0 0 0.1em;
          line-height: 1.1;
          letter-spacing: 0.05em;
          max-width: 8ch;
        }
        .ge-detail-desc {
          font-size: 1rem;
          line-height: 1.7;
          max-width: 760px;
          color: rgba(255,255,255,0.65);
          margin: 0 0 1.8em;
        }
        .ge-detail-btn {
          background: none;
          border: 1px solid rgba(255,255,255,0.5);
          border-radius: 20px;
          color: white;
          padding: 0.6rem 1.4rem;
          font-size: 0.85rem;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 200ms;
          width: fit-content;
        }
        .ge-detail-btn:hover {
          background: rgba(220,220,220,0.37);
          border-color: white;
        }
        @media (max-width: 48em) {
          .ge-detail-content { padding: 2rem; width: 80%; }
          .ge-detail-title { font-size: 3rem; }
        }

        /* ── Loading dots ── */
        .loading-dots::after {
          content: '';
          animation: ge-loading-dot 1s infinite;
        }
        @keyframes ge-loading-dot {
          0% { content: ''; }
          33% { content: '.'; }
          66% { content: '..'; }
          100% { content: '...'; }
        }
      `}</style>
    </div>
  );
}
