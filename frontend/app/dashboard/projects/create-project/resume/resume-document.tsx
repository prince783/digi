"use client";

import React from "react";
import { LegacyResumeDocument } from "./resume-components";
import { ResumeData, TemplateId } from "./types";

export function ResumeDocument({
  resume,
  template,
  color,
}: {
  resume: ResumeData;
  template: TemplateId;
  color: string;
}) {
  return (
    <LegacyResumeDocument
      resume={resume}
      template={template}
      color={color}
    />
  );
}
