"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ResumeBuilder } from "./builder";
import { initialResume } from "./initial-resume";
import { templates } from "./template-data";
import { TemplateSelection } from "./template-selection";
import { ResumeData, TemplateId } from "./types";
import { Billing, DEFAULT_BILLING } from "@/lib/billing";

type RazorpayInstance = { open: () => void };
type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

export default function ResumeCreatePage() {
  const [stage, setStage] = useState<"templates" | "builder">("templates");
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateId>("classic-serif");
  const [selectedColor, setSelectedColor] = useState("#1E3A5F");
  const [photoFilter, setPhotoFilter] = useState<
    "all" | "photo" | "no-photo"
  >("all");
  const [columnFilter, setColumnFilter] = useState<"all" | "1" | "2">("all");
  const [styleFilter, setStyleFilter] = useState<
    "all" | "Traditional" | "Creative" | "Contemporary"
  >("all");
  const [resume, setResume] = useState<ResumeData>(initialResume);
  const [billing, setBilling] = useState<Billing>(DEFAULT_BILLING);
  const resumeLoaded = useRef(false);

  useEffect(() => {
    const mode = new URLSearchParams(window.location.search).get("mode");
    if (mode === "edit") setStage("builder");
  }, []);

  const filteredTemplates = useMemo(
    () =>
      templates.filter((template) => {
        const photoMatch =
          photoFilter === "all" ||
          (photoFilter === "photo" && template.photo) ||
          (photoFilter === "no-photo" && !template.photo);
        const columnMatch =
          columnFilter === "all" ||
          template.columns.toString() === columnFilter;
        const styleMatch =
          styleFilter === "all" || template.category === styleFilter;
        return photoMatch && columnMatch && styleMatch;
      }),
    [photoFilter, columnFilter, styleFilter]
  );

  const selectTemplate = (id: TemplateId) => {
    setSelectedTemplate(id);
    const template = templates.find((item) => item.id === id);
    if (template) setSelectedColor(template.defaultColor);
  };

  const useTemplate = () => {
    setStage("builder");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateResume = <K extends keyof ResumeData>(
    field: K,
    value: ResumeData[K]
  ) => {
    setResume((previous) => ({ ...previous, [field]: value }));
  };

  const finalizeResume = async (username: string): Promise<string> => {
    const check = await fetch(`/api/resumes/check-username?username=${encodeURIComponent(username)}`);
    const checkBody = (await check.json()) as { available?: boolean; message?: string };
    if (!check.ok || !checkBody.available) throw new Error(checkBody.message || "Username is not available.");
    const save = await fetch("/api/resumes/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume, template: selectedTemplate, color: selectedColor, billing }),
    });
    if (!save.ok) throw new Error("Unable to save your resume.");
    const orderResponse = await fetch("/api/resumes/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const order = (await orderResponse.json()) as { success?: boolean; message?: string; key?: string; orderId?: string; amount?: number; currency?: string };
    if (!orderResponse.ok || !order.success || !order.key || !order.orderId) throw new Error(order.message || "Unable to create payment.");
    return new Promise<string>((resolve, reject) => {
      const open = () => {
        const Razorpay = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;
        if (!Razorpay) {
          reject(new Error("Payment checkout failed to load."));
          return;
        }
        const checkout = new Razorpay({
          key: order.key,
          order_id: order.orderId,
          amount: order.amount,
          currency: order.currency,
          name: "Digital Profile",
          description: "Resume publication",
          handler: async (response: Record<string, string>) => {
            const paymentResponse = {
              ...response,
              razorpay_order_id: response.razorpay_order_id || order.orderId,
            };
            const verify = await fetch("/api/resumes/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(paymentResponse),
            });
            const result = (await verify.json()) as { success?: boolean; message?: string; url?: string };
            if (!verify.ok || !result.success || !result.url) {
              reject(new Error(result.message || "Payment verification failed."));
              return;
            }
            resolve(result.url);
          },
          modal: { ondismiss: () => reject(new Error("Payment was cancelled.")) },
        });
        checkout.open();
      };
      const existing = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existing) {
        if ((window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay) open();
        else existing.addEventListener("load", open, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = open;
      script.onerror = () => reject(new Error("Payment checkout failed to load."));
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    if (stage !== "builder" || resumeLoaded.current) {
      return;
    }

    let cancelled = false;

    const loadResume = async () => {
      try {
        const response = await fetch("/api/resumes/me");
        const body = (await response.json()) as {
          resume?: {
            resume?: Partial<ResumeData>;
            template?: TemplateId;
            color?: string;
            billing?: Partial<Billing>;
          } | null;
        };

        if (!response.ok) {
          throw new Error("Unable to load resume");
        }
        resumeLoaded.current = true;

        if (!cancelled && body.resume) {
          if (body.resume.resume) {
            setResume((previous) => ({
              ...previous,
              ...body.resume?.resume,
            }));
          }
          if (body.resume.template) {
            setSelectedTemplate(body.resume.template);
          }
          if (body.resume.color) {
            setSelectedColor(body.resume.color);
          }
          if (body.resume.billing) {
            setBilling((previous) => ({ ...previous, ...body.resume?.billing }));
          }
        }
      } catch (error) {
        console.error("LOAD RESUME ERROR:", error);
      } finally {
        if (cancelled) {
          resumeLoaded.current = false;
        }
      }
    };

    void loadResume();

    return () => {
      cancelled = true;
    };
  }, [stage]);

  useEffect(() => {
    if (stage !== "builder" || !resumeLoaded.current) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/resumes/me", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resume,
            template: selectedTemplate,
            color: selectedColor,
            billing,
          }),
        });

        if (!response.ok) {
          throw new Error("Unable to save resume");
        }
      } catch (error) {
        console.error("AUTOSAVE RESUME ERROR:", error);
      }
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [stage, resume, selectedTemplate, selectedColor, billing]);

  return (
    <div className="min-h-screen bg-white font-display text-[#152A47]">
      {stage === "templates" ? (
        <TemplateSelection
          templates={filteredTemplates}
          resume={resume}
          selectedTemplate={selectedTemplate}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          selectTemplate={selectTemplate}
          useTemplate={useTemplate}
          photoFilter={photoFilter}
          setPhotoFilter={setPhotoFilter}
          columnFilter={columnFilter}
          setColumnFilter={setColumnFilter}
          styleFilter={styleFilter}
          setStyleFilter={setStyleFilter}
          clearFilters={() => {
            setPhotoFilter("all");
            setColumnFilter("all");
            setStyleFilter("all");
          }}
        />
      ) : (
        <ResumeBuilder
          resume={resume}
          updateResume={updateResume}
          billing={billing}
          setBilling={setBilling}
          selectedTemplate={selectedTemplate}
          selectedColor={selectedColor}
          onBack={() => setStage("templates")}
          onFinalize={finalizeResume}
        />
      )}
    </div>
  );
}
