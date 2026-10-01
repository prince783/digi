"use client";

import React from "react";

import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  ChevronDown,
  LogOut,
  Menu as MenuIcon,
  Moon,
  Sun,
  User,
} from "lucide-react";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

import { useNavbarLeftContent } from "./NavbarSlotContext";

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}

interface UserData {
  id: string;
  phone: string;
  name: string;
  email: string;
  profilePhoto: string;
  companyName: string;
  designation: string;
  bio: string;
  isVerified: boolean;
}

export default function Navbar({
  sidebarOpen,
  setSidebarOpen,
}: NavbarProps) {
  const theme = useTheme();

  const router = useRouter();
  const pathname = usePathname();

  const navbarLeftContent = useNavbarLeftContent();

  const isMobile = useMediaQuery(
    theme.breakpoints.down("lg")
  );

  const [darkMode, setDarkMode] =
    React.useState(false);

  const [user, setUser] =
    React.useState<UserData | null>(null);

  const [loadingUser, setLoadingUser] =
    React.useState(true);

  const [profileAnchorEl, setProfileAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const profileMenuOpen =
    Boolean(profileAnchorEl);

  /*
   * Fetch logged-in user from MongoDB
   */
  React.useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoadingUser(true);

        const response = await fetch(
          "/api/auth/me",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error(
          "FETCH CURRENT USER ERROR:",
          error
        );

        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchCurrentUser();
  }, []);

  /*
   * Open profile dropdown
   */
  const handleProfileMenuOpen = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setProfileAnchorEl(event.currentTarget);
  };

  /*
   * Close profile dropdown
   */
  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  /*
   * Go to profile
   */
  const handleProfile = () => {
    handleProfileMenuClose();

    // This navbar is shared by the admin panel and the client
    // dashboard — stay inside whichever shell is currently
    // active instead of always dropping into the client one.
    router.push(
      pathname.startsWith("/admin") ? "/admin/profile" : "/dashboard/profile"
    );
  };

  /*
   * Logout
   */
  const handleLogout = async () => {
    try {
      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        setUser(null);

        handleProfileMenuClose();

        router.replace("/login");

        router.refresh();
      } else {
        console.error(
          "Logout failed:",
          data.message
        );
      }
    } catch (error) {
      console.error(
        "LOGOUT ERROR:",
        error
      );
    }
  };

  /*
   * Generate initials
   */
  const getInitials = () => {
    if (!user?.name) {
      return "U";
    }

    const initials = user.name
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();

    return initials || "U";
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          left: {
            xs: 0,
            lg: "250px",
          },

          width: {
            xs: "100%",
            lg: "calc(100% - 250px)",
          },

          height: "64px",

          backgroundColor: "#FFFFFF",

          color: "#121212",

          borderBottom:
            "1px solid #FAF9F6",

          boxShadow: "none",

          zIndex: 1100,
        }}
      >
        <Toolbar
          sx={{
            minHeight:
              "64px !important",

            height: "64px",

            px: {
              xs: 2,
              sm: 3,
              lg: 4,
            },

            justifyContent: "flex-end",

            gap: {
              xs: 1,
              sm: 2,
            },
          }}
        >
          {/* =========================
              MOBILE MENU & LOGO
              (or a page's injected left content, e.g. the
              catalog editor's own back button + title — see
              NavbarSlotContext. On mobile the logo makes room
              for it since both together would be too cramped;
              on desktop it just renders alongside nothing else,
              since this whole block is otherwise empty there.)
          ========================= */}
          {(isMobile || navbarLeftContent) && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mr: "auto",
                minWidth: 0,
                flex: "1 1 auto",
              }}
            >
              {isMobile && (
                <IconButton
                  onClick={() =>
                    setSidebarOpen(
                      !sidebarOpen
                    )
                  }
                  aria-label="Toggle navigation menu"
                  sx={{
                    width: 40,
                    height: 40,
                    color: "#77736E",
                    flexShrink: 0,
                    "&:hover": {
                      backgroundColor:
                        "#FAF9F6",
                    },
                  }}
                >
                  <MenuIcon
                    size={22}
                    strokeWidth={1.8}
                  />
                </IconButton>
              )}

              {navbarLeftContent ? (
                <Box
                  sx={{
                    minWidth: 0,
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {navbarLeftContent}
                </Box>
              ) : (
                isMobile && (
                  <Image
                    src="/logo-transparent.png"
                    alt="DigiProfilo"
                    width={120}
                    height={36}
                    priority
                    style={{
                      objectFit: "contain",
                      width: "115px",
                      height: "34px",
                    }}
                  />
                )
              )}
            </Box>
          )}

          {/* =========================
              THEME TOGGLE
          ========================= */}

          {/* =========================
              USER PROFILE
          ========================= */}

          {loadingUser ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                ml: 1,
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  backgroundColor:
                    "#FAF9F6",
                }}
              />

              <Box
                sx={{
                  display: {
                    xs: "none",
                    sm: "block",
                  },
                  width: 70,
                  height: 12,
                  borderRadius: 1,
                  backgroundColor:
                    "#FAF9F6",
                }}
              />
            </Box>
          ) : user ? (
            <>
              {/* User Button */}
              <Box
                onClick={
                  handleProfileMenuOpen
                }
                sx={{
                  display: "flex",

                  alignItems: "center",

                  gap: 1.2,

                  ml: {
                    xs: 0.3,
                    sm: 0.8,
                  },

                  cursor: "pointer",

                  py: 0.5,

                  px: 0.8,

                  borderRadius: 2,

                  transition:
                    "background-color 0.2s ease",

                  "&:hover": {
                    backgroundColor:
                      "#FAF9F6",
                  },
                }}
              >
                {/* Profile Image */}
                <Avatar
                  alt={
                    user.name || "User"
                  }
                  src={
                    user.profilePhoto ||
                    "/profile.png"
                  }
                  sx={{
                    width: 38,

                    height: 38,

                    fontSize: 14,

                    fontWeight: 600,

                    backgroundColor:
                      "#f0e8dc",

                    color: "#5c4936",

                    border:
                      "1px solid #E5E0D9",
                  }}
                >
                  {getInitials()}
                </Avatar>

                {/* Name + Designation */}
                <Box
                  sx={{
                    display: {
                      xs: "none",
                      sm: "block",
                    },

                    minWidth: 90,

                    maxWidth: 150,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 13,

                      fontWeight: 600,

                      lineHeight: 1.2,

                      color: "#121212",

                      whiteSpace:
                        "nowrap",

                      overflow:
                        "hidden",

                      textOverflow:
                        "ellipsis",
                    }}
                  >
                    {user.name ||
                      "User"}
                  </Typography>

                  {user.designation && (
                    <Typography
                      sx={{
                        fontSize: 11,

                        lineHeight: 1.3,

                        color: "#77736E",

                        mt: 0.3,

                        whiteSpace:
                          "nowrap",

                        overflow:
                          "hidden",

                        textOverflow:
                          "ellipsis",
                      }}
                    >
                      {user.designation}
                    </Typography>
                  )}
                </Box>

                <ChevronDown
                  size={16}
                  strokeWidth={1.8}
                  color="#77736E"
                />
              </Box>

              {/* =========================
                  PROFILE DROPDOWN
              ========================= */}
              <Menu
                anchorEl={
                  profileAnchorEl
                }
                open={
                  profileMenuOpen
                }
                onClose={
                  handleProfileMenuClose
                }
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 1,

                      width: 230,

                      borderRadius: 2.5,

                      border:
                        "1px solid #FAF9F6",

                      boxShadow:
                        "0 12px 40px rgba(21,42,71,0.12)",

                      overflow:
                        "hidden",
                    },
                  },
                }}
              >
                {/* User Information */}
                <Box
                  sx={{
                    px: 2,

                    py: 1.7,

                    backgroundColor:
                      "#FAF9F6",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",

                      alignItems:
                        "center",

                      gap: 1.2,
                    }}
                  >
                    <Avatar
                      src={
                        user.profilePhoto ||
                        "/profile.png"
                      }
                      sx={{
                        width: 40,

                        height: 40,

                        fontSize: 13,

                        backgroundColor:
                          "#f0e8dc",

                        color:
                          "#5c4936",
                      }}
                    >
                      {getInitials()}
                    </Avatar>

                    <Box
                      sx={{
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 13,

                          fontWeight: 700,

                          color:
                            "#121212",

                          whiteSpace:
                            "nowrap",

                          overflow:
                            "hidden",

                          textOverflow:
                            "ellipsis",
                        }}
                      >
                        {user.name ||
                          "User"}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 11,

                          color:
                            "#77736E",

                          mt: 0.3,

                          whiteSpace:
                            "nowrap",

                          overflow:
                            "hidden",

                          textOverflow:
                            "ellipsis",
                        }}
                      >
                        {user.phone}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider />

                {/* Profile */}
                <MenuItem
                  onClick={
                    handleProfile
                  }
                  sx={{
                    py: 1.3,

                    px: 2,

                    fontSize: 13,

                    color:
                      "#121212",

                    gap: 1.3,

                    "&:hover": {
                      backgroundColor:
                        "#FAF9F6",
                    },
                  }}
                >
                  <User
                    size={17}
                    strokeWidth={1.8}
                  />

                  <Typography
                    sx={{
                      fontSize: 13,
                    }}
                  >
                    Profile
                  </Typography>
                </MenuItem>

                {/* Logout */}
                <MenuItem
                  onClick={
                    handleLogout
                  }
                  sx={{
                    py: 1.3,

                    px: 2,

                    fontSize: 13,

                    color: "#ef4444",

                    gap: 1.3,

                    "&:hover": {
                      backgroundColor:
                        "#FAF9F6",
                    },
                  }}
                >
                  <LogOut
                    size={17}
                    strokeWidth={1.8}
                  />

                  <Typography
                    sx={{
                      fontSize: 13,

                      color: "#ef4444",
                    }}
                  >
                    Logout
                  </Typography>
                </MenuItem>
              </Menu>
            </>
          ) : (
            /* =========================
               NOT LOGGED IN
            ========================= */
            <Box
              onClick={() =>
                router.push(
                  "/login"
                )
              }
              sx={{
                cursor: "pointer",

                px: 1.5,

                py: 0.8,

                borderRadius: 2,

                color: "#1E3A5F",

                fontSize: 13,

                fontWeight: 600,

                "&:hover": {
                  backgroundColor:
                    "#FAF9F6",
                },
              }}
            >
              Login
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
}