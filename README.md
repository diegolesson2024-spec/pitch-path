# PitchPath

Player development platform for soccer clubs. Coaches evaluate players, PitchPath suggests measurable goals and drills, and players and parents see exactly what to work on and how to improve.

## Quick start

Requires Node.js 20+.

```bash
npm install
npm run setup     # creates prisma/dev.db and loads demo data
npm run dev       # http://localhost:3000
```

Copy `.env.example` to `.env` first if you don't have one, and set `SESSION_SECRET` to a long random string.

`npm run db:reset` wipes the database and reloads the demo data.

## Demo accounts

With `DEMO_MODE="true"` the sign-in page shows one-click demo logins for every role. The underlying accounts and their shared password are in `prisma/seed.ts` (`DEMO_PASSWORD`). All demo people and clubs are fictional.

| Role | Account | Sees |
| --- | --- | --- |
| Platform admin | admin@pitchpath.demo | Every club, user and the audit log |
| Club director | director@riverside.demo | Riverside Athletic only: teams, coaches, players |
| Coach | coach@riverside.demo | Only the teams they coach (U14 Falcons, U12 Lions) |
| Coach | coach2@riverside.demo | U12 Lions only |
| Parent | parent@riverside.demo | Their two children (Leo and Maya Bennett) |
| Player | maya@riverside.demo | Maya Bennett (12): the young-player home with drills, streaks and badges |
| Player | player@riverside.demo | Leo Bennett (14) |
| Other club | director@northgate.demo, coach@northgate.demo | Northgate United only, for testing club isolation |

## Features

- **Player report card**: profile, position on the pitch, six-axis Performance DNA radar (current vs previous), traffic lights, kit bag, progress charts, skill breakdown, match stats, attendance, coach feedback, evaluation history.
- **Evaluations**: 20 skills across Technical, Tactical, Physical and Mentality, scored 1–10 with the previous score shown on every slider. Feedback can be drafted from the scores, and evaluations can be saved as drafts that families don't see.
- **Development plans**: suggested from the latest evaluation and the player's position (lowest scores weighted by what matters for that position). Coaches edit every goal, metric, baseline, target, weekly target and drill before publishing. Goal progress and weekly check-ins from families and coaches.
- **Drill library**: 34 drills with instructions, equipment, duration, difficulty, and at-home or team tags.
- **Coach-made drills with video**: coaches design their own drills (step-by-step instructions, skill, difficulty, equipment) and upload a demo video (MP4, MOV or WebM, up to 2 minutes and 200 MB; phones can film straight from the upload button). Drills are private to the coach unless shared with their club. Club directors can see and manage every drill made at their club. Families see a coach drill, and can play its video, once it's in their child's plan. Videos are stored in `uploads/drill-videos/` and streamed only to authorised users.
- **Parent stat imports**: a coach can switch on, per player, "Parents can import match stats". That player's parents upload a CSV (from Veo, Hudl or a spreadsheet; template at `/match-stats-template.csv`). Column names are matched loosely, bad rows are skipped with reasons, and nothing counts until a coach approves it. Approved matches are labelled "Imported"; matches the coach already logged on the same date are skipped.
- **Match stats & attendance**: touchline-friendly counters for match stats, and roll call per team session.
- **PDF reports**: branded A4 report card plus development plan, generated on demand for authorised users (`/api/reports/[playerId]`).
- **Dashboards**: separate views for admins, club directors, coaches, parents and players.
- **Player home**: a simpler, motivating screen for young players: this week's drills with an "I did it!" button, a weekly progress ring, a practice streak, badges, their "superpowers" (top skills) and next challenge.
- **Home practice tracking**: players or parents mark drills done; the plan's weekly targets, streaks and seven badges are worked out from that log.
- **Notifications**: a bell with an unread count. Families are notified when a coach publishes an evaluation, a plan or a family-visible note, and when a badge is unlocked. From Wednesday, families with drills still to do get one in-app reminder per week. Email or push reminders need an email/push provider (see the going-live checklist).

## Security and safeguarding

- Passwords hashed with bcrypt. Sessions are signed, httpOnly, SameSite cookies (8-hour expiry).
- Middleware blocks all app routes without a session. Every page, server action and API route re-checks the role and scopes data through `src/lib/access.ts`.
- Profiles a user isn't allowed to see return **404**, so their existence isn't revealed.
- Parents and players can only join through one-time invite links (7-day expiry) created by staff. There is no public sign-up.
- Guardian consent is recorded per player and required before a player gets their own account.
- Staff-only notes and unpublished evaluations are hidden from families.
- An audit log records logins, invites, access changes, evaluations, plans, imports, password changes and report downloads.
- Sessions can be revoked: changing a password or "Sign out everywhere" (Account page) invalidates every other session.
- Rate limits on login, invite acceptance, password change and stats uploads. Failed logins take the same time whether or not the email exists.
- Upload/delete API routes reject cross-site requests (Origin check) on top of SameSite cookies; server actions are origin-checked by Next.js.
- Production responses send a Content-Security-Policy, HSTS, `X-Frame-Options: DENY`, `nosniff`, and a strict referrer policy. Private pages send `X-Robots-Tag: noindex` and `Cache-Control: private, no-store`.

## Checks

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript
npm test            # unit tests (node:test via tsx): CSV import, scoring, plans, sessions, origin check
npm run build       # production build
```

## Environment variables

See `.env.example`. All are read on the server only.

| Variable | Required | Notes |
| --- | --- | --- |
| `SESSION_SECRET` | Yes | 32+ random characters. Rotating it signs everyone out. |
| `DATABASE_URL` | Yes | SQLite file locally; PostgreSQL recommended in production. |
| `SITE_URL` | Yes in production | Public origin, e.g. `https://app.example.com`. **Set before `npm run build`**: the sitemap, robots and canonical links are generated at build time. |
| `DEMO_MODE` | No | `"true"` shows one-click demo logins. Must be `"false"` for real clubs. |
| `UPLOAD_DIR` | Production | Folder for drill videos on persistent storage. Defaults to `./uploads`. |

## Deploying

PitchPath is a standard Next.js server app (`npm run build` then `npm start`; it listens on `PORT` or 3000). Health check: `GET /api/health` returns 200 when the database is reachable and 503 when it isn't.

It writes to disk in two places, the SQLite database and drill videos, so it needs a host with a **persistent disk**. A serverless host (e.g. Vercel) would first need PostgreSQL and object storage.

### Render (recommended; `render.yaml` included)

1. Push this repo to GitHub.
2. In Render: **New → Blueprint**, pick the repo. Render reads `render.yaml` and creates a Starter web service with a 1 GB disk at `/var/data`, a generated `SESSION_SECRET`, `DATABASE_URL=file:/var/data/pitchpath.db`, `UPLOAD_DIR=/var/data/uploads` and `DEMO_MODE=false`.
3. Enter `SITE_URL` when asked (your domain, or the `https://<name>.onrender.com` address to start), then **Apply**. The first deploy takes a few minutes.
4. Create your admin: open the service's **Shell** tab and run
   `npm run create-admin -- --email you@example.com --name "Your Name"`.
   It prints a temporary password once. Sign in and change it on the Account page.
5. Add your domain under **Settings → Custom Domains** and create the DNS records Render shows at your registrar. HTTPS is automatic. If the domain changes, update `SITE_URL` and redeploy so the sitemap and links use it.

Never run `npm run db:seed` or `db:reset` in production: they wipe all data. Render takes daily disk snapshots on paid plans; still keep your own backups of `/var/data`.

### Other hosts

Set the same environment variables, mount persistent storage, then build with `npm ci && npx prisma generate && npm run build` and start with `npx prisma db push --skip-generate && npm start`.

## Still to do before scale

1. Email delivery for invites, staff onboarding and password reset (needs an email provider, e.g. Postmark/SendGrid/Resend, and its API key). Today invite links and temporary passwords are shared manually.
2. Move the in-memory rate limiter to Redis if you run more than one server instance.
3. Drill videos: object storage + CDN, and transcoding to MP4 so every phone plays them. The 2-minute limit is checked in the browser; the 200 MB limit is enforced on the server.
4. A data-retention and privacy policy agreed with clubs (GDPR / COPPA as applicable), plus data export/delete for families.
5. Upgrade to Next.js 16 when convenient; until then `postcss` is pinned to a patched version via `overrides` in `package.json`.

## Project structure

```
prisma/schema.prisma      data model
prisma/seed.ts            demo data
src/lib/skills.ts         evaluation framework (pillars, skills, radar axes, positions)
src/lib/recommend.ts      goal and drill suggestions
src/lib/access.ts         who can see which players and teams
src/lib/player-data.ts    report card data (shared by page and PDF)
src/lib/pdf/              PDF report
src/app/page.tsx          marketing landing page
src/app/(app)/            signed-in app (dashboard, players, teams, drills, people, audit)
```
