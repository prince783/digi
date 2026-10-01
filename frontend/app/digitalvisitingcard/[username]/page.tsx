import connectDB from "@/app/lib/db";
import DigitalCard from "@/app/models/DigitalCard";

import PublicCardClient from "./PublicCardClient";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function DigitalVisitingCardPage({
  params,
}: PageProps) {
  const { username } = await params;

  await connectDB();

  /* =========================================================
     FIND CARD
  ========================================================= */

  const card = await DigitalCard.findOne({
    username: username.toLowerCase(),
  }).lean();

  /* =========================================================
     CARD NOT FOUND
  ========================================================= */

  if (!card) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-4">
        <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-page">
            <span className="text-2xl">🔍</span>
          </div>

          <h1 className="text-xl font-bold text-ink">
            Card Not Found
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted">
            The digital visiting card you are looking
            for does not exist or has been removed.
          </p>
        </div>
      </main>
    );
  }

  /* =========================================================
     SUSPENDED CARD
     
     IMPORTANT:
     This check comes BEFORE payment status.
  ========================================================= */

  if (card.accountStatus === "suspended") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">

          {/* ICON */}

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-red-600"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
              />

              <path d="M8 8l8 8" />

              <path d="M16 8l-8 8" />
            </svg>
          </div>

          {/* TITLE */}

          <h1 className="text-xl font-bold text-ink">
            Card Temporarily Suspended
          </h1>

          {/* DESCRIPTION */}

          <p className="mt-3 text-sm leading-6 text-muted">
            This digital visiting card is currently
            unavailable because it has been suspended
            by the administrator.
          </p>

          {/* ADMIN MESSAGE */}

          <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-800">
              Need Help?
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-700">
              Please contact the administrator to
              reactivate this digital visiting card.
            </p>
          </div>

          {/* SUSPENSION REASON */}

          {card.suspensionReason && (
            <div className="mt-4 rounded-xl bg-page p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Suspension Reason
              </p>

              <p className="mt-1 text-sm leading-6 text-muted">
                {card.suspensionReason}
              </p>
            </div>
          )}

          {/* FOOTER */}

          <p className="mt-6 text-xs text-muted">
            Please contact your administrator for
            further assistance.
          </p>
        </div>
      </main>
    );
  }

  /* =========================================================
     PAYMENT PENDING
  ========================================================= */

  if (card.paymentStatus === "pending") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-4">
        <div className="w-full max-w-md rounded-2xl border border-amber-100 bg-white p-8 text-center shadow-sm">

          {/* ICON */}

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-amber-600"
            >
              <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
              />

              <path d="M3 10h18" />

              <path d="M7 15h4" />
            </svg>
          </div>

          {/* TITLE */}

          <h1 className="text-xl font-bold text-ink">
            Payment Not Completed
          </h1>

          {/* DESCRIPTION */}

          <p className="mt-3 text-sm leading-6 text-muted">
            Payment for this digital visiting card
            has not been completed yet.
          </p>

          {/* PAYMENT MESSAGE */}

          <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-800">
              Payment Required
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-700">
              Please complete the payment to activate
              and publish this digital visiting card.
            </p>
          </div>

          {/* FOOTER */}

          <p className="mt-6 text-xs leading-5 text-muted">
            If you have already completed the payment,
            please contact the administrator.
          </p>
        </div>
      </main>
    );
  }

  /* =========================================================
     PAYMENT FAILED
  ========================================================= */

  if (card.paymentStatus === "failed") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">

          {/* ICON */}

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <span className="text-2xl">✕</span>
          </div>

          {/* TITLE */}

          <h1 className="text-xl font-bold text-ink">
            Payment Failed
          </h1>

          {/* DESCRIPTION */}

          <p className="mt-3 text-sm leading-6 text-muted">
            The payment for this digital visiting
            card could not be completed.
          </p>

          {/* MESSAGE */}

          <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800">
              Payment Required
            </p>

            <p className="mt-1 text-xs leading-5 text-red-700">
              Please complete a successful payment
              before this card can be activated.
            </p>
          </div>

          {/* FOOTER */}

          <p className="mt-6 text-xs text-muted">
            If you believe this is an error, please
            contact the administrator.
          </p>
        </div>
      </main>
    );
  }

  /* =========================================================
     EXPIRED CARD
  ========================================================= */

  const isCardExpired =
    card.accountStatus === "expired" ||
    Boolean(card.subscriptionEnd && new Date() > new Date(card.subscriptionEnd));

  if (isCardExpired) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-4">
        <div className="w-full max-w-md rounded-2xl border border-orange-100 bg-white p-8 text-center shadow-sm">

          {/* ICON */}

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
            <span className="text-2xl">⚠️</span>
          </div>

          {/* TITLE */}

          <h1 className="text-xl font-bold text-ink">
            Card Expired
          </h1>

          {/* DESCRIPTION */}

          <p className="mt-3 text-sm leading-6 text-muted">
            This digital visiting card is no longer
            active because its subscription has
            expired.
          </p>

          {/* ADMIN MESSAGE */}

          <div className="mt-6 rounded-xl border border-orange-100 bg-orange-50 p-4">
            <p className="text-sm font-semibold text-orange-800">
              Subscription Expired
            </p>

            <p className="mt-1 text-xs leading-5 text-orange-700">
              Please contact the administrator to
              renew or reactivate this card.
            </p>
          </div>

          {/* FOOTER */}

          <p className="mt-6 text-xs text-muted">
            Please contact your administrator for
            further assistance.
          </p>
        </div>
      </main>
    );
  }

  /* =========================================================
     PENDING ACCOUNT STATUS
  ========================================================= */

  if (card.accountStatus === "pending") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-4">
        <div className="w-full max-w-md rounded-2xl border border-amber-100 bg-white p-8 text-center shadow-sm">

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <span className="text-2xl">⏳</span>
          </div>

          <h1 className="text-xl font-bold text-ink">
            Card Pending Activation
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted">
            This digital visiting card is currently
            waiting for activation.
          </p>

          <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-800">
              Card Not Active
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-700">
              Please complete the required steps or
              contact the administrator.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     FINAL SECURITY CHECK
     
     ONLY ACTIVE + PAID + PUBLISHED CARD
     CAN BE DISPLAYED.
  ========================================================= */

  if (
    card.accountStatus !== "active" ||
    card.paymentStatus !== "paid" ||
    card.isPublished !== true
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-4">
        <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-sm">

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-page">
            <span className="text-2xl">🔒</span>
          </div>

          <h1 className="text-xl font-bold text-ink">
            Card Unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted">
            This digital visiting card is currently
            unavailable.
          </p>

          <p className="mt-5 text-xs leading-5 text-muted">
            Please contact the administrator for
            further assistance.
          </p>
        </div>
      </main>
    );
  }

  /* =========================================================
     ACTIVE CARD
     
     At this point:
     
     accountStatus = active
     paymentStatus = paid
     isPublished = true
  ========================================================= */

  const plainCard = JSON.parse(
    JSON.stringify(card)
  );

  return (
    <PublicCardClient
      card={plainCard}
    />
  );
}