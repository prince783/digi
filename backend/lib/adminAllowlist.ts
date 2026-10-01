/* =========================================================
   ADMIN MOBILE ALLOWLIST

   Single source of truth for who can hold admin access.
   Registration cannot self-assign "admin" (see
   app/api/auth/register/route.ts) and the admin panel checks
   this list even if a user record's role is somehow set to
   "admin" some other way (see getCurrentAdmin in
   app/lib/auth.ts) — so only these numbers can ever reach it.
========================================================= */

export const ADMIN_MOBILES = [
  "7870911529",
  "6203689042",
];

export function isAdminMobile(mobile: string | undefined | null) {
  return !!mobile && ADMIN_MOBILES.includes(mobile);
}
