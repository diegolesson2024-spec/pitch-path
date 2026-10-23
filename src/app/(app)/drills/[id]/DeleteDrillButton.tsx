"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteDrillButton({ id, usedIn }: { id: string; usedIn: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    const warning = usedIn ? ` It will also be removed from ${usedIn} active plan${usedIn > 1 ? "s" : ""}.` : "";
    if (!confirm(`Delete this drill and its video?${warning} This can't be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/drills/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/drills");
    } else {
      setBusy(false);
      alert("Couldn't delete the drill.");
    }
  }

  return (
    <button onClick={remove} disabled={busy} className="btn btn-ghost hover:!border-alert hover:!text-alert">
      <Trash2 size={15} /> {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
