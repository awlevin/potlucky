export const metadata = {
  title: "SMS Terms · Potlucky",
  description:
    "Potlucky's SMS program: what we text you, how often, and how to opt out.",
};

export default function SmsTermsPage() {
  return (
    <>
      <header className="legal-header">
        <h1>SMS Terms</h1>
        <p className="legal-effective">Last updated: April 23, 2026</p>
      </header>

      <section>
        <h2>What we text you</h2>
        <p>
          When you sign in to Potlucky with your phone number, we send a
          one-time 6-digit code via SMS to verify it&apos;s you. If you opt
          in during sign-up (or in your account settings), we&apos;ll also
          text you occasional reminders about potlucks you&apos;ve joined —
          for example, a nudge the day before the event, or a note from the
          host.
        </p>
      </section>

      <section>
        <h2>How often</h2>
        <p>
          Expect roughly <strong>3–5 messages per month</strong> per active
          potluck you&apos;re part of. Sign-in codes are only sent when you
          request one. Event reminders are limited to the potlucks you join,
          and hosts can only message their own guests.
        </p>
      </section>

      <section>
        <h2>How you opt in</h2>
        <p>
          You consent to receive these texts by submitting your phone number
          on our sign-in form at{" "}
          <a href="/auth/sign-in">potlucky.com/auth/sign-in</a>. The sign-in
          form clearly discloses that we&apos;ll text you a code and, if
          enabled, event reminders.
        </p>
      </section>

      <section>
        <h2>How to opt out</h2>
        <p>
          Reply <strong>STOP</strong> to any Potlucky text at any time and
          we&apos;ll stop sending event reminders to that number. You can
          also toggle event reminders off in your account settings. Note
          that opting out of marketing/reminder texts doesn&apos;t prevent
          us from sending the one-time sign-in code when you request to log
          in — that&apos;s a transactional message and required to use the
          service.
        </p>
        <p>
          Reply <strong>HELP</strong> for help, or email{" "}
          <a href="mailto:aaron@potlucky.com">aaron@potlucky.com</a>.
        </p>
      </section>

      <section>
        <h2>Costs</h2>
        <p>
          Message and data rates may apply. Potlucky does not charge you for
          these texts, but your mobile carrier may, depending on your plan.
        </p>
      </section>

      <section>
        <h2>Carriers</h2>
        <p>
          Supported carriers include AT&amp;T, Verizon, T-Mobile, Sprint,
          and other major US/Canadian carriers. Carriers are not liable for
          delayed or undelivered messages.
        </p>
      </section>

      <section>
        <h2>Privacy &amp; contact</h2>
        <p>
          See our <a href="/legal/privacy">Privacy Policy</a> for details on
          how your phone number is stored and used. For any questions about
          our SMS program, contact{" "}
          <a href="mailto:aaron@potlucky.com">aaron@potlucky.com</a>.
        </p>
      </section>
    </>
  );
}
