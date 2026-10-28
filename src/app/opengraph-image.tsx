import { ImageResponse } from "next/og";

// The preview picture shown when pitchpathsoccer.com is shared in messages and social posts.
export const alt = "PitchPath: player development for soccer clubs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#fff",
          background: "radial-gradient(70% 90% at 85% 100%, rgba(255,106,19,0.55), transparent), linear-gradient(135deg, #081230 0%, #040919 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <svg width="88" height="88" viewBox="0 0 40 40">
            <rect x="1" y="1" width="38" height="38" rx="10" fill="#2f5bff" />
            <path d="M1 20h38" stroke="#fff" strokeOpacity=".18" strokeWidth="1.2" />
            <circle cx="20" cy="20" r="6" fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="1.2" />
            <path d="M8 31 C 15 31, 15 22, 21 21 S 27 12, 30 10" fill="none" stroke="#ff6a13" strokeWidth="3.6" strokeLinecap="round" />
            <circle cx="30.5" cy="9.5" r="4" fill="#fff" />
            <circle cx="30.5" cy="9.5" r="1.4" fill="#081230" />
          </svg>
          <div style={{ display: "flex", fontSize: 54, fontWeight: 800, fontStyle: "italic", letterSpacing: -1 }}>
            <span>PITCH</span>
            <span style={{ color: "#ff6a13" }}>PATH</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>Give every player a path.</div>
          <div style={{ display: "flex", fontSize: 34, color: "rgba(255,255,255,0.78)", maxWidth: 960 }}>
            Evaluations, development plans and progress tracking for soccer clubs, coaches, parents and players.
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#ff6a13", fontWeight: 700 }}>pitchpathsoccer.com</div>
      </div>
    ),
    size,
  );
}
