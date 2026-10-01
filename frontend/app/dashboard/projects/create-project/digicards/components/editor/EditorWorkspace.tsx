"use client";

import type { ReactNode, RefObject } from "react";
import { Check, Eye, Folder, Palette, Rocket } from "lucide-react";
import type { TemplateId } from "../DigitalCardEditor";
import type { TemplateConfig } from "../templateData";
import StepNavigation from "../StepNavigation";
import TemplateSelector from "./TemplateSelector";
import PreviewPanel from "./PreviewPanel";

type Props = {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  mobilePanel: "template" | "preview";
  setMobilePanel: (panel: "template" | "preview") => void;
  previewRef: RefObject<HTMLDivElement | null>;
  previewDevice: "desktop" | "mobile";
  setPreviewDevice: (device: "desktop" | "mobile") => void;
  selectedTemplate: TemplateId;
  filteredTemplates: TemplateConfig[];
  templateSearch: string;
  setTemplateSearch: (value: string) => void;
  templateCategory: string;
  setTemplateCategory: (value: string) => void;
  clearTemplateFilters: () => void;
  onTemplateChange: (template: TemplateId) => void;
  onNext: () => void;
  onPrevious: () => void;
  onPreview: () => void;
  onPublish: () => void;
  onFullscreen: () => void;
  children: ReactNode;
};

export default function EditorWorkspace(props: Props) {
  return (
    <>
      <div className="hidden min-h-[calc(100vh-66px)] grid-cols-[minmax(420px,500px)_310px_minmax(390px,1fr)] bg-white xl:grid">
        <FormPanel {...props} desktop />
        <TemplateSelector {...props} mode="desktop" />
        <PreviewPanel {...props} />
      </div>
      <div className="block bg-[#FAF9F6] xl:hidden">
        <FormPanel {...props} />
        <section className="mt-3 bg-white">
          <div className="sticky top-[66px] z-40 border-b border-[#E5E0D9] bg-white px-4 py-3 sm:px-6">
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#FAF9F6] p-1">
              <PanelTab active={props.mobilePanel === "template"} onClick={() => props.setMobilePanel("template")} icon={<Palette size={15} />}>Choose Template</PanelTab>
              <PanelTab active={props.mobilePanel === "preview"} onClick={props.onPreview} icon={<Eye size={15} />}>Live Preview</PanelTab>
            </div>
          </div>
          {props.mobilePanel === "template" ? <TemplateSelector {...props} mode="mobile" /> : <PreviewPanel {...props} mobile />}
        </section>
      </div>
    </>
  );
}

function PanelTab({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: ReactNode; children: ReactNode }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`flex h-[42px] items-center justify-center gap-2 rounded-lg text-xs font-semibold ${active ? "bg-white text-[#1E3A5F] shadow-sm" : "text-[#77736E]"}`}>{icon}{children}</button>;
}

function FormPanel({ currentStep, setCurrentStep, onNext, onPrevious, onPublish, children, desktop = false }: Props & { desktop?: boolean }) {
  const title = <div className="flex items-center gap-3">
    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#EAF0F6]"><Folder size={24} className="text-[#1E3A5F]" /></div>
    <div><h1 className="text-lg font-semibold">Digital Visiting Card</h1><p className="mt-0.5 text-sm text-[#77736E]">Step {currentStep} of 7 - {stepName(currentStep)}</p></div>
  </div>;
  return (
    <section className={`relative min-w-0 bg-white ${desktop ? "border-r border-[#E5E0D9]" : ""}`}>
      <div className={`border-b border-[#E5E0D9] ${desktop ? "px-5 py-5" : "px-4 py-4 sm:px-6 sm:py-5"}`}>
        {title}<div className={`overflow-x-auto pb-1 ${desktop ? "mt-6 px-[2px]" : "mt-5 sm:mt-6"}`}><StepNavigation currentStep={currentStep} setCurrentStep={setCurrentStep} /></div>
      </div>
      <div className={desktop ? "relative min-h-[calc(100vh-220px)]" : "px-4 pb-6 pt-6 sm:px-6 sm:pt-7"}>
        <div className={desktop ? "px-5 pb-[150px] pt-7" : ""}>{children}</div>
        {desktop && <div className="absolute bottom-[58px] left-0 right-0 border-t border-[#E5E0D9] bg-white px-5 py-4"><AutoSaved /></div>}
        {!desktop && <div className="border-t border-[#E5E0D9] bg-white px-4 py-3 sm:px-6"><AutoSaved /></div>}
        <div className={desktop ? "absolute bottom-0 left-0 right-0 border-t border-[#E5E0D9] bg-white px-5 py-4" : "border-t border-[#E5E0D9] bg-white px-4 py-4 sm:px-6"}>
          <div className="flex items-center justify-between gap-3">
            <button type="button" disabled={currentStep === 1} onClick={onPrevious} className="h-10 rounded-md border border-[#E5E0D9] px-4 text-sm font-medium disabled:pointer-events-none disabled:opacity-0">← Previous</button>
            <button type="button" onClick={currentStep === 7 ? onPublish : onNext} className="flex h-10 items-center gap-2 rounded-md bg-[#1E3A5F] px-5 text-sm font-semibold text-white">{currentStep === 7 ? <><Rocket size={15} />Publish &amp; Live</> : <>Save &amp; Next →</>}</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function AutoSaved() {
  return <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAF0F6]"><Check size={15} className="text-[#7A9B7E]" /></span><div><p className="text-[13px] font-semibold">Auto saved as Draft</p><p className="text-[11px] text-[#77736E]">Your changes are saved automatically</p></div></div>;
}

function stepName(step: number) {
  return ["", "Basic Details", "Contact", "Social Links", "Services", "Gallery", "Actions & Settings", "Publish"][step] ?? "Basic Details";
}