import type { ReactElement, ReactNode } from "react";
import { AbsoluteFill, Easing, Img, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { BarChart3, Bookmark, CheckCircle2, Coins, Eye, Heart, MapPin, MessageCircle, Navigation, Plane, QrCode, Search, Send, Star, Sun, Ticket, Users, Utensils, Waves, Music2, Mountain } from "lucide-react";

// Fonts and photos are bundled in public/ so renders are offline-safe.
const DISPLAY = "Bricolage", BODY = "Figtree";
const fh = delayRender("fonts");
Promise.all([new FontFace(DISPLAY, `url(${staticFile("bricolage.woff2")})`, { weight: "200 800" }), new FontFace(BODY, `url(${staticFile("figtree.woff2")})`, { weight: "300 900" })].map((f) => f.load().then((x) => document.fonts.add(x)))).finally(() => continueRender(fh));

const O = "#FF5A00", INK = "#242326", W = "#FFFFFF", SOFT = "#FFF0E6", LINE = "#E3E0DC", MUTED = "#6B6762", SURF = "#F5F4F2";
const img = (n: string) => staticFile(`${n}.jpg`);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const t = (f: number, a: number, b: number, from = 0, to = 1) => interpolate(f, [a, b], [from, to], { ...clamp, easing: ease });
const sp = (f: number, d = 0, damping = 14) => spring({ frame: f - d, fps: 30, config: { damping, mass: 0.8 } });
const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(Math.round(n)));

// Every scene breathes in (zoom + blur) and out, overlapping its neighbours.
const Scene = ({ dur, bg, children }: { dur: number; bg: string; children: ReactNode }) => {
  const f = useCurrentFrame();
  const inP = t(f, 0, 18), outP = t(f, dur - 18, dur);
  return (
    <AbsoluteFill style={{ background: bg, opacity: inP * (1 - outP), filter: `blur(${(1 - inP) * 10 + outP * 10}px)`, transform: `scale(${1.04 - inP * 0.04 + outP * 0.03}) translateY(${(1 - inP) * 40 - outP * 40}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

// Kicker + headline that reveals line by line from a mask.
const Caption = ({ kicker, title, color = INK, at = 4, top = 150 }: { kicker: string; title: string; color?: string; at?: number; top?: number }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top, left: 80, right: 80, fontFamily: DISPLAY }}>
      <div style={{ overflow: "hidden" }}><div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 34, letterSpacing: 4, textTransform: "uppercase", color: color === W ? "rgba(255,255,255,.8)" : O, transform: `translateY(${t(f, at, at + 14, 60, 0)}px)` }}>{kicker}</div></div>
      {title.split("\n").map((line, i) => (
        <div key={i} style={{ overflow: "hidden" }}><div style={{ fontWeight: 800, fontSize: 96, lineHeight: 1.02, letterSpacing: -3, color, transform: `translateY(${t(f, at + 4 + i * 5, at + 22 + i * 5, 120, 0)}px)` }}>{line}</div></div>
      ))}
    </div>
  );
};

// Phone with a slow 3D drift; `cam` lets scenes push the camera.
const Phone = ({ children, f, y = 520, tilt = 8, s = 1 }: { children: ReactNode; f: number; y?: number; tilt?: number; s?: number }) => (
  <div style={{ position: "absolute", left: 540 - 330, top: y, width: 660, height: 1300, perspective: 2400 }}>
    <div style={{ width: "100%", height: "100%", borderRadius: 86, border: `16px solid ${INK}`, background: W, overflow: "hidden", position: "relative", boxShadow: "0 80px 160px rgba(0,0,0,.28)",
      transform: `scale(${s}) rotateX(${tilt * 0.4 * Math.cos(f / 40)}deg) rotateY(${tilt * Math.sin(f / 50)}deg) translateY(${sp(f, 0, 18) * -0 + t(f, 0, 20, 160, 0)}px)` }}>
      {children}
    </div>
  </div>
);

const Pin = ({ size = 160, color = O, hole = W }: { size?: number; color?: string; hole?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><path d="M16 3a8.5 8.5 0 0 0-8.5 8.5C7.5 18 16 29 16 29s8.5-11 8.5-17.5A8.5 8.5 0 0 0 16 3Z" fill={color} /><circle cx="16" cy="11.5" r="3.2" fill={hole} /></svg>
);
const Tap = ({ f, at, x, y }: { f: number; at: number; x: number; y: number }) => {
  const p = t(f, at, at + 16); if (f < at || p >= 1) return null;
  return <div style={{ position: "absolute", left: x - 60, top: y - 60, width: 120, height: 120, borderRadius: 99, border: `6px solid ${O}`, transform: `scale(${0.3 + p})`, opacity: 1 - p }} />;
};

/* ---------------- Scenes ---------------- */

const Intro = () => {
  const f = useCurrentFrame();
  const drop = sp(f, 0, 9);
  const letters = "Outsider".split("");
  return (
    <Scene dur={96} bg={O}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${1 + f / 600})` }}>
        {[0, 1, 2].map((k) => { const p = t(f, 14 + k * 8, 50 + k * 8); return <div key={k} style={{ position: "absolute", width: 300, height: 300, borderRadius: 999, border: "4px solid rgba(255,255,255,.6)", transform: `translateY(-150px) scale(${0.3 + p * 3})`, opacity: 1 - p }} />; })}
        <div style={{ transform: `translateY(${(1 - drop) * -700 - 150}px)` }}><Pin size={240} color={W} hole={O} /></div>
        <div style={{ display: "flex", fontFamily: DISPLAY, fontWeight: 800, fontSize: 200, color: W, letterSpacing: -8, marginTop: 40 }}>
          {letters.map((l, i) => { const p = sp(f, 18 + i * 2.5, 12); return <span key={i} style={{ display: "inline-block", transform: `translateY(${(1 - p) * 120}px) scale(${0.6 + p * 0.4})`, opacity: p }}>{l}</span>; })}
        </div>
        <div style={{ fontFamily: BODY, fontSize: 50, color: W, opacity: t(f, 48, 64), transform: `translateY(${t(f, 48, 64, 30, 0)}px)` }}>Go out more.</div>
      </AbsoluteFill>
    </Scene>
  );
};

// Narration subtitle that swaps line by line inside a scene.
const Narration = ({ lines, dark = false }: { lines: [number, string][]; dark?: boolean }) => {
  const f = useCurrentFrame();
  const i = lines.reduce((k, [at], j) => (f >= at ? j : k), -1);
  if (i < 0) return null;
  const [at, text] = lines[i];
  const next = lines[i + 1]?.[0] ?? 1e9;
  const p = t(f, at, at + 12) * (1 - t(f, next - 10, next));
  return (
    <div style={{ position: "absolute", left: 70, right: 70, bottom: 120, display: "flex", justifyContent: "center", opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>
      <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 44, lineHeight: 1.25, textAlign: "center", color: dark ? W : INK, background: dark ? "rgba(0,0,0,.28)" : "rgba(255,255,255,.92)", backdropFilter: "blur(12px)", padding: "22px 36px", borderRadius: 36, boxShadow: "0 20px 50px rgba(0,0,0,.12)" }}>{text}</div>
    </div>
  );
};

// A phone screen that crossfades/glides in at `a` and out at `b`.
const Screen = ({ f, a, b = 1e9, children, bg = W }: { f: number; a: number; b?: number; children: ReactNode; bg?: string }) => {
  const p = t(f, a, a + 14) * (1 - t(f, b - 14, b));
  if (p <= 0) return null;
  return <div style={{ position: "absolute", inset: 0, background: bg, opacity: p, transform: `translateX(${(1 - t(f, a, a + 14)) * 80 - t(f, b - 14, b) * 80}px) scale(${0.97 + p * 0.03})` }}>{children}</div>;
};

const Avatar = ({ n, s = 64 }: { n: string; s?: number }) => <Img src={img(n)} style={{ width: s, height: s, borderRadius: 99, objectFit: "cover" }} />;
const Bubble = ({ f, at, me, children, who }: { f: number; at: number; me?: boolean; children: ReactNode; who?: string }) => (
  <div style={{ alignSelf: me ? "flex-end" : "flex-start", display: "flex", gap: 12, alignItems: "flex-end", opacity: t(f, at, at + 10), transform: `translateY(${t(f, at, at + 12, 40, 0)}px) scale(${t(f, at, at + 12, 0.92, 1)})` }}>
    {!me && who && <Avatar n={who} s={52} />}
    <div style={{ background: me ? O : SURF, color: me ? W : INK, padding: "20px 28px", borderRadius: 36, fontFamily: BODY, fontSize: 30, maxWidth: 440 }}>{children}</div>
  </div>
);
const Toast = ({ f, at, until, children }: { f: number; at: number; until: number; children: ReactNode }) => {
  const p = sp(f, at, 12) * (1 - t(f, until - 10, until));
  return <div style={{ position: "absolute", left: 40, right: 40, top: 70, background: INK, color: W, borderRadius: 36, padding: "26px 30px", display: "flex", gap: 18, alignItems: "center", fontFamily: BODY, fontSize: 32, fontWeight: 700, transform: `translateY(${(1 - p) * -260}px)`, opacity: p, zIndex: 5 }}>{children}</div>;
};

/* 1. Map → place → Spotlight */
const MapScene = () => {
  const f = useCurrentFrame();
  const zoom = t(f, 10, 110, 1, 2.4);
  const pins: [number, number, typeof Waves][] = [[180, 360, Utensils], [440, 300, Music2], [330, 560, Utensils], [500, 720, Mountain], [200, 820, Waves]];
  const sheet = sp(f, 126, 16);
  const spot = ["food", "beach2", "resort", "lounge", "p3", "falls", "camp", "beach", "party"];
  return (
    <Scene dur={330} bg={W}>
      <Caption kicker="Discover" title={"Find places\naround you"} />
      <Phone f={f} y={540}>
        <Screen f={f} a={0} b={220} bg={SURF}>
          <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: "330px 560px" }}>
            <svg width="660" height="1300" style={{ position: "absolute" }}>
              {[...Array(14)].map((_, i) => <path key={i} d={`M${-50 + i * 60} 0 L${i * 60 + 120} 1300`} stroke="#ECEAE7" strokeWidth="6" />)}
              <path d="M-20 600 L680 500" stroke={LINE} strokeWidth="38" /><path d="M300 -20 Q340 640 240 1320" stroke={LINE} strokeWidth="32" fill="none" />
              <path d="M0 980 Q220 900 380 990 T680 940 V1300 H0Z" fill={SOFT} />
            </svg>
            {pins.map(([x, y, I], i) => <div key={i} style={{ position: "absolute", left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: 99, background: W, border: `5px solid ${O}`, display: "grid", placeItems: "center", transform: `scale(${sp(f, 16 + i * 6, 9) / zoom * 1.4})`, boxShadow: "0 8px 20px rgba(0,0,0,.2)" }}><I size={30} color={O} /></div>)}
          </div>
          <div style={{ position: "absolute", top: 70, left: 28, right: 28, height: 84, borderRadius: 99, background: W, display: "flex", alignItems: "center", gap: 16, padding: "0 28px", fontFamily: BODY, fontSize: 30, color: MUTED, boxShadow: "0 10px 30px rgba(0,0,0,.12)" }}><Search size={30} />Restaurants near me</div>
          <Tap f={f} at={112} x={330} y={640} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: W, borderRadius: "48px 48px 0 0", transform: `translateY(${(1 - sheet) * 700}px)`, boxShadow: "0 -20px 60px rgba(0,0,0,.18)" }}>
            <Img src={img("food")} style={{ width: "100%", height: 300, objectFit: "cover", WebkitMaskImage: "linear-gradient(#000 60%, transparent)" }} />
            <div style={{ padding: "0 36px 30px", marginTop: -30, fontFamily: BODY }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 52 }}>Kora Terrace Kitchen</div>
              <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 30, color: MUTED, marginTop: 6 }}><Star size={28} fill={O} color={O} /><b style={{ color: INK }}>4.4</b> 158 reviews · 1.2 km</div>
              <div style={{ display: "flex", gap: 0, marginTop: 24, borderBottom: `2px solid ${LINE}`, fontWeight: 700, fontSize: 28 }}>{["Overview", "Reviews", "Spotlight"].map((x, i) => <div key={x} style={{ flex: 1, textAlign: "center", padding: 14, color: i === 2 && f > 190 ? O : MUTED, borderBottom: i === 2 && f > 190 ? `5px solid ${O}` : "5px solid transparent" }}>{x}</div>)}</div>
            </div>
            <Tap f={f} at={186} x={540} y={520} />
          </div>
        </Screen>
        <Screen f={f} a={210}>
          <div style={{ padding: "60px 30px 20px", fontFamily: DISPLAY, fontWeight: 800, fontSize: 40 }}>Spotlight · Kora Terrace</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>{spot.map((n, i) => <div key={i} style={{ position: "relative", opacity: t(f, 216 + i * 3, 228 + i * 3), transform: `scale(${t(f, 216 + i * 3, 230 + i * 3, 0.8, 1)})` }}><Img src={img(n)} style={{ width: "100%", height: 260, objectFit: "cover" }} />{i % 3 === 0 && <Bookmark size={0} />}</div>)}</div>
        </Screen>
      </Phone>
      <Narration lines={[[20, "Search what you're in the mood for"], [118, "Tap a spot to open it"], [200, "Spotlight shows real posts from people who went"]]} />
    </Scene>
  );
};

/* 2. Arrive → scan counter QR → +50 → post food → +25 */
const CheckinScene = () => {
  const f = useCurrentFrame();
  const caption = "Best grilled croaker in PH 🔥 #outsider".slice(0, Math.max(0, Math.round(t(f, 200, 260, 0, 40))));
  return (
    <Scene dur={360} bg={O}>
      <Caption kicker="Check in" title={"Scan at the\ncounter"} color={W} />
      <Phone f={f} y={540}>
        <Screen f={f} a={0} b={120} bg={INK}>
          <Img src={img("food")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.55, filter: "blur(2px)" }} />
          <div style={{ position: "absolute", left: 130, top: 360, width: 400, height: 400, borderRadius: 40, background: W, display: "grid", placeItems: "center", transform: `scale(${t(f, 0, 80, 0.9, 1.05)})` }}><QrCode size={300} color={INK} /></div>
          {[0, 1, 2, 3].map((k) => <div key={k} style={{ position: "absolute", width: 90, height: 90, borderColor: O, borderStyle: "solid", borderWidth: 0, ...[{ left: 100, top: 330, borderLeftWidth: 10, borderTopWidth: 10 }, { right: 100, top: 330, borderRightWidth: 10, borderTopWidth: 10 }, { left: 100, top: 700, borderLeftWidth: 10, borderBottomWidth: 10 }, { right: 100, top: 700, borderRightWidth: 10, borderBottomWidth: 10 }][k], borderRadius: 20 }} />)}
          <div style={{ position: "absolute", left: 140, right: 140, top: 380 + ((f * 10) % 360), height: 6, background: O, boxShadow: `0 0 30px ${O}` }} />
        </Screen>
        <Screen f={f} a={110} b={190}>
          <div style={{ height: "100%", display: "grid", placeItems: "center", textAlign: "center", fontFamily: BODY, padding: 40 }}><div>
            <div style={{ transform: `scale(${sp(f, 112, 9)})` }}><CheckCircle2 size={200} color={O} /></div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 56, marginTop: 20 }}>You're checked in</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 80, color: O }}>+50 tokens</div>
            <div style={{ marginTop: 30, background: O, color: W, borderRadius: 99, padding: "22px 40px", fontWeight: 800, fontSize: 32 }}>Post now for +25</div>
          </div></div>
          <Tap f={f} at={168} x={330} y={890} />
        </Screen>
        <Screen f={f} a={180}>
          <div style={{ padding: "40px 30px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 38 }}>New post<span style={{ background: f > 286 ? INK : O, color: W, borderRadius: 99, padding: "10px 28px", fontSize: 28 }}>{f > 286 ? "Posted" : "Post"}</span></div>
          <div style={{ display: "flex", gap: 16, padding: "0 30px", alignItems: "center", fontFamily: BODY }}><Avatar n="p1" /><div><b style={{ fontSize: 30 }}>ada.obi</b><div style={{ fontSize: 26, color: O, display: "flex", gap: 6, alignItems: "center" }}><MapPin size={24} />Kora Terrace Kitchen</div></div></div>
          <div style={{ padding: "22px 30px", fontFamily: BODY, fontSize: 32, minHeight: 90 }}>{caption}<span style={{ opacity: f % 20 < 10 ? 1 : 0, color: O }}>|</span></div>
          <Img src={img("food")} style={{ width: "100%", height: 640, objectFit: "cover", transform: `scale(${t(f, 182, 200, 1.1, 1)})` }} />
          <Tap f={f} at={282} x={560} y={70} />
          <Toast f={f} at={292} until={360}><Coins size={40} color="#fbbf24" />+25 bonus for posting</Toast>
        </Screen>
      </Phone>
      <Narration dark lines={[[14, "At the venue? Scan the Outsider QR at the counter"], [118, "You're checked in and tokens land instantly"], [196, "Post your food, tag the place"], [290, "And get a bonus for sharing it"]]} />
    </Scene>
  );
};

/* 3. Tokens stack up to 3,000 */
const StackScene = () => {
  const f = useCurrentFrame();
  const items: [string, number][] = [["Checked in · Kora Terrace", 50], ["Posted at Kora Terrace", 25], ["Review approved", 20], ["Checked in · Palmfringe", 50], ["Weekend challenge", 300], ["Friend joined with your link", 100], ["Checked in · Obudu Ridge", 50], ["Monthly streak bonus", 500]];
  const bal = Math.round(t(f, 20, 200, 420, 3000));
  const hit = f > 200;
  return (
    <Scene dur={300} bg={W}>
      <Caption kicker="Your wallet" title={"Every outing\nadds up"} />
      <Phone f={f} y={540}>
        <div style={{ padding: 30, fontFamily: BODY }}>
          <div style={{ borderRadius: 44, background: hit ? `linear-gradient(135deg,#fbbf24,${O},#c026d3)` : O, color: W, padding: 40, position: "relative", overflow: "hidden" }}>
            <div style={{ fontSize: 30, opacity: 0.9 }}>Your tokens</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 150, lineHeight: 1, transform: `scale(${hit ? 1 + (1 - t(f, 200, 230)) * 0.15 : 1})`, transformOrigin: "left" }}>{bal.toLocaleString()}</div>
            {hit && <div style={{ fontWeight: 800, fontSize: 32, opacity: t(f, 206, 220) }}>Milestone unlocked · tickets available</div>}
            {hit && [...Array(12)].map((_, k) => { const p = t(f, 200, 250); const a = (k / 12) * Math.PI * 2; return <Star key={k} size={40} fill={W} color={W} style={{ position: "absolute", right: 120 + Math.cos(a) * p * 220, top: 110 + Math.sin(a) * p * 220, opacity: 1 - p }} />; })}
          </div>
          <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 14 }}>
            {items.map(([l, v], i) => { const at = 22 + i * 22; return (
              <div key={l} style={{ display: "flex", gap: 18, alignItems: "center", background: SURF, borderRadius: 28, padding: "18px 22px", opacity: t(f, at, at + 10), transform: `translateX(${t(f, at, at + 14, 120, 0)}px)` }}>
                <div style={{ width: 56, height: 56, borderRadius: 99, background: SOFT, display: "grid", placeItems: "center" }}><Coins size={30} color={O} /></div>
                <div style={{ flex: 1, fontSize: 28, fontWeight: 600 }}>{l}</div><b style={{ fontFamily: DISPLAY, fontSize: 34, color: O }}>+{v}</b>
              </div>
            ); })}
          </div>
        </div>
      </Phone>
      <Narration lines={[[24, "Check-ins, posts, reviews, invites"], [120, "They all stack up in your wallet"], [205, "Hit 3,000 and the good stuff opens up"]]} />
    </Scene>
  );
};

/* 4. Buy a ticket with tokens → QR → scanned in */
const TicketScene = () => {
  const f = useCurrentFrame();
  const bal = Math.round(t(f, 120, 150, 3000, 500));
  return (
    <Scene dur={330} bg={O}>
      <Caption kicker="Spend" title={"Turn tokens\ninto tickets"} color={W} />
      <Phone f={f} y={540}>
        <Screen f={f} a={0} b={110}>
          <div style={{ padding: "50px 30px 20px", fontFamily: DISPLAY, fontWeight: 800, fontSize: 44 }}>Tickets for you</div>
          {[["party", "Sunset Sessions", "2,500"], ["lounge", "Live at the Lounge", "1,800"], ["falls", "Dawn hike + breakfast", "1,200"]].map(([n, l, c], i) => (
            <div key={l} style={{ margin: "0 30px 20px", borderRadius: 34, overflow: "hidden", display: "flex", border: `3px solid ${i === 0 && f > 80 ? O : LINE}`, opacity: t(f, 6 + i * 8, 20 + i * 8), transform: `translateY(${t(f, 6 + i * 8, 22 + i * 8, 60, 0)}px)` }}>
              <Img src={img(n)} style={{ width: 200, height: 180, objectFit: "cover" }} />
              <div style={{ padding: 22, fontFamily: BODY }}><b style={{ fontFamily: DISPLAY, fontSize: 36 }}>{l}</b><div style={{ display: "flex", gap: 8, alignItems: "center", color: O, fontWeight: 800, fontSize: 30, marginTop: 10 }}><Coins size={28} />{c} tokens</div></div>
            </div>
          ))}
          <Tap f={f} at={80} x={330} y={240} />
        </Screen>
        <Screen f={f} a={100} b={200}>
          <Img src={img("party")} style={{ width: "100%", height: 480, objectFit: "cover", WebkitMaskImage: "linear-gradient(#000 60%, transparent)" }} />
          <div style={{ padding: "0 34px", marginTop: -30, position: "relative", fontFamily: BODY }}>
            <b style={{ fontFamily: DISPLAY, fontSize: 56 }}>Sunset Sessions</b>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 20 }}>{[["Ticket", "2,500 tokens"], ["Max spend", "₦15,000"], ["Spots", "16 of 20 left"], ["Your balance", `${bal.toLocaleString()}`]].map(([k, v]) => <div key={k} style={{ background: SURF, borderRadius: 24, padding: 18 }}><div style={{ fontSize: 22, color: MUTED }}>{k}</div><b style={{ fontSize: 30 }}>{v}</b></div>)}</div>
            <div style={{ marginTop: 24, background: f > 124 ? INK : O, color: W, borderRadius: 99, padding: 24, textAlign: "center", fontWeight: 800, fontSize: 32, display: "flex", gap: 12, justifyContent: "center" }}><Ticket size={34} />{f > 124 ? "Ticket reserved" : "Buy with 2,500 tokens"}</div>
          </div>
          <Tap f={f} at={120} x={330} y={1010} />
        </Screen>
        <Screen f={f} a={190} bg={INK}>
          <div style={{ height: "100%", display: "grid", placeItems: "center", textAlign: "center", color: W, fontFamily: BODY }}><div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 48 }}>Sunset Sessions</div>
            <div style={{ fontSize: 28, opacity: 0.7 }}>Sat 24 Oct · Palmfringe, Lekki</div>
            <div style={{ margin: "40px auto", width: 400, height: 400, borderRadius: 40, background: W, display: "grid", placeItems: "center", transform: `rotate(${(1 - sp(f, 192, 12)) * -12}deg) scale(${sp(f, 192, 12)})` }}>{f > 270 ? <CheckCircle2 size={240} color={O} /> : <QrCode size={300} color={INK} />}</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 52, color: f > 270 ? O : W }}>{f > 270 ? "Welcome in" : "Show this at the door"}</div>
          </div></div>
        </Screen>
      </Phone>
      <Narration dark lines={[[12, "Pick a ticket you can afford with tokens"], [116, "One tap and it's yours"], [196, "Your ticket lives in the app"], [272, "Scanned at the door. You're in."]]} />
    </Scene>
  );
};

/* 5. Share post → add to story */
const StoryScene = () => {
  const f = useCurrentFrame();
  const sheet = sp(f, 40, 16) * (1 - t(f, 100, 112));
  return (
    <Scene dur={230} bg={W}>
      <Caption kicker="Share" title={"Add it to\nyour story"} />
      <Phone f={f} y={540}>
        <Screen f={f} a={0} b={130}>
          <div style={{ display: "flex", gap: 16, padding: "36px 26px", alignItems: "center", fontFamily: BODY }}><Avatar n="p1" /><div><b style={{ fontSize: 30 }}>ada.obi</b><div style={{ fontSize: 24, color: MUTED }}>Kora Terrace Kitchen</div></div></div>
          <Img src={img("food")} style={{ width: "100%", height: 760, objectFit: "cover" }} />
          <div style={{ display: "flex", gap: 26, padding: "22px 26px" }}><Heart size={46} fill="#ef4444" color="#ef4444" /><MessageCircle size={46} /><Send size={42} color={f > 30 ? O : INK} /></div>
          <Tap f={f} at={28} x={200} y={1010} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: W, borderRadius: "44px 44px 0 0", padding: 34, boxShadow: "0 -20px 60px rgba(0,0,0,.2)", transform: `translateY(${(1 - sheet) * 600}px)`, fontFamily: BODY }}>
            <div style={{ width: 80, height: 10, borderRadius: 9, background: LINE, margin: "0 auto 24px" }} />
            <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center", fontSize: 24, fontWeight: 700 }}>
              {[[Sun, "Add to story"], [Send, "Send"], [Users, "Groups"]].map(([I, l], i) => { const Icon = I as typeof Sun; return <div key={l as string}><div style={{ width: 110, height: 110, borderRadius: 99, background: i === 0 ? O : SURF, display: "grid", placeItems: "center", margin: "0 auto 10px" }}><Icon size={50} color={i === 0 ? W : INK} /></div>{l as string}</div>; })}
            </div>
            <Tap f={f} at={92} x={130} y={90} />
          </div>
        </Screen>
        <Screen f={f} a={122} bg={INK}>
          <Img src={img("food")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.05 + (f - 122) / 1200})` }} />
          <div style={{ position: "absolute", top: 30, left: 24, right: 24, height: 8, borderRadius: 9, background: "rgba(255,255,255,.35)" }}><div style={{ height: "100%", borderRadius: 9, background: W, width: `${t(f, 130, 230) * 100}%` }} /></div>
          <div style={{ position: "absolute", top: 60, left: 24, display: "flex", gap: 14, alignItems: "center", color: W, fontFamily: BODY, fontWeight: 700, fontSize: 30 }}><Avatar n="p1" s={60} />Your story</div>
          <div style={{ position: "absolute", left: 60, bottom: 220, background: W, borderRadius: 28, padding: "18px 26px", display: "flex", gap: 12, alignItems: "center", fontFamily: BODY, fontWeight: 800, fontSize: 30, transform: `rotate(-4deg) scale(${sp(f, 140, 10)})` }}><MapPin size={32} color={O} />Kora Terrace Kitchen</div>
        </Screen>
      </Phone>
      <Narration lines={[[20, "Loved it? Share it"], [96, "Add it to your story in one tap"], [150, "Friends see where you went, with the place tagged"]]} />
    </Scene>
  );
};

/* 6. Group chat → poll with locations → preview → vote */
const ChatScene = () => {
  const f = useCurrentFrame();
  const opts: [string, string, number][] = [["Palmfringe Beach Resort", "resort", 3], ["Kora Terrace Kitchen", "food", 1], ["Waveform Water Park", "beach2", 1]];
  const g = t(f, 250, 320);
  const preview = sp(f, 176, 16) * (1 - t(f, 226, 238));
  return (
    <Scene dur={360} bg={O}>
      <Caption kicker="Group chat" title={"Plan the\nweekend together"} color={W} />
      <Phone f={f} y={540}>
        <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", borderBottom: `2px solid ${LINE}`, paddingBottom: 20, fontFamily: BODY }}><div style={{ width: 70, height: 70, borderRadius: 99, background: O, display: "grid", placeItems: "center" }}><Users size={36} color={W} /></div><div><b style={{ fontFamily: DISPLAY, fontSize: 36 }}>Weekend crew</b><div style={{ fontSize: 24, color: MUTED }}>Tunde, Ife, Zara, you</div></div></div>
          <Bubble f={f} at={12} who="p2">We're going out this weekend. Where to?</Bubble>
          <Bubble f={f} at={48} who="p3">No idea 😅 you guys pick a location</Bubble>
          <Bubble f={f} at={84} me>Sending a poll 👇</Bubble>
          <div style={{ alignSelf: "flex-end", width: 520, background: SURF, borderRadius: 36, padding: 22, display: "flex", flexDirection: "column", gap: 12, fontFamily: BODY, opacity: t(f, 110, 122), transform: `translateY(${t(f, 110, 126, 60, 0)}px)` }}>
            <b style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 30 }}><BarChart3 size={30} />Saturday plan?</b>
            {opts.map(([l, n, v], i) => (
              <div key={l} style={{ position: "relative", display: "flex", gap: 14, alignItems: "center", border: `3px solid ${i === 0 && f > 252 ? O : LINE}`, borderRadius: 22, padding: 12, background: W, overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, width: `${(v / 5) * 100 * g}%`, background: SOFT }} />
                <Img src={img(n)} style={{ position: "relative", width: 70, height: 70, borderRadius: 16, objectFit: "cover" }} />
                <span style={{ position: "relative", flex: 1, fontSize: 26, fontWeight: 600 }}>{l}</span><b style={{ position: "relative", fontSize: 28 }}>{Math.round(v * g)}</b>
              </div>
            ))}
          </div>
          <Tap f={f} at={170} x={300} y={1010} />
          <Tap f={f} at={248} x={300} y={1010} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: W, borderRadius: "44px 44px 0 0", boxShadow: "0 -20px 60px rgba(0,0,0,.25)", transform: `translateY(${(1 - preview) * 900}px)` }}>
          <Img src={img("resort")} style={{ width: "100%", height: 360, objectFit: "cover", borderRadius: "44px 44px 0 0", WebkitMaskImage: "linear-gradient(#000 65%, transparent)" }} />
          <div style={{ padding: "0 34px 40px", marginTop: -20, fontFamily: BODY }}><b style={{ fontFamily: DISPLAY, fontSize: 50 }}>Palmfringe Beach Resort</b><div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 28, color: MUTED, marginTop: 6 }}><Star size={28} fill={O} color={O} /><b style={{ color: INK }}>4.6</b> · Pool · Beachfront · Day pass</div></div>
        </div>
      </Phone>
      <Narration dark lines={[[14, "\"We're going out this weekend. Where to?\""], [86, "Drop a poll with real places"], [172, "Tap any option to see the place"], [246, "Everyone votes. Decision made."]]} />
    </Scene>
  );
};

const Outro = () => {
  const f = useCurrentFrame();
  const cards = ["camp", "resort", "party"];
  const end = t(f, 70, 95);
  return (
    <Scene dur={250} bg={W}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {cards.map((s, i) => { const p = sp(f, i * 5, 14); return <Img key={s} src={img(s)} style={{ position: "absolute", width: 440, height: 720, objectFit: "cover", borderRadius: 50, boxShadow: "0 40px 90px rgba(0,0,0,.25)", transform: `translate(${(i - 1) * 300 * p}px, ${-100 + (1 - p) * 300}px) rotate(${(i - 1) * 10 * p}deg) scale(${1 - end * 0.4})`, opacity: 1 - end }} />; })}
        <div style={{ opacity: end, transform: `scale(${0.85 + end * 0.15})`, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center" }}><Pin size={200} /></div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 200, color: INK, letterSpacing: -8, lineHeight: 1 }}>Outsider</div>
          <div style={{ fontFamily: BODY, fontSize: 54, color: O, fontWeight: 700, marginTop: 20, opacity: t(f, 100, 120) }}>Go out more.</div>
          <div style={{ display: "flex", gap: 28, justifyContent: "center", marginTop: 50, fontFamily: BODY, fontSize: 34, color: MUTED, opacity: t(f, 120, 140) }}>
            {[[MapPin, "Places"], [Ticket, "Events"], [Coins, "Rewards"], [Users, "Friends"]].map(([I, l]) => { const Icon = I as typeof MapPin; return <span key={l as string} style={{ display: "flex", gap: 10, alignItems: "center" }}><Icon size={34} color={O} />{l as string}</span>; })}
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// Timeline; each scene overlaps the next by 16 frames for soft crossfades.
const scenes: [number, () => ReactElement][] = [[96, Intro], [330, MapScene], [360, CheckinScene], [300, StackScene], [330, TicketScene], [230, StoryScene], [360, ChatScene], [280, Outro]];
let at = 0;
const timeline = scenes.map(([dur, C]) => { const from = at; at += dur - 16; return [from, dur, C] as const; });
export const TOTAL = at + 16;
export const Promo = () => (
  <AbsoluteFill style={{ background: W }}>
    {timeline.map(([from, dur, C], i) => <Sequence key={i} from={from} durationInFrames={dur}><C /></Sequence>)}
  </AbsoluteFill>
);
