// "use client";

// import {
//   Bell,
//   Search,
//   Sun,
//   ChevronDown,
// } from "lucide-react";

// export default function AdminHeader() {
//   return (
//     <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-line bg-white px-8">
//       <div className="relative w-[350px]">
//         <Search
//           size={18}
//           className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
//         />

//         <input
//           type="text"
//           placeholder="Search users..."
//           className="w-full rounded-xl border border-line bg-page py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary-light focus:ring-2 focus:ring-line"
//         />
//       </div>

//       <div className="flex items-center gap-5">
//         <button className="text-muted hover:text-primary">
//           <Sun size={21} />
//         </button>

//         <button className="relative text-muted hover:text-primary">
//           <Bell size={21} />

//           <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white">
//             3
//           </span>
//         </button>

//         <div className="h-8 w-px bg-line" />

//         <button className="flex items-center gap-3">
//           <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent font-semibold text-primary">
//             AD
//           </div>

//           <div className="text-left">
//             <p className="text-sm font-semibold text-ink">
//               Administrator
//             </p>

//             <p className="text-xs text-muted">
//               Admin
//             </p>
//           </div>

//           <ChevronDown
//             size={16}
//             className="text-muted"
//           />
//         </button>
//       </div>
//     </header>
//   );
// }