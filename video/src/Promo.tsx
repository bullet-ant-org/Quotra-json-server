import { AbsoluteFill, Easing, Img, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Fonts and photos are bundled in public/ so renders work offline and fast.
const display = "Bricolage", body = "Figtree";
const fontHandle = delayRender("fonts");
Promise.all([new FontFace(display, `url(${staticFile("bricolage.woff2")})`, { weight: "200 800" }), new FontFace(body, `url(${staticFile("figtree.woff2")})`, { weight: "300 900" })].map((f) => f.load().then((x) => document.fonts.add(x))))
  .then(() => continueRender(fontHandle)).catch(() => continueRender(fontHandle));
const O = "#FF5A00", INK = "#242326", W = "#FFFFFF", SOFT = "#FFF0E6", LINE = "#E3E0DC";
const U = (name: string, _w?: number) => staticFile(`${name}.jpg`);
const P = { beach: "beach", resort: "resort", camp: "camp", food: "food", p2: "p2" };

const useSpring = (delay = 0, damping = 14) => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return spring({ frame: f - delay, fps, config: { damping } }); };
const fade = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Pin = ({ size = 160, color = O, hole = W }: { size?: number; color?: string; hole?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"><path d="M16 3a8.5 8.5 0 0 0-8.5 8.5C7.5 18 16 29 16 29s8.5-11 8.5-17.5A8.5 8.5 0 0 0 16 3Z" fill={color} /><circle cx="16" cy="11.5" r="3.2" fill={hole} /></svg>
);

// Big headline that types in word by word.
const Headline = ({ text, color = INK, delay = 0, size = 104 }: { text: string; color?: string; delay?: number; size?: number }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ fontFamily: display, fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: -3, color, textAlign: "center", padding: "0 80px" }}>
      {text.split(" ").map((w, i) => {
        const p = fade(f, delay + i * 4, delay + i * 4 + 10);
        return <span key={i} style={{ display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 40}px)`, marginRight: 22 }}>{w}</span>;
      })}
    </div>
  );
};

const Phone = ({ children, s = 1 }: { children: React.ReactNode; s?: number }) => (
  <div style={{ width: 640, height: 1140, borderRadius: 80, border: `16px solid ${INK}`, background: W, overflow: "hidden", position: "relative", transform: `scale(${s})`, boxShadow: "0 60px 120px rgba(0,0,0,.25)" }}>{children}</div>
);

// 0–3s: pin drops, "Outsider" zooms in on orange.
const Intro = () => {
  const f = useCurrentFrame();
  const drop = useSpring(0, 9), zoom = useSpring(14, 12);
  return (
    <AbsoluteFill style={{ background: O, alignItems: "center", justifyContent: "center", gap: 30 }}>
      <div style={{ transform: `translateY(${(1 - drop) * -500}px)` }}><Pin size={260} color={W} hole={O} /></div>
      <div style={{ fontFamily: display, fontWeight: 800, fontSize: 210, color: W, letterSpacing: -8, transform: `scale(${0.4 + zoom * 0.6})`, opacity: zoom }}>Outsider</div>
      <div style={{ fontFamily: body, fontSize: 48, color: W, opacity: fade(f, 40, 60) * 0.9 }}>Go out more.</div>
    </AbsoluteFill>
  );
};

// Circular wipe from orange to white (or back).
const Wipe = ({ to }: { to: string }) => {
  const f = useCurrentFrame();
  const r = interpolate(f, [0, 24], [0, 2400], { easing: Easing.inOut(Easing.cubic), extrapolateRight: "clamp" });
  return <AbsoluteFill><div style={{ position: "absolute", left: 540 - r, top: 960 - r, width: r * 2, height: r * 2, borderRadius: "50%", background: to }} /></AbsoluteFill>;
};

// 4–9s: map with pins popping + place card.
const MapScene = () => {
  const f = useCurrentFrame();
  const pins = [[150, 300], [420, 220], [300, 520], [480, 640], [180, 760]];
  const card = useSpring(60);
  return (
    <AbsoluteFill style={{ background: W, alignItems: "center", paddingTop: 170, gap: 70 }}>
      <Headline text="Find places worth going" />
      <Phone s={0.95}>
        <svg width="100%" height="100%" viewBox="0 0 640 1140" style={{ position: "absolute", background: "#F5F4F2" }}>
          <path d="M-20 520 L660 440" stroke={LINE} strokeWidth="34" /><path d="M260 -20 Q300 600 220 1160" stroke={LINE} strokeWidth="30" fill="none" /><path d="M-20 260 L500 340" stroke={LINE} strokeWidth="18" />
          <path d="M0 860 Q200 800 360 880 T640 840 V1140 H0Z" fill={SOFT} />
        </svg>
        {pins.map(([x, y], i) => { const s = spring({ frame: f - 12 - i * 7, fps: 30, config: { damping: 9 } }); return <div key={i} style={{ position: "absolute", left: x - 40, top: y - 80, transform: `scale(${s})`, transformOrigin: "bottom" }}><Pin size={80} color={i === 2 ? O : INK} /></div>; })}
        <div style={{ position: "absolute", left: 30, right: 30, bottom: 40, transform: `translateY(${(1 - card) * 400}px)`, background: W, borderRadius: 40, padding: 24, display: "flex", gap: 24, boxShadow: "0 20px 50px rgba(0,0,0,.15)" }}>
          <Img src={U(P.resort, 300)} style={{ width: 150, height: 150, borderRadius: 28, objectFit: "cover" }} />
          <div style={{ fontFamily: body }}><div style={{ fontFamily: display, fontWeight: 800, fontSize: 40, color: INK }}>Palmfringe Resort</div><div style={{ fontSize: 30, color: "#6B6762" }}>⭐ 4.6 · 12 min away</div><div style={{ fontSize: 30, color: O, fontWeight: 700, marginTop: 8 }}>Day pass · 100 tokens</div></div>
        </div>
      </Phone>
    </AbsoluteFill>
  );
};

// 9–14s: post with double-tap like burst.
const FeedScene = () => {
  const f = useCurrentFrame();
  const heart = spring({ frame: f - 55, fps: 30, config: { damping: 8 } });
  const likes = Math.round(interpolate(f, [55, 110], [318, 1204], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill style={{ background: O, alignItems: "center", paddingTop: 170, gap: 70 }}>
      <Headline text="Share where you went" color={W} />
      <Phone s={0.95}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: 24, fontFamily: body }}><Img src={U(P.p2, 120)} style={{ width: 70, height: 70, borderRadius: 99, objectFit: "cover", border: `4px solid ${O}` }} /><div><b style={{ fontSize: 32 }}>tunde_trails</b><div style={{ fontSize: 26, color: "#6B6762" }}>Obudu Ridge Camp</div></div></div>
        <div style={{ position: "relative" }}>
          <Img src={U(P.camp, 700)} style={{ width: "100%", height: 720, objectFit: "cover", transform: `scale(${1 + f / 900})` }} />
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: interpolate(heart, [0, 0.5, 1], [0, 1, 0.85]) * fade(f, 55, 60) * (1 - fade(f, 95, 110)) }}><span style={{ fontSize: 260, transform: `scale(${heart})` }}>❤️</span></div>
        </div>
        <div style={{ padding: "20px 24px", fontFamily: body, fontSize: 32 }}><div style={{ fontSize: 46 }}>{f > 58 ? "❤️" : "🤍"} 💬 ↗️</div><b>{likes.toLocaleString()} likes</b><div style={{ color: "#6B6762" }}>Dawn hike at the ridge ☁️ #outsider</div></div>
      </Phone>
    </AbsoluteFill>
  );
};

// 14–19s: wallet counts up, pass gets claimed.
const TokensScene = () => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [10, 70], [0, 420], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const pass = useSpring(70), claimed = f > 115;
  return (
    <AbsoluteFill style={{ background: W, alignItems: "center", paddingTop: 170, gap: 60 }}>
      <Headline text="Get rewarded for going out" />
      <div style={{ width: 860, borderRadius: 64, background: O, color: W, padding: 56, fontFamily: body, boxShadow: "0 40px 90px rgba(255,90,0,.35)" }}>
        <div style={{ fontSize: 38, opacity: 0.9 }}>Your tokens</div>
        <div style={{ fontFamily: display, fontWeight: 800, fontSize: 220, lineHeight: 1 }}>{n}</div>
        <div style={{ fontSize: 34, opacity: 0.9 }}>+50 checked in at Palmfringe 🌴</div>
      </div>
      <div style={{ width: 860, borderRadius: 48, background: W, border: `3px solid ${LINE}`, overflow: "hidden", display: "flex", transform: `translateX(${(1 - pass) * 1200}px)` }}>
        <div style={{ padding: 40, flex: 1, fontFamily: body }}><div style={{ fontSize: 30, color: "#6B6762" }}>Kora Terrace Kitchen</div><div style={{ fontFamily: display, fontWeight: 800, fontSize: 56 }}>Dinner for one</div>
          <div style={{ marginTop: 18, display: "inline-block", padding: "16px 34px", borderRadius: 99, fontSize: 32, fontWeight: 800, background: claimed ? INK : O, color: W }}>{claimed ? "✓ Pass claimed" : "Use 250 tokens"}</div></div>
        <Img src={U(P.food, 400)} style={{ width: 300, objectFit: "cover" }} />
      </div>
    </AbsoluteFill>
  );
};

// 19–24s: group chat with a location poll filling up.
const ChatScene = () => {
  const f = useCurrentFrame();
  const bubble = (d: number) => ({ opacity: fade(f, d, d + 8), transform: `translateY(${(1 - fade(f, d, d + 8)) * 30}px)` });
  const opts = [["🌴 Palmfringe Resort", 4], ["🍽️ Kora Terrace", 2], ["🎢 Waveform Park", 1]] as const;
  const grow = fade(f, 60, 120);
  return (
    <AbsoluteFill style={{ background: O, alignItems: "center", paddingTop: 170, gap: 70 }}>
      <Headline text="Plan it with friends" color={W} />
      <Phone s={0.95}>
        <div style={{ padding: 28, fontFamily: body, fontSize: 32, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontFamily: display, fontWeight: 800, fontSize: 40, borderBottom: `2px solid ${LINE}`, paddingBottom: 18 }}>👥 Weekend crew</div>
          <div style={{ ...bubble(8), alignSelf: "flex-start", background: "#F5F4F2", padding: "18px 26px", borderRadius: 34 }}>Where are we going Saturday?</div>
          <div style={{ ...bubble(28), alignSelf: "flex-end", background: O, color: W, padding: "18px 26px", borderRadius: 34 }}>Let's vote 👇</div>
          <div style={{ ...bubble(45), background: "#F5F4F2", borderRadius: 34, padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
            <b>📊 Saturday plan?</b>
            {opts.map(([l, v], i) => <div key={l} style={{ position: "relative", border: `3px solid ${i === 0 ? O : LINE}`, borderRadius: 22, padding: "16px 20px", background: W, overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, width: `${(v / 7) * 100 * grow}%`, background: SOFT }} /><div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}><span>{l}</span><b>{Math.round(v * grow)}</b></div></div>)}
          </div>
        </div>
      </Phone>
    </AbsoluteFill>
  );
};

// 24–27s: QR check-in, tokens fly in.
const CheckinScene = () => {
  const f = useCurrentFrame();
  const ok = f > 40, s = useSpring(40, 10);
  const scanY = interpolate(f % 30, [0, 30], [0, 440]);
  return (
    <AbsoluteFill style={{ background: W, alignItems: "center", paddingTop: 200, gap: 80 }}>
      <Headline text="Scan. Check in. Earn." />
      <div style={{ width: 560, height: 560, borderRadius: 60, border: `14px solid ${INK}`, display: "grid", placeItems: "center", position: "relative", overflow: "hidden", background: W }}>
        {!ok ? <>
          <svg width="420" height="420" viewBox="0 0 21 21">{Array.from({ length: 441 }).map((_, i) => { const x = i % 21, y = Math.floor(i / 21); const on = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13) ? !(x % 6 && y % 6 && x !== 20 && y !== 20) || ((x % 7 > 1 && x % 7 < 5) && (y % 7 > 1 && y % 7 < 5)) : (x * 7 + y * 13) % 3 === 0; return on ? <rect key={i} x={x} y={y} width="1" height="1" fill={INK} /> : null; })}</svg>
          <div style={{ position: "absolute", left: 40, right: 40, top: 60 + scanY, height: 8, background: O, boxShadow: `0 0 30px ${O}` }} />
        </> : <div style={{ transform: `scale(${s})`, textAlign: "center", fontFamily: display }}><div style={{ fontSize: 200 }}>✅</div><div style={{ fontSize: 64, fontWeight: 800, color: O }}>+50 tokens</div></div>}
      </div>
      <div style={{ fontFamily: body, fontSize: 40, color: "#6B6762", opacity: fade(f, 50, 65) }}>Post about it for +25 more</div>
    </AbsoluteFill>
  );
};

// 27–30s: logo outro on white.
const Outro = () => {
  const f = useCurrentFrame();
  const s = useSpring(0, 12);
  return (
    <AbsoluteFill style={{ background: W, alignItems: "center", justifyContent: "center", gap: 20 }}>
      <div style={{ transform: `scale(${s})` }}><Pin size={220} /></div>
      <div style={{ fontFamily: display, fontWeight: 800, fontSize: 190, color: INK, letterSpacing: -7, opacity: s }}>Outsider</div>
      <div style={{ fontFamily: body, fontSize: 52, color: O, fontWeight: 700, opacity: fade(f, 20, 40) }}>Go out more.</div>
      <div style={{ fontFamily: body, fontSize: 36, color: "#6B6762", opacity: fade(f, 35, 55), marginTop: 30 }}>Places · Events · Rewards · Friends</div>
    </AbsoluteFill>
  );
};

export const Promo = () => (
  <AbsoluteFill style={{ background: W }}>
    <Sequence durationInFrames={105}><Intro /></Sequence>
    <Sequence from={90} durationInFrames={30}><Wipe to={W} /></Sequence>
    <Sequence from={120} durationInFrames={150}><MapScene /></Sequence>
    <Sequence from={270} durationInFrames={150}><FeedScene /></Sequence>
    <Sequence from={420} durationInFrames={150}><TokensScene /></Sequence>
    <Sequence from={570} durationInFrames={150}><ChatScene /></Sequence>
    <Sequence from={720} durationInFrames={90}><CheckinScene /></Sequence>
    <Sequence from={810} durationInFrames={90}><Outro /></Sequence>
  </AbsoluteFill>
);
