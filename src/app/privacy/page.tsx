import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata = {
  title: "Privacy Policy",
  description: "What PitchPath collects about clubs, coaches, parents and young players, who can see it, and how to have it changed or deleted.",
};

// Draft written from what the app actually stores. Have it reviewed before relying on it.
export default function PrivacyPage() {
  const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
  return (
    <LegalPage title="Privacy Policy" updated="27 October 2026">
      <p>
        PitchPath helps soccer clubs track and support young players&apos; development. Because most of the people it describes are children,
        we collect as little as we can, keep it inside each club, and never sell it or use it for advertising.
      </p>

      <h2>Who is responsible</h2>
      <p>
        Each club that signs up decides what information about its players goes into PitchPath and is responsible for having permission to add it.
        PitchPath stores and protects that information for the club. Questions about a particular child&apos;s information can go to their club or to us at {mail}.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account details:</strong> name, email address, role (club director, coach, parent or player) and club. Passwords are stored only in scrambled (hashed) form; nobody, including us, can read them.</li>
        <li><strong>Player information added by the club:</strong> name, date of birth, position, team, skill evaluations and scores, development goals, coach feedback and notes, match statistics, attendance and home-practice records.</li>
        <li><strong>Uploads:</strong> drill demonstration videos uploaded by coaches, and match-stat files uploaded by parents when the coach allows it.</li>
        <li><strong>Records of activity:</strong> an audit log of important actions (for example sign-ins, evaluations, access changes and report downloads) so clubs can see who did what.</li>
      </ul>
      <p>We do not collect payment details, location, contacts, or anything from a device beyond what is needed to sign in.</p>

      <h2>Guardian consent</h2>
      <p>
        Clubs must have a parent or guardian&apos;s consent before adding a child&apos;s information. A player under 18 can only get their own login
        after the club has recorded that consent, and only through an invitation from club staff.
      </p>

      <h2>Who can see it</h2>
      <ul>
        <li>Club directors see their own club only. Coaches see only the teams they coach.</li>
        <li>Parents and players see only their own child or themselves, and never staff-only notes or unpublished evaluations.</li>
        <li>Nobody at another club can see your club&apos;s information.</li>
        <li>PitchPath&apos;s administrators can access data only to run, support and protect the service.</li>
      </ul>

      <h2>How we use it</h2>
      <p>
        Only to provide PitchPath: showing evaluations, plans and progress, sending in-app notifications and reminders, producing PDF reports,
        and keeping the service secure. We do not sell personal information, share it with advertisers, or use it to build profiles for anyone else.
      </p>

      <h2>Cookies</h2>
      <p>We use one essential cookie to keep you signed in. It expires after 8 hours. There are no advertising or tracking cookies.</p>

      <h2>Service providers</h2>
      <p>
        The site and its database are hosted by Render (render.com) in the United States, and our domain&apos;s traffic passes through Cloudflare.
        If password-reset emails are switched on, they are sent through Resend. These providers process data only to run their part of the service.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep a club&apos;s information while it uses PitchPath. When a club closes its account, or a parent asks the club for their child&apos;s
        information to be removed, we delete it, apart from anything we must keep by law.
      </p>

      <h2>Your choices</h2>
      <p>
        Parents and players can ask to see, correct or delete their information, or withdraw consent, by contacting their club or emailing {mail}.
        We will respond within 30 days. Withdrawing consent means the player&apos;s own login and family access are removed.
      </p>

      <h2>Security</h2>
      <p>
        All traffic is encrypted (HTTPS). Passwords are hashed, sessions can be signed out everywhere, every page checks who is allowed to see what,
        and important actions are logged. No system is perfectly secure; if we ever become aware of a breach affecting your information, we will tell the affected clubs promptly.
      </p>

      <h2>Children</h2>
      <p>
        PitchPath is used by clubs on behalf of children, not marketed to them. Children cannot sign up by themselves. If you believe a child&apos;s
        information was added without permission, email {mail} and we will remove it.
      </p>

      <h2>Changes</h2>
      <p>If we change this policy in a meaningful way, we will update the date above and let clubs know.</p>

      <h2>Contact</h2>
      <p>Email {mail}. See also our <Link href="/terms">Terms of Use</Link>.</p>
    </LegalPage>
  );
}
