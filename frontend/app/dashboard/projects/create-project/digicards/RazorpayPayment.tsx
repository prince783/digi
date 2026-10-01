"use client";

import { useCallback, useState } from "react";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import PaymentSuccessOverlay from "@/app/components/PaymentSuccessOverlay";

interface RazorpayPaymentProps {
  cardId: string;
  username: string;

  onSuccess?: (username: string) => void;

  onError?: (message: string) => void;
}

export default function RazorpayPayment({
  cardId,
  username,
  onSuccess,
  onError,
}: RazorpayPaymentProps) {
  const [loading, setLoading] = useState(false);

  // --- Overlay state ---
  const [showOverlay, setShowOverlay] = useState(false);
  const [verifiedUsername, setVerifiedUsername] = useState(username);

  /*
   * Load Razorpay Checkout script
   */

  const loadRazorpayScript =
    async (): Promise<boolean> => {
      const Razorpay = (window as Window & { Razorpay?: any }).Razorpay;
      if (Razorpay) {
        return true;
      }

      return new Promise((resolve) => {
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

  /*
   * Start Payment
   */

  const handlePayment = async () => {
    try {
      setLoading(true);

      /*
       * Load Razorpay
       */

      const razorpayLoaded =
        await loadRazorpayScript();

      if (!razorpayLoaded) {
        throw new Error(
          "Unable to load Razorpay"
        );
      }

      /*
       * Create Razorpay Order
       */

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
              cardId,
            }),
          }
        );

      const orderData =
        await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(
          orderData.error ||
            "Unable to create payment order"
        );
      }

      /*
       * Card already paid — skip to overlay
       */

      if (orderData.alreadyPaid) {
        const resolvedUsername =
          orderData.username || username;
        setVerifiedUsername(resolvedUsername);
        setShowOverlay(true);
        setLoading(false);
        return;
      }

      /*
       * Razorpay options
       */

      const options = {
        key: orderData.key,

        amount: orderData.amount,

        currency: orderData.currency,

        name: "Digital Visiting Card",

        description:
          "Digital Visiting Card - Publish",

        order_id: orderData.orderId,

        prefill: {
          name: "",
          email: "",
          contact: "",
        },

        notes: {
          cardId,
          username,
        },

        theme: {
          color: "#152A47",
        },

        /*
         * Successful payment
         */

        handler: async (
          response: any
        ) => {
          try {
            /*
             * Send payment details
             * to our server.
             */

            const verifyResponse =
              await fetch(
                "/api/payments/verify",
                {
                  method: "POST",

                  headers: {
                    "Content-Type":
                      "application/json",
                  },

                  body: JSON.stringify({
                    cardId,

                    razorpay_payment_id:
                      response.razorpay_payment_id,

                    razorpay_order_id:
                      response.razorpay_order_id,

                    razorpay_signature:
                      response.razorpay_signature,
                  }),
                }
              );

            const verifyData =
              await verifyResponse.json();

            if (
              !verifyResponse.ok ||
              !verifyData.success
            ) {
              throw new Error(
                verifyData.error ||
                  "Payment verification failed"
              );
            }

            /*
             * PAYMENT IS NOW VERIFIED
             *
             * Show celebration overlay first,
             * then call onSuccess on close.
             */

            const resolvedUsername =
              verifyData.username || username;
            setVerifiedUsername(resolvedUsername);
            setShowOverlay(true);
          } catch (error: any) {
            console.error(
              "Payment verification error:",
              error
            );

            const message =
              error?.message ||
              "Payment verification failed";

            onError?.(message);

            alert(message);
          } finally {
            setLoading(false);
          }
        },

        /*
         * User closes Razorpay
         */

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      /*
       * Create Razorpay instance
       */

      const Razorpay = (window as Window & { Razorpay?: any }).Razorpay;
      if (!Razorpay) {
        throw new Error("Razorpay is not available right now.");
      }

      const razorpay = new Razorpay(options);

      /*
       * Payment failed
       */

      razorpay.on(
        "payment.failed",
        (response: any) => {
          console.error(
            "Razorpay payment failed:",
            response
          );

          const message =
            response?.error?.description ||
            "Payment failed";

          alert(message);

          onError?.(message);

          setLoading(false);
        }
      );

      /*
       * Open Razorpay
       */

      razorpay.open();
    } catch (error: any) {
      console.error(
        "Razorpay error:",
        error
      );

      const message =
        error?.message ||
        "Unable to start payment";

      alert(message);

      onError?.(message);

      setLoading(false);
    }
  };

  /* =========================================================
     OVERLAY CLOSE HANDLER
  ========================================================= */

  const handleOverlayClose = useCallback(() => {
    setShowOverlay(false);
    onSuccess?.(verifiedUsername);
  }, [verifiedUsername, onSuccess]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      {/* Payment Success Overlay */}
      {showOverlay && (
        <PaymentSuccessOverlay
          productType="card"
          productUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/card/${verifiedUsername}`}
          onClose={handleOverlayClose}
        />
      )}

      <button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        className="
          w-full
          rounded-xl
          bg-[#152A47]
          px-6
          py-3.5
          text-sm
          font-semibold
          text-white
          shadow-sm
          transition
          hover:bg-[#152A47]
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        <span className="flex items-center justify-center gap-2">
          {loading ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />

              Processing...
            </>
          ) : (
            <>
              <CreditCard size={18} />

              Pay & Publish
            </>
          )}
        </span>

        {!loading && (
          <span className="mt-1 flex items-center justify-center gap-1 text-xs font-normal text-white/60">
            <ShieldCheck size={12} />

            Secure payment
          </span>
        )}
      </button>
    </>
  );
}