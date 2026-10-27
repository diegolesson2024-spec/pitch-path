// Runs once when the server starts. The NEXT_RUNTIME check has to wrap the import directly
// so the Edge build leaves out Node-only code (Prisma).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { ensureLibraryDrills } = await import("./lib/library-drills");
      const added = await ensureLibraryDrills();
      if (added) console.log(`Added ${added} PitchPath library drills.`);
    } catch (e) {
      // Never stop the site from starting over this; the library just stays as it is.
      console.error("Could not load the drill library", e);
    }
  }
}
