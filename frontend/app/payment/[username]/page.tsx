import { notFound } from "next/navigation";

import dbConnect from "@/app/lib/db";
import DigitalCard from "@/app/models/DigitalCard";

import PaymentClient from "./PaymentClient";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function PaymentPage({
  params,
}: PageProps) {
  const { username: rawUsername } = await params;

  console.log(
    "PAYMENT RAW USERNAME:",
    rawUsername
  );

  if (!rawUsername) {
    notFound();
  }

  const username = decodeURIComponent(
    rawUsername
  )
    .trim()
    .toLowerCase();

  console.log(
    "PAYMENT USERNAME:",
    username
  );

  await dbConnect();

  const card = await DigitalCard.findOne({
    username,
  }).lean();

  console.log("PAYMENT CARD:", card);

  if (!card) {
    console.log(
      "No card found for username:",
      username
    );

    notFound();
  }

  const serializedCard = JSON.parse(
    JSON.stringify(card)
  );

  return (
    <PaymentClient
      card={serializedCard}
      alreadyPaid={
        card.paymentStatus === "paid" &&
        card.isPublished === true
      }
    />
  );
}