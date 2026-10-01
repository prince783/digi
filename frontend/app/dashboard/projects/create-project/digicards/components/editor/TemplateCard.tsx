"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import { useDigitalCard } from "../DigitalCardEditor";
import type { TemplateId } from "../DigitalCardEditor";
import { getTemplateData } from "../templateData";

export default function TemplateCard({ template, selected, onSelect }: { template: TemplateId; selected: boolean; onSelect: (template: TemplateId) => void }) {
  const { card } = useDigitalCard();
  const data = getTemplateData(template);
  return (
    <button type="button" onClick={() => onSelect(template)} aria-pressed={selected} className={`group relative block w-full overflow-hidden rounded-lg text-left transition ${selected ? "ring-2 ring-[#1E3A5F] ring-offset-1" : "hover:ring-1 hover:ring-[#E5E0D9]"}`}>
      <div className="relative h-[120px] w-full overflow-hidden rounded-lg bg-[#FAF9F6]">
        {data.image ? <Image src={data.image} alt={data.name} fill sizes="310px" className="object-cover brightness-60 transition-transform group-hover:scale-[1.03]" /> : <div className="absolute inset-0" style={{ background: data.background, filter: "brightness(0.55)" }} />}
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute left-3 top-3 z-10 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-white/70 bg-[#f3c995]">
          {card?.profilePhoto ? <Image src={card.profilePhoto} alt="" fill unoptimized sizes="44px" className="object-cover" /> : <span>👤</span>}
        </div>
        <div className="absolute left-[60px] top-3 z-10 text-white">
          <p className="max-w-[105px] truncate text-xs font-bold">{card?.fullName || "Sriram Singh"}</p>
          <p className="mt-0.5 text-[6px]">{card?.designation || "Founder & CEO"}</p>
          <p className="mt-0.5 max-w-[100px] truncate text-[5px] text-white/70">{card?.companyName || "SoftFYR Technologies"}</p>
        </div>
        <div className="absolute bottom-3 left-[60px] z-10 flex gap-1.5">{["☎", "◉", "✉", "◎"].map((icon) => <span key={icon} className="flex h-4 w-4 items-center justify-center rounded-full border border-white/50 text-[6px] text-white">{icon}</span>)}</div>
        <span className="absolute bottom-2 right-2 z-10 max-w-[100px] truncate rounded bg-black/30 px-1.5 py-0.5 text-[5px] font-medium text-white">{data.name}</span>
        {selected && <span className="absolute right-2 top-2 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-[#1E3A5F] text-white"><Check size={14} /></span>}
      </div>
    </button>
  );
}