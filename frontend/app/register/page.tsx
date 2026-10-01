"use client";

import { useCallback, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BriefcaseBusiness, Building2, Check, Mail, ShieldCheck, User } from "lucide-react";
import Msg91Otp from "@/app/components/Msg91Otp";

type Step = "details" | "otp";
type Details = { name: string; designation: string; companyName: string; email: string; mobile: string };
type OtpResponse = {
  reqId?: string;
  req_id?: string;
  requestId?: string;
  request_id?: string;
  access_token?: string;
  accessToken?: string;
  token?: string;
  "access-token"?: string;
  message?: string;
  data?: OtpResponse;
  [key: string]: unknown;
};

const initialDetails: Details = { name: "", designation: "", companyName: "", email: "", mobile: "" };
const storageKeys = ["msg91_req_id", "msg91_mobile", "register_name", "register_designation", "register_companyName", "register_email"];

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message || fallback;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const value = error as { message?: string; error?: string };
    return value.message || value.error || fallback;
  }
  return fallback;
}

function responseValue(data: unknown, keys: string[]) {
  if (!data || typeof data !== "object") return "";
  const response = data as OtpResponse;
  for (const source of [response, response.data]) {
    if (!source) continue;
    for (const key of keys) {
      const value = source[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }
  return "";
}

function getReqId(data: unknown) {
  return responseValue(data, ["reqId", "req_id", "requestId", "request_id"]);
}

function getAccessToken(data: unknown) {
  const token = typeof data === "string"
    ? data.trim()
    : responseValue(data, ["access_token", "accessToken", "token", "access-token", "message"]);
  return token.split(".").length === 3 ? token : "";
}

function runOtp<T>(start: (success: (data: T) => void, failure: (error: unknown) => void) => void) {
  return new Promise<T>((resolve, reject) => start(resolve, reject));
}

function TextField({ id, label, placeholder, value, onChange, icon, type = "text", autoComplete }: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  icon: ReactNode;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-[#152A47]">{label}</label>
      <div className="flex h-10 items-center rounded-lg border border-[#E5E0D9] bg-[#FAF9F6] px-3 transition focus-within:border-[#1E3A5F] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#1E3A5F]/10">
        {icon}
        <input id={id} name={id} type={type} autoComplete={autoComplete} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-transparent text-xs text-[#152A47] outline-none placeholder:text-[#77736E]" />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [details, setDetails] = useState(initialDetails);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [msg91Ready, setMsg91Ready] = useState(false);
  const [error, setError] = useState("");

  const handleMsg91Ready = useCallback(() => {
    setMsg91Ready(true);
    setError("");
  }, []);

  const handleMsg91Error = useCallback((cause: unknown) => {
    setMsg91Ready(false);
    setError(errorMessage(cause, "MSG91 OTP service could not be initialized."));
  }, []);

  const updateDetails = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;
    setDetails((current) => ({ ...current, [name]: name === "mobile" ? value.replace(/\D/g, "").slice(0, 10) : value }));
    setError("");
  };

  const validateDetails = () => {
    if (!details.name.trim()) return setError("Please enter your full name."), false;
    if (!details.designation.trim()) return setError("Please enter your designation."), false;
    if (!details.companyName.trim()) return setError("Please enter your company name."), false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim())) return setError("Please enter a valid email address."), false;
    if (details.mobile.length !== 10) return setError("Please enter a valid 10-digit mobile number."), false;
    return true;
  };

  const handleSendOtp = async () => {
    if (!validateDetails()) return;
    if (!msg91Ready || !window.sendOtp) return setError("MSG91 OTP service is not ready. Please wait.");

    setLoading(true);
    setError("");
    try {
      const sent = await runOtp<unknown>((success, failure) => window.sendOtp!(`91${details.mobile}`, success, failure));
      const reqId = getReqId(sent);
      sessionStorage.setItem("msg91_mobile", details.mobile);
      sessionStorage.setItem("register_name", details.name.trim());
      sessionStorage.setItem("register_designation", details.designation.trim());
      sessionStorage.setItem("register_companyName", details.companyName.trim());
      sessionStorage.setItem("register_email", details.email.trim());
      if (reqId) sessionStorage.setItem("msg91_req_id", reqId);
      else sessionStorage.removeItem("msg91_req_id");
      setOtp("");
      setStep("otp");
    } catch (cause) {
      setError(errorMessage(cause, "Unable to send OTP. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) return setError("Please enter the 6-digit OTP.");
    if (!window.verifyOtp) return setError("MSG91 OTP service is not ready. Please wait.");

    const mobile = sessionStorage.getItem("msg91_mobile") || details.mobile;
    if (mobile.length !== 10) {
      setStep("details");
      return setError("Mobile number is invalid. Please request OTP again.");
    }

    setLoading(true);
    setError("");
    try {
      const verified = await runOtp<unknown>((success, failure) =>
        window.verifyOtp!(otp, success, failure, sessionStorage.getItem("msg91_req_id") || undefined),
      );
      const accessToken = getAccessToken(verified);
      if (!accessToken) throw new Error("OTP verified, but a valid verification token was not returned.");

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: sessionStorage.getItem("register_name") || details.name.trim(),
          designation: sessionStorage.getItem("register_designation") || details.designation.trim(),
          companyName: sessionStorage.getItem("register_companyName") || details.companyName.trim(),
          email: (sessionStorage.getItem("register_email") || details.email).trim().toLowerCase(),
          mobile,
          accessToken,
        }),
      });
      const result = await response.json().catch(() => ({})) as { success?: boolean; message?: string };
      if (!response.ok || result.success !== true) throw new Error(result.message || "Registration failed.");

      storageKeys.forEach((key) => sessionStorage.removeItem(key));
      router.replace("/dashboard");
    } catch (cause) {
      setError(errorMessage(cause, "Unable to complete registration."));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (loading || resending) return;
    const reqId = sessionStorage.getItem("msg91_req_id");
    if (reqId ? !window.retryOtp : !window.sendOtp) return setError("MSG91 OTP service is not ready.");

    setResending(true);
    setError("");
    try {
      const sent = await runOtp<unknown>((success, failure) => {
        if (reqId) window.retryOtp!(null, success, failure, reqId);
        else window.sendOtp!(`91${details.mobile}`, success, failure);
      });
      const newReqId = getReqId(sent);
      if (newReqId) sessionStorage.setItem("msg91_req_id", newReqId);
      setOtp("");
    } catch (cause) {
      setError(errorMessage(cause, "Unable to resend OTP. Please try again."));
    } finally {
      setResending(false);
    }
  };

  const handleChangeDetails = () => {
    storageKeys.forEach((key) => sessionStorage.removeItem(key));
    setOtp("");
    setStep("details");
    setError("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    if (step === "details") void handleSendOtp();
    else void handleVerifyOtp();
  };

  const fields = [
    { id: "name", label: "Full Name", placeholder: "Enter your full name", icon: <User className="mr-3 h-4 w-4 shrink-0 text-[#77736E]" />, autoComplete: "name" },
    { id: "designation", label: "Designation", placeholder: "e.g. Software Developer", icon: <BriefcaseBusiness className="mr-3 h-4 w-4 shrink-0 text-[#77736E]" /> },
    { id: "companyName", label: "Company Name", placeholder: "Enter company name", icon: <Building2 className="mr-3 h-4 w-4 shrink-0 text-[#77736E]" /> },
    { id: "email", label: "Email Address", placeholder: "Enter your email", icon: <Mail className="mr-3 h-4 w-4 shrink-0 text-[#77736E]" />, type: "email", autoComplete: "email" },
  ] as const;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FAF9F6] text-[#152A47]">
      <Msg91Otp onReady={handleMsg91Ready} onError={handleMsg91Error} />
      <div className="grid min-h-screen lg:grid-cols-2">
        <aside className="relative hidden min-h-screen overflow-hidden bg-[#152A47] text-white lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-10 xl:px-16">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(61,106,156,0.35),transparent_35%),linear-gradient(145deg,#152A47,#101B32_58%,#1E3A5F)]" />
          <div className="relative z-10 flex items-center">
            <Image src="/logo-transparent.png" alt="DigiProfilo" width={176} height={64} priority className="h-16 w-44 object-contain" />
          </div>
          <div className="relative z-10 max-w-127.5 py-12">
            <h2 className="text-4xl font-bold leading-tight xl:text-5xl">Create. Share.<br />Grow.</h2>
            <p className="mt-4 max-w-112.5 text-sm leading-6 text-white/70">Go live in under 5 minutes. No coding or design skills required. Set up your visiting card, product catalog, or resume and start sharing instantly.</p>
            <ul className="mt-7 space-y-3 text-sm text-white/80">
              {["Go live in under 5 minutes", "100% no-code intuitive setup", "Instant QR code and single-link sharing"].map((item) => (
                <li key={item} className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3D6A9C]/50"><Check className="h-3.5 w-3.5" /></span>{item}</li>
              ))}
            </ul>
          </div>
          <p className="relative z-10 border-t border-white/15 pt-4 text-xs text-white/55">Your professional identity, beautifully organized and ready to share.</p>
        </aside>

        <section className="relative flex min-h-screen items-start justify-center px-4 py-8 sm:px-7 lg:px-10 xl:px-16">
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-87.5 w-87.5 rounded-full bg-[#1E3A5F]/5 blur-3xl" />
          <div className="relative z-10 w-full max-w-140">
            <div className="mb-6 flex items-center justify-center gap-3 lg:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1E3A5F] text-sm font-bold text-white">DP</span>
              <span className="text-base font-semibold">DigiProfilo</span>
            </div>

            <header>
              <h1 className="text-2xl font-bold sm:text-3xl">{step === "details" ? "Create Your Account" : "Verify OTP"}</h1>
              <p className="mt-2.5 text-sm leading-6 text-[#77736E]">{step === "details" ? "Create your DigiProfilo account" : `Enter the OTP sent to +91 ${details.mobile}`}</p>
            </header>

            <div className="mt-7 flex max-w-95 items-start">
              <div className="flex flex-col items-center">
                <span className={`flex h-9 w-9 items-center justify-center rounded-full ${step === "details" ? "bg-[#EAF0F6] text-[#1E3A5F]" : "bg-[#1E3A5F] text-white"}`}>{step === "otp" ? <Check className="h-4 w-4" /> : <User className="h-4 w-4" />}</span>
                <span className="mt-1.5 whitespace-nowrap text-xs font-medium">Your Details</span>
              </div>
              <div className={`mt-4.5 h-px flex-1 ${step === "otp" ? "bg-[#1E3A5F]" : "bg-[#E5E0D9]"}`} />
              <div className="flex flex-col items-center">
                <span className={`flex h-9 w-9 items-center justify-center rounded-full border ${step === "otp" ? "border-[#1E3A5F] bg-[#E5E0D9] text-[#1E3A5F]" : "border-[#E5E0D9] bg-white text-[#77736E]"}`}><ShieldCheck className="h-4 w-4" /></span>
                <span className={`mt-1.5 whitespace-nowrap text-xs font-medium ${step === "otp" ? "text-[#1E3A5F]" : "text-[#77736E]"}`}>OTP Verification</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-7">
              {step === "details" ? (
                <div className="space-y-4">
                  {fields.map((field) => (
                    <TextField key={field.id} {...field} value={details[field.id]} onChange={updateDetails} />
                  ))}
                  <div>
                    <label htmlFor="mobile" className="mb-1 block text-xs font-semibold">Mobile Number</label>
                    <div className={`flex h-12 overflow-hidden rounded-xl border bg-[#FAF9F6] focus-within:border-[#3D6A9C] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#3D6A9C]/10 ${error ? "border-red-400" : "border-[#E5E0D9]"}`}>
                      <div className="flex w-24.5 shrink-0 items-center gap-2 border-r border-[#E5E0D9] px-3">
                        <Image src="/india.jpg" alt="India" width={23} height={17} className="h-4.25 w-5.75 object-cover" />
                        <span className="text-xs font-medium">+91</span>
                      </div>
                      <input id="mobile" name="mobile" type="tel" inputMode="numeric" autoComplete="tel" value={details.mobile} onChange={updateDetails} placeholder="Enter mobile number" className="min-w-0 flex-1 bg-transparent px-4 text-xs outline-none placeholder:text-[#77736E]" />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="otp" className="mb-2 block text-xs font-semibold">Enter OTP</label>
                  <div className={`flex h-14.5 items-center rounded-xl border bg-white px-4 focus-within:border-[#3D6A9C] focus-within:ring-4 focus-within:ring-[#3D6A9C]/10 ${error ? "border-red-400" : "border-[#E5E0D9]"}`}>
                    <ShieldCheck className="mr-3 h-5 w-5 shrink-0 text-[#3D6A9C]" />
                    <input id="otp" name="otp" type="text" inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(event) => { setOtp(event.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }} placeholder="Enter 6-digit OTP" maxLength={6} autoFocus className="w-full bg-transparent text-center text-base font-semibold tracking-[8px] outline-none placeholder:text-xs placeholder:font-normal placeholder:tracking-normal placeholder:text-[#77736E]" />
                  </div>
                  <div className="mt-3 flex justify-between text-xs">
                    <button type="button" onClick={handleChangeDetails} className="font-medium text-[#77736E] hover:text-[#1E3A5F]">Change details</button>
                    <button type="button" onClick={() => void handleResendOtp()} disabled={loading || resending} className="font-semibold text-[#1E3A5F] disabled:opacity-50">{resending ? "Sending..." : "Resend OTP"}</button>
                  </div>
                </div>
              )}

              {error && <p role="alert" className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium leading-5 text-red-600">{error}</p>}
              <button type="submit" disabled={loading || (step === "details" && !msg91Ready)} className="mt-6 flex h-12.5 w-full items-center justify-center gap-3 rounded-xl bg-[#1E3A5F] text-xs font-semibold text-white shadow-[0_10px_25px_rgba(30,58,95,0.22)] transition hover:-translate-y-px hover:bg-[#294d78] disabled:cursor-not-allowed disabled:opacity-70">
                {loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />{step === "details" ? "Sending OTP..." : "Creating Account..."}</> : <>{step === "details" ? msg91Ready ? "Create Account" : "Loading OTP Service..." : "Verify & Create Account"}<ArrowRight className="h-4 w-4" /></>}
              </button>
              <p className="mt-5 text-center text-xs text-[#77736E]">Already have an account? <Link href="/login" className="font-semibold text-[#1E3A5F] hover:underline">Login</Link></p>
              <p className="mt-3 text-center text-xs"><Link href="/" className="font-semibold text-[#77736E] hover:text-[#1E3A5F] hover:underline">Go to home</Link></p>
              <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-[#77736E]"><ShieldCheck className="h-3.5 w-3.5 shrink-0" />We never share your number with anyone</p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
