import Link from "next/link";
import { ArrowLeft, FileCheck } from "lucide-react";

export default function TermsAndConditions() {
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
              <FileCheck size={25} />
            </div>

            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                Terms & Conditions
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
              Welcome to{" "}
              <strong className="text-ink">
                DigiProfilo
              </strong>
              .
            </p>

            <p className="mt-4 leading-7 text-muted">
              These Terms & Conditions govern your access to and use of the
              DigiProfilo website, digital visiting card services,
              product catalog services, professional profile services,
              biography services, resume services, QR codes, and related
              features.
            </p>

            <p className="mt-4 leading-7 text-muted">
              By creating an account, purchasing a subscription or using our
              services, you agree to be bound by these Terms & Conditions.
              If you do not agree with these terms, please do not use our
              services.
            </p>
          </div>

          {/* 1 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              1. Eligibility
            </h2>

            <p className="mt-4 leading-7 text-muted">
              You must be legally capable of entering into a binding
              agreement under applicable law to use DigiProfilo.
            </p>

            <p className="mt-4 leading-7 text-muted">
              By using our services, you confirm that the information you
              provide is accurate, complete and current.
            </p>
          </div>

          {/* 2 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              2. Account Registration
            </h2>

            <p className="mt-4 leading-7 text-muted">
              Some DigiProfilo features require you to create an account.
              You are responsible for providing accurate registration
              information and keeping your account information up to date.
            </p>

            <p className="mt-4 leading-7 text-muted">
              You are responsible for maintaining the security of your
              account and for activities performed through your account.
            </p>

            <p className="mt-4 leading-7 text-muted">
              If you believe your account has been accessed without
              authorization, you should contact us as soon as possible.
            </p>
          </div>

          {/* 3 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              3. Our Services
            </h2>

            <p className="mt-4 leading-7 text-muted">
              DigiProfilo provides tools that allow users to create and
              manage professional digital identities and profiles.
            </p>

            <p className="mt-4 leading-7 text-muted">
              Depending on the plan or service selected, features may
              include:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted">
              <li>Digital visiting cards</li>
              <li>Interactive product catalogs and e-commerce showcases</li>
              <li>Professional profiles</li>
              <li>Biographies and career stories</li>
              <li>Resume profiles and ATS formats</li>
              <li>Profile photographs and gallery assets</li>
              <li>Company and business information</li>
              <li>Social media and messaging links</li>
              <li>Business services and inquiries</li>
              <li>Public profile links and custom URLs</li>
              <li>QR code and contactless sharing functionality</li>
            </ul>

            <p className="mt-4 leading-7 text-muted">
              We reserve the right to modify, add or remove features from
              our services when reasonably necessary.
            </p>
          </div>

          {/* 4 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              4. User Content
            </h2>

            <p className="mt-4 leading-7 text-muted">
              You may upload or provide content such as photographs,
              company logos, biographies, resumes, descriptions, contact
              information and other professional information.
            </p>

            <p className="mt-4 leading-7 text-muted">
              You are solely responsible for the content you upload,
              publish or share through DigiProfilo.
            </p>

            <p className="mt-4 leading-7 text-muted">
              You confirm that you have the necessary rights and permissions
              to use and publish the content you provide.
            </p>
          </div>

          {/* 5 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              5. Prohibited Content and Activities
            </h2>

            <p className="mt-4 leading-7 text-muted">
              You must not use DigiProfilo to publish, upload, transmit
              or distribute content or information that:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted">
              <li>Is illegal or violates applicable laws</li>
              <li>Infringes another person&apos;s intellectual property</li>
              <li>Contains fraudulent or misleading information</li>
              <li>Contains malicious software or harmful code</li>
              <li>Harasses, threatens or abuses another person</li>
              <li>Contains obscene or unlawful material</li>
              <li>Attempts to impersonate another person or organization</li>
              <li>Attempts to gain unauthorized access to our systems</li>
              <li>Interferes with the operation of our services</li>
            </ul>
          </div>

          {/* 6 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              6. Public Profiles
            </h2>

            <p className="mt-4 leading-7 text-muted">
              DigiProfilo allows users to create public professional
              profiles that may be accessed through a public link or QR
              code.
            </p>

            <p className="mt-4 leading-7 text-muted">
              You understand that information you choose to publish on a
              public profile may be visible to other people.
            </p>

            <p className="mt-4 leading-7 text-muted">
              You are responsible for reviewing your profile before
              publishing it and ensuring that it does not contain
              confidential or sensitive information that you do not wish to
              make public.
            </p>
          </div>

          {/* 7 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              7. Subscription and Pricing
            </h2>

            <p className="mt-4 leading-7 text-muted">
              Certain DigiProfilo services may require a paid
              subscription or one-time payment.
            </p>

            <p className="mt-4 leading-7 text-muted">
              Prices, subscription periods and available features will be
              displayed on the applicable pricing or payment page before
              purchase.
            </p>

            <p className="mt-4 leading-7 text-muted">
              Subscription access will generally remain available for the
              purchased subscription period, subject to these Terms &
              Conditions.
            </p>
          </div>

          {/* 8 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              8. Payments
            </h2>

            <p className="mt-4 leading-7 text-muted">
              Payments may be processed through third-party payment
              providers. By making a payment, you agree to provide accurate
              payment and billing information.
            </p>

            <p className="mt-4 leading-7 text-muted">
              DigiProfilo is not responsible for failures caused by a
              third-party payment provider, including declined transactions,
              banking errors or payment-network interruptions.
            </p>
          </div>

          {/* 9 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              9. Refund and Cancellation
            </h2>

            <p className="mt-4 leading-7 text-muted">
              Refunds and cancellations are subject to the refund policy
              applicable to the specific service or subscription purchased.
            </p>

            <p className="mt-4 leading-7 text-muted">
              Where a service has already been activated or delivered, the
              availability of a refund may be limited, subject to applicable
              law and the terms displayed at the time of purchase.
            </p>

            <p className="mt-4 leading-7 text-muted">
              If you believe you have been charged incorrectly, please
              contact us with your transaction details.
            </p>
          </div>

          {/* 10 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              10. Intellectual Property
            </h2>

            <p className="mt-4 leading-7 text-muted">
              The DigiProfilo platform, including its design, branding,
              logos, software, interface, graphics, text and other original
              materials, is owned by or licensed to DigiProfilo and may
              be protected by applicable intellectual property laws.
            </p>

            <p className="mt-4 leading-7 text-muted">
              You may not copy, reproduce, modify, distribute, sell or
              commercially exploit our platform or its proprietary content
              without prior written permission.
            </p>
          </div>

          {/* 11 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              11. User Content Ownership
            </h2>

            <p className="mt-4 leading-7 text-muted">
              You retain ownership of the content you submit to
              DigiProfilo, subject to the rights necessary for us to
              provide the services.
            </p>

            <p className="mt-4 leading-7 text-muted">
              By submitting content, you grant DigiProfilo a limited,
              non-exclusive right to host, store, process, display and
              distribute that content as necessary to provide the services
              you request.
            </p>
          </div>

          {/* 12 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              12. Account Suspension or Termination
            </h2>

            <p className="mt-4 leading-7 text-muted">
              We may suspend, restrict or terminate an account if we
              reasonably believe that the user has violated these Terms &
              Conditions, applicable law, or otherwise misused the platform.
            </p>

            <p className="mt-4 leading-7 text-muted">
              We may also take action against content that violates our
              policies or creates a security, legal or operational risk.
            </p>
          </div>

          {/* 13 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              13. Service Availability
            </h2>

            <p className="mt-4 leading-7 text-muted">
              We aim to keep DigiProfilo available and reliable, but we
              do not guarantee uninterrupted or error-free access.
            </p>

            <p className="mt-4 leading-7 text-muted">
              Services may occasionally be unavailable because of
              maintenance, upgrades, technical problems, network failures
              or circumstances outside our reasonable control.
            </p>
          </div>

          {/* 14 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              14. Third-Party Services and Links
            </h2>

            <p className="mt-4 leading-7 text-muted">
              DigiProfilo may integrate with or provide links to
              third-party services, websites or platforms.
            </p>

            <p className="mt-4 leading-7 text-muted">
              We do not control third-party services and are not responsible
              for their content, availability, policies or practices.
            </p>
          </div>

          {/* 15 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              15. Disclaimer
            </h2>

            <p className="mt-4 leading-7 text-muted">
              DigiProfilo is provided on an &quot;as available&quot; and
              &quot;as is&quot; basis to the extent permitted by applicable
              law.
            </p>

            <p className="mt-4 leading-7 text-muted">
              We do not guarantee that the platform will always be
              uninterrupted, secure, completely accurate or free from
              technical errors.
            </p>
          </div>

          {/* 16 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              16. Limitation of Liability
            </h2>

            <p className="mt-4 leading-7 text-muted">
              To the maximum extent permitted by applicable law,
              DigiProfilo shall not be liable for indirect, incidental,
              special or consequential losses arising from the use of or
              inability to use our services.
            </p>

            <p className="mt-4 leading-7 text-muted">
              Nothing in these Terms is intended to exclude or limit
              liability that cannot legally be excluded or limited under
              applicable law.
            </p>
          </div>

          {/* 17 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              17. Indemnification
            </h2>

            <p className="mt-4 leading-7 text-muted">
              You agree to indemnify and hold DigiProfilo, its
              operators, employees and service providers harmless from
              claims, losses, damages or expenses arising from your
              violation of these Terms, misuse of the platform or violation
              of another person&apos;s rights.
            </p>
          </div>

          {/* 18 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              18. Privacy
            </h2>

            <p className="mt-4 leading-7 text-muted">
              Your use of DigiProfilo is also subject to our{" "}
              <Link
                href="/privacy-policy"
                className="font-semibold text-primary hover:text-primary"
              >
                Privacy Policy
              </Link>
              , which explains how we collect, use and protect your
              information.
            </p>
          </div>

          {/* 19 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              19. Changes to These Terms
            </h2>

            <p className="mt-4 leading-7 text-muted">
              We may update these Terms & Conditions from time to time to
              reflect changes to our services, business practices or legal
              requirements.
            </p>

            <p className="mt-4 leading-7 text-muted">
              Updated terms will be posted on this page with a revised
              &quot;Last updated&quot; date.
            </p>

            <p className="mt-4 leading-7 text-muted">
              Continued use of DigiProfilo after changes become effective
              constitutes acceptance of the updated terms, to the extent
              permitted by applicable law.
            </p>
          </div>

          {/* 20 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              20. Governing Law & Dispute Resolution
            </h2>

            <p className="mt-4 leading-7 text-muted">
              These Terms & Conditions and any dispute, controversy, or claim
              arising out of or relating to your use of DigiProfilo shall be
              governed by and construed in accordance with the laws of India,
              without regard to conflict of law principles.
            </p>

            <p className="mt-4 leading-7 text-muted">
              Subject to applicable consumer protection regulations, the
              competent courts located at Patna, Bihar, India shall have
              exclusive jurisdiction over all disputes, proceedings, and
              claims arising out of or in connection with these Terms and our
              services.
            </p>
          </div>

          {/* 21 */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-ink">
              21. Contact Information & Support
            </h2>

            <p className="mt-4 leading-7 text-muted">
              If you have any questions, inquiries, billing disputes, or
              support requests regarding these Terms & Conditions, please
              reach out to our official support team:
            </p>

            <div className="mt-5 space-y-2 rounded-xl border border-line bg-page p-5 text-sm leading-6 text-muted">
              <p>
                <strong className="text-ink">Entity:</strong> DigiProfilo Technologies
              </p>
              <p>
                <strong className="text-ink">Registered Office:</strong> 206, 2nd Floor, Brindavan Kunj, Exhibition Road, Patna, Bihar - 800001, India
              </p>
              <p>
                <strong className="text-ink">Official Email:</strong>{" "}
                <a
                  href="mailto:support@digiprofilo.com"
                  className="font-medium text-primary hover:underline"
                >
                  support@digiprofilo.com
                </a>
              </p>
              <p>
                <strong className="text-ink">Customer Care:</strong>{" "}
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
              href="/privacy-policy"
              className="transition hover:text-primary"
            >
              Privacy Policy
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}