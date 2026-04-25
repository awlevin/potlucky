import { SignInForm } from "./SignInForm";

export const metadata = {
  title: "Sign in · Potlucky",
};

export default function SignInPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  return (
    <main className="signin-page">
      <div className="signin-card">
        <h1 className="signin-title">drop your email</h1>
        <p className="signin-subtitle">
          we&apos;ll send you a sign-in link. no password, no fuss.
        </p>
        <SignInForm
          next={searchParams.next ?? "/"}
          calloutError={searchParams.error === "callback" ? "Your link expired or was already used. Try again." : undefined}
        />
      </div>
    </main>
  );
}
