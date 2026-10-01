"use client";

import React, {
  useCallback,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Check,
  ShieldCheck,
  Smartphone,
  Shield,
} from "lucide-react";

import Msg91Otp from "@/app/components/Msg91Otp";

interface Msg91Response {
  type?: string;
  message?: string;

  reqId?: string;
  req_id?: string;
  requestId?: string;
  request_id?: string;

  access_token?: string;
  accessToken?: string;
  token?: string;
  "access-token"?: string;

  data?: {
    reqId?: string;
    req_id?: string;
    requestId?: string;
    request_id?: string;

    access_token?: string;
    accessToken?: string;
    token?: string;
    "access-token"?: string;

    [key: string]: unknown;
  };

  [key: string]: unknown;
}

type LoginType = "admin";

/* =========================================================
   NORMALIZE MOBILE
========================================================= */

function normalizeMobile(
  value: string,
): string {
  let mobile = String(
    value || "",
  ).replace(/\D/g, "");

  if (
    mobile.length === 12 &&
    mobile.startsWith("91")
  ) {
    mobile = mobile.slice(2);
  }

  return mobile.slice(0, 10);
}

/* =========================================================
   ERROR MESSAGE
========================================================= */

function getMsg91ErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (
    typeof error === "object" &&
    error !== null
  ) {
    const obj = error as {
      message?: string;
      error?: string;
    };

    return (
      obj.message ||
      obj.error ||
      fallback
    );
  }

  if (
    typeof error === "string"
  ) {
    return error;
  }

  return fallback;
}

/* =========================================================
   GET REQUEST ID
========================================================= */

function getReqId(
  data: unknown,
): string {
  if (
    typeof data !== "object" ||
    data === null
  ) {
    return "";
  }

  const response =
    data as Msg91Response;

  const values: unknown[] = [
    response.reqId,
    response.req_id,
    response.requestId,
    response.request_id,
  ];

  if (
    response.data &&
    typeof response.data === "object"
  ) {
    values.push(
      response.data.reqId,
      response.data.req_id,
      response.data.requestId,
      response.data.request_id,
    );
  }

  for (
    const value of values
  ) {
    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return "";
}

/* =========================================================
   GET ACCESS TOKEN
========================================================= */

function getAccessToken(
  data: unknown,
): string {
  if (
    typeof data === "string"
  ) {
    const value =
      data.trim();

    if (
      value.split(".").length === 3
    ) {
      return value;
    }

    return "";
  }

  if (
    typeof data !== "object" ||
    data === null
  ) {
    return "";
  }

  const response =
    data as Msg91Response;

  const tokens: unknown[] = [
    response.access_token,
    response.accessToken,
    response.token,
    response["access-token"],
  ];

  if (
    response.data &&
    typeof response.data === "object"
  ) {
    const nested =
      response.data as Record<
        string,
        unknown
      >;

    tokens.push(
      nested.access_token,
      nested.accessToken,
      nested.token,
      nested["access-token"],
    );
  }

  for (
    const token of tokens
  ) {
    if (
      typeof token === "string" &&
      token.trim()
    ) {
      const value =
        token.trim();

      if (
        value.split(".").length === 3
      ) {
        return value;
      }
    }
  }

  return "";
}

/* =========================================================
   LOGIN PAGE
========================================================= */

export default function AdminLoginPage() {
  const router = useRouter();

  // This page only ever logs in as admin — no toggle, no user
  // option. Kept as a constant (not state) so the OTP-send/verify
  // logic below, copied from the shared user login flow, still
  // reads a "loginType" without needing its own branch.
  const loginType: LoginType = "admin";

  const [
    mobile,
    setMobile,
  ] = useState("");

  const [
    otp,
    setOtp,
  ] = useState("");

  const [
    step,
    setStep,
  ] = useState<
    "mobile" | "otp"
  >("mobile");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    resending,
    setResending,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    msg91Ready,
    setMsg91Ready,
  ] = useState(false);

  /* =======================================================
     MSG91 READY
  ======================================================= */

  const handleMsg91Ready =
    useCallback(() => {
      setMsg91Ready(true);
      setError("");
    }, []);

  /* =======================================================
     MSG91 ERROR
  ======================================================= */

  const handleMsg91Error =
    useCallback(
      (
        error: unknown,
      ) => {
        setMsg91Ready(false);

        setError(
          getMsg91ErrorMessage(
            error,
            "MSG91 OTP service could not be initialized.",
          ),
        );
      },
      [],
    );



  /* =======================================================
     MOBILE CHANGE
  ======================================================= */

  const handleMobileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value =
      normalizeMobile(
        e.target.value,
      );

    setMobile(value);
    setError("");
  };

  /* =======================================================
     OTP CHANGE
  ======================================================= */

  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value =
      e.target.value
        .replace(/\D/g, "")
        .slice(0, 6);

    setOtp(value);
    setError("");
  };

  /* =======================================================
     SEND OTP
  ======================================================= */

  const handleSendOtp =
    async () => {
      const normalizedMobile =
        normalizeMobile(
          mobile,
        );

      if (
        normalizedMobile.length !==
        10
      ) {
        setError(
          "Please enter a valid 10-digit mobile number.",
        );

        return;
      }

      if (!msg91Ready) {
        setError(
          "MSG91 OTP service is not ready. Please wait.",
        );

        return;
      }

      setLoading(true);
      setError("");

      try {
        const response =
          await fetch(
            "/api/auth/login",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  mobile:
                    normalizedMobile,
                }),
            },
          );

        let result: {
          success?: boolean;
          message?: string;
          code?: string;
        } = {};

        try {
          result =
            await response.json();
        } catch {
          result = {};
        }

        console.log(
          "LOGIN USER CHECK:",
          result,
        );

        if (
          response.status ===
            404 ||
          result.code ===
            "USER_NOT_FOUND"
        ) {
          setLoading(false);

          setError(
            "No account found with this mobile number. Please register first.",
          );

          return;
        }

        if (
          !response.ok ||
          result.success !== true
        ) {
          setLoading(false);

          setError(
            result.message ||
              "Unable to check your account.",
          );

          return;
        }

        sessionStorage.setItem(
          "login_mobile",
          normalizedMobile,
        );

        sessionStorage.setItem(
          "msg91_mobile",
          normalizedMobile,
        );

        sessionStorage.setItem(
          "login_type",
          loginType,
        );

        const sendOtp =
          window.sendOtp;

        if (
          typeof sendOtp !==
          "function"
        ) {
          setLoading(false);

          setError(
            "MSG91 OTP service is not ready. Please wait.",
          );

          return;
        }

        const identifier =
          `91${normalizedMobile}`;

        sendOtp(
          identifier,

          /* SUCCESS */

          (data) => {
            console.log(
              "LOGIN OTP SENT:",
              data,
            );

            const reqId =
              getReqId(data);

            if (reqId) {
              sessionStorage.setItem(
                "msg91_req_id",
                reqId,
              );
            } else {
              sessionStorage.removeItem(
                "msg91_req_id",
              );
            }

            setMobile(
              normalizedMobile,
            );

            setOtp("");
            setError("");
            setLoading(false);
            setStep("otp");
          },

          /* FAILURE */

          (error) => {
            console.error(
              "LOGIN OTP ERROR:",
              error,
            );

            setLoading(false);

            setError(
              getMsg91ErrorMessage(
                error,
                "Unable to send OTP. Please try again.",
              ),
            );
          },
        );
      } catch (error) {
        console.error(
          "LOGIN CHECK ERROR:",
          error,
        );

        setLoading(false);

        setError(
          getMsg91ErrorMessage(
            error,
            "Unable to check account.",
          ),
        );
      }
    };

  /* =======================================================
     VERIFY OTP
  ======================================================= */

  const handleVerifyOtp =
    () => {
      if (
        otp.length !== 6
      ) {
        setError(
          "Please enter the 6-digit OTP.",
        );

        return;
      }

      const verifyOtp =
        window.verifyOtp;

      if (
        typeof verifyOtp !==
        "function"
      ) {
        setError(
          "MSG91 OTP service is not ready. Please wait.",
        );

        return;
      }

      const storedMobile =
        sessionStorage.getItem(
          "login_mobile",
        ) ||
        sessionStorage.getItem(
          "msg91_mobile",
        );

      const storedReqId =
        sessionStorage.getItem(
          "msg91_req_id",
        );

      const storedLoginType: LoginType =
        "admin";

      const verificationMobile =
        storedMobile || mobile;

      const reqId =
        storedReqId ||
        undefined;

      if (
        verificationMobile.length !==
        10
      ) {
        setError(
          "Mobile number is invalid. Please request OTP again.",
        );

        setStep("mobile");

        return;
      }

      setLoading(true);
      setError("");

      try {
        verifyOtp(
          otp,

          /* ==========================================
             OTP SUCCESS
          ========================================== */

          async (
            data,
          ) => {
            console.log(
              "MSG91 OTP VERIFIED SUCCESS:",
              data,
            );

            try {
              const response =
                await fetch(
                  "/api/auth/msg91-verify",
                  {
                    method:
                      "POST",

                    headers: {
                      "Content-Type":
                        "application/json",
                    },

                    credentials:
                      "include",

                    body:
                      JSON.stringify({
                        mobile:
                          verificationMobile,
                        accessToken:
                          (data as {
                            accessToken?: string;
                          })?.accessToken || "",
                      }),
                  },
                );

              const result =
                await response.json();

              console.log(
                "LOGIN FINALIZATION:",
                result,
              );

              if (
                !response.ok
              ) {
                throw new Error(
                  result?.message ||
                    "Unable to complete login.",
                );
              }

              if (
                result?.success !==
                true
              ) {
                throw new Error(
                  result?.message ||
                    "Unable to complete login.",
                );
              }

              const userRole =
                result?.user?.role ??
                "user";

              /* ADMIN LOGIN VALIDATION */

              if (userRole !== "admin") {
                setLoading(false);

                setError(
                  "This account does not have admin access.",
                );

                return;
              }

              sessionStorage.removeItem(
                "msg91_req_id",
              );

              sessionStorage.removeItem(
                "msg91_mobile",
              );

              sessionStorage.removeItem(
                "login_mobile",
              );

              sessionStorage.removeItem(
                "login_type",
              );

              setLoading(false);
              setError("");

              /* REDIRECT TO ADMIN DASHBOARD */

              router.replace(
                "/admin/dashboard",
              );
            } catch (error) {
              console.error(
                "LOGIN FINALIZATION ERROR:",
                error,
              );

              setLoading(false);

              setError(
                getMsg91ErrorMessage(
                  error,
                  "Unable to complete login.",
                ),
              );
            }
          },

          /* ==========================================
             OTP FAILURE
          ========================================== */

          (error) => {
            console.error(
              "MSG91 VERIFY OTP ERROR:",
              error,
            );

            setLoading(false);

            setError(
              getMsg91ErrorMessage(
                error,
                "Invalid OTP. Please try again.",
              ),
            );
          },

          reqId,
        );
      } catch (error) {
        console.error(
          "VERIFY OTP EXCEPTION:",
          error,
        );

        setLoading(false);

        setError(
          getMsg91ErrorMessage(
            error,
            "Unable to verify OTP. Please try again.",
          ),
        );
      }
    };

  /* =======================================================
     RESEND OTP
  ======================================================= */

  const handleResendOtp =
    () => {
      if (
        loading ||
        resending
      ) {
        return;
      }

      const sendOtp =
        window.sendOtp;

      const retryOtp =
        window.retryOtp;

      const storedMobile =
        sessionStorage.getItem(
          "login_mobile",
        );

      const normalizedMobile =
        normalizeMobile(
          storedMobile ||
            mobile,
        );

      if (
        normalizedMobile.length !==
        10
      ) {
        setError(
          "Mobile number is invalid.",
        );

        return;
      }

      const reqId =
        sessionStorage.getItem(
          "msg91_req_id",
        );

      setResending(true);
      setError("");

      /* SEND NEW OTP */

      if (!reqId) {
        if (
          typeof sendOtp !==
          "function"
        ) {
          setResending(false);

          setError(
            "MSG91 OTP service is not ready.",
          );

          return;
        }

        const identifier =
          `91${normalizedMobile}`;

        try {
          sendOtp(
            identifier,

            /* SUCCESS */

            (data) => {
              const newReqId =
                getReqId(data);

              if (newReqId) {
                sessionStorage.setItem(
                  "msg91_req_id",
                  newReqId,
                );
              }

              sessionStorage.setItem(
                "msg91_mobile",
                normalizedMobile,
              );

              sessionStorage.setItem(
                "login_mobile",
                normalizedMobile,
              );

              setOtp("");
              setResending(false);
              setError("");
            },

            /* FAILURE */

            (error) => {
              setResending(false);

              setError(
                getMsg91ErrorMessage(
                  error,
                  "Unable to resend OTP.",
                ),
              );
            },
          );
        } catch (error) {
          setResending(false);

          setError(
            getMsg91ErrorMessage(
              error,
              "Unable to resend OTP.",
            ),
          );
        }

        return;
      }

      /* RETRY EXISTING OTP */

      if (
        typeof retryOtp !==
        "function"
      ) {
        setResending(false);

        setError(
          "MSG91 OTP service is not ready.",
        );

        return;
      }

      try {
        retryOtp(
          null,

          /* SUCCESS */

          (data) => {
            const newReqId =
              getReqId(data);

            if (newReqId) {
              sessionStorage.setItem(
                "msg91_req_id",
                newReqId,
              );
            }

            setOtp("");
            setResending(false);
            setError("");
          },

          /* FAILURE */

          (error) => {
            setResending(false);

            setError(
              getMsg91ErrorMessage(
                error,
                "Unable to resend OTP. Please try again.",
              ),
            );
          },

          reqId,
        );
      } catch (error) {
        setResending(false);

        setError(
          getMsg91ErrorMessage(
            error,
            "Unable to resend OTP.",
          ),
        );
      }
    };

  /* =======================================================
     CHANGE NUMBER
  ======================================================= */

  const handleChangeNumber =
    () => {
      sessionStorage.removeItem(
        "msg91_req_id",
      );

      sessionStorage.removeItem(
        "msg91_mobile",
      );

      sessionStorage.removeItem(
        "login_mobile",
      );

      setMobile("");
      setOtp("");
      setStep("mobile");
      setError("");
    };

  /* =======================================================
     FORM SUBMIT
  ======================================================= */

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    if (
      step === "mobile"
    ) {
      handleSendOtp();
    } else {
      handleVerifyOtp();
    }
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="relative min-h-screen overflow-hidden bg-white">

      {/* =====================================================
          MSG91
      ===================================================== */}

      <Msg91Otp
        onReady={
          handleMsg91Ready
        }
        onError={
          handleMsg91Error
        }
      />

      {/* =====================================================
          PREMIUM BACKGROUND
      ===================================================== */}

      <div className="absolute inset-0 overflow-hidden">

        {/* Main gradient */}

        <div className="absolute inset-0 bg-white" />

        {/* Large DP brand mark */}

        <div
          className="
            absolute
            -left-[120px]
            top-[50%]
            hidden
            -translate-y-1/2
            select-none
            opacity-[0.055]
            lg:block
          "
        >
          <div
            className="
              text-[520px]
              font-black
              leading-none
              tracking-[-0.12em]
              text-[#1E3A5F]
            "
          >
            dp
          </div>
        </div>

        {/* Top left circle */}

        <div
          className="
            absolute
            -left-28
            -top-28
            h-[330px]
            w-[330px]
            rounded-full
            bg-gradient-to-br
            from-[#1E3A5F]/20
            to-[#3D6A9C]/5
            blur-[1px]
          "
        />

        {/* Top right circle */}

        <div
          className="
            absolute
            -right-24
            top-10
            h-[260px]
            w-[260px]
            rounded-full
            border
            border-[#1E3A5F]/10
            bg-[#FFFFFF]/30
          "
        />

        <div
          className="
            absolute
            right-[5%]
            top-[12%]
            h-24
            w-24
            rounded-full
            border
            border-[#1E3A5F]/10
          "
        />

        {/* Floating circles */}

        <div
          className="
            absolute
            left-[22%]
            top-[12%]
            h-5
            w-5
            rounded-full
            bg-[#3D6A9C]/15
          "
        />

        <div
          className="
            absolute
            right-[17%]
            top-[32%]
            h-7
            w-7
            rounded-full
            bg-[#1E3A5F]/15
          "
        />

        <div
          className="
            absolute
            left-[14%]
            bottom-[25%]
            h-6
            w-6
            rounded-full
            border-2
            border-[#3D6A9C]/25
          "
        />

        {/* =================================================
            DOT GRID LEFT
        ================================================= */}

        <div
          className="
            absolute
            bottom-12
            left-8
            grid
            grid-cols-5
            gap-3
            opacity-60
          "
        >
          {Array.from({
            length: 25,
          }).map((_, index) => (
            <span
              key={index}
              className="
                h-1
                w-1
                rounded-full
                bg-[#1E3A5F]/45
              "
            />
          ))}
        </div>

        {/* =================================================
            DOT GRID RIGHT TOP
        ================================================= */}

        <div
          className="
            absolute
            right-[15%]
            top-10
            grid
            grid-cols-5
            gap-3
            opacity-50
          "
        >
          {Array.from({
            length: 25,
          }).map((_, index) => (
            <span
              key={index}
              className="
                h-1
                w-1
                rounded-full
                bg-[#1E3A5F]/35
              "
            />
          ))}
        </div>

        {/* =================================================
            NETWORK CONNECTION
        ================================================= */}

        <div
          className="
            absolute
            right-[5%]
            top-[45%]
            hidden
            h-[280px]
            w-[330px]
            lg:block
          "
        >
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

        {/* =================================================
            FLOWING CONNECTION WAVES
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            -bottom-[30px]
            left-[-8%]
            h-[300px]
            w-[116%]
            rotate-[-2deg]
            opacity-50
          "
        >
          <div
            className="
              absolute
              inset-x-0
              top-[80px]
              h-[150px]
              rounded-[50%]
              border-[3px]
              border-[#3D6A9C]/20
              blur-[0.3px]
            "
          />

          <div
            className="
              absolute
              inset-x-[2%]
              top-[90px]
              h-[145px]
              rounded-[50%]
              border-2
              border-[#1E3A5F]/20
            "
          />

          <div
            className="
              absolute
              inset-x-[4%]
              top-[100px]
              h-[140px]
              rounded-[50%]
              border
              border-[#3D6A9C]/25
            "
          />

          <div
            className="
              absolute
              inset-x-[7%]
              top-[110px]
              h-[135px]
              rounded-[50%]
              border
              border-[#3D6A9C]/20
            "
          />

          <div
            className="
              absolute
              inset-x-[10%]
              top-[120px]
              h-[130px]
              rounded-[50%]
              border
              border-[#1E3A5F]/15
            "
          />
        </div>

        {/* Right side arcs */}

        <div
          className="
            absolute
            -right-[160px]
            bottom-[12%]
            h-[420px]
            w-[420px]
            rounded-full
            border-[2px]
            border-[#1E3A5F]/10
          "
        />

        <div
          className="
            absolute
            -right-[125px]
            bottom-[15%]
            h-[350px]
            w-[350px]
            rounded-full
            border
            border-[#3D6A9C]/10
          "
        />

        <div
          className="
            absolute
            -right-[90px]
            bottom-[18%]
            h-[280px]
            w-[280px]
            rounded-full
            border
            border-[#3D6A9C]/10
          "
        />

        {/* Small plus */}

        <div
          className="
            absolute
            right-[20%]
            top-[28%]
            text-3xl
            font-light
            text-[#1E3A5F]/45
          "
        >
          +
        </div>

        <div
          className="
            absolute
            left-[30%]
            top-[25%]
            text-xl
            font-light
            text-[#1E3A5F]/30
          "
        >
          +
        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div
        className="
          relative
          z-10
          flex
          min-h-screen
          items-center
          justify-center
          px-4
          py-8
          sm:px-6
          lg:py-12
        "
      >
        <div
          className="
            w-full
            max-w-[440px]
          "
        >

          {/* =================================================
              LOGIN CARD
          ================================================= */}

          <div
            className="
              relative
              overflow-hidden
              rounded-[30px]
              border
              border-white/80
              bg-white/95
              px-5
              py-7
              shadow-[0_30px_100px_rgba(30,58,95,0.18)]
              backdrop-blur-2xl
              sm:px-10
              sm:py-9
            "
          >

            {/* Card top glow */}

            <div
              className="
                pointer-events-none
                absolute
                -top-24
                left-1/2
                h-48
                w-72
                -translate-x-1/2
                rounded-full
                bg-[#1E3A5F]/10
                blur-3xl
              "
            />

            {/* =================================================
                LOGO
            ================================================= */}

            <div className="relative mb-5 flex justify-center">
              <div className="relative">

                <div
                  className="
                    absolute
                    -inset-3
                    rounded-3xl
                    bg-[#1E3A5F]/5
                    blur-xl
                  "
                />

                <Image
                  src="/logo-transparent.png"
                  alt="DigiProfilo"
                  width={310}
                  height={110}
                  priority
                  className="
                    relative
                    h-auto
                    w-[230px]
                    object-contain
                    sm:w-[250px]
                    mix-blend-multiply
                  "
                />
              </div>
            </div>

            {/* =================================================
                HEADING
            ================================================= */}

            <div className="relative text-center">

              <h1
                className="
                  text-2xl
                  font-bold
                  tracking-[-0.03em]
                  text-[#152A47]
                  sm:text-3xl
                "
              >
                {step ===
                "mobile" ? (
                  <>
                    Admin Login
                  </>
                ) : (
                  <>Verify OTP</>
                )}
              </h1>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-[330px]
                  text-sm
                  leading-6
                  text-[#77736E]
                  sm:text-sm
                "
              >
                {step ===
                "mobile"
                  ? "Login to access the admin panel"
                  : `Enter the OTP sent to +91 ${mobile}`}
              </p>
            </div>

            {/* =================================================
                ADMIN BADGE
            ================================================= */}

            {step === "mobile" && (
              <div className="mt-7 flex items-center justify-center gap-2 rounded-2xl border border-[#3D6A9C]/40 bg-gradient-to-br from-[#E5E0D9] to-[#FAF9F6] px-4 py-3 text-[#1E3A5F] shadow-[0_8px_25px_rgba(30,58,95,0.10)]">
                <Shield className="h-5 w-5" />
                <span className="text-xs font-semibold">
                  Admin access only
                </span>
              </div>
            )}

            {/* =================================================
                STEPS
            ================================================= */}

            <div
              className="
                mx-auto
                mt-8
                flex
                max-w-[330px]
                items-start
              "
            >

              {/* Mobile */}

              <div className="flex flex-col items-center">

                <div
                  className={`
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    transition-all
                    ${
                      step ===
                      "mobile"
                        ? "bg-[#EAF0F6] text-[#1E3A5F] ring-4 ring-[#1E3A5F]/5"
                        : "bg-gradient-to-br from-[#1E3A5F] to-[#1E3A5F] text-white shadow-[0_8px_20px_rgba(30,58,95,0.25)]"
                    }
                  `}
                >
                  {step ===
                  "otp" ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Smartphone className="h-5 w-5" />
                  )}
                </div>

                <span
                  className={`
                    mt-2
                    whitespace-nowrap
                    text-xs
                    font-semibold
                    sm:text-xs
                    ${
                      step ===
                      "mobile"
                        ? "text-[#1E3A5F]"
                        : "text-[#77736E]"
                    }
                  `}
                >
                  Mobile Number
                </span>
              </div>

              {/* Line */}

              <div
                className={`
                  mt-[22px]
                  h-[2px]
                  flex-1
                  transition-all
                  ${
                    step ===
                    "otp"
                      ? "bg-gradient-to-r from-[#1E3A5F] to-[#3D6A9C]"
                      : "bg-[#E5E0D9]"
                  }
                `}
              />

              {/* OTP */}

              <div className="flex flex-col items-center">

                <div
                  className={`
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    transition-all
                    ${
                      step ===
                      "otp"
                        ? "border border-[#3D6A9C]/40 bg-[#E5E0D9] text-[#1E3A5F] ring-4 ring-[#1E3A5F]/5"
                        : "border border-[#E5E0D9] bg-white text-[#77736E]"
                    }
                  `}
                >
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <span
                  className={`
                    mt-2
                    whitespace-nowrap
                    text-xs
                    font-semibold
                    sm:text-xs
                    ${
                      step ===
                      "otp"
                        ? "text-[#1E3A5F]"
                        : "text-[#77736E]"
                    }
                  `}
                >
                  OTP Verification
                </span>
              </div>
            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={
                handleSubmit
              }
              className="mt-8"
            >

              {/* =================================================
                  MOBILE
              ================================================= */}

              {step ===
                "mobile" && (
                <>
                  <label
                    htmlFor="mobile"
                    className="
                      mb-2.5
                      block
                      text-xs
                      font-semibold
                      text-[#121212]
                    "
                  >
                    Mobile Number
                  </label>

                  <div
                    className={`
                      group
                      flex
                      h-[58px]
                      overflow-hidden
                      rounded-2xl
                      border
                      bg-[#FFFFFF]
                      transition-all
                      focus-within:border-[#3D6A9C]
                      focus-within:bg-white
                      focus-within:ring-4
                      focus-within:ring-[#3D6A9C]/10
                      ${
                        error
                          ? "border-red-400"
                          : "border-[#E5E0D9]"
                      }
                    `}
                  >

                    {/* Country */}

                    <div
                      className="
                        flex
                        w-[104px]
                        shrink-0
                        items-center
                        gap-2.5
                        border-r
                        border-[#E5E0D9]
                        px-3.5
                        sm:w-[112px]
                      "
                    >
                      <Image
                        src="/india.jpg"
                        alt="India"
                        width={24}
                        height={18}
                        className="
                          h-[18px]
                          w-6
                          rounded-sm
                          object-cover
                        "
                      />

                      <span
                        className="
                          text-sm
                          font-semibold
                          text-[#121212]
                        "
                      >
                        +91
                      </span>
                    </div>

                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      value={
                        mobile
                      }
                      onChange={
                        handleMobileChange
                      }
                      placeholder="Enter your mobile number"
                      className="
                        min-w-0
                        flex-1
                        bg-transparent
                        px-4
                        text-sm
                        font-medium
                        text-[#152A47]
                        outline-none
                        placeholder:text-[#77736E]
                      "
                    />
                  </div>
                </>
              )}

              {/* =================================================
                  OTP
              ================================================= */}

              {step ===
                "otp" && (
                <>
                  <label
                    htmlFor="otp"
                    className="
                      mb-2.5
                      block
                      text-xs
                      font-semibold
                      text-[#121212]
                    "
                  >
                    Enter OTP
                  </label>

                  <div
                    className={`
                      flex
                      h-[58px]
                      items-center
                      rounded-2xl
                      border
                      bg-[#FFFFFF]
                      px-4
                      transition-all
                      focus-within:border-[#3D6A9C]
                      focus-within:bg-white
                      focus-within:ring-4
                      focus-within:ring-[#3D6A9C]/10
                      ${
                        error
                          ? "border-red-400"
                          : "border-[#E5E0D9]"
                      }
                    `}
                  >

                    <ShieldCheck
                      className="
                        mr-3
                        h-5
                        w-5
                        shrink-0
                        text-[#3D6A9C]
                      "
                    />

                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={
                        otp
                      }
                      onChange={
                        handleOtpChange
                      }
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      autoFocus
                      className="
                        w-full
                        bg-transparent
                        text-center
                        text-lg
                        font-bold
                        tracking-[8px]
                        text-[#152A47]
                        outline-none
                        placeholder:text-xs
                        placeholder:font-normal
                        placeholder:tracking-normal
                        placeholder:text-[#77736E]
                      "
                    />
                  </div>

                  <div
                    className="
                      mt-3
                      flex
                      justify-between
                      text-xs
                    "
                  >
                    <button
                      type="button"
                      onClick={
                        handleChangeNumber
                      }
                      className="
                        font-medium
                        text-[#77736E]
                        transition-colors
                        hover:text-[#1E3A5F]
                      "
                    >
                      Change number
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleResendOtp
                      }
                      disabled={
                        loading ||
                        resending
                      }
                      className="
                        font-semibold
                        text-[#1E3A5F]
                        transition-colors
                        hover:text-[#1E3A5F]
                        disabled:opacity-50
                      "
                    >
                      {resending
                        ? "Sending..."
                        : "Resend OTP"}
                    </button>
                  </div>
                </>
              )}

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div
                  className="
                    mt-4
                    rounded-xl
                    border
                    border-red-100
                    bg-red-50
                    px-3.5
                    py-2.5
                    text-xs
                    font-medium
                    leading-5
                    text-red-500
                  "
                >
                  {error}
                </div>
              )}

              {/* =================================================
                  SUBMIT
              ================================================= */}

              <button
                type="submit"
                disabled={
                  loading ||
                  (step ===
                    "mobile" &&
                    !msg91Ready)
                }
                className="
                  group
                  relative
                  mt-7
                  flex
                  h-[56px]
                  w-full
                  items-center
                  justify-center
                  gap-3
                  overflow-hidden
                  rounded-2xl
                  bg-gradient-to-r
                  from-[#1E3A5F]
                  via-[#1E3A5F]
                  to-[#1E3A5F]
                  text-sm
                  font-semibold
                  text-white
                  shadow-[0_12px_28px_rgba(30,58,95,0.25)]
                  transition-all
                  duration-200
                  hover:-translate-y-[1px]
                  hover:shadow-[0_16px_35px_rgba(30,58,95,0.32)]
                  active:translate-y-0
                  disabled:cursor-not-allowed
                  disabled:opacity-70
                "
              >

                {/* Button shine */}

                <span
                  className="
                    absolute
                    inset-0
                    -translate-x-full
                    bg-gradient-to-r
                    from-transparent
                    via-white/10
                    to-transparent
                    transition-transform
                    duration-700
                    group-hover:translate-x-full
                  "
                />

                <span className="relative flex items-center justify-center gap-3">

                  {loading ? (
                    <>
                      <span
                        className="
                          h-5
                          w-5
                          animate-spin
                          rounded-full
                          border-2
                          border-white/40
                          border-t-white
                        "
                      />

                      {step ===
                      "mobile"
                        ? "Checking account..."
                        : "Verifying OTP..."}
                    </>
                  ) : (
                    <>
                      {step ===
                      "mobile"
                        ? msg91Ready
                          ? "Send OTP"
                          : "Loading OTP Service..."
                        : "Verify OTP"}

                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}

                </span>
              </button>



              {/* =================================================
                  GO TO HOME
              ================================================= */}

              <div
                className="
                  mt-3
                  text-center
                  text-xs
                "
              >
                <Link
                  href="/"
                  className="
                    font-semibold
                    text-[#77736E]
                    transition-colors
                    hover:text-[#1E3A5F]
                    hover:underline
                  "
                >
                  Go to home
                </Link>
              </div>

              {/* =================================================
                  SECURITY
              ================================================= */}
            </form>
          </div>

          {/* =================================================
              BRAND FOOTER
          ================================================= */}

          <div
            className="
              mt-5
              text-center
              text-xs
              font-medium
              tracking-[0.12em]
              text-[#77736E]
              uppercase
            "
          >
            Empowering Connections
          </div>
        </div>
      </div>
    </main>
  );
}