import { notFound } from "next/navigation";

import dbConnect from "@/app/lib/db";
import DigitalCard from "@/app/models/DigitalCard";

import PaymentSuccessClient from "../PaymentSuccessClient";

interface PageProps {
  params: Promise<{
    cardId: string;
  }>;
}

export default async function PaymentSuccessPage({
  params,
}: PageProps) {
  const { cardId } = await params;

  await dbConnect();

  const card =
    await DigitalCard.findById(cardId).lean();

  if (!card) {
    notFound();
  }

  /*
   * Don't allow fake success page.
   *
   * Payment must actually be verified.
   */

  if (
    card.paymentStatus !== "paid" ||
    card.isPublished !== true
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] p-6">
        <div className="max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <span className="text-xl">
              🔒
            </span>
          </div>

          <h1 className="mt-5 text-xl font-bold text-ink">
            Payment Not Completed
          </h1>

          <p className="mt-2 text-sm text-muted">
            We could not verify the payment
            for this digital card.
          </p>
        </div>
      </main>
    );
  }

  return (
    <PaymentSuccessClient
      card={JSON.parse(
        JSON.stringify(card)
      )}
    />
  );
}