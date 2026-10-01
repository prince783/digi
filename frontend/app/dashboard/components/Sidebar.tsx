"use client";

import React from "react";
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  Home,
  Folder,
  TrendingUp,
  User,
  Users,
  CreditCard,
  Wallet,
  Headphones,
  Settings,
  LogOut,
  X,
  Crown,
  ChevronRight,
  LayoutTemplate,
  FileText,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

interface SidebarLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
  module?: string;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  links: SidebarLink[];
}

const iconMap: Record<string, React.ReactNode> = {
  Dashboard: <Home size={18} strokeWidth={1.8} />,
  "My Projects": <Folder size={18} strokeWidth={1.8} />,
  Analytics: <TrendingUp size={18} strokeWidth={1.8} />,
  Profile: <User size={18} strokeWidth={1.8} />,
  Subscription: <CreditCard size={18} strokeWidth={1.8} />,
  Payments: <Wallet size={18} strokeWidth={1.8} />,
  Support: <Headphones size={18} strokeWidth={1.8} />,
  Settings: <Settings size={18} strokeWidth={1.8} />,
  Logout: <LogOut size={18} strokeWidth={1.8} />,

  // Admin panel labels (app/admin/AdminShell.tsx)
  "Profile Management": <Users size={18} strokeWidth={1.8} />,
  Templates: <LayoutTemplate size={18} strokeWidth={1.8} />,
  Pricing: <Crown size={18} strokeWidth={1.8} />,
  Invoices: <FileText size={18} strokeWidth={1.8} />,
};

export default function Sidebar({ open, onClose, links }: SidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (href: string) => {
    router.push(href);

    if (isMobile) {
      onClose();
    }
  };

  const isActive = (href: string) => {
    // Dashboard should be active ONLY on /dashboard
    if (href === "/dashboard" || href === "/") {
      return pathname === "/dashboard" || pathname === "/";
    }

    // Other menu items can remain active for their nested pages
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const getIcon = (link: SidebarLink) => {
    return (
      link.icon || iconMap[link.label] || <Folder size={18} strokeWidth={1.8} />
    );
  };

  const sidebarContent = (
    <Box
      sx={{
        width: {
          xs: 280,
          lg: 250,
        },
        height: "100%",
        minHeight: "100dvh",
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #E5E0D9",
        px: 1.5,
        py: 2,
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      {/* Mobile Header with Logo & Close */}
      {isMobile ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 1,
            mb: 2,
            height: 48,
          }}
        >
          <Image
            src="/logo-transparent.png"
            alt="DigiProfilo"
            width={160}
            height={48}
            priority
            style={{
              objectFit: "contain",
              width: "140px",
              height: "44px",
            }}
          />
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "#77736E",
              "&:hover": { backgroundColor: "#FAF9F6", color: "#121212" },
            }}
          >
            <X size={20} strokeWidth={1.8} />
          </IconButton>
        </Box>
      ) : (
        /* Desktop Logo */
        <Box
          sx={{
            height: 45,
            display: "flex",
            alignItems: "center",
            px: 1.5,
            mb: 2,
          }}
        >
          <Image
            src="/logo-transparent.png"
            alt="DigiProfilo"
            width={230}
            height={140}
            priority
            style={{
              objectFit: "contain",
              width: "180px",
              height: "80px",
            }}
          />
        </Box>
      )}

      {/* Navigation */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.55,
        }}
      >
        {links.map((link) => {
          const active = isActive(link.href);

          return (
            <Box
              key={link.href}
              onClick={() => handleNavigation(link.href)}
              sx={{
                height: 42,
                px: 1.25,
                borderRadius: "7px",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                cursor: "pointer",

                background: active
                  ? "linear-gradient(90deg, #1E3A5F 0%, #3D6A9C 100%)"
                  : "transparent",

                color: active ? "#FFFFFF" : "#77736E",

                transition: "all 0.2s ease",

                "&:hover": {
                  background: active
                    ? "linear-gradient(90deg, #1E3A5F 0%, #3D6A9C 100%)"
                    : "#FAF9F6",
                },

                "&:hover svg": {
                  color: active ? "#FFFFFF" : "#1E3A5F",
                },
              }}
            >
              {/* Icon */}
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  "& svg": {
                    color: active ? "#FFFFFF" : "#77736E",
                    transition: "color 0.2s ease",
                  },
                }}
              >
                {getIcon(link)}
              </Box>

              {/* Label */}
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: active ? 500 : 400,
                  color: "inherit",
                  lineHeight: 1,
                  flex: 1,
                }}
              >
                {link.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Push upgrade card to bottom */}
      <Box sx={{ flex: 1 }} />
    </Box>
  );

  // Desktop
  if (!isMobile) {
    return (
      <Box
        sx={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1200,
        }}
      >
        {sidebarContent}
      </Box>
    );
  }

  // Mobile
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: "280px",
            maxWidth: "85vw",
            height: "100%",
            maxHeight: "100dvh",
            border: "none",
            borderRadius: "0 16px 16px 0",
            overflowY: "auto",
          },
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  );
}
