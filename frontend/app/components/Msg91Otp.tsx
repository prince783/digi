"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    sendOtp?: (
      identifier: string,
      success?: (data: unknown) => void,
      failure?: (error: unknown) => void,
    ) => void;
    verifyOtp?: (
      otp: string | number,
      success?: (data: unknown) => void,
      failure?: (error: unknown) => void,
      reqId?: string,
    ) => void;
    retryOtp?: (
      channel: string | null,
      success?: (data: unknown) => void,
      failure?: (error: unknown) => void,
      reqId?: string,
    ) => void;
  }
}

function mobileFromIdentifier(identifier: string) {
  const digits = identifier.replace(/\D/g, "");
  return digits.startsWith("91") && digits.length === 12
    ? digits.slice(2)
    : digits;
}

export default function Msg91Otp({
  onReady,
  onError,
}: {
  onReady?: () => void;
  onError?: (error: unknown) => void;
}) {
  useEffect(() => {
    const request = async (
      path: string,
      body: Record<string, unknown>,
      success?: (data: unknown) => void,
      failure?: (error: unknown) => void,
    ) => {
      try {
        const response = await fetch(path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const result = await response.json();
        if (!response.ok || result.success !== true) {
          throw new Error(result.message || "OTP request failed.");
        }
        success?.(result);
      } catch (error) {
        failure?.(error);
      }
    };

    window.sendOtp = (identifier, success, failure) =>
      request(
        "/api/auth/truebulk-send",
        { mobile: mobileFromIdentifier(identifier) },
        success,
        failure,
      );

    window.verifyOtp = (otp, success, failure) => {
      const mobile =
        sessionStorage.getItem("login_mobile") ||
        sessionStorage.getItem("msg91_mobile") ||
        "";
      request(
        "/api/auth/truebulk-verify",
        { mobile, otp },
        success,
        failure,
      );
    };

    window.retryOtp = (_channel, success, failure) => {
      const mobile =
        sessionStorage.getItem("login_mobile") ||
        sessionStorage.getItem("msg91_mobile") ||
        "";
      request("/api/auth/truebulk-send", { mobile }, success, failure);
    };

    onReady?.();
    return () => {
      delete window.sendOtp;
      delete window.verifyOtp;
      delete window.retryOtp;
    };
  }, [onReady, onError]);

  return null;
}
