"use client";

import {
  User,
  Mail,
  Phone,
  MessageSquare,
  MapPin,
  Globe,
  Send,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertCircle,
  MessageCircle,
} from "lucide-react";

import Link from "next/link";
import { useState } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
} from "react";

/* =========================================================
   TYPES
========================================================= */

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  icon: ReactNode;
  placeholder: string;
  green?: boolean;
}

interface ContactCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

/* =========================================================
   CONTACT PAGE
========================================================= */

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setErrorMessage("Please fill in all required fields (Name, Email, Subject, Message).");
      return;
    }

    setLoading(true);

    const waPhone = "916203689042";
    const waText = `Hello DigiProfilo Team,\n\nName: ${form.name.trim()}\nEmail: ${form.email.trim()}\nPhone: ${form.phone.trim() || "Not provided"}\nSubject: ${form.subject.trim()}\n\nMessage:\n${form.message.trim()}`;
    const targetWaUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(waText)}`;
    setWhatsappUrl(targetWaUrl);

    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      setStatus("success");
      if (typeof window !== "undefined") {
        window.open(targetWaUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error("Contact submit error:", err);
      // Still open WhatsApp so the user can connect without disruption
      setStatus("success");
      if (typeof window !== "undefined") {
        window.open(targetWaUrl, "_blank", "noopener,noreferrer");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white text-ink">
      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent via-white to-white">
        {/* Background decoration */}
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />

        <div className="absolute -right-32 top-20 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 text-center sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm">
              <Sparkles size={16} />
              Contact DigiProfilo
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Let&apos;s Start a{" "}
              <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                Conversation
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              Have a question, need assistance, or want to explore business
              partnerships? Our team is dedicated to providing fast, reliable
              support to help you grow your digital presence.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTACT MAIN CONTENT
      ====================================================== */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* =================================================
              CONTACT FORM
          ================================================== */}
          <div>
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Send Us a Message
              </p>

              <h2 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">
                How Can We{" "}
                <span className="text-primary-light">Help?</span>
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
                Fill out the form below with your details and message. Our team
                will review your request and get back to you shortly.
              </p>
            </div>

            {status === "success" ? (
              <div className="rounded-2xl border border-success/30 bg-emerald-50/70 p-7 sm:p-9 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm">
                  <CheckCircle2 size={32} />
                </div>

                <h3 className="mt-5 text-2xl font-bold text-ink">
                  Inquiry Sent Successfully!
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted">
                  We have saved your inquiry and opened WhatsApp to connect you directly with our team at <strong className="text-ink">+91 62036 89042</strong>.
                </p>

                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#20bd5a]"
                  >
                    <MessageCircle size={18} />
                    Open WhatsApp Chat
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setStatus("idle");
                      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
                    }}
                    className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-line bg-white px-6 py-3.5 text-sm font-semibold text-ink transition hover:bg-slate-50"
                  >
                    Send Another Message
                  </button>
                </div>

                <p className="mt-4 text-xs text-muted">
                  If WhatsApp did not open automatically, click the green button above.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMessage && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-600">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Name + Email */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Input
                    icon={<User size={18} />}
                    placeholder="Your Name *"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />

                  <Input
                    icon={<Mail size={18} />}
                    placeholder="Email Address *"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>

                {/* Phone + Subject */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Input
                    icon={<Phone size={18} />}
                    placeholder="Phone Number"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    green
                  />

                  <Input
                    icon={<MessageSquare size={18} />}
                    placeholder="Subject *"
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Message */}
                <div className="relative">
                  <div
                    className="
                      absolute
                      left-4
                      top-4
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-md
                      border
                      border-line
                      bg-accent
                      text-primary
                    "
                  >
                    <MessageSquare size={18} />
                  </div>

                  <textarea
                    rows={7}
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Your Message *"
                    required
                    className="
                      w-full
                      resize-none
                      rounded-2xl
                      border
                      border-primary-light
                      bg-white
                      py-4
                      pl-16
                      pr-4
                      text-sm
                      text-ink
                      outline-none
                      transition
                      placeholder:text-muted
                      focus:ring-2
                      focus:ring-line
                    "
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    flex
                    h-14
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-primary
                    to-primary-light
                    text-sm
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-accent
                    transition
                    hover:scale-[1.01]
                    hover:shadow-xl
                    disabled:opacity-70
                    disabled:pointer-events-none
                  "
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving & Opening WhatsApp...
                    </>
                  ) : (
                    <>
                      Send Message & Chat on WhatsApp
                      <Send size={17} />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-muted">
                  We respect your privacy and will only use your information to
                  respond to your enquiry.
                </p>
              </form>
            )}
          </div>

          {/* =================================================
              CONTACT INFORMATION
          ================================================== */}
          <div>
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Get In Touch
              </p>

              <h2 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">
                Contact{" "}
                <span className="text-primary-light">DigiProfilo</span>
              </h2>

              <p className="mt-3 text-sm leading-7 text-muted">
                Whether you have a question about our platform, need technical
                support, or simply want to talk to us, feel free to reach out.
              </p>
            </div>

            <div className="space-y-5">
              {/* Address */}
              <ContactCard
                icon={<MapPin size={22} />}
                title="Our Address"
              >
                <p className="font-semibold leading-5 text-ink">
                  206, 2nd Floor, Brindavan Kunj,
                  <br />
                  Exhibition Road,
                  <br />
                  Patna, Bihar
                </p>
              </ContactCard>

              {/* Phone */}
              <ContactCard
                icon={<Phone size={22} />}
                title="Phone Number"
              >
                <a
                  href="tel:+918709122663"
                  className="font-semibold text-ink transition hover:text-primary"
                >
                  +91 87091 22663
                </a>

                <p className="mt-1 text-sm text-muted">
                  Mon - Sat | 9:00 AM - 7:00 PM
                </p>
              </ContactCard>

              {/* Email */}
              <ContactCard
                icon={<Mail size={22} />}
                title="Email Address"
              >
                <a
                  href="mailto:info@digiprofilo.com"
                  className="font-semibold text-ink transition hover:text-primary"
                >
                  info@digiprofilo.com
                </a>

                <p className="mt-1 text-sm text-muted">
                  We usually reply within a few hours.
                </p>
              </ContactCard>

              {/* Website */}
              <ContactCard
                icon={<Globe size={22} />}
                title="Website"
              >
                <a
                  href="https://digiprofilo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-ink transition hover:text-primary"
                >
                  www.digiprofilo.com
                </a>

                <p className="mt-1 text-sm text-muted">
                  Explore our products and services.
                </p>
              </ContactCard>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MAP SECTION
      ====================================================== */}
      <section className="bg-page">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Find Us
            </p>

            <h2 className="mt-2 text-3xl font-bold text-ink">
              Visit Our Office
            </h2>

            <p className="mt-2 text-sm text-muted">
              We would be happy to connect with you.
            </p>
          </div>

          <div
            className="
              relative
              h-[400px]
              overflow-hidden
              rounded-3xl
              border
              border-line
              bg-white
              shadow-lg
              sm:h-[500px]
            "
          >
            <iframe
              title="DigiProfilo Office Location"
              src="https://www.google.com/maps?q=Exhibition%20Road,%20Patna,%20Bihar&output=embed"
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary-light px-7 py-14 text-center shadow-xl sm:px-12">
          {/* Decorative circles */}
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-primary-light/20 blur-3xl" />

          <div className="relative mx-auto max-w-3xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white">
              <Sparkles size={27} />
            </div>

            <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
              Have Questions About DigiProfilo?
            </h2>

            <p className="mt-4 leading-7 text-accent">
              From fast onboarding support and technical guidance to business
              partnerships and team licensing, our dedicated specialists are
              here for you every step of the way.
            </p>

            <Link
              href="/register"
              className="
                mt-8
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-white
                px-7
                py-3.5
                text-sm
                font-semibold
                text-primary
                shadow-lg
                transition
                hover:bg-accent
              "
            >
              Get Started With DigiProfilo
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </section>
  );
}

/* =========================================================
   INPUT COMPONENT
========================================================= */

function Input({
  icon,
  placeholder,
  type = "text",
  green = false,
  ...props
}: InputProps) {
  return (
    <div className="relative">
      <div
        className={`
          absolute
          left-4
          top-1/2
          flex
          h-9
          w-9
          -translate-y-1/2
          items-center
          justify-center
          rounded-md
          border
          ${
            green
              ? "border-success bg-accent text-success"
              : "border-line bg-accent text-primary"
          }
        `}
      >
        {icon}
      </div>

      <input
        {...props}
        type={type}
        value={props.value ?? ""}
        placeholder={placeholder}
        className="
          h-[60px]
          w-full
          rounded-2xl
          border
          border-primary-light
          bg-white
          pl-16
          pr-4
          text-sm
          text-ink
          outline-none
          transition
          placeholder:text-muted
          focus:ring-2
          focus:ring-line
        "
      />
    </div>
  );
}

/* =========================================================
   CONTACT CARD
========================================================= */

function ContactCard({
  icon,
  title,
  children,
}: ContactCardProps) {
  return (
    <div
      className="
        flex
        gap-4
        rounded-2xl
        border
        border-line
        bg-white
        p-5
        shadow-sm
        transition
        hover:-translate-y-0.5
        hover:border-line
        hover:shadow-md
      "
    >
      <div
        className="
          flex
          h-12
          w-12
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-accent
          text-primary
        "
      >
        {icon}
      </div>

      <div>
        <h3 className="mb-1 text-sm font-semibold text-success">
          {title}
        </h3>

        {children}
      </div>
    </div>
  );
}