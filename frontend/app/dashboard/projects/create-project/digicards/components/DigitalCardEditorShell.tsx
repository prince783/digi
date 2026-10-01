"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { DigitalCardProvider, useDigitalCard } from "./DigitalCardEditor";
import type { TemplateId } from "./DigitalCardEditor";
import { templates, templateIds } from "./templateData";
import EditorHeader from "./editor/EditorHeader";
import EditorWorkspace from "./editor/EditorWorkspace";
import StepContent from "./editor/StepContent";

export default function DigitalCardPage() {
  return <DigitalCardProvider><DigitalCardEditor /></DigitalCardProvider>;
}

function DigitalCardEditor() {
  const router = useRouter();
  const { card, updateCard } = useDigitalCard();
  const [currentStep, setCurrentStep] = useState(1);
  const [mobilePanel, setMobilePanel] = useState<"template" | "preview">("template");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateCategory, setTemplateCategory] = useState("all");
  const previewRef = useRef<HTMLDivElement | null>(null);

  const selectedTemplate = (card?.templateId as TemplateId) || templateIds[0];
  const filteredTemplates = useMemo(() => {
    const query = templateSearch.trim().toLowerCase();
    return templates.filter((template) => {
      const matchesCategory = templateCategory === "all" || template.category === templateCategory;
      const matchesSearch = !query || [template.name, template.categoryLabel, template.description, template.id]
        .some((value) => value.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [templateCategory, templateSearch]);

  const handlePreview = () => {
    setMobilePanel("preview");
    requestAnimationFrame(() => setTimeout(() => previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50));
  };

  const handlePublish = () => {
    if (!card?.username) {
      console.error("Username is missing");
      return;
    }
    router.push(`/payment/${encodeURIComponent(card.username)}`);
  };

  const goNext = () => setCurrentStep((step) => Math.min(step + 1, 7));
  const goPrevious = () => setCurrentStep((step) => Math.max(step - 1, 1));
  const clearTemplateFilters = () => {
    setTemplateSearch("");
    setTemplateCategory("all");
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#FAF9F6] font-display text-[#121212]">
      <EditorHeader
        currentStep={currentStep}
        paymentStatus={card.paymentStatus}
        onBack={() => router.push("/dashboard/projects")}
        onPreview={handlePreview}
        onNext={goNext}
        onPublish={handlePublish}
      />
      <EditorWorkspace
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        mobilePanel={mobilePanel}
        setMobilePanel={setMobilePanel}
        previewRef={previewRef}
        previewDevice={previewDevice}
        setPreviewDevice={setPreviewDevice}
        selectedTemplate={selectedTemplate}
        filteredTemplates={filteredTemplates}
        templateSearch={templateSearch}
        setTemplateSearch={setTemplateSearch}
        templateCategory={templateCategory}
        setTemplateCategory={setTemplateCategory}
        clearTemplateFilters={clearTemplateFilters}
        onTemplateChange={(template) => updateCard("templateId", template)}
        onNext={goNext}
        onPrevious={goPrevious}
        onPreview={handlePreview}
        onPublish={handlePublish}
        onFullscreen={async () => {
          try {
            if (!previewRef.current) return;
            if (document.fullscreenElement) await document.exitFullscreen();
            else await previewRef.current.requestFullscreen();
          } catch (error) {
            console.error("Fullscreen preview failed:", error);
          }
        }}
      >
        <StepContent step={currentStep} />
      </EditorWorkspace>
      <button type="button" aria-label="Open chat" className="fixed bottom-4 right-4 z-[100] flex h-11 w-11 items-center justify-center rounded-full bg-[#1E3A5F] text-white shadow-lg sm:bottom-5 sm:right-5">
        <MessageCircle size={19} />
      </button>
    </main>
  );
}