"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ── Travel journal content ──────────────────────────────────────────────── */

interface JournalSection {
  type: "intro" | "chapter" | "text" | "quote" | "caption";
  content: string;
  sub?: string; // for chapter sub-labels
}

interface JournalEntry {
  date: string;
  tagline: string;
  sections: JournalSection[];
}

const JOURNAL: Record<number, JournalEntry> = {
  1: {
    date: "January 2024",
    tagline: "Where silence speaks in snowflakes",
    sections: [
      { type: "intro", content: "The last train from Klosters deposits you at a station so quiet you can hear the cold. Saint Antönien begins here — a cluster of farmhouses suspended between two ridgelines, connected to the world by a single road that the locals seem pleased nobody uses." },
      { type: "chapter", content: "INTO THE VALLEY", sub: "Prättigau · 1,420m" },
      { type: "text", content: "Alpine villages either perform their charm or possess it. Saint Antönien possesses it. There are no ski lifts visible from the main street, no fondue signs in English, no instagram-optimized viewpoints. What there is: woodsmoke curling from chimneys, cowbells muffled by snow, and the particular blue that winter casts on south-facing slopes at four in the afternoon.\n\nI arrived in the kind of silence that makes you instinctively lower your voice. The Prättigau valley lay below, already in shadow, while the peaks above still caught the last light. This is the hour photographers call golden — but here it felt less like a photographic event than a daily fact of geography." },
      { type: "quote", content: "You don't visit places like this. You submit to them.", sub: "Personal journal, January 14" },
      { type: "text", content: "The farmhouse I stayed in had been in the same family for six generations. The wood on the walls had darkened to the color of strong tea. Breakfast was served at seven: bread baked the night before, butter from cows I could see from the window, and a coffee strong enough to justify the altitude.\n\nSome places exist in resistance to the world's speed. Saint Antönien is one of them. I left wishing I hadn't." },
    ],
  },
  2: {
    date: "February 2023",
    tagline: "Snow country, where the world goes white",
    sections: [
      { type: "intro", content: "Nagano Prefecture in February is not a destination — it is a condition. The snow doesn't fall here so much as accumulate, quietly, relentlessly, until the cedar forests become something else entirely: sculptures in white, solemn and still." },
      { type: "chapter", content: "THE SNOW MONKEYS", sub: "Jigokudani · Yamanouchi" },
      { type: "text", content: "The path to Jigokudani is narrow and deliberately so. Thirty minutes on foot through snow-weighted forest, and then the steam rises before you see anything — sulfur and warmth cutting through winter air. The macaques appear like an afterthought, chest-deep in the thermal pool, faces inclined toward nothing in particular.\n\nThey have been here since 1963. The hot spring, far longer. There is something deeply calming about watching animals that have simply decided that this is a good life." },
      { type: "quote", content: "The Japanese Alps don't demand to be climbed. They ask only to be witnessed.", sub: "Nagano, February 8" },
      { type: "text", content: "Hakuba that evening, and the mountains turned a shade of violet I don't have a name for. The ski runs were quiet by then — just a few last figures crossing the piste, their tracks intersecting like calligraphy. In the ryokan, sake arrived warm and the futon was already laid.\n\nThis is the Japan that doesn't announce itself." },
    ],
  },
  3: {
    date: "November 2023",
    tagline: "Sand, sky, and the silence between stars",
    sections: [
      { type: "intro", content: "The Sahara begins where the road stops pretending. One moment you are in Merzouga, with its guesthouses and mint tea, and then the dunes rise in front of you and there is nothing else. Just sand, arranged by wind into forms that seem almost deliberate." },
      { type: "chapter", content: "INTO THE ERG CHEBBI", sub: "Merzouga · Sunrise" },
      { type: "text", content: "We left at four-thirty in the morning. The guide walked ahead without a torch — he knew the dunes by their shadows. An hour later we were on a ridge watching the sky change color through a sequence that no photograph adequately captures: black to indigo to violet to the first cautious gold.\n\nThe silence of the Sahara is not an absence. It is a presence. You become aware of your own breathing, your footsteps in the sand, the small sounds your body makes that cities have been masking your whole life." },
      { type: "quote", content: "The desert teaches patience not as virtue but as fact.", sub: "Erg Chebbi, November 17" },
      { type: "text", content: "Back in Marrakech, the medina overwhelmed in the best possible way. The souks operate on a logic that rewards slowing down: the best stalls are not at the front. Spice sellers, leather workers, lampmakers — each a specialist, each with a story that requires tea to hear properly.\n\nMorocco holds its contradictions without tension. That is its particular gift." },
    ],
  },
  4: {
    date: "October 2023",
    tagline: "Stone and water, in scales beyond reckoning",
    sections: [
      { type: "intro", content: "El Capitan does not look like a rock formation. It looks like something placed there intentionally, to settle a question about scale. Standing at its base, you understand, for the first time, that you have been significantly overestimating your own size." },
      { type: "chapter", content: "THE VALLEY IN AUTUMN", sub: "Yosemite Valley · 1,200m" },
      { type: "text", content: "October is Yosemite's best secret. The summer crowds have gone, the light is lower and more directional, and the black oaks that line the valley floor are burning yellow and amber. Mirror Lake, this time of year, holds a reflection so precise it looks like two worlds sharing one surface.\n\nHalf Dome emerged from morning cloud as I ate breakfast at the trailhead. There's an argument to be made that it doesn't matter how many times you've seen a photograph of something — the first time you see the thing itself, it is still a different kind of experience." },
      { type: "quote", content: "Wilderness is not the absence of civilization. It is the reminder of what civilization is for.", sub: "Yosemite, October 3" },
      { type: "text", content: "Tunnel View at dusk, the valley below filling with shadow while the rim stayed light. A ranger told me this is called alpenglow. She said it as though naming it made it no less miraculous, which is exactly the right attitude.\n\nI stayed longer than planned. That is always the sign of a good place." },
    ],
  },
  5: {
    date: "August 2023",
    tagline: "Where Europe ends and the wind begins",
    sections: [
      { type: "intro", content: "Tarifa is the southernmost point of continental Europe, and the wind there has opinions. It arrives from the Strait of Gibraltar with the confidence of something that has crossed an ocean and intends to continue crossing things. The kitesurfers love it. The trees have adapted. Everyone else leans slightly." },
      { type: "chapter", content: "THE CROSSING", sub: "Strait of Gibraltar · 14km" },
      { type: "text", content: "On a clear day — and there are clear days, between the Levante winds — you can see Africa from the beach. It is not a metaphor. It is Morocco, across fourteen kilometers of strait, close enough to make you think about how arbitrary the categories of 'Europe' and 'Africa' are when you're standing on the sand between them.\n\nThe old town of Tarifa is white walls and bougainvillea and cats on windowsills. It has the relaxed quality of a place that has been at the intersection of civilizations long enough to stop being anxious about it." },
      { type: "quote", content: "Every edge of a continent is a beginning, not an ending.", sub: "Los Lances Beach, August 21" },
      { type: "text", content: "At sunset, the Levante dropped to a murmur and the Strait went flat and gold. Fishing boats returned. The kitesurfers packed up. Someone was frying fish somewhere near the harbor. I have been to more spectacular places, but few that felt more exactly like themselves." },
    ],
  },
  6: {
    date: "September 2023",
    tagline: "Risen from ash, shaped by time",
    sections: [
      { type: "intro", content: "Cappadocia is geology made spectacular: ten million years of volcanic eruption and erosion, resulting in a landscape that looks like it was designed for a film that hasn't been made yet. The fairy chimneys of Göreme stand in clusters, some capped with dark basalt, like mushrooms that have been here long enough to develop opinions." },
      { type: "chapter", content: "BEFORE DAWN", sub: "Göreme · 05:00" },
      { type: "text", content: "The balloon launch happens before you're entirely awake. In the dark, thirty or forty envelopes inflate simultaneously across the valley, turning slowly from dark shapes into colored lanterns against the pre-dawn sky. By the time you are airborne, the first light is catching the chimneys below.\n\nFrom altitude, Cappadocia is comprehensible in a way it isn't at ground level. You can see the logic of the valleys, the way the ancient cities were carved into the cliff faces for defense, the underground cities that connected them. History becomes topography." },
      { type: "quote", content: "To see a landscape from above is to read the sentence you've been living inside.", sub: "Göreme Valley, September 12" },
      { type: "text", content: "The cave hotel I stayed in was carved from tuff — the same volcanic rock as everything else. At night, the walls held the warmth of the day. In the morning, the light came through a window cut directly into the cliff and fell across the stone floor in a rectangle that moved as slowly and exactly as a sundial.\n\nSome accommodations are where you sleep. Others are where you understand something." },
    ],
  },
  7: {
    date: "July 2023",
    tagline: "A million lives, moving as one",
    sections: [
      { type: "intro", content: "The Great Migration is not a single event. It is a continuous, year-round movement of 1.5 million wildebeest across the Serengeti-Mara ecosystem — a circle so vast it takes twelve months to complete. To witness any part of it is to watch something so ancient that 'ancient' is barely the right word." },
      { type: "chapter", content: "THE MARA CROSSING", sub: "Serengeti · Dry Season" },
      { type: "text", content: "We waited at the crossing point for four hours before the first wildebeest reached the bank and stopped. This is what they do — they accumulate at the river's edge until the pressure of numbers behind them makes the decision for them. Then they go, and the crocodiles, who have been waiting longer than we have, respond.\n\nThe chaos of a crossing is total and brief. It is over before you understand it has begun. In the dust afterwards, both banks are quiet again, and the river runs its normal brown, as though nothing has happened." },
      { type: "quote", content: "Nature is not indifferent to suffering. It simply operates at a scale where suffering is a detail.", sub: "Serengeti plains, July 18" },
      { type: "text", content: "Sunset on the savanna, and the acacia trees became silhouettes, and a cheetah that had been sleeping on a termite mound stood, stretched, and began walking in a direction that seemed purposeful. The guide said she was probably heading for the Thomson's gazelle herd two kilometers east.\n\nYou spend time in places like this and you realize that drama, elsewhere, is mostly manufactured." },
    ],
  },
};

/* ── Reveal wrapper (IntersectionObserver fade-in) ───────────────────────── */

function Reveal({
  children,
  delay = 0,
  className = "",
  distance = 36,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${distance}px)`,
        transition: `opacity 1.1s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s, transform 1.1s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Main JournalPage component ──────────────────────────────────────────── */

interface CardData {
  id: number;
  image: string;
  background: string;
  title: string;
  subtitle: string;
}

interface Props {
  card: CardData;
  ext: string;
  sourceRect: DOMRect | null;
  onClose: () => void;
}

export default function JournalPage({ card, ext, sourceRect, onClose }: Props) {
  const [phase, setPhase] = useState<"enter" | "active" | "exit">("enter");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [showScroll, setShowScroll] = useState(true);

  // Entry animation
  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setPhase("active")));
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleClose = useCallback(() => {
    setPhase("exit");
    setTimeout(onClose, 500);
  }, [onClose]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClose]);

  // Parallax + scroll indicator
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const y = el.scrollTop;
    setScrollY(y);
    setShowScroll(y < 60);
  }, []);

  const isExpanded = phase === "active";
  const isExiting = phase === "exit";

  const startStyle = sourceRect
    ? { left: sourceRect.left, top: sourceRect.top, width: sourceRect.width, height: sourceRect.height, borderRadius: "20px" }
    : { left: "50%", top: "50%", width: 0, height: 0, borderRadius: "20px" };

  const journal = JOURNAL[card.id];

  return (
    <div
      className="jn-overlay"
      style={{ opacity: isExiting ? 0 : 1, transition: "opacity 0.5s ease" }}
    >
      <div
        className="jn-page"
        style={
          isExpanded && !isExiting
            ? { left: 0, top: 0, width: "100vw", height: "100vh", borderRadius: 0 }
            : { left: startStyle.left, top: startStyle.top, width: typeof startStyle.width === "number" ? startStyle.width + "px" : startStyle.width, height: typeof startStyle.height === "number" ? startStyle.height + "px" : startStyle.height, borderRadius: startStyle.borderRadius }
        }
      >
        {/* Scrollable container */}
        <div className="jn-scroll" ref={scrollRef} onScroll={handleScroll}>

          {/* ── Hero (parallax) ── */}
          <section className="jn-hero">
            <div
              className="jn-hero-img-wrap"
              style={{ transform: `translateY(${scrollY * 0.45}px)` }}
            >
              <img
                src={`${card.image}.${ext}`}
                alt={card.subtitle}
                className="jn-hero-img"
              />
            </div>
            <div className="jn-hero-dim" />

            {/* Hero text */}
            <div
              className="jn-hero-text"
              style={{
                opacity: isExpanded && !isExiting ? 1 : 0,
                transform: isExpanded && !isExiting ? "translateY(0)" : "translateY(30px)",
                transition: "opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s",
              }}
            >
              <p className="jn-eyebrow">{card.title}</p>
              <h1 className="jn-hero-title">{card.subtitle}</h1>
              {journal && <p className="jn-hero-tagline">{journal.tagline}</p>}
              <p className="jn-hero-date">{journal?.date}</p>
            </div>

            {/* Scroll indicator */}
            <div className="jn-scroll-hint" style={{ opacity: showScroll && isExpanded ? 1 : 0 }}>
              <span className="jn-scroll-line" />
              <span className="jn-scroll-label">SCROLL</span>
            </div>
          </section>

          {/* ── Magazine body ── */}
          {journal && (
            <article className="jn-article">
              {journal.sections.map((sec, i) => {
                if (sec.type === "intro") return (
                  <Reveal key={i} delay={0.05} className="jn-section jn-intro-wrap">
                    <p className="jn-intro">{sec.content}</p>
                  </Reveal>
                );

                if (sec.type === "chapter") return (
                  <Reveal key={i} delay={0.05} className="jn-section jn-chapter-wrap">
                    <div className="jn-chapter-rule" />
                    <p className="jn-chapter">{sec.content}</p>
                    {sec.sub && <p className="jn-chapter-sub">{sec.sub}</p>}
                  </Reveal>
                );

                if (sec.type === "text") return (
                  <Reveal key={i} delay={0.05} className="jn-section">
                    {sec.content.split("\n\n").map((para, pi) => (
                      <p key={pi} className={`jn-body${pi === 0 ? " jn-dropcap" : ""}`}>{para}</p>
                    ))}
                  </Reveal>
                );

                if (sec.type === "quote") return (
                  <Reveal key={i} delay={0.05} className="jn-section jn-quote-wrap" distance={20}>
                    <blockquote className="jn-quote">
                      <span className="jn-quote-mark">&ldquo;</span>
                      {sec.content}
                      <span className="jn-quote-mark">&rdquo;</span>
                    </blockquote>
                    {sec.sub && <p className="jn-quote-attr">— {sec.sub}</p>}
                  </Reveal>
                );

                return null;
              })}

              {/* End rule */}
              <Reveal delay={0.05} className="jn-section jn-end-wrap">
                <div className="jn-end-rule" />
                <p className="jn-end-label">END OF RECORD</p>
              </Reveal>
            </article>
          )}

          {/* Extra scroll space */}
          <div style={{ height: "10vh" }} />
        </div>

        {/* Close button (always on top) */}
        <button
          className="jn-close"
          onClick={handleClose}
          style={{ opacity: isExpanded && !isExiting ? 1 : 0 }}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <style>{`
        .jn-overlay {
          position: fixed; inset: 0; z-index: 9000;
          pointer-events: all;
        }
        .jn-page {
          position: fixed;
          overflow: hidden;
          background: #0c0c0c;
          transition: left 0.55s cubic-bezier(0.4,0,0.2,1),
                      top 0.55s cubic-bezier(0.4,0,0.2,1),
                      width 0.55s cubic-bezier(0.4,0,0.2,1),
                      height 0.55s cubic-bezier(0.4,0,0.2,1),
                      border-radius 0.55s cubic-bezier(0.4,0,0.2,1);
        }

        /* ── Scroll container ── */
        .jn-scroll {
          position: absolute; inset: 0;
          overflow-y: auto; overflow-x: hidden;
          scroll-behavior: smooth;
          scrollbar-width: thin;
          scrollbar-color: #333 transparent;
        }

        /* ── Hero ── */
        .jn-hero {
          position: relative;
          height: 100vh;
          overflow: hidden;
          display: flex; align-items: flex-end;
        }
        .jn-hero-img-wrap {
          position: absolute; inset: -15% 0;
          will-change: transform;
        }
        .jn-hero-img {
          width: 100%; height: 100%;
          object-fit: cover; object-position: center;
          display: block;
        }
        .jn-hero-dim {
          position: absolute; inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.1) 0%,
            rgba(0,0,0,0.25) 50%,
            rgba(0,0,0,0.82) 100%
          );
        }
        .jn-hero-text {
          position: relative; z-index: 2;
          padding: 0 8vw 7vh;
          max-width: 780px;
        }
        .jn-eyebrow {
          font-family: 'Oswald', sans-serif;
          font-size: 0.7rem; font-weight: 600;
          letter-spacing: 0.25em; text-transform: uppercase;
          color: rgba(247,186,83,0.9); margin: 0 0 0.8em;
        }
        .jn-hero-title {
          font-family: 'BiggerDisplay', sans-serif;
          font-size: clamp(2.8rem, 7vw, 5.5rem);
          font-weight: 700; line-height: 1.0;
          color: #fff; margin: 0 0 0.5em;
          letter-spacing: -0.01em;
        }
        .jn-hero-tagline {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(1rem, 2vw, 1.2rem);
          font-style: italic; color: rgba(255,255,255,0.7);
          margin: 0 0 0.6em; line-height: 1.5;
        }
        .jn-hero-date {
          font-family: 'Oswald', sans-serif;
          font-size: 0.65rem; letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4); margin: 0;
        }

        /* Scroll indicator */
        .jn-scroll-hint {
          position: absolute; bottom: 2.5rem; right: 3rem;
          display: flex; flex-direction: column; align-items: center; gap: 0.5em;
          z-index: 3; transition: opacity 0.6s ease;
        }
        .jn-scroll-line {
          display: block; width: 1px; height: 48px;
          background: rgba(255,255,255,0.35);
          animation: jn-line-pulse 2s ease-in-out infinite;
        }
        @keyframes jn-line-pulse {
          0%, 100% { opacity: 0.3; transform: scaleY(0.6); transform-origin: top; }
          50% { opacity: 0.8; transform: scaleY(1); }
        }
        .jn-scroll-label {
          font-family: 'Oswald', sans-serif;
          font-size: 0.55rem; letter-spacing: 0.25em;
          color: rgba(255,255,255,0.4); writing-mode: vertical-rl;
          text-transform: uppercase;
        }

        /* ── Article ── */
        .jn-article {
          background: #111;
          padding: 0;
        }
        .jn-section {
          max-width: 640px;
          margin: 0 auto;
          padding: 3.5em 2em 0;
        }
        .jn-section:last-child { padding-bottom: 2em; }

        /* Intro paragraph */
        .jn-intro-wrap { padding-top: 5em; }
        .jn-intro {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(1.15rem, 2.2vw, 1.35rem);
          line-height: 1.75;
          color: #d8d0c4;
          margin: 0;
          font-style: italic;
        }

        /* Chapter marker */
        .jn-chapter-wrap { padding-top: 4.5em; padding-bottom: 0; }
        .jn-chapter-rule {
          width: 32px; height: 1px;
          background: #f7ba53; margin-bottom: 1.2em;
        }
        .jn-chapter {
          font-family: 'Oswald', sans-serif;
          font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.3em; text-transform: uppercase;
          color: #f7ba53; margin: 0 0 0.3em;
        }
        .jn-chapter-sub {
          font-family: 'Oswald', sans-serif;
          font-size: 0.62rem; letter-spacing: 0.15em;
          color: #555; text-transform: uppercase; margin: 0;
        }

        /* Body text */
        .jn-body {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(0.95rem, 1.6vw, 1.05rem);
          line-height: 1.85; color: #a8a09a;
          margin: 0 0 1.4em;
        }
        .jn-body:last-child { margin-bottom: 0; }

        /* Drop cap on first paragraph */
        .jn-dropcap::first-letter {
          float: left;
          font-family: Georgia, serif;
          font-size: 4.2em;
          line-height: 0.78;
          padding-right: 0.08em;
          margin-top: 0.06em;
          color: #e8e0d4;
          font-style: italic;
        }

        /* Pull quote */
        .jn-quote-wrap {
          padding-top: 4em; padding-bottom: 0;
          border-left: 1px solid #2a2a2a;
        }
        .jn-quote {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(1.2rem, 2.5vw, 1.55rem);
          line-height: 1.6; font-style: italic;
          color: #e8e0d4;
          margin: 0 0 0.6em;
          padding: 0 0 0 1.5em;
        }
        .jn-quote-mark {
          font-size: 1.2em; color: #f7ba53;
          vertical-align: -0.1em;
        }
        .jn-quote-attr {
          font-family: 'Oswald', sans-serif;
          font-size: 0.62rem; letter-spacing: 0.15em;
          text-transform: uppercase; color: #444;
          padding-left: 1.5em; margin: 0;
        }

        /* End */
        .jn-end-wrap {
          padding-top: 5em; padding-bottom: 2em;
          display: flex; flex-direction: column; align-items: center; gap: 1em;
        }
        .jn-end-rule {
          width: 40px; height: 1px; background: #2a2a2a;
        }
        .jn-end-label {
          font-family: 'Oswald', sans-serif;
          font-size: 0.58rem; letter-spacing: 0.3em;
          text-transform: uppercase; color: #333; margin: 0;
        }

        /* ── Close button ── */
        .jn-close {
          position: fixed;
          top: 1.4rem; right: 1.8rem;
          z-index: 9100;
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.8);
          width: 38px; height: 38px;
          border-radius: 50%;
          font-size: 0.8rem;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.4s ease, background 0.2s;
          backdrop-filter: blur(8px);
        }
        .jn-close:hover {
          background: rgba(255,255,255,0.15);
          color: #fff;
        }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .jn-hero-text { padding: 0 6vw 8vh; }
          .jn-section { padding: 2.5em 1.5em 0; }
          .jn-intro-wrap { padding-top: 3.5em; }
          .jn-scroll-hint { display: none; }
          .jn-dropcap::first-letter { font-size: 3.5em; }
        }
      `}</style>
    </div>
  );
}
