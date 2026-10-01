import { redirect } from "next/navigation";

import { getCurrentUser } from "@/app/lib/auth";

import DashboardClient from "./DashboardClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardClient>
      {children}
    </DashboardClient>
  );
}