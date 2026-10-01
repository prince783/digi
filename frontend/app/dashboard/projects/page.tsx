"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  buildCatalogPublicUrl,
  resolveConfiguredBaseUrl,
} from "@/lib/publicUrl";

import {
  ArrowUpDown,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit3,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Link2,
  MoreVertical,
  PackagePlus,
  Plus,
  QrCode,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";

import { ProjectsRowsSkeleton, Skeleton, SkeletonText } from "../components/Shimmer";

import type {
  LucideIcon,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type ProjectType =
  | "Digital Visiting Card"
  | "Catalog"
  | "RESUME"
  | "Biography";

type Status =
  | "Active"
  | "Draft"
  | "Expired";

/* =========================================================
   DIGITAL CARD
========================================================= */

interface BackendCard {
  _id?: string;
  userId?: string;
  username?: string;
  fullName?: string;
  companyName?: string;
  designation?: string;
  profilePhoto?: string;
  logo?: string;
  tagline?: string;
  aboutCompany?: string;
  paymentStatus?: string;
  paymentId?: string | null;
  paymentOrderId?: string | null;
  paidAt?: string | null;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string | null;
  templateId?: string;
}

/* =========================================================
   CATALOG
========================================================= */

interface BackendCatalog {
  _id?: string;
  id?: string;

  userId?: string;

  username?: string;

  fullName?: string;

  companyName?: string;

  designation?: string;

  profilePhoto?: string;

  logo?: string;

  tagline?: string;

  aboutCompany?: string;

  mobile?: string;

  phone?: string;

  whatsapp?: string;

  email?: string;

  website?: string;

  address?: string;

  googleMapLink?: string;

  company?: {
    fullName?: string;
    companyName?: string;
    designation?: string;
    profilePhoto?: string;
    logo?: string;
    tagline?: string;
    aboutCompany?: string;
    mobile?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    website?: string;
    address?: string;
    googleMapLink?: string;
    [key: string]: any;
  };

  products?: CatalogProduct[];
  productsCount?: number;

  paymentStatus?: string;

  paymentId?: string | null;

  paymentOrderId?: string | null;

  paidAt?: string | null;

  isPublished?: boolean;

  createdAt?: string;

  updatedAt?: string;

  expiresAt?: string | null;
}

interface BackendResume {
  _id?: string;
  username?: string;
  template?: string;
  paymentStatus?: string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
  resume?: { fullName?: string; jobTitle?: string; profilePhoto?: string };
}

interface CatalogProduct {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  sellingPrice?: number;
  mrp?: number;
  image?: string;
}

/* =========================================================
   PROJECT
========================================================= */

interface Project {
  id: string;

  name: string;

  url: string;

  type: ProjectType;

  status: Status;

  views: string;

  scans: string;

  shares: string;

  created: string;

  createdTime: string;

  expires: string;

  expiresTime?: string;

  image?: string;

  productCount?: number;

  originalCard?: BackendCard;

  originalCatalog?: BackendCatalog;
  originalResume?: BackendResume;
}

/* =========================================================
   TYPE STYLES
========================================================= */

const typeStyles: Record<
  ProjectType,
  string
> = {
  "Digital Visiting Card":
    "bg-[#EAF0F6] text-[#1E3A5F]",

  Catalog:
    "bg-[#fff3e8] text-[#e88a35]",

  RESUME:
    "bg-[#EAF0F6] text-[#1E3A5F]",

  Biography:
    "bg-[#EAF0F6] text-[#7A9B7E]",
};

/* =========================================================
   TYPE ICONS
========================================================= */

const typeIcons: Record<
  ProjectType,
  LucideIcon
> = {
  "Digital Visiting Card":
    ImageIcon,

  Catalog:
    BookOpen,

  RESUME:
    FileText,

  Biography:
    UserRound,
};

/* =========================================================
   STATUS STYLES
========================================================= */

const statusStyles: Record<
  Status,
  string
> = {
  Active:
    "bg-[#EAF0F6] text-[#7A9B7E]",

  Draft:
    "bg-[#FAF9F6] text-[#77736E]",

  Expired:
    "bg-[#fff0ef] text-[#e35d58]",
};

/* =========================================================
   HELPERS
========================================================= */

function formatDate(
  date?: string | null
) {
  if (!date) {
    return "-";
  }

  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return "-";
  }

  return parsed.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatTime(
  date?: string | null
) {
  if (!date) {
    return "";
  }

  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return "";
  }

  return parsed.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

/* =========================================================
   GET USER ID
========================================================= */

function getUserId(): string {
  if (
    typeof window ===
    "undefined"
  ) {
    return "";
  }

  const keys = [
    "userId",
    "user_id",
    "user",
    "currentUser",
    "authUser",
    "loggedInUser",
  ];

  const storages = [
    window.localStorage,
    window.sessionStorage,
  ];

  for (
    const storage of storages
  ) {
    for (
      const key of keys
    ) {
      try {
        const value =
          storage.getItem(
            key
          );

        if (!value) {
          continue;
        }

        /*
         * Direct ID
         */

        if (
          /^[a-fA-F0-9]{24}$/.test(
            value
          )
        ) {
          return value;
        }

        /*
         * JSON user object
         */

        try {
          const parsed =
            JSON.parse(value);

          if (
            parsed?.userId
          ) {
            return String(
              parsed.userId
            );
          }

          if (
            parsed?._id
          ) {
            return String(
              parsed._id
            );
          }

          if (
            parsed?.id
          ) {
            return String(
              parsed.id
            );
          }

          if (
            parsed?.user?._id
          ) {
            return String(
              parsed.user._id
            );
          }

          if (
            parsed?.user?.id
          ) {
            return String(
              parsed.user.id
            );
          }

          if (
            parsed?.data?._id
          ) {
            return String(
              parsed.data._id
            );
          }

          if (
            parsed?.data?.userId
          ) {
            return String(
              parsed.data.userId
            );
          }
        } catch {
          /*
           * Not JSON.
           */
        }
      } catch {
        /*
         * Ignore storage errors.
         */
      }
    }
  }

  return "";
}

/* =========================================================
   DIGITAL CARD STATUS
========================================================= */

function getProjectStatus(
  card: BackendCard
): Status {
  if (
    card.expiresAt &&
    new Date(
      card.expiresAt
    ).getTime() <
      Date.now()
  ) {
    return "Expired";
  }

  if (
    card.paymentStatus ===
      "paid" &&
    card.isPublished !== false
  ) {
    return "Active";
  }

  return "Draft";
}

/* =========================================================
   CATALOG STATUS
========================================================= */

function getCatalogStatus(
  catalog: BackendCatalog
): Status {
  if (
    catalog.expiresAt &&
    new Date(
      catalog.expiresAt
    ).getTime() <
      Date.now()
  ) {
    return "Expired";
  }

  if (
    catalog.paymentStatus ===
      "paid" &&
    catalog.isPublished !== false
  ) {
    return "Active";
  }

  return "Draft";
}

/* =========================================================
   DIGITAL CARD URL
========================================================= */

function getCardUrl(
  username?: string
) {
  if (!username) {
    return "";
  }

  if (
    typeof window ===
    "undefined"
  ) {
    return `/digitalvisitingcard/${encodeURIComponent(
      username
    )}`;
  }

  return `${window.location.origin}/digitalvisitingcard/${encodeURIComponent(
    username
  )}`;
}

/* =========================================================
   CATALOG URL
========================================================= */

function getCatalogUrl(
  username?: string
) {
  if (!username) {
    return "";
  }

  return buildCatalogPublicUrl(
    username,
    resolveConfiguredBaseUrl(
      typeof window !== "undefined" ? window.location.origin : "",
    ),
  );
}

/* =========================================================
   MAP DIGITAL CARD
========================================================= */

function mapCardToProject(
  card: BackendCard
): Project {
  const createdDate =
    card.createdAt;

  const expiresDate =
    card.expiresAt;

  return {
    id:
      card._id ||
      card.username ||
      Math.random()
        .toString(36)
        .slice(2),

    name:
      card.fullName
        ? `${card.fullName}'s Digital Card`
        : "Digital Visiting Card",

    url:
      getCardUrl(
        card.username
      ) ||
      "No username assigned",

    type:
      "Digital Visiting Card",

    status:
      getProjectStatus(card),

    views: "0",

    scans: "0",

    shares: "0",

    created:
      formatDate(
        createdDate
      ),

    createdTime:
      formatTime(
        createdDate
      ),

    expires:
      formatDate(
        expiresDate
      ),

    expiresTime: "",

    image:
      card.profilePhoto ||
      card.logo,

    originalCard:
      card,
  };
}

/* =========================================================
   MAP CATALOG
========================================================= */

function mapCatalogToProject(
  catalog: BackendCatalog
): Project {
  const createdDate =
    catalog.createdAt;

  const expiresDate =
    catalog.expiresAt;

  const company =
    catalog.company ||
    {};

  const companyName =
    catalog.companyName ||
    company.companyName;

  const fullName =
    catalog.fullName ||
    company.fullName;

  const logo =
    catalog.logo ||
    company.logo;

  const profilePhoto =
    catalog.profilePhoto ||
    company.profilePhoto;

  const username =
    catalog.username;

  const productsCount =
    typeof catalog.productsCount === "number"
      ? catalog.productsCount
      : 0;

  return {
    id:
      catalog._id ||
      catalog.id ||
      catalog.username ||
      Math.random()
        .toString(36)
        .slice(2),

    name:
      companyName
        ? `${companyName} Catalog`
        : fullName
        ? `${fullName}'s Catalog`
        : "Product Catalog",

    url:
      getCatalogUrl(
        username
      ) ||
      "No username assigned",

    type:
      "Catalog",

    status:
      getCatalogStatus(
        catalog
      ),

    views: "0",

    scans: "0",

    shares: "0",

    created:
      formatDate(
        createdDate
      ),

    createdTime:
      formatTime(
        createdDate
      ),

    expires:
      formatDate(
        expiresDate
      ),

    expiresTime: "",

    image:
      logo ||
      profilePhoto,

    productCount:
      productsCount,

    originalCatalog:
      catalog,
  };
}

function mapResumeToProject(resume: BackendResume): Project {
  const data = resume.resume || {};
  const username = resume.username || "";
  return {
    id: resume._id || "resume",
    name: data.fullName ? `${data.fullName}'s Resume` : "My Resume",
    url: username ? `/resume/${username}` : "No username assigned",
    type: "RESUME",
    status: resume.paymentStatus === "paid" && resume.isPublished ? "Active" : "Draft",
    views: "0",
    scans: "0",
    shares: "0",
    created: formatDate(resume.createdAt),
    createdTime: formatTime(resume.createdAt),
    expires: "—",
    image: data.profilePhoto,
    originalResume: resume,
  };
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function MyProjectsPage() {
  const router =
    useRouter();

  const [
    projects,
    setProjects,
  ] = useState<Project[]>(
    []
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    type,
    setType,
  ] = useState(
    "All Types"
  );

  const [
    status,
    setStatus,
  ] = useState(
    "All Status"
  );

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    copiedId,
    setCopiedId,
  ] = useState<
    string | null
  >(null);

  const [
    deletingId,
    setDeletingId,
  ] = useState<
    string | null
  >(null);

  const projectsPerPage =
    5;

  /* =======================================================
     FETCH PROJECTS
  ======================================================= */

  useEffect(() => {
    let mounted =
      true;

    async function fetchProjects() {
      try {
        setLoading(true);
        setError("");

        /*
         * Get currently logged-in user.
         */

        let userId =
          getUserId();

        /*
         * Resume never depends on userId (session-cookie scoped)
         * and has zero dependency on the cards/catalogs fetches
         * below — start it now instead of after both of those
         * finish, so it resolves in parallel with them.
         */
        const resumeRequest =
          fetch("/api/resumes/me", { cache: "no-store" });

        /*
         * =================================================
         * FIRST FETCH DIGITAL CARDS
         * =================================================
         */

        const cardsResponse =
          await fetch(
            "/api/digital-cards",
            {
              method: "GET",
              headers: {
                Accept:
                  "application/json",
              },
              cache:
                "no-store",
            }
          );

        let cards: BackendCard[] =
          [];

        if (
          cardsResponse.ok
        ) {
          const contentType =
            cardsResponse.headers.get(
              "content-type"
            ) || "";

          if (
            contentType.includes(
              "application/json"
            )
          ) {
            const data =
              await cardsResponse.json();

            if (
              Array.isArray(data)
            ) {
              cards =
                data;
            } else if (
              Array.isArray(
                data.cards
              )
            ) {
              cards =
                data.cards;
            } else if (
              Array.isArray(
                data.projects
              )
            ) {
              cards =
                data.projects;
            } else if (
              Array.isArray(
                data.data
              )
            ) {
              cards =
                data.data;
            } else if (
              data.card &&
              typeof data.card ===
                "object"
            ) {
              cards = [
                data.card,
              ];
            }
          }
        }

        /*
         * =================================================
         * GET USER ID FROM DIGITAL CARD IF NOT FOUND
         * =================================================
         */

        if (!userId) {
          const firstCard =
            cards[0];

          if (
            firstCard?.userId
          ) {
            userId =
              String(
                firstCard.userId
              );
          }
        }

        /*
         * Catalog creation also resolves the user from the authenticated
         * session, so use that source when browser storage has no ID.
         */
        if (!userId) {
          const sessionResponse = await fetch("/api/auth/me", {
              method: "GET",
              credentials: "include",
              cache: "no-store",
              headers: {
                Accept: "application/json",
              },
          });

          if (sessionResponse.ok) {
              const sessionData = await sessionResponse.json();
              const sessionUserId = [
                sessionData?.user?._id,
                sessionData?.user?.id,
                sessionData?.user?.userId,
                sessionData?.data?._id,
                sessionData?.data?.id,
                sessionData?.data?.userId,
                sessionData?._id,
                sessionData?.id,
                sessionData?.userId,
              ]
                .map((value) => String(value ?? "").trim())
                .find(Boolean);

              if (sessionUserId) {
                userId = sessionUserId;
              }
          }
        }

        /*
         * =================================================
         * FETCH CATALOGS
         * =================================================
         */

        let catalogs: BackendCatalog[] =
          [];
        let resume: BackendResume | null = null;

        if (userId) {
          const catalogsResponse =
            await fetch(
              `/api/catalogs?userId=${encodeURIComponent(
                userId
              )}`,
              {
                method:
                  "GET",

                headers: {
                  Accept:
                    "application/json",
                },

                cache:
                  "no-store",
              }

            );

          if (
            catalogsResponse.ok
          ) {
            const contentType =
              catalogsResponse.headers.get(
                "content-type"
              ) || "";

            if (
              contentType.includes(
                "application/json"
              )
            ) {
              const data =
                await catalogsResponse.json();

              if (
                Array.isArray(
                  data
                )
              ) {
                catalogs =
                  data;
              } else if (
                Array.isArray(
                  data.catalogs
                )
              ) {
                catalogs =
                  data.catalogs;
              } else if (
                Array.isArray(
                  data.projects
                )
              ) {
                catalogs =
                  data.projects;
              } else if (
                Array.isArray(
                  data.data
                )
              ) {
                catalogs =
                  data.data;
              } else if (
                data.catalog &&
                typeof data.catalog ===
                  "object"
              ) {
                catalogs = [
                  data.catalog,
                ];
              }
            }
          } else {
            const data =
              await catalogsResponse
                .json()
                .catch(
                  () => null
                );

            console.error(
              "CATALOG FETCH ERROR:",
              data
            );

            if (
              !cardsResponse.ok
            ) {
              throw new Error(
                data?.message ||
                  "Unable to load projects."
              );
            }

          }
        } else {
          console.warn(
            "No userId available for catalog listing."
          );
        }

        const resumeResponse = await resumeRequest;
        if (resumeResponse.ok) {
          const resumeData = await resumeResponse.json();
          resume = resumeData.resume || null;
        }

        if (!mounted) {
          return;
        }

        /*
         * =================================================
         * MAP DATA
         * =================================================
         */

        const mappedCards =
          cards.map(
            mapCardToProject
          );

        const mappedCatalogs =
          catalogs.map(
            mapCatalogToProject
          );
        const mappedResume = resume ? [mapResumeToProject(resume)] : [];

        /*
         * =================================================
         * COMBINE
         * =================================================
         */

        const combined = [
          ...mappedCards,
          ...mappedCatalogs,
          ...mappedResume,
        ].sort(
          (a, b) => {
            const dateA =
              a.originalCard
                ?.createdAt ||
              a.originalCatalog
                ?.createdAt ||
              "";

            const dateB =
              b.originalCard
                ?.createdAt ||
              b.originalCatalog
                ?.createdAt ||
              "";

            const timeA =
              dateA
                ? new Date(
                    dateA
                  ).getTime()
                : 0;

            const timeB =
              dateB
                ? new Date(
                    dateB
                  ).getTime()
                : 0;

            return (
              timeB - timeA
            );
          }
        );

        setProjects(
          combined
        );
      } catch (err) {
        console.error(
          "FETCH PROJECTS ERROR:",
          err
        );

        if (!mounted) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load projects."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchProjects();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredProjects =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return projects.filter(
        (project) => {
          const matchesSearch =
            !searchValue ||
            project.name
              .toLowerCase()
              .includes(
                searchValue
              ) ||
            project.url
              .toLowerCase()
              .includes(
                searchValue
              );

          const matchesType =
            type ===
              "All Types" ||
            project.type ===
              type;

          const matchesStatus =
            status ===
              "All Status" ||
            project.status ===
              status;

          return (
            matchesSearch &&
            matchesType &&
            matchesStatus
          );
        }
      );
    }, [
      projects,
      search,
      type,
      status,
    ]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredProjects.length /
          projectsPerPage
      )
    );

  const safePage =
    Math.min(
      page,
      totalPages
    );

  const paginatedProjects =
    filteredProjects.slice(
      (safePage - 1) *
        projectsPerPage,

      safePage *
        projectsPerPage
    );

  /* =======================================================
     COPY
  ======================================================= */

  const handleCopy =
    async (
      project: Project
    ) => {
      if (!project.url) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          project.url
        );

        setCopiedId(
          project.id
        );

        setTimeout(() => {
          setCopiedId(
            null
          );
        }, 2000);
      } catch (error) {
        console.error(
          "COPY ERROR:",
          error
        );

        /*
         * Fallback
         */

        try {
          const textarea =
            document.createElement(
              "textarea"
            );

          textarea.value =
            project.url;

          document.body.appendChild(
            textarea
          );

          textarea.select();

          document.execCommand(
            "copy"
          );

          document.body.removeChild(
            textarea
          );

          setCopiedId(
            project.id
          );

          setTimeout(() => {
            setCopiedId(
              null
            );
          }, 2000);
        } catch {
          alert(
            "Unable to copy link."
          );
        }
      }
    };

  /* =======================================================
     DELETE CATALOG
  ======================================================= */

  const handleToggleCatalogPublished =
    async (
      project: Project
    ) => {
      if (
        project.type !==
        "Catalog"
      ) {
        return;
      }

      const catalogId =
        project.originalCatalog
          ?._id ||
        project.originalCatalog
          ?.id;

      if (!catalogId) {
        alert(
          "Catalog ID is not available."
        );
        return;
      }

      if (project.status !== "Active") {
        return;
      }

      try {
        const userId =
          getUserId();

        const response =
          await fetch(
            "/api/catalogs",
            {
              method: "PUT",

              headers: {
                Accept:
                  "application/json",
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                catalogId,
                userId,
                isPublished: false,
              }),
            }
          );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        let data: any =
          null;

        if (
          contentType.includes(
            "application/json"
          )
        ) {
          data =
            await response.json();
        }

        if (
          !response.ok
        ) {
          throw new Error(
            data?.message ||
              "Failed to deactivate catalog."
          );
        }

        setProjects(
          (current) =>
            current.map((item) =>
              item.id === project.id
                ? {
                    ...item,
                    status: "Draft",
                    originalCatalog: item.originalCatalog
                      ? {
                          ...item.originalCatalog,
                          isPublished: false,
                        }
                      : item.originalCatalog,
                  }
                : item
            )
        );
      } catch (error) {
        console.error(
          "DEACTIVATE CATALOG ERROR:",
          error
        );

        alert(
          error instanceof Error
            ? error.message
            : "Unable to deactivate catalog."
        );
      }
    };

  const handleDeleteResume = async (project: Project) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      setDeletingId(project.id);
      const response = await fetch("/api/resumes/me", { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Unable to delete resume.");
      setProjects((current) => current.filter((item) => item.id !== project.id));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to delete resume.");
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================================================
     RESET PAGE
  ======================================================= */

  useEffect(() => {
    setPage(1);
  }, [
    search,
    type,
    status,
  ]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const totalProjects =
    projects.length;

  const activeProjects =
    projects.filter(
      (project) =>
        project.status ===
        "Active"
    ).length;

  const draftProjects =
    projects.filter(
      (project) =>
        project.status ===
        "Draft"
    ).length;

  const expiredProjects =
    projects.filter(
      (project) =>
        project.status ===
        "Expired"
    ).length;

  const catalogCount =
    projects.filter(
      (project) =>
        project.type ===
        "Catalog"
    ).length;

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#FAF9F6] px-3.5 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">

        {/* HEADER */}

        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-xl font-bold tracking-[-0.4px] text-[#121212]">
              My Projects
            </h1>

            <p className="mt-1 text-xs text-[#77736E]">
              Create, manage and track all your projects in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/projects/create-project"
              )
            }
            className="flex h-[38px] w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#1E3A5F] to-[#1E3A5F] px-4 text-sm font-semibold text-white shadow-[0_3px_8px_rgba(30,58,95,0.18)] transition hover:from-[#1E3A5F] hover:to-[#1E3A5F]"
          >
            <Plus size={16} />
            Create New
          </button>

        </div>

        {/* FILTERS */}

        <section className="mb-5 rounded-xl border border-[#E5E0D9] bg-white p-4 shadow-[0_1px_4px_rgba(21,42,71,0.025)]">

          <div className="flex flex-col gap-3 lg:flex-row">

            <div className="relative flex-1">

              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77736E]"
              />

              <input
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search projects or catalogs..."
                className="h-[38px] w-full rounded-md border border-[#E5E0D9] bg-white pl-9 pr-3 text-sm text-[#121212] outline-none transition placeholder:text-[#77736E] focus:border-[#3D6A9C]"
              />

            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1 sm:flex-initial">

                <select
                  value={type}
                  onChange={(
                    event
                  ) =>
                    setType(
                      event.target
                        .value
                    )
                  }
                  className="h-[38px] w-full sm:min-w-[170px] appearance-none rounded-md border border-[#E5E0D9] bg-white px-3 pr-9 text-sm text-[#121212] outline-none focus:border-[#3D6A9C]"
                >
                  <option>
                    All Types
                  </option>

                  <option>
                    Digital Visiting Card
                  </option>

                  <option>
                    Catalog
                  </option>

                  <option>
                    RESUME
                  </option>

                  <option>
                    Biography
                  </option>
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#77736E]"
                />

              </div>

              <div className="relative flex-1 sm:flex-initial">

                <select
                  value={status}
                  onChange={(
                    event
                  ) =>
                    setStatus(
                      event.target
                        .value
                    )
                  }
                  className="h-[38px] w-full sm:min-w-[150px] appearance-none rounded-md border border-[#E5E0D9] bg-white px-3 pr-9 text-sm text-[#121212] outline-none focus:border-[#3D6A9C]"
                >
                  <option>
                    All Status
                  </option>

                  <option>
                    Active
                  </option>

                  <option>
                    Draft
                  </option>

                  <option>
                    Expired
                  </option>
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#77736E]"
                />

              </div>
            </div>

          </div>

        </section>

        {/* SUMMARY */}

        <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

          <SummaryCard
            label="Total Projects"
            value={
              loading
                ? "..."
                : String(
                    totalProjects
                  )
            }
            icon={FileText}
            iconClass="bg-[#EAF0F6] text-[#1E3A5F]"
            loading={loading}
          />

          <SummaryCard
            label="Active Projects"
            value={
              loading
                ? "..."
                : String(
                    activeProjects
                  )
            }
            icon={Link2}
            iconClass="bg-[#EAF0F6] text-[#7A9B7E]"
            loading={loading}
          />

          <SummaryCard
            label="Draft Projects"
            value={
              loading
                ? "..."
                : String(
                    draftProjects
                  )
            }
            icon={Edit3}
            iconClass="bg-[#EAF0F6] text-[#1E3A5F]"
            loading={loading}
          />

          <SummaryCard
            label="Expired Projects"
            value={
              loading
                ? "..."
                : String(
                    expiredProjects
                  )
            }
            icon={ArrowUpDown}
            iconClass="bg-[#fff0ef] text-[#f26b67]"
            loading={loading}
          />

          <SummaryCard
            label="Catalogs"
            value={
              loading
                ? "..."
                : String(
                    catalogCount
                  )
            }
            icon={BookOpen}
            iconClass="bg-[#fff3e8] text-[#e88a35]"
            loading={loading}
          />

        </section>

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

            <p className="text-xs font-semibold text-red-700">
              Unable to load projects
            </p>

            <p className="mt-1 text-xs text-red-600">
              {error}
            </p>

          </div>
        )}

        {/* TABLE */}

        <section className="overflow-visible rounded-xl border border-[#E5E0D9] bg-white shadow-[0_1px_4px_rgba(21,42,71,0.025)]">

          <div className="hidden grid-cols-[2fr_1.25fr_1fr_1fr_1fr_45px] border-b border-[#E5E0D9] bg-[#E5E0D9] px-5 py-3 md:grid">

            <p className="text-xs font-semibold uppercase tracking-wide text-[#77736E]">
              Project
            </p>

            <p className="text-xs font-semibold uppercase tracking-wide text-[#77736E]">
              Type
            </p>

            <p className="text-xs font-semibold uppercase tracking-wide text-[#77736E]">
              Status
            </p>

            <p className="text-xs font-semibold uppercase tracking-wide text-[#77736E]">
              Created
            </p>

            <p className="text-xs font-semibold uppercase tracking-wide text-[#77736E]">
              Expires
            </p>

            <div />

          </div>

          {/* LOADING */}

          {loading && (
            <ProjectsRowsSkeleton />
          )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            paginatedProjects.length ===
              0 && (
              <div className="px-5 py-16 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#EAF0F6]">

                  <FileText
                    size={24}
                    className="text-[#1E3A5F]"
                  />

                </div>

                <h3 className="mt-4 text-sm font-bold text-[#121212]">
                  No projects found
                </h3>

                <p className="mx-auto mt-1 max-w-[420px] text-xs leading-5 text-[#77736E]">
                  No project matches your current filters.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/projects/create-project"
                    )
                  }
                  className="mt-4 inline-flex h-[36px] items-center gap-2 rounded-md bg-[#1E3A5F] px-4 text-xs font-semibold text-white hover:bg-[#1E3A5F]"
                >
                  <Plus size={15} />
                  Create New Project
                </button>

              </div>
            )}

          {/* PROJECT ROWS */}

          {!loading &&
            paginatedProjects.length >
              0 && (
              <div>

                {paginatedProjects.map(
                  (
                    project,
                    index
                  ) => {
                    const Icon =
                      typeIcons[
                        project.type
                      ];

                    return (
                      <div
                        key={
                          project.id
                        }
                        className={`px-5 py-4 ${
                          index !==
                          paginatedProjects.length -
                            1
                            ? "border-b border-[#E5E0D9]"
                            : ""
                        }`}
                      >

                        {/* DESKTOP */}

                        <div className="hidden grid-cols-[2fr_1.25fr_1fr_1fr_1fr_45px] items-center gap-3 md:grid">

                          {/* PROJECT */}

                          <div className="flex min-w-0 items-center gap-3">

                            {project.image ? (
                              <img
                                src={
                                  project.image
                                }
                                alt={
                                  project.name
                                }
                                className="h-10 w-10 shrink-0 rounded-lg object-cover"
                              />
                            ) : (
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                  project.type ===
                                  "Catalog"
                                    ? "bg-[#fff3e8]"
                                    : "bg-[#EAF0F6]"
                                }`}
                              >
                                <Icon
                                  size={
                                    18
                                  }
                                  className={
                                    project.type ===
                                    "Catalog"
                                      ? "text-[#e88a35]"
                                      : "text-[#1E3A5F]"
                                  }
                                />
                              </div>
                            )}

                            <div className="min-w-0">

                              <div className="flex items-center gap-2">

                                <p className="truncate text-xs font-semibold text-[#121212]">
                                  {
                                    project.name
                                  }
                                </p>

                                {project.type ===
                                  "Catalog" &&
                                  project.productCount !==
                                    undefined && (
                                    <span className="shrink-0 rounded-full bg-[#fff3e8] px-2 py-0.5 text-[8px] font-bold text-[#e88a35]">
                                      {
                                        project.productCount
                                      }{" "}
                                      {project.productCount ===
                                      1
                                        ? "Product"
                                        : "Products"}
                                    </span>
                                  )}

                              </div>

                              <p className="mt-1 truncate text-xs text-[#77736E]">
                                {
                                  project.url
                                }
                              </p>

                            </div>

                          </div>

                          {/* TYPE */}

                          <div>

                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold ${typeStyles[
                                project.type
                              ]}`}
                            >
                              {
                                project.type
                              }
                            </span>

                          </div>

                          {/* STATUS */}

                          <div>

                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold ${statusStyles[
                                project.status
                              ]}`}
                            >
                              {
                                project.status
                              }
                            </span>

                          </div>

                          {/* CREATED */}

                          <div>

                            <p className="text-xs font-medium text-[#121212]">
                              {
                                project.created
                              }
                            </p>

                            <p className="mt-0.5 text-[9px] text-[#77736E]">
                              {
                                project.createdTime
                              }
                            </p>

                          </div>

                          {/* EXPIRES */}

                          <div>

                            <p className="text-xs font-medium text-[#121212]">
                              {
                                project.expires
                              }
                            </p>

                          </div>

                          {/* MENU */}

                          <ProjectMenu
                            project={
                              project
                            }
                            copied={
                              copiedId ===
                              project.id
                            }
                            deleting={
                              deletingId ===
                              project.id
                            }
                            onCopy={() =>
                              handleCopy(
                                project
                              )
                            }
                            onView={() => {
                              if (
                                project.url
                              ) {
                                window.open(
                                  project.url,
                                  "_blank",
                                  "noopener,noreferrer"
                                );
                              }
                            }}
                            onEdit={() => {
                              if (
                                project.type ===
                                "Catalog"
                              ) {
                                router.push(
                                  `/dashboard/projects/create-project/catalog?edit=${encodeURIComponent(
                                    project.id
                                  )}`
                                );

                                return;
                              }

                              if (
                                project.type ===
                                "Digital Visiting Card"
                              ) {
                                router.push(
                                  `/dashboard/projects/create-project/digicards?edit=${encodeURIComponent(
                                    project.id
                                  )}`
                                );
                              }

                              if (project.type === "RESUME") {
                                router.push("/dashboard/projects/create-project/resume?mode=edit");
                              }
                            }}
                            onChangeTemplate={() => {
                            if (project.type === "RESUME") {
                              router.push("/dashboard/projects/create-project/resume?mode=template");
                            }
                            }}
                            onAddProduct={() => {
                              if (
                                project.type !==
                                "Catalog"
                              ) {
                                return;
                              }

                              router.push(
                                `/dashboard/projects/create-project/catalog?edit=${encodeURIComponent(
                                  project.id
                                )}&action=add-product`
                              );
                            }}
                            onManageProducts={() => {
                              if (
                                project.type !==
                                "Catalog"
                              ) {
                                return;
                              }

                              router.push(
                                `/dashboard/projects/create-project/catalog?edit=${encodeURIComponent(
                                  project.id
                                )}&tab=products`
                              );
                            }}
                            onDelete={() =>
                              handleDeleteResume(project)
                            }
                            onTogglePublished={() =>
                              handleToggleCatalogPublished(
                                project
                              )
                            }
                          />

                        </div>

                        {/* MOBILE */}

                        <div className="md:hidden">

                          <div className="flex items-start gap-3">

                            {project.image ? (
                              <img
                                src={
                                  project.image
                                }
                                alt={
                                  project.name
                                }
                                className="h-11 w-11 shrink-0 rounded-lg object-cover"
                              />
                            ) : (
                              <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                                  project.type ===
                                  "Catalog"
                                    ? "bg-[#fff3e8]"
                                    : "bg-[#EAF0F6]"
                                }`}
                              >
                                <Icon
                                  size={
                                    19
                                  }
                                  className={
                                    project.type ===
                                    "Catalog"
                                      ? "text-[#e88a35]"
                                      : "text-[#1E3A5F]"
                                  }
                                />
                              </div>
                            )}

                            <div className="min-w-0 flex-1">

                              <p className="truncate text-xs font-semibold text-[#121212]">
                                {
                                  project.name
                                }
                              </p>

                              <p className="mt-1 truncate text-xs text-[#77736E]">
                                {
                                  project.url
                                }
                              </p>

                              <div className="mt-2 flex flex-wrap items-center gap-2">

                                <span
                                  className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${typeStyles[
                                    project.type
                                  ]}`}
                                >
                                  {
                                    project.type
                                  }
                                </span>

                                <span
                                  className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${statusStyles[
                                    project.status
                                  ]}`}
                                >
                                  {
                                    project.status
                                  }
                                </span>

                                {project.type ===
                                  "Catalog" &&
                                  project.productCount !==
                                    undefined && (
                                    <span className="rounded-full bg-[#fff3e8] px-2.5 py-1 text-[9px] font-semibold text-[#e88a35]">
                                      {
                                        project.productCount
                                      }{" "}
                                      {project.productCount ===
                                      1
                                        ? "Product"
                                        : "Products"}
                                    </span>
                                  )}

                              </div>

                            </div>

                            <ProjectMenu
                              project={
                                project
                              }
                              copied={
                                copiedId ===
                                project.id
                              }
                              deleting={
                                deletingId ===
                                project.id
                              }
                              onCopy={() =>
                                handleCopy(
                                  project
                                )
                              }
                              onView={() => {
                                if (
                                  project.url
                                ) {
                                  window.open(
                                    project.url,
                                    "_blank",
                                    "noopener,noreferrer"
                                  );
                                }
                              }}
                              onEdit={() => {
                                if (
                                  project.type ===
                                  "Catalog"
                                ) {
                                  router.push(
                                    `/dashboard/projects/create-project/catalog?edit=${encodeURIComponent(
                                      project.id
                                    )}`
                                  );

                                  return;
                                }

                                if (
                                  project.type ===
                                  "Digital Visiting Card"
                                ) {
                                  router.push(
                                    `/dashboard/projects/create-project/digicards?edit=${encodeURIComponent(
                                      project.id
                                    )}`
                                  );
                                }

                                if (project.type === "RESUME") {
                                  router.push("/dashboard/projects/create-project/resume?mode=edit");
                                }
                              }}
                              onChangeTemplate={() => {
                              if (project.type === "RESUME") {
                                router.push("/dashboard/projects/create-project/resume?mode=template");
                              }
                              }}
                              onAddProduct={() => {
                                if (
                                  project.type ===
                                  "Catalog"
                                ) {
                                  router.push(
                                    `/dashboard/projects/create-project/catalog?edit=${encodeURIComponent(
                                      project.id
                                    )}&action=add-product`
                                  );
                                }
                              }}
                              onManageProducts={() => {
                                if (
                                  project.type ===
                                  "Catalog"
                                ) {
                                  router.push(
                                    `/dashboard/projects/create-project/catalog?edit=${encodeURIComponent(
                                      project.id
                                    )}&tab=products`
                                  );
                                }
                              }}
                              onDelete={() =>
                                project.type === "RESUME"
                                  ? handleDeleteResume(project)
                                  : handleDeleteResume(project)
                              }
                              onTogglePublished={() =>
                                handleToggleCatalogPublished(
                                  project
                                )
                              }
                            />

                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#E5E0D9] pt-3">

                            <div>

                              <p className="text-[9px] text-[#77736E]">
                                Created
                              </p>

                              <p className="mt-1 text-xs font-medium text-[#121212]">
                                {
                                  project.created
                                }
                              </p>

                            </div>

                            <div>

                              <p className="text-[9px] text-[#77736E]">
                                Expires
                              </p>

                              <p className="mt-1 text-xs font-medium text-[#121212]">
                                {
                                  project.expires
                                }
                              </p>

                            </div>

                          </div>

                          {/* CATALOG QUICK ACTIONS */}

                          {project.type ===
                            "Catalog" && (
                            <div className="mt-3 grid grid-cols-2 gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/dashboard/projects/create-project/catalog?edit=${encodeURIComponent(
                                      project.id
                                    )}&action=add-product`
                                  )
                                }
                                className="flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#E5E0D9] bg-[#E5E0D9] text-xs font-semibold text-[#1E3A5F] transition hover:bg-[#EAF0F6]"
                              >
                                <PackagePlus
                                  size={14}
                                />
                                Add Product
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/dashboard/projects/create-project/catalog?edit=${encodeURIComponent(
                                      project.id
                                    )}&tab=products`
                                  )
                                }
                                className="flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#E5E0D9] bg-white text-xs font-semibold text-[#121212] transition hover:bg-[#FAF9F6]"
                              >
                                <BookOpen
                                  size={14}
                                />
                                Products
                              </button>

                            </div>
                          )}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          {/* PAGINATION */}

          {!loading &&
            filteredProjects.length >
              0 && (
              <div className="flex items-center justify-between border-t border-[#E5E0D9] px-5 py-3">

                <p className="text-xs text-[#77736E]">

                  Showing{" "}

                  <span className="font-semibold text-[#121212]">
                    {
                      (safePage - 1) *
                        projectsPerPage +
                        1
                    }
                  </span>{" "}

                  to{" "}

                  <span className="font-semibold text-[#121212]">
                    {Math.min(
                      safePage *
                        projectsPerPage,
                      filteredProjects.length
                    )}
                  </span>{" "}

                  of{" "}

                  <span className="font-semibold text-[#121212]">
                    {
                      filteredProjects.length
                    }
                  </span>

                </p>

                <div className="flex items-center gap-1">

                  <button
                    type="button"
                    disabled={
                      safePage <=
                      1
                    }
                    onClick={() =>
                      setPage(
                        (
                          current
                        ) =>
                          Math.max(
                            1,
                            current -
                              1
                          )
                      )
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E0D9] text-[#77736E] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft
                      size={14}
                    />
                  </button>

                  <span className="flex h-7 min-w-7 items-center justify-center rounded-md bg-[#1E3A5F] px-2 text-xs font-semibold text-white">
                    {
                      safePage
                    }
                  </span>

                  <button
                    type="button"
                    disabled={
                      safePage >=
                      totalPages
                    }
                    onClick={() =>
                      setPage(
                        (
                          current
                        ) =>
                          Math.min(
                            totalPages,
                            current +
                              1
                          )
                      )
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E0D9] text-[#77736E] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight
                      size={14}
                    />
                  </button>

                </div>

              </div>
            )}

        </section>

      </div>
    </main>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
  icon: Icon,
  iconClass,
  loading = false,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  iconClass: string;
  loading?: boolean;
}) {
  return (
    <div className="flex min-h-[90px] items-center gap-4 rounded-xl border border-[#E5E0D9] bg-white px-5 shadow-[0_1px_4px_rgba(21,42,71,0.025)]">

      {loading ? (
        <>
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <SkeletonText w="w-20" className="h-2.5" />
            <Skeleton className="h-6 w-10 rounded" />
          </div>
        </>
      ) : (
        <>
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
          >
            <Icon size={19} strokeWidth={1.8} />
          </div>

          <div>

            <p className="text-xs font-medium text-[#77736E]">
              {label}
            </p>

            <p className="mt-1 text-xl font-bold leading-none tracking-[-0.5px] text-[#121212]">
              {value}
            </p>

          </div>
        </>
      )}

    </div>
  );
}

/* =========================================================
   PROJECT MENU
========================================================= */

function ProjectMenu({
  project,
  copied,
  deleting,
  onCopy,
  onEdit,
  onChangeTemplate,
  onView,
  onAddProduct,
  onManageProducts,
  onDelete,
  onTogglePublished,
}: {
  project: Project;
  copied: boolean;
  deleting: boolean;
  onCopy: () => void;
  onEdit: () => void;
  onChangeTemplate: () => void;
  onView: () => void;
  onAddProduct: () => void;
  onManageProducts: () => void;
  onDelete: () => void;
  onTogglePublished: () => void;
}) {
  const [
    open,
    setOpen,
  ] = useState(false);
  const [
    menuAbove,
    setMenuAbove,
  ] = useState(false);
  const menuButtonRef =
    useRef<HTMLButtonElement>(null);
  const menuRef =
    useRef<HTMLDivElement>(null);

  const isCatalog =
    project.type ===
    "Catalog";
  const isResume = project.type === "RESUME";
  const isActiveCatalog =
    isCatalog &&
    project.status === "Active";

  const qrProductType =
    project.type === "Digital Visiting Card"
      ? "card"
      : isCatalog
        ? "catalog"
        : isResume
          ? "resume"
          : null;

  useEffect(() => {
    if (
      !open ||
      !menuButtonRef.current ||
      !menuRef.current
    ) {
      return;
    }

    const buttonRect =
      menuButtonRef.current.getBoundingClientRect();
    const menuRect =
      menuRef.current.getBoundingClientRect();

    setMenuAbove(
      menuRect.bottom >
        window.innerHeight &&
        buttonRect.top >= menuRect.height
    );
  }, [
    open,
  ]);

  return (
    <div className="relative">

      <button
        type="button"
        aria-label={`More options for ${project.name}`}
        ref={menuButtonRef}
        onClick={() => {
          setMenuAbove(false);
          setOpen(
            (current) =>
              !current
          );
        }}
        className="flex h-8 w-8 items-center justify-center rounded-md text-[#77736E] transition hover:bg-[#FAF9F6] hover:text-[#1E3A5F]"
      >
        <MoreVertical
          size={17}
          strokeWidth={1.8}
        />
      </button>

      {open && (
        <>

          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() =>
              setOpen(false)
            }
          />

          <div
            ref={menuRef}
            className={`absolute right-0 z-30 w-48 rounded-lg border border-[#E5E0D9] bg-white p-1.5 shadow-[0_8px_25px_rgba(21,42,71,0.12)] ${
              menuAbove
                ? "bottom-9"
                : "top-9"
            }`}
          >

            {/* VIEW */}

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onView();
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-[#121212] hover:bg-[#FAF9F6]"
            >
              <ExternalLink
                size={14}
              />

              {isCatalog
                ? "View Catalog"
                : "View Project"}
            </button>

            {/* COPY */}

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onCopy();
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-[#121212] hover:bg-[#FAF9F6]"
            >
              <Copy
                size={14}
              />

              {copied
                ? "Copied!"
                : isCatalog
                ? "Copy Catalog Link"
                : "Copy Link"}
            </button>

            {/* QR CODE */}

            {qrProductType && (
              <a
                href={`/api/qr/${qrProductType}/${project.id}`}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-[#121212] hover:bg-[#FAF9F6]"
              >
                <QrCode size={14} />
                Download QR Code
              </a>
            )}

            {/* CATALOG */}

            {isCatalog && (
              <>
                <div className="my-1.5 border-t border-[#E5E0D9]" />

                <button
                  type="button"
                  onClick={() => {
                    setOpen(
                      false
                    );

                    onAddProduct();
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-[#1E3A5F] hover:bg-[#FAF9F6]"
                >
                  <PackagePlus
                    size={14}
                  />

                  Add New Product
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOpen(
                      false
                    );

                    onManageProducts();
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-[#121212] hover:bg-[#FAF9F6]"
                >
                  <BookOpen
                    size={14}
                  />

                  Manage Products
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOpen(
                      false
                    );

                    onEdit();
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-[#121212] hover:bg-[#FAF9F6]"
                >
                  <Edit3
                    size={14}
                  />

                  Edit Catalog
                </button>

                <div className="my-1.5 border-t border-[#E5E0D9]" />

                {isActiveCatalog && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onTogglePublished();
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-[#e35d58] hover:bg-[#FAF9F6]"
                  >
                    <Trash2
                      size={14}
                    />
                    Inactive
                  </button>
                )}
              </>
            )}

            {/* DIGITAL CARD */}

            {!isCatalog &&
              project.type ===
                "Digital Visiting Card" && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(
                      false
                    );

                    onEdit();
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-[#121212] hover:bg-[#FAF9F6]"
                >
                  <Edit3
                    size={14}
                  />

                  Edit Project
                </button>
              )}

            {isResume && (
              <>
                <div className="my-1.5 border-t border-[#E5E0D9]" />
                <button type="button" onClick={() => { setOpen(false); onEdit(); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-[#121212] hover:bg-[#FAF9F6]">
                  <Edit3 size={14} /> Edit Resume
                </button>
                <button type="button" onClick={() => { setOpen(false); onChangeTemplate(); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-[#121212] hover:bg-[#FAF9F6]">
                  <FileText size={14} /> Change Template
                </button>
                <button type="button" disabled={deleting} onClick={() => { setOpen(false); onDelete(); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-[#e35d58] hover:bg-[#FAF9F6] disabled:opacity-50">
                  <Trash2 size={14} /> {deleting ? "Deleting..." : "Delete Resume"}
                </button>
              </>
            )}

          </div>

        </>
      )}

    </div>
  );
}