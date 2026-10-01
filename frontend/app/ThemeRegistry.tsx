"use client";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { useServerInsertedHTML } from "next/navigation";
import { useState } from "react";

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ cache, flush }] = useState(() => {
    const emotionCache = createCache({ key: "mui", prepend: true });
    emotionCache.compat = true;

    const inserted: string[] = [];
    const originalInsert = emotionCache.insert;

    emotionCache.insert = (...args) => {
      if (args[1] && emotionCache.inserted[args[1].name] === undefined) {
        inserted.push(args[1].name);
      }

      return originalInsert(...args);
    };

    return {
      cache: emotionCache,
      flush: () => {
        const names = inserted.splice(0, inserted.length);
        return names;
      },
    };
  });

  useServerInsertedHTML(() => {
    const names = flush();

    if (names.length === 0) {
      return null;
    }

    let styles = "";

    for (const name of names) {
      styles += cache.inserted[name];
    }

    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
