"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ShieldCheck, Smartphone } from "lucide-react";
import Msg91Otp from "@/app/components/Msg91Otp";

interface Msg91Response {
  reqId?: string;
  req_id?: string;
  requestId?: string;
  request_id?: string;
  access_token?: string;
  accessToken?: string;
  token?: string;
  "access-token"?: string;
  data?: Msg91Response;
  [key: string]: unknown;
}

type LoginType = "user";
type Step = "mobile" | "otp";

function normalizeMobile(value: string): string {
  let mobile = String(value || "").replace(/\D/g, "");
  if (mobile.length === 12 && mobile.startsWith("91")) mobile = mobile.slice(2);
  return mobile.slice(0, 10);
}

function getMsg91ErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object") {
    const value = error as { message?: string; error?: string };
    return value.message || value.error || fallback;
  }
  return typeof error === "string" ? error : fallback;
}

function getResponseValue(data: unknown, keys: string[]): string {
  if (!data || typeof data !== "object") return "";
  const response = data as Msg91Response;
  for (const source of [response, response.data]) {
    if (!source || typeof source !== "object") continue;
    for (const key of keys) {
      const value = source[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }
  return "";
}

function getReqId(data: unknown): string {
  return getResponseValue(data, ["reqId", "req_id", "requestId", "request_id"]);
}

function getAccessToken(data: unknown): string {
  const token = typeof data === "string"
    ? data.trim()
    : getResponseValue(data, ["access_token", "accessToken", "token", "access-token"]);
  return token.split(".").length === 3 ? token : "";
}

function runOtp<T>(start: (success: (data: T) => void, failure: (error: unknown) => void) => void) {
  return new Promise<T>((resolve, reject) => start(resolve, reject));
}

export default function LoginPage() {
  const router = useRouter();
  const loginType: LoginType = "user";
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<Step>("mobile");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [msg91Ready, setMsg91Ready] = useState(false);

  const handleMsg91Ready = useCallback(() => {
    setMsg91Ready(true);
    setError("");
  }, []);

  const handleMsg91Error = useCallback((cause: unknown) => {
    setMsg91Ready(false);
    setError(getMsg91ErrorMessage(cause, "MSG91 OTP service could not be initialized."));
  }, []);

  const handleSendOtp = async () => {
    const number = normalizeMobile(mobile);
    if (number.length !== 10) return setError("Please enter a valid 10-digit mobile number.");
    if (!msg91Ready || !window.sendOtp) return setError("MSG91 OTP service is not ready. Please wait.");

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: number }),
      });
      const result = await response.json().catch(() => ({})) as {
        success?: boolean;
        message?: string;
        code?: string;
      };
      if (!response.ok || result.success !== true) {
        throw new Error(result.message || "Unable to check your account.");
      }

      sessionStorage.setItem("login_mobile", number);
      sessionStorage.setItem("msg91_mobile", number);
      sessionStorage.setItem("login_type", loginType);
      const sent = await runOtp<unknown>((success, failure) =>
        window.sendOtp!(`91${number}`, success, failure),
      );
      const reqId = getReqId(sent);
      if (reqId) sessionStorage.setItem("msg91_req_id", reqId);
      else sessionStorage.removeItem("msg91_req_id");
      setMobile(number);
      setOtp("");
      setStep("otp");
    } catch (cause) {
      setError(getMsg91ErrorMessage(cause, "Unable to send OTP. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return setError("Please enter the 6-digit OTP.");
    if (!window.verifyOtp) return setError("MSG91 OTP service is not ready. Please wait.");

    const number = normalizeMobile(
      sessionStorage.getItem("login_mobile") || sessionStorage.getItem("msg91_mobile") || mobile,
    );
    if (number.length !== 10) {
      setError("Mobile number is invalid. Please request OTP again.");
      setStep("mobile");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const verified = await runOtp<unknown>((success, failure) =>
        window.verifyOtp!(otp, success, failure, sessionStorage.getItem("msg91_req_id") || undefined),
      );
      const token = getAccessToken(verified);
      if (!token) throw new Error("OTP verification did not return a valid token.");

      const response = await fetch("/api/auth/msg91-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mobile: number, accessToken: token }),
      });
      const result = await response.json().catch(() => ({})) as {
        success?: boolean;
        message?: string;
        user?: { role?: string };
      };
      if (!response.ok || result.success !== true) {
        throw new Error(result.message || "Unable to complete login.");
      }
      if (result.user?.role === "admin") {
        setError("Admin accounts must log in at the admin portal.");
        return;
      }

      ["msg91_req_id", "msg91_mobile", "login_mobile", "login_type"].forEach((key) =>
        sessionStorage.removeItem(key),
      );
      router.replace("/dashboard");
    } catch (cause) {
      setError(getMsg91ErrorMessage(cause, "Unable to complete login."));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (loading || resending) return;
    const number = normalizeMobile(sessionStorage.getItem("login_mobile") || mobile);
    if (number.length !== 10) return setError("Mobile number is invalid.");

    const reqId = sessionStorage.getItem("msg91_req_id");
    if (reqId ? !window.retryOtp : !window.sendOtp) {
      return setError("MSG91 OTP service is not ready.");
    }

    setResending(true);
    setError("");
    try {
      const sent = await runOtp<unknown>((success, failure) => {
        if (reqId) window.retryOtp!(null, success, failure, reqId);
        else window.sendOtp!(`91${number}`, success, failure);
      });
      const newReqId = getReqId(sent);
      if (newReqId) sessionStorage.setItem("msg91_req_id", newReqId);
      sessionStorage.setItem("msg91_mobile", number);
      sessionStorage.setItem("login_mobile", number);
      setOtp("");
    } catch (cause) {
      setError(getMsg91ErrorMessage(cause, "Unable to resend OTP. Please try again."));
    } finally {
      setResending(false);
    }
  };

  const handleChangeNumber = () => {
    ["msg91_req_id", "msg91_mobile", "login_mobile"].forEach((key) =>
      sessionStorage.removeItem(key),
    );
    setMobile("");
    setOtp("");
    setStep("mobile");
    setError("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    if (step === "mobile") void handleSendOtp();
    else void handleVerifyOtp();
  };

  const handleMobileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMobile(normalizeMobile(event.target.value));
    setError("");
  };

  const handleOtpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
    setError("");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      <Msg91Otp onReady={handleMsg91Ready} onError={handleMsg91Error} />

      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-white" />
        <div className="absolute -left-[120px] top-1/2 hidden -translate-y-1/2 select-none opacity-[0.055] lg:block">
          <div className="text-[520px] font-black leading-none tracking-[-0.12em] text-[#1E3A5F]">dp</div>
        </div>
        <div className="absolute -left-28 -top-28 h-[330px] w-[330px] rounded-full bg-gradient-to-br from-[#1E3A5F]/20 to-[#3D6A9C]/5 blur-[1px]" />
        <div className="absolute -right-24 top-10 h-[260px] w-[260px] rounded-full border border-[#1E3A5F]/10 bg-white/30" />
        <div className="absolute right-[5%] top-[12%] h-24 w-24 rounded-full border border-[#1E3A5F]/10" />
        <div className="absolute left-[22%] top-[12%] h-5 w-5 rounded-full bg-[#3D6A9C]/15" />
        <div className="absolute right-[17%] top-[32%] h-7 w-7 rounded-full bg-[#1E3A5F]/15" />
        <div className="absolute left-[14%] bottom-[25%] h-6 w-6 rounded-full border-2 border-[#3D6A9C]/25" />
        <div className="absolute bottom-12 left-8 grid grid-cols-5 gap-3 opacity-60">
          {Array.from({ length: 25 }, (_, index) => <span key={index} className="h-1 w-1 rounded-full bg-[#1E3A5F]/45" />)}
        </div>
        <div className="absolute right-[15%] top-10 grid grid-cols-5 gap-3 opacity-50">
          {Array.from({ length: 25 }, (_, index) => <span key={index} className="h-1 w-1 rounded-full bg-[#1E3A5F]/35" />)}
        </div>
        <div className="absolute right-[5%] top-[45%] hidden h-[280px] w-[330px] lg:block">
          <div className="absolute left-[20%] top-[20%] h-3 w-3 rounded-full bg-[#1E3A5F]/70" />
          <div className="absolute left-[58%] top-[12%] h-2.5 w-2.5 rounded-full bg-[#3D6A9C]/70" />
          <div className="absolute left-[82%] top-[42%] h-3 w-3 rounded-full bg-[#3D6A9C]/65" />
          <div className="absolute left-[54%] top-[62%] h-2.5 w-2.5 rounded-full bg-[#1E3A5F]/60" />
          <div className="absolute left-[18%] top-[72%] h-3 w-3 rounded-full bg-[#3D6A9C]/60" />
          <div className="absolute left-[40%] top-[42%] h-2.5 w-2.5 rounded-full bg-[#3D6A9C]/70" />
          <div className="absolute left-[23%] top-[23%] h-px w-[38%] rotate-[-10deg] bg-[#3D6A9C]/20" />
          <div className="absolute left-[59%] top-[18%] h-px w-[27%] rotate-[40deg] bg-[#3D6A9C]/20" />
          <div className="absolute left-[55%] top-[44%] h-px w-[28%] rotate-[-8deg] bg-[#3D6A9C]/20" />
          <div className="absolute left-[42%] top-[44%] h-px w-[14%] rotate-[65deg] bg-[#3D6A9C]/20" />
          <div className="absolute left-[20%] top-[72%] h-px w-[40%] rotate-[-35deg] bg-[#3D6A9C]/20" />
        </div>
        <div className="pointer-events-none absolute -bottom-[30px] left-[-8%] h-[300px] w-[116%] rotate-[-2deg] opacity-50">
          <div className="absolute inset-x-0 top-[80px] h-[150px] rounded-[50%] border-[3px] border-[#3D6A9C]/20" />
          <div className="absolute inset-x-[2%] top-[90px] h-[145px] rounded-[50%] border-2 border-[#1E3A5F]/20" />
          <div className="absolute inset-x-[4%] top-[100px] h-[140px] rounded-[50%] border border-[#3D6A9C]/25" />
          <div className="absolute inset-x-[7%] top-[110px] h-[135px] rounded-[50%] border border-[#3D6A9C]/20" />
          <div className="absolute inset-x-[10%] top-[120px] h-[130px] rounded-[50%] border border-[#1E3A5F]/15" />
        </div>
        <div className="absolute -right-[160px] bottom-[12%] h-[420px] w-[420px] rounded-full border-2 border-[#1E3A5F]/10" />
        <div className="absolute -right-[125px] bottom-[15%] h-[350px] w-[350px] rounded-full border border-[#3D6A9C]/10" />
        <div className="absolute -right-[90px] bottom-[18%] h-[280px] w-[280px] rounded-full border border-[#3D6A9C]/10" />
        <span className="absolute right-[20%] top-[28%] text-3xl font-light text-[#1E3A5F]/45">+</span>
        <span className="absolute left-[30%] top-[25%] text-xl font-light text-[#1E3A5F]/30">+</span>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:py-12">
        <div className="w-full max-w-[440px]">
          <section className="relative overflow-hidden rounded-[30px] border border-white/80 bg-white/95 px-5 py-7 shadow-[0_30px_100px_rgba(30,58,95,0.18)] backdrop-blur-2xl sm:px-10 sm:py-9">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-[#1E3A5F]/10 blur-3xl" />
            <div className="relative mb-5 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-3 rounded-3xl bg-[#1E3A5F]/5 blur-xl" />
                <Image src="/logo-transparent.png" alt="DigiProfilo" width={310} height={110} priority className="relative h-auto w-[230px] object-contain mix-blend-multiply sm:w-[250px]" />
              </div>
            </div>

            <header className="relative text-center">
              <h1 className="text-2xl font-bold text-[#152A47] sm:text-3xl">
                {step === "mobile" ? "Welcome Back" : "Verify OTP"}
              </h1>
              <p className="mx-auto mt-2 max-w-[330px] text-sm leading-6 text-[#77736E]">
                {step === "mobile" ? "Login to continue" : `Enter the OTP sent to +91 ${mobile}`}
              </p>
            </header>

            <div className="mx-auto mt-8 flex max-w-[330px] items-start">
              <div className="flex flex-col items-center">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full transition-all ${step === "mobile" ? "bg-[#EAF0F6] text-[#1E3A5F] ring-4 ring-[#1E3A5F]/5" : "bg-[#1E3A5F] text-white shadow-[0_8px_20px_rgba(30,58,95,0.25)]"}`}>
                  {step === "otp" ? <Check className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
                </div>
                <span className={`mt-2 whitespace-nowrap text-xs font-semibold ${step === "mobile" ? "text-[#1E3A5F]" : "text-[#77736E]"}`}>Mobile Number</span>
              </div>
              <div className={`mt-[22px] h-[2px] flex-1 transition-all ${step === "otp" ? "bg-gradient-to-r from-[#1E3A5F] to-[#3D6A9C]" : "bg-[#E5E0D9]"}`} />
              <div className="flex flex-col items-center">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full transition-all ${step === "otp" ? "border border-[#3D6A9C]/40 bg-[#E5E0D9] text-[#1E3A5F] ring-4 ring-[#1E3A5F]/5" : "border border-[#E5E0D9] bg-white text-[#77736E]"}`}>
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className={`mt-2 whitespace-nowrap text-xs font-semibold ${step === "otp" ? "text-[#1E3A5F]" : "text-[#77736E]"}`}>OTP Verification</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8">
              {step === "mobile" ? (
                <>
                  <label htmlFor="mobile" className="mb-2.5 block text-xs font-semibold text-[#121212]">Mobile Number</label>
                  <div className={`group flex h-[58px] overflow-hidden rounded-2xl border bg-white transition-all focus-within:border-[#3D6A9C] focus-within:ring-4 focus-within:ring-[#3D6A9C]/10 ${error ? "border-red-400" : "border-[#E5E0D9]"}`}>
                    <div className="flex w-[104px] shrink-0 items-center gap-2.5 border-r border-[#E5E0D9] px-3.5 sm:w-[112px]">
                      <Image src="/india.jpg" alt="India" width={24} height={18} className="h-[18px] w-6 rounded-sm object-cover" />
                      <span className="text-sm font-semibold text-[#121212]">+91</span>
                    </div>
                    <input id="mobile" name="mobile" type="tel" inputMode="numeric" autoComplete="tel" value={mobile} onChange={handleMobileChange} placeholder="Enter your mobile number" className="min-w-0 flex-1 bg-transparent px-4 text-sm font-medium text-[#152A47] outline-none placeholder:text-[#77736E]" />
                  </div>
                </>
              ) : (
                <>
                  <label htmlFor="otp" className="mb-2.5 block text-xs font-semibold text-[#121212]">Enter OTP</label>
                  <div className={`flex h-[58px] items-center rounded-2xl border bg-white px-4 transition-all focus-within:border-[#3D6A9C] focus-within:ring-4 focus-within:ring-[#3D6A9C]/10 ${error ? "border-red-400" : "border-[#E5E0D9]"}`}>
                    <ShieldCheck className="mr-3 h-5 w-5 shrink-0 text-[#3D6A9C]" />
                    <input id="otp" name="otp" type="text" inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={handleOtpChange} placeholder="Enter 6-digit OTP" maxLength={6} autoFocus className="w-full bg-transparent text-center text-lg font-bold tracking-[8px] text-[#152A47] outline-none placeholder:text-xs placeholder:font-normal placeholder:tracking-normal placeholder:text-[#77736E]" />
                  </div>
                  <div className="mt-3 flex justify-between text-xs">
                    <button type="button" onClick={handleChangeNumber} className="font-medium text-[#77736E] transition-colors hover:text-[#1E3A5F]">Change number</button>
                    <button type="button" onClick={() => void handleResendOtp()} disabled={loading || resending} className="font-semibold text-[#1E3A5F] transition-colors disabled:opacity-50">
                      {resending ? "Sending..." : "Resend OTP"}
                    </button>
                  </div>
                </>
              )}

              {error && <div role="alert" className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs font-medium leading-5 text-red-500">{error}</div>}

              <button type="submit" disabled={loading || (step === "mobile" && !msg91Ready)} className="group relative mt-7 flex h-[56px] w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E3A5F] via-[#1E3A5F] to-[#1E3A5F] text-sm font-semibold text-white shadow-[0_12px_28px_rgba(30,58,95,0.25)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_16px_35px_rgba(30,58,95,0.32)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70">
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative flex items-center justify-center gap-3">
                  {loading ? (
                    <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />{step === "mobile" ? "Checking account..." : "Verifying OTP..."}</>
                  ) : (
                    <>{step === "mobile" ? msg91Ready ? "Send OTP" : "Loading OTP Service..." : "Verify OTP"}<ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></>
                  )}
                </span>
              </button>

              <p className="mt-5 text-center text-xs text-[#77736E]">
                New to DigiProfilo? <Link href="/register" className="font-semibold text-[#1E3A5F] transition-colors hover:underline">Create an account</Link>
              </p>
              <p className="mt-3 text-center text-xs">
                <Link href="/" className="font-semibold text-[#77736E] transition-colors hover:text-[#1E3A5F] hover:underline">Go to home</Link>
              </p>
            </form>
          </section>
          <p className="mt-5 text-center text-xs font-medium uppercase tracking-[0.12em] text-[#77736E]">Empowering Connections</p>
        </div>
      </div>
    </main>
  );
}
