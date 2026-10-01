import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-page">

      {/* Header */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">

          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-primary"
          >
            <ArrowLeft size={17} />
            Back to Home
          </Link>

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-accent">
              <ShieldCheck size={25} />
            </div>

            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                Privacy Policy
              </h1>

              <p className="mt-2 text-sm text-muted">
                Last updated: August 29, 2026
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-6 lg:px-8">

        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-10">

          {/* Introduction */}
          <div>
            <p className="leading-7 text-muted">
              Welcome to <strong className="text-ink">DigiProfilo</strong>.
              We respect your privacy and are committed to protecting the
              personal information you provide while using our platform.
            </p>

            <p className="mt-4 leading-7 text-muted">
              This Privacy Policy explains what information we collect, how
              we use it, how we protect it, and your rights regarding your
              information when you use our website and services.
            </p>
          </div>

          {/* 1 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              1. Information We Collect
            </h2>

            <p className="mt-4 leading-7 text-muted">
              When you create an account or use DigiProfilo, we may collect
              information that you voluntarily provide to us, including:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted">
              <li>Full name</li>
              <li>Mobile number</li>
              <li>Email address</li>
              <li>Company or business name</li>
              <li>Designation and professional information</li>
              <li>Business address</li>
              <li>Website and social media links</li>
              <li>Profile photographs and company logos</li>
              <li>Biography and professional information</li>
              <li>Resume information</li>
              <li>Services and business details</li>
              <li>Other information that you choose to add to your profile</li>
            </ul>
          </div>

          {/* 2 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              2. How We Use Your Information
            </h2>

            <p className="mt-4 leading-7 text-muted">
              We use the information we collect to provide, maintain and
              improve our services. This may include:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted">
              <li>Creating and managing your DigiProfilo account</li>
              <li>Creating your digital visiting card and professional profile</li>
              <li>Providing biography and resume services</li>
              <li>Processing payments and subscriptions</li>
              <li>Providing customer support</li>
              <li>Improving website performance and user experience</li>
              <li>Preventing unauthorized access and misuse</li>
              <li>Communicating important account or service updates</li>
            </ul>
          </div>

          {/* 3 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              3. Public Profile Information
            </h2>

            <p className="mt-4 leading-7 text-muted">
              DigiProfilo allows you to create a public professional
              profile that can be shared through a link or QR code.
            </p>

            <p className="mt-4 leading-7 text-muted">
              Information that you choose to publish on your digital profile,
              such as your name, profile photograph, company information,
              contact details, social links, biography, services or resume,
              may be visible to anyone who has access to your public profile
              link.
            </p>

            <p className="mt-4 leading-7 text-muted">
              You are responsible for ensuring that you do not publish
              sensitive or confidential information that you do not want
              publicly accessible.
            </p>
          </div>

          {/* 4 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              4. Payment Information
            </h2>

            <p className="mt-4 leading-7 text-muted">
              Payments for DigiProfilo services may be processed through
              third-party payment providers. We may receive transaction
              information such as payment status, transaction reference and
              subscription information.
            </p>

            <p className="mt-4 leading-7 text-muted">
              We do not intentionally store your complete debit card, credit
              card, UPI or banking credentials on our servers. Payment
              information is handled by the applicable payment provider
              according to its privacy and security practices.
            </p>
          </div>

          {/* 5 */}
          <div id="cookies" className="mt-10 scroll-mt-24">
            <h2 className="text-xl font-bold text-ink">
              5. Cookies and Similar Technologies
            </h2>

            <p className="mt-4 leading-7 text-muted">
              We may use cookies, local storage and similar technologies to
              maintain login sessions, remember preferences, improve security
              and understand how our services are used.
            </p>
          </div>

          {/* 6 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              6. Data Security
            </h2>

            <p className="mt-4 leading-7 text-muted">
              We take reasonable technical and organizational measures to
              protect your information from unauthorized access, alteration,
              disclosure or destruction.
            </p>

            <p className="mt-4 leading-7 text-muted">
              However, no method of transmission or electronic storage is
              completely secure, and we cannot guarantee absolute security.
            </p>
          </div>

          {/* 7 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              7. Data Retention
            </h2>

            <p className="mt-4 leading-7 text-muted">
              We retain your information for as long as necessary to provide
              our services, maintain your account, comply with legal
              obligations, resolve disputes and enforce our agreements.
            </p>

            <p className="mt-4 leading-7 text-muted">
              If your account or subscription expires, certain information
              may remain stored for a reasonable period according to our
              operational and legal requirements.
            </p>
          </div>

          {/* 8 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              8. Third-Party Services
            </h2>

            <p className="mt-4 leading-7 text-muted">
              We may use trusted third-party service providers for services
              such as payment processing, cloud storage, authentication,
              analytics, hosting and communication.
            </p>

            <p className="mt-4 leading-7 text-muted">
              These providers may process information on our behalf and are
              expected to handle information in accordance with applicable
              security and privacy requirements.
            </p>
          </div>

          {/* 9 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              9. Your Rights
            </h2>

            <p className="mt-4 leading-7 text-muted">
              Depending on applicable law, you may have rights regarding your
              personal information, including the right to:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Update your profile information</li>
              <li>Request deletion of your information</li>
              <li>Withdraw consent where applicable</li>
              <li>Ask questions about how your information is processed</li>
            </ul>
          </div>

          {/* 10 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              10. Account Security
            </h2>

            <p className="mt-4 leading-7 text-muted">
              You are responsible for maintaining the confidentiality of
              information used to access your account. You should notify us
              if you believe that your account has been accessed without
              authorization.
            </p>
          </div>

          {/* 11 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              11. Children&apos;s Privacy
            </h2>

            <p className="mt-4 leading-7 text-muted">
              DigiProfilo is intended for users who are legally permitted
              to use online services. We do not knowingly collect personal
              information from children where such collection is prohibited
              by applicable law.
            </p>
          </div>

          {/* 12 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              12. Changes to This Privacy Policy
            </h2>

            <p className="mt-4 leading-7 text-muted">
              We may update this Privacy Policy from time to time to reflect
              changes to our services, technology or legal requirements.
            </p>

            <p className="mt-4 leading-7 text-muted">
              Any updated version will be posted on this page with a revised
              &quot;Last updated&quot; date.
            </p>
          </div>

          {/* 13 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              13. Contact Information
            </h2>

            <p className="mt-4 leading-7 text-muted">
              If you have any questions, concerns, or requests regarding this
              Privacy Policy, your personal data, or wish to exercise your
              privacy rights, please contact our privacy desk:
            </p>

            <div className="mt-5 space-y-2 rounded-xl border border-line bg-page p-5 text-sm leading-6 text-muted">
              <p>
                <strong className="text-ink">Entity:</strong> DigiProfilo Technologies
              </p>
              <p>
                <strong className="text-ink">Address:</strong> 206, 2nd Floor, Brindavan Kunj, Exhibition Road, Patna, Bihar - 800001, India
              </p>
              <p>
                <strong className="text-ink">Privacy Support:</strong>{" "}
                <a
                  href="mailto:support@digiprofilo.com"
                  className="font-medium text-primary hover:underline"
                >
                  support@digiprofilo.com
                </a>
              </p>
              <p>
                <strong className="text-ink">Phone:</strong>{" "}
                <a
                  href="tel:+918709122663"
                  className="font-medium text-primary hover:underline"
                >
                  +91 87091 22663
                </a>{" "}
                (Mon – Sat, 9:00 AM – 7:00 PM IST)
              </p>
            </div>
          </div>

          {/* 14 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              14. Grievance Redressal Officer
            </h2>

            <p className="mt-4 leading-7 text-muted">
              In accordance with the Information Technology Act, 2000 and the
              Information Technology (Intermediary Guidelines and Digital Media
              Ethics Code) Rules, 2021, the details of the designated Grievance
              Officer are provided below:
            </p>

            <div className="mt-5 space-y-2 rounded-xl border border-line bg-page p-5 text-sm leading-6 text-muted">
              <p>
                <strong className="text-ink">Designation:</strong> Grievance Officer, DigiProfilo Technologies
              </p>
              <p>
                <strong className="text-ink">Email:</strong>{" "}
                <a
                  href="mailto:support@digiprofilo.com"
                  className="font-medium text-primary hover:underline"
                >
                  support@digiprofilo.com
                </a>
              </p>
              <p>
                <strong className="text-ink">Postal Address:</strong> 206, 2nd Floor, Brindavan Kunj, Exhibition Road, Patna, Bihar - 800001, India
              </p>
              <p>
                <strong className="text-ink">Turnaround Time:</strong> Grievances are acknowledged within 24–48 hours and resolved within 15 calendar days of receipt.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row">

          <p>
            © {new Date().getFullYear()} DigiProfilo. All rights reserved.
          </p>

          <div className="flex gap-5">
            <Link
              href="/"
              className="transition hover:text-primary"
            >
              Home
            </Link>

            <Link
              href="/terms-and-conditions"
              className="transition hover:text-primary"
            >
              Terms & Conditions
            </Link>
          </div>

        </div>

      </section>

    </main>
  );
}