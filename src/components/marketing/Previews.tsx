// Static, server-rendered product previews for the landing page (no chart JS needed).
import { Home, TrendingUp } from "lucide-react";
import { Pitch } from "../Pitch";

const AXES = [
  { k: "PAC", v: 8.4, p: 7.2 },
  { k: "SHO", v: 7.1, p: 6.0 },
  { k: "PAS", v: 6.2, p: 5.4 },
  { k: "DRI", v: 7.0, p: 6.5 },
  { k: "DEF", v: 5.2, p: 4.1 },
  { k: "PHY", v: 8.0, p: 7.3 },
];

export function StaticRadar({ size = 220 }: { size?: number }) {
  const c = size / 2;
  const r = size * 0.36;
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / AXES.length - Math.PI / 2;
    return [c + Math.cos(a) * r * (v / 10), c + Math.sin(a) * r * (v / 10)];
  };
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full" role="img" aria-label="Example performance radar">
      {[2.5, 5, 7.5, 10].map((l) => (
        <polygon key={l} points={poly(AXES.map(() => l))} fill="none" stroke="rgba(255,255,255,0.09)" />
      ))}
      {AXES.map((_, i) => {
        const [x, y] = pt(i, 10);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="rgba(255,255,255,0.09)" />;
      })}
      <polygon points={poly(AXES.map((a) => a.p))} fill="none" stroke="#93a1cc" strokeDasharray="4 4" strokeWidth="1.2" />
      <polygon points={poly(AXES.map((a) => a.v))} fill="rgba(255,106,19,0.22)" stroke="#ff6a13" strokeWidth="2.5" strokeLinejoin="round" />
      {AXES.map((a, i) => {
        const [x, y] = pt(i, a.v);
        const [lx, ly] = pt(i, 12.6);
        return (
          <g key={a.k}>
            <circle cx={x} cy={y} r="3" fill="#ff6a13" />
            <text x={lx} y={ly + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#f4f7ff">{a.k}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[640px]">
      <div className="pointer-events-none absolute -inset-10 rounded-[3rem] bg-[radial-gradient(closest-side,rgba(47,91,255,0.35),transparent)] blur-2xl" />

      {/* Laptop-style report card */}
      <div className="relative rounded-[1.6rem] border border-line-strong bg-navy/90 p-2 shadow-[0_40px_120px_-30px_rgba(47,91,255,0.55)]">
        <div className="rounded-[1.2rem] bg-night p-4 sm:p-5">
          <div className="mb-4 flex items-end justify-between gap-2">
            <div>
              <p className="eyebrow !text-[0.55rem]">Riverside Athletic · U14 Falcons</p>
              <p className="display text-2xl sm:text-3xl">Leo <span className="text-volt">Bennett</span></p>
            </div>
            <div className="text-right">
              <p className="eyebrow !text-[0.55rem]">Overall</p>
              <p className="display num text-3xl not-italic text-volt sm:text-4xl">6.6</p>
            </div>
          </div>
          <div className="grid grid-cols-[0.7fr_1fr] gap-3">
            <div className="panel-flat flex items-center justify-center p-2">
              <Pitch primary="ST" secondary="CDM" className="h-[150px] w-auto sm:h-[180px]" />
            </div>
            <div className="panel-flat p-2">
              <p className="eyebrow mb-1 px-1 !text-[0.55rem]">Performance DNA</p>
              <div className="mx-auto aspect-square max-h-[170px]"><StaticRadar /></div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { l: "Strongest", t: "Physical", c: "bg-royal", tc: "text-royal-soft", w: "82%" },
              { l: "Monitor", t: "Technical", c: "bg-volt", tc: "text-volt", w: "62%" },
              { l: "Needs focus", t: "Tactical", c: "bg-alert", tc: "text-alert", w: "48%" },
            ].map((x) => (
              <div key={x.l} className="panel-flat p-2.5">
                <p className={`text-[0.55rem] font-extrabold uppercase tracking-[0.14em] ${x.tc}`}>{x.l}</p>
                <p className="text-xs font-semibold">{x.t}</p>
                <div className="mt-1.5 h-1 rounded-full bg-white/10"><div className={`h-1 rounded-full ${x.c}`} style={{ width: x.w }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating phone card */}
      <div className="absolute -bottom-10 -right-2 hidden w-[210px] rotate-[3deg] rounded-[1.6rem] border border-line-strong bg-navy p-1.5 shadow-2xl sm:block md:-right-10">
        <div className="rounded-[1.25rem] bg-night p-3.5">
          <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.14em] text-volt">This week at home</p>
          <ul className="mt-2 space-y-1.5">
            {["Shoulder Check Colours", "Corners of the Goal", "Weak Foot Week"].map((d, i) => (
              <li key={d} className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-2 py-1.5 text-[0.7rem]">
                <Home size={11} className="text-royal-soft" />
                <span className="flex-1 truncate">{d}</span>
                <span className="num text-mute">{3 - (i % 2)}x</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.55rem] font-extrabold uppercase tracking-[0.14em] text-mute">Scanning goal</p>
          <div className="mt-1 flex items-center gap-2 text-[0.65rem]">
            <span className="num text-mute">3</span>
            <div className="h-1.5 flex-1 rounded-full bg-white/10"><div className="h-1.5 w-1/2 rounded-full bg-volt" /></div>
            <span className="num font-bold">7/10</span>
          </div>
        </div>
      </div>

      {/* Floating improvement chip */}
      <div className="absolute -left-3 top-1/3 hidden items-center gap-2 rounded-full border border-royal/40 bg-navy/95 px-3 py-2 text-xs font-bold shadow-xl backdrop-blur sm:flex md:-left-10">
        <TrendingUp size={14} className="text-royal-soft" /> +0.9 since pre-season
      </div>
    </div>
  );
}

export function ProgressPreview() {
  const pts = [4.9, 5.3, 5.7, 6.6];
  const tac = [3.9, 4.2, 4.6, 5.2];
  const W = 320;
  const H = 150;
  const x = (i: number) => 20 + (i * (W - 40)) / (pts.length - 1);
  const y = (v: number) => H - 20 - ((v - 3) / 5) * (H - 40);
  const path = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Example progress chart rising over four evaluations">
      {[4, 5, 6, 7].map((g) => <line key={g} x1="20" x2={W - 20} y1={y(g)} y2={y(g)} stroke="rgba(255,255,255,0.07)" />)}
      <path d={`${path(pts)} L${x(3)},${H - 20} L${x(0)},${H - 20} Z`} fill="url(#pg)" opacity=".5" />
      <defs><linearGradient id="pg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#ff6a13" stopOpacity=".5" /><stop offset="1" stopColor="#ff6a13" stopOpacity="0" /></linearGradient></defs>
      <path d={path(tac)} fill="none" stroke="#6f8dff" strokeWidth="2" strokeDasharray="5 4" />
      <path d={path(pts)} fill="none" stroke="#ff6a13" strokeWidth="3" strokeLinecap="round" />
      {pts.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="4" fill="#ff6a13" />)}
      {["Jan", "May", "Aug", "Oct"].map((m, i) => <text key={m} x={x(i)} y={H - 4} textAnchor="middle" fontSize="10" fill="#93a1cc">{m}</text>)}
    </svg>
  );
}
