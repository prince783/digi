"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import CatalogEditor from "@/app/dashboard/projects/create-project/catalog/components/CatalogEditor";

export default function CreateCatalogPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-sm text-muted">Loading catalog...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-page">
      <CatalogEditor
        onBack={() => router.back()}
        onComplete={() => router.push("/dashboard")}
      />
    </main>
  );
}