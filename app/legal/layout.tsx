import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="legal-page">
      <div className="legal-container">
        <Link href="/" className="legal-home-link">
          ← potlucky
        </Link>
        <article className="legal-article">{children}</article>
      </div>
    </main>
  );
}
