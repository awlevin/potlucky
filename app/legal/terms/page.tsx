export const metadata = {
  title: "Terms of Service · Potlucky",
  description: "The rules for using Potlucky.",
};

export default function TermsPage() {
  return (
    <>
      <header className="legal-header">
        <h1>Terms of Service</h1>
        <p className="legal-effective">Last updated: April 23, 2026</p>
      </header>

      <section>
        <p>
          Welcome to Potlucky. These Terms of Service (&quot;Terms&quot;)
          govern your use of potlucky.com and its related services (the
          &quot;Service&quot;). By using Potlucky, you agree to these
          Terms.
        </p>
      </section>

      <section>
        <h2>Who can use Potlucky</h2>
        <p>
          You must be at least 13 years old to use Potlucky. If
          you&apos;re under 18, please make sure a parent or guardian has
          agreed to these Terms on your behalf.
        </p>
      </section>

      <section>
        <h2>Your account</h2>
        <p>
          We authenticate you by SMS code sent to a phone number you
          provide. You&apos;re responsible for the security of the phone
          number and device you use to sign in. If you think your account
          has been compromised, email us at{" "}
          <a href="mailto:aaron@potlucky.com">aaron@potlucky.com</a>.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <p>Don&apos;t use Potlucky to:</p>
        <ul>
          <li>Harass, threaten, or harm other people.</li>
          <li>Post content that is illegal, hateful, or sexually explicit.</li>
          <li>
            Spam, mass-message, or misuse the SMS reminder system to send
            content unrelated to the potluck.
          </li>
          <li>
            Impersonate someone else or misrepresent your affiliation with
            a person or organization.
          </li>
          <li>
            Attempt to break, probe, or overload the service, or interfere
            with other users&apos; access.
          </li>
          <li>Scrape, crawl, or automate use of the service at scale.</li>
        </ul>
        <p>
          We may suspend or terminate accounts that violate these rules.
        </p>
      </section>

      <section>
        <h2>Your content</h2>
        <p>
          You keep ownership of the content you post to Potlucky — dish
          names, notes, display names, dietary info, etc. By posting it,
          you grant Potlucky a non-exclusive, royalty-free license to
          display, store, and transmit it as needed to run the service
          (e.g., showing your dish on the menu of your potluck).
        </p>
        <p>
          You&apos;re responsible for the content you post. Don&apos;t
          post anything you don&apos;t have the right to share.
        </p>
      </section>

      <section>
        <h2>Host responsibilities</h2>
        <p>
          If you create a potluck, you&apos;re the host of that event.
          You&apos;re responsible for the accuracy of the event details
          (location, date, etc.) and for how you invite guests. When you
          share a link, only people who sign in and join the potluck can
          see the address. Don&apos;t invite people who haven&apos;t
          consented to receive your messages, and don&apos;t use the SMS
          reminder feature for anything other than event-related updates.
        </p>
      </section>

      <section>
        <h2>Service availability</h2>
        <p>
          Potlucky is provided &quot;as is.&quot; We do our best to keep
          the service up and working, but we don&apos;t guarantee it will
          be uninterrupted, error-free, or available in any particular
          region. We may change, suspend, or discontinue features at any
          time.
        </p>
      </section>

      <section>
        <h2>Disclaimers</h2>
        <p>
          To the maximum extent permitted by law, Potlucky is provided
          without warranties of any kind, express or implied, including
          warranties of merchantability, fitness for a particular purpose,
          and non-infringement.
        </p>
      </section>

      <section>
        <h2>Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, Potlucky and its
          operators will not be liable for any indirect, incidental,
          special, consequential, or punitive damages arising out of your
          use of the service, including lost profits, lost data, or
          business interruption, even if we have been advised of the
          possibility of such damages.
        </p>
      </section>

      <section>
        <h2>Termination</h2>
        <p>
          You can stop using Potlucky at any time. Email{" "}
          <a href="mailto:aaron@potlucky.com">aaron@potlucky.com</a> to
          request deletion of your account. We may suspend or terminate
          your access if you violate these Terms.
        </p>
      </section>

      <section>
        <h2>Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. If we make a
          material change, we&apos;ll update the &quot;last updated&quot;
          date at the top of the page. Your continued use of Potlucky
          after the update means you accept the new Terms.
        </p>
      </section>

      <section>
        <h2>Governing law</h2>
        <p>
          These Terms are governed by the laws of the State of California,
          USA, without regard to its conflict-of-laws rules. Disputes will
          be resolved in the state or federal courts located in San
          Francisco, California.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about these Terms? Email{" "}
          <a href="mailto:aaron@potlucky.com">aaron@potlucky.com</a>.
        </p>
      </section>
    </>
  );
}
