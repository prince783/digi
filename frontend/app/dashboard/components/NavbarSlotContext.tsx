"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/*
 * Lets a page inject content into the shared Navbar's left side
 * (e.g. a back button + title + status), without the Navbar itself
 * knowing anything page-specific. Navbar is shared by the client
 * dashboard AND the admin panel, so this is opt-in: a page that
 * never calls useNavbarLeftSlot() leaves the Navbar exactly as it
 * already renders for every other page.
 */

const NavbarSlotContext = createContext<{
  content: ReactNode;
  setContent: (node: ReactNode) => void;
} | null>(null);

export function NavbarSlotProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [content, setContent] = useState<ReactNode>(null);

  return (
    <NavbarSlotContext.Provider value={{ content, setContent }}>
      {children}
    </NavbarSlotContext.Provider>
  );
}

/** Read-only: used by Navbar itself to render whatever a page has set. */
export function useNavbarLeftContent(): ReactNode {
  const ctx = useContext(NavbarSlotContext);
  return ctx?.content ?? null;
}

/**
 * Used by a page to render `node` into the Navbar's left side while
 * mounted, and clear it again on unmount (so navigating away doesn't
 * leave stale content in the shared Navbar for the next page).
 */
export function useNavbarLeftSlot(node: ReactNode) {
  const ctx = useContext(NavbarSlotContext);
  const setContent = ctx?.setContent;

  useEffect(() => {
    setContent?.(node);
    return () => setContent?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node, setContent]);
}
