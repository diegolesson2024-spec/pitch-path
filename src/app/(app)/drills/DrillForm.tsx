"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Film, Lock, Upload, Users, X } from "lucide-react";
import { CATEGORIES, SKILLS } from "@/lib/skills";

const MAX_BYTES = 200 * 1024 * 1024;
const MAX_SECONDS = 120;

export type DrillInitial = {
  id?: string;
  name: string;
  skill: string;
  summary: string;
  instructions: string;
  equipment: string;
  minutes: number;
  difficulty: string;
  atHome: boolean;
  visibility: "PRIVATE" | "CLUB";
  hasVideo: boolean;
};

const EMPTY: DrillInitial = {
  name: "",
  skill: "firstTouch",
  summary: "",
  instructions: "",
  equipment: "",
  minutes: 10,
  difficulty: "Foundation",
  atHome: true,
  visibility: "PRIVATE",
  hasVideo: false,
};

// Recorded WebM files often report Infinity until you seek to the end, so nudge
// the browser to compute the real length. Unknown lengths are allowed (size still limited).
function readDuration(file: File) {
  return new Promise<number>((resolve) => {
    const v = document.createElement("video");
    const done = (d: number) => {
      URL.revokeObjectURL(v.src);
      resolve(Number.isFinite(d) ? d : NaN);
    };
    v.preload = "metadata";
    v.muted = true;
    v.onloadedmetadata = () => {
      if (Number.isFinite(v.duration)) return done(v.duration);
      v.ondurationchange = () => Number.isFinite(v.duration) && done(v.duration);
      v.currentTime = Number.MAX_SAFE_INTEGER;
      setTimeout(() => done(v.duration), 3000);
    };
    v.onerror = () => done(NaN);
    v.src = URL.createObjectURL(file);
  });
}

export function DrillForm({ initial = EMPTY, clubName }: { initial?: DrillInitial; clubName: string }) {
  const router = useRouter();
  const editing = Boolean(initial.id);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removeVideo, setRemoveVideo] = useState(false);
  const [visibility, setVisibility] = useState(initial.visibility);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function pick(f: File | undefined) {
    setError(null);
    if (!f) return;
    if (!["video/mp4", "video/quicktime", "video/webm"].includes(f.type)) return setError("Choose an MP4, MOV or WebM video.");
    if (f.size > MAX_BYTES) return setError(`That video is ${(f.size / 1048576).toFixed(0)} MB. The limit is 200 MB.`);
    if (f.size < 1024) return setError("That video file looks empty. Try recording it again.");
    const secs = await readDuration(f);
    if (secs > MAX_SECONDS + 1) return setError(`That video is ${Math.round(secs)} seconds. Keep drill videos to 2 minutes or less.`);
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setRemoveVideo(false);
  }

  function clearVideo() {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.delete("video");
    if (file) fd.set("video", file);
    fd.set("visibility", visibility);
    fd.set("atHome", String((e.currentTarget.elements.namedItem("atHome") as HTMLInputElement).checked));
    if (removeVideo) fd.set("removeVideo", "true");

    // XHR rather than fetch so we can show upload progress on slow connections.
    const xhr = new XMLHttpRequest();
    xhr.open("POST", editing ? `/api/drills/${initial.id}` : "/api/drills");
    xhr.upload.onprogress = (ev) => ev.lengthComputable && setProgress(ev.loaded / ev.total);
    xhr.onload = () => {
      let body: { id?: string; error?: string } = {};
      try { body = JSON.parse(xhr.responseText); } catch {}
      if (xhr.status >= 200 && xhr.status < 300 && body.id) {
        router.push(`/drills/${body.id}`);
      } else {
        setProgress(null);
        setError(body.error ?? "Something went wrong. Please try again.");
      }
    };
    xhr.onerror = () => {
      setProgress(null);
      setError("Upload failed. Check your connection and try again.");
    };
    setProgress(0);
    xhr.send(fd);
  }

  const busy = progress !== null;
  const showExisting = editing && initial.hasVideo && !file && !removeVideo;

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
      <section className="panel space-y-4 p-5">
        <h2 className="text-lg font-bold">Drill details</h2>
        <label className="block"><span className="label">Drill name</span><input name="name" defaultValue={initial.name} required minLength={2} maxLength={80} placeholder="e.g. Falcons Finishing Circuit" className="field" /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className="label">Main skill</span>
            <select name="skill" defaultValue={initial.skill} className="field">
              {CATEGORIES.map((c) => (
                <optgroup key={c.key} label={c.label}>
                  {SKILLS.filter((s) => s.category === c.key).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </optgroup>
              ))}
            </select>
          </label>
          <label className="block"><span className="label">Difficulty</span>
            <select name="difficulty" defaultValue={initial.difficulty} className="field">
              <option>Foundation</option><option>Developing</option><option>Advanced</option>
            </select>
          </label>
          <label className="block"><span className="label">Minutes</span><input name="minutes" type="number" min={1} max={120} defaultValue={initial.minutes} required className="field" /></label>
          <label className="block"><span className="label">Equipment</span><input name="equipment" defaultValue={initial.equipment} maxLength={200} placeholder="Ball, 4 cones" className="field" /></label>
        </div>
        <label className="block"><span className="label">One-line summary</span><input name="summary" defaultValue={initial.summary} required minLength={2} maxLength={200} placeholder="What the drill builds, in one sentence" className="field" /></label>
        <label className="block"><span className="label">Instructions (step by step)</span>
          <textarea name="instructions" defaultValue={initial.instructions} required minLength={10} maxLength={4000} rows={7} placeholder={"1. Set up…\n2. Start by…\n3. Count…\nCoaching points: …"} className="field" />
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="atHome" defaultChecked={initial.atHome} className="h-4 w-4 accent-[#ff6a13]" />
          Players can do this at home
        </label>
      </section>

      <div className="space-y-5">
        <section className="panel p-5">
          <h2 className="mb-1 text-lg font-bold">Demo video</h2>
          <p className="mb-4 text-sm text-mute">Film the drill on your phone and upload it. MP4, MOV or WebM, up to 2 minutes and 200 MB.</p>

          {preview ? (
            <div className="space-y-2">
              <video src={preview} controls playsInline className="aspect-video w-full rounded-xl bg-black" />
              <div className="flex items-center justify-between text-xs text-mute">
                <span className="truncate">{file?.name} · {((file?.size ?? 0) / 1048576).toFixed(1)} MB</span>
                <button type="button" onClick={clearVideo} className="flex items-center gap-1 font-bold uppercase tracking-wider hover:text-alert"><X size={13} /> Remove</button>
              </div>
            </div>
          ) : showExisting ? (
            <div className="space-y-2">
              <video src={`/api/drill-videos/${initial.id}`} controls playsInline preload="metadata" className="aspect-video w-full rounded-xl bg-black" />
              <div className="flex justify-between text-xs">
                <button type="button" onClick={() => inputRef.current?.click()} className="font-bold uppercase tracking-wider text-volt">Replace video</button>
                <button type="button" onClick={() => setRemoveVideo(true)} className="font-bold uppercase tracking-wider text-mute hover:text-alert">Remove video</button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]); }}
              className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-line-strong px-4 py-10 text-center transition hover:border-volt hover:bg-volt/5"
            >
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-volt/15 text-volt"><Film size={26} /></span>
              <span className="font-semibold">Tap to film or choose a video</span>
              <span className="text-xs text-mute">or drag a file here</span>
              {removeVideo && <span className="text-xs text-alert">The current video will be removed when you save.</span>}
            </button>
          )}
          <input ref={inputRef} type="file" name="video" aria-label="Demo video file" accept="video/mp4,video/quicktime,video/webm,video/*" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
        </section>

        <section className="panel p-5">
          <h2 className="mb-3 text-lg font-bold">Who can use it</h2>
          <div className="grid gap-2">
            {([
              { v: "PRIVATE", icon: Lock, t: "Only me", d: "Just you. Players see it only when you add it to their plan." },
              { v: "CLUB", icon: Users, t: `Share with ${clubName}`, d: "Other coaches at your club can add it to their players' plans." },
            ] as const).map((o) => (
              <button key={o.v} type="button" onClick={() => setVisibility(o.v)} aria-pressed={visibility === o.v}
                className={clsx("flex items-start gap-3 rounded-xl border p-3 text-left transition", visibility === o.v ? "border-volt bg-volt/[0.08]" : "border-line hover:border-line-strong")}>
                <o.icon size={18} className={visibility === o.v ? "mt-0.5 text-volt" : "mt-0.5 text-mute"} />
                <span><span className="block text-sm font-bold">{o.t}</span><span className="block text-xs text-mute">{o.d}</span></span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-dim">Your club director can see and manage every drill made at the club.</p>
        </section>

        {error && <p role="alert" className="rounded-xl border border-alert/40 bg-alert/10 p-3 text-sm text-alert">{error}</p>}

        {busy && (
          <div className="panel-flat p-3" aria-live="polite">
            <div className="mb-1.5 flex justify-between text-xs"><span>{file ? "Uploading video…" : "Saving…"}</span><span className="num">{Math.round((progress ?? 0) * 100)}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-volt transition-all" style={{ width: `${(progress ?? 0) * 100}%` }} /></div>
          </div>
        )}

        <button disabled={busy} className="btn btn-primary w-full !py-3.5 disabled:opacity-60">
          <Upload size={16} /> {editing ? "Save changes" : "Create drill"}
        </button>
      </div>
    </form>
  );
}
