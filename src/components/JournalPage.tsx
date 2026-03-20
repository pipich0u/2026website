"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ── Travel journal content ──────────────────────────────────────────────── */

interface Section {
  type: "intro" | "chapter" | "text" | "quote";
  content: string;
  sub?: string;
}
interface JournalEntry { date: string; sections: Section[]; }

const JOURNAL: Record<number, JournalEntry> = {
  1: {
    date: "January 2024",
    sections: [
      { type: "intro", content: "The last train from Klosters deposits you at a station so quiet you can hear the cold. Saint Antönien begins here — a cluster of farmhouses suspended between two ridgelines, connected to the world by a single road that the locals seem pleased nobody uses." },
      { type: "chapter", content: "INTO THE VALLEY", sub: "Prättigau · 1,420 m" },
      { type: "text", content: "Alpine villages either perform their charm or possess it. Saint Antönien possesses it. There are no ski lifts visible from the main street, no fondue signs in English, no instagram-optimized viewpoints. What there is: woodsmoke curling from chimneys, cowbells muffled by snow, and the particular blue that winter casts on south-facing slopes at four in the afternoon.\n\nI arrived in the kind of silence that makes you instinctively lower your voice. The Prättigau valley lay below, already in shadow, while the peaks above still caught the last light. This is the hour photographers call golden — but here it felt less like a photographic event than a daily fact of geography." },
      { type: "quote", content: "You don't visit places like this. You submit to them.", sub: "Personal journal, January 14" },
      { type: "text", content: "The farmhouse I stayed in had been in the same family for six generations. The wood on the walls had darkened to the color of strong tea. Breakfast was served at seven: bread baked the night before, butter from cows I could see from the window, and a coffee strong enough to justify the altitude.\n\nSome places exist in resistance to the world's speed. Saint Antönien is one of them. I left wishing I hadn't." },
    ],
  },
  2: {
    date: "February 2023",
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
    sections: [
      { type: "intro", content: "El Capitan does not look like a rock formation. It looks like something placed there intentionally, to settle a question about scale. Standing at its base, you understand, for the first time, that you have been significantly overestimating your own size." },
      { type: "chapter", content: "THE VALLEY IN AUTUMN", sub: "Yosemite Valley · 1,200 m" },
      { type: "text", content: "October is Yosemite's best secret. The summer crowds have gone, the light is lower and more directional, and the black oaks that line the valley floor are burning yellow and amber. Mirror Lake, this time of year, holds a reflection so precise it looks like two worlds sharing one surface.\n\nHalf Dome emerged from morning cloud as I ate breakfast at the trailhead. There's an argument to be made that it doesn't matter how many times you've seen a photograph of something — the first time you see the thing itself, it is still a different kind of experience." },
      { type: "quote", content: "Wilderness is not the absence of civilization. It is the reminder of what civilization is for.", sub: "Yosemite, October 3" },
      { type: "text", content: "Tunnel View at dusk, the valley below filling with shadow while the rim stayed light. A ranger told me this is called alpenglow. She said it as though naming it made it no less miraculous, which is exactly the right attitude.\n\nI stayed longer than planned. That is always the sign of a good place." },
    ],
  },
  5: {
    date: "August 2023",
    sections: [
      { type: "intro", content: "Tarifa is the southernmost point of continental Europe, and the wind there has opinions. It arrives from the Strait of Gibraltar with the confidence of something that has crossed an ocean and intends to continue crossing things. The kitesurfers love it. The trees have adapted. Everyone else leans slightly." },
      { type: "chapter", content: "THE CROSSING", sub: "Strait of Gibraltar · 14 km" },
      { type: "text", content: "On a clear day — and there are clear days, between the Levante winds — you can see Africa from the beach. It is not a metaphor. It is Morocco, across fourteen kilometers of strait, close enough to make you think about how arbitrary the categories of 'Europe' and 'Africa' are when you're standing on the sand between them.\n\nThe old town of Tarifa is white walls and bougainvillea and cats on windowsills. It has the relaxed quality of a place that has been at the intersection of civilizations long enough to stop being anxious about it." },
      { type: "quote", content: "Every edge of a continent is a beginning, not an ending.", sub: "Los Lances Beach, August 21" },
      { type: "text", content: "At sunset, the Levante dropped to a murmur and the Strait went flat and gold. Fishing boats returned. The kitesurfers packed up. Someone was frying fish somewhere near the harbor. I have been to more spectacular places, but few that felt more exactly like themselves." },
    ],
  },
  6: {
    date: "September 2023",
    sections: [
      { type: "intro", content: "Cappadocia is geology made spectacular: ten million years of volcanic eruption and erosion, resulting in a landscape that looks like it was designed for a film that hasn't been made yet. The fairy chimneys of Göreme stand in clusters, capped with dark basalt, like mushrooms that have been here long enough to develop opinions." },
      { type: "chapter", content: "BEFORE DAWN", sub: "Göreme · 05:00" },
      { type: "text", content: "The balloon launch happens before you're entirely awake. In the dark, thirty or forty envelopes inflate simultaneously across the valley, turning slowly from dark shapes into colored lanterns against the pre-dawn sky. By the time you are airborne, the first light is catching the chimneys below.\n\nFrom altitude, Cappadocia is comprehensible in a way it isn't at ground level. You can see the logic of the valleys, the way the ancient cities were carved into the cliff faces for defense, the underground cities that connected them. History becomes topography." },
      { type: "quote", content: "To see a landscape from above is to read the sentence you've been living inside.", sub: "Göreme Valley, September 12" },
      { type: "text", content: "The cave hotel I stayed in was carved from tuff — the same volcanic rock as everything else. At night, the walls held the warmth of the day. In the morning, the light came through a window cut directly into the cliff and fell across the stone floor in a rectangle that moved as slowly and exactly as a sundial.\n\nSome accommodations are where you sleep. Others are where you understand something." },
    ],
  },
  7: {
    date: "July 2023",
    sections: [
      { type: "intro", content: "The Great Migration is not a single event. It is a continuous, year-round movement of 1.5 million wildebeest across the Serengeti-Mara ecosystem — a circle so vast it takes twelve months to complete. To witness any part of it is to watch something so ancient that 'ancient' is barely the right word." },
      { type: "chapter", content: "THE MARA CROSSING", sub: "Serengeti · Dry Season" },
      { type: "text", content: "We waited at the crossing point for four hours before the first wildebeest reached the bank and stopped. This is what they do — they accumulate at the river's edge until the pressure of numbers behind them makes the decision for them. Then they go, and the crocodiles, who have been waiting longer than we have, respond.\n\nThe chaos of a crossing is total and brief. It is over before you understand it has begun. In the dust afterwards, both banks are quiet again, and the river runs its normal brown, as though nothing has happened." },
      { type: "quote", content: "Nature is not indifferent to suffering. It simply operates at a scale where suffering is a detail.", sub: "Serengeti plains, July 18" },
      { type: "text", content: "Sunset on the savanna, and the acacia trees became silhouettes, and a cheetah that had been sleeping on a termite mound stood, stretched, and began walking with purpose. The guide said she was probably heading for the Thomson's gazelle herd two kilometers east.\n\nYou spend time in places like this and you realize that drama, elsewhere, is mostly manufactured." },
    ],
  },
};

/* ── Scroll-triggered fade-in ────────────────────────────────────────────── */

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(36px)",
      transition: `opacity 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s, transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

/* ── JournalPage ─────────────────────────────────────────────────────────── */

interface CardData {
  id: number; image: string; background: string; title: string; subtitle: string; description?: string;
}

export default function JournalPage({
  card, ext, sourceRect, onClose,
}: {
  card: CardData; ext: string; sourceRect: DOMRect | null; onClose: () => void;
}) {
  const [phase, setPhase] = useState<"enter" | "active" | "exit">("enter");

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setPhase("active")));
  }, []);

  const handleClose = useCallback(() => {
    setPhase("exit");
    setTimeout(onClose, 500);
  }, [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClose]);

  const isExpanded = phase === "active";
  const isExiting  = phase === "exit";

  const startStyle = sourceRect
    ? { left: sourceRect.left, top: sourceRect.top, width: sourceRect.width, height: sourceRect.height, borderRadius: "20px" }
    : { left: "50%", top: "50%", width: 0, height: 0, borderRadius: "20px" };

  const journal = JOURNAL[card.id];

  return (
    <div className="ge-detail-overlay" style={{ opacity: isExiting ? 0 : 1, transition: "opacity 400ms ease" }}>
      <div
        className="ge-detail-page"
        style={isExpanded && !isExiting
          ? { left: 0, top: 0, width: "100vw", height: "100vh", borderRadius: 0 }
          : {
              left: startStyle.left, top: startStyle.top,
              width:  typeof startStyle.width  === "number" ? startStyle.width  + "px" : startStyle.width,
              height: typeof startStyle.height === "number" ? startStyle.height + "px" : startStyle.height,
              borderRadius: startStyle.borderRadius,
            }}
      >
        <div className="jn-scroller">

          {/* ── HERO: full-bleed photo ── */}
          <div className="jn-hero">
            <img
              src={`${card.image}.webp`}
              alt={card.subtitle}
              className="ge-detail-bg-img"
            />
            <div className="jn-hero-grad" />

            {/* Title block — same layout as homepage hero left side */}
            <div
              className="jn-hero-title-block"
              style={{
                opacity: isExpanded && !isExiting ? 1 : 0,
                transform: isExpanded && !isExiting ? "translateY(0)" : "translateY(40px)",
              }}
            >
              <p className="jn-hero-region">
                <svg className="jn-hero-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {card.title}
              </p>
              <h1 className="jn-hero-place">{card.subtitle}</h1>
              {card.description && (
                <p className="jn-hero-desc">{card.description}</p>
              )}
              <div className="jn-hero-actions">
                <button className="jn-exit-btn" onClick={handleClose}>BACK TO GALLERY</button>
              </div>
            </div>
          </div>

          {/* ── MAGAZINE BODY — light, NatGeo-inspired ── */}
          {journal && (
            <article className="jn-article">
              {/* Yellow rule + date bar */}
              <Reveal delay={0}>
                <div className="jn-masthead">
                  <div className="jn-yellow-rule" />
                  <div className="jn-meta-row">
                    <span className="jn-meta-date">{journal.date}</span>
                    <span className="jn-meta-sep" />
                    <span className="jn-meta-place">{card.subtitle}</span>
                  </div>
                </div>
              </Reveal>

              {journal.sections.map((sec, i) => {
                if (sec.type === "intro") return (
                  <Reveal key={i} delay={0.1}>
                    <p className="jn-intro">{sec.content}</p>
                  </Reveal>
                );

                if (sec.type === "chapter") return (
                  <Reveal key={i} delay={0}>
                    <div className="jn-chapter-wrap">
                      <div className="jn-chapter-accent" />
                      <h2 className="jn-chapter">{sec.content}</h2>
                      {sec.sub && <p className="jn-chapter-sub">{sec.sub}</p>}
                    </div>
                  </Reveal>
                );

                if (sec.type === "text") return (
                  <Reveal key={i} delay={0.08}>
                    <div>
                      {sec.content.split("\n\n").map((para, pi) => (
                        <p key={pi} className={`jn-body${pi === 0 ? " jn-drop" : ""}`}>{para}</p>
                      ))}
                    </div>
                  </Reveal>
                );

                if (sec.type === "quote") return (
                  <Reveal key={i} delay={0.08}>
                    <div className="jn-quote-wrap">
                      <blockquote className="jn-quote">&ldquo;{sec.content}&rdquo;</blockquote>
                      {sec.sub && <cite className="jn-quote-attr">— {sec.sub}</cite>}
                    </div>
                  </Reveal>
                );

                return null;
              })}

              {/* End ornament */}
              <Reveal delay={0}>
                <div className="jn-fin">
                  <span className="jn-fin-rule" />
                  <span className="jn-fin-diamond" />
                  <span className="jn-fin-rule" />
                </div>
              </Reveal>

              {/* Back button */}
              <Reveal delay={0}>
                <div className="jn-back-wrap">
                  <button className="jn-back-btn" onClick={handleClose}>Back to Gallery</button>
                </div>
              </Reveal>
            </article>
          )}
        </div>

      </div>

      <style>{`
        .jn-scroller {
          position: absolute; inset: 0;
          overflow-y: auto; overflow-x: hidden;
          scrollbar-width: thin;
          scrollbar-color: rgba(0,0,0,0.15) transparent;
        }

        /* ── Hero ── */
        .jn-hero {
          position: relative;
          height: 100vh;
          flex-shrink: 0;
        }
        .jn-hero-grad {
          position: absolute; inset: 0;
          background: linear-gradient(
            to bottom,
            transparent 30%,
            rgba(0,0,0,0.55) 100%
          );
          pointer-events: none;
        }
        .jn-hero-title-block {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 0 6vw 4.5rem;
          color: white;
          transition: opacity 700ms ease 200ms, transform 700ms ease 200ms;
        }
        .jn-hero-region {
          font-family: 'Oswald', sans-serif;
          font-size: 1rem;
          font-weight: 400;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.85);
          margin: 0 0 0.7em;
          display: flex;
          align-items: center;
          gap: 0.5em;
        }
        .jn-hero-pin {
          width: 1.1em;
          height: 1.1em;
          flex-shrink: 0;
          opacity: 0.9;
        }
        .jn-hero-place {
          font-family: 'Oswald', Georgia, serif;
          font-size: clamp(3.5rem, 8vw, 7rem);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          line-height: 1.05;
          margin: 0 0 0.4em;
          max-width: 10ch;
        }
        .jn-hero-desc {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(0.9rem, 1.4vw, 1.05rem);
          line-height: 1.7;
          color: rgba(255,255,255,0.7);
          margin: 0;
          max-width: 720px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ── Article — warm light theme ── */
        .jn-article {
          background: #FAF8F4;
          padding: 0 0 5em;
        }

        /* Masthead */
        .jn-masthead {
          max-width: 680px;
          margin: 0 auto;
          padding: 4em 2em 0;
        }
        .jn-yellow-rule {
          width: 64px;
          height: 4px;
          background: #FFCE04;
          margin-bottom: 2em;
        }
        .jn-meta-row {
          display: flex;
          align-items: center;
          gap: 1.2em;
          font-family: 'Oswald', sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #999;
        }
        .jn-meta-sep {
          flex: 1;
          height: 1px;
          background: #e0ddd6;
        }
        .jn-meta-date { color: #888; }
        .jn-meta-place { color: #888; }

        /* Intro */
        .jn-intro {
          max-width: 680px;
          margin: 2.8em auto 0;
          padding: 0 2em;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(1.15rem, 2vw, 1.35rem);
          line-height: 1.9;
          font-style: italic;
          color: #4a4540;
        }

        /* Chapter */
        .jn-chapter-wrap {
          max-width: 680px;
          margin: 4.5em auto 0;
          padding: 0 2em;
        }
        .jn-chapter-accent {
          width: 32px;
          height: 3px;
          background: #FFCE04;
          margin-bottom: 1.2em;
        }
        .jn-chapter {
          font-family: 'Oswald', sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #2a2722;
          margin: 0 0 0.3em;
        }
        .jn-chapter-sub {
          font-family: 'Oswald', sans-serif;
          font-size: 0.65rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #b0a89a;
          margin: 0;
        }

        /* Body text */
        .jn-body {
          max-width: 680px;
          margin: 2em auto 0;
          padding: 0 2em;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(1rem, 1.6vw, 1.1rem);
          line-height: 2;
          color: #555048;
        }

        /* Drop cap */
        .jn-drop::first-letter {
          float: left;
          font-family: Georgia, serif;
          font-size: 4.5em;
          line-height: 0.78;
          padding-right: 0.12em;
          margin-top: 0.05em;
          color: #2a2722;
          font-weight: 700;
        }

        /* Pull quote */
        .jn-quote-wrap {
          max-width: 600px;
          margin: 4em auto;
          padding: 2.5em 2em 2.5em 3em;
          border-left: 3px solid #FFCE04;
          background: rgba(255,206,4,0.04);
        }
        .jn-quote {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(1.2rem, 2.4vw, 1.55rem);
          line-height: 1.7;
          font-style: italic;
          color: #2a2722;
          margin: 0 0 0.8em;
        }
        .jn-quote-attr {
          display: block;
          font-family: 'Oswald', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #b0a89a;
          font-style: normal;
        }

        /* End ornament */
        .jn-fin {
          max-width: 680px;
          margin: 5em auto 0;
          padding: 0 2em;
          display: flex;
          align-items: center;
          gap: 1.5em;
        }
        .jn-fin-rule {
          flex: 1;
          height: 1px;
          background: #e0ddd6;
        }
        .jn-fin-diamond {
          width: 8px;
          height: 8px;
          background: #FFCE04;
          transform: rotate(45deg);
        }

        /* Back button */
        .jn-back-wrap {
          text-align: center;
          margin-top: 3em;
        }
        .jn-back-btn {
          font-family: 'Oswald', sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #888;
          background: none;
          border: 1px solid #d5d0c8;
          border-radius: 2px;
          padding: 0.9em 2.2em;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .jn-back-btn:hover {
          color: #2a2722;
          border-color: #2a2722;
        }

        /* Hero exit button — matches ge-discover-btn on homepage */
        .jn-hero-actions {
          margin-top: 1.8em;
        }
        .jn-exit-btn {
          background: none;
          border: 1px solid rgba(255,255,255,0.5);
          border-radius: 20px;
          color: white;
          padding: 0.7rem 1.4rem;
          font-size: 0.85rem;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: background 200ms, border-color 200ms;
          font-family: 'Oswald', sans-serif;
        }
        .jn-exit-btn:hover {
          background: rgba(220,220,220,0.37);
          border-color: white;
        }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .jn-hero-title-block { padding: 0 1.5em 3rem; }
          .jn-hero-place { font-size: clamp(2.5rem, 12vw, 4rem); }
          .jn-masthead,
          .jn-body, .jn-intro, .jn-quote-wrap, .jn-chapter-wrap,
          .jn-fin { padding-left: 1.4em; padding-right: 1.4em; }
          .jn-quote-wrap { padding-left: 2em; }
          .jn-drop::first-letter { font-size: 3.5em; }
        }
      `}</style>
    </div>
  );
}
