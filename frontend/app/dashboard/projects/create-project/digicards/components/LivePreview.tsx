"use client";

import {
  Phone,
  MessageCircle,
  Mail,
  Globe,
  MapPin,
  Map,
  Share2,
  Image as ImageIcon,
  Clock3,
  MoreVertical,
  Plus,
} from "lucide-react";
import type { ReactNode } from "react";

import type { DigitalCardData } from "./DigitalCardEditor";
import { useDigitalCard } from "./DigitalCardEditor";
import { TEMPLATE_DATA, getTemplateData } from "./templateData";

export type CardTemplate = keyof typeof TEMPLATE_DATA;

interface LivePreviewProps {
  currentStep: number;
  template?: string;
}

type ActionItem = {
  icon: ReactNode;
  label: string;
  color: string;
};

function getTemplateImage(data: ReturnType<typeof getTemplateData>) {
  return "image" in data ? (data as { image?: string }).image : undefined;
}

function normalizeUrl(url?: string) {
  if (!url?.trim()) return undefined;
  const value = url.trim();
  return value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
}

function escapeVCard(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function downloadVCard(card: DigitalCardData) {
  const name = card.fullName || card.companyName || "Digital Contact";
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${escapeVCard(name)}`];

  if (card.companyName) lines.push(`ORG:${escapeVCard(card.companyName)}`);
  if (card.designation) lines.push(`TITLE:${escapeVCard(card.designation)}`);
  if (card.mobile) lines.push(`TEL;TYPE=CELL:${escapeVCard(card.mobile)}`);
  if (card.email) lines.push(`EMAIL:${escapeVCard(card.email)}`);
  if (card.website) lines.push(`URL:${escapeVCard(card.website)}`);
  if (card.address) lines.push(`ADR;TYPE=WORK:;;${escapeVCard(card.address)}`);
  lines.push("END:VCARD");

  const blob = new Blob([lines.join("\r\n")], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name.replace(/[^a-z0-9]/gi, "_")}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function ProfileHeader() {
  const { card } = useDigitalCard();

  return (
    <div className="text-center">
      <div className="mx-auto h-[80px] w-[80px] overflow-hidden rounded-full border-[3px] border-[#7d4cff] bg-[#f1d0b6] p-[3px]">
        {card.profilePhoto ? (
          <img src={card.profilePhoto} alt={card.fullName || "Profile"} className="h-full w-full rounded-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#e9cbb5] text-[25px]">??</div>
        )}
      </div>
      <h2 className="mt-[8px] text-[16px] font-semibold leading-[25px] tracking-[-0.2px] text-white">{card.fullName || "Your Name"}</h2>
      <p className="mt-[1px] text-[12px] font-medium text-white/85">{card.designation || "Designation"}</p>
      <p className="mt-[2px] text-[12px] text-white/75">{card.companyName || "Company Name"}</p>
    </div>
  );
}

function QuickAction({ icon, label, background }: { icon: ReactNode; label: string; background: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-white" style={{ backgroundColor: background }}>{icon}</div>
      <span className="mt-[4px] text-[9px] font-medium text-white/75">{label}</span>
    </div>
  );
}

function QuickActions() {
  return (
    <div className="mt-[13px] grid grid-cols-4 items-start gap-[4px]">
      <QuickAction icon={<Phone size={16} strokeWidth={2.5} />} label="Call" background="#34478e" />
      <QuickAction icon={<MessageCircle size={17} strokeWidth={2.5} />} label="WhatsApp" background="#13b95c" />
      <QuickAction icon={<Mail size={16} strokeWidth={2.3} />} label="Email" background="#6540c8" />
      <QuickAction icon={<Globe size={16} strokeWidth={2.3} />} label="Website" background="#1672e9" />
    </div>
  );
}

function ActionPreviewButton({ icon, label, background }: { icon: ReactNode; label: string; background: string }) {
  return (
    <div className="flex min-h-[55px] flex-col items-center justify-center gap-[4px] px-[3px] py-[5px]">
      <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: background }}>{icon}</div>
      <p className="max-w-full truncate text-center text-[9px] font-medium text-white/90">{label}</p>
    </div>
  );
}

function ContactRow({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-[8px] rounded-md bg-white/[0.07] px-[8px] py-[7px]">
      <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-[#6737E8] text-white">{icon}</div>
      <span className="min-w-0 break-all text-[10.5px] leading-[14px] text-white/90">{value}</span>
    </div>
  );
}

function WorkingHourRow({ day, from, to }: { day: string; from: string; to: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-white/[0.06] px-[9px] py-[8px]">
      <span className="text-[10px] font-medium text-white/70">{day}</span>
      <span className="text-[10px] font-medium text-white/90">{from}<span className="mx-[4px] text-white/40">-</span>{to}</span>
    </div>
  );
}

function EmptyMessage({ children }: { children: ReactNode }) {
  return <div className="mt-[10px] rounded-md bg-white/[0.05] px-[10px] py-[12px] text-center"><p className="text-[10px] leading-[15px] text-white/50">{children}</p></div>;
}

function SocialIcons({ socialLinks }: { socialLinks?: { facebook?: string; instagram?: string; linkedin?: string; twitter?: string; youtube?: string; other?: string } }) {
  const items = [
    { value: socialLinks?.facebook, label: "Facebook", className: "bg-[#1877F2]", content: <span className="text-[20px] font-bold leading-none">f</span> },
    { value: socialLinks?.instagram, label: "Instagram", className: "bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#FCAF45]", content: <span className="text-[20px] leading-none">?</span> },
    { value: socialLinks?.linkedin, label: "LinkedIn", className: "bg-[#0A66C2]", content: <span className="text-[18px] font-bold leading-none">in</span> },
    { value: socialLinks?.youtube, label: "YouTube", className: "bg-[#FF0000]", content: <span className="text-[18px] leading-none">?</span> },
    { value: socialLinks?.twitter, label: "X", className: "bg-black", content: <span className="text-[20px] font-semibold leading-none">??</span> },
  ].filter((item): item is typeof item & { value: string } => Boolean(item.value?.trim()));

  if (!items.length) return <EmptyMessage>Add your social links to see them here.</EmptyMessage>;

  return (
    <div className="mt-[9px] flex flex-wrap items-center gap-[10px]">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          aria-label={item.label}
          onClick={() => {
            const url = item.value.trim();
            const finalUrl = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
            window.open(finalUrl, "_blank", "noopener,noreferrer");
          }}
          className={`flex h-[35px] w-[35px] shrink-0 items-center justify-center rounded-full ${item.className} text-white shadow-md transition duration-200 hover:scale-110 hover:shadow-lg active:scale-95`}
        >
          {item.content}
        </button>
      ))}
    </div>
  );
}

function SaveButton({ buttonBackground, buttonText }: { buttonBackground: string; buttonText: string }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-transparent px-[22px] pb-[18px] pt-[12px] shadow-none">
      <button type="button" className="block h-[37px] w-full rounded-[5px] border-0 text-[12px] font-semibold outline-none shadow-none" style={{ backgroundColor: buttonBackground, color: buttonText, boxShadow: "none", filter: "none" }}>
        Save Contact
      </button>
    </div>
  );
}

function BasicPreview() {
  const { card } = useDigitalCard();
  const services = card.businessDetails?.services ?? [];

  return (
    <div>
      <ProfileHeader />
      <div className="mt-[12px] h-px w-full bg-white/[0.10]" />
      {card.tagline?.trim() && <div className="mt-[12px] flex justify-center"><p className="w-[150px] text-center text-[12px] font-medium leading-[17px] text-white/85">{card.tagline}</p></div>}
      <QuickActions />
      <div className="mt-[12px] border-t border-white/[0.10] pt-[8px]">
        <h3 className="text-[13px] font-semibold text-white">About Company</h3>
        <p className="mt-[6px] text-[11px] leading-[16px] text-white/75">{card.aboutCompany || "Your company information will appear here."}</p>
      </div>
      <div className="mt-[13px] border-t border-white/[0.10] pt-[12px]">
        <h3 className="text-[13px] font-semibold text-white">Our Services</h3>
        {services.length ? (
          <div className="mt-[6px] space-y-[5px]">{services.map((service, index) => <div key={`${service}-${index}`} className="flex items-center gap-[7px]"><span className="text-[13px] font-bold leading-none text-[#10c968]">?</span><span className="text-[11px] leading-[15px] text-white/80">{service}</span></div>)}</div>
        ) : (
          <EmptyMessage>Your services will appear here.</EmptyMessage>
        )}
      </div>
    </div>
  );
}

function ContactPreview() {
  const { card } = useDigitalCard();
  const hasContact = Boolean(card.mobile || card.whatsapp || card.email || card.website || card.address || card.googleMapLink);

  return (
    <div>
      <ProfileHeader />
      <div className="mt-[14px] border-t border-white/[0.10] pt-[13px]">
        <h3 className="text-[13px] font-semibold text-white">Contact Details</h3>
        <div className="mt-[10px] space-y-[6px]">
          {card.mobile && <ContactRow icon={<Phone size={14} />} value={card.mobile} />}
          {card.whatsapp && <ContactRow icon={<MessageCircle size={15} />} value={card.whatsapp} />}
          {card.email && <ContactRow icon={<Mail size={14} />} value={card.email} />}
          {card.website && <ContactRow icon={<Globe size={14} />} value={card.website} />}
          {card.address && <ContactRow icon={<MapPin size={14} />} value={card.address} />}
          {card.googleMapLink && (
            <a href={normalizeUrl(card.googleMapLink)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-[8px] pt-[3px] text-[11px] text-purple-300 transition hover:text-purple-200">
              <Map size={14} />
              <span>View on Google Maps</span>
            </a>
          )}
          <SocialIcons socialLinks={card.socialLinks} />
          {!hasContact && <EmptyMessage>Add your contact details to see them here.</EmptyMessage>}
        </div>
      </div>
    </div>
  );
}

function SocialPreview() {
  const { card } = useDigitalCard();
  const socialLinks = card.socialLinks ?? {};
  const hasSocialLinks = Boolean(socialLinks.facebook?.trim() || socialLinks.instagram?.trim() || socialLinks.linkedin?.trim() || socialLinks.youtube?.trim() || socialLinks.twitter?.trim());

  return (
    <div>
      <ProfileHeader />
      {card.tagline?.trim() && <div className="mt-[12px] flex justify-center"><p className="w-[150px] text-center text-[12px] font-medium leading-[17px] text-white/85">{card.tagline}</p></div>}
      <QuickActions />
      <div className="mt-[14px] border-t border-white/[0.10] pt-[13px]">
        <h3 className="text-[11px] font-semibold text-white">Follow Me</h3>
        {hasSocialLinks ? <SocialIcons socialLinks={socialLinks} /> : <EmptyMessage>Add your social links to see them here.</EmptyMessage>}
        <p className="mb-3 mt-6 text-xs">View My Location</p>
        {card.address?.trim() ? <ContactRow icon={<MapPin size={14} />} value={card.address} /> : <EmptyMessage>Add your location to see it here.</EmptyMessage>}
      </div>
    </div>
  );
}

function ServicesPreview() {
  const { card } = useDigitalCard();
  const services = card.businessDetails?.services ?? [];
  const workingHours = card.businessDetails?.workingHours ?? { weekday: { from: "09:00 AM", to: "07:00 PM" }, weekend: { from: "10:00 AM", to: "04:00 PM" } };

  return (
    <div>
      <ProfileHeader />
      <div className="mt-[12px] h-px w-full bg-white/[0.10]" />
      {card.tagline?.trim() && <div className="mt-[12px] flex justify-center"><p className="w-[150px] text-center text-[12px] font-medium leading-[17px] text-white/85">{card.tagline}</p></div>}
      <QuickActions />
      <div className="mt-[13px] border-t border-white/[0.10] pt-[13px]">
        <h3 className="text-[13px] font-semibold text-white">Our Services</h3>
        {services.length ? <div className="mt-[6px] space-y-[5px]">{services.map((service, index) => <div key={`${service}-${index}`} className="flex items-center gap-[7px] rounded-md bg-white/[0.06] px-[9px] py-[7px]"><span className="text-[13px] font-bold text-[#10c968]">?</span><p className="text-[11px] leading-[15px] text-white/80">{service || "Service"}</p></div>)}</div> : <EmptyMessage>Your services will appear here.</EmptyMessage>}
      </div>
      <div className="mt-[12px] border-t border-white/[0.10] pt-[13px]">
        <div className="flex items-center justify-between"><h3 className="text-[13px] font-semibold text-white">Working Hours</h3><Clock3 size={14} className="text-white/50" /></div>
        <div className="mt-[5px] space-y-[5px]">
          <WorkingHourRow day="Mon - Fri" from={workingHours.weekday?.from || "09:00 AM"} to={workingHours.weekday?.to || "07:00 PM"} />
          <WorkingHourRow day="Sat - Sun" from={workingHours.weekend?.from || "10:00 AM"} to={workingHours.weekend?.to || "04:00 PM"} />
        </div>
      </div>
    </div>
  );
}

function GalleryPreview() {
  const { card } = useDigitalCard();
  const services = card.businessDetails?.services ?? [];
  const gallery = card.gallery ?? [];

  return (
    <div>
      <ProfileHeader />
      <div className="mt-[10px] border-t border-white/[0.10] pt-[13px]">
        {card.tagline?.trim() && <div className="flex justify-center"><p className="w-[150px] text-center text-[12px] font-medium leading-[17px] text-white/85">{card.tagline}</p></div>}
        <QuickActions />
        <div className="mt-[13px] border-t border-white/[0.10] pt-[12px]">
          <h3 className="text-[13px] font-semibold text-white">Our Services</h3>
          {services.length ? <div className="mt-[6px] space-y-[5px]">{services.slice(0, 4).map((service, index) => <div key={`${service}-${index}`} className="flex items-center gap-[7px]"><span className="text-[13px] font-bold leading-none text-[#10c968]">?</span><span className="text-[11px] leading-[15px] text-white/80">{service}</span></div>)}</div> : <EmptyMessage>Your services will appear here.</EmptyMessage>}
        </div>
        <div className="mt-[12px]">
          <div className="flex items-center justify-between"><div className="flex items-center gap-[7px]"><ImageIcon size={15} /><h3 className="text-[13px] font-semibold text-white">Gallery</h3></div>{gallery.length > 0 && <button type="button" className="text-[9px] font-medium text-purple-300 transition hover:text-purple-200">View All</button>}</div>
          {gallery.length ? <div className="mt-[9px] grid grid-cols-3 gap-[5px]">{gallery.slice(0, 3).map((image, index) => <div key={`${image.url}-${index}`} className="h-[65px] w-full overflow-hidden rounded-[5px] bg-white/[0.05]"><img src={image.url} alt={`Gallery ${index + 1}`} className="h-full w-full object-cover transition duration-200 hover:scale-105" /></div>)}</div> : <EmptyMessage>Your gallery images will appear here.</EmptyMessage>}
        </div>
      </div>
    </div>
  );
}

function ActionSettingsPreview() {
  const { card } = useDigitalCard();
  const socialLinks = card.socialLinks ?? {};
  const actions: ActionItem[] = []; if (card.showCall ?? true) actions.push({ icon: <Phone size={15} />, label: "Call", color: "#34478e" }); if (card.showWhatsapp ?? true) actions.push({ icon: <MessageCircle size={15} />, label: "WhatsApp", color: "#13b95c" }); if (card.showEmail ?? true) actions.push({ icon: <Mail size={15} />, label: "Email", color: "#6540c8" }); if (card.showWebsite ?? true) actions.push({ icon: <Globe size={15} />, label: "Website", color: "#1672e9" }); if (card.showLocation ?? true) actions.push({ icon: <MapPin size={15} />, label: "Location", color: "#6737E8" }); if (card.showCustomButton ?? false) actions.push({ icon: <Plus size={15} />, label: card.customButtonLabel?.trim() || "Custom Button", color: "#5631C8" });

  return (
    <div>
      <ProfileHeader />
      {card.tagline?.trim() && <div className="mt-[12px] flex justify-center"><p className="w-[150px] text-center text-[12px] font-medium leading-[17px] text-white/85">{card.tagline}</p></div>}
      <div className="mt-[12px] h-px w-full bg-white/[0.10]" />
      <div className="mt-[13px]">
        <div className="flex items-center justify-between"><h3 className="text-[13px] font-semibold text-white">Contact & Actions</h3><Share2 size={14} className="text-white/50" /></div>
        {actions.length ? <div className="mt-[8px] grid grid-cols-4 gap-[4px]">{actions.map((action) => <ActionPreviewButton key={action.label} icon={action.icon} label={action.label} background={action.color} />)}</div> : <EmptyMessage>No actions are enabled for your card.</EmptyMessage>}
      </div>
      <div className="mt-[10px] border-t border-white/[0.10] pt-[12px]">
        <h3 className="text-[13px] font-semibold text-white">Our Services</h3>
        {card.businessDetails?.services?.length ? <div className="mt-[6px] space-y-[5px]">{card.businessDetails.services.map((service, index) => <div key={`${service}-${index}`} className="flex items-center gap-[7px]"><span className="text-[13px] font-bold leading-none text-[#10c968]">?</span><span className="text-[11px] leading-[15px] text-white/80">{service}</span></div>)}</div> : <EmptyMessage>Your services will appear here.</EmptyMessage>}
      </div>
      <div className="mt-[12px] border-t border-white/[0.10] pt-[13px]"><h3 className="text-[11px] font-semibold text-white">Follow Me</h3><SocialIcons socialLinks={socialLinks} /></div>
    </div>
  );
}

function FullPreview() {
  const { card } = useDigitalCard();
  const socialLinks = card.socialLinks ?? {};
  const actions: ActionItem[] = []; if (card.showCall ?? true) actions.push({ icon: <Phone size={15} />, label: "Call", color: "#34478e" }); if (card.showWhatsapp ?? true) actions.push({ icon: <MessageCircle size={15} />, label: "WhatsApp", color: "#13b95c" }); if (card.showEmail ?? true) actions.push({ icon: <Mail size={15} />, label: "Email", color: "#6540c8" }); if (card.showWebsite ?? true) actions.push({ icon: <Globe size={15} />, label: "Website", color: "#1672e9" }); if (card.showLocation ?? true) actions.push({ icon: <MapPin size={15} />, label: "Location", color: "#6737E8" }); if (card.showCustomButton ?? false) actions.push({ icon: <Plus size={15} />, label: card.customButtonLabel?.trim() || "Custom Button", color: "#5631C8" });

  return (
    <div>
      <ProfileHeader />
      {card.tagline?.trim() && <div className="mt-[12px] flex justify-center"><p className="w-[150px] text-center text-[12px] font-medium leading-[15px] text-white/85">{card.tagline}</p></div>}
      <div className="mt-[10px] h-px w-full bg-white/[0.10]" />
      <div className="mt-[8px]">
        <div className="flex items-center justify-between"><h3 className="text-[13px] font-semibold text-white">Contact & Actions</h3><Share2 size={14} className="text-white/50" /></div>
        {actions.length ? <div className="mt-[4px] grid grid-cols-4 gap-[4px]">{actions.map((action) => <ActionPreviewButton key={action.label} icon={action.icon} label={action.label} background={action.color} />)}</div> : <EmptyMessage>No actions are enabled for your card.</EmptyMessage>}
      </div>
      <div className="mt-[8px] border-t border-white/[0.10] pt-[12px]">
        <h3 className="text-[13px] font-semibold text-white">Our Services</h3>
        {card.businessDetails?.services?.length ? <div className="mt-[6px] space-y-[5px]">{card.businessDetails.services.map((service, index) => <div key={`${service}-${index}`} className="flex items-center gap-[7px]"><span className="text-[13px] font-bold leading-none text-[#10c968]">?</span><span className="text-[11px] leading-[15px] text-white/80">{service}</span></div>)}</div> : <EmptyMessage>Your services will appear here.</EmptyMessage>}
      </div>
      <div className="mt-[8px] border-t border-white/[0.10] pt-[13px]"><h3 className="text-[11px] font-semibold text-white">Follow Me</h3><SocialIcons socialLinks={socialLinks} /></div>
    </div>
  );
}

function PreviewSectionMap({ currentStep }: { currentStep: number }) {
  const componentMap = {
    1: BasicPreview,
    2: ContactPreview,
    3: SocialPreview,
    4: ServicesPreview,
    5: GalleryPreview,
    6: ActionSettingsPreview,
    7: FullPreview,
  } as const;

  const StepComponent = componentMap[currentStep as keyof typeof componentMap] ?? BasicPreview;
  return <StepComponent />;
}

export default function LivePreview({ currentStep, template }: LivePreviewProps) {
  const { card } = useDigitalCard();
  const activeTemplate = card.templateId || template || "template-1";
  const templateData = getTemplateData(activeTemplate);
  const templateImage = getTemplateImage(templateData);

  return (
    <div className="relative h-[600px] w-[282px] min-h-[600px] min-w-[282px] max-h-[600px] max-w-[282px] shrink-0 overflow-hidden rounded-[25px] text-white" style={{ background: templateData.background, transition: "background 300ms ease" }}>
      {templateImage && <div className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url("${templateImage}")`, filter: "brightness(0.45)", transform: "scale(1.01)" }} />}
      {templateImage && <div className="pointer-events-none absolute inset-0 z-[1] bg-black/20" />}
      <div className="pointer-events-none absolute -left-[90px] top-[70px] z-[2] h-[230px] w-[230px] rounded-full opacity-10 blur-[75px]" style={{ backgroundColor: templateData.accent }} />
      <div className="pointer-events-none absolute -right-[90px] bottom-[60px] z-[2] h-[210px] w-[210px] rounded-full opacity-10 blur-[70px]" style={{ backgroundColor: templateData.accent }} />
      {activeTemplate === "template-2" && <><div className="pointer-events-none absolute -right-[60px] -top-[55px] z-[2] h-[160px] w-[160px] rounded-full border-[30px] border-white/10" /><div className="pointer-events-none absolute -bottom-[70px] -left-[50px] z-[2] h-[180px] w-[180px] rounded-full bg-white/[0.05]" /></>}
      {activeTemplate === "template-3" && <div className="pointer-events-none absolute right-[-50px] top-[120px] z-[2] h-[180px] w-[180px] rotate-45 border border-[#f0b400]/20" />}
      {activeTemplate === "template-4" && <div className="pointer-events-none absolute -bottom-[70px] -right-[60px] z-[2] h-[190px] w-[190px] rounded-full bg-white/[0.06]" />}
      {activeTemplate === "template-5" && <><div className="pointer-events-none absolute -left-[70px] top-[80px] z-[2] h-[180px] w-[180px] rounded-full bg-white/[0.08] blur-[10px]" /><div className="pointer-events-none absolute -right-[70px] bottom-[100px] z-[2] h-[200px] w-[200px] rounded-full bg-white/[0.08] blur-[10px]" /></>}
      <button type="button" className="absolute right-[13px] top-[17px] z-30 text-white/90" aria-label="More options"><MoreVertical size={18} strokeWidth={2} /></button>
      <div className="relative z-10 h-full w-full overflow-y-auto px-[22px] py-[24px] pb-[85px] scrollbar-none" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <PreviewSectionMap currentStep={currentStep} />
      </div>
      {currentStep !== 6 && currentStep !== 7 && <SaveButton buttonBackground={templateData.accent} buttonText={templateData.textColor} />}
    </div>
  );
}

export function PublicCardPreview({ template }: { template?: string }) {
  const { card } = useDigitalCard();
  const activeTemplate = template || card.templateId || "template-1";
  const templateData = getTemplateData(activeTemplate);
  const templateImage = getTemplateImage(templateData);
  const services = card.businessDetails?.services ?? [];
  const gallery = card.gallery ?? [];
  const videos = card.videos ?? [];
  const certificates = card.certificates ?? [];
  const workingHours = card.businessDetails?.workingHours ?? { weekday: { from: "09:00 AM", to: "07:00 PM" }, weekend: { from: "10:00 AM", to: "04:00 PM" } };
  const visibleQuickActions: ActionItem[] = []; if (card.showCall ?? true) visibleQuickActions.push({ icon: <Phone size={16} strokeWidth={2.5} />, label: "Call", color: "#34478e" }); if (card.showWhatsapp ?? true) visibleQuickActions.push({ icon: <MessageCircle size={17} strokeWidth={2.5} />, label: "WhatsApp", color: "#13b95c" }); if (card.showEmail ?? true) visibleQuickActions.push({ icon: <Mail size={16} strokeWidth={2.3} />, label: "Email", color: "#6540c8" }); if (card.showWebsite ?? true) visibleQuickActions.push({ icon: <Globe size={16} strokeWidth={2.3} />, label: "Website", color: "#1672e9" });

  const handleShareCard = async () => {
    if (!card.username) return;
    const url = `${window.location.origin}/digitalvisitingcard/${encodeURIComponent(card.username)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: card.fullName || "Digital Visiting Card", text: `Check out ${card.fullName || "my"} digital visiting card`, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Card link copied!");
      }
    } catch {
      // share canceled
    }
  };

  return (
    <div className="min-h-screen bg-[#eef1f5] px-3 py-5">
      <div className="relative mx-auto min-h-[600px] w-full max-w-[390px] overflow-hidden rounded-[30px] text-white shadow-[0_25px_70px_rgba(0,0,0,0.25)]" style={{ background: templateData.background }}>
        {templateImage && <div className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url("${templateImage}")`, filter: "brightness(0.45)", transform: "scale(1.01)" }} />}
        {templateImage && <div className="pointer-events-none absolute inset-0 z-[1] bg-black/20" />}
        <div className="pointer-events-none absolute -left-[90px] top-[70px] z-[2] h-[230px] w-[230px] rounded-full opacity-10 blur-[75px]" style={{ backgroundColor: templateData.accent }} />
        <div className="pointer-events-none absolute -right-[90px] bottom-[60px] z-[2] h-[210px] w-[210px] rounded-full opacity-10 blur-[70px]" style={{ backgroundColor: templateData.accent }} />
        {activeTemplate === "template-2" && <><div className="pointer-events-none absolute -right-[60px] -top-[55px] z-[2] h-[160px] w-[160px] rounded-full border-[30px] border-white/10" /><div className="pointer-events-none absolute -bottom-[70px] -left-[50px] z-[2] h-[180px] w-[180px] rounded-full bg-white/[0.05]" /></>}
        {activeTemplate === "template-3" && <div className="pointer-events-none absolute right-[-50px] top-[120px] z-[2] h-[180px] w-[180px] rotate-45 border border-[#f0b400]/20" />}
        {activeTemplate === "template-4" && <div className="pointer-events-none absolute -bottom-[70px] -right-[60px] z-[2] h-[190px] w-[190px] rounded-full bg-white/[0.06]" />}
        {activeTemplate === "template-5" && <><div className="pointer-events-none absolute -left-[70px] top-[80px] z-[2] h-[180px] w-[180px] rounded-full bg-white/[0.08] blur-[10px]" /><div className="pointer-events-none absolute -right-[70px] bottom-[100px] z-[2] h-[200px] w-[200px] rounded-full bg-white/[0.08] blur-[10px]" /></>}

        <div className="absolute left-[12px] right-[12px] top-[12px] z-40 flex items-center justify-between">
          <button type="button" onClick={() => downloadVCard(card)} className="flex items-center gap-[5px] rounded-full border border-white/20 bg-white/[0.12] px-[10px] py-[6px] text-[9px] font-semibold text-white shadow-md transition hover:bg-white/[0.18] active:scale-95">
            <span className="text-[11px]">?</span>
            Save Contact
          </button>
          <button type="button" onClick={handleShareCard} className="flex items-center gap-[5px] rounded-full border border-white/20 bg-white/[0.12] px-[10px] py-[6px] text-[9px] font-semibold text-white shadow-md backdrop-blur-md transition hover:bg-white/[0.18] active:scale-95">
            <Share2 size={11} strokeWidth={2.5} />
            Share Card
          </button>
        </div>

        <div className="relative z-10 h-full w-full overflow-y-auto px-[22px] py-[24px] pb-[85px] scrollbar-none" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <ProfileHeader />
          {card.tagline?.trim() && <div className="mt-[10px] flex justify-center"><p className="w-[210px] text-center text-[11px] leading-[15px] text-white/80">{card.tagline}</p></div>}

          <div className="mt-[12px] grid grid-cols-4 gap-[4px]">
            {visibleQuickActions.map((action) => (
              <QuickAction key={action.label} icon={action.icon} label={action.label} background={action.color} />
            ))}
          </div>

          {((card.showLocation ?? true) || card.address || card.googleMapLink) && (
            <div className="mt-[10px] rounded-[7px] bg-white/[0.08] px-[9px] py-[7px]">
              <div className="flex items-center justify-between gap-[8px]">
                {(card.showLocation ?? true) && card.address && <div className="flex min-w-0 items-center gap-[6px]"><MapPin size={13} className="shrink-0" /><span className="truncate text-[9px] text-white/85">{card.address}</span></div>}
                {card.googleMapLink && <a href={normalizeUrl(card.googleMapLink)} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[8px] text-purple-300">View Map</a>}
              </div>
            </div>
          )}

          {card.aboutCompany?.trim() && <div className="mt-[12px] border-t border-white/[0.10] pt-[10px]"><div className="flex items-center justify-between"><h3 className="text-[12px] font-semibold text-white">About Me</h3><button type="button" className="rounded-[4px] bg-[#6737E8] px-[8px] py-[4px] text-[8px] font-semibold text-white">Read More</button></div><p className="mt-[5px] line-clamp-3 text-[9px] leading-[14px] text-white/70">{card.aboutCompany}</p></div>}

          <div className="mt-[12px] border-t border-white/[0.10] pt-[10px]">
            <div className="flex items-center justify-between"><h3 className="text-[12px] font-semibold text-white">Our Services</h3>{services.length > 0 && <span className="text-[8px] text-purple-300">View All</span>}</div>
            {services.length > 0 ? <div className="mt-[7px] grid grid-cols-4 gap-[4px]">{services.slice(0, 8).map((service, index) => <div key={`${service}-${index}`} className="flex min-h-[50px] flex-col items-center justify-center rounded-[5px] bg-white/[0.06] px-[3px] py-[5px] text-center"><div className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#6737E8] text-[9px]">?</div><span className="mt-[3px] line-clamp-2 text-[7px] leading-[10px] text-white/80">{service}</span></div>)}</div> : <EmptyMessage>Your services will appear here.</EmptyMessage>}
          </div>

          {(workingHours.weekday || workingHours.weekend) && <div className="mt-[11px] border-t border-white/[0.10] pt-[10px]"><div className="flex items-center justify-between"><h3 className="text-[12px] font-semibold text-white">Working Hours</h3><Clock3 size={13} className="text-white/50" /></div><div className="mt-[6px] space-y-[4px]">{workingHours.weekday && <WorkingHourRow day="Mon - Fri" from={workingHours.weekday?.from || "09:00 AM"} to={workingHours.weekday?.to || "07:00 PM"} />}{workingHours.weekend && <WorkingHourRow day="Sat - Sun" from={workingHours.weekend?.from || "10:00 AM"} to={workingHours.weekend?.to || "04:00 PM"} />}</div></div>}

          {(card.mobile || card.whatsapp || card.email || card.website) && <div className="mt-[11px] border-t border-white/[0.10] pt-[10px]"><h3 className="text-[12px] font-semibold text-white">Contact Me</h3><div className="mt-[6px] space-y-[4px]">{card.mobile && <ContactRow icon={<Phone size={12} />} value={card.mobile} />}{card.whatsapp && <ContactRow icon={<MessageCircle size={13} />} value={card.whatsapp} />}{card.email && <ContactRow icon={<Mail size={12} />} value={card.email} />}{card.website && <ContactRow icon={<Globe size={12} />} value={card.website} />}</div></div>}

          <div className="mt-[11px] border-t border-white/[0.10] pt-[10px]"><h3 className="text-[12px] font-semibold text-white">Connect With Me</h3><SocialIcons socialLinks={card.socialLinks ?? {}} /></div>

          {gallery.length > 0 && <div className="mt-[11px] border-t border-white/[0.10] pt-[10px]"><div className="flex items-center justify-between"><div className="flex items-center gap-[5px]"><ImageIcon size={13} /><h3 className="text-[12px] font-semibold text-white">Gallery</h3></div><span className="text-[8px] text-purple-300">View All</span></div><div className="mt-[7px] grid grid-cols-3 gap-[4px]">{gallery.slice(0, 6).map((image, index) => <div key={`${image.url}-${index}`} className="h-[62px] overflow-hidden rounded-[5px] bg-white/[0.05]"><img src={image.url} alt={`Gallery ${index + 1}`} className="h-full w-full object-cover" /></div>)}</div></div>}

          {videos.length > 0 && <div className="mt-[11px] border-t border-white/[0.10] pt-[10px]"><div className="flex items-center justify-between"><h3 className="text-[12px] font-semibold text-white">Videos</h3><span className="text-[8px] text-purple-300">View All</span></div><div className="mt-[7px] grid grid-cols-3 gap-[4px]">{videos.slice(0, 6).map((video, index) => <a key={`${video.url}-${index}`} href={normalizeUrl(video.url)} target="_blank" rel="noopener noreferrer" className="relative flex h-[55px] items-center justify-center overflow-hidden rounded-[5px] bg-black/30"><div className="absolute inset-0 bg-black/30" /><div className="relative z-10 flex h-[23px] w-[23px] items-center justify-center rounded-full bg-[#6737E8] text-[9px]">?</div></a>)}</div></div>}

          {certificates.length > 0 && <div className="mt-[11px] border-t border-white/[0.10] pt-[10px]"><h3 className="text-[12px] font-semibold text-white">Certificates</h3><div className="mt-[7px] grid grid-cols-2 gap-[5px]">{certificates.slice(0, 4).map((certificate, index) => <a key={`${certificate.url}-${index}`} href={certificate.url} target="_blank" rel="noopener noreferrer" className="flex min-h-[40px] items-center gap-[5px] rounded-[5px] bg-white/[0.06] px-[6px] py-[5px]"><span className="text-[9px]">??</span><span className="truncate text-[8px] text-white/80">{certificate.name || `Certificate ${index + 1}`}</span></a>)}</div></div>}

          {(card.businessDetails?.businessName || card.businessDetails?.businessType || card.businessDetails?.gstNumber) && <div className="mt-[11px] border-t border-white/[0.10] pt-[10px]"><h3 className="text-[12px] font-semibold text-white">Business Details</h3><div className="mt-[6px] space-y-[4px]">{card.businessDetails?.businessName && <ContactRow icon={<Globe size={12} />} value={card.businessDetails.businessName} />}{card.businessDetails?.businessType && <ContactRow icon={<MapPin size={12} />} value={card.businessDetails.businessType} />}{card.businessDetails?.gstNumber && <ContactRow icon={<Plus size={12} />} value={`GST: ${card.businessDetails.gstNumber}`} />}</div></div>}

          {(card.showCustomButton ?? false) && card.customButtonLabel?.trim() && <div className="mt-[11px]"><button type="button" className="h-[35px] w-full rounded-[5px] bg-[#5631C8] text-[10px] font-semibold text-white">{card.customButtonLabel}</button></div>}
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-30 bg-transparent px-[22px] pb-[18px] pt-[12px] shadow-none">
          <button type="button" onClick={() => downloadVCard(card)} className="block h-[37px] w-full rounded-[5px] border-0 text-[12px] font-semibold outline-none shadow-none" style={{ backgroundColor: templateData.accent, color: templateData.textColor, boxShadow: "none", filter: "none" }}>
            Save Contact
          </button>
        </div>
      </div>
    </div>
  );
}
