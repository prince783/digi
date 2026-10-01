import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";
import Resume from "@/app/models/Resume";
import Payment from "@/app/models/Payment";
import { generateInvoicePdf } from "@/app/lib/invoice";
import { sendInvoiceEmail } from "@/app/lib/email";
import Invoice from "@/app/models/Invoice";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, message: "Please login to continue." }, { status: 401 });
    const body = await request.json();
    const orderId = String(body?.razorpay_order_id || body?.order_id || "");
    const paymentId = String(body?.razorpay_payment_id || "");
    const signature = String(body?.razorpay_signature || "");
    if (!orderId || !paymentId || !signature) return NextResponse.json({ success: false, message: "Payment details are incomplete." }, { status: 400 });
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return NextResponse.json({ success: false, message: "Payment configuration is missing." }, { status: 500 });
    await connectDB();
    const resume = await Resume.findOne({ userId: user._id, paymentOrderId: orderId });
    if (!resume) return NextResponse.json({ success: false, message: "Resume payment order not found." }, { status: 404 });
    const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
    const valid = expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    if (!valid) {
      resume.paymentStatus = "failed";
      resume.razorpayPaymentId = paymentId;
      resume.razorpaySignature = signature;
      await resume.save();
      await Payment.findOneAndUpdate(
        { projectId: resume._id, projectType: "resume", razorpayOrderId: orderId },
        { paymentStatus: "failed", razorpayPaymentId: paymentId, razorpaySignature: signature },
        { new: true, runValidators: true },
      );
      return NextResponse.json({ success: false, message: "Payment verification failed." }, { status: 400 });
    }
    const now = new Date();
    const existingEnd = resume.expiresAt ? new Date(resume.expiresAt) : null;
    const baseDate = (existingEnd && existingEnd > now) ? existingEnd : now;
    const newEnd = new Date(baseDate);
    newEnd.setFullYear(newEnd.getFullYear() + 1);

    resume.paymentStatus = "paid";
    resume.paymentId = paymentId;
    resume.razorpayPaymentId = paymentId;
    resume.paymentSignature = signature;
    resume.razorpaySignature = signature;
    resume.paidAt = now;
    resume.subscriptionStart = resume.subscriptionStart || now;
    resume.expiresAt = newEnd;
    resume.accountStatus = "active";
    resume.isPublished = true;
    await resume.save();
    await Payment.findOneAndUpdate(
      { projectId: resume._id, projectType: "resume", razorpayOrderId: orderId },
      {
        userId: user._id,
        projectId: resume._id,
        projectType: "resume",
        amount: resume.paymentAmount,
        currency: "INR",
        paymentStatus: "paid",
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        paidAt: resume.paidAt,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
    );

    {
      const invoiceNumber = `DGP-CV-${resume._id.toString().slice(-8).toUpperCase()}`;
      const customerName = resume.username || "";
      const amount = Number(resume.paymentAmount) || 0;
      const billing = resume.billing || { address: "", city: "", state: "", pincode: "" };

      try {
        await Invoice.findOneAndUpdate(
          { productType: "resume", productId: resume._id },
          {
            userId: user._id,
            productType: "resume",
            productId: resume._id,
            invoiceNumber,
            productName: "DigiProfilo Resume/CV Subscription (1 Year)",
            customerName,
            customerEmail: user.email || "",
            amount,
            paymentId,
            orderId,
            address: billing.address,
            city: billing.city,
            state: billing.state,
            pincode: billing.pincode,
            paidAt: resume.paidAt || new Date(),
          },
          { upsert: true, setDefaultsOnInsert: true },
        );
      } catch (invoiceSaveError) {
        console.error("RESUME INVOICE RECORD SAVE FAILED:", invoiceSaveError);
      }

      if (user.email) {
        try {
          const pdfBuffer = await generateInvoicePdf({
            invoiceNumber,
            paidAt: resume.paidAt || new Date(),
            productName: "DigiProfilo Resume/CV Subscription (1 Year)",
            customerName,
            customerEmail: user.email,
            amount,
            paymentId,
            orderId,
            address: billing.address,
            city: billing.city,
            state: billing.state,
            pincode: billing.pincode,
          });

          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://digiprofilo.com";
          const resumePublicUrl = `${baseUrl}/resume/${resume.username}`;

          await sendInvoiceEmail({
            to: user.email,
            customerName,
            productName: "Resume/CV Subscription",
            invoiceNumber,
            pdfBuffer,
            productUrl: resumePublicUrl,
          });
        } catch (invoiceError) {
          console.error("RESUME INVOICE EMAIL FAILED:", invoiceError);
        }
      }
    }

    return NextResponse.json({ success: true, username: resume.username, url: `/resume/${resume.username}`, isPublished: true });
  } catch (error) {
    console.error("RESUME PAYMENT VERIFY ERROR:", error);
    return NextResponse.json({ success: false, message: "Unable to verify resume payment." }, { status: 500 });
  }
}
