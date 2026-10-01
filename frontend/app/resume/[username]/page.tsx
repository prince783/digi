import { notFound } from "next/navigation";
import connectDB from "@/app/lib/db";
import Resume from "@/app/models/Resume";
import { normalizeUsername } from "@/app/lib/username";
import { ResumePublicView } from "./ResumePublicView";
import { TemplateId } from "@/app/dashboard/projects/create-project/resume/types";

export const dynamic = "force-dynamic";

export default async function PublicResumePage({ params }: { params: Promise<{ username: string }> }) {
  const { username: rawUsername } = await params;
  const username = normalizeUsername(rawUsername);
  await connectDB();
  const rawResume = await Resume.findOne({ username }).lean();
  if (!rawResume) notFound();

  if (rawResume.accountStatus === "suspended") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-red-600"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M8 8l8 8" />
              <path d="M16 8l-8 8" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-ink">
            This Resume Has Been Suspended
          </h1>
          <p className="mt-2 text-sm text-muted">
            This resume is temporarily inactive. Please contact support or the administrator for assistance.
          </p>
        </div>
      </main>
    );
  }

  const isResumeExpired =
    rawResume.accountStatus === "expired" ||
    Boolean(rawResume.expiresAt && new Date() > new Date(rawResume.expiresAt));

  if (isResumeExpired) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-4">
        <div className="w-full max-w-md rounded-2xl border border-orange-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-ink">Resume Expired</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            This resume is no longer active because its subscription has expired.
          </p>
          <div className="mt-6 rounded-xl border border-orange-100 bg-orange-50 p-4">
            <p className="text-sm font-semibold text-orange-800">Subscription Expired</p>
            <p className="mt-1 text-xs leading-5 text-orange-700">
              Please contact the resume owner or administrator to renew.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (rawResume.paymentStatus !== "paid" || !rawResume.isPublished) {
    notFound();
  }

  const resume = rawResume;
  return <ResumePublicView resume={JSON.parse(JSON.stringify(resume.resume))} template={resume.template as TemplateId} color={resume.color} username={resume.username || username} />;
}
