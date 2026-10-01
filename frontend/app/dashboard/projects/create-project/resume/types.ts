export type TemplateId = "executive" | "modern" | "ats-pro" | "minimal" | "creative" | "fresher" | "blue-header" | "classic-serif";
export type ColorOption = { name: string; value: string };
export type ResumeTemplate = { id: TemplateId; name: string; category: "Traditional" | "Contemporary" | "Creative"; columns: number; photo: boolean; description: string; recommended: boolean; defaultColor: string };
export type Experience = { id: number; company: string; role: string; location: string; startDate: string; endDate: string; description: string };
export type Education = { id: number; school: string; degree: string; location: string; startDate: string; endDate: string };
export type Project = { id: number; name: string; description: string; link: string };
export type ResumeData = { fullName: string; jobTitle: string; email: string; phone: string; location: string; city: string; country: string; pinCode: string; website: string; linkedin: string; drivingLicence: string; profilePhoto: string; summary: string; experiences: Experience[]; education: Education[]; skills: string[]; projects: Project[]; certifications: string[]; languages: string[] };
