"use client";

import type { RefObject } from "react";
import { Check, Maximize, Monitor, Rocket, Share2, Smartphone } from "lucide-react";
import type { TemplateId } from "../DigitalCardEditor";
import LivePreview from "../LivePreview";

type Props = {
  previewRef: RefObject<HTMLDivElement | null>;
  previewDevice: "desktop" | "mobile";
  setPreviewDevice: (device: "desktop" | "mobile") => void;
  selectedTemplate: TemplateId;
  currentStep: number;
  onFullscreen: () => void;
  onPublish: () => void;
  mobile?: boolean;
};

export default function PreviewPanel({ previewRef, previewDevice, setPreviewDevice, selectedTemplate, currentStep, onFullscreen, onPublish, mobile = false }: Props) {
  return (
    <section ref={previewRef} className={`relative min-w-0 overflow-hidden bg-[#FAF9F6] ${mobile ? "min-h-[720px]" : "min-h-screen"}`}>
      <div className="flex min-h-[58px] items-center justify-between border-b border-[#E5E0D9] bg-white px-4 sm:px-5 lg:px-6">
        <h2 className="text-xs font-semibold">Live Preview</h2>
        <div className="flex h-[36px] items-center rounded-lg border border-[#E5E0D9] bg-[#FAF9F6] p-1">
          <DeviceButton active={previewDevice === "desktop"} onClick={() => setPreviewDevice("desktop")} label="Desktop preview"><Monitor size={17} /></DeviceButton>
          <DeviceButton active={previewDevice === "mobile"} onClick={() => setPreviewDevice("mobile")} label="Mobile preview"><Smartphone size={17} /></DeviceButton>
        </div>
      </div>
      <div className="flex min-h-[600px] items-start justify-center overflow-auto px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        <div className="flex w-full items-start justify-center"><div className="w-[282px] min-w-[282px] max-w-[282px] overflow-hidden">
          <LivePreview key={selectedTemplate} currentStep={currentStep} template={selectedTemplate} />
        </div></div>
      </div>
      <div className="border-t border-[#E5E0D9] bg-white px-4 py-3 sm:px-5">
        {currentStep === 7 ? (
          <div className="flex flex-col justify-center gap-2 sm:flex-row">
            <div className="flex h-[39px] items-center justify-center gap-2 rounded-md border border-[#E5E0D9] bg-[#FAF9F6] px-4"><Check size={16} className="text-[#7A9B7E]" /><span className="text-xs font-semibold text-[#7A9B7E]">Ready to go live</span></div>
            <button type="button" onClick={onPublish} className="flex h-[39px] items-center justify-center gap-2 rounded-md bg-[#1E3A5F] px-5 text-xs font-semibold text-white"><Rocket size={14} />Publish &amp; Live</button>
          </div>
        ) : (
          <div className="flex flex-col justify-center gap-2 sm:flex-row">
            <button type="button" className="flex h-[39px] items-center justify-center gap-2 rounded-md border border-[#E5E0D9] px-5 text-xs font-medium"><Share2 size={14} />Share Preview</button>
            <button type="button" onClick={onFullscreen} className="flex h-[39px] items-center justify-center gap-2 rounded-md border border-[#E5E0D9] px-5 text-xs font-medium text-[#1E3A5F]"><Maximize size={14} />View Full Screen</button>
          </div>
        )}
      </div>
    </section>
  );
}

function DeviceButton({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return <button type="button" aria-label={label} aria-pressed={active} onClick={onClick} className={`flex h-7 w-[46px] items-center justify-center rounded-md ${active ? "bg-[#EAF0F6] text-[#1E3A5F] shadow-sm" : "text-[#77736E]"}`}>{children}</button>;
}