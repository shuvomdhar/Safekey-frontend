"use client";

import { useEffect, useState } from "react";

/**
 * The current year is only read after hydration. Reading it during render would
 * make the page depend on the build time, which Cache Components disallows.
 */
export function CopyrightYear() {
  const [year, setYear] = useState<string | null>(null);

  useEffect(() => {
    // Reading the year after hydration keeps prerendering deterministic.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYear(String(new Date().getFullYear()));
  }, []);

  return <>{year}</>;
}
