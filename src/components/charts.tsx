"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { OVERALL_HEX, PILLAR } from "@/lib/colors";

const GRID = "rgba(255,255,255,0.08)";
const AXIS = "#a3acc2";
const PREVIOUS = "#737d95";

const tooltipStyle = {
  contentStyle: { background: "#182035", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, fontSize: 12 },
  labelStyle: { color: "#eef1f8", fontWeight: 700 },
  itemStyle: { color: "#eef1f8" },
};

export function DnaRadar({
  data,
  height = 280,
}: {
  data: { key: string; label: string; value: number; previous?: number }[];
  height?: number;
}) {
  const hasPrev = data.some((d) => d.previous != null);
  return (
    <div style={{ height }} role="img" aria-label={`Performance radar: ${data.map((d) => `${d.label} ${d.value}`).join(", ")}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke={GRID} />
          <PolarAngleAxis dataKey="key" tick={{ fill: AXIS, fontSize: 12, fontWeight: 600 }} />
          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
          {hasPrev && <Radar name="Previous" dataKey="previous" stroke={PREVIOUS} strokeDasharray="4 4" fill="transparent" strokeWidth={1.5} isAnimationActive={false} />}
          <Radar name="Now" dataKey="value" stroke={OVERALL_HEX} fill={OVERALL_HEX} fillOpacity={0.15} strokeWidth={2} dot={{ r: 2.5, fill: OVERALL_HEX }} isAnimationActive={false} />
          <Tooltip {...tooltipStyle} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProgressLines({
  data,
  height = 260,
}: {
  data: { label: string; Overall: number; Technical: number; Tactical: number; Physical: number; Mentality: number }[];
  height?: number;
}) {
  const series = [
    { key: "Overall", color: OVERALL_HEX, width: 3 },
    { key: "Technical", color: PILLAR.TECHNICAL.hex, width: 1.5 },
    { key: "Tactical", color: PILLAR.TACTICAL.hex, width: 1.5 },
    { key: "Physical", color: PILLAR.PHYSICAL.hex, width: 1.5 },
    { key: "Mentality", color: PILLAR.MENTAL.hex, width: 1.5 },
  ];
  return (
    <div style={{ height }} role="img" aria-label={`Overall and pillar scores across ${data.length} evaluations: ${data.map((d) => `${d.label} overall ${d.Overall}`).join(", ")}. Full figures are in the evaluation history table.`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12, color: AXIS }} iconType="circle" iconSize={8} />
          {series.map((s) => (
            <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={s.width} dot={{ r: s.key === "Overall" ? 3.5 : 2 }} activeDot={{ r: 5 }} isAnimationActive={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
