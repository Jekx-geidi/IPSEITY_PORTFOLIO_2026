import { createContext, useContext, useEffect, useState } from 'react';

/**
 * Which themed section the user is currently in — one source of truth for both
 * the section backgrounds and the navbar, so they always switch together.
 *
 * A section is "current" while it crosses a thin band at 45% of the viewport
 * height. When no themed section is in the band, nothing is current (null).
 */
export const THEMED_SECTIONS = ['home', 'services', 'about', 'journey', 'education', 'portfolio', 'reviews', 'tools', 'faq', 'contact'] as const;

export const ActiveSectionContext = createContext<string | null>(null);

/** True while the user is in the section with this id. */
export const useSectionActive = (id: string) => useContext(ActiveSectionContext) === id;

export const useActiveSection = () => useContext(ActiveSectionContext);

/** Observe the themed sections and return the id of the one currently on screen. */
export function useTrackActiveSection(ids: readonly string[] = THEMED_SECTIONS) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const inBand = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target.id);
          else inBand.delete(entry.target.id);
        }
        // At a boundary two sections can touch the band; prefer the later one.
        setActive(ids.filter((id) => inBand.has(id)).pop() ?? null);
      },
      { rootMargin: '-45% 0px -54% 0px' }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
