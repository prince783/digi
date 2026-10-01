"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  DigitalCardProvider,
} from "@/app/dashboard/projects/create-project/digicards/components/DigitalCardEditor";

import {
  PublicCardPreview,
} from "@/app/dashboard/projects/create-project/digicards/components/LivePreview";

import type {
  DigitalCardData,
} from "@/app/dashboard/projects/create-project/digicards/components/DigitalCardEditor";

import {
  ArrowLeft,
  Lock,
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  CheckCircle2,
  CalendarDays,
  Copy,
  Eye,
  Share2,
  Download,
  Plus,
  BarChart3,
  FolderOpen,
  Crown,
  ArrowRight,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface PaymentClientProps {
  card: DigitalCardData;
  alreadyPaid?: boolean;
  baseAmount?: number;
}

interface PricingResponse {
  success?: boolean;

  price?: number | string;

  yearlyPrice?: number | string;

  amount?: number | string;

  data?: {
    price?: number | string;
    yearlyPrice?: number | string;
    amount?: number | string;
  };

  pricing?: {
    price?: number | string;
    yearlyPrice?: number | string;
    amount?: number | string;
  };

  message?: string;
}

/* =========================================================
   MAIN PAYMENT CLIENT
========================================================= */

export default function PaymentClient({
  card,
  alreadyPaid = false,
  baseAmount = 0,
}: PaymentClientProps) {
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] =
    useState("upi");

  const [paymentSuccess, setPaymentSuccess] =
    useState(alreadyPaid);

  const [loading, setLoading] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  /* =======================================================
     ADMIN PRICE STATE
  ======================================================= */

  const [adminPrice, setAdminPrice] =
    useState<number>(
      Number(baseAmount) > 0
        ? Number(baseAmount)
        : 0
    );

  const [priceLoading, setPriceLoading] =
    useState(true);

  /* =======================================================
     FETCH ADMIN PRICE
  ======================================================= */

  useEffect(() => {
    let isMounted = true;

    const fetchAdminPrice = async () => {
      try {
        setPriceLoading(true);

        const response = await fetch(
          "/api/pricing/digital-visiting-card",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        const pricingData: PricingResponse =
          await response.json();

        console.log(
          "================================="
        );

        console.log(
          "ADMIN PRICING RESPONSE:"
        );

        console.log(pricingData);

        console.log(
          "================================="
        );

        if (!response.ok) {
          throw new Error(
            pricingData?.message ||
            "Failed to fetch subscription price."
          );
        }

        const fetchedPrice = Number(
          pricingData?.price ??
          pricingData?.yearlyPrice ??
          pricingData?.amount ??
          pricingData?.data?.price ??
          pricingData?.data?.yearlyPrice ??
          pricingData?.data?.amount ??
          pricingData?.pricing?.price ??
          pricingData?.pricing?.yearlyPrice ??
          pricingData?.pricing?.amount ??
          0
        );

        console.log(
          "FETCHED ADMIN PRICE:",
          fetchedPrice
        );

        if (
          isMounted &&
          fetchedPrice >= 0
        ) {
          setAdminPrice(fetchedPrice);
        }
      } catch (error) {
        console.error(
          "FETCH ADMIN PRICE ERROR:",
          error
        );

        if (isMounted) {
          setAdminPrice(
            Number(baseAmount) > 0
              ? Number(baseAmount)
              : 0
          );
        }
      } finally {
        if (isMounted) {
          setPriceLoading(false);
        }
      }
    };

    fetchAdminPrice();

    return () => {
      isMounted = false;
    };
  }, [baseAmount]);

  /* =======================================================
     USERNAME
  ======================================================= */

  const username = card?.username;

  /* =======================================================
     CARD URL
  ======================================================= */

  const cardUrl =
    typeof window !== "undefined" && username
      ? `${window.location.origin}/digitalvisitingcard/${encodeURIComponent(
        username
      )}`
      : "";

  /* =======================================================
     PRICE
  ======================================================= */

  const validBaseAmount =
    Number(adminPrice) >= 0
      ? Number(adminPrice)
      : 0;

  const gst = 0;

  const totalAmount = Number(
    (
      validBaseAmount +
      gst
    ).toFixed(2)
  );

  /* =======================================================
     LOAD RAZORPAY SCRIPT
  ======================================================= */

  const loadRazorpay =
    (): Promise<boolean> => {
      return new Promise((resolve) => {
        const Razorpay = (window as Window & { Razorpay?: any }).Razorpay;
        if (Razorpay) {
          resolve(true);
          return;
        }

        const existingScript =
          document.querySelector(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
          );

        if (existingScript) {
          existingScript.addEventListener(
            "load",
            () => resolve(true)
          );

          existingScript.addEventListener(
            "error",
            () => resolve(false)
          );

          return;
        }

        const script =
          document.createElement("script");

        script.src =
          "https://checkout.razorpay.com/v1/checkout.js";

        script.async = true;

        script.onload = () => {
          resolve(true);
        };

        script.onerror = () => {
          resolve(false);
        };

        document.body.appendChild(script);
      });
    };

  /* =======================================================
     COPY CARD LINK
  ======================================================= */

  const handleCopy = async () => {
    if (!cardUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        cardUrl
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "COPY FAILED:",
        error
      );
    }
  };

  /* =======================================================
     PAYMENT
  ======================================================= */

  const handlePayment = async () => {
    console.log(
      "================================="
    );

    console.log(
      "STARTING RAZORPAY PAYMENT"
    );

    console.log(
      "PAYMENT CARD:",
      card
    );

    console.log(
      "PAYMENT USERNAME:",
      card?.username
    );

    console.log(
      "PAYMENT TEMPLATE:",
      card?.templateId
    );

    console.log(
      "ADMIN PRICE:",
      validBaseAmount
    );

    console.log(
      "TOTAL AMOUNT:",
      totalAmount
    );

    console.log(
      "================================="
    );

    /* =====================================================
       VALIDATE USERNAME
    ===================================================== */

    if (!card?.username) {
      alert(
        "Card username is missing."
      );

      return;
    }

    /* =====================================================
       VALIDATE PRICE
    ===================================================== */

    if (priceLoading) {
      alert(
        "Subscription price is still loading. Please wait."
      );

      return;
    }

    if (validBaseAmount <= 0) {
      alert(
        "Invalid subscription price. Please contact support."
      );

      return;
    }

    /* =====================================================
       PREVENT DOUBLE CLICK
    ===================================================== */

    if (loading) {
      return;
    }

    try {
      setLoading(true);

      /* ===================================================
         1. LOAD RAZORPAY
      =================================================== */

      const razorpayLoaded =
        await loadRazorpay();

      if (!razorpayLoaded) {
        alert(
          "Razorpay failed to load. Please check your internet connection and try again."
        );

        setLoading(false);

        return;
      }

      /* ===================================================
         2. CREATE ORDER
      =================================================== */

      const orderResponse =
        await fetch(
          "/api/payments/create-order",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              username:
                card.username,

              projectType:
                "digital-visiting-card",

              amount:
                totalAmount,
            }),
          }
        );

      const orderData =
        await orderResponse.json();

      console.log(
        "CREATE ORDER RESPONSE:",
        orderData
      );

      if (!orderResponse.ok) {
        throw new Error(
          orderData.message ||
          "Failed to create payment order."
        );
      }

      if (
        !orderData.success ||
        !orderData.orderId
      ) {
        throw new Error(
          "Invalid Razorpay order response."
        );
      }

      /* ===================================================
         3. RAZORPAY OPTIONS
      =================================================== */

      const options = {
        key: orderData.key,

        amount:
          orderData.amount,

        currency:
          orderData.currency ||
          "INR",

        name:
          "DigiProfilo Technologies",

        description:
          "Digital Visiting Card - 1 Year",

        order_id:
          orderData.orderId,

        prefill: {
          name:
            card.fullName || "",
        },

        notes: {
          username:
            card.username,

          projectType:
            "digital-visiting-card",

          templateId:
            card.templateId ||
            "template-1",
        },

        theme: {
          color: "#1E3A5F",
        },

        /* =================================================
           SUCCESS HANDLER
        ================================================= */

        handler: async (
          response: any
        ) => {
          console.log(
            "================================="
          );

          console.log(
            "RAZORPAY SUCCESS:"
          );

          console.log(response);

          console.log(
            "================================="
          );

          try {
            /* =============================================
               VERIFY PAYMENT
            ============================================= */

            const verifyResponse =
              await fetch(
                "/api/payment/verify",
                {
                  method: "POST",

                  headers: {
                    "Content-Type":
                      "application/json",
                  },

                  body: JSON.stringify({
                    username:
                      card.username,

                    projectType:
                      "digital-visiting-card",

                    razorpay_order_id:
                      response.razorpay_order_id,

                    razorpay_payment_id:
                      response.razorpay_payment_id,

                    razorpay_signature:
                      response.razorpay_signature,
                  }),
                }
              );

            const verifyData =
              await verifyResponse.json();

            console.log(
              "VERIFY RESPONSE:",
              verifyData
            );

            /* =============================================
               VERIFICATION FAILED
            ============================================= */

            if (
              !verifyResponse.ok ||
              !verifyData.success
            ) {
              throw new Error(
                verifyData.message ||
                "Payment verification failed."
              );
            }

            /* =============================================
               PAYMENT VERIFIED
            ============================================= */

            console.log(
              "PAYMENT VERIFIED SUCCESSFULLY"
            );

            setPaymentSuccess(true);
          } catch (error) {
            console.error(
              "PAYMENT VERIFICATION ERROR:",
              error
            );

            alert(
              error instanceof Error
                ? error.message
                : "Payment verification failed."
            );
          } finally {
            setLoading(false);
          }
        },

        /* =================================================
           PAYMENT MODAL CLOSED
        ================================================= */

        modal: {
          ondismiss: () => {
            console.log(
              "Razorpay checkout closed."
            );

            setLoading(false);
          },
        },
      };

      /* ===================================================
         4. CREATE RAZORPAY INSTANCE
      =================================================== */

      const Razorpay = (window as Window & { Razorpay?: any }).Razorpay;
      if (!Razorpay) {
        throw new Error("Razorpay is not available right now.");
      }

      const razorpay = new Razorpay(options);

      /* ===================================================
         5. PAYMENT FAILED
      =================================================== */

      razorpay.on(
        "payment.failed",
        (response: any) => {
          console.error(
            "RAZORPAY PAYMENT FAILED:",
            response
          );

          setLoading(false);

          alert(
            response?.error
              ?.description ||
            "Payment failed. Please try again."
          );
        }
      );

      /* ===================================================
         6. OPEN RAZORPAY
      =================================================== */

      razorpay.open();
    } catch (error) {
      console.error(
        "PAYMENT ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while starting payment."
      );

      setLoading(false);
    }
  };

  /* =======================================================
     SHARE
  ======================================================= */

  const handleShare = async () => {
    if (!cardUrl) {
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title:
            card.fullName ||
            "Digital Visiting Card",

          text:
            "View my digital visiting card",

          url: cardUrl,
        });
      } catch {
        console.log(
          "Share cancelled"
        );
      }
    } else {
      handleCopy();
    }
  };

  /* =======================================================
     SUCCESS SCREEN
  ======================================================= */

  if (paymentSuccess) {
    return (
      <SuccessScreen
        card={card}
        cardUrl={cardUrl}
        copied={copied}
        onCopy={handleCopy}
        onShare={handleShare}
        router={router}
      />
    );
  }

  /* =======================================================
     PAYMENT PAGE
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-[72px] max-w-[1450px] items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-black italic text-[#1E3A5F]">
              SF
            </div>

            <div className="leading-none">
              <div className="text-lg font-extrabold text-[#1E3A5F]">
                DigiProfilo
              </div>

              <div className="text-[7px] font-bold tracking-[2px] text-muted">
                TECHNOLOGIES
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              router.push("/dashboard")
            }
            className="flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-xs font-semibold text-[#1E3A5F] hover:bg-page"
          >
            <span>⌂</span>
            Go to Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1450px] px-5 py-7 lg:px-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-xs font-medium text-muted"
        >
          <ArrowLeft size={14} />
          Back to Review & Publish
        </button>

        <div className="grid gap-8 xl:grid-cols-2">
          <section>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#EAF0F6] text-[#1E3A5F]">
                  <CreditCard size={22} />
                </div>

                <div>
                  <h1 className="text-md font-bold text-ink">
                    Complete Your Payment
                  </h1>

                  <p className="text-xs text-muted">
                    Your digital visiting card
                    will be live after
                    successful payment.
                  </p>
                </div>
              </div>

              <div className="hidden items-center gap-2 text-xs text-muted sm:flex">
                <Lock size={14} />
                Secure Payment
              </div>
            </div>

            <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
              <h2 className="mb-5 text-sm font-bold text-ink">
                Order Summary
              </h2>

              <div className="grid gap-8 md:grid-cols-[300px_1fr]">
                <div className="h-[125px] rounded-xl bg-gradient-to-br from-[#152A47] to-[#152A47] p-3 text-white shadow-md">
                  <div className="flex items-center gap-4">
                    {card.profilePhoto ? (
                      <img
                        src={card.profilePhoto}
                        alt={
                          card.fullName ||
                          "Profile"
                        }
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1E3A5F] font-bold">
                        {card.fullName
                          ?.charAt(0)
                          .toUpperCase() ||
                          "U"}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="mb-1 truncate text-sm font-bold">
                        {card.fullName ||
                          "Your Name"}
                      </p>

                      <p className="mb-1 truncate text-xs text-line">
                        {card.designation ||
                          "Designation"}
                      </p>

                      <p className="truncate text-[9px] text-muted">
                        {card.companyName ||
                          "Company"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex justify-between border-t border-white/20 pt-2 text-xs">
                    <span>☎</span>
                    <span>◉</span>
                    <span>✉</span>
                    <span>◎</span>
                  </div>
                </div>

                <div className="space-y-4 text-ink">
                  <SummaryRow
                    label="Product"
                    value="Digital Visiting Card"
                  />

                  <SummaryRow
                    label="Plan"
                    value="1 Year"
                  />

                  <SummaryRow
                    label="Validity"
                    value="365 Days"
                  />

                  <SummaryRow
                    label="Card Name"
                    value={`${card.fullName || "Digital"} Card`}
                  />

                  <SummaryRow
                    label="Template"
                    value={
                      card.templateId ||
                      "template-1"
                    }
                  />
                </div>
              </div>

              <div className="mt-6 border-t border-line pt-4">
                <div className="flex justify-between py-2 text-xs">
                  <span className="text-muted">
                    Subtotal
                  </span>

                  <span className="font-semibold text-ink">
                    ₹
                    {validBaseAmount.toFixed(
                      2
                    )}
                  </span>
                </div>


                <div className="mt-2 flex justify-between border-t border-line pt-4">
                  <span className="text-sm font-bold text-ink">
                    Total Amount
                  </span>

                  <span className="text-xl font-bold text-[#1E3A5F]">
                    ₹
                    {totalAmount.toFixed(
                      2
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-line bg-white p-5 text-ink shadow-sm">
              <h2 className="mb-4 text-sm font-bold text-ink">
                Choose Payment Method
              </h2>

              <PaymentMethod
                selected={
                  paymentMethod === "upi"
                }
                onClick={() =>
                  setPaymentMethod(
                    "upi"
                  )
                }
                icon={
                  <Smartphone
                    size={19}
                  />
                }
                title="UPI"
                description="Pay using any UPI app"
                badge="Recommended"
              />

              <PaymentMethod
                selected={
                  paymentMethod === "card"
                }
                onClick={() =>
                  setPaymentMethod(
                    "card"
                  )
                }
                icon={
                  <CreditCard
                    size={19}
                  />
                }
                title="Credit / Debit Card"
                description="Visa, Mastercard, RuPay & more"
              />

              <PaymentMethod
                selected={
                  paymentMethod ===
                  "netbanking"
                }
                onClick={() =>
                  setPaymentMethod(
                    "netbanking"
                  )
                }
                icon={
                  <Building2
                    size={19}
                  />
                }
                title="Net Banking"
                description="All major banks supported"
              />

              <PaymentMethod
                selected={
                  paymentMethod ===
                  "wallet"
                }
                onClick={() =>
                  setPaymentMethod(
                    "wallet"
                  )
                }
                icon={
                  <Wallet size={19} />
                }
                title="Wallets"
                description="PhonePe, Paytm, Amazon Pay & more"
              />

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
                <Lock
                  size={12}
                  className="text-success"
                />
                100% Secure Payments
                powered by Razorpay
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-line bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-muted">
                    Amount Payable
                  </p>

                  <p className="text-2xl font-bold text-ink">
                    ₹
                    {totalAmount.toFixed(
                      2
                    )}
                  </p>
                </div>

                <button
                  onClick={
                    handlePayment
                  }
                  disabled={
                    loading ||
                    priceLoading
                  }
                  className="rounded-lg bg-[#1E3A5F] px-12 py-4 text-sm font-bold text-white shadow-lg shadow-accent transition hover:bg-[#1E3A5F] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {priceLoading
                    ? "Loading Price..."
                    : loading
                      ? "Processing..."
                      : "Proceed to Pay"}
                </button>
              </div>

              <p className="mt-3 text-center text-xs text-muted">
                You will be redirected
                to secure payment page
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-line bg-page p-4 text-xs leading-5 text-muted">
              <p>
                Your subscription is valid for{" "}
                <span className="font-semibold text-ink">1 year</span> from
                the date of payment and must be renewed after expiry.
              </p>
              <p className="mt-2">
                During the active subscription period, you can edit your
                profile information and change your card theme anytime.
              </p>
            </div>
          </section>

          <aside className="hidden xl:block">
            <div className="sticky top-6 rounded-xl border border-line bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-sm font-bold text-ink">
                Card Preview
              </h2>

              <PaymentCardTemplatePreview
                card={card}
              />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   SUCCESS SCREEN
========================================================= */

function SuccessScreen({
  card,
  cardUrl,
  copied,
  onCopy,
  onShare,
  router,
}: {
  card: DigitalCardData;
  cardUrl: string;
  copied: boolean;
  onCopy: () => void;
  onShare: () => void;
  router: ReturnType<
    typeof useRouter
  >;
}) {
  const validUntil =
    card.paidAt
      ? new Date(card.paidAt)
      : new Date();

  validUntil.setDate(
    validUntil.getDate() + 365
  );

  const formattedValidUntil =
    validUntil.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-[72px] max-w-[1450px] items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-black italic text-[#1E3A5F]">
              SF
            </div>

            <div>
              <div className="text-lg font-extrabold text-[#1E3A5F]">
                DigiProfilo
              </div>

              <div className="text-[7px] font-bold tracking-[2px] text-muted">
                TECHNOLOGIES
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              router.push("/dashboard")
            }
            className="rounded-md border border-line px-4 py-2 text-xs font-semibold text-[#1E3A5F]"
          >
            Go to Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1050px] px-5 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent">
            <CheckCircle2
              size={38}
              className="text-success"
            />
          </div>

          <h1 className="text-2xl font-bold text-success">
            Payment Successful!
          </h1>

          <p className="mt-1 text-sm text-muted">
            Congratulations! Your Digital
            Visiting Card is now LIVE.
          </p>
        </div>

        <div className="grid gap-7 rounded-xl border border-line bg-white p-6 shadow-sm md:grid-cols-2">
          <div className="flex justify-center">
            <PaymentCardTemplatePreview
              card={card}
              large
            />
          </div>

          <div className="flex flex-col justify-center">
            <div className="mb-6 grid grid-cols-2 gap-5">
              <div>
                <p className="mb-2 text-xs text-muted">
                  Card Status
                </p>

                <span className="rounded bg-accent px-2 py-1 text-xs font-bold text-success">
                  Active
                </span>
              </div>

              <div>
                <p className="mb-2 text-xs text-muted">
                  Valid Until
                </p>

                <div className="flex items-center gap-1 text-xs font-bold">
                  <CalendarDays
                    size={13}
                  />

                  {formattedValidUntil}
                </div>
              </div>
            </div>

            <p className="mb-2 text-xs font-semibold">
              Your Card Link
            </p>

            <div className="flex items-center rounded-lg border border-line bg-[#E5E0D9] px-3 py-3">
              <span className="flex-1 truncate text-xs font-medium text-[#1E3A5F]">
                {cardUrl}
              </span>

              <button
                onClick={onCopy}
                className="ml-2 text-[#1E3A5F]"
              >
                {copied ? (
                  <CheckCircle2
                    size={17}
                  />
                ) : (
                  <Copy size={17} />
                )}
              </button>
            </div>

            <p className="mt-2 text-xs text-muted">
              Share your card link with
              anyone.
            </p>

            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold">
                QR Code
              </p>

              <div className="flex h-28 w-28 items-center justify-center rounded-lg border bg-white">
                <div className="grid grid-cols-7 gap-[2px]">
                  {Array.from({
                    length: 49,
                  }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className={`h-2 w-2 ${(index * 7 +
                            index) %
                            3 ===
                            0 ||
                            index < 7 ||
                            index % 7 ===
                            0
                            ? "bg-ink"
                            : "bg-white"
                          }`}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <ActionButton
            icon={<Eye size={17} />}
            title="View My Card"
            subtitle="Open in new tab"
            onClick={() =>
              window.open(
                cardUrl,
                "_blank"
              )
            }
          />

          <ActionButton
            icon={<Share2 size={17} />}
            title="Share Card"
            subtitle="Share your card"
            onClick={onShare}
          />

          <ActionButton
            icon={
              <Download size={17} />
            }
            title="Download QR"
            subtitle="Save QR code"
            onClick={() => {
              if (card._id) {
                const a = document.createElement("a");
                a.href = `/api/qr/card/${card._id}`;
                a.click();
              }
            }}
          />

          <ActionButton
            icon={<Plus size={17} />}
            title="Add to Wallet"
            subtitle="Save to phone"
            onClick={() =>
              console.log(
                "Add to wallet"
              )
            }
          />
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-[#1E3A5F] to-[#1E3A5F] p-6 text-white md:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
              <Crown size={21} />
            </div>

            <div>
              <p className="text-sm font-bold">
                Want More Power?
              </p>

              <p className="text-xs text-white/80">
                Upgrade to Pro and unlock
                premium templates, custom
                domain, advanced analytics
                and more.
              </p>
            </div>
          </div>

          <button className="rounded-lg bg-white px-6 py-3 text-xs font-bold text-[#1E3A5F]">
            Upgrade Now
          </button>
        </div>

        <div className="mt-7">
          <h2 className="mb-4 text-sm font-bold">
            What&apos;s Next?
          </h2>

          <div className="grid gap-3 md:grid-cols-3">
            <NextCard
              icon={
                <CreditCard
                  size={18}
                />
              }
              title="Edit Card"
              description="Make changes anytime"
            />

            <NextCard
              icon={
                <BarChart3
                  size={18}
                />
              }
              title="Analytics"
              description="Track views & clicks"
            />

            <NextCard
              icon={
                <FolderOpen
                  size={18}
                />
              }
              title="My Projects"
              description="Manage all cards"
            />
          </div>
        </div>

        <div className="mt-7 text-center">
          <button
            onClick={() =>
              router.push("/dashboard")
            }
            className="inline-flex items-center gap-2 text-sm font-bold text-[#1E3A5F]"
          >
            Go to Dashboard

            <ArrowRight
              size={16}
            />
          </button>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   CARD PREVIEW
========================================================= */

function PaymentCardTemplatePreview({
  card,
  large = false,
}: {
  card: DigitalCardData;
  large?: boolean;
}) {
  return (
    <div
      className={
        large
          ? "w-[300px]"
          : "w-full"
      }
    >
      <DigitalCardProvider>
        <PublicCardPreview
          template={
            card.templateId ||
            "template-1"
          }
        />
      </DigitalCardProvider>
    </div>
  );
}

/* =========================================================
   SUMMARY ROW
========================================================= */

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-4 text-xs">
      <span className="text-muted">
        {label}
      </span>

      <span className="text-right font-semibold">
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   PAYMENT METHOD
========================================================= */

function PaymentMethod({
  selected,
  onClick,
  icon,
  title,
  description,
  badge,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mb-2 flex w-full items-center gap-4 rounded-lg border p-3 text-left ${selected
          ? "border-[#1E3A5F] bg-[#E5E0D9]"
          : "border-line bg-white"
        }`}
    >
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full border ${selected
            ? "border-[#1E3A5F]"
            : "border-line"
          }`}
      >
        {selected && (
          <div className="h-2.5 w-2.5 rounded-full bg-[#1E3A5F]" />
        )}
      </div>

      <div className="text-[#1E3A5F]">
        {icon}
      </div>

      <div className="flex-1">
        <p className="text-xs font-bold">
          {title}
        </p>

        <p className="text-xs text-muted">
          {description}
        </p>
      </div>

      {badge && (
        <span className="rounded bg-accent px-2 py-1 text-[9px] font-semibold text-success">
          {badge}
        </span>
      )}
    </button>
  );
}

/* =========================================================
   ACTION BUTTON
========================================================= */

function ActionButton({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-line bg-white p-4 text-left shadow-sm hover:border-line"
    >
      <div className="mb-2 text-[#1E3A5F]">
        {icon}
      </div>

      <p className="text-xs font-bold">
        {title}
      </p>

      <p className="mt-1 text-xs text-muted">
        {subtitle}
      </p>
    </button>
  );
}

/* =========================================================
   NEXT CARD
========================================================= */

function NextCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button className="flex items-center gap-3 rounded-xl border border-line bg-white p-4 text-left shadow-sm hover:border-line">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF0F6] text-[#1E3A5F]">
        {icon}
      </div>

      <div>
        <p className="text-xs font-bold">
          {title}
        </p>

        <p className="text-xs text-muted">
          {description}
        </p>
      </div>
    </button>
  );
}