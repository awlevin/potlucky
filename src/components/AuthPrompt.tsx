import Link from "next/link";

type Props = {
  message: string;
  next?: string;
  linkLabel?: string;
};

export function AuthPrompt({ message, next, linkLabel = "sign in" }: Props) {
  const href = next ? `/auth/sign-in?next=${encodeURIComponent(next)}` : "/auth/sign-in";
  return (
    <div className="auth-prompt" role="status">
      <span className="auth-prompt-lock" aria-hidden="true">
        🔒
      </span>
      <span>
        {message}{" "}
        <Link className="auth-prompt-link" href={href}>
          {linkLabel}
        </Link>
      </span>
    </div>
  );
}
