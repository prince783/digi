"use client";

import { ResumeDocument } from "@/app/dashboard/projects/create-project/resume/resume-document";
import { ResumeData, TemplateId } from "@/app/dashboard/projects/create-project/resume/types";

export function ResumePublicView({ resume, template, color, username }: { resume: ResumeData; template: TemplateId; color: string; username: string }) {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 print:bg-white print:p-0">
      <div className="mx-auto mb-5 flex max-w-[794px] justify-end gap-3 print:hidden">
        <button onClick={() => window.print()} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Download PDF</button>
      </div>
      <div className="mx-auto max-w-[794px] bg-white shadow-xl print:max-w-none print:shadow-none">
        <ResumeDocument resume={resume} template={template} color={color} />
      </div>
      <p className="mx-auto mt-4 max-w-[794px] text-center text-xs text-slate-500 print:hidden">/{username}</p>
    </main>
  );
}
