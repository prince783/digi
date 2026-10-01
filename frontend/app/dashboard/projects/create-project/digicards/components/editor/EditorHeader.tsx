"use client";

import { Check, Eye, FilePenLine, Rocket, Save } from "lucide-react";

type Props = {
  currentStep: number;
  paymentStatus: string | undefined;
  onBack: () => void;
  onPreview: () => void;
  onNext: () => void;
  onPublish: () => void;
};

export default function EditorHeader({ currentStep, paymentStatus, onBack, onPreview, onNext, onPublish }: Props) {
  const publishing = currentStep === 7;
  return (
    <header className="sticky top-0 z-[60] w-full border-b border-[#E5E0D9] bg-white">
      <div className="flex min-h-[66px] items-center justify-between gap-3 px-3 sm:px-5 lg:px-6">
        <div className="flex min-w-0 items-center">
          <button type="button" onClick={onBack} className="flex shrink-0 items-center gap-2 text-sm font-medium hover:text-[#1E3A5F]">
            <span className="text-lg">←</span><span className="hidden sm:inline">Back to My Projects</span>
          </button>
          <div className="mx-3 hidden h-7 w-px bg-[#E5E0D9] sm:mx-5 sm:block" />
          <div className="hidden min-w-0 sm:block">
            <p className="mb-1 text-[13px] text-[#77736E]">Project Name:</p>
            <div className="flex items-center gap-2"><span className="max-w-[200px] truncate text-sm font-semibold">Sriram Singh Card</span><FilePenLine size={16} className="text-[#1E3A5F]" /></div>
          </div>
          <div className="mx-3 hidden h-7 w-px bg-[#E5E0D9] sm:mx-5 sm:block" />
          <div className="hidden items-center gap-2 lg:flex">
            <span className="rounded-full bg-[#EAF0F6] px-3.5 py-2 text-[13px] font-medium text-[#7A9B7E]">Draft Saved</span>
            <span className="text-[13px] text-[#77736E]">Last saved just now</span><Check size={16} className="text-[#7A9B7E]" />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <button type="button" onClick={onPreview} className="flex h-11 items-center gap-2 rounded-lg border border-[#E5E0D9] bg-white px-3 text-sm font-medium hover:border-[#1E3A5F] hover:text-[#1E3A5F] sm:px-5"><Eye size={18} /><span>Preview</span></button>
          {paymentStatus !== "paid" && <button type="button" className="hidden h-11 items-center gap-2 rounded-lg border border-[#1E3A5F] px-5 text-sm font-semibold text-[#1E3A5F] hover:bg-[#FAF9F6] sm:flex"><Save size={18} />Save Draft</button>}
          <button type="button" onClick={publishing ? onPublish : onNext} className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#1E3A5F] px-4 text-sm font-semibold text-white shadow-md sm:px-6">
            {publishing ? <><Rocket size={18} /><span className="hidden sm:inline">Publish &amp; Live</span><span className="sm:hidden">Publish</span></> : <><span className="hidden sm:inline">Continue</span><span className="sm:hidden">Next</span><span>→</span></>}
          </button>
        </div>
      </div>
    </header>
  );
}