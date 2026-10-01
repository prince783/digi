"use client";

import React from "react";
import { LegacyTemplateSelection } from "./resume-components";
import { ResumeData, ResumeTemplate, TemplateId } from "./types";

export function TemplateSelection(props: {
  templates: ResumeTemplate[];
  resume: ResumeData;
  selectedTemplate: TemplateId;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  selectTemplate: (id: TemplateId) => void;
  useTemplate: () => void;
  photoFilter: "all" | "photo" | "no-photo";
  setPhotoFilter: (value: "all" | "photo" | "no-photo") => void;
  columnFilter: "all" | "1" | "2";
  setColumnFilter: (value: "all" | "1" | "2") => void;
  styleFilter: "all" | "Traditional" | "Creative" | "Contemporary";
  setStyleFilter: (
    value: "all" | "Traditional" | "Creative" | "Contemporary"
  ) => void;
  clearFilters: () => void;
}) {
  return <LegacyTemplateSelection {...props} />;
}
