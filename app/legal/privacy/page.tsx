export const metadata = {
  title: "Privacy Policy · Potlucky",
  description:
    "How Potlucky collects, uses, and protects your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <header className="legal-header">
        <h1>Privacy Policy</h1>
        <p className="legal-effective">Last updated: April 23, 2026</p>
      </header>

      <section>
        <p>
          Potlucky is a small app for organizing potluck events. We try to
          collect as little information as we can, and we don&apos;t sell or
          share your data with advertisers.
        </p>
      </section>

      <section>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Your phone number</strong> — to sign you in via a
            one-time SMS code and, if you opt in, to send occasional event
            reminders from potlucks you&apos;ve joined.
          </li>
          <li>
            <strong>A display name</strong> that you pick for each potluck.
            This is shown to other people in that potluck so they know who
            brought what.
          </li>
          <li>
            <strong>Dietary preferences you choose to add</strong>{" "}
            (vegetarian, gluten-free, etc.) — shared with the other people
            in that specific potluck, so everyone can plan the menu.
          </li>
          <li>
            <strong>Dishes you add or claim</strong>, and any notes you
            write — shared with the other people in that specific potluck.
          </li>
          <li>
            <strong>Potluck metadata you create as a host</strong>: event
            name, date, and location. The location is visible only to
            people who have joined that potluck.
          </li>
          <li>
            <strong>Basic technical information</strong> like browser type,
            device info, IP address, and standard server logs — used for
            debugging and abuse prevention.
          </li>
        </ul>
      </section>

      <section>
        <h2>What we don&apos;t collect</h2>
        <p>
          We don&apos;t ask for or store passwords (authentication is via
          SMS code). We don&apos;t run third-party advertising or analytics
          that profile you across sites. We don&apos;t sell your data.
        </p>
      </section>

      <section>
        <h2>Who we share data with</h2>
        <p>
          Potlucky uses a small set of trusted service providers to operate
          the service:
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> — hosts our database and handles
            authentication. Your phone number, display name, and potluck
            data live here.
          </li>
          <li>
            <strong>Twilio</strong> — sends the SMS codes and event
            reminders. They process your phone number and the text of each
            message.
          </li>
          <li>
            <strong>Anthropic</strong> — powers our AI dish-suggestion and
            recipe features. We send the relevant dish titles and dietary
            tags for a given potluck; we do not send your phone number or
            identifying info.
          </li>
          <li>
            <strong>Vercel</strong> — hosts the website. Standard server
            logs.
          </li>
        </ul>
        <p>
          We share data with these providers only as needed to run the
          service. We do not sell your personal information, and we do not
          share it with advertisers.
        </p>
      </section>

      <section>
        <h2>Location privacy</h2>
        <p>
          Potluck addresses are treated as private. Only people who have
          signed in and joined a specific potluck can see its address. The
          address is never included in shareable link previews (OpenGraph
          cards), so someone who sees a Potlucky link in a social feed or
          group chat cannot see the address without signing in and joining.
        </p>
      </section>

      <section>
        <h2>Retention</h2>
        <p>
          We keep your account data as long as your account is active. If
          you delete your account, we delete your phone number, display
          names, and membership records. Potluck events you hosted may
          persist with your display name removed if other guests are still
          active in them. You can request deletion at any time by emailing{" "}
          <a href="mailto:hello@potlucky.com">hello@potlucky.com</a>.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          You can request access to, correction of, or deletion of your
          personal information at any time by emailing{" "}
          <a href="mailto:hello@potlucky.com">hello@potlucky.com</a>. If you
          are in a jurisdiction with specific data rights (e.g., GDPR,
          CCPA), we&apos;ll honor those rights.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          Potlucky is not directed at children under 13, and we do not
          knowingly collect personal information from them. If you believe
          we have, please contact us so we can delete it.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          If we update this policy in a material way, we&apos;ll update the
          &quot;last updated&quot; date at the top. For significant changes,
          we may also notify you via text or email.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions or concerns? Email{" "}
          <a href="mailto:hello@potlucky.com">hello@potlucky.com</a>.
        </p>
      </section>
    </>
  );
}
