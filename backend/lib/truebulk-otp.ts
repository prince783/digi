import crypto from "crypto";

import OtpVerification from "@/app/models/OtpVerification";

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function normalizeMobile(value: unknown) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.startsWith("91") && digits.length === 12
    ? digits.slice(2)
    : digits;
}

function hashOtp(otp: string) {
  return crypto
    .createHmac("sha256", process.env.SESSION_SECRET || "otp-secret")
    .update(otp)
    .digest("hex");
}

function signAccessToken(mobile: string) {
  const payload = `${mobile}.${Date.now()}`;
  const signature = hashOtp(payload);
  return `${payload}.${signature}`;
}

export function verifyOtpAccessToken(token: string, mobile: string) {
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== mobile) return false;
  const issuedAt = Number(parts[1]);
  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > OTP_TTL_MS) {
    return false;
  }
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = hashOtp(payload);
  if (parts[2].length !== expected.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(parts[2]),
    Buffer.from(expected),
  );
}

export async function sendTrueBulkOtp(value: unknown) {
  const mobile = normalizeMobile(value);
  if (!/^\d{10}$/.test(mobile)) {
    throw new Error("Valid 10-digit mobile number is required.");
  }

  const apiUrl = process.env.TRUEBULK_API_URL;
  const username = process.env.TRUEBULK_USERNAME;
  const password = process.env.TRUEBULK_PASSWORD;
  const sender = process.env.TRUEBULK_SENDER;

  if (!apiUrl || !username || !password || !sender) {
    throw new Error("TrueBulkSMS is not configured.");
  }

  const otp = crypto.randomInt(100000, 1000000).toString();
  const message = `${otp} is your One Time Passcode for registration. ${sender}`;
  const params = new URLSearchParams({
    username,
    password,
    sender,
    sendto: `91${mobile}`,
    message,
    ...(process.env.TRUEBULK_PEID
      ? { PEID: process.env.TRUEBULK_PEID }
      : {}),
    ...(process.env.TRUEBULK_TEMPLATE_ID
      ? { templateid: process.env.TRUEBULK_TEMPLATE_ID }
      : {}),
  });

  const response = await fetch(`${apiUrl}?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

 const responseText = await response.text();
const providerResponse = responseText.trim();

console.log("========== TRUE BULK RESPONSE ==========");
console.log("Status:", response.status);
console.log("OK:", response.ok);
console.log("Response:", providerResponse);
console.log("========================================");
  if (
    !response.ok ||
    /invalid|error|fail|insufficient|unauthori[sz]ed/i.test(
      providerResponse,
    )
  ) {
    console.error("TrueBulkSMS provider response:", {
      status: response.status,
      body: providerResponse.slice(0, 500),
    });
    throw new Error(
      providerResponse
        ? `TrueBulkSMS rejected the request: ${providerResponse.slice(0, 180)}`
        : "TrueBulkSMS returned an empty response.",
    );
  }

  await OtpVerification.deleteMany({ mobile });
  await OtpVerification.create({
    mobile,
    otpHash: hashOtp(otp),
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });

  return { mobile, accessToken: signAccessToken(mobile) };
}

export async function verifyTrueBulkOtp(value: unknown, submittedOtp: unknown) {
  const mobile = normalizeMobile(value);
  const otp = String(submittedOtp ?? "").trim();
  const record = await OtpVerification.findOne({ mobile });

  if (
    !record ||
    record.verifiedAt ||
    record.expiresAt.getTime() <= Date.now()
  ) {
    throw new Error("OTP expired. Please request a new OTP.");
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    throw new Error("Too many invalid attempts. Please request a new OTP.");
  }

  record.attempts += 1;
  if (record.otpHash !== hashOtp(otp)) {
    await record.save();
    throw new Error("Invalid OTP. Please try again.");
  }

  record.verifiedAt = new Date();
  await record.save();
  return { mobile, accessToken: signAccessToken(mobile) };
}
