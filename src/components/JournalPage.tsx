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
    date: "2024 年 1 月",
    sections: [
      { type: "intro", content: "从克洛斯特斯出发的末班火车把你放在一个安静到能听见寒冷的车站。圣安东尼恩从这里开始——一簇悬在两道山脊之间的农舍，靠一条当地人似乎很高兴没人使用的公路与世界相连。" },
      { type: "chapter", content: "走进山谷", sub: "普拉蒂高 · 海拔 1420 米" },
      { type: "text", content: "阿尔卑斯山村要么在表演自己的魅力，要么真正拥有它。圣安东尼恩属于后者。主街上看不到缆车，没有英文的奶酪火锅招牌，没有为社交媒体优化过的观景台。有的只是：烟囱里袅袅升起的柴烟，被积雪裹住的牛铃声，以及下午四点冬日投在南坡上那种独特的蓝。\n\n我抵达时，那种寂静让人本能地压低了声音。普拉蒂高山谷已在阴影中，而头顶的山峰还留着最后一抹光。摄影师管这叫黄金时刻——但在这里，它与其说是一个摄影事件，不如说是地理的日常。" },
      { type: "quote", content: "你不是去拜访这样的地方，而是向它臣服。", sub: "旅行日记，一月十四日" },
      { type: "text", content: "我住的农舍已经在同一个家族传承了六代。墙上的木头已经深到浓茶的颜色。早餐七点供应：前一晚烘好的面包，窗外就能看到奶牛的黄油，以及一杯浓到配得上这海拔的咖啡。\n\n有些地方的存在本身就是对世界速度的抵抗。圣安东尼恩就是其中之一。离开的时候，我希望自己没有离开。" },
    ],
  },
  2: {
    date: "2023 年 2 月",
    sections: [
      { type: "intro", content: "二月的长野不是一个目的地，而是一种状态。雪在这里不像是落下来的，更像是不声不响地堆积，直到雪松林变成了另一种东西——白色的雕塑，庄严而静默。" },
      { type: "chapter", content: "雪猿温泉", sub: "地狱谷 · 山之内町" },
      { type: "text", content: "通往地狱谷的小路很窄，而且是故意这样设计的。在被积雪压弯的森林里步行三十分钟，然后蒸汽先于一切升腾起来——硫磺的温暖穿透了冬日的空气。猕猴们像是一个随意的注脚，泡在温泉里齐胸深，脸朝着虚无的方向。\n\n它们从1963年就在这里了。温泉存在得更久。看着这些动物如此笃定地认为这就是好日子，有一种深深的平静。" },
      { type: "quote", content: "日本阿尔卑斯不要求你攀登，只请求你见证。", sub: "长野，二月八日" },
      { type: "text", content: "那个傍晚在白马村，山峦变成了一种我无法命名的紫色。滑雪道已经安静下来——只剩几个最后的身影横穿雪道，他们的轨迹交叉得像书法。旅馆里，温热的清酒已经端上来，被褥也已铺好。\n\n这就是那个不会主动宣布自己存在的日本。" },
    ],
  },
  3: {
    date: "2023 年 11 月",
    sections: [
      { type: "intro", content: "撒哈拉从公路不再假装的地方开始。前一秒你还在梅尔祖卡，有旅馆和薄荷茶，下一秒沙丘就在面前升起，除此之外什么都没有。只有被风排列成近乎刻意造型的沙。" },
      { type: "chapter", content: "走进厄尔切比", sub: "梅尔祖卡 · 日出" },
      { type: "text", content: "我们凌晨四点半出发。向导不打手电走在前面——他凭沙丘的影子认路。一个小时后我们站在一道沙脊上，看着天空按照一种任何照片都无法充分呈现的顺序变换颜色：从黑到靛蓝，到紫罗兰，到第一抹小心翼翼的金。\n\n撒哈拉的寂静不是一种缺席，而是一种存在。你开始意识到自己的呼吸、脚步踩在沙上的声音、身体发出的那些被城市掩盖了一辈子的细微声响。" },
      { type: "quote", content: "沙漠教会你的耐心，不是美德，而是事实。", sub: "厄尔切比，十一月十七日" },
      { type: "text", content: "回到马拉喀什，老城以最美好的方式让人目不暇接。集市的运行遵循一种奖励慢下来的人的逻辑：最好的摊位从来不在入口处。香料商、皮革匠、灯具师——每个人都是专家，每个人都有一个需要坐下来喝杯茶才能听完的故事。\n\n摩洛哥毫不费力地拥抱着自己的矛盾。这就是它独特的天赋。" },
    ],
  },
  4: {
    date: "2023 年 10 月",
    sections: [
      { type: "intro", content: "酋长岩看起来不像一块岩石。它看起来像是被有意放置在那里的，为了终结一个关于尺度的问题。站在它脚下，你第一次明白，原来自己一直在大幅高估自己的体量。" },
      { type: "chapter", content: "秋日山谷", sub: "优胜美地谷 · 海拔 1200 米" },
      { type: "text", content: "十月是优胜美地保守得最好的秘密。夏天的人潮已经散去，光线更低、更有方向感，谷底的黑橡树正燃烧着金黄与琥珀色。镜湖在这个季节倒映出的画面精确到像是两个世界共用一个平面。\n\n吃早餐的时候，半穹顶从晨雾中浮现出来。无论你看过多少次一个东西的照片，第一次亲眼看到它本身，仍然是截然不同的体验——这个论点是站得住脚的。" },
      { type: "quote", content: "荒野不是文明的缺席，而是对文明存在意义的提醒。", sub: "优胜美地，十月三日" },
      { type: "text", content: "黄昏时分的隧道观景点，谷底逐渐被阴影填满，而边缘依然明亮。一位护林员告诉我这叫做「日照金山」。她说这个词的时候，就好像命名并没有使它变得不那么神奇——这恰恰是正确的态度。\n\n我比计划多待了很久。而这永远是一个好地方的标志。" },
    ],
  },
  5: {
    date: "2023 年 8 月",
    sections: [
      { type: "intro", content: "塔里法是欧洲大陆的最南端，那里的风有自己的主张。它从直布罗陀海峡吹来，带着一种穿越过大洋、并打算继续穿越下去的自信。风筝冲浪者爱死了它，树已经适应了，其他人都微微倾斜着。" },
      { type: "chapter", content: "海峡彼岸", sub: "直布罗陀海峡 · 14 公里" },
      { type: "text", content: "晴朗的日子——东风间歇时确实有晴天——你可以从沙滩上看到非洲。这不是比喻。那是摩洛哥，隔着十四公里的海峡，近到让你开始思考「欧洲」和「非洲」这两个分类站在两者之间的沙滩上时有多么武断。\n\n塔里法老城是白色的墙壁、三角梅和窗台上的猫。它有一种处在文明交汇处足够久之后不再为此焦虑的从容。" },
      { type: "quote", content: "每一片大陆的边缘都是一个开始，而非终结。", sub: "洛斯兰塞斯海滩，八月二十一日" },
      { type: "text", content: "日落时分，东风低声下来，海峡变得平静而金黄。渔船归来，冲浪者收拾装备，港口附近有人在炸鱼。我去过比这更壮观的地方，但很少有地方像这里一样，如此精确地等于它自己。" },
    ],
  },
  6: {
    date: "2023 年 9 月",
    sections: [
      { type: "intro", content: "卡帕多奇亚是被造化推向极致的地质奇观：一千万年的火山喷发与侵蚀，造就了一片看起来像是为某部尚未拍摄的电影而设计的地貌。格雷梅的精灵烟囱成群矗立，顶着深色玄武岩，像是在这里待了足够久、已经有了自己脾气的蘑菇。" },
      { type: "chapter", content: "黎明之前", sub: "格雷梅 · 凌晨五点" },
      { type: "text", content: "热气球升空发生在你还没完全醒来的时候。黑暗中，三四十个气球同时在山谷各处充气，从暗影缓缓变成黎明前天空中的彩色灯笼。等你升到空中的时候，第一道光已经开始抚摸下方的烟囱。\n\n从高处看，卡帕多奇亚变得可以理解了——在地面上它是做不到的。你可以看见山谷的逻辑，古城是如何为了防御被凿进崖壁的，地下城市又是如何将它们连接起来的。历史变成了地形。" },
      { type: "quote", content: "从高处看一片风景，就是在阅读你一直身处其中的那个句子。", sub: "格雷梅谷，九月十二日" },
      { type: "text", content: "我住的洞穴酒店是从凝灰岩中凿出来的——和这里所有东西一样的火山岩。夜里，墙壁保存着白天的余温。清晨，光线从一扇直接凿入崖壁的窗户射进来，落在石头地板上，形成一个像日晷一样缓慢而精确移动的长方形。\n\n有些住处只是你睡觉的地方。另一些是你理解了什么的地方。" },
    ],
  },
  7: {
    date: "2023 年 7 月",
    sections: [
      { type: "intro", content: "大迁徙不是一个单独的事件，而是一百五十万头角马穿越塞伦盖蒂-马赛马拉生态系统的持续运动——一个庞大到需要十二个月才能完成的循环。见证其中任何一个片段，就是在观看某种古老到「古老」这个词都已经不够用的东西。" },
      { type: "chapter", content: "马拉河渡口", sub: "塞伦盖蒂 · 旱季" },
      { type: "text", content: "我们在渡河点等了四个小时，第一头角马才走到河岸边停了下来。它们就是这样——在河边不断聚集，直到身后的数量压力替它们做出了决定。然后它们冲了出去，而等候更久的鳄鱼做出了回应。\n\n一次渡河的混乱是彻底的、短暂的。在你理解它已经开始之前它就结束了。尘埃之后，两岸重归平静，河水恢复了惯常的褐色，仿佛什么都没有发生过。" },
      { type: "quote", content: "自然不是对苦难无动于衷，它只是在一个苦难是细节的尺度上运行。", sub: "塞伦盖蒂平原，七月十八日" },
      { type: "text", content: "草原上的日落，金合欢树变成了剪影，一只一直睡在白蚁丘上的猎豹站了起来，伸了个懒腰，开始有目的地行走。向导说她大概正朝两公里外的汤氏瞪羚群走去。\n\n在这样的地方待上一段时间，你就会意识到，其他地方的戏剧性大多是人造的。" },
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
                <button className="jn-scroll-btn" aria-label="Scroll to article" onClick={() => {
                  const article = document.querySelector('.jn-article');
                  if (article) article.scrollIntoView({ behavior: 'smooth' });
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
            </div>

          </div>

          {/* ── MAGAZINE BODY ── */}
          {journal && (
            <article className="jn-article">
              {/* Transition strip */}
              <div className="jn-transition-strip">
                <div className="jn-yellow-rule" />
              </div>

              {/* Masthead */}
              <Reveal delay={0}>
                <div className="jn-masthead">
                  <p className="jn-masthead-label">旅行手记</p>
                  <div className="jn-meta-row">
                    <span className="jn-meta-date">{journal.date}</span>
                    <span className="jn-meta-dot" />
                    <span className="jn-meta-place">{card.title}</span>
                  </div>
                  <h2 className="jn-masthead-title">{card.subtitle}</h2>
                </div>
              </Reveal>

              {/* Intro */}
              {journal.sections.filter(s => s.type === "intro").map((sec, i) => (
                <Reveal key={`intro-${i}`} delay={0.1}>
                  <p className="jn-intro">{sec.content}</p>
                </Reveal>
              ))}

              {/* Separator */}
              <Reveal delay={0}>
                <div className="jn-sep">
                  <span className="jn-sep-diamond" />
                  <span className="jn-sep-line" />
                  <span className="jn-sep-diamond" />
                </div>
              </Reveal>

              {/* Body sections */}
              {(() => {
                let chapterIdx = 0;
                return journal.sections.filter(s => s.type !== "intro").map((sec, i) => {
                  if (sec.type === "chapter") {
                    chapterIdx++;
                    return (
                      <Reveal key={i} delay={0}>
                        <div className="jn-chapter-wrap">
                          <div className="jn-chapter-num-col">
                            <span className="jn-chapter-num">{String(chapterIdx).padStart(2, "0")}</span>
                            <span className="jn-chapter-vline" />
                          </div>
                          <div>
                            <h2 className="jn-chapter">{sec.content}</h2>
                            {sec.sub && <p className="jn-chapter-sub">{sec.sub}</p>}
                          </div>
                        </div>
                      </Reveal>
                    );
                  }

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
                      <figure className="jn-quote-wrap">
                        <div className="jn-quote-bar" />
                        <blockquote className="jn-quote">{sec.content}</blockquote>
                        {sec.sub && <figcaption className="jn-quote-attr">— {sec.sub}</figcaption>}
                      </figure>
                    </Reveal>
                  );

                  return null;
                });
              })()}

              {/* End piece */}
              <Reveal delay={0}>
                <div className="jn-fin-wrap">
                  <div className="jn-fin-line" />
                  <div className="jn-fin-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <p className="jn-fin-text">End of Journal</p>
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

        /* ── Article ── */
        .jn-article {
          background: #FAF8F4;
          padding: 0 0 6em;
        }

        /* Transition strip */
        .jn-transition-strip {
          background: #FAF8F4;
          display: flex;
          justify-content: center;
          padding: 4em 0 0;
        }
        .jn-yellow-rule {
          width: 48px;
          height: 3px;
          background: #f7ba53;
          border-radius: 2px;
        }

        /* Masthead */
        .jn-masthead {
          max-width: 720px;
          margin: 0 auto;
          padding: 3.5em 2.5em 0;
          text-align: center;
        }
        .jn-masthead-label {
          font-family: 'Oswald', sans-serif;
          font-size: 0.72rem;
          font-weight: 400;
          letter-spacing: 0.35em;
          color: #c9a84c;
          margin: 0 0 2em;
        }
        .jn-meta-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.8em;
          font-family: 'Oswald', sans-serif;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #aaa49a;
        }
        .jn-meta-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #d0cbc2;
        }
        .jn-masthead-title {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 400;
          color: #2a2722;
          line-height: 1.25;
          margin: 0.7em 0 0;
          letter-spacing: -0.01em;
        }

        /* Intro */
        .jn-intro {
          max-width: 620px;
          margin: 3.5em auto 0;
          padding: 0 2.5em;
          font-family: "Noto Serif SC", "Source Han Serif SC", "STSong", Georgia, serif;
          font-size: clamp(1.02rem, 1.7vw, 1.15rem);
          line-height: 2.2;
          font-style: normal;
          color: #6d665c;
          text-align: center;
        }

        /* Separator */
        .jn-sep {
          max-width: 720px;
          margin: 3.5em auto 0;
          padding: 0 2.5em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1em;
        }
        .jn-sep-line {
          width: 80px;
          height: 1px;
          background: #ddd8d0;
        }
        .jn-sep-diamond {
          width: 5px;
          height: 5px;
          background: #d0cbc2;
          transform: rotate(45deg);
          flex-shrink: 0;
        }

        /* Chapter */
        .jn-chapter-wrap {
          max-width: 720px;
          margin: 4em auto 0;
          padding: 0 2.5em;
          display: flex;
          align-items: flex-start;
          gap: 1.6em;
        }
        .jn-chapter-num-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.6em;
          flex-shrink: 0;
          padding-top: 0.15em;
        }
        .jn-chapter-num {
          font-family: Georgia, serif;
          font-size: 2rem;
          font-weight: 400;
          color: #c9a84c;
          line-height: 1;
        }
        .jn-chapter-vline {
          width: 1px;
          height: 24px;
          background: linear-gradient(to bottom, #d8d3c8, transparent);
        }
        .jn-chapter {
          font-family: 'Oswald', "Noto Sans SC", sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: #2a2722;
          margin: 0 0 0.35em;
        }
        .jn-chapter-sub {
          font-family: 'Oswald', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #b0a89a;
          margin: 0;
        }

        /* Body text */
        .jn-body {
          max-width: 720px;
          margin: 2em auto 0;
          padding: 0 2.5em;
          font-family: "Noto Serif SC", "Source Han Serif SC", "STSong", Georgia, serif;
          font-size: clamp(1rem, 1.4vw, 1.06rem);
          line-height: 2.15;
          color: #4a4540;
          text-align: justify;
          text-justify: inter-ideograph;
        }

        /* First paragraph indent */
        .jn-drop {
          text-indent: 2em;
        }

        /* Pull quote */
        .jn-quote-wrap {
          max-width: 580px;
          margin: 3.5em auto;
          padding: 2.5em 3em;
          text-align: left;
          position: relative;
        }
        .jn-quote-bar {
          position: absolute;
          left: 0;
          top: 2.5em;
          bottom: 2.5em;
          width: 3px;
          background: #f7ba53;
          border-radius: 2px;
        }
        .jn-quote {
          font-family: "Noto Serif SC", "Source Han Serif SC", "STKaiti", Georgia, serif;
          font-size: clamp(1.1rem, 2vw, 1.3rem);
          line-height: 2;
          font-style: normal;
          color: #3a3630;
          margin: 0 0 1em;
        }
        .jn-quote-attr {
          display: block;
          font-family: 'Oswald', "Noto Sans SC", sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          color: #b0a89a;
          font-style: normal;
        }

        /* End piece */
        .jn-fin-wrap {
          max-width: 720px;
          margin: 5em auto 0;
          padding: 0 2.5em;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5em;
        }
        .jn-fin-line {
          width: 48px;
          height: 1px;
          background: #ddd8d0;
        }
        .jn-fin-badge {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid #e0ddd6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c9a84c;
        }
        .jn-fin-badge svg {
          width: 18px;
          height: 18px;
        }
        .jn-fin-text {
          font-family: 'Oswald', sans-serif;
          font-size: 0.58rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #c0b9ad;
          margin: 0;
        }
        .jn-back-btn {
          font-family: 'Oswald', sans-serif;
          font-size: 0.68rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #999;
          background: none;
          border: 1px solid #d5d0c8;
          border-radius: 20px;
          padding: 0.8em 2.5em;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 0.5em;
        }
        .jn-back-btn:hover {
          color: #2a2722;
          border-color: #2a2722;
          background: rgba(0,0,0,0.03);
        }

        /* Hero exit button — matches ge-discover-btn on homepage */
        .jn-hero-actions {
          margin-top: 1.8em;
          display: flex;
          gap: 0.8rem;
          align-items: center;
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
        .jn-scroll-btn {
          background: #f7ba53;
          border: none;
          border-radius: 50%;
          color: white;
          width: 42px;
          height: 42px;
          cursor: pointer;
          transition: background 200ms;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: jn-bounce 2s ease-in-out infinite;
        }
        .jn-scroll-btn svg {
          width: 22px;
          height: 22px;
        }
        .jn-scroll-btn:hover { background: #e5a843; }
        @keyframes jn-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }


        /* ── Mobile ── */
        @media (max-width: 640px) {
          .jn-hero-title-block { padding: 0 1.5em 3rem; }
          .jn-hero-place { font-size: clamp(2.5rem, 12vw, 4rem); }
          .jn-masthead,
          .jn-body, .jn-intro, .jn-chapter-wrap,
          .jn-fin-wrap { padding-left: 1.4em; padding-right: 1.4em; }
          .jn-quote-wrap { padding-left: 1.8em; padding-right: 1.4em; }
          .jn-body { padding-left: 1.4em; padding-right: 1.4em; }
          .jn-chapter-num { font-size: 1.6rem; }
          .jn-scroll-btn { width: 36px; height: 36px; }
          .jn-scroll-btn svg { width: 18px; height: 18px; }
        }
      `}</style>
    </div>
  );
}
