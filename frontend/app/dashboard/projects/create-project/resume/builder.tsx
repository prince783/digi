"use client";

import React from "react";
import { LegacyResumeBuilder } from "./resume-components";
import { ResumeData, TemplateId } from "./types";
import { Billing } from "@/lib/billing";

export function ResumeBuilder({
  resume,
  updateResume,
  billing,
  setBilling,
  selectedTemplate,
  selectedColor,
  onBack,
  onFinalize,
}: {
  resume: ResumeData;
  updateResume: <K extends keyof ResumeData>(
    field: K,
    value: ResumeData[K]
  ) => void;
  billing: Billing;
  setBilling: (billing: Billing) => void;
  selectedTemplate: TemplateId;
  selectedColor: string;
  onBack: () => void;
  onFinalize?: (username: string) => Promise<string>;
}) {
  return (
    <LegacyResumeBuilder
      resume={resume}
      updateResume={updateResume}
      billing={billing}
      setBilling={setBilling}
      selectedTemplate={selectedTemplate}
      selectedColor={selectedColor}
      onBack={onBack}
      onFinalize={onFinalize || (async () => "")}
    />
  );
}
