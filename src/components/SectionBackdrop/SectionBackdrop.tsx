import React from 'react';
import { THEMED_SECTIONS, useActiveSection, useTravel } from '../../activeSection';

// Hidden lands are clipped to a zero-height sliver on the edge the visitor will
// cross next: lands still ahead wait at their bottom edge, lands already visited
// retreat to their top edge. Arriving therefore sweeps the new land in from the
// direction of travel, and leaving draws the old one away behind you.
const CLIP_SHOWN = 'inset(0% 0% 0% 0%)';
const CLIP_AHEAD = 'inset(100% 0% 0% 0%)';
const CLIP_BEHIND = 'inset(0% 0% 100% 0%)';

const order = (id: string | null) => THEMED_SECTIONS.indexOf(id as (typeof THEMED_SECTIONS)[number]);

/**
 * Full-bleed themed background ("land") for the section with this id, shown only
 * while that section is current. Parent section must be `relative`, and its
 * content `relative` so it paints above.
 */
const SectionBackdrop = ({ id, className = '', children }: { id: string; className?: string; children?: React.ReactNode }) => {
  const active = useActiveSection();
  const { last, dir } = useTravel();
  const show = active === id;

  let clip = CLIP_SHOWN;
  if (!show) {
    const ref = active ?? last;
    const here = order(id);
    const there = order(ref);
    // Crossing an unthemed gap (active is null): the land just left is behind
    // you going down, ahead of you going back up.
    const behind = here === there ? dir === 'down' : here < there;
    clip = behind ? CLIP_BEHIND : CLIP_AHEAD;
  }

  return (
    <div
      aria-hidden="true"
      className={`kingdom-backdrop pointer-events-none absolute inset-0 ${show ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={{ clipPath: clip, WebkitClipPath: clip }}
    >
      {children}
    </div>
  );
};

export default SectionBackdrop;
