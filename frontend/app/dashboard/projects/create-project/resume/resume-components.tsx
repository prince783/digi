"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  Trash2,
  User,
  Globe,
  X,
} from "lucide-react";
import {
  DEFAULT_BILLING,
  INDIAN_STATES,
  validateBillingFields,
  type Billing,
  type BillingErrors,
} from "@/lib/billing";
import PaymentSuccessOverlay from "@/app/components/PaymentSuccessOverlay";

/* =========================================================
   TYPES
========================================================= */

type TemplateId =
  | "executive"
  | "modern"
  | "ats-pro"
  | "minimal"
  | "creative"
  | "fresher"
  | "blue-header"
  | "classic-serif";

type ColorOption = {
  name: string;
  value: string;
};

type Experience = {
  id: number;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
};

type Education = {
  id: number;
  school: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
};

type Project = {
  id: number;
  name: string;
  description: string;
  link: string;
};

type ResumeData = {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  city: string;
  country: string;
  pinCode: string;
  website: string;
  linkedin: string;
  drivingLicence: string;
  profilePhoto: string;
  summary: string;

  experiences: Experience[];
  education: Education[];

  skills: string[];
  projects: Project[];

  certifications: string[];
  languages: string[];
};

/* =========================================================
   TEMPLATE DATA
========================================================= */

const templates = [
  {
    id: "executive" as TemplateId,
    name: "Executive",
    category: "Traditional",
    columns: 2,
    photo: true,
    description: "Premium professional resume",
    recommended: true,
    defaultColor: "#123B63",
  },
  {
    id: "modern" as TemplateId,
    name: "Modern",
    category: "Contemporary",
    columns: 2,
    photo: true,
    description: "Modern professional resume",
    recommended: true,
    defaultColor: "#2563EB",
  },
  {
    id: "ats-pro" as TemplateId,
    name: "ATS Pro",
    category: "Traditional",
    columns: 1,
    photo: false,
    description: "ATS-friendly professional resume",
    recommended: true,
    defaultColor: "#111827",
  },
  {
    id: "minimal" as TemplateId,
    name: "Minimal",
    category: "Contemporary",
    columns: 1,
    photo: false,
    description: "Clean and elegant resume",
    recommended: false,
    defaultColor: "#374151",
  },
  {
    id: "creative" as TemplateId,
    name: "Creative",
    category: "Creative",
    columns: 2,
    photo: true,
    description: "Creative resume for designers",
    recommended: false,
    defaultColor: "#7C3AED",
  },
  {
    id: "fresher" as TemplateId,
    name: "Fresher",
    category: "Contemporary",
    columns: 2,
    photo: true,
    description: "Perfect for students and freshers",
    recommended: true,
    defaultColor: "#059669",
  },
  {
    id: "blue-header" as TemplateId,
    name: "Blue Header",
    category: "Contemporary",
    columns: 1,
    photo: false,
    description: "Bold full-width header with clean sections",
    recommended: true,
    defaultColor: "#075985",
  },
  {
    id: "classic-serif" as TemplateId,
    name: "Classic Serif",
    category: "Traditional",
    columns: 1,
    photo: false,
    description: "Centered classic resume with elegant typography",
    recommended: false,
    defaultColor: "#1596dc",
  },
];

const colors: ColorOption[] = [
  { name: "Blue", value: "#123B63" },
  { name: "Green", value: "#166534" },
  { name: "Purple", value: "#7C3AED" },
  { name: "Orange", value: "#D97706" },
  { name: "Red", value: "#9F1239" },
  { name: "Navy", value: "#172554" },
];

/* =========================================================
   MAIN PAGE
========================================================= */

export default function ResumeCreatePage() {
  const [stage, setStage] = useState<"templates" | "builder">("templates");
  const [billing, setBilling] = useState<Billing>({
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateId>("modern");

  const [selectedColor, setSelectedColor] = useState("#2563EB");

  const [photoFilter, setPhotoFilter] = useState<
    "all" | "photo" | "no-photo"
  >("all");

  const [columnFilter, setColumnFilter] = useState<"all" | "1" | "2">("all");

  const [styleFilter, setStyleFilter] = useState<
    "all" | "Traditional" | "Creative" | "Contemporary"
  >("all");

  const [resume, setResume] = useState<ResumeData>({
    fullName: "Saanvi Patel",
    jobTitle: "Retail Sales Associate",
    email: "saanvipatel@sample.in",
    phone: "+91 22 1234 5677",
    location: "New Delhi, India 110034",
    city: "New Delhi",
    country: "India",
    pinCode: "110034",
    website: "www.example.com",
    linkedin: "linkedin.com/in/saanvipatel",
    drivingLicence: "",
    profilePhoto: "",
    summary:
      "Motivated Sales Associate with 5 years of experience boosting sales and customer loyalty through individualized service. Resourceful expert at learning customer needs, directing to desirable merchandise and upselling to meet sales quotas. Committed to strengthening customer experiences with positivity and professionalism when answering requests and processing sales.",

    experiences: [
      {
        id: 1,
        company: "H&M",
        role: "Retail Sales Associate",
        location: "New Delhi, India",
        startDate: "05/2016",
        endDate: "Current",
        description:
          "Effectively upsold products by introducing accessories and other add-ons, adding ₹3000 to average monthly sales.\nGenerated brand awareness and positive product impressions to increase sales 22%.\nUsed consultative sales approach to understand customer needs and recommend relevant offerings.",
      },
      {
        id: 2,
        company: "Starbucks",
        role: "Barista",
        location: "New Delhi, India",
        startDate: "01/2015",
        endDate: "03/2016",
        description:
          "Created over 60 drinks per hour with consistently positive customer satisfaction scores.\nLearned every menu preparation and numerous off-label drinks to meet all customer needs.\nUpsold baked goods and extra shots with beverages, increasing store sales ₹3800 per month.",
      },
    ],

    education: [
      {
        id: 1,
        school: "Oxford Software Institute & Oxford School of English",
        degree: "Diploma: Financial Accounting",
        location: "New Delhi, India",
        startDate: "June 2016",
        endDate: "",
      },
      {
        id: 2,
        school: "Delhi Public School",
        degree: "Senior Secondary Education",
        location: "New Delhi, India",
        startDate: "2013",
        endDate: "2015",
      },
    ],

    skills: [
      "Store opening and closing",
      "Sales expertise",
      "Accurate Money Handling",
      "Store Merchandising",
      "Loss prevention",
      "Product promotions",
      "Customer Service",
      "Team Collaboration",
    ],

    projects: [
      {
        id: 1,
        name: "Retail Sales Improvement",
        description:
          "Improved product discovery and customer engagement through consultative selling, personalized recommendations and organized merchandise displays.",
        link: "",
      },
      {
        id: 2,
        name: "Customer Loyalty Initiative",
        description:
          "Supported repeat-customer engagement by understanding customer preferences and recommending relevant products and promotions.",
        link: "",
      },
    ],

    certifications: [
      "Customer Service Excellence",
      "Retail Sales Training",
      "Financial Accounting Diploma",
    ],

    languages: ["English", "Hindi"],
  });

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const photoMatch =
        photoFilter === "all" ||
        (photoFilter === "photo" && template.photo) ||
        (photoFilter === "no-photo" && !template.photo);

      const columnMatch =
        columnFilter === "all" ||
        template.columns.toString() === columnFilter;

      const styleMatch =
        styleFilter === "all" || template.category === styleFilter;

      return photoMatch && columnMatch && styleMatch;
    });
  }, [photoFilter, columnFilter, styleFilter]);

  const selectTemplate = (id: TemplateId) => {
    setSelectedTemplate(id);

    const template = templates.find((item) => item.id === id);

    if (template) {
      setSelectedColor(template.defaultColor);
    }
  };

  const useTemplate = () => {
    setStage("builder");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateResume = <K extends keyof ResumeData>(
    field: K,
    value: ResumeData[K]
  ) => {
    setResume((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-white text-[#152A47]">
      {stage === "templates" ? (
        <TemplateSelection
          templates={filteredTemplates}
          resume={resume}
          selectedTemplate={selectedTemplate}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          selectTemplate={selectTemplate}
          useTemplate={useTemplate}
          photoFilter={photoFilter}
          setPhotoFilter={setPhotoFilter}
          columnFilter={columnFilter}
          setColumnFilter={setColumnFilter}
          styleFilter={styleFilter}
          setStyleFilter={setStyleFilter}
          clearFilters={() => {
            setPhotoFilter("all");
            setColumnFilter("all");
            setStyleFilter("all");
          }}
        />
      ) : (
        <ResumeBuilder
          resume={resume}
          updateResume={updateResume}
          billing={billing}
          setBilling={setBilling}
          selectedTemplate={selectedTemplate}
          selectedColor={selectedColor}
          onBack={() => setStage("templates")}
        />
      )}
    </div>
  );
}

/* =========================================================
   TEMPLATE SELECTION
========================================================= */

export function LegacyTemplateSelection({
  templates,
  resume,
  selectedTemplate,
  selectedColor,
  setSelectedColor,
  selectTemplate,
  useTemplate,
  photoFilter,
  setPhotoFilter,
  columnFilter,
  setColumnFilter,
  styleFilter,
  setStyleFilter,
  clearFilters,
}: {
  templates: typeof import("react") extends never ? never : any[];
  resume: ResumeData;
  selectedTemplate: TemplateId;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  selectTemplate: (id: TemplateId) => void;
  useTemplate: () => void;
  photoFilter: "all" | "photo" | "no-photo";
  setPhotoFilter: (value: "all" | "photo" | "no-photo") => void;
  columnFilter: "all" | "1" | "2";
  setColumnFilter: (value: "all" | "1" | "2") => void;
  styleFilter: "all" | "Traditional" | "Creative" | "Contemporary";
  setStyleFilter: (
    value: "all" | "Traditional" | "Creative" | "Contemporary"
  ) => void;
  clearFilters: () => void;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* TOP BORDER */}
      <div className="h-1.5 bg-[#152A47]" />

      {/* HEADER */}
      <div className="px-6 pb-8 pt-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Best templates for your resume
        </h1>

        <p className="mt-2 text-lg text-ink">
          You can always change your template later.
        </p>
      </div>

      {/* MAIN */}
      <div className="mx-auto flex max-w-[1400px] gap-8 px-6 pb-32">
        {/* FILTER SIDEBAR */}
        <aside className="hidden w-[230px] shrink-0 lg:block">
          <div className="sticky top-8">
            <div className="mb-7 flex items-center justify-between">
              <h2 className="text-xl font-bold">Filters</h2>

              <button
                onClick={clearFilters}
                className="text-sm font-medium text-primary-light underline underline-offset-2"
              >
                Clear Filters
              </button>
            </div>

            {/* HEADSHOT */}
            <FilterGroup title="Headshot">
              <FilterRadio
                label="All"
                checked={photoFilter === "all"}
                onChange={() => setPhotoFilter("all")}
              />

              <FilterRadio
                label="With photo"
                checked={photoFilter === "photo"}
                onChange={() => setPhotoFilter("photo")}
              />

              <FilterRadio
                label="Without photo"
                checked={photoFilter === "no-photo"}
                onChange={() => setPhotoFilter("no-photo")}
              />
            </FilterGroup>

            {/* COLUMNS */}
            <FilterGroup title="Columns">
              <FilterRadio
                label="All columns"
                checked={columnFilter === "all"}
                onChange={() => setColumnFilter("all")}
              />

              <FilterRadio
                label="1 Column"
                checked={columnFilter === "1"}
                onChange={() => setColumnFilter("1")}
              />

              <FilterRadio
                label="2 Columns"
                checked={columnFilter === "2"}
                onChange={() => setColumnFilter("2")}
              />
            </FilterGroup>

            {/* STYLE */}
            <FilterGroup title="Style">
              <FilterRadio
                label="All styles"
                checked={styleFilter === "all"}
                onChange={() => setStyleFilter("all")}
              />

              <FilterRadio
                label="Traditional"
                checked={styleFilter === "Traditional"}
                onChange={() => setStyleFilter("Traditional")}
              />

              <FilterRadio
                label="Creative"
                checked={styleFilter === "Creative"}
                onChange={() => setStyleFilter("Creative")}
              />

              <FilterRadio
                label="Contemporary"
                checked={styleFilter === "Contemporary"}
                onChange={() => setStyleFilter("Contemporary")}
              />
            </FilterGroup>
          </div>
        </aside>

        {/* TEMPLATE GRID */}
        <main className="min-w-0 flex-1">
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                resume={resume}
                selected={selectedTemplate === template.id}
                selectedColor={
                  selectedTemplate === template.id
                    ? selectedColor
                    : template.defaultColor
                }
                onSelect={() => selectTemplate(template.id)}
                onColorChange={(color) => {
                  selectTemplate(template.id);
                  setSelectedColor(color);
                }}
              />
            ))}
          </div>

          {templates.length === 0 && (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-line" />
                <h3 className="text-lg font-semibold">No templates found</h3>
                <p className="mt-1 text-sm text-muted">
                  Try changing your filters.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* STICKY FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-line bg-white/95 px-6 py-4 shadow-[0_-5px_20px_rgba(18,18,18,0.08)] backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-end gap-5">
          <button
            onClick={() => {}}
            className="rounded-md border border-[#E5E0D9] bg-white px-5 py-2.5 text-xs font-semibold text-[#121212] transition hover:bg-[#FAF9F6]"
          >
            Choose Later
          </button>

          <button
            onClick={useTemplate}
            className="inline-flex h-10 items-center justify-center rounded-md bg-gradient-to-r from-[#1E3A5F] to-[#1E3A5F] px-6 text-xs font-semibold text-white shadow-[0_4px_10px_rgba(30,58,95,0.18)] transition hover:from-[#1E3A5F] hover:to-[#1E3A5F]"
          >
            Use this template
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   TEMPLATE CARD
========================================================= */

function TemplateCard({
  template,
  resume,
  selected,
  selectedColor,
  onSelect,
  onColorChange,
}: {
  template: any;
  resume: ResumeData;
  selected: boolean;
  selectedColor: string;
  onSelect: () => void;
  onColorChange: (color: string) => void;
}) {
  return (
    <div>
      {/* PREVIEW */}
      <button
        onClick={onSelect}
        className={`group block w-full text-left transition ${
          selected ? "scale-[1.01]" : ""
        }`}
      >
        <div
          className={`relative aspect-[0.72] overflow-hidden border-2 bg-white shadow-sm transition ${
            selected
              ? "border-[#152A47] shadow-lg"
              : "border-line hover:border-muted hover:shadow-md"
          }`}
        >
          {template.recommended && (
            <div className="absolute bottom-7 right-0 z-20 rounded-l-md bg-[#ffb8b8] px-4 py-1.5 text-sm font-bold italic text-[#121212] shadow-sm">
              RECOMMENDED
            </div>
          )}

          <MiniResume
            template={template.id}
            color={selectedColor}
            resume={resume}
          />

          {selected && (
            <div className="absolute left-3 top-3 z-30 flex items-center gap-1 rounded-full bg-[#152A47] px-3 py-1.5 text-xs font-semibold text-white">
              <Check className="h-3.5 w-3.5" />
              Selected
            </div>
          )}
        </div>
      </button>

      {/* COLORS */}
      <div className="mt-2 flex items-center gap-2">
        {colors.map((color) => (
          <button
            key={color.value}
            onClick={() => onColorChange(color.value)}
            title={color.name}
            className={`h-7 w-7 rounded-full border-2 transition ${
              selectedColor === color.value
                ? "border-[#152A47] p-0.5"
                : "border-transparent"
            }`}
          >
            <span
              className="block h-full w-full rounded-full"
              style={{ backgroundColor: color.value }}
            />
          </button>
        ))}

        <button
          onClick={() => onSelect()}
          className="ml-1 flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white text-xs"
          title="More colors"
        >
          +
        </button>
      </div>

      {/* INFO */}
      <div className="mt-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#152A47]">{template.name}</h3>

          <span className="text-xs text-muted">
            {template.columns} {template.columns === 1 ? "Column" : "Columns"}
          </span>
        </div>

        <p className="mt-1 text-sm text-muted">
          {template.description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   MINI RESUME PREVIEW
========================================================= */

function MiniResume({
  template,
  color,
  resume,
}: {
  template: TemplateId;
  color: string;
  resume: ResumeData;
}) {
  const location =
    resume.location ||
    [resume.city, resume.country].filter(Boolean).join(", ");

  const displayName = resume.fullName || "Your Name";
  const displayTitle = resume.jobTitle || "Professional Title";

  const Photo = ({ rounded = false }: { rounded?: boolean }) => (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden bg-line ${
        rounded ? "rounded-full" : ""
      }`}
    >
      {resume.profilePhoto ? (
        <img
          src={resume.profilePhoto}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <User className="h-7 w-7 text-muted" />
      )}
    </div>
  );

  const Contact = ({ light = false }: { light?: boolean }) => (
    <div className={light ? "text-white/90" : "text-muted"}>
      {location && <div>{location}</div>}
      {resume.phone && <div>{resume.phone}</div>}
      {resume.email && <div>{resume.email}</div>}
      {resume.website && <div>{resume.website}</div>}
    </div>
  );

  const Skills = ({ light = false }: { light?: boolean }) => (
    <div className={light ? "text-white/90" : "text-muted"}>
      {resume.skills.slice(0, 8).map((skill, index) => (
        <div key={`${skill}-${index}`}>• {skill}</div>
      ))}
    </div>
  );

  const Education = () => (
    <div className="space-y-2">
      {resume.education.slice(0, 2).map((education) => (
        <div key={education.id}>
          <div className="font-bold">
            {education.degree || "Degree"}
          </div>
          <div className="text-muted">{education.school}</div>
          {education.location && (
            <div className="text-muted">{education.location}</div>
          )}
          <div className="text-muted">
            {education.startDate}
            {education.endDate ? ` — ${education.endDate}` : ""}
          </div>
        </div>
      ))}
    </div>
  );

  const Experience = () => (
    <div className="space-y-3">
      {resume.experiences.slice(0, 2).map((experience) => (
        <div key={experience.id}>
          <div className="font-bold">
            {experience.role || "Job Title"}
          </div>
          <div className="text-muted">
            {experience.company}
            {experience.location ? ` · ${experience.location}` : ""}
          </div>
          <div className="text-muted">
            {experience.startDate} — {experience.endDate}
          </div>
          {experience.description && (
            <div className="mt-1 line-clamp-4 whitespace-pre-line text-muted">
              {experience.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const Projects = () => (
    <div className="space-y-2">
      {resume.projects.slice(0, 2).map((project) => (
        <div key={project.id}>
          <div className="font-bold">{project.name || "Project"}</div>
          <div className="line-clamp-3 text-muted">
            {project.description}
          </div>
        </div>
      ))}
    </div>
  );

  const Certifications = () => (
    <div>
      {resume.certifications.slice(0, 4).map((item, index) => (
        <div key={`${item}-${index}`}>• {item}</div>
      ))}
    </div>
  );

  const Languages = ({ light = false }: { light?: boolean }) => (
    <div className={light ? "text-white/90" : "text-muted"}>
      {resume.languages.join(" • ")}
    </div>
  );

  if (template === "ats-pro") {
    return (
      <div className="h-full overflow-hidden bg-white p-[7%] font-sans text-[5px] text-ink">
        <div className="border-b-2 pb-2">
          <div className="text-xs font-bold uppercase tracking-tight">
            {displayName}
          </div>
          <div className="mt-1 text-[6px] font-semibold uppercase tracking-[1px]" style={{ color }}>
            {displayTitle}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[4px] text-muted">
            {location && <span>{location}</span>}
            {resume.phone && <span>{resume.phone}</span>}
            {resume.email && <span>{resume.email}</span>}
            {resume.website && <span>{resume.website}</span>}
          </div>
        </div>
        <MiniSection title="Education" color={color}>
          <Education />
        </MiniSection>
        <MiniSection title="Professional Summary" color={color}>
          <div className="line-clamp-5">{resume.summary}</div>
        </MiniSection>
        <MiniSection title="Skills" color={color}>
          <div className="grid grid-cols-2 gap-x-4">
            <Skills />
          </div>
        </MiniSection>
        <MiniSection title="Work History" color={color}>
          <Experience />
        </MiniSection>
        <MiniSection title="Projects & Certifications" color={color}>
          <Projects />
          <div className="mt-2"><Certifications /></div>
        </MiniSection>
      </div>
    );
  }

  if (template === "blue-header") {
    return (
      <div className="h-full overflow-hidden bg-white font-sans text-[5px] text-ink">
        <header className="p-[8%] text-center text-white" style={{ backgroundColor: color }}>
          <div className="text-sm font-bold uppercase tracking-wide">{displayName}</div>
          <div className="mt-1 text-[6px] uppercase tracking-[2px] text-white/85">{displayTitle}</div>
          <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[4px] text-white/90">
            {location && <span>{location}</span>}{resume.phone && <span>{resume.phone}</span>}
            {resume.email && <span>{resume.email}</span>}{resume.website && <span>{resume.website}</span>}
          </div>
        </header>
        <div className="p-[8%]">
          <MiniSection title="PROFILE" color={color}><div className="line-clamp-5">{resume.summary}</div></MiniSection>
          <MiniSection title="EXPERIENCE" color={color}><Experience /></MiniSection>
          <MiniSection title="EDUCATION" color={color}><Education /></MiniSection>
          <MiniSection title="SKILLS" color={color}><Skills /></MiniSection>
        </div>
      </div>
    );
  }

  if (template === "classic-serif") {
    return (
      <div className="h-full overflow-hidden bg-white p-[8%] font-serif text-[5px] text-ink">
        <header className="border-y-2 py-4 text-center" style={{ borderColor: color }}>
          <div className="text-sm font-bold uppercase tracking-wide">{displayName}</div>
          <div className="mt-1 text-[6px] uppercase tracking-[2px]" style={{ color }}>{displayTitle}</div>
          <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[4px] text-muted">
            {location && <span>{location}</span>}{resume.phone && <span>{resume.phone}</span>}{resume.email && <span>{resume.email}</span>}{resume.website && <span>{resume.website}</span>}
          </div>
        </header>
        <MiniSection title="EDUCATION" color={color}><Education /></MiniSection>
        <MiniSection title="PROFESSIONAL SUMMARY" color={color}><div className="line-clamp-5">{resume.summary}</div></MiniSection>
        <MiniSection title="SKILLS" color={color}><Skills /></MiniSection>
        <MiniSection title="WORK HISTORY" color={color}><Experience /></MiniSection>
      </div>
    );
  }

  if (template === "minimal") {
    return (
      <div className="grid h-full grid-cols-[36%_64%] overflow-hidden bg-white font-serif text-[5px] text-ink">
        <div className="p-[9%]" style={{ backgroundColor: `${color}12` }}>
          <div className="text-xs font-bold leading-tight uppercase">
            {displayName.split(" ").map((part, index) => (
              <div key={`${part}-${index}`}>{part}</div>
            ))}
          </div>
          <div className="mt-2 uppercase tracking-[1.5px]" style={{ color }}>
            {displayTitle}
          </div>
          <MiniSection title="CONTACT" color={color}>
            <Contact />
          </MiniSection>
          <MiniSection title="SKILLS" color={color}>
            <Skills />
          </MiniSection>
          <MiniSection title="LANGUAGES" color={color}>
            <Languages />
          </MiniSection>
        </div>
        <div className="p-[9%]">
          <MiniSection title="PROFILE" color={color}>
            <div className="line-clamp-7">{resume.summary}</div>
          </MiniSection>
          <MiniSection title="EXPERIENCE" color={color}>
            <Experience />
          </MiniSection>
          <MiniSection title="EDUCATION" color={color}>
            <Education />
          </MiniSection>
          <MiniSection title="PROJECTS" color={color}>
            <Projects />
          </MiniSection>
        </div>
      </div>
    );
  }

  if (template === "creative") {
    return (
      <div className="h-full overflow-hidden bg-white font-sans text-[5px]">
        <div className="p-[8%] text-white" style={{ backgroundColor: color }}>
          <div className="flex items-center gap-3">
            <Photo rounded />
            <div className="min-w-0">
              <div className="truncate text-xs font-bold">{displayName}</div>
              <div className="mt-1 truncate text-[6px] uppercase tracking-wider">{displayTitle}</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-[32%_68%]">
          <div className="bg-page p-[8%]">
            <MiniSection title="CONTACT" color={color}><Contact /></MiniSection>
            <MiniSection title="SKILLS" color={color}><Skills /></MiniSection>
            <MiniSection title="LANGUAGES" color={color}><Languages /></MiniSection>
          </div>
          <div className="p-[8%]">
            <MiniSection title="ABOUT ME" color={color}>
              <div className="line-clamp-6">{resume.summary}</div>
            </MiniSection>
            <MiniSection title="WORK HISTORY" color={color}>
              <div className="border-l-2 pl-3" style={{ borderColor: `${color}70` }}>
                <Experience />
              </div>
            </MiniSection>
            <MiniSection title="EDUCATION" color={color}><Education /></MiniSection>
            <MiniSection title="PROJECTS" color={color}><Projects /></MiniSection>
          </div>
        </div>
      </div>
    );
  }

  if (template === "fresher") {
    return (
      <div className="h-full overflow-hidden font-sans text-[5px]">
        <div className="p-[8%] text-white" style={{ backgroundColor: color }}>
          <div className="flex items-center gap-3">
            <Photo rounded />
            <div className="min-w-0">
              <div className="truncate text-xs font-bold">{displayName}</div>
              <div className="mt-1 truncate text-[6px] uppercase">{displayTitle}</div>
              <div className="mt-2"><Contact light /></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-[35%_65%]">
          <div className="p-[8%]">
            <MiniSection title="EDUCATION" color={color}><Education /></MiniSection>
            <MiniSection title="SKILLS" color={color}><Skills /></MiniSection>
            <MiniSection title="CERTIFICATIONS" color={color}><Certifications /></MiniSection>
            <MiniSection title="LANGUAGES" color={color}><Languages /></MiniSection>
          </div>
          <div className="bg-page p-[8%]">
            <MiniSection title="PROFILE" color={color}>
              <div className="line-clamp-7">{resume.summary}</div>
            </MiniSection>
            <MiniSection title="PROJECTS" color={color}><Projects /></MiniSection>
            <MiniSection title="EXPERIENCE" color={color}><Experience /></MiniSection>
          </div>
        </div>
      </div>
    );
  }

  if (template === "modern") {
    return (
      <div className="h-full overflow-hidden bg-white font-sans text-[5px]">
        <div className="p-[8%] text-white" style={{ backgroundColor: color }}>
          <div className="flex items-center gap-3">
            <Photo rounded />
            <div className="min-w-0">
              <div className="truncate text-xs font-bold">{displayName}</div>
              <div className="mt-1 truncate text-[6px] uppercase tracking-wider text-white/80">{displayTitle}</div>
              <div className="mt-2"><Contact light /></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-[58%_42%] gap-4 p-[8%]">
          <div>
            <MiniSection title="PROFESSIONAL SUMMARY" color={color}>
              <div className="line-clamp-7">{resume.summary}</div>
            </MiniSection>
            <MiniSection title="WORK HISTORY" color={color}><Experience /></MiniSection>
            <MiniSection title="PROJECTS" color={color}><Projects /></MiniSection>
          </div>
          <div>
            <MiniSection title="EDUCATION" color={color}><Education /></MiniSection>
            <MiniSection title="SKILLS" color={color}><Skills /></MiniSection>
            <MiniSection title="CERTIFICATIONS" color={color}><Certifications /></MiniSection>
            <MiniSection title="LANGUAGES" color={color}><Languages /></MiniSection>
          </div>
        </div>
      </div>
    );
  }

  // EXECUTIVE
  return (
    <div className="grid h-full grid-cols-[31%_69%] overflow-hidden font-sans text-[5px]">
      <div className="p-[8%] text-white" style={{ backgroundColor: color }}>
        <Photo />
        <div className="mt-2 text-xs font-bold leading-tight">{displayName}</div>
        <div className="mt-1 text-[5px] uppercase text-white/80">{displayTitle}</div>
        <MiniWhiteSection title="CONTACT"><Contact light /></MiniWhiteSection>
        <MiniWhiteSection title="SKILLS"><Skills light /></MiniWhiteSection>
        <MiniWhiteSection title="LANGUAGES"><Languages light /></MiniWhiteSection>
      </div>
      <div className="p-[8%]">
        <MiniSection title="PROFESSIONAL SUMMARY" color={color}>
          <div className="line-clamp-7">{resume.summary}</div>
        </MiniSection>
        <MiniSection title="WORK HISTORY" color={color}><Experience /></MiniSection>
        <MiniSection title="EDUCATION" color={color}><Education /></MiniSection>
        <MiniSection title="PROJECTS" color={color}><Projects /></MiniSection>
        <MiniSection title="CERTIFICATIONS" color={color}><Certifications /></MiniSection>
      </div>
    </div>
  );
}

function MiniSection({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <div
        className="mb-1 text-[6px] font-bold uppercase tracking-wide"
        style={{ color }}
      >
        {title}
      </div>

      <div className="leading-[1.45] text-ink">{children}</div>
    </div>
  );
}

function MiniWhiteSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <div className="mb-1 text-[6px] font-bold uppercase">
        {title}
      </div>

      <div className="leading-[1.5] text-white/90">{children}</div>
    </div>
  );
}

/* =========================================================
   FILTER COMPONENTS
========================================================= */

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-7">
      <h3 className="mb-3 text-base font-bold">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function FilterRadio({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 accent-[#152A47]"
      />

      <span>{label}</span>
    </label>
  );
}

/* =========================================================
   RESUME BUILDER
========================================================= */

export function LegacyResumeBuilder({
  resume,
  updateResume,
  billing,
  setBilling,
  selectedTemplate,
  selectedColor,
  onBack,
  onFinalize,
}: {
  resume: ResumeData;
  updateResume: <K extends keyof ResumeData>(
    field: K,
    value: ResumeData[K]
  ) => void;
  billing: Billing;
  setBilling: (billing: Billing) => void;
  selectedTemplate: TemplateId;
  selectedColor: string;
  onBack: () => void;
  onFinalize?: (username: string) => Promise<string>;
}) {
  const [billingErrors, setBillingErrors] = useState<BillingErrors>({});
  const [activeSection, setActiveSection] = useState("personal");
  const [username, setUsername] = useState("");
  const [finalizing, setFinalizing] = useState(false);
  const [finalizeError, setFinalizeError] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [paymentPrice, setPaymentPrice] = useState<number | null>(null);
  const [publicUrl, setPublicUrl] = useState("");
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const steps = [
    ["personal", "Heading"],
    ["education", "Education"],
    ["experience", "Experience"],
    ["skills", "Skills"],
    ["summary", "Summary"],
    ["finalize", "Finalize"],
  ] as const;
  const currentStepIndex = Math.max(
    steps.findIndex(([id]) => id === activeSection),
    0
  );
  const nextStep = steps[Math.min(currentStepIndex + 1, steps.length - 1)];

  useEffect(() => {
    if (activeSection !== "finalize") return;
    let cancelled = false;
    fetch("/api/resumes/pricing")
      .then(async (response) => {
        const body = (await response.json()) as { yearlyPrice?: number; totalAmount?: number };
        if (!response.ok) throw new Error("Unable to load resume pricing.");
        if (!cancelled) setPaymentPrice(body.totalAmount ?? body.yearlyPrice ?? null);
      })
      .catch((error) => {
        console.error("LOAD RESUME PRICING ERROR:", error);
        if (!cancelled) setPaymentPrice(null);
      });
    return () => {
      cancelled = true;
    };
  }, [activeSection]);

  const suggestUsername = useCallback(
    async (force = false) => {
      const rawName = (resume.fullName || "").trim();
      if (!rawName) return;
      if (username && !force) return;

      const base = rawName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9_-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 24);

      if (base.length < 3) return;

      setUsernameStatus("checking");
      for (let suffix = 0; suffix <= 99; suffix += 1) {
        const candidate = suffix === 0 ? base : `${base}-${suffix}`;
        if (candidate.length < 3 || candidate.length > 30) continue;
        try {
          const response = await fetch(
            `/api/resumes/check-username?username=${encodeURIComponent(candidate)}`,
            { cache: "no-store" },
          );
          const data = await response.json();
          if (data.available) {
            setUsername(candidate);
            setUsernameStatus("available");
            return;
          }
        } catch (err) {
          console.error("Auto suggest resume username error:", err);
          break;
        }
      }
      setUsernameStatus("idle");
    },
    [resume.fullName, username],
  );

  useEffect(() => {
    if (activeSection === "finalize" && !username && resume.fullName) {
      void suggestUsername(false);
    }
  }, [activeSection, username, resume.fullName, suggestUsername]);

  useEffect(() => {
    if (activeSection !== "finalize" || username.length < 3) {
      setUsernameStatus("idle");
      return;
    }
    const timeout = window.setTimeout(async () => {
      setUsernameStatus("checking");
      try {
        const response = await fetch(`/api/resumes/check-username?username=${encodeURIComponent(username)}`);
        const body = (await response.json()) as { available?: boolean };
        setUsernameStatus(response.ok && body.available ? "available" : "taken");
      } catch (error) {
        console.error("CHECK RESUME USERNAME ERROR:", error);
        setUsernameStatus("taken");
      }
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [activeSection, username]);

  const renderForm = () => {
    if (activeSection === "personal") {
      return <PersonalForm resume={resume} updateResume={updateResume} />;
    }
    if (activeSection === "education") {
      return <EducationForm resume={resume} updateResume={updateResume} />;
    }
    if (activeSection === "experience") {
      return <ExperienceForm resume={resume} updateResume={updateResume} />;
    }
    if (activeSection === "skills") {
      return <SkillsForm resume={resume} updateResume={updateResume} />;
    }
    if (activeSection === "summary") {
      return <SummaryForm resume={resume} updateResume={updateResume} />;
    }
    return (
      <div className="space-y-4">
        <FormTitle title="Finalize" description="Review your resume before downloading." />
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="resume-username" className="block text-sm font-semibold text-[#152A47]">
              Public username
            </label>
            {resume.fullName && (
              <button
                type="button"
                onClick={() => void suggestUsername(true)}
                className="text-xs font-semibold text-[#1E3A5F] hover:underline"
              >
                ✨ Suggest from name
              </button>
            )}
          </div>
          <input
            id="resume-username"
            value={username}
            onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
            placeholder="your-name"
            className="mt-2 h-11 w-full rounded-md border border-[#E5E0D9] px-3 font-normal outline-none focus:border-[#1E3A5F]"
            maxLength={30}
          />
        </div>
        {usernameStatus === "checking" && <p className="text-sm text-muted">Checking username...</p>}
        {usernameStatus === "available" && <p className="text-sm font-medium text-success">Yes, this username is available.</p>}
        {usernameStatus === "taken" && <p className="text-sm font-medium text-red-600">This username is not available. Please try another.</p>}
        <BillingDetailsForm billing={billing} errors={billingErrors} onChange={setBilling} />
        <div className="rounded-md border border-[#E5E0D9] bg-[#E5E0D9] p-4 text-sm">
          <p className="font-semibold">Resume publication price</p>
          <p className="mt-1 text-lg font-bold text-[#1E3A5F]">
            {paymentPrice === null ? "Loading price..." : `₹${paymentPrice.toFixed(2)}`}
          </p>
        </div>
        {/* Payment Success Overlay — shown after Razorpay verifies */}
        {showSuccessOverlay && (
          <PaymentSuccessOverlay
            productType="resume"
            customerName={resume.fullName}
            productUrl={publicUrl}
            onClose={() => setShowSuccessOverlay(false)}
          />
        )}
        {publicUrl && !showSuccessOverlay && (
          <div className="rounded-md border border-success bg-accent p-4">
            <p className="font-semibold text-success">Payment successful. Your public resume is ready.</p>
            <a className="mt-2 block break-all text-sm text-success underline" href={publicUrl} target="_blank" rel="noreferrer">{publicUrl}</a>
            <button onClick={() => window.open(publicUrl, "_blank", "noopener,noreferrer")} className="mt-3 rounded-md bg-success px-4 py-2 text-sm font-semibold text-white">Open and download PDF</button>
          </div>
        )}
        {finalizeError && <p className="text-sm text-red-600">{finalizeError}</p>}
        <button
          disabled={finalizing || usernameStatus !== "available"}
          onClick={async () => {
            const errors = validateBillingFields(billing);
            setBillingErrors(errors);
            if (Object.keys(errors).length > 0) {
              return;
            }
            setFinalizing(true);
            setFinalizeError("");
            try {
              if (!onFinalize) {
                throw new Error("Resume publishing is unavailable.");
              }
              const url = await onFinalize(username);
              setPublicUrl(new URL(url, window.location.origin).toString());
              setShowSuccessOverlay(true);
            } catch (error) {
              setFinalizeError(error instanceof Error ? error.message : "Unable to start payment.");
            } finally {
              setFinalizing(false);
            }
          }}
          className="rounded-md bg-[#1E3A5F] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {finalizing ? "Preparing payment..." : "Check username and pay"}
        </button>
        <div className="rounded-md border border-[#E5E0D9] bg-[#E5E0D9] p-4 text-sm text-[#152A47]">
          Your resume is ready to preview and download.
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#152A47] lg:flex-row">
      {/* MOBILE + TABLET STEP BAR — the desktop step sidebar
          below is `hidden ... lg:flex`, so this is the only way
          to see progress or jump between steps under lg. */}
      <div className="flex items-center gap-3 border-b border-[#E5E0D9] bg-white px-4 py-3 lg:hidden">
        <button
          onClick={onBack}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[#E5E0D9] bg-white px-3 text-xs font-semibold text-[#121212] transition hover:bg-[#FAF9F6]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Templates
        </button>

        <div className="hide-scrollbar flex flex-1 items-center gap-2 overflow-x-auto">
          {steps.map(([id, label], index) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs transition ${
                activeSection === id
                  ? "bg-[#1E3A5F] font-medium text-white"
                  : "bg-[#FAF9F6] text-[#77736E]"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                  activeSection === id
                    ? "bg-white/20 text-white"
                    : "bg-white text-[#77736E]"
                }`}
              >
                {index + 1}
              </span>
              {label}
            </button>
          ))}
        </div>
      </div>

      <aside className="hidden w-[250px] shrink-0 flex-col border-r border-[#E5E0D9] bg-white px-5 py-6 text-[#121212] lg:flex">
        <button
          onClick={onBack}
          className="mb-8 flex h-10 items-center gap-2 rounded-lg border border-[#E5E0D9] bg-white px-4 text-left text-xs font-semibold text-[#121212] transition hover:border-[#E5E0D9] hover:bg-[#E5E0D9] hover:text-[#1E3A5F]"
        >
          <ArrowLeft className="mr-2 inline h-4 w-4" />
          Templates
        </button>
        <nav className="relative">
          <div className="absolute left-[26px] top-[21px] h-[220px] border-l border-dashed border-[#E5E0D9]" />
          {steps.map(([id, label], index) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`relative z-10 mb-2 flex h-[42px] w-full items-center gap-3 rounded-[7px] px-3 text-left text-xs transition ${
                activeSection === id
                  ? "bg-gradient-to-r from-[#1E3A5F] to-[#1E3A5F] font-medium text-white shadow-[0_4px_10px_rgba(30,58,95,0.12)]"
                  : "font-normal text-[#77736E] hover:bg-[#FAF9F6] hover:text-[#1E3A5F]"
              }`}
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs ${
                activeSection === id
                  ? "border-white/70 bg-white/15 text-white"
                  : "border-[#E5E0D9] bg-white text-[#77736E]"
              }`}>
                {index + 1}
              </span>
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto text-xs leading-6 text-[#77736E]">
          <p className="transition hover:text-[#1E3A5F]">Terms and Conditions</p>
          <p className="transition hover:text-[#1E3A5F]">Privacy Policy</p>
          <p className="transition hover:text-[#1E3A5F]">Accessibility</p>
          <p className="transition hover:text-[#1E3A5F]">Contact Us</p>
          <p className="mt-4 text-[#77736E]">© 2026, Works Limited. All rights reserved.</p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-x-hidden">
        <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[minmax(600px,1fr)_440px]">
          <section className="relative px-6 pb-32 pt-8 sm:px-10 xl:px-20">
            <div className="mx-auto max-w-[900px]">
              <p className="mb-9 text-center text-xl font-medium">
                We suggest including an email and phone number.
              </p>
              {renderForm()}
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-3 border-t border-line bg-white px-6 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-10 xl:px-20">
              <button className="inline-flex h-10 items-center justify-center rounded-md bg-gradient-to-r from-[#1E3A5F] to-[#1E3A5F] px-5 text-xs font-semibold text-white shadow-[0_4px_10px_rgba(30,58,95,0.18)] transition hover:from-[#1E3A5F] hover:to-[#1E3A5F]">
                Optional: Personal details
              </button>
              <div className="flex gap-3 sm:gap-4">
                <button
                  onClick={() => setShowMobilePreview(true)}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-[#E5E0D9] bg-white px-5 text-xs font-semibold text-[#121212] transition hover:bg-[#FAF9F6] sm:flex-none"
                >
                  Preview
                </button>
                <button
                  onClick={() => setActiveSection(nextStep[0])}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-gradient-to-r from-[#1E3A5F] to-[#1E3A5F] px-5 text-xs font-semibold text-white shadow-[0_4px_10px_rgba(30,58,95,0.18)] transition hover:from-[#1E3A5F] hover:to-[#1E3A5F] sm:flex-none"
                >
                  Next: {nextStep[1]}
                </button>
              </div>
            </div>
          </section>

          <aside className="hidden border-l border-line bg-white px-8 py-8 xl:block">
            <div className="sticky top-8">
              <div className="mb-4 flex justify-end">
                <span className="rounded-full bg-[#FAF9F6] px-5 py-3 text-xs text-muted">Resume preview</span>
              </div>
              <div className="mx-auto max-h-[calc(100vh-180px)] min-h-[396px] w-[280px] overflow-x-hidden overflow-y-auto border border-[#E5E0D9] bg-white shadow-sm">
                <div className="w-[794px]" style={{ zoom: 0.353 }}>
                  <ResumeDocument resume={resume} template={selectedTemplate} color={selectedColor} />
                </div>
              </div>
              <button className="mx-auto mt-5 block text-xs font-semibold text-[#1E3A5F] underline underline-offset-2 transition hover:text-[#1E3A5F]">Change template</button>
              <p className="mx-auto mt-5 max-w-[280px] text-xs leading-5 text-ink">
                † The results are based on a study with over 1000 participants, among whom 287 used resume tools provided on our family sites.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* MOBILE PREVIEW MODAL — the live aside above is
          `hidden ... xl:block`, so this is how phone/tablet
          users see the resume without leaving the wizard. */}
      {showMobilePreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowMobilePreview(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-[320px] overflow-y-auto rounded-xl bg-white p-4 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Resume preview</p>
              <button
                onClick={() => setShowMobilePreview(false)}
                aria-label="Close preview"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-[#FAF9F6]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mx-auto max-h-[70vh] w-[280px] overflow-x-hidden overflow-y-auto border border-[#E5E0D9] bg-white">
              <div className="w-[794px]" style={{ zoom: 0.353 }}>
                <ResumeDocument resume={resume} template={selectedTemplate} color={selectedColor} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PERSONAL FORM
========================================================= */

export function LegacyPersonalForm({
  resume,
  updateResume,
}: {
  resume: ResumeData;
  updateResume: <K extends keyof ResumeData>(
    field: K,
    value: ResumeData[K]
  ) => void;
}) {
  const nameParts = resume.fullName.trim().split(/\s+/);
  const firstName = nameParts.shift() || "";
  const surname = nameParts.join(" ");
  const setName = (first: string, last: string) =>
    updateResume("fullName", `${first} ${last}`.trim());

  return (
    <div className="space-y-7">
      <p className="text-xs font-semibold text-[#152A47]">* indicates a required field</p>
      <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="order-first grid grid-cols-1 gap-6 sm:col-start-1 sm:row-span-2">
          <Input
            label="First Name"
            value={firstName}
            onChange={(value) => setName(value, surname)}
            placeholder="First name"
          />
          <Input
            label="Surname"
            value={surname}
            onChange={(value) => setName(firstName, value)}
            placeholder="Surname"
          />
        </div>

        <div className="order-last flex flex-col items-center justify-center sm:col-start-2 sm:row-start-1 sm:row-span-2">
          <div className="flex h-[124px] w-[124px] items-center justify-center bg-[#E5E0D9]">
            {resume.profilePhoto ? (
              <img src={resume.profilePhoto} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-16 w-16 text-muted" />
            )}
          </div>
          <label className="mt-5 cursor-pointer text-xs font-semibold text-[#1E3A5F] underline underline-offset-2 transition hover:text-[#1E3A5F]">
            Upload Photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) {
                  window.alert("Please choose an image smaller than 5MB.");
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === "string") {
                    updateResume("profilePhoto", reader.result);
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
        </div>

        <div className="sm:col-span-2">
          <Input
            label="Profession"
            value={resume.jobTitle}
            onChange={(value) => updateResume("jobTitle", value)}
            placeholder="Profession"
          />
        </div>

        <Input
          label="City"
          value={resume.city}
          onChange={(value) => {
            updateResume("city", value);
            updateResume("location", `${value}, ${resume.country}`.replace(/, $/, ""));
          }}
          placeholder="City"
        />
        <Input
          label="Country"
          value={resume.country}
          onChange={(value) => {
            updateResume("country", value);
            updateResume("location", `${resume.city}, ${value}`.replace(/^, /, ""));
          }}
          placeholder="Country"
        />
        <Input
          label="Pin Code"
          value={resume.pinCode}
          onChange={(value) => updateResume("pinCode", value)}
          placeholder="Pin Code"
        />
        <Input
          label="Phone"
          value={resume.phone}
          onChange={(value) => updateResume("phone", value)}
          placeholder="Phone"
        />
        <Input
          label="Email *"
          value={resume.email}
          onChange={(value) => updateResume("email", value)}
          placeholder="Email address"
        />
      </div>

      <div className="pt-2">
        <p className="mb-4 text-base font-bold">
          Add additional information to your resume <span className="font-normal">(optional)</span>
        </p>
        <div className="flex flex-wrap gap-4">
          {(["linkedin", "website", "drivingLicence"] as const).map((field) => (
            <button
              key={field}
              onClick={() => updateResume(field, resume[field] ? "" : field === "website" ? "www.example.com" : "Added")}
              className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-[#E5E0D9] bg-white px-4 text-xs font-semibold text-[#121212] transition hover:border-[#E5E0D9] hover:bg-[#E5E0D9] hover:text-[#1E3A5F]"
            >
              {field === "drivingLicence" ? "Driving licence" : field[0].toUpperCase() + field.slice(1)} <Plus className="ml-1 inline h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SUMMARY FORM
========================================================= */

export function LegacySummaryForm({
  resume,
  updateResume,
}: {
  resume: ResumeData;
  updateResume: <K extends keyof ResumeData>(
    field: K,
    value: ResumeData[K]
  ) => void;
}) {
  return (
    <div className="space-y-5">
      <FormTitle
        title="Professional Summary"
        description="Write a short introduction about yourself."
      />

      <Textarea
        label="Summary"
        value={resume.summary}
        onChange={(value) => updateResume("summary", value)}
        placeholder="Write your professional summary..."
        rows={9}
      />

      <div className="rounded-lg bg-accent p-4 text-xs leading-5 text-primary">
        <b>Tip:</b> Keep your summary between 3–5 lines and mention
        your strongest skills and career goals.
      </div>
    </div>
  );
}

/* =========================================================
   EXPERIENCE FORM
========================================================= */

export function LegacyExperienceForm({
  resume,
  updateResume,
}: {
  resume: ResumeData;
  updateResume: <K extends keyof ResumeData>(
    field: K,
    value: ResumeData[K]
  ) => void;
}) {
  const addExperience = () => {
    updateResume("experiences", [
      ...resume.experiences,
      {
        id: Date.now(),
        company: "",
        role: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  };

  const removeExperience = (id: number) => {
    updateResume(
      "experiences",
      resume.experiences.filter((item) => item.id !== id)
    );
  };

  const updateExperience = (
    id: number,
    field: keyof Experience,
    value: string
  ) => {
    updateResume(
      "experiences",
      resume.experiences.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <div className="space-y-5">
      <FormTitle
        title="Experience"
        description="Add your professional work experience."
      />

      {resume.experiences.map((experience, index) => (
        <div
          key={experience.id}
          className="rounded-xl border border-line p-4"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold">
              Experience {index + 1}
            </h3>

            <button
              onClick={() => removeExperience(experience.id)}
              className="text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <Input
              label="Job Title"
              value={experience.role}
              onChange={(value) =>
                updateExperience(experience.id, "role", value)
              }
              placeholder="Frontend Developer"
            />

            <Input
              label="Company"
              value={experience.company}
              onChange={(value) =>
                updateExperience(experience.id, "company", value)
              }
              placeholder="Company name"
            />

            <Input
              label="Location"
              value={experience.location}
              onChange={(value) =>
                updateExperience(experience.id, "location", value)
              }
              placeholder="City, Country"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start"
                value={experience.startDate}
                onChange={(value) =>
                  updateExperience(experience.id, "startDate", value)
                }
                placeholder="2024"
              />

              <Input
                label="End"
                value={experience.endDate}
                onChange={(value) =>
                  updateExperience(experience.id, "endDate", value)
                }
                placeholder="Present"
              />
            </div>

            <Textarea
              label="Description"
              value={experience.description}
              onChange={(value) =>
                updateExperience(
                  experience.id,
                  "description",
                  value
                )
              }
              placeholder="Describe your responsibilities and achievements..."
              rows={6}
            />
          </div>
        </div>
      ))}

      <AddButton onClick={addExperience}>
        Add Experience
      </AddButton>
    </div>
  );
}

/* =========================================================
   EDUCATION FORM
========================================================= */

export function LegacyEducationForm({
  resume,
  updateResume,
}: {
  resume: ResumeData;
  updateResume: <K extends keyof ResumeData>(
    field: K,
    value: ResumeData[K]
  ) => void;
}) {
  const addEducation = () => {
    updateResume("education", [
      ...resume.education,
      {
        id: Date.now(),
        school: "",
        degree: "",
        location: "",
        startDate: "",
        endDate: "",
      },
    ]);
  };

  const removeEducation = (id: number) => {
    updateResume(
      "education",
      resume.education.filter((item) => item.id !== id)
    );
  };

  const updateEducation = (
    id: number,
    field: keyof Education,
    value: string
  ) => {
    updateResume(
      "education",
      resume.education.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <div className="space-y-5">
      <FormTitle
        title="Education"
        description="Add your educational background."
      />

      {resume.education.map((education, index) => (
        <div
          key={education.id}
          className="rounded-xl border border-line p-4"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold">
              Education {index + 1}
            </h3>

            <button
              onClick={() => removeEducation(education.id)}
              className="text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <Input
              label="School / University"
              value={education.school}
              onChange={(value) =>
                updateEducation(education.id, "school", value)
              }
              placeholder="University name"
            />

            <Input
              label="Degree"
              value={education.degree}
              onChange={(value) =>
                updateEducation(education.id, "degree", value)
              }
              placeholder="Bachelor of Engineering"
            />

            <Input
              label="Location"
              value={education.location}
              onChange={(value) =>
                updateEducation(education.id, "location", value)
              }
              placeholder="City, Country"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start"
                value={education.startDate}
                onChange={(value) =>
                  updateEducation(
                    education.id,
                    "startDate",
                    value
                  )
                }
                placeholder="2021"
              />

              <Input
                label="End"
                value={education.endDate}
                onChange={(value) =>
                  updateEducation(
                    education.id,
                    "endDate",
                    value
                  )
                }
                placeholder="2025"
              />
            </div>
          </div>
        </div>
      ))}

      <AddButton onClick={addEducation}>Add Education</AddButton>
    </div>
  );
}

/* =========================================================
   SKILLS FORM
========================================================= */

export function LegacySkillsForm({
  resume,
  updateResume,
}: {
  resume: ResumeData;
  updateResume: <K extends keyof ResumeData>(
    field: K,
    value: ResumeData[K]
  ) => void;
}) {
  const [skill, setSkill] = useState("");

  const addSkill = () => {
    const clean = skill.trim();

    if (!clean) return;

    updateResume("skills", [...resume.skills, clean]);
    setSkill("");
  };

  const removeSkill = (index: number) => {
    updateResume(
      "skills",
      resume.skills.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-5">
      <FormTitle
        title="Skills"
        description="Add your strongest technical and professional skills."
      />

      <div className="flex gap-2">
        <input
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addSkill();
          }}
          placeholder="e.g. React.js"
          className="min-w-0 flex-1 rounded-lg border border-[#E5E0D9] px-3 py-2.5 text-sm outline-none transition focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10"
        />

        <button
          onClick={addSkill}
          className="inline-flex h-10 items-center justify-center rounded-md bg-gradient-to-r from-[#1E3A5F] to-[#1E3A5F] px-4 text-white shadow-[0_4px_10px_rgba(30,58,95,0.18)] transition hover:from-[#1E3A5F] hover:to-[#1E3A5F]"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {resume.skills.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="flex items-center gap-2 rounded-full bg-page px-3 py-2 text-xs font-medium"
          >
            {item}

            <button onClick={() => removeSkill(index)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   PROJECT FORM
========================================================= */

export function LegacyProjectsForm({
  resume,
  updateResume,
}: {
  resume: ResumeData;
  updateResume: <K extends keyof ResumeData>(
    field: K,
    value: ResumeData[K]
  ) => void;
}) {
  const addProject = () => {
    updateResume("projects", [
      ...resume.projects,
      {
        id: Date.now(),
        name: "",
        description: "",
        link: "",
      },
    ]);
  };

  const updateProject = (
    id: number,
    field: keyof Project,
    value: string
  ) => {
    updateResume(
      "projects",
      resume.projects.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeProject = (id: number) => {
    updateResume(
      "projects",
      resume.projects.filter((item) => item.id !== id)
    );
  };

  return (
    <div className="space-y-5">
      <FormTitle
        title="Projects"
        description="Showcase your best work."
      />

      {resume.projects.map((project, index) => (
        <div
          key={project.id}
          className="rounded-xl border border-line p-4"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold">
              Project {index + 1}
            </h3>

            <button
              onClick={() => removeProject(project.id)}
              className="text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <Input
              label="Project Name"
              value={project.name}
              onChange={(value) =>
                updateProject(project.id, "name", value)
              }
              placeholder="Project name"
            />

            <Textarea
              label="Description"
              value={project.description}
              onChange={(value) =>
                updateProject(
                  project.id,
                  "description",
                  value
                )
              }
              placeholder="Describe your project..."
              rows={5}
            />

            <Input
              label="Project Link"
              value={project.link}
              onChange={(value) =>
                updateProject(project.id, "link", value)
              }
              placeholder="https://..."
            />
          </div>
        </div>
      ))}

      <AddButton onClick={addProject}>Add Project</AddButton>
    </div>
  );
}

/* =========================================================
   SIMPLE LIST FORM
========================================================= */

export function LegacySimpleListForm({
  title,
  values,
  update,
}: {
  title: string;
  values: string[];
  update: (values: string[]) => void;
}) {
  const [value, setValue] = useState("");

  const add = () => {
    const clean = value.trim();

    if (!clean) return;

    update([...values, clean]);
    setValue("");
  };

  return (
    <div className="space-y-5">
      <FormTitle
        title={title}
        description={`Add your ${title.toLowerCase()}.`}
      />

      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
          placeholder={`Add ${title.toLowerCase()}`}
          className="min-w-0 flex-1 rounded-lg border border-[#E5E0D9] px-3 py-2.5 text-sm outline-none transition focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10"
        />

        <button
          onClick={add}
          className="inline-flex h-10 items-center justify-center rounded-md bg-gradient-to-r from-[#1E3A5F] to-[#1E3A5F] px-4 text-white shadow-[0_4px_10px_rgba(30,58,95,0.18)] transition hover:from-[#1E3A5F] hover:to-[#1E3A5F]"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-2">
        {values.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="flex items-center justify-between rounded-lg border border-line px-4 py-3 text-sm"
          >
            {item}

            <button
              onClick={() =>
                update(values.filter((_, i) => i !== index))
              }
              className="text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   RESUME DOCUMENT
========================================================= */

function PolishedResumeDocument({
  resume,
  template,
  color,
  baseClass,
}: {
  resume: ResumeData;
  template: TemplateId;
  color: string;
  baseClass: string;
}) {
  const location =
    resume.location ||
    [resume.city, resume.country, resume.pinCode].filter(Boolean).join(", ");

  const contactLine = [
    location,
    resume.phone,
    resume.email,
    resume.website,
  ].filter(Boolean);

  const photo = (
    <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden bg-page">
      {resume.profilePhoto ? (
        <img src={resume.profilePhoto} alt="" className="h-full w-full object-cover" />
      ) : (
        <User className="h-14 w-14 text-muted" />
      )}
    </div>
  );

  const sidebarContact = (
    <>
      <ContactItem icon={<MapPin />} text={location} />
      <ContactItem icon={<Phone />} text={resume.phone} />
      <ContactItem icon={<Mail />} text={resume.email} />
      <ContactItem icon={<Globe />} text={resume.website} />
      <ContactItem icon={<Globe />} text={resume.linkedin} />
    </>
  );

  const sidebarLists = (dark = false) => (
    <>
      <ResumeSideSection title="SKILLS" dark={dark}>
        {resume.skills.map((skill, index) => (
          <div key={`${skill}-${index}`} className="mb-2 text-xs leading-5">
            • {skill}
          </div>
        ))}
      </ResumeSideSection>
      <ResumeSideSection title="LANGUAGES" dark={dark}>
        {resume.languages.map((language, index) => (
          <div key={`${language}-${index}`} className="mb-2 text-xs leading-5">
            {language}
          </div>
        ))}
      </ResumeSideSection>
      <ResumeSideSection title="CERTIFICATIONS" dark={dark}>
        {resume.certifications.map((item, index) => (
          <div key={`${item}-${index}`} className="mb-2 text-xs leading-5">
            • {item}
          </div>
        ))}
      </ResumeSideSection>
    </>
  );

  if (template === "ats-pro") {
    return (
      <div className={`${baseClass} font-sans`}>
        <div className="p-12">
          <header className="border-b-2 border-ink pb-5">
            <h1 className="text-4xl font-bold uppercase tracking-tight text-ink">
              {resume.fullName || "Your Name"}
            </h1>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[4px]" style={{ color }}>
              {resume.jobTitle || "Professional Title"}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
              {contactLine.map((item, index) => (
                <span key={`${item}-${index}`}>{item}</span>
              ))}
            </div>
          </header>

          {resume.education.length > 0 && (
            <ResumeSection title="EDUCATION" color={color}>
              {resume.education.map((education) => (
                <div key={education.id} className="mb-5">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <h3 className="text-sm font-bold">{education.degree || "Degree"}</h3>
                      <p className="mt-1 text-xs font-semibold">{education.school || "University"}</p>
                      {education.location && <p className="mt-1 text-xs text-muted">{education.location}</p>}
                    </div>
                    <span className="whitespace-nowrap text-xs text-muted">
                      {education.startDate}{education.endDate ? ` - ${education.endDate}` : ""}
                    </span>
                  </div>
                </div>
              ))}
            </ResumeSection>
          )}

          {resume.summary && (
            <ResumeSection title="PROFESSIONAL SUMMARY" color={color}>
              <p className="text-sm leading-6 text-ink">{resume.summary}</p>
            </ResumeSection>
          )}

          {resume.skills.length > 0 && (
            <ResumeSection title="SKILLS" color={color}>
              <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
                {resume.skills.map((skill, index) => (
                  <div key={`${skill}-${index}`}>• {skill}</div>
                ))}
              </div>
            </ResumeSection>
          )}

          {resume.experiences.length > 0 && (
            <ResumeSection title="WORK HISTORY" color={color}>
              {resume.experiences.map((experience) => (
                <div key={experience.id} className="mb-7">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <h3 className="text-base font-bold">{experience.role || "Job Title"}</h3>
                      <p className="mt-1 text-sm font-semibold">{experience.company || "Company"}</p>
                      {experience.location && <p className="mt-1 text-xs italic text-muted">{experience.location}</p>}
                    </div>
                    <span className="whitespace-nowrap text-xs text-muted">
                      {experience.startDate} - {experience.endDate}
                    </span>
                  </div>
                  {experience.description && (
                    <div className="mt-3 whitespace-pre-line text-xs leading-5 text-muted">
                      {experience.description}
                    </div>
                  )}
                </div>
              ))}
            </ResumeSection>
          )}

          {resume.projects.length > 0 && (
            <ResumeSection title="PROJECTS" color={color}>
              {resume.projects.map((project) => (
                <div key={project.id} className="mb-5">
                  <h3 className="text-sm font-bold">{project.name || "Project Name"}</h3>
                  <p className="mt-2 text-xs leading-5 text-muted">{project.description}</p>
                  {project.link && <p className="mt-1 text-xs" style={{ color }}>{project.link}</p>}
                </div>
              ))}
            </ResumeSection>
          )}

          {resume.certifications.length > 0 && (
            <ResumeSection title="CERTIFICATIONS" color={color}>
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                {resume.certifications.map((item, index) => (
                  <div key={`${item}-${index}`}>• {item}</div>
                ))}
              </div>
            </ResumeSection>
          )}
        </div>
      </div>
    );
  }

  if (template === "blue-header") {
    return (
      <div className={`${baseClass} font-sans`}>
        <header className="p-10 text-center text-white" style={{ backgroundColor: color }}>
          <h1 className="text-4xl font-bold uppercase tracking-wide">{resume.fullName || "Your Name"}</h1>
          <p className="mt-2 text-sm uppercase tracking-[4px] text-white/85">{resume.jobTitle || "Professional Title"}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-white/90">
            {contactLine.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
            {resume.linkedin && <span>{resume.linkedin}</span>}
          </div>
        </header>
        <main className="p-11">
          {resume.summary && <ResumeSection title="PROFILE" color={color}><p className="text-sm leading-6 text-ink">{resume.summary}</p></ResumeSection>}
          {resume.experiences.length > 0 && <ResumeSection title="EXPERIENCE" color={color}>{resume.experiences.map((experience) => <div key={experience.id} className="mb-7"><div className="flex items-start justify-between gap-6"><div><h3 className="text-base font-bold">{experience.role || "Job Title"}</h3><p className="mt-1 text-sm font-semibold" style={{ color }}>{experience.company}</p><p className="mt-1 text-xs text-muted">{experience.location}</p></div><span className="whitespace-nowrap text-xs text-muted">{experience.startDate} - {experience.endDate}</span></div>{experience.description && <p className="mt-3 whitespace-pre-line text-xs leading-5 text-muted">{experience.description}</p>}</div>)}</ResumeSection>}
          <div className="grid grid-cols-2 gap-10">
            <div>{resume.education.length > 0 && <ResumeSection title="EDUCATION" color={color}>{resume.education.map((education) => <div key={education.id} className="mb-5"><h3 className="text-sm font-bold">{education.degree}</h3><p className="mt-1 text-xs">{education.school}</p><p className="mt-1 text-xs text-muted">{education.location} · {education.startDate}{education.endDate ? ` - ${education.endDate}` : ""}</p></div>)}</ResumeSection>}{resume.skills.length > 0 && <ResumeSection title="SKILLS" color={color}><div className="grid grid-cols-2 gap-2 text-xs">{resume.skills.map((skill, index) => <span key={`${skill}-${index}`}>• {skill}</span>)}</div></ResumeSection>}</div>
            <div>{resume.projects.length > 0 && <ResumeSection title="PROJECTS" color={color}>{resume.projects.map((project) => <div key={project.id} className="mb-5"><h3 className="text-sm font-bold">{project.name}</h3><p className="mt-2 text-xs leading-5 text-muted">{project.description}</p></div>)}</ResumeSection>}{resume.certifications.length > 0 && <ResumeSection title="CERTIFICATIONS" color={color}><div className="space-y-2 text-xs">{resume.certifications.map((item, index) => <div key={`${item}-${index}`}>• {item}</div>)}</div></ResumeSection>}{resume.languages.length > 0 && <ResumeSection title="LANGUAGES" color={color}><div className="space-y-2 text-xs">{resume.languages.map((item, index) => <div key={`${item}-${index}`}>{item}</div>)}</div></ResumeSection>}</div>
          </div>
        </main>
      </div>
    );
  }

  if (template === "classic-serif") {
    return (
      <div className={`${baseClass} border-[6px] border-line bg-white px-12 py-10 font-serif text-ink`}>
        <header className="border-t-2 pt-5 text-center" style={{ borderColor: `${color}80` }}>
          <h1 className="text-4xl font-bold uppercase tracking-wide" style={{ color }}>{resume.fullName || "Your Name"}</h1>
          <p className="mt-3 text-base font-bold uppercase tracking-wide text-muted">{resume.jobTitle || "Professional Title"}</p>
          <div className="mt-5 border-b-4 pb-3" style={{ borderColor: color }}>
            <div className="flex flex-wrap justify-center gap-x-2 text-xs">
              {[location, resume.phone, resume.email].filter(Boolean).map((item, index) => <span key={`${item}-${index}`}>{index > 0 && <span className="mx-2">♦</span>}{item}</span>)}
            </div>
          </div>
        </header>
        <main>
          {resume.education.length > 0 && <ClassicSection title="EDUCATION" color={color}>{resume.education.map((education) => <div key={education.id} className="mb-3 text-sm"><p><strong>{education.degree}</strong>{education.startDate && `, ${education.startDate}`}</p><p><strong>{education.school}</strong>{education.location && ` - ${education.location}`}</p></div>)}</ClassicSection>}
          {resume.summary && <ClassicSection title="PROFESSIONAL SUMMARY" color={color}><p className="text-sm leading-5">{resume.summary}</p></ClassicSection>}
          {resume.skills.length > 0 && <ClassicSection title="SKILLS" color={color}><div className="grid grid-cols-2 gap-x-16 text-sm">{resume.skills.map((skill, index) => <div key={`${skill}-${index}`} className="mb-2">• &nbsp;{skill}</div>)}</div></ClassicSection>}
          {resume.experiences.length > 0 && <ClassicSection title="WORK HISTORY" color={color}>{resume.experiences.map((experience) => <div key={experience.id} className="mb-6 text-sm"><p><strong>{experience.role}</strong>, {classicDate(experience.startDate)} - {classicDate(experience.endDate)}</p><p><strong>{experience.company}</strong>{experience.location && ` – ${experience.location}`}</p><ul className="mt-1 list-disc space-y-1 pl-6">{experience.description.split("\n").filter(Boolean).map((line, index) => <li key={`${experience.id}-${index}`}>{line}</li>)}</ul></div>)}</ClassicSection>}
        </main>
      </div>
    );
  }

  if (template === "modern") {
    return (
      <div className={`${baseClass} font-sans`}>
        <header className="p-10 text-white" style={{ backgroundColor: color }}>
          <div className="flex items-center gap-6">
            {photo}
            <div className="min-w-0">
              <h1 className="text-4xl font-bold leading-tight">{resume.fullName || "Your Name"}</h1>
              <p className="mt-2 text-base uppercase tracking-[3px] text-white/80">{resume.jobTitle || "Professional Title"}</p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/90">
                {contactLine.map((item, index) => <span key={`${item}-${index}`} className="break-all">{item}</span>)}
              </div>
            </div>
          </div>
        </header>
        <main className="grid grid-cols-[58%_42%] gap-8 p-11">
          <div>
            {resume.summary && <ResumeSection title="PROFESSIONAL SUMMARY" color={color}><p className="text-sm leading-6 text-ink">{resume.summary}</p></ResumeSection>}
            {resume.experiences.length > 0 && <ResumeSection title="WORK HISTORY" color={color}>
              {resume.experiences.map((experience) => <div key={experience.id} className="mb-7">
                <div className="flex items-start justify-between gap-4"><div><h3 className="text-base font-bold">{experience.role || "Job Title"}</h3><p className="mt-1 text-sm font-semibold" style={{ color }}>{experience.company || "Company"}</p><p className="mt-1 text-xs italic text-muted">{experience.location}</p></div><span className="whitespace-nowrap text-xs text-muted">{experience.startDate} - {experience.endDate}</span></div>
                {experience.description && <div className="mt-3 whitespace-pre-line text-xs leading-5 text-muted">{experience.description}</div>}
              </div>)}
            </ResumeSection>}
            {resume.projects.length > 0 && <ResumeSection title="PROJECTS" color={color}>{resume.projects.map((project) => <div key={project.id} className="mb-5"><h3 className="text-sm font-bold">{project.name || "Project Name"}</h3><p className="mt-2 text-xs leading-5 text-muted">{project.description}</p></div>)}</ResumeSection>}
          </div>
          <div>
            {resume.education.length > 0 && <ResumeSection title="EDUCATION" color={color}>{resume.education.map((education) => <div key={education.id} className="mb-5"><h3 className="text-sm font-bold">{education.degree || "Degree"}</h3><p className="mt-1 text-xs font-semibold" style={{ color }}>{education.school || "University"}</p><p className="mt-1 text-xs text-muted">{education.location}</p><p className="mt-1 text-xs text-muted">{education.startDate}{education.endDate ? ` - ${education.endDate}` : ""}</p></div>)}</ResumeSection>}
            <ResumeSection title="SKILLS" color={color}><div className="space-y-2">{resume.skills.map((skill, index) => <div key={`${skill}-${index}`} className="text-xs">• {skill}</div>)}</div></ResumeSection>
            <ResumeSection title="CERTIFICATIONS" color={color}><div className="space-y-2">{resume.certifications.map((item, index) => <div key={`${item}-${index}`} className="text-xs">• {item}</div>)}</div></ResumeSection>
            <ResumeSection title="LANGUAGES" color={color}><div className="space-y-2">{resume.languages.map((item, index) => <div key={`${item}-${index}`} className="text-xs">{item}</div>)}</div></ResumeSection>
          </div>
        </main>
      </div>
    );
  }

  if (template === "minimal") {
    return (
      <div className={`${baseClass} font-serif`}>
        <div className="grid min-h-[1123px] grid-cols-[34%_66%]">
          <aside className="p-10 text-[#121212]" style={{ backgroundColor: `${color}14` }}>
            <h1 className="text-4xl font-bold uppercase leading-tight">
              {resume.fullName ? resume.fullName.split(" ").map((part, index) => <span className="block" key={`${part}-${index}`}>{part}</span>) : "YOUR NAME"}
            </h1>
            <p className="mt-3 text-sm uppercase tracking-[3px]" style={{ color }}>{resume.jobTitle || "Professional Title"}</p>
            <ResumeSideSection title="CONTACT" dark>{sidebarContact}</ResumeSideSection>
            {sidebarLists(true)}
          </aside>
          <main className="p-11">
            {resume.summary && <ResumeSection title="PROFILE" color={color}><p className="text-sm leading-6 text-ink">{resume.summary}</p></ResumeSection>}
            {resume.experiences.length > 0 && <ResumeSection title="EXPERIENCE" color={color}>{resume.experiences.map((experience) => <div key={experience.id} className="mb-7"><div className="flex items-start justify-between gap-5"><div><h3 className="text-base font-bold">{experience.role || "Job Title"}</h3><p className="mt-1 text-sm" style={{ color }}>{experience.company}</p><p className="mt-1 text-xs italic text-muted">{experience.location}</p></div><span className="whitespace-nowrap text-xs text-muted">{experience.startDate} - {experience.endDate}</span></div>{experience.description && <div className="mt-3 whitespace-pre-line text-xs leading-5 text-muted">{experience.description}</div>}</div>)}</ResumeSection>}
            {resume.education.length > 0 && <ResumeSection title="EDUCATION" color={color}>{resume.education.map((education) => <div key={education.id} className="mb-5"><h3 className="text-sm font-bold">{education.degree}</h3><p className="mt-1 text-xs">{education.school}</p><p className="mt-1 text-xs text-muted">{education.location} · {education.startDate}{education.endDate ? ` - ${education.endDate}` : ""}</p></div>)}</ResumeSection>}
            {resume.projects.length > 0 && <ResumeSection title="PROJECTS" color={color}>{resume.projects.map((project) => <div key={project.id} className="mb-5"><h3 className="text-sm font-bold">{project.name}</h3><p className="mt-2 text-xs leading-5 text-muted">{project.description}</p></div>)}</ResumeSection>}
          </main>
        </div>
      </div>
    );
  }

  if (template === "creative") {
    return (
      <div className={`${baseClass} font-sans`}>
        <header className="p-10 text-white" style={{ backgroundColor: color }}>
          <div className="flex items-center gap-6">{photo}<div><h1 className="text-4xl font-bold">{resume.fullName || "Your Name"}</h1><p className="mt-2 text-sm uppercase tracking-[3px] text-white/80">{resume.jobTitle || "Creative Professional"}</p></div></div>
          {resume.summary && <p className="mt-6 max-w-2xl text-sm leading-6 text-white/85">{resume.summary}</p>}
        </header>
        <div className="grid grid-cols-[31%_69%]">
          <aside className="bg-page p-9"><ResumeSideSection title="CONTACT" dark>{sidebarContact}</ResumeSideSection>{sidebarLists(true)}</aside>
          <main className="p-10"><div className="border-l-4 pl-8" style={{ borderColor: color }}>
            {resume.experiences.length > 0 && <ResumeSection title="WORK HISTORY" color={color}>{resume.experiences.map((experience) => <div key={experience.id} className="mb-7"><div className="flex items-start justify-between gap-5"><div><h3 className="text-base font-bold">{experience.role}</h3><p className="mt-1 text-sm font-semibold" style={{ color }}>{experience.company}</p><p className="mt-1 text-xs italic text-muted">{experience.location}</p></div><span className="whitespace-nowrap text-xs text-muted">{experience.startDate} - {experience.endDate}</span></div><div className="mt-3 whitespace-pre-line text-xs leading-5 text-muted">{experience.description}</div></div>)}</ResumeSection>}
            {resume.education.length > 0 && <ResumeSection title="EDUCATION" color={color}>{resume.education.map((education) => <div key={education.id} className="mb-5"><h3 className="text-sm font-bold">{education.degree}</h3><p className="mt-1 text-xs">{education.school}</p><p className="mt-1 text-xs text-muted">{education.location} · {education.startDate}{education.endDate ? ` - ${education.endDate}` : ""}</p></div>)}</ResumeSection>}
            {resume.projects.length > 0 && <ResumeSection title="PROJECTS" color={color}>{resume.projects.map((project) => <div key={project.id} className="mb-5"><h3 className="text-sm font-bold">{project.name}</h3><p className="mt-2 text-xs leading-5 text-muted">{project.description}</p></div>)}</ResumeSection>}
          </div></main>
        </div>
      </div>
    );
  }

  if (template === "fresher") {
    return (
      <div className={`${baseClass} font-sans`}>
        <header className="p-10 text-white" style={{ backgroundColor: color }}>
          <div className="flex items-center gap-6">{photo}<div className="min-w-0"><h1 className="text-4xl font-bold">{resume.fullName || "Your Name"}</h1><p className="mt-2 text-sm uppercase tracking-[3px] text-white/80">{resume.jobTitle || "Early Career Professional"}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/90">{contactLine.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div></div></div>
        </header>
        <div className="grid grid-cols-[34%_66%]">
          <aside className="p-9" style={{ backgroundColor: `${color}10` }}>
            <ResumeSection title="EDUCATION" color={color}>{resume.education.map((education) => <div key={education.id} className="mb-5"><h3 className="text-sm font-bold">{education.degree}</h3><p className="mt-1 text-xs font-medium">{education.school}</p><p className="mt-1 text-xs text-muted">{education.location}</p><p className="mt-1 text-xs text-muted">{education.startDate}{education.endDate ? ` - ${education.endDate}` : ""}</p></div>)}</ResumeSection>
            <ResumeSection title="SKILLS" color={color}><div className="space-y-2">{resume.skills.map((skill, index) => <div key={`${skill}-${index}`} className="text-xs">• {skill}</div>)}</div></ResumeSection>
            <ResumeSection title="CERTIFICATIONS" color={color}><div className="space-y-2">{resume.certifications.map((item, index) => <div key={`${item}-${index}`} className="text-xs">• {item}</div>)}</div></ResumeSection>
            <ResumeSection title="LANGUAGES" color={color}><div className="space-y-2">{resume.languages.map((item, index) => <div key={`${item}-${index}`} className="text-xs">{item}</div>)}</div></ResumeSection>
          </aside>
          <main className="p-10">
            {resume.summary && <ResumeSection title="PROFILE" color={color}><p className="text-sm leading-6 text-ink">{resume.summary}</p></ResumeSection>}
            {resume.projects.length > 0 && <ResumeSection title="PROJECTS" color={color}>{resume.projects.map((project) => <div key={project.id} className="mb-5"><h3 className="text-sm font-bold">{project.name}</h3><p className="mt-2 text-xs leading-5 text-muted">{project.description}</p></div>)}</ResumeSection>}
            {resume.experiences.length > 0 && <ResumeSection title="EXPERIENCE" color={color}>{resume.experiences.map((experience) => <div key={experience.id} className="mb-7"><h3 className="text-base font-bold">{experience.role}</h3><p className="mt-1 text-sm font-semibold" style={{ color }}>{experience.company}</p><p className="mt-1 text-xs text-muted">{experience.location} · {experience.startDate} - {experience.endDate}</p><div className="mt-3 whitespace-pre-line text-xs leading-5 text-muted">{experience.description}</div></div>)}</ResumeSection>}
          </main>
        </div>
      </div>
    );
  }

  // EXECUTIVE
  return (
    <div className={`${baseClass} font-sans`}>
      <div className="grid min-h-[1123px] grid-cols-[31%_69%]">
        <aside className="p-9 text-white" style={{ backgroundColor: color }}>
          <div className="mb-6">{photo}</div>
          <h1 className="text-3xl font-bold leading-tight">{resume.fullName || "Your Name"}</h1>
          <p className="mt-2 text-sm uppercase tracking-[2px] text-white/80">{resume.jobTitle || "Professional Title"}</p>
          <ResumeSideSection title="CONTACT">{sidebarContact}</ResumeSideSection>
          {sidebarLists(false)}
        </aside>
        <main className="p-11">
          {resume.summary && <ResumeSection title="PROFESSIONAL SUMMARY" color={color}><p className="text-sm leading-6 text-ink">{resume.summary}</p></ResumeSection>}
          {resume.experiences.length > 0 && <ResumeSection title="WORK HISTORY" color={color}>{resume.experiences.map((experience) => <div key={experience.id} className="mb-7"><div className="flex items-start justify-between gap-5"><div><h3 className="text-base font-bold">{experience.role || "Job Title"}</h3><p className="mt-1 text-sm font-semibold" style={{ color }}>{experience.company || "Company"}</p><p className="mt-1 text-xs italic text-muted">{experience.location}</p></div><span className="whitespace-nowrap text-xs text-muted">{experience.startDate} - {experience.endDate}</span></div>{experience.description && <div className="mt-3 whitespace-pre-line text-xs leading-5 text-muted">{experience.description}</div>}</div>)}</ResumeSection>}
          {resume.education.length > 0 && <ResumeSection title="EDUCATION" color={color}>{resume.education.map((education) => <div key={education.id} className="mb-5"><div className="flex items-start justify-between gap-5"><div><h3 className="text-sm font-bold">{education.degree || "Degree"}</h3><p className="mt-1 text-xs font-semibold" style={{ color }}>{education.school || "University"}</p><p className="mt-1 text-xs text-muted">{education.location}</p></div><span className="whitespace-nowrap text-xs text-muted">{education.startDate}{education.endDate ? ` - ${education.endDate}` : ""}</span></div></div>)}</ResumeSection>}
          {resume.projects.length > 0 && <ResumeSection title="PROJECTS" color={color}>{resume.projects.map((project) => <div key={project.id} className="mb-5"><h3 className="text-sm font-bold">{project.name}</h3><p className="mt-2 text-xs leading-5 text-muted">{project.description}</p></div>)}</ResumeSection>}
        </main>
      </div>
    </div>
  );
}

function DetailedResumeContent({
  resume,
  color,
}: {
  resume: ResumeData;
  color: string;
}) {
  return (
    <div>
      {resume.education.length > 0 && (
        <ResumeSection title="EDUCATION" color={color}>
          {resume.education.map((education) => (
            <div key={education.id} className="mb-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold">
                    {education.degree || "Degree"}
                  </h3>
                  <p className="mt-1 text-xs font-semibold" style={{ color }}>
                    {education.school || "University"}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {education.location}
                  </p>
                </div>
                <span className="whitespace-nowrap text-xs text-muted">
                  {education.startDate} - {education.endDate}
                </span>
              </div>
            </div>
          ))}
        </ResumeSection>
      )}

      {resume.summary && (
        <ResumeSection title="PROFESSIONAL SUMMARY" color={color}>
          <p className="text-sm leading-6 text-ink">{resume.summary}</p>
        </ResumeSection>
      )}

      {resume.experiences.length > 0 && (
        <ResumeSection title="WORK HISTORY" color={color}>
          {resume.experiences.map((experience) => (
            <div key={experience.id} className="mb-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold">
                    {experience.role || "Job Title"}
                  </h3>
                  <p className="mt-1 text-sm font-semibold" style={{ color }}>
                    {experience.company || "Company"}
                  </p>
                  <p className="mt-1 text-xs italic text-muted">
                    {experience.location}
                  </p>
                </div>
                <span className="whitespace-nowrap text-xs text-muted">
                  {experience.startDate} - {experience.endDate}
                </span>
              </div>
              {experience.description && (
                <div className="mt-3 whitespace-pre-line text-xs leading-5 text-muted">
                  {experience.description}
                </div>
              )}
            </div>
          ))}
        </ResumeSection>
      )}

      {resume.projects.length > 0 && (
        <ResumeSection title="PROJECTS" color={color}>
          {resume.projects.map((project) => (
            <div key={project.id} className="mb-5">
              <h3 className="text-sm font-bold">
                {project.name || "Project Name"}
              </h3>
              <p className="mt-2 text-xs leading-5 text-muted">
                {project.description}
              </p>
              {project.link && (
                <p className="mt-1 text-xs" style={{ color }}>
                  {project.link}
                </p>
              )}
            </div>
          ))}
        </ResumeSection>
      )}

      {resume.certifications.length > 0 && (
        <ResumeSection title="CERTIFICATIONS" color={color}>
          <div className="space-y-2">
            {resume.certifications.map((item) => (
              <div key={item} className="text-xs">
                • {item}
              </div>
            ))}
          </div>
        </ResumeSection>
      )}
    </div>
  );
}

function ResumeContent({
  resume,
  color,
  centered = false,
  fresher = false,
}: {
  resume: ResumeData;
  color: string;
  centered?: boolean;
  fresher?: boolean;
}) {
  return (
    <div className={centered ? "text-center" : ""}>
      {resume.summary && (
        <ResumeSection title="PROFESSIONAL SUMMARY" color={color}>
          <p className="text-sm leading-6 text-ink">
            {resume.summary}
          </p>
        </ResumeSection>
      )}

      {!fresher && resume.experiences.length > 0 && (
        <ResumeSection title="WORK EXPERIENCE" color={color}>
          {resume.experiences.map((experience) => (
            <div
              key={experience.id}
              className="mb-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold">
                    {experience.role ||
                      "Job Title"}
                  </h3>

                  <p
                    className="mt-1 text-sm font-semibold"
                    style={{ color }}
                  >
                    {experience.company ||
                      "Company"}
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    {experience.location}
                  </p>
                </div>

                <span className="whitespace-nowrap text-xs text-muted">
                  {experience.startDate} -{" "}
                  {experience.endDate}
                </span>
              </div>

              {experience.description && (
                <p className="mt-3 whitespace-pre-line text-xs leading-5 text-muted">
                  {experience.description}
                </p>
              )}
            </div>
          ))}
        </ResumeSection>
      )}

      {resume.education.length > 0 && (
        <ResumeSection title="EDUCATION" color={color}>
          {resume.education.map((education) => (
            <div
              key={education.id}
              className="mb-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold">
                    {education.degree ||
                      "Degree"}
                  </h3>

                  <p
                    className="mt-1 text-xs font-semibold"
                    style={{ color }}
                  >
                    {education.school ||
                      "University"}
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    {education.location}
                  </p>
                </div>

                <span className="text-xs text-muted">
                  {education.startDate} -{" "}
                  {education.endDate}
                </span>
              </div>
            </div>
          ))}
        </ResumeSection>
      )}

      {resume.skills.length > 0 && (
        <ResumeSection title="SKILLS" color={color}>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-md border border-line px-3 py-1.5 text-xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </ResumeSection>
      )}

      {resume.projects.length > 0 && (
        <ResumeSection title="PROJECTS" color={color}>
          {resume.projects.map((project) => (
            <div
              key={project.id}
              className="mb-5"
            >
              <h3 className="text-sm font-bold">
                {project.name || "Project Name"}
              </h3>

              <p className="mt-2 text-xs leading-5 text-muted">
                {project.description}
              </p>

              {project.link && (
                <p
                  className="mt-1 text-xs"
                  style={{ color }}
                >
                  {project.link}
                </p>
              )}
            </div>
          ))}
        </ResumeSection>
      )}

      {resume.certifications.length > 0 && (
        <ResumeSection
          title="CERTIFICATIONS"
          color={color}
        >
          <div className="space-y-2">
            {resume.certifications.map((item) => (
              <div
                key={item}
                className="text-xs"
              >
                • {item}
              </div>
            ))}
          </div>
        </ResumeSection>
      )}

      {resume.languages.length > 0 && (
        <ResumeSection
          title="LANGUAGES"
          color={color}
        >
          <div className="flex flex-wrap gap-3">
            {resume.languages.map((item) => (
              <span
                key={item}
                className="text-xs"
              >
                {item}
              </span>
            ))}
          </div>
        </ResumeSection>
      )}
    </div>
  );
}

/* =========================================================
   PROFILE
========================================================= */

function ProfileBlock({
  resume,
  light,
  horizontal = false,
}: {
  resume: ResumeData;
  light?: boolean;
  color?: string;
  horizontal?: boolean;
}) {
  return (
    <div
      className={
        horizontal
          ? "flex items-center gap-6"
          : "text-center"
      }
    >
      <div
        className={`flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full ${
          light ? "bg-white/90" : "bg-page"
        }`}
      >
        {resume.profilePhoto ? (
          <img
            src={resume.profilePhoto}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <User
            className={`h-10 w-10 ${
              light
                ? "text-muted"
                : "text-line"
            }`}
          />
        )}
      </div>

      <div className={horizontal ? "" : "mt-4"}>
        <h1
          className={`text-3xl font-bold ${
            light ? "text-white" : "text-[#152A47]"
          }`}
        >
          {resume.fullName || "Your Name"}
        </h1>

        <p
          className={`mt-2 text-sm font-semibold uppercase tracking-wider ${
            light ? "text-white/80" : "text-muted"
          }`}
        >
          {resume.jobTitle || "Professional Title"}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   RESUME SECTION
========================================================= */

function ResumeSection({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center gap-3">
        <h2
          className="text-sm font-bold tracking-wider"
          style={{ color }}
        >
          {title}
        </h2>

        <div
          className="h-px flex-1"
          style={{
            backgroundColor: `${color}40`,
          }}
        />
      </div>

      {children}
    </section>
  );
}

function classicDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})$/);
  return match ? `${match[2]}/${match[1]}` : value;
}

function ClassicSection({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-7">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1" style={{ backgroundColor: `${color}90` }} />
        <h2 className="shrink-0 text-sm font-bold uppercase tracking-wide" style={{ color }}>{title}</h2>
        <span className="h-px flex-1" style={{ backgroundColor: `${color}90` }} />
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/* =========================================================
   SIDEBAR SECTION
========================================================= */

function ResumeSideSection({
  title,
  children,
  dark = false,
}: {
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <section className="mt-9">
      <h2
        className={`mb-3 text-xs font-bold tracking-[2px] ${
          dark ? "text-[#152A47]" : "text-white"
        }`}
      >
        {title}
      </h2>

      {children}
    </section>
  );
}

/* =========================================================
   CONTACT
========================================================= */

function ContactItem({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  if (!text) return null;

  return (
    <div className="mb-3 flex items-start gap-2">
      <span className="mt-0.5 shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5">
        {icon}
      </span>

      <span className="break-all text-xs leading-5">
        {text}
      </span>
    </div>
  );
}

/* =========================================================
   FORM HELPERS
========================================================= */

function BillingDetailsForm({
  billing,
  errors,
  onChange,
}: {
  billing: Billing;
  errors: BillingErrors;
  onChange: (billing: Billing) => void;
}) {
  const field = (key: keyof Billing, value: string) =>
    onChange({ ...billing, [key]: value });

  return (
    <div className="rounded-md border border-[#E5E0D9] p-4">
      <p className="text-sm font-semibold">Billing details</p>
      <p className="mt-1 text-xs text-muted">Used for your invoice.</p>

      <div className="mt-3 space-y-3">
        <div>
          <input
            value={billing.address}
            onChange={(e) => field("address", e.target.value)}
            placeholder="Address"
            className="h-11 w-full rounded-md border border-[#E5E0D9] px-3 text-sm outline-none focus:border-[#1E3A5F]"
          />
          {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <input
              value={billing.city}
              onChange={(e) => field("city", e.target.value)}
              placeholder="City"
              className="h-11 w-full rounded-md border border-[#E5E0D9] px-3 text-sm outline-none focus:border-[#1E3A5F]"
            />
            {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
          </div>

          <div>
            <select
              value={billing.state}
              onChange={(e) => field("state", e.target.value)}
              className="h-11 w-full rounded-md border border-[#E5E0D9] bg-white px-3 text-sm outline-none focus:border-[#1E3A5F]"
            >
              <option value="">Select state</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && <p className="mt-1 text-xs text-red-600">{errors.state}</p>}
          </div>
        </div>

        <div>
          <input
            value={billing.pincode}
            onChange={(e) => field("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-digit pincode"
            inputMode="numeric"
            maxLength={6}
            className="h-11 w-full rounded-md border border-[#E5E0D9] px-3 text-sm outline-none focus:border-[#1E3A5F]"
          />
          {errors.pincode && <p className="mt-1 text-xs text-red-600">{errors.pincode}</p>}
        </div>
      </div>
    </div>
  );
}

function FormTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-1 text-sm text-muted">
        {description}
      </p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-ink">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#E5E0D9] bg-white px-3 py-3.5 text-sm outline-none transition focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10"
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-ink">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none rounded-lg border border-[#E5E0D9] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10"
      />
    </div>
  );
}

export function LegacyResumeDocument({
  resume,
  template,
  color,
}: {
  resume: ResumeData;
  template: TemplateId;
  color: string;
}) {
  return (
    <PolishedResumeDocument
      resume={resume}
      template={template}
      color={color}
      baseClass="relative mx-auto min-h-[1123px] w-full bg-white"
    />
  );
}

function AddButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#E5E0D9] bg-white text-xs font-semibold text-[#121212] transition hover:border-[#E5E0D9] hover:bg-[#E5E0D9] hover:text-[#1E3A5F]"
    >
      <Plus className="h-4 w-4" />
      {children}
    </button>
  );
}

const TemplateSelection = LegacyTemplateSelection;
const ResumeBuilder = LegacyResumeBuilder;
const PersonalForm = LegacyPersonalForm;
const SummaryForm = LegacySummaryForm;
const ExperienceForm = LegacyExperienceForm;
const EducationForm = LegacyEducationForm;
const SkillsForm = LegacySkillsForm;
const ProjectsForm = LegacyProjectsForm;
const SimpleListForm = LegacySimpleListForm;
function ResumeDocument({
  resume,
  template,
  color,
}: {
  resume: ResumeData;
  template: TemplateId;
  color: string;
}) {
  return (
    <PolishedResumeDocument
      resume={resume}
      template={template}
      color={color}
      baseClass="relative mx-auto min-h-[1123px] w-full bg-white"
    />
  );
}