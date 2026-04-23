"use client";

import { useFormState, useFormStatus } from "react-dom";
import { sendMagicLink, type SignInState } from "./actions";

const initial: SignInState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="signin-submit" disabled={pending}>
      {pending ? "sending…" : "send me a link"}
    </button>
  );
}

export function SignInForm({
  next,
  calloutError,
}: {
  next: string;
  calloutError?: string;
}) {
  const [state, formAction] = useFormState(sendMagicLink, initial);

  if (state.status === "sent") {
    return (
      <div className="signin-sent">
        <div className="signin-sent-emoji">📬</div>
        <p className="signin-sent-line">
          check <span className="signin-email">{state.email}</span>
        </p>
        <p className="signin-sent-sub">
          click the link we just sent — it&apos;ll bring you back here signed in.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="signin-form">
      <input type="hidden" name="next" value={next} />
      <input
        type="email"
        name="email"
        placeholder="you@yourdomain.com"
        autoComplete="email"
        required
        className="signin-input"
        aria-label="Email address"
      />
      <SubmitButton />
      {(state.status === "error" || calloutError) && (
        <p className="signin-error">{state.error ?? calloutError}</p>
      )}
    </form>
  );
}
