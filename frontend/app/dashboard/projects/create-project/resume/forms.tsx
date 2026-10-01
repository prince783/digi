"use client";

import React from "react";
import {
  LegacyEducationForm,
  LegacyExperienceForm,
  LegacyPersonalForm,
  LegacyProjectsForm,
  LegacySimpleListForm,
  LegacySkillsForm,
  LegacySummaryForm,
} from "./resume-components";
import { ResumeData } from "./types";

type UpdateResume = <K extends keyof ResumeData>(
  field: K,
  value: ResumeData[K]
) => void;

export const PersonalForm = (props: { resume: ResumeData; updateResume: UpdateResume }) => (
  <LegacyPersonalForm {...props} />
);
export const SummaryForm = (props: { resume: ResumeData; updateResume: UpdateResume }) => (
  <LegacySummaryForm {...props} />
);
export const ExperienceForm = (props: { resume: ResumeData; updateResume: UpdateResume }) => (
  <LegacyExperienceForm {...props} />
);
export const EducationForm = (props: { resume: ResumeData; updateResume: UpdateResume }) => (
  <LegacyEducationForm {...props} />
);
export const SkillsForm = (props: { resume: ResumeData; updateResume: UpdateResume }) => (
  <LegacySkillsForm {...props} />
);
export const ProjectsForm = (props: { resume: ResumeData; updateResume: UpdateResume }) => (
  <LegacyProjectsForm {...props} />
);
export const SimpleListForm = (props: {
  title: string;
  values: string[];
  update: (values: string[]) => void;
}) => <LegacySimpleListForm {...props} />;
