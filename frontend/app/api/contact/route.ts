import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import SupportTicket from "@/app/models/SupportTicket";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Please provide your name." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return NextResponse.json(
        { success: false, message: "Please provide a subject." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, message: "Please enter your message." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = typeof phone === "string" ? phone.trim() : "";
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    // 1. Save lead to Database
    await connectDB();

    const ticket = await SupportTicket.create({
      userId: null,
      name: trimmedName,
      email: trimmedEmail,
      mobile: trimmedPhone,
      category: "Other",
      subject: trimmedSubject,
      message: trimmedMessage,
      priority: "Medium",
      status: "Open",
    });

    return NextResponse.json({
      success: true,
      message: "Lead saved successfully.",
      ticketId: ticket._id.toString(),
    });
  } catch (error: any) {
    console.error("[Contact API] Error processing contact inquiry:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit your message. Please try again or chat via WhatsApp.",
      },
      { status: 500 }
    );
  }
}
