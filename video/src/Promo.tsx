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
  const inP = t(f, 0, 14), outP = t(f, dur - 14, dur);
  return (
    <AbsoluteFill style={{ background: bg, opacity: inP * (1 - outP), filter: `blur(${(1 - inP) * 18 + outP * 18}px)`, transform: `scale(${1.08 - inP * 0.08 + outP * 0.06})` }}>
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

const MapScene = () => {
  const f = useCurrentFrame();
  const zoom = t(f, 10, 120, 1, 2.6), pan = t(f, 10, 120);
  const pins: [number, number, typeof Waves][] = [[180, 360, Utensils], [440, 300, Music2], [330, 560, Waves], [500, 720, Mountain], [200, 820, Utensils]];
  const sheet = sp(f, 132, 16);
  return (
    <Scene dur={210} bg={W}>
      <Caption kicker="Discover" title={"Find places\naround you"} />
      <Phone f={f} y={560}>
        <div style={{ position: "absolute", inset: 0, background: SURF, transform: `scale(${zoom}) translate(${-pan * 40}px, ${-pan * 60}px)`, transformOrigin: "330px 560px" }}>
          <svg width="660" height="1300" style={{ position: "absolute" }}>
            {[...Array(14)].map((_, i) => <path key={i} d={`M${-50 + i * 60} 0 L${i * 60 + 120} 1300`} stroke="#ECEAE7" strokeWidth="6" />)}
            <path d="M-20 600 L680 500" stroke={LINE} strokeWidth="38" /><path d="M300 -20 Q340 640 240 1320" stroke={LINE} strokeWidth="32" fill="none" />
            <path d="M0 980 Q220 900 380 990 T680 940 V1300 H0Z" fill={SOFT} /><circle cx="120" cy="200" r="90" fill="#E7F3E5" />
          </svg>
          {pins.map(([x, y, I], i) => { const s = sp(f, 18 + i * 6, 9); const hit = i === 2; return (
            <div key={i} style={{ position: "absolute", left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: 99, background: W, border: `5px solid ${hit && f > 118 ? INK : O}`, display: "grid", placeItems: "center", transform: `scale(${s / zoom * 1.4})`, boxShadow: "0 8px 20px rgba(0,0,0,.2)" }}><I size={30} color={O} /></div>
          ); })}
        </div>
        <div style={{ position: "absolute", top: 70, left: 28, right: 28, height: 84, borderRadius: 99, background: W, display: "flex", alignItems: "center", gap: 16, padding: "0 28px", fontFamily: BODY, fontSize: 30, color: MUTED, boxShadow: "0 10px 30px rgba(0,0,0,.12)" }}><Search size={30} />Beaches near me</div>
        <Tap f={f} at={116} x={330} y={640} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: W, borderRadius: "48px 48px 0 0", transform: `translateY(${(1 - sheet) * 700}px)`, boxShadow: "0 -20px 60px rgba(0,0,0,.18)" }}>
          <Img src={img("resort")} style={{ width: "100%", height: 300, objectFit: "cover", WebkitMaskImage: "linear-gradient(#000 60%, transparent)" }} />
          <div style={{ padding: "0 36px 40px", marginTop: -30, fontFamily: BODY }}>
            <div style={{ fontWeight: 700, fontSize: 24, letterSpacing: 2, color: O }}>RESORT</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 52, color: INK }}>Palmfringe Beach Resort</div>
            <div style={{ display: "flex", gap: 22, alignItems: "center", fontSize: 30, color: MUTED, marginTop: 8 }}><Star size={28} fill={O} color={O} /><b style={{ color: INK }}>4.6</b> 212 reviews · 2.4 km</div>
          </div>
        </div>
      </Phone>
    </Scene>
  );
};

const RouteScene = () => {
  const f = useCurrentFrame();
  const draw = t(f, 20, 110);
  const path = "M140 1080 C 160 900, 300 880, 320 760 S 480 560, 520 360";
  return (
    <Scene dur={170} bg={W}>
      <Caption kicker="Directions" title={"Get there,\nright in the app"} />
      <Phone f={f} y={560}>
        <div style={{ position: "absolute", inset: 0, background: SURF }}>
          <svg width="660" height="1300" style={{ position: "absolute" }}>
            {[...Array(14)].map((_, i) => <path key={i} d={`M0 ${i * 100} L660 ${i * 100 + 60}`} stroke="#ECEAE7" strokeWidth="8" />)}
            <path d={path} fill="none" stroke={O} strokeWidth="18" strokeLinecap="round" strokeDasharray="1400" strokeDashoffset={1400 * (1 - draw)} />
            <circle cx="140" cy="1080" r="22" fill="#2563eb" stroke={W} strokeWidth="8" />
          </svg>
          <div style={{ position: "absolute", left: 488, top: 290, transform: `scale(${sp(f, 100, 10)})` }}><Pin size={70} /></div>
        </div>
        <div style={{ position: "absolute", left: 28, right: 28, top: 70, borderRadius: 36, background: O, color: W, padding: 30, fontFamily: BODY, display: "flex", gap: 20, alignItems: "center", transform: `translateY(${t(f, 30, 50, -300, 0)}px)` }}>
          <Navigation size={52} /><div><div style={{ fontSize: 26, opacity: 0.85 }}>In 400 m</div><div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 40 }}>Turn right onto Garrison Rd</div></div>
        </div>
        <div style={{ position: "absolute", left: 28, right: 28, bottom: 40, borderRadius: 36, background: W, padding: "26px 32px", fontFamily: BODY, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 20px 50px rgba(0,0,0,.15)", transform: `translateY(${t(f, 60, 80, 300, 0)}px)` }}>
          <div><div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 64, color: O }}>{Math.max(7, Math.round(t(f, 60, 110, 18, 7)))} min</div><div style={{ fontSize: 28, color: MUTED }}>6.0 km · Drive</div></div>
          <div style={{ background: INK, color: W, borderRadius: 99, padding: "18px 36px", fontWeight: 800, fontSize: 30 }}>Start</div>
        </div>
      </Phone>
    </Scene>
  );
};

const PostScene = () => {
  const f = useCurrentFrame();
  const heart = sp(f, 60, 8);
  const stat = (to: number) => t(f, 66, 150, 0, to);
  const stats: [typeof Eye, number][] = [[Eye, stat(12400)], [Heart, stat(1204)], [MessageCircle, stat(86)], [Bookmark, stat(210)], [Send, stat(64)]];
  const c = sp(f, 150, 16);
  return (
    <Scene dur={240} bg={O}>
      <Caption kicker="Share" title={"Post where\nyou went"} color={W} />
      <Phone f={f} y={560}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "28px 26px", fontFamily: BODY }}>
          <div style={{ padding: 4, borderRadius: 99, background: `linear-gradient(45deg,#fbbf24,${O},#c026d3)` }}><Img src={img("p2")} style={{ width: 70, height: 70, borderRadius: 99, objectFit: "cover", border: "4px solid white" }} /></div>
          <div><b style={{ fontSize: 30 }}>tunde_trails</b><div style={{ fontSize: 24, color: MUTED }}>Obudu Ridge Camp</div></div>
        </div>
        <div style={{ position: "relative", height: 800, overflow: "hidden" }}>
          <Img src={img("camp")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.15 - f / 1400})` }} />
          <Tap f={f} at={56} x={330} y={400} />
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: t(f, 58, 62) * (1 - t(f, 92, 108)) }}><Heart size={300} fill={W} color={W} style={{ transform: `scale(${heart})`, filter: "drop-shadow(0 10px 30px rgba(0,0,0,.3))" }} /></div>
          <div style={{ position: "absolute", top: 24, right: 24, background: "rgba(0,0,0,.55)", color: W, borderRadius: 99, padding: "6px 16px", fontFamily: BODY, fontSize: 24, fontWeight: 700 }}>1/6</div>
        </div>
        <div style={{ display: "flex", gap: 26, padding: "22px 26px 6px" }}><Heart size={46} fill={f > 60 ? "#ef4444" : "none"} color={f > 60 ? "#ef4444" : INK} /><MessageCircle size={46} /><Send size={42} /><Bookmark size={42} style={{ marginLeft: "auto" }} /></div>
        <div style={{ display: "flex", gap: 24, padding: "10px 26px", fontFamily: BODY, fontSize: 28, color: MUTED }}>{stats.map(([I, v], i) => <span key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}><I size={26} />{fmt(v)}</span>)}</div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 520, background: W, borderRadius: "44px 44px 0 0", boxShadow: "0 -20px 60px rgba(0,0,0,.2)", transform: `translateY(${(1 - c) * 600}px)`, padding: 32, fontFamily: BODY }}>
          <div style={{ width: 80, height: 10, borderRadius: 9, background: LINE, margin: "0 auto 18px" }} />
          <div style={{ textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 34, marginBottom: 20 }}>Comments</div>
          {[["p3", "ife.eats", "Adding this to my list 😍"], ["p1", "zaraoutside", "Going this weekend!"], ["p2", "chidi.eze", "That view though"]].map(([a, u, txt], i) => (
            <div key={u} style={{ display: "flex", gap: 18, marginBottom: 24, opacity: t(f, 162 + i * 10, 172 + i * 10), transform: `translateX(${t(f, 162 + i * 10, 176 + i * 10, 60, 0)}px)` }}><Img src={img(a)} style={{ width: 60, height: 60, borderRadius: 99, objectFit: "cover" }} /><div style={{ fontSize: 28 }}><b>{u}</b><div>{txt}</div></div></div>
          ))}
        </div>
      </Phone>
    </Scene>
  );
};

const StoriesScene = () => {
  const f = useCurrentFrame();
  const open = sp(f, 70, 14);
  const people = [["p3", "beach2", "ife.eats"], ["p2", "falls", "tunde"], ["p1", "lounge", "zara"], ["p3", "food", "musa"]];
  return (
    <Scene dur={190} bg={W}>
      <Caption kicker="Stories & highlights" title={"Moments\nthat stay"} />
      <Phone f={f} y={560}>
        <div style={{ display: "flex", gap: 22, padding: "40px 26px" }}>
          {people.map(([a, s, n], i) => { const p = sp(f, 8 + i * 6, 12); return (
            <div key={n} style={{ textAlign: "center", fontFamily: BODY, fontSize: 22, transform: `scale(${p})` }}><div style={{ padding: 5, borderRadius: 99, background: `conic-gradient(#fbbf24, ${O}, #c026d3, #fbbf24)`, transform: `rotate(${f * 2}deg)` }}><Img src={img(s)} style={{ width: 120, height: 120, borderRadius: 99, objectFit: "cover", border: "5px solid white", transform: `rotate(${-f * 2}deg)` }} /></div>{n}</div>
          ); })}
        </div>
        <div style={{ padding: "0 26px", fontFamily: DISPLAY, fontWeight: 800, fontSize: 34 }}>Highlights</div>
        <div style={{ display: "flex", gap: 26, padding: "18px 26px" }}>{[["camp", "Obudu"], ["beach", "Beaches"], ["food", "Food"], ["party", "Nights"]].map(([s, n], i) => <div key={n} style={{ textAlign: "center", fontFamily: BODY, fontSize: 22, opacity: t(f, 30 + i * 5, 44 + i * 5) }}><Img src={img(s)} style={{ width: 110, height: 110, borderRadius: 99, objectFit: "cover", border: `3px solid ${LINE}`, padding: 4 }} />{n}</div>)}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginTop: 20 }}>{["beach", "resort", "camp", "food", "falls", "beach2"].map((s, i) => <Img key={i} src={img(s)} style={{ width: "100%", height: 210, objectFit: "cover", opacity: t(f, 40 + i * 4, 54 + i * 4) }} />)}</div>
        <div style={{ position: "absolute", inset: 0, clipPath: `circle(${open * 150}% at 15% 12%)` }}>
          <Img src={img("beach2")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.1 + (f - 70) / 900})` }} />
          <div style={{ position: "absolute", top: 30, left: 24, right: 24, display: "flex", gap: 8 }}>{[0, 1, 2].map((k) => <div key={k} style={{ flex: 1, height: 8, borderRadius: 9, background: "rgba(255,255,255,.35)", overflow: "hidden" }}><div style={{ height: "100%", background: W, width: `${k === 0 ? t(f, 80, 180) * 100 : 0}%` }} /></div>)}</div>
          <div style={{ position: "absolute", bottom: 40, left: 24, right: 24, display: "flex", gap: 20, alignItems: "center" }}><div style={{ flex: 1, border: "3px solid rgba(255,255,255,.7)", borderRadius: 99, padding: "18px 26px", color: W, fontFamily: BODY, fontSize: 28 }}>Reply to ife.eats…</div><Heart size={50} color={W} /><Send size={46} color={W} /></div>
        </div>
      </Phone>
    </Scene>
  );
};

const RewardsScene = () => {
  const f = useCurrentFrame();
  const scanned = f > 50;
  const bal = t(f, 60, 110, 370, 420);
  const bar = t(f, 120, 200, 0.042, 0.62);
  return (
    <Scene dur={230} bg={O}>
      <Caption kicker="Rewards" title={"Go out.\nGet rewarded."} color={W} />
      <Phone f={f} y={560}>
        <div style={{ padding: 30, fontFamily: BODY }}>
          <div style={{ height: 420, borderRadius: 40, background: INK, display: "grid", placeItems: "center", position: "relative", overflow: "hidden" }}>
            {!scanned ? <><QrCode size={260} color={W} /><div style={{ position: "absolute", left: 80, right: 80, top: 60 + ((f * 9) % 300), height: 6, background: O, boxShadow: `0 0 30px ${O}` }} /></>
              : <div style={{ textAlign: "center", color: W, transform: `scale(${sp(f, 50, 9)})` }}><CheckCircle2 size={150} color={O} /><div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 52 }}>+50 tokens</div></div>}
          </div>
          {[0, 1, 2, 3, 4].map((k) => { const p = t(f, 56 + k * 4, 86 + k * 4); return p > 0 && p < 1 ? <Coins key={k} size={56} color="#fbbf24" style={{ position: "absolute", left: 300 + k * 30 - p * 140, top: 380 + Math.sin(p * Math.PI) * -260 + p * 280 }} /> : null; })}
          <div style={{ marginTop: 26, borderRadius: 40, background: O, color: W, padding: 34 }}><div style={{ fontSize: 28, opacity: 0.9 }}>Your tokens</div><div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 130, lineHeight: 1 }}>{Math.round(bal)}</div></div>
          <div style={{ marginTop: 26, borderRadius: 40, overflow: "hidden", position: "relative", color: W, transform: `translateY(${t(f, 110, 134, 400, 0)}px)` }}>
            <Img src={img("beach2")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "relative", padding: 30, background: "linear-gradient(135deg, rgba(251,191,36,.85), rgba(255,90,0,.85), rgba(192,38,211,.85))" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 24, fontWeight: 700 }}><Sun size={28} />SUMMER TOP REWARD · 2 SPOTS</div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 52, display: "flex", gap: 14, alignItems: "center" }}><Plane size={46} />2 weeks in Zanzibar</div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 40 }}>10,000 tokens</div>
              <div style={{ height: 14, borderRadius: 9, background: "rgba(255,255,255,.35)", marginTop: 14 }}><div style={{ height: "100%", width: `${bar * 100}%`, borderRadius: 9, background: W }} /></div>
            </div>
          </div>
        </div>
      </Phone>
    </Scene>
  );
};

const ChatScene = () => {
  const f = useCurrentFrame();
  const b = (d: number) => ({ opacity: t(f, d, d + 10), transform: `translateY(${t(f, d, d + 12, 40, 0)}px) scale(${t(f, d, d + 12, 0.9, 1)})` });
  const opts: [string, number][] = [["Palmfringe Beach Resort", 5], ["Kora Terrace Kitchen", 2], ["Waveform Water Park", 1]];
  const g = t(f, 70, 150);
  return (
    <Scene dur={200} bg={W}>
      <Caption kicker="Group chat" title={"Plan it\ntogether"} />
      <Phone f={f} y={560}>
        <div style={{ padding: 30, fontFamily: BODY, fontSize: 30, display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", borderBottom: `2px solid ${LINE}`, paddingBottom: 22 }}><div style={{ width: 70, height: 70, borderRadius: 99, background: O, display: "grid", placeItems: "center" }}><Users size={36} color={W} /></div><div><b style={{ fontFamily: DISPLAY, fontSize: 36 }}>Weekend crew</b><div style={{ fontSize: 24, color: MUTED }}>4 members</div></div></div>
          <div style={{ ...b(10), alignSelf: "flex-start", background: SURF, padding: "20px 28px", borderRadius: 36 }}>Where are we going Saturday?</div>
          <div style={{ ...b(30), alignSelf: "flex-end", background: O, color: W, padding: "20px 28px", borderRadius: 36 }}>Let's vote</div>
          <div style={{ ...b(48), background: SURF, borderRadius: 36, padding: 26, display: "flex", flexDirection: "column", gap: 16 }}>
            <b style={{ display: "flex", gap: 12, alignItems: "center" }}><BarChart3 size={32} />Saturday plan?</b>
            {opts.map(([l, v], i) => <div key={l} style={{ position: "relative", border: `3px solid ${i === 0 ? O : LINE}`, borderRadius: 22, padding: "18px 22px", background: W, overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, width: `${(v / 8) * 100 * g}%`, background: SOFT }} /><div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ display: "flex", gap: 10, alignItems: "center" }}><MapPin size={26} color={O} />{l}</span><b>{Math.round(v * g)}</b></div></div>)}
          </div>
          <div style={{ ...b(150), alignSelf: "flex-start", background: SURF, borderRadius: 36, overflow: "hidden", width: 400 }}><Img src={img("resort")} style={{ width: "100%", height: 170, objectFit: "cover" }} /><div style={{ padding: 18 }}><b>Palmfringe it is</b><div style={{ fontSize: 24, color: MUTED }}>Tap for directions</div></div></div>
        </div>
      </Phone>
    </Scene>
  );
};

const EventsScene = () => {
  const f = useCurrentFrame();
  const left = f > 120 ? 16 : 17;
  const ticket = sp(f, 110, 12);
  return (
    <Scene dur={180} bg={O}>
      <Caption kicker="Events" title={"Get into the\nbest nights"} color={W} />
      <Phone f={f} y={560}>
        <Img src={img("party")} style={{ width: "100%", height: 520, objectFit: "cover", WebkitMaskImage: "linear-gradient(#000 60%, transparent)", transform: `scale(${1.1 - f / 1800})` }} />
        <div style={{ padding: "0 34px", marginTop: -40, position: "relative", fontFamily: BODY }}>
          <div style={{ display: "inline-flex", gap: 10, alignItems: "center", background: O, color: W, borderRadius: 99, padding: "8px 20px", fontSize: 24, fontWeight: 700 }}><Coins size={24} />Sponsored · 200 tokens</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 56, marginTop: 14 }}>Sunset Sessions</div>
          <div style={{ fontSize: 28, color: MUTED }}>Sat 24 Oct · Palmfringe, Lekki</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 22 }}>{[["Max spend", "₦15,000"], ["Spots left", `${left} of 20`]].map(([k, v]) => <div key={k} style={{ background: SURF, borderRadius: 24, padding: 20 }}><div style={{ fontSize: 22, color: MUTED }}>{k}</div><b style={{ fontSize: 32 }}>{v}</b></div>)}</div>
          <div style={{ marginTop: 24, background: f > 100 ? INK : O, color: W, borderRadius: 99, padding: 24, textAlign: "center", fontWeight: 800, fontSize: 32, display: "flex", gap: 12, justifyContent: "center" }}><Ticket size={34} />{f > 100 ? "Reserved" : "Reserve for 200 tokens"}</div>
          <Tap f={f} at={96} x={300} y={420} />
        </div>
        <div style={{ position: "absolute", left: 60, right: 60, bottom: 60, background: W, borderRadius: 40, padding: 30, textAlign: "center", boxShadow: "0 30px 80px rgba(0,0,0,.3)", transform: `translateY(${(1 - ticket) * 800}px) rotate(${(1 - ticket) * -8}deg)` }}><QrCode size={220} color={INK} /><div style={{ fontFamily: BODY, fontSize: 26, color: MUTED }}>Show at the door</div></div>
      </Phone>
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

// 60s timeline; each scene overlaps the next by 14 frames for seamless blur-zoom crossfades.
const scenes: [number, () => ReactElement][] = [[96, Intro], [236, MapScene], [180, RouteScene], [270, PostScene], [200, StoriesScene], [250, RewardsScene], [210, ChatScene], [190, EventsScene], [280, Outro]];
let at = 0;
const timeline = scenes.map(([dur, C]) => { const from = at; at += dur - 14; return [from, dur, C] as const; });
export const TOTAL = at + 14;
export const Promo = () => (
  <AbsoluteFill style={{ background: W }}>
    {timeline.map(([from, dur, C], i) => <Sequence key={i} from={from} durationInFrames={dur}><C /></Sequence>)}
  </AbsoluteFill>
);
