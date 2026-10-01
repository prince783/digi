"use client";

import React, { useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { NavbarSlotProvider } from "./components/NavbarSlotContext";

const SIDEBAR_LINKS = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "My Projects",
    href: "/dashboard/projects",
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
  },
  {
    label: "Subscription",
    href: "/dashboard/subscription",
  },
  {
    label: "Payments",
    href: "/dashboard/payments",
  },
  {
    label: "Support",
    href: "/dashboard/support",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
  },
];

export default function DashboardClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();

  const isMobile = useMediaQuery(
    theme.breakpoints.down("lg")
  );

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <NavbarSlotProvider>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#FAF9F6",
        }}
      >
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          links={SIDEBAR_LINKS}
        />

        <Box
          sx={{
            minHeight: "100vh",
            pl: {
              xs: 0,
              lg: "250px",
            },
            transition:
              "padding-left 0.3s ease",
          }}
        >
          <Navbar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />

          <Box
            component="main"
            sx={{
              // Matches the fixed Navbar's height (always 64px,
              // itself and its own Toolbar) at every breakpoint — the
              // 72px previously set here at sm only left an 8px gap
              // between the navbar and whatever page header comes
              // right after it (e.g. the catalog editor's own sticky
              // header), since the navbar itself never actually grows
              // to 72px at that width.
              pt: "64px",
              minHeight: "100vh",
              boxSizing: "border-box",
              width: "100%",
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </NavbarSlotProvider>
  );
}