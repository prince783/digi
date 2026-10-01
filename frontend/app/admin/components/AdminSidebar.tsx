// "use client";

// import React, { useState } from "react";
// import { Box, useMediaQuery, useTheme } from "@mui/material";

// import Navbar from "@/app/dashboard/components/Navbar";
// import Sidebar from "@/app/dashboard/components/Sidebar";

// /* =========================================================
//    ADMIN SIDEBAR LINKS
// ========================================================= */

// const SIDEBAR_LINKS = [
//   {
//     label: "Dashboard",
//     href: "/admin/dashboard",
//   },
//   {
//     label: "Profile Management",
//     href: "/admin/profiles",
//   },
//   {
//     label: "Pricing",
//     href: "/admin/pricing",
//   },
// ];

// /* =========================================================
//    ADMIN LAYOUT
// ========================================================= */

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const theme = useTheme();

//   const isMobile = useMediaQuery(
//     theme.breakpoints.down("lg")
//   );

//   const [sidebarOpen, setSidebarOpen] =
//     useState(false);

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         backgroundColor: "#FAF9F6",
//       }}
//     >
//       {/* =====================================================
//           SIDEBAR
//       ===================================================== */}

//       <Sidebar
//         open={sidebarOpen}
//         onClose={() =>
//           setSidebarOpen(false)
//         }
//         links={SIDEBAR_LINKS}
//       />

//       {/* =====================================================
//           MAIN AREA
//       ===================================================== */}

//       <Box
//         sx={{
//           minHeight: "100vh",

//           pl: {
//             xs: 0,
//             lg: "250px",
//           },

//           transition:
//             "padding-left 0.3s ease",
//         }}
//       >
//         {/* ===================================================
//             NAVBAR
//         =================================================== */}

//         <Navbar
//           sidebarOpen={sidebarOpen}
//           setSidebarOpen={setSidebarOpen}
//         />

//         {/* ===================================================
//             PAGE CONTENT
//         =================================================== */}

//         <Box
//           component="main"
//           sx={{
//             pt: {
//               xs: "64px",
//               sm: "72px",
//               lg: "64px",
//             },

//             minHeight: "100vh",

//             boxSizing: "border-box",

//             width: "100%",

//             overflowX: "hidden",
//           }}
//         >
//           {children}
//         </Box>
//       </Box>
//     </Box>
//   );
// }