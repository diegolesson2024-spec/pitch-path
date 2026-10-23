// Demo data for PitchPath. Every person and club here is fictional.
// Demo accounts all share the password below; DEMO_MODE also offers one-click logins.

import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { db as prisma } from "../src/lib/db";
import { DRILLS } from "../src/lib/drills-data";
import { SKILLS } from "../src/lib/skills";
import { suggestPlan } from "../src/lib/recommend";

export const DEMO_PASSWORD = "Demo1234!";

// Deterministic randomness so the demo looks the same every reset.
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(20261020);
const between = (lo: number, hi: number) => lo + rand() * (hi - lo);
const int = (lo: number, hi: number) => Math.floor(between(lo, hi + 1));
const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];
const clampScore = (n: number) => Math.max(1, Math.min(10, Math.round(n)));
const d = (iso: string) => new Date(`${iso}T12:00:00Z`);

const FIRST = ["Ethan", "Noah", "Oliver", "Arlo", "Kai", "Rafael", "Theo", "Isaac", "Mateo", "Zane", "Felix", "Jonah", "Tariq", "Callum", "Ruben", "Elijah", "Finn", "Leon", "Samir", "Owen", "Hugo", "Malik", "Dylan", "Luca", "Jude", "Nico", "Aiden", "Cole", "Emeka", "Toby", "Ravi", "Max", "Ilya", "Ben", "Kofi", "Ollie", "Aaron", "Yusuf", "Harvey", "Jasper"];
const LAST = ["Hart", "Adeyemi", "Kowalski", "Price", "Mensah", "Doyle", "Okoro", "Silva", "Novak", "Hughes", "Castillo", "Byrne", "Lindqvist", "Patel", "Reid", "Afolabi", "Moreau", "Walsh", "Nakamura", "Grant", "Varga", "Osei", "Fletcher", "Romero", "Clarke", "Haddad", "Brennan", "Ivanov", "Quinn", "Achebe"];
const POS_CYCLE = ["GK", "CB", "CB", "FB", "FB", "CDM", "CM", "CM", "CAM", "W", "W", "ST", "ST", "CB", "CM", "W"];
const OPPONENTS = ["Harbourside FC", "Kingsmead Rovers", "Ashford Vale", "St. Bede's Juniors", "Millbrook Town", "Elmwood Athletic", "Castlegate Youth", "Fernhill United", "Oakridge Colts", "Pinecrest SC"];

const EVAL_DATES = [
  { date: "2026-01-20", label: "Winter review 2025/26" },
  { date: "2026-05-18", label: "End of season 2025/26" },
  { date: "2026-08-28", label: "Pre-season baseline 2026/27" },
  { date: "2026-10-09", label: "October review 2026/27" },
];

// Position shapes the starting profile: strikers shoot, defenders defend.
const POSITION_BIAS: Record<string, Partial<Record<string, number>>> = {
  GK: { communication: 1.5, composure: 1, agility: 1, finishing: -2, dribbling: -1.5 },
  CB: { defensivePositioning: 1.5, strength: 1.5, communication: 1, dribbling: -1, finishing: -1.5 },
  FB: { stamina: 1.2, speed: 1, defensivePositioning: 0.8, finishing: -1 },
  CDM: { pressing: 1.2, passing: 1, defensivePositioning: 1, workRate: 1, finishing: -1 },
  CM: { passing: 1.3, stamina: 1, scanning: 0.8 },
  CAM: { firstTouch: 1.3, dribbling: 1, decisionMaking: 1, defensivePositioning: -1.2 },
  W: { speed: 1.5, dribbling: 1.3, agility: 1, defensivePositioning: -1.5 },
  ST: { finishing: 1.8, attackingMovement: 1.3, defensivePositioning: -1.5, pressing: -0.5 },
};

type Profile = Record<string, number>;

function makeProfile(position: string, talent: number): Profile {
  const p: Profile = {};
  for (const s of SKILLS) p[s.key] = talent + between(-1.4, 1.4) + (POSITION_BIAS[position]?.[s.key] ?? 0);
  return p;
}

// Four evaluations showing realistic, uneven growth across the year.
function evaluationsFor(profile: Profile, growth: number) {
  const steps = [-1.6, -1.0, -0.5, 0];
  return steps.map((step) => {
    const scores: Profile = {};
    for (const s of SKILLS) scores[s.key] = clampScore(profile[s.key] + step * growth * between(0.6, 1.4) + between(-0.4, 0.4));
    return scores;
  });
}

const STRENGTH_LINES: Record<string, string> = {
  TECHNICAL: "Technique on the ball is a real asset. Clean touches and confident in possession.",
  TACTICAL: "Reads the game well and is usually in the right place at the right time.",
  PHYSICAL: "Athletic and quick. Wins races and duels and lasts the full game.",
  MENTAL: "Great attitude. Works hard, listens and lifts the group.",
};
const IMPROVE_LINES: Record<string, string> = {
  TECHNICAL: "Needs more repetitions on the ball to make touches and passes consistent under pressure.",
  TACTICAL: "Needs to scan more before receiving and make quicker decisions in possession.",
  PHYSICAL: "Would benefit from work on acceleration and staying strong in duels.",
  MENTAL: "Keep working on staying composed after mistakes and communicating with teammates.",
};

function catAvg(scores: Profile) {
  const cats: Record<string, number[]> = {};
  for (const s of SKILLS) (cats[s.category] ??= []).push(scores[s.key]);
  return Object.entries(cats)
    .map(([k, v]) => ({ k, v: v.reduce((a, b) => a + b, 0) / v.length }))
    .sort((a, b) => b.v - a.v);
}

async function main() {
  console.log("Resetting demo data…");
  // Children before parents, so the reset works however the app has been used.
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.drillLog.deleteMany(),
    prisma.invite.deleteMany(),
    prisma.checkIn.deleteMany(),
    prisma.planDrill.deleteMany(),
    prisma.planGoal.deleteMany(),
    prisma.developmentPlan.deleteMany(),
    prisma.note.deleteMany(),
    prisma.evaluationScore.deleteMany(),
    prisma.evaluation.deleteMany(),
    prisma.matchStat.deleteMany(),
    prisma.statImport.deleteMany(),
    prisma.attendance.deleteMany(),
    prisma.session.deleteMany(),
    prisma.playerAccess.deleteMany(),
    prisma.coachTeam.deleteMany(),
    prisma.player.deleteMany(),
    prisma.team.deleteMany(),
    prisma.club.deleteMany(),
    prisma.drill.deleteMany(),
    prisma.user.deleteMany(),
  ]);
  // Uploaded drill videos belong to the drills just deleted.
  fs.rmSync(path.join(process.cwd(), "uploads", "drill-videos"), { recursive: true, force: true });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // One batch insert: parallel creates can hit SQLite lock timeouts while the dev server is running.
  await prisma.drill.createMany({ data: DRILLS.map((x) => ({ ...x, atHome: x.atHome ?? true })) });
  const drills = await prisma.drill.findMany();

  const riverside = await prisma.club.create({
    data: { name: "Riverside Athletic FC", shortName: "RAFC", city: "Westbrook", primaryHex: "#2F5BFF" },
  });
  const northgate = await prisma.club.create({
    data: { name: "Northgate United Academy", shortName: "NUA", city: "Kelby", primaryHex: "#FF6A13" },
  });

  const mkUser = (email: string, name: string, role: string, clubId?: string) =>
    prisma.user.create({ data: { email, name, role, passwordHash, clubId } });

  await mkUser("admin@pitchpath.demo", "Morgan Ellis", "ADMIN");
  await mkUser("director@riverside.demo", "Sam Okafor", "CLUB", riverside.id);
  const coach = await mkUser("coach@riverside.demo", "Jordan Reyes", "COACH", riverside.id);
  const coach2 = await mkUser("coach2@riverside.demo", "Priya Shah", "COACH", riverside.id);
  await mkUser("director@northgate.demo", "Dana Whitfield", "CLUB", northgate.id);
  const ngCoach = await mkUser("coach@northgate.demo", "Chris Albright", "COACH", northgate.id);
  const parent = await mkUser("parent@riverside.demo", "Claire Bennett", "PARENT", riverside.id);
  const playerUser = await mkUser("player@riverside.demo", "Leo Bennett", "PLAYER", riverside.id);
  const mayaUser = await mkUser("maya@riverside.demo", "Maya Bennett", "PLAYER", riverside.id);

  const teams = [
    { club: riverside, name: "U14 Falcons", ageGroup: "U14", birthYear: 2012, coaches: [coach], size: 16 },
    { club: riverside, name: "U12 Lions", ageGroup: "U12", birthYear: 2014, coaches: [coach, coach2], size: 14 },
    { club: northgate, name: "U13 Hawks", ageGroup: "U13", birthYear: 2013, coaches: [ngCoach], size: 12 },
  ];

  let nameIdx = 0;
  for (const t of teams) {
    const team = await prisma.team.create({
      data: {
        clubId: t.club.id,
        name: t.name,
        ageGroup: t.ageGroup,
        season: "2026/27",
        coaches: { create: t.coaches.map((c) => ({ userId: c.id })) },
      },
    });
    const leadCoach = t.coaches[0];

    // Training Tue/Thu and matches on Saturdays from late August.
    const sessions: { id: string; kind: string; date: Date }[] = [];
    const start = d("2026-08-25");
    for (let day = 0; day < 56; day++) {
      const date = new Date(start.getTime() + day * 86_400_000);
      const dow = date.getUTCDay();
      if (dow === 2 || dow === 4) {
        sessions.push(await prisma.session.create({ data: { teamId: team.id, date, kind: "TRAINING", title: dow === 2 ? "Technical session" : "Tactical session" } }));
      } else if (dow === 6) {
        sessions.push(await prisma.session.create({ data: { teamId: team.id, date, kind: "MATCH", title: `vs ${OPPONENTS[sessions.filter((s) => s.kind === "MATCH").length % OPPONENTS.length]}` } }));
      }
    }

    for (let i = 0; i < t.size; i++) {
      const isLeo = t.name === "U14 Falcons" && i === 11;
      const isMaya = t.name === "U12 Lions" && i === 6;
      const position = isLeo ? "ST" : POS_CYCLE[i % POS_CYCLE.length];
      const firstName = isLeo ? "Leo" : isMaya ? "Maya" : FIRST[nameIdx % FIRST.length];
      const lastName = isLeo || isMaya ? "Bennett" : LAST[(nameIdx * 7) % LAST.length];
      nameIdx++;

      const dob = new Date(Date.UTC(t.birthYear, int(0, 11), int(1, 28)));
      const player = await prisma.player.create({
        data: {
          clubId: t.club.id,
          teamId: team.id,
          firstName,
          lastName,
          dateOfBirth: dob,
          position,
          secondaryPos: isLeo ? "CDM" : rand() > 0.6 ? pick(["CM", "W", "FB", "CAM", "CB"]) : null,
          dominantFoot: rand() > 0.78 ? "Left" : "Right",
          heightCm: Math.round(between(t.birthYear === 2012 ? 152 : 138, t.birthYear === 2012 ? 172 : 156)),
          weightKg: Math.round(between(t.birthYear === 2012 ? 40 : 31, t.birthYear === 2012 ? 58 : 44)),
          shirtNumber: i + 1,
          avatarHue: int(190, 260),
          consentAt: d("2026-08-20"),
        },
      });

      let profile = makeProfile(position, between(5, 7.4));
      if (isLeo) {
        // Leo: quick and strong, technically developing, tactically the biggest gap.
        profile = { ...profile, speed: 8.6, agility: 8, stamina: 8.2, strength: 7.8, coordination: 7.4, finishing: 7.4, firstTouch: 6.3, passing: 6, dribbling: 6.6, weakFoot: 4.6, scanning: 4.4, decisionMaking: 5, attackingMovement: 6.6, defensivePositioning: 4.2, pressing: 5.6, composure: 6.2, workRate: 7.6, communication: 5.4, coachability: 7.8, resilience: 6.4 };
      }
      if (isMaya) {
        profile = { ...profile, passing: 8, firstTouch: 7.8, scanning: 7.4, decisionMaking: 7.2, speed: 5.2, strength: 4.6, communication: 7.6, composure: 7 };
      }
      const evals = evaluationsFor(profile, isLeo ? 1.6 : between(0.6, 1.5));

      let latest: Profile = evals[evals.length - 1];
      for (let e = 0; e < evals.length; e++) {
        const scores = evals[e];
        const cats = catAvg(scores);
        const evaluation = await prisma.evaluation.create({
          data: {
            playerId: player.id,
            coachId: leadCoach.id,
            date: d(EVAL_DATES[e].date),
            label: EVAL_DATES[e].label,
            strengths: STRENGTH_LINES[cats[0].k],
            improvements: IMPROVE_LINES[cats[cats.length - 1].k],
            comment: isLeo && e === evals.length - 1
              ? "Leo has had an excellent start to the season. His pace and power cause problems for every back line and he's finishing more calmly. The next step is tactical: checking his shoulder before receiving, and knowing when to hold the ball up versus run in behind. If he commits to the scanning drills at home, I expect a big jump by Christmas."
              : `${firstName} is making steady progress. Keep building on the ${cats[0].k.toLowerCase()} side of the game and use the home drills to close the gap on ${cats[cats.length - 1].k.toLowerCase()}.`,
            scores: { create: SKILLS.map((s) => ({ category: s.category, skill: s.key, score: scores[s.key] })) },
          },
        });
        void evaluation;
        latest = scores;
      }

      // Match stats for each Saturday fixture.
      const matches = sessions.filter((s) => s.kind === "MATCH");
      const statRows = [];
      for (let m = 0; m < matches.length; m++) {
        const attacking = ["ST", "W", "CAM"].includes(position);
        const defending = ["CB", "FB", "CDM", "GK"].includes(position);
        const minutes = isLeo ? int(55, 70) : int(25, 70);
        const shots = position === "GK" ? 0 : attacking ? int(1, isLeo ? 6 : 4) : int(0, 2);
        const onTarget = Math.min(shots, Math.round(shots * between(0.3, isLeo ? 0.75 : 0.6)));
        const goals = Math.min(onTarget, attacking ? (rand() > (isLeo ? 0.35 : 0.65) ? int(1, isLeo ? 2 : 1) : 0) : rand() > 0.92 ? 1 : 0);
        const attempted = int(defending ? 18 : 12, defending ? 40 : 32);
        const passRate = 0.55 + (latest.passing / 10) * 0.35 + between(-0.05, 0.05);
        statRows.push({
            playerId: player.id,
            date: matches[m].date,
            opponent: OPPONENTS[m % OPPONENTS.length],
            competition: m % 4 === 3 ? "Cup" : "League",
            minutes,
            goals,
            assists: rand() > (attacking ? 0.7 : 0.88) ? 1 : 0,
            shots,
            shotsOnTarget: onTarget,
            keyPasses: int(0, attacking ? 4 : 2),
            passesAttempted: attempted,
            passesCompleted: Math.round(attempted * Math.min(0.95, passRate)),
            dribblesWon: int(0, attacking ? 5 : 2),
            tackles: int(defending ? 2 : 0, defending ? 7 : 3),
            interceptions: int(defending ? 1 : 0, defending ? 6 : 2),
            rating: Math.round(between(5.8, 8.6) * 10) / 10,
        });
      }
      await prisma.matchStat.createMany({ data: statRows });

      // Attendance across all sessions.
      await prisma.attendance.createMany({
        data: sessions.map((s) => {
          const r = rand();
          const status = r > 0.93 ? "ABSENT" : r > 0.88 ? "EXCUSED" : r > 0.82 ? "LATE" : "PRESENT";
          return { sessionId: s.id, playerId: player.id, status: isLeo && status === "ABSENT" ? "PRESENT" : status };
        }),
      });

      // Active development plan for Riverside players.
      if (t.club.id === riverside.id) {
        const suggestion = suggestPlan(latest, position, drills, firstName);
        await prisma.developmentPlan.create({
          data: {
            playerId: player.id,
            coachId: leadCoach.id,
            title: isLeo ? "Scanning & decision block" : suggestion.title,
            primaryFocus: isLeo
              ? "Use your pace and positioning to create scoring chances, and check your shoulder before every reception so you already know your next move."
              : suggestion.primaryFocus,
            startDate: d("2026-10-12"),
            endDate: d("2026-12-07"),
            goals: {
              create: (isLeo
                ? [
                    { skill: "scanning", description: "Check both shoulders before the ball arrives.", metric: "Scans before receiving (per 10 receptions)", baseline: 3, target: 7, current: 5, unit: "/10", weeklyTarget: "3 x Shoulder Check Colours, coach counts scans Saturday" },
                    { skill: "decisionMaking", description: "Hold it up or run in behind? Choose early.", metric: "Coach decision rating", baseline: 5, target: 7, current: 6, unit: "/10", weeklyTarget: "1 x Match Film Review, 2 x Pass or Dribble Gates" },
                    { skill: "finishing", description: "Score at least 2 goals and keep shots on target.", metric: "Shots on target out of 20 from 12m", baseline: 11, target: 15, current: 13, unit: "/20", weeklyTarget: "2 x Corners of the Goal" },
                    { skill: "weakFoot", description: "Make the left foot a real option.", metric: "Clean weak-foot wall passes out of 50", baseline: 18, target: 30, current: 22, unit: "/50", weeklyTarget: "Weak Foot Week every Monday" },
                  ]
                : suggestion.goals.map((g) => ({ ...g, current: Math.round((g.baseline + (g.target - g.baseline) * between(0.1, 0.7)) * 100) / 100 }))
              ).map((g, i) => ({ ...g, sortOrder: i })),
            },
            drills: {
              create: (isLeo
                ? drills.filter((x) => ["Shoulder Check Colours", "Match Film Review", "Pass or Dribble Gates", "Corners of the Goal", "Weak Foot Week"].includes(x.name)).map((x) => x.id)
                : suggestion.drillIds
              ).map((drillId) => ({ drillId, perWeek: int(2, 3), coachNote: "" })),
            },
            checkIns: {
              create: isLeo
                ? [
                    { authorId: playerUser.id, date: d("2026-10-14"), note: "Did shoulder check colours with Mum. Got 14/20 calls right.", effort: 4 },
                    { authorId: coach.id, date: d("2026-10-17"), note: "Counted 5 scans in 10 receptions on Saturday, up from 3. Great progress!", effort: 5 },
                  ]
                : [{ authorId: leadCoach.id, date: d("2026-10-17"), note: "Good first week on the plan. Keep it going.", effort: int(3, 5) }],
            },
          },
        });
      }

      if (isLeo || isMaya) {
        await prisma.playerAccess.create({ data: { userId: parent.id, playerId: player.id, relation: "PARENT" } });
      }
      if (isLeo) {
        await prisma.playerAccess.create({ data: { userId: playerUser.id, playerId: player.id, relation: "SELF" } });
        // Coach has let Leo's parent import match stats from the family's Veo account.
        await prisma.player.update({ where: { id: player.id }, data: { allowParentImports: true } });
        await prisma.note.createMany({
          data: [
            { playerId: player.id, authorId: coach.id, visibility: "FAMILY", body: "Brilliant movement for the second goal vs Elmwood. That's exactly the run we've been working on.", createdAt: d("2026-10-10") },
            { playerId: player.id, authorId: coach.id, visibility: "STAFF", body: "Consider trialling Leo at CDM in the second half of a cup game to develop his reading of play.", createdAt: d("2026-10-11") },
          ],
        });
      }
      if (isMaya) {
        await prisma.playerAccess.create({ data: { userId: mayaUser.id, playerId: player.id, relation: "SELF" } });
        await prisma.note.create({
          data: { playerId: player.id, authorId: coach.id, visibility: "FAMILY", body: "Maya's range of passing is the best in the group. Now let's add a bit more physical edge in duels.", createdAt: d("2026-10-08") },
        });
      }

      // Recent home practice, relative to today so streaks look live in the demo:
      // Maya is on a 4-day streak (not yet done today); Leo practised on and off.
      if (isLeo || isMaya) {
        const plan = await prisma.developmentPlan.findFirst({ where: { playerId: player.id }, include: { drills: true } });
        const today = new Date().toLocaleDateString("en-CA");
        const back = (n: number) => new Date(new Date(`${today}T00:00:00Z`).getTime() - n * 86_400_000).toISOString().slice(0, 10);
        const daysAgo = isMaya ? [1, 2, 3, 4, 8, 9] : [1, 3, 5, 6];
        const logger = isMaya ? mayaUser : playerUser;
        const planDrills = plan?.drills ?? [];
        const logs = daysAgo.flatMap((n, i) =>
          planDrills.filter((_, j) => (i + j) % 2 === 0).slice(0, 2).map((pd) => ({ playerId: player.id, drillId: pd.drillId, day: back(n), loggedById: logger.id })),
        );
        if (logs.length) await prisma.drillLog.createMany({ data: logs });
      }
    }
  }

  // A few notifications so the bell isn't empty in the demo.
  const leo = await prisma.player.findFirstOrThrow({ where: { firstName: "Leo", lastName: "Bennett" } });
  const maya = await prisma.player.findFirstOrThrow({ where: { firstName: "Maya", lastName: "Bennett" } });
  const ago = (h: number) => new Date(Date.now() - h * 3_600_000);
  await prisma.notification.createMany({
    data: [
      { userId: parent.id, kind: "EVALUATION", title: "New evaluation from Jordan Reyes", body: "Leo's October review 2026/27 is ready to read.", href: `/players/${leo.id}`, createdAt: ago(30) },
      { userId: parent.id, kind: "NOTE", title: "New note from Jordan Reyes", body: "Maya's range of passing is the best in the group.", href: `/players/${maya.id}`, createdAt: ago(20), readAt: ago(19) },
      { userId: parent.id, kind: "PLAN", title: "New development plan", body: "Leo: Scanning & decision block, 4 goals and 5 drills to practise.", href: `/players/${leo.id}`, createdAt: ago(48), readAt: ago(40) },
      { userId: playerUser.id, kind: "EVALUATION", title: "New evaluation from Jordan Reyes", body: "Your October review is ready to read.", href: `/players/${leo.id}`, createdAt: ago(30) },
      { userId: mayaUser.id, kind: "BADGE", title: "Badge unlocked: On fire!", body: "Practise 3 days in a row", href: "/dashboard", dedupeKey: `badge:${maya.id}:streak3`, createdAt: ago(26) },
      { userId: mayaUser.id, kind: "BADGE", title: "Badge unlocked: First drill!", body: "Log your first home drill", href: "/dashboard", dedupeKey: `badge:${maya.id}:first`, createdAt: ago(200), readAt: ago(190) },
    ],
  });

  const players = await prisma.player.count();
  const evals = await prisma.evaluation.count();
  console.log(`Seeded ${players} players, ${evals} evaluations, ${drills.length} drills.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
