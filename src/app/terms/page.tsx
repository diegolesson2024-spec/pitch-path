import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata = {
  title: "Terms of Use",
  description: "The rules for clubs, coaches, parents and players using PitchPath.",
};

// Draft written for how PitchPath works today. Have it reviewed before relying on it.
export default function TermsPage() {
  const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
  return (
    <LegalPage title="Terms of Use" updated="27 October 2026">
      <p>
        These terms apply to everyone who uses PitchPath: club directors, coaches, parents and players. By creating an account or signing in,
        you agree to them. Please also read our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Club accounts</h2>
      <ul>
        <li>The person who creates a club account must be authorised by that club to do so.</li>
        <li>The club is responsible for the people it invites and the information it adds, including getting a parent or guardian&apos;s consent before adding any child&apos;s information.</li>
        <li>Keep your password private. Tell us straight away if you think someone else has used your account.</li>
      </ul>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>add information about a child without permission, or anything unlawful, abusive or discriminatory;</li>
        <li>upload videos showing other people without their permission (or their guardian&apos;s, for children), or anything that isn&apos;t a training drill;</li>
        <li>try to access another club&apos;s or another family&apos;s information, or get around the site&apos;s security;</li>
        <li>copy, resell or scrape the service or its drill library.</li>
      </ul>
      <p>We may suspend accounts that break these rules, especially where a child&apos;s safety or privacy is at risk.</p>

      <h2>Your content</h2>
      <p>
        Clubs and coaches own the evaluations, notes, drills and videos they create. You give PitchPath permission to store and display them to
        the people you choose, only to run the service. You can delete your drills at any time.
      </p>

      <h2>Coaching advice</h2>
      <p>
        Drills and development plans are suggestions to support coaching, not medical or professional advice. Players should train within their
        ability, with suitable supervision and equipment. Stop any exercise that causes pain.
      </p>

      <h2>Availability</h2>
      <p>
        We work to keep PitchPath running and your data safe, but the service is provided &quot;as is&quot;. We can&apos;t promise it will never be
        unavailable or error-free. To the extent the law allows, PitchPath is not liable for indirect losses arising from using the service.
      </p>

      <h2>Ending your account</h2>
      <p>
        A club can stop using PitchPath at any time by emailing {mail}; we will then delete its information as described in the Privacy Policy.
        We may close accounts that are inactive for a long period, with notice to the club first.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms. If a change matters, we will update the date above and let clubs know before it applies.</p>

      <h2>Contact</h2>
      <p>Questions about these terms: {mail}.</p>
    </LegalPage>
  );
}
