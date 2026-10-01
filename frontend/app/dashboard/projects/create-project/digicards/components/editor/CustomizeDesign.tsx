"use client";

import { useState } from "react";
import { ChevronRight, Moon, RotateCcw, Sparkles, Type } from "lucide-react";

const backgrounds = [
  { id: "midnight", name: "Midnight", value: "linear-gradient(145deg, #152A47, #1E3A5F, #121212)" },
  { id: "purple", name: "Purple", value: "linear-gradient(145deg, #152A47, #1E3A5F, #3D6A9C)" },
  { id: "blue", name: "Corporate", value: "linear-gradient(145deg, #152A47, #1E3A5F, #1E3A5F)" },
  { id: "dark", name: "Dark", value: "#121212" },
  { id: "emerald", name: "Emerald", value: "#7A9B7E" },
  { id: "rose", name: "Rose", value: "linear-gradient(145deg, #4c0519, #be123c, #881337)" },
  { id: "orange", name: "Sunset", value: "linear-gradient(145deg, #431407, #ea580c, #9a3412)" },
  { id: "gold", name: "Luxury", value: "linear-gradient(145deg, #121212, #121212, #121212)" },
  { id: "white", name: "Minimal", value: "#FAF9F6" },
  { id: "cream", name: "Cream", value: "#f5f1e8" },
  { id: "glass", name: "Glass", value: "linear-gradient(145deg, #152A47, #121212, #1E3A5F)" },
  { id: "violet", name: "Violet", value: "linear-gradient(145deg, #152A47, #1E3A5F, #3D6A9C)" },
];

export default function CustomizeDesign() {
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState("midnight");
  const activeBackground = backgrounds.find((item) => item.id === selected) ?? backgrounds[0];
  return (
    <section className="overflow-hidden rounded-lg border border-[#E5E0D9] bg-white">
      <h3 className="border-b border-[#E5E0D9] px-4 py-3.5 text-sm font-semibold">Customize Design</h3>
      <DesignRow icon={<Type size={16} />} title="Fonts" value="Poppins" />
      <button type="button" onClick={() => setExpanded((open) => !open)} className="flex w-full items-center justify-between border-b border-[#E5E0D9] px-3 py-2.5 text-left hover:bg-[#FAF9F6]">
        <span className="flex items-center gap-2"><Moon size={16} /><span className="text-xs">Background</span></span>
        <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full ring-1 ring-black/10" style={{ background: activeBackground.value }} /><ChevronRight size={16} className={`text-[#77736E] transition-transform ${expanded ? "rotate-90" : ""}`} /></span>
      </button>
      {expanded && <div className="border-b border-[#E5E0D9] bg-[#FAF9F6] px-3 py-3">
        <p className="text-xs font-semibold">Choose Background</p><p className="mt-0.5 text-[11px] text-[#77736E]">Select a background theme</p>
        <div className="mt-3 grid grid-cols-4 gap-2">{backgrounds.map((item) => <button key={item.id} type="button" aria-label={item.name} aria-pressed={selected === item.id} title={item.name} onClick={() => setSelected(item.id)} className={`relative h-12 overflow-hidden rounded-md border ${selected === item.id ? "border-[#1E3A5F] ring-2 ring-[#1E3A5F]" : "border-[#E5E0D9]"}`}><span className="absolute inset-0" style={{ background: item.value }} />{selected === item.id && <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white text-center text-xs text-[#1E3A5F]">✓</span>}</button>)}</div>
        <p className="mt-2 text-center text-[11px] text-[#77736E]">{activeBackground.name}</p>
      </div>}
      <DesignRow icon={<Sparkles size={16} />} title="Button Style" value="Rounded" />
      <div className="px-3 pb-3 pt-2"><button type="button" onClick={() => { setSelected("midnight"); setExpanded(false); }} className="flex h-[30px] w-full items-center justify-center gap-1 rounded-md border border-[#E5E0D9] text-[11px] font-medium text-[#77736E] hover:bg-[#FAF9F6]"><RotateCcw size={14} />Reset to Default</button></div>
    </section>
  );
}

function DesignRow({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return <button type="button" className="flex w-full items-center justify-between border-b border-[#E5E0D9] px-3 py-2.5 text-left hover:bg-[#FAF9F6]"><span className="flex items-center gap-2">{icon}<span className="text-xs">{title}</span></span><span className="flex items-center gap-1 text-xs text-[#77736E]">{value}<ChevronRight size={16} /></span></button>;
}