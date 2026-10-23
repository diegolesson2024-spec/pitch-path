import { requireUser } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/skills";
import { Card, PageHeader } from "@/components/ui";
import { PasswordForm } from "./PasswordForm";
import { signOutEverywhere } from "./actions";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader eyebrow={ROLE_LABEL[user.role]} title="Your" accent="account" />
      <Card title="Details">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-xs text-mute">Name</dt><dd className="font-semibold">{user.name}</dd></div>
          <div><dt className="text-xs text-mute">Email</dt><dd className="font-semibold break-all">{user.email}</dd></div>
          {user.clubName && <div><dt className="text-xs text-mute">Club</dt><dd className="font-semibold">{user.clubName}</dd></div>}
        </dl>
      </Card>
      <Card title="Change password">
        <PasswordForm />
      </Card>
      <Card title="Signed-in devices">
        <p className="mb-4 text-sm text-mute">Lost a phone or used a shared computer? Sign out of PitchPath everywhere, including this device.</p>
        <form action={signOutEverywhere}>
          <button className="btn btn-ghost">Sign out everywhere</button>
        </form>
      </Card>
    </div>
  );
}
