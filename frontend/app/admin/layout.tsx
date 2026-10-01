import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/app/lib/auth";

import AdminShell from "./AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname =
    headersList.get("x-next-pathname") ??
    headersList.get("x-invoke-path") ??
    "";

  /* ── Admin login page is public — skip auth guard ── */
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return <AdminShell>{children}</AdminShell>;
}
