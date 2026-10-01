"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  SupportContactSkeleton,
  SupportTicketsSkeleton,
} from "../components/Shimmer";

import { useRouter } from "next/navigation";

import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  HelpCircle,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Ticket,
  XCircle,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface SupportTicket {
  _id: string;
  ticketId?: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

interface UserData {
  id?: string;
  _id?: string;

  name?: string;

  email?: string;

  mobile?: string;

  phone?: string;

  companyName?: string;

  designation?: string;

  profilePhoto?: string;
}

/* =========================================================
   CONSTANTS
========================================================= */

const categories = [
  "General Support",
  "Digital Visiting Card",
  "Catalog",
  "Resume",
  "Biography",
  "Payment",
  "Subscription",
  "Domain",
  "Account",
  "Technical Issue",
];

const priorities = [
  "Low",
  "Medium",
  "High",
];

const faqs = [
  {
    question:
      "How can I create a Digital Visiting Card?",

    answer:
      "Go to My Projects from the sidebar and select Create New. You can create and manage your Digital Visiting Card there.",
  },

  {
    question:
      "Where can I manage my subscription?",

    answer:
      "Open Subscription from the dashboard sidebar to view your active subscription and available plans.",
  },

  {
    question:
      "I made a payment but my project is not active.",

    answer:
      "Please create a support ticket with your payment details. Our support team can check the payment and subscription status.",
  },

  {
    question:
      "Can I update my profile information?",

    answer:
      "Yes. Open Profile from the dashboard sidebar to manage your personal and professional information.",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

export default function SupportPage() {
  const router = useRouter();

  /* -------------------------------------------------------
     USER
  ------------------------------------------------------- */

  const [user, setUser] =
    useState<UserData | null>(null);

  const [loadingUser, setLoadingUser] =
    useState(true);

  /* -------------------------------------------------------
     TICKETS
  ------------------------------------------------------- */

  const [tickets, setTickets] =
    useState<SupportTicket[]>([]);

  const [loadingTickets, setLoadingTickets] =
    useState(true);

  /* -------------------------------------------------------
     FORM
  ------------------------------------------------------- */

  const [subject, setSubject] =
    useState("");

  const [category, setCategory] =
    useState("General Support");

  const [priority, setPriority] =
    useState("Medium");

  const [message, setMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  /* -------------------------------------------------------
     ALERTS
  ------------------------------------------------------- */

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  /* -------------------------------------------------------
     FAQ
  ------------------------------------------------------- */

  const [openFaq, setOpenFaq] =
    useState<number | null>(null);

  /* =========================================================
     GET USER ID
  ========================================================= */

  const getCurrentUserId = () => {
    return (
      user?.id ||
      user?._id ||
      ""
    );
  };

  /* =========================================================
     FETCH USER
  ========================================================= */

  const loadUser = async () => {
    try {
      setLoadingUser(true);

      const response =
        await fetch("/api/auth/me", {
          method: "GET",

          credentials: "include",

          cache: "no-store",
        });

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to load user information."
        );
      }

      /*
       * Support different response formats
       */

      const currentUser =
        data?.user ||
        data?.data ||
        data;

      if (!currentUser) {
        throw new Error(
          "User session not found."
        );
      }

      const normalizedUser: UserData = {
        id:
          currentUser.id ||
          currentUser._id ||
          "",

        _id:
          currentUser._id ||
          currentUser.id ||
          "",

        name:
          currentUser.name ||
          "",

        email:
          currentUser.email ||
          "",

        mobile:
          currentUser.mobile ||
          "",

        phone:
          currentUser.phone ||
          "",

        companyName:
          currentUser.companyName ||
          "",

        designation:
          currentUser.designation ||
          "",

        profilePhoto:
          currentUser.profilePhoto ||
          "",
      };

      setUser(normalizedUser);

      console.log(
        "SUPPORT CURRENT USER:",
        normalizedUser
      );
    } catch (error) {
      console.error(
        "USER LOAD ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load user information."
      );
    } finally {
      setLoadingUser(false);
    }
  };

  /* =========================================================
     FETCH TICKETS
  ========================================================= */

  const loadTickets = async () => {
    try {
      setLoadingTickets(true);

      /*
       * If user is already loaded, send the ID as query
       * parameter as an additional fallback.
       */

      const userId =
        getCurrentUserId();

      const url = userId
        ? `/api/support?userId=${encodeURIComponent(
            userId
          )}`
        : "/api/support";

      const response =
        await fetch(url, {
          method: "GET",

          credentials: "include",

          headers: userId
            ? {
                "x-user-id": userId,
              }
            : undefined,

          cache: "no-store",
        });

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        /*
         * Don't show the error immediately during the
         * initial request if authentication has not
         * finished loading.
         */
        if (
          !loadingUser &&
          data?.message
        ) {
          setErrorMessage(
            data.message
          );
        }

        throw new Error(
          data?.message ||
            "Unable to load support tickets."
        );
      }

      if (
        Array.isArray(data?.tickets)
      ) {
        setTickets(data.tickets);
      } else if (
        Array.isArray(data?.data)
      ) {
        setTickets(data.data);
      } else if (
        Array.isArray(data)
      ) {
        setTickets(data);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error(
        "SUPPORT TICKETS ERROR:",
        error
      );

      /*
       * Don't destroy already loaded tickets because
       * of a temporary request failure.
       */

      if (!tickets.length) {
        setTickets([]);
      }
    } finally {
      setLoadingTickets(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadUser();
  }, []);

  /*
   * Load tickets after user information is available.
   */

  useEffect(() => {
    if (
      !loadingUser &&
      getCurrentUserId()
    ) {
      loadTickets();
    }
  }, [loadingUser, user]);

  /* =========================================================
     SUBMIT SUPPORT REQUEST
  ========================================================= */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    /* -------------------------------------------------------
       USER ID
    ------------------------------------------------------- */

    const userId =
      getCurrentUserId();

    if (!userId) {
      setErrorMessage(
        "User session not found. Please login again."
      );

      return;
    }

    /* -------------------------------------------------------
       VALIDATION
    ------------------------------------------------------- */

    if (!subject.trim()) {
      setErrorMessage(
        "Please enter a subject."
      );

      return;
    }

    if (subject.trim().length > 150) {
      setErrorMessage(
        "Subject cannot exceed 150 characters."
      );

      return;
    }

    if (!message.trim()) {
      setErrorMessage(
        "Please describe your issue."
      );

      return;
    }

    if (message.trim().length < 10) {
      setErrorMessage(
        "Please provide a little more information about your issue."
      );

      return;
    }

    if (message.trim().length > 2000) {
      setErrorMessage(
        "Message cannot exceed 2000 characters."
      );

      return;
    }

    try {
      setSubmitting(true);

      /*
       * IMPORTANT:
       *
       * userId is now explicitly sent to the backend.
       *
       * x-user-id is also sent as a header.
       *
       * credentials include keeps your authentication
       * cookies available.
       */

      const response =
        await fetch("/api/support", {
          method: "POST",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",

            "x-user-id": userId,
          },

          body: JSON.stringify({
            userId,

            subject:
              subject.trim(),

            category,

            priority:
              priority.toLowerCase(),

            message:
              message.trim(),
          }),
        });

      const data =
        await response
          .json()
          .catch(() => ({}));

      console.log(
        "SUPPORT POST RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to submit your support request."
        );
      }

      setSuccessMessage(
        data?.message ||
          "Your support request has been submitted successfully."
      );

      /* -----------------------------------------------------
         RESET FORM
      ----------------------------------------------------- */

      setSubject("");

      setCategory(
        "General Support"
      );

      setPriority(
        "Medium"
      );

      setMessage("");

      /* -----------------------------------------------------
         REFRESH TICKETS
      ----------------------------------------------------- */

      await loadTickets();
    } catch (error) {
      console.error(
        "SUPPORT SUBMIT ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     HELPERS
  ========================================================= */

  const getStatusStyle = (
    status: string
  ) => {
    switch (
      status?.toLowerCase()
    ) {
      case "resolved":
      case "closed":
        return "bg-[#EAF0F6] text-[#7A9B7E]";

      case "in progress":
      case "processing":
        return "bg-[#EAF0F6] text-[#1E3A5F]";

      case "pending":
      case "open":
      default:
        return "bg-[#fff5df] text-[#d69220]";
    }
  };

  const getPriorityStyle = (
    priority: string
  ) => {
    switch (
      priority?.toLowerCase()
    ) {
      case "high":
      case "urgent":
        return "text-[#e45454]";

      case "medium":
        return "text-[#d58c16]";

      default:
        return "text-[#1E3A5F]";
    }
  };

  const formatDate = (
    date: string
  ) => {
    if (!date) {
      return "-";
    }

    try {
      return new Date(
        date
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "-";
    }
  };

  /* =========================================================
     DISPLAY USER
  ========================================================= */

  const displayName =
    user?.name ||
    "User";

  const displayEmail =
    user?.email ||
    "Not available";

  const displayMobile =
    user?.mobile ||
    user?.phone ||
    "Not available";

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#FAF9F6] px-3.5 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-[-0.5px] text-[#121212]">
            Support
          </h1>

          <p className="mt-1 text-xs text-[#77736E]">
            Need help? Contact our support team and we&apos;ll
            help you resolve your issue.
          </p>
        </div>

        {/* =====================================================
            QUICK SUPPORT CARDS
        ===================================================== */}

        <section className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* Help Center */}

          <div className="rounded-xl border border-[#E5E0D9] bg-white p-5 shadow-[0_1px_4px_rgba(21,42,71,0.025)]">

            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF0F6]">
              <HelpCircle
                size={22}
                strokeWidth={1.8}
                className="text-[#1E3A5F]"
              />
            </div>

            <h2 className="text-sm font-semibold text-[#121212]">
              Help Center
            </h2>

            <p className="mt-1.5 text-xs leading-5 text-[#77736E]">
              Find answers to common questions and learn how
              to use your account.
            </p>

            <button
              type="button"
              className="mt-4 text-xs font-semibold text-[#1E3A5F] hover:underline"
              onClick={() =>
                document
                  .getElementById(
                    "faq"
                  )
                  ?.scrollIntoView({
                    behavior:
                      "smooth",
                  })
              }
            >
              Browse FAQs →
            </button>
          </div>

          {/* Email */}

          <div className="rounded-xl border border-[#E5E0D9] bg-white p-5 shadow-[0_1px_4px_rgba(21,42,71,0.025)]">

            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF0F6]">
              <Mail
                size={21}
                strokeWidth={1.8}
                className="text-[#1E3A5F]"
              />
            </div>

            <h2 className="text-sm font-semibold text-[#121212]">
              Email Support
            </h2>

            <p className="mt-1.5 text-xs leading-5 text-[#77736E]">
              Send us your question and our support team will
              get back to you.
            </p>

            <a
              href="mailto:support@digiprofilo.com"
              className="mt-4 inline-block text-xs font-semibold text-[#1E3A5F] hover:underline"
            >
              support@digiprofilo.com
            </a>
          </div>

          {/* Tickets */}

          <div className="rounded-xl border border-[#E5E0D9] bg-white p-5 shadow-[0_1px_4px_rgba(21,42,71,0.025)]">

            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF0F6]">
              <Ticket
                size={21}
                strokeWidth={1.8}
                className="text-[#7A9B7E]"
              />
            </div>

            <h2 className="text-sm font-semibold text-[#121212]">
              Support Tickets
            </h2>

            <p className="mt-1.5 text-xs leading-5 text-[#77736E]">
              Track your existing support requests and check
              their status.
            </p>

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById(
                    "tickets"
                  )
                  ?.scrollIntoView({
                    behavior:
                      "smooth",
                  })
              }
              className="mt-4 text-xs font-semibold text-[#1E3A5F] hover:underline"
            >
              View tickets →
            </button>
          </div>
        </section>

        {/* =====================================================
            MAIN SUPPORT AREA
        ===================================================== */}

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.65fr]">

          {/* ===================================================
              CONTACT SUPPORT
          =================================================== */}

          <div className="rounded-xl border border-[#E5E0D9] bg-white shadow-[0_1px_4px_rgba(21,42,71,0.025)]">

            <div className="border-b border-[#E5E0D9] px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF0F6]">
                  <MessageCircle
                    size={19}
                    strokeWidth={1.8}
                    className="text-[#1E3A5F]"
                  />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-[#121212]">
                    Contact Support
                  </h2>

                  <p className="mt-0.5 text-xs text-[#77736E]">
                    Tell us what you need help with.
                  </p>
                </div>

              </div>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="p-5"
            >

              {/* Alerts */}

              {successMessage && (
                <div className="mb-5 flex items-start gap-3 rounded-lg border border-[#E5E0D9] bg-[#E5E0D9] px-4 py-3">

                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-[#7A9B7E]"
                  />

                  <div>
                    <p className="text-xs font-semibold text-[#7A9B7E]">
                      Request submitted
                    </p>

                    <p className="mt-0.5 text-xs text-[#7A9B7E]">
                      {successMessage}
                    </p>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="mb-5 flex items-start gap-3 rounded-lg border border-[#f1d0d0] bg-[#E5E0D9] px-4 py-3">

                  <XCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-[#e45454]"
                  />

                  <div>
                    <p className="text-xs font-semibold text-[#d33f3f]">
                      Unable to submit
                    </p>

                    <p className="mt-0.5 text-xs text-[#77736E]">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* User Information */}

              <div className="mb-5 rounded-lg border border-[#E5E0D9] bg-[#E5E0D9] p-4">

                <div className="mb-3 flex items-center gap-2">

                  <ShieldCheck
                    size={16}
                    className="text-[#1E3A5F]"
                    strokeWidth={1.8}
                  />

                  <p className="text-xs font-semibold text-[#121212]">
                    Your Contact Information
                  </p>

                </div>

                {loadingUser ? (
                  <SupportContactSkeleton />
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#77736E]">
                        Name
                      </p>

                      <p className="mt-1 truncate text-xs font-semibold text-[#121212]">
                        {displayName}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#77736E]">
                        Email
                      </p>

                      <p className="mt-1 truncate text-xs font-semibold text-[#121212]">
                        {displayEmail}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#77736E]">
                        Mobile
                      </p>

                      <p className="mt-1 truncate text-xs font-semibold text-[#121212]">
                        {displayMobile}
                      </p>
                    </div>

                  </div>
                )}
              </div>

              {/* Subject */}

              <div className="mb-4">

                <label
                  htmlFor="subject"
                  className="mb-1.5 block text-xs font-semibold text-[#121212]"
                >
                  Subject{" "}
                  <span className="text-[#e45454]">
                    *
                  </span>
                </label>

                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(event) =>
                    setSubject(
                      event.target.value
                    )
                  }
                  placeholder="What do you need help with?"
                  maxLength={150}
                  className="h-11 w-full rounded-lg border border-[#E5E0D9] bg-white px-3 text-xs text-[#121212] outline-none transition placeholder:text-[#77736E] focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10"
                />

              </div>

              {/* Category + Priority */}

              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>

                  <label
                    htmlFor="category"
                    className="mb-1.5 block text-xs font-semibold text-[#121212]"
                  >
                    Category
                  </label>

                  <div className="relative">

                    <select
                      id="category"
                      value={category}
                      onChange={(event) =>
                        setCategory(
                          event.target.value
                        )
                      }
                      className="h-11 w-full appearance-none rounded-lg border border-[#E5E0D9] bg-white px-3 pr-9 text-xs text-[#121212] outline-none transition focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10"
                    >
                      {categories.map(
                        (item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        )
                      )}
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#77736E]"
                    />

                  </div>
                </div>

                <div>

                  <label
                    htmlFor="priority"
                    className="mb-1.5 block text-xs font-semibold text-[#121212]"
                  >
                    Priority
                  </label>

                  <div className="relative">

                    <select
                      id="priority"
                      value={priority}
                      onChange={(event) =>
                        setPriority(
                          event.target.value
                        )
                      }
                      className="h-11 w-full appearance-none rounded-lg border border-[#E5E0D9] bg-white px-3 pr-9 text-xs text-[#121212] outline-none transition focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10"
                    >
                      {priorities.map(
                        (item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        )
                      )}
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#77736E]"
                    />

                  </div>
                </div>
              </div>

              {/* Message */}

              <div className="mb-5">

                <div className="mb-1.5 flex items-center justify-between">

                  <label
                    htmlFor="message"
                    className="block text-xs font-semibold text-[#121212]"
                  >
                    Message{" "}
                    <span className="text-[#e45454]">
                      *
                    </span>
                  </label>

                  <span className="text-xs text-[#77736E]">
                    {message.length}/2000
                  </span>

                </div>

                <textarea
                  id="message"
                  value={message}
                  onChange={(event) =>
                    setMessage(
                      event.target.value
                    )
                  }
                  placeholder="Describe your issue in detail. Include any relevant information that can help us resolve it faster."
                  maxLength={2000}
                  rows={7}
                  className="w-full resize-none rounded-lg border border-[#E5E0D9] bg-white px-3 py-3 text-xs leading-5 text-[#121212] outline-none transition placeholder:text-[#77736E] focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10"
                />

              </div>

              {/* Submit */}

              <div className="flex flex-col gap-3 border-t border-[#E5E0D9] pt-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-2 text-xs text-[#77736E]">

                  <ShieldCheck
                    size={14}
                    className="text-[#7A9B7E]"
                  />

                  Your information is securely stored.

                </div>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    loadingUser ||
                    !getCurrentUserId()
                  }
                  className="flex h-10 w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#1E3A5F] to-[#1E3A5F] px-5 text-xs font-semibold text-white shadow-[0_3px_8px_rgba(30,58,95,0.18)] transition hover:from-[#1E3A5F] hover:to-[#1E3A5F] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />

                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={15} />

                      Submit Request
                    </>
                  )}
                </button>

              </div>
            </form>
          </div>

          {/* ===================================================
              RIGHT SIDE
          =================================================== */}

          <div className="space-y-5">

            {/* Response Time */}

            <div className="rounded-xl border border-[#E5E0D9] bg-white p-5 shadow-[0_1px_4px_rgba(21,42,71,0.025)]">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fff5df]">

                  <Clock3
                    size={19}
                    strokeWidth={1.8}
                    className="text-[#d69220]"
                  />

                </div>

                <div>

                  <h3 className="text-sm font-semibold text-[#121212]">
                    Support Response
                  </h3>

                  <p className="mt-0.5 text-xs text-[#77736E]">
                    We&apos;ll review your request as soon as possible.
                  </p>

                </div>
              </div>

              <div className="mt-4 rounded-lg bg-[#FAF9F6] px-4 py-3">

                <p className="text-xs leading-5 text-[#77736E]">
                  For faster assistance, provide a clear subject
                  and describe your issue with relevant details.
                </p>

              </div>
            </div>

            {/* Contact */}

            <div className="rounded-xl border border-[#E5E0D9] bg-white p-5 shadow-[0_1px_4px_rgba(21,42,71,0.025)]">

              <h3 className="text-sm font-semibold text-[#121212]">
                Other Ways to Contact Us
              </h3>

              <div className="mt-4 space-y-3">

                <a
                  href="mailto:support@digiprofilo.com"
                  className="flex items-center gap-3 rounded-lg border border-[#E5E0D9] px-3 py-3 transition hover:border-[#E5E0D9] hover:bg-[#E5E0D9]"
                >

                  <Mail
                    size={17}
                    className="text-[#1E3A5F]"
                    strokeWidth={1.8}
                  />

                  <div>

                    <p className="text-xs font-semibold text-[#121212]">
                      Email
                    </p>

                    <p className="mt-0.5 text-xs text-[#77736E]">
                      support@digiprofilo.com
                    </p>

                  </div>
                </a>

                <a
                  href="tel:+918709122663"
                  className="flex items-center gap-3 rounded-lg border border-[#E5E0D9] px-3 py-3 transition hover:border-[#E5E0D9] hover:bg-[#E5E0D9]"
                >

                  <Phone
                    size={17}
                    className="text-[#7A9B7E]"
                    strokeWidth={1.8}
                  />

                  <div>

                    <p className="text-xs font-semibold text-[#121212]">
                      Phone
                    </p>

                    <p className="mt-0.5 text-xs text-[#77736E]">
                      Contact support
                    </p>

                  </div>
                </a>

              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            SUPPORT TICKETS
        ===================================================== */}

        <section
          id="tickets"
          className="mt-5 rounded-xl border border-[#E5E0D9] bg-white shadow-[0_1px_4px_rgba(21,42,71,0.025)]"
        >

          <div className="flex flex-col gap-3 border-b border-[#E5E0D9] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-base font-semibold text-[#121212]">
                My Support Tickets
              </h2>

              <p className="mt-0.5 text-xs text-[#77736E]">
                Track the support requests you have submitted.
              </p>

            </div>

            <button
              type="button"
              onClick={loadTickets}
              disabled={
                loadingTickets ||
                loadingUser
              }
              className="flex h-9 items-center justify-center gap-2 rounded-lg border border-[#E5E0D9] px-3 text-xs font-semibold text-[#77736E] transition hover:bg-[#FFFFFF] disabled:opacity-60"
            >

              <RefreshCw
                size={14}
                className={
                  loadingTickets
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh

            </button>

          </div>

          <div className="p-5">

            {loadingTickets ? (
              <SupportTicketsSkeleton />
            ) : tickets.length === 0 ? (
              <div className="flex min-h-[170px] flex-col items-center justify-center rounded-lg border border-dashed border-[#E5E0D9] bg-[#E5E0D9] px-5 text-center">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EAF0F6]">

                  <Ticket
                    size={20}
                    className="text-[#1E3A5F]"
                    strokeWidth={1.8}
                  />

                </div>

                <h3 className="mt-3 text-xs font-semibold text-[#121212]">
                  No support tickets yet
                </h3>

                <p className="mt-1 max-w-md text-xs leading-5 text-[#77736E]">
                  If you need help, submit a support request using
                  the form above.
                </p>

              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full min-w-[750px] border-collapse">

                  <thead>
                    <tr className="border-b border-[#E5E0D9]">

                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#77736E]">
                        Ticket
                      </th>

                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#77736E]">
                        Subject
                      </th>

                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#77736E]">
                        Category
                      </th>

                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#77736E]">
                        Priority
                      </th>

                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#77736E]">
                        Status
                      </th>

                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#77736E]">
                        Date
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {tickets.map(
                      (ticket) => (
                        <tr
                          key={
                            ticket._id
                          }
                          className="border-b border-[#E5E0D9] last:border-0"
                        >

                          <td className="px-3 py-4">

                            <div className="flex items-center gap-2">

                              <Ticket
                                size={15}
                                className="text-[#1E3A5F]"
                              />

                              <span className="text-xs font-semibold text-[#121212]">

                                {ticket.ticketId ||
                                  `#${ticket._id
                                    .slice(
                                      -6
                                    )
                                    .toUpperCase()}`}

                              </span>

                            </div>

                          </td>

                          <td className="max-w-[250px] px-3 py-4">

                            <p className="truncate text-xs font-semibold text-[#121212]">
                              {ticket.subject}
                            </p>

                          </td>

                          <td className="px-3 py-4">

                            <span className="rounded-md bg-[#FAF9F6] px-2 py-1 text-xs font-medium text-[#77736E]">
                              {ticket.category}
                            </span>

                          </td>

                          <td className="px-3 py-4">

                            <span
                              className={`text-xs font-semibold ${getPriorityStyle(
                                ticket.priority
                              )}`}
                            >
                              {ticket.priority}
                            </span>

                          </td>

                          <td className="px-3 py-4">

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                                ticket.status
                              )}`}
                            >
                              {ticket.status}
                            </span>

                          </td>

                          <td className="px-3 py-4 text-xs text-[#77736E]">

                            {formatDate(
                              ticket.createdAt
                            )}

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>
        </section>

        {/* =====================================================
            FAQ
        ===================================================== */}

        <section
          id="faq"
          className="mt-5 rounded-xl border border-[#E5E0D9] bg-white shadow-[0_1px_4px_rgba(21,42,71,0.025)]"
        >

          <div className="border-b border-[#E5E0D9] px-5 py-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF0F6]">

                <HelpCircle
                  size={19}
                  className="text-[#1E3A5F]"
                  strokeWidth={1.8}
                />

              </div>

              <div>

                <h2 className="text-base font-semibold text-[#121212]">
                  Frequently Asked Questions
                </h2>

                <p className="mt-0.5 text-xs text-[#77736E]">
                  Quick answers to common questions.
                </p>

              </div>

            </div>

          </div>

          <div className="divide-y divide-[#E5E0D9] px-5">

            {faqs.map(
              (faq, index) => {
                const isOpen =
                  openFaq ===
                  index;

                return (
                  <div
                    key={
                      faq.question
                    }
                  >

                    <button
                      type="button"
                      onClick={() =>
                        setOpenFaq(
                          isOpen
                            ? null
                            : index
                        )
                      }
                      className="flex w-full items-center justify-between gap-4 py-4 text-left"
                    >

                      <span className="text-xs font-semibold text-[#121212]">
                        {faq.question}
                      </span>

                      <ChevronDown
                        size={16}
                        className={`shrink-0 text-[#77736E] transition-transform ${
                          isOpen
                            ? "rotate-180"
                            : ""
                        }`}
                      />

                    </button>

                    {isOpen && (
                      <div className="pb-4 pr-8">

                        <p className="text-xs leading-5 text-[#77736E]">
                          {faq.answer}
                        </p>

                      </div>
                    )}

                  </div>
                );
              }
            )}

          </div>
        </section>

        {/* =====================================================
            FOOTER HELP
        ===================================================== */}

        <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-xl border border-[#E5E0D9] bg-[#E5E0D9] px-5 py-4 sm:flex-row">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF0F6]">

              <FileText
                size={17}
                className="text-[#1E3A5F]"
                strokeWidth={1.8}
              />

            </div>

            <div>

              <p className="text-xs font-semibold text-[#121212]">
                Need help with your project?
              </p>

              <p className="mt-0.5 text-xs text-[#77736E]">
                Visit My Projects to create and manage your digital
                profile.
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/projects"
              )
            }
            className="flex h-9 w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-white px-4 text-xs font-semibold text-[#1E3A5F] shadow-sm ring-1 ring-[#E5E0D9] transition hover:bg-[#E5E0D9]"
          >
            My Projects

            <Search size={14} />
          </button>

        </div>

      </div>
    </main>
  );
}