"use client";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import type { TemplateId } from "../DigitalCardEditor";
import type { TemplateConfig } from "../templateData";
import { templateCategories } from "../templateData";
import TemplateCard from "./TemplateCard";
import CustomizeDesign from "./CustomizeDesign";

type Props = {
  mode: "desktop" | "mobile";
  filteredTemplates: TemplateConfig[];
  templateSearch: string;
  setTemplateSearch: (value: string) => void;
  templateCategory: string;
  setTemplateCategory: (value: string) => void;
  clearTemplateFilters: () => void;
  selectedTemplate: TemplateId;
  onTemplateChange: (template: TemplateId) => void;
};

export default function TemplateSelector({ mode, filteredTemplates, templateSearch, setTemplateSearch, templateCategory, setTemplateCategory, clearTemplateFilters, selectedTemplate, onTemplateChange }: Props) {
  const mobile = mode === "mobile";
  return (
    <section className={`min-w-0 bg-white ${mobile ? "px-4 py-5 sm:px-6 sm:py-6" : "border-r border-[#E5E0D9] px-4 py-5"}`}>
      <div className="mb-4 flex items-center justify-between">
        <div><h2 className="text-xs font-semibold">Choose Template</h2><p className="mt-1 text-[12px] text-[#77736E]">Select a design for your digital card</p></div>
        <span className="rounded-full bg-[#EAF0F6] px-2 py-1 text-[11px] font-semibold text-[#1E3A5F]">{filteredTemplates.length} Templates</span>
      </div>
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77736E]" />
        <input value={templateSearch} onChange={(event) => setTemplateSearch(event.target.value)} placeholder="Search templates..." className="h-9 w-full rounded-lg border border-[#E5E0D9] bg-[#FAF9F6] pl-9 pr-8 text-xs outline-none focus:border-[#1E3A5F]" />
        {templateSearch && <button type="button" aria-label="Clear search" onClick={() => setTemplateSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#77736E]"><X size={15} /></button>}
      </div>
      <div className="relative mb-4">
        <SlidersHorizontal size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#77736E]" />
        <select value={templateCategory} onChange={(event) => setTemplateCategory(event.target.value)} className="h-9 w-full appearance-none rounded-lg border border-[#E5E0D9] bg-white pl-8 pr-8 text-xs outline-none focus:border-[#1E3A5F]">
          {templateCategories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
        </select>
        <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#77736E]" />
      </div>
      <div className="mb-3 flex items-center justify-between text-[12px] text-[#77736E]">
        <span>{filteredTemplates.length} templates</span>
        {(templateSearch || templateCategory !== "all") && <button type="button" onClick={clearTemplateFilters} className="font-medium text-[#1E3A5F]">Clear filters</button>}
      </div>
      {filteredTemplates.length ? mobile ? (
        <div className="-mx-1 px-1 pb-5"><Slider key={`${templateCategory}-${templateSearch}`} dots arrows infinite={false} speed={400} slidesToShow={1.15} slidesToScroll={1} swipeToSlide touchThreshold={10} responsive={[{ breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 1 } }]}>
          {filteredTemplates.map((template) => <div key={template.id} className="px-1.5"><TemplateCard template={template.id} selected={selectedTemplate === template.id} onSelect={onTemplateChange} /></div>)}
        </Slider></div>
      ) : (
        <div className="max-h-[calc(95vh-400px)] space-y-3 overflow-y-auto pr-1">
          {filteredTemplates.map((template) => <TemplateCard key={template.id} template={template.id} selected={selectedTemplate === template.id} onSelect={onTemplateChange} />)}
        </div>
      ) : (
        <div className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-dashed border-[#E5E0D9] bg-[#FAF9F6] px-5 text-center">
          <Search size={18} className="mb-3 text-[#1E3A5F]" /><p className="text-xs font-semibold">No templates found</p><p className="mt-1 text-[11px] text-[#77736E]">Try another name or category.</p>
          <button type="button" onClick={clearTemplateFilters} className="mt-3 rounded-md bg-[#1E3A5F] px-3 py-1.5 text-[11px] font-semibold text-white">Show All</button>
        </div>
      )}
      <div className="mt-5"><CustomizeDesign /></div>
    </section>
  );
}