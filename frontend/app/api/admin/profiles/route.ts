import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/app/lib/db";
import { getCurrentAdmin } from "@/app/lib/auth";
import { getGlobalProfilesDataset } from "@/app/lib/profilesSummary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   GET ADMIN PROFILES
========================================================= */

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    if (!(await getCurrentAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized.", profiles: [] },
        { status: 401 },
      );
    }

    const params = request.nextUrl.searchParams;
    const search = (params.get("search") || "").trim();
    const type = params.get("type") || "all";
    const status = params.get("status") || "all";
    const pageParam = params.get("page");
    const limitParam = params.get("limit");

    // Fetch the single source of truth dataset from MongoDB
    const { allProfiles, summary } = await getGlobalProfilesDataset();

    /* =====================================================
       APPLY FILTERS (Search, Type, Status) ONLY TO TABLE ROWS
    ===================================================== */
    let filteredProfiles = allProfiles;

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProfiles = filteredProfiles.filter(
        (p) =>
          p.fullName.toLowerCase().includes(searchLower) ||
          p.username.toLowerCase().includes(searchLower) ||
          p.email.toLowerCase().includes(searchLower) ||
          p.mobile.toLowerCase().includes(searchLower),
      );
    }

    // Type filter
    if (type && type !== "all") {
      filteredProfiles = filteredProfiles.filter((p) => p.type === type);
    }

    // Status filter
    if (status && status !== "all") {
      filteredProfiles = filteredProfiles.filter((p) => p.status === status);
    }

    /* =====================================================
       SORT (Newest First)
    ===================================================== */
    filteredProfiles.sort((a, b) => {
      const dateA = a.registrationDate
        ? new Date(a.registrationDate).getTime()
        : 0;
      const dateB = b.registrationDate
        ? new Date(b.registrationDate).getTime()
        : 0;
      return dateB - dateA;
    });

    const totalFiltered = filteredProfiles.length;

    /* =====================================================
       PAGINATION
    ===================================================== */
    let paginatedProfiles = filteredProfiles;
    let page = 1;
    let limit = totalFiltered || 10;
    let totalPages = 1;

    if (pageParam !== null || limitParam !== null) {
      page = Math.max(1, parseInt(pageParam || "1", 10));
      limit = Math.max(1, parseInt(limitParam || "10", 10));
      totalPages = Math.ceil(totalFiltered / limit) || 1;
      const startIndex = (page - 1) * limit;
      paginatedProfiles = filteredProfiles.slice(startIndex, startIndex + limit);
    }

    return NextResponse.json({
      success: true,
      profiles: paginatedProfiles,
      total: totalFiltered,
      pagination: {
        page,
        limit,
        total: totalFiltered,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      summary,
      counts: {
        total: summary.total,
        active: summary.status.active,
        expired: summary.status.expired,
        pending: summary.status.pending,
        suspended: summary.status.suspended,
      },
    });
  } catch (error) {
    console.error("ADMIN PROFILES ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch profiles",
        profiles: [],
      },
      {
        status: 500,
      },
    );
  }
}