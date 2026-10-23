import { Document, Page, Text, View, StyleSheet, Svg, Polygon, Line, Circle, Path, Rect, G } from "@react-pdf/renderer";
import type { PlayerReport } from "../player-data";
import { goalProgress } from "../analytics";
import { POSITION_BY_KEY, SKILLS, SKILL_BY_KEY } from "../skills";
import { fmtDate, fmtHeight } from "../format";

const NAVY = "#081230";
const ROYAL = "#2f5bff";
const VOLT = "#ff6a13";
const INK = "#0b1230";
const MUTE = "#5d6a96";
const LINE = "#e3e8f7";
const RED = "#e8385a";

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: INK, paddingBottom: 40 },
  header: { backgroundColor: NAVY, color: "white", paddingHorizontal: 32, paddingTop: 20, paddingBottom: 16 },
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  brand: { fontFamily: "Helvetica-BoldOblique", fontSize: 13 },
  club: { fontSize: 8, color: "#93a1cc", textTransform: "uppercase", letterSpacing: 1.2 },
  name: { fontFamily: "Helvetica-BoldOblique", fontSize: 26, textTransform: "uppercase" },
  sub: { fontSize: 9, color: "#c9d3ff", marginTop: 3 },
  body: { paddingHorizontal: 32, paddingTop: 14 },
  row: { flexDirection: "row", gap: 10 },
  card: { borderWidth: 1, borderColor: LINE, borderRadius: 8, padding: 10, marginBottom: 9 },
  h: { fontFamily: "Helvetica-Bold", fontSize: 8, textTransform: "uppercase", letterSpacing: 1.2, color: MUTE, marginBottom: 8 },
  big: { fontFamily: "Helvetica-Bold", fontSize: 26, color: VOLT },
  label: { fontSize: 7, color: MUTE, textTransform: "uppercase", letterSpacing: 0.8 },
  value: { fontFamily: "Helvetica-Bold", fontSize: 10, marginTop: 1 },
  p: { lineHeight: 1.45 },
  footer: { position: "absolute", bottom: 16, left: 32, right: 32, flexDirection: "row", justifyContent: "space-between", fontSize: 7, color: MUTE },
});

function Radar({ data }: { data: { key: string; value: number; previous?: number }[] }) {
  const size = 150;
  const c = size / 2;
  const r = 54;
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / data.length - Math.PI / 2;
    return [c + Math.cos(a) * r * (v / 10), c + Math.sin(a) * r * (v / 10)];
  };
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).join(",")).join(" ");
  return (
    <Svg width={size} height={size}>
      {[2.5, 5, 7.5, 10].map((lvl) => (
        <Polygon key={lvl} points={poly(data.map(() => lvl))} stroke={LINE} strokeWidth={0.8} fill="none" />
      ))}
      {data.map((_, i) => {
        const [x, y] = pt(i, 10);
        return <Line key={i} x1={c} y1={c} x2={x} y2={y} stroke={LINE} strokeWidth={0.8} />;
      })}
      {data.some((d) => d.previous != null) && (
        <Polygon points={poly(data.map((d) => d.previous ?? 0))} stroke={MUTE} strokeWidth={1} strokeDasharray="3 2" fill="none" />
      )}
      <Polygon points={poly(data.map((d) => d.value))} stroke={VOLT} strokeWidth={1.8} fill={VOLT} fillOpacity={0.18} />
      {data.map((d, i) => {
        const [x, y] = pt(i, 12.3);
        return (
          <Text key={d.key} x={x - 8} y={y + 3} style={{ fontSize: 7, fontFamily: "Helvetica-Bold" }}>
            {d.key}
          </Text>
        );
      })}
    </Svg>
  );
}

function MiniPitch({ primary, secondary }: { primary: string; secondary?: string | null }) {
  const W = 68 * 1.1;
  const H = 100 * 1.1;
  const p = POSITION_BY_KEY[primary];
  const q = secondary ? POSITION_BY_KEY[secondary] : undefined;
  return (
    <Svg width={W} height={H}>
      <Rect x={0} y={0} width={W} height={H} rx={4} fill="#14307e" />
      <G stroke="white" strokeOpacity={0.4} strokeWidth={0.6} fill="none">
        <Rect x={4} y={4} width={W - 8} height={H - 8} />
        <Line x1={4} y1={H / 2} x2={W - 4} y2={H / 2} />
        <Circle cx={W / 2} cy={H / 2} r={11} />
        <Rect x={W / 2 - 23} y={4} width={46} height={19} />
        <Rect x={W / 2 - 23} y={H - 23} width={46} height={19} />
      </G>
      {q && <Circle cx={(q.x / 100) * W} cy={(q.y / 100) * H} r={6} fill={ROYAL} />}
      {p && <Circle cx={(p.x / 100) * W} cy={(p.y / 100) * H} r={7.5} fill={VOLT} />}
      {p && (
        <Text x={(p.x / 100) * W - 6} y={(p.y / 100) * H + 2.5} style={{ fontSize: 6.5, fontFamily: "Helvetica-Bold", color: "white" }}>
          {p.key}
        </Text>
      )}
    </Svg>
  );
}

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <View style={{ height: 5, backgroundColor: LINE, borderRadius: 3, marginTop: 4 }}>
      <View style={{ height: 5, width: `${Math.max(0, Math.min(100, value * 100))}%`, backgroundColor: color, borderRadius: 3 }} />
    </View>
  );
}

export function ReportDocument({ r, generatedBy }: { r: PlayerReport; generatedBy: string }) {
  const { player, latestEval, plan } = r;
  const lightColor = { STRONGEST: ROYAL, MONITOR: VOLT, NEEDS_FOCUS: RED } as const;
  const lightLabel = { STRONGEST: "Strongest", MONITOR: "Monitor", NEEDS_FOCUS: "Needs focus" } as const;

  return (
    <Document title={`${player.firstName} ${player.lastName} report card`} author="PitchPath" creator="PitchPath">
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={s.brandRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Svg width={18} height={18} viewBox="0 0 40 40">
                <Rect x={1} y={1} width={38} height={38} rx={10} fill={ROYAL} />
                <Path d="M8 31 C 15 31, 15 22, 21 21 S 27 12, 30 10" stroke={VOLT} strokeWidth={3.6} fill="none" />
                <Circle cx={30.5} cy={9.5} r={4} fill="white" />
              </Svg>
              <Text style={s.brand}>
                PITCH<Text style={{ color: VOLT }}>PATH</Text>
              </Text>
            </View>
            <Text style={s.club}>{player.club.name} · {player.team?.name ?? ""}</Text>
          </View>
          <Text style={s.name}>
            {player.firstName} <Text style={{ color: VOLT }}>{player.lastName}</Text>
          </Text>
          <Text style={s.sub}>Player report card{latestEval ? ` · ${latestEval.label} · ${fmtDate(latestEval.date)}` : ""}</Text>
        </View>

        <View style={s.body}>
          {/* Profile strip */}
          <View style={[s.card, { flexDirection: "row", justifyContent: "space-between" }]}>
            {[
              ["Age", `${r.age.years}y ${r.age.days}d`],
              ["Position", POSITION_BY_KEY[player.position]?.label ?? player.position],
              ["Height", fmtHeight(player.heightCm)],
              ["Foot", player.dominantFoot],
              ["Attendance", `${r.attendance.rate}%`],
              ["Season", `${r.totals.apps} apps · ${r.totals.goals}G ${r.totals.assists}A`],
            ].map(([l, v]) => (
              <View key={l}>
                <Text style={s.label}>{l}</Text>
                <Text style={s.value}>{v}</Text>
              </View>
            ))}
          </View>

          {latestEval && (
            <>
              <View style={s.row}>
                <View style={[s.card, { flex: 1, alignItems: "center" }]}>
                  <Text style={[s.h, { alignSelf: "flex-start" }]}>Overall</Text>
                  <Text style={s.big}>{r.overall.toFixed(1)}</Text>
                  {r.previousOverall != null && (
                    <Text style={{ fontSize: 8, color: r.overall >= r.previousOverall ? ROYAL : RED }}>
                      {r.overall >= r.previousOverall ? "+" : ""}
                      {(r.overall - r.previousOverall).toFixed(1)} since {r.prevEval?.label}
                    </Text>
                  )}
                  <View style={{ marginTop: 10 }}>
                    <MiniPitch primary={player.position} secondary={player.secondaryPos} />
                  </View>
                </View>
                <View style={[s.card, { flex: 1.3, alignItems: "center" }]}>
                  <Text style={[s.h, { alignSelf: "flex-start" }]}>Performance DNA</Text>
                  <Radar data={r.dna} />
                  <Text style={{ fontSize: 7, color: MUTE }}>Orange = now · dashed = previous evaluation</Text>
                </View>
                <View style={[s.card, { flex: 1.2 }]}>
                  <Text style={s.h}>Traffic lights</Text>
                  {r.lights.map((l) => (
                    <View key={l.level} style={{ marginBottom: 9 }}>
                      <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: lightColor[l.level], textTransform: "uppercase", letterSpacing: 0.8 }}>
                        {lightLabel[l.level]}
                      </Text>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={s.value}>{l.label}</Text>
                        <Text style={s.value}>{l.value.toFixed(1)}</Text>
                      </View>
                      <Bar value={l.value / 10} color={lightColor[l.level]} />
                    </View>
                  ))}
                  <Text style={[s.h, { marginTop: 6 }]}>Pillars</Text>
                  {r.categoryList.map((c) => (
                    <View key={c.key} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                      <Text>{c.label}</Text>
                      <Text style={{ fontFamily: "Helvetica-Bold" }}>{r.categories[c.key].toFixed(1)}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Skill scores */}
              <View style={s.card}>
                <Text style={s.h}>Skill scores (1–10)</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {SKILLS.map((sk) => {
                    const v = r.latest[sk.key];
                    const prev = r.previous?.[sk.key];
                    return (
                      <View key={sk.key} style={{ width: "25%", paddingRight: 8, marginBottom: 4 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                          <Text style={{ fontSize: 8 }}>{sk.label}</Text>
                          <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold" }}>
                            {v}
                            {prev != null && v !== prev ? <Text style={{ color: v > prev ? ROYAL : RED }}> {v > prev ? "+" : ""}{v - prev}</Text> : null}
                          </Text>
                        </View>
                        <Bar value={v / 10} color={v >= 7 ? ROYAL : v >= 5 ? VOLT : RED} />
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Feedback */}
              <View style={s.row}>
                <View style={[s.card, { flex: 1 }]}>
                  <Text style={[s.h, { color: ROYAL }]}>Doing well</Text>
                  <Text style={s.p}>{latestEval.strengths}</Text>
                </View>
                <View style={[s.card, { flex: 1 }]}>
                  <Text style={[s.h, { color: VOLT }]}>To improve</Text>
                  <Text style={s.p}>{latestEval.improvements}</Text>
                </View>
              </View>
              <View style={[s.card, { borderLeftWidth: 3, borderLeftColor: VOLT }]}>
                <Text style={s.h}>Coach comment · {latestEval.coach.name}</Text>
                <Text style={s.p}>{latestEval.comment}</Text>
              </View>
            </>
          )}
        </View>

        <View style={s.footer} fixed>
          <Text>Confidential · prepared for {player.firstName}&apos;s family and club staff · generated by {generatedBy}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>

      {plan && (
        <Page size="A4" style={s.page}>
          <View style={[s.header, { paddingBottom: 16 }]}>
            <Text style={s.club}>Development plan · {fmtDate(plan.startDate)} – {fmtDate(plan.endDate)}</Text>
            <Text style={[s.name, { fontSize: 22, marginTop: 4 }]}>{plan.title}</Text>
          </View>
          <View style={s.body}>
            <View style={[s.card, { backgroundColor: "#fff4ec", borderColor: "#ffd2b5" }]}>
              <Text style={[s.h, { color: VOLT }]}>Primary focus</Text>
              <Text style={[s.p, { fontSize: 10 }]}>{plan.primaryFocus}</Text>
            </View>
            <Text style={s.h}>Goals & weekly targets</Text>
            {plan.goals.map((g) => {
              const pr = goalProgress(g);
              return (
                <View key={g.id} style={s.card} wrap={false}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10 }}>{SKILL_BY_KEY[g.skill]?.label}: {g.description}</Text>
                    <Text style={{ fontFamily: "Helvetica-Bold", color: pr >= 1 ? ROYAL : VOLT }}>{Math.round(pr * 100)}%</Text>
                  </View>
                  <Text style={{ color: MUTE, marginTop: 2 }}>
                    {g.metric}: {g.baseline}{g.unit} → target {g.target}{g.unit} (now {g.current}{g.unit})
                  </Text>
                  <Bar value={pr} color={pr >= 1 ? ROYAL : VOLT} />
                  <Text style={{ marginTop: 4 }}>Weekly: {g.weeklyTarget}</Text>
                </View>
              );
            })}
            <Text style={[s.h, { marginTop: 4 }]}>Recommended drills</Text>
            {plan.drills.map((pd) => (
              <View key={pd.id} style={s.card} wrap={false}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10 }}>{pd.drill.name}</Text>
                  <Text style={{ color: MUTE }}>{pd.drill.minutes} min · {pd.perWeek}x per week · {pd.drill.atHome ? "at home" : "with team"}</Text>
                </View>
                <Text style={[s.p, { marginTop: 3 }]}>{pd.drill.instructions}</Text>
                <Text style={{ color: MUTE, marginTop: 2 }}>Equipment: {pd.drill.equipment}</Text>
                {pd.coachNote ? <Text style={{ color: VOLT, marginTop: 2 }}>Coach note: {pd.coachNote}</Text> : null}
              </View>
            ))}
          </View>
          <View style={s.footer} fixed>
            <Text>Confidential · {player.firstName} {player.lastName} · {player.club.name}</Text>
            <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
          </View>
        </Page>
      )}
    </Document>
  );
}
