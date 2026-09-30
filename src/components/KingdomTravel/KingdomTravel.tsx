import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { THEMED_SECTIONS, useActiveSection, useTravel, type TravelDirection } from '../../activeSection';

// Every themed section is a land on the map of Ooo: its name, its mascot, and
// the colour the clouds take on as you fly into it.
const KINGDOMS: Record<string, { name: string; mascot: string; tint: string }> = {
  home:      { name: 'The Tree Fort',      mascot: '/jake-wave.webp',      tint: '#F8B400' },
  services:  { name: "BMO's Arcade",       mascot: '/bmo-face.webp',       tint: '#0AE6BE' },
  about:     { name: 'The Grasslands',     mascot: '/finn.webp',           tint: '#009EDB' },
  journey:   { name: "Marceline's Cave",   mascot: '/marceline.webp',      tint: '#B70D1A' },
  education: { name: 'The Ice Kingdom',    mascot: '/gunter.webp',         tint: '#8CD7FD' },
  portfolio: { name: 'The Candy Kingdom',  mascot: '/bubblegum.webp',      tint: '#FD59BC' },
  reviews:   { name: 'The Fire Kingdom',   mascot: '/flame-princess.webp', tint: '#FC3801' },
  tools:     { name: 'The Rainbow Skies',  mascot: '/rainicorn.webp',      tint: '#CD93F9' },
  faq:       { name: 'Lumpy Space',        mascot: '/lsp.webp',            tint: '#BE98D7' },
  contact:   { name: "Ice King's Castle",  mascot: '/ice-king.webp',       tint: '#1E28E6' }
};

// A puffy cloud bank; drawn once per side and tinted with the destination's colour.
const CloudBank = ({ tint, flip }: { tint: string; flip?: boolean }) => (
  <svg viewBox="0 0 200 600" className={`h-full w-full ${flip ? '-scale-x-100' : ''}`} preserveAspectRatio="none" aria-hidden="true">
    <g fill={tint} opacity="0.45">
      <circle cx="10" cy="90" r="90" /><circle cx="60" cy="230" r="80" /><circle cx="0" cy="360" r="110" />
      <circle cx="70" cy="500" r="85" />
    </g>
    <g fill="#FFFFFF" opacity="0.8">
      <circle cx="-10" cy="120" r="70" /><circle cx="40" cy="250" r="58" /><circle cx="-20" cy="380" r="85" />
      <circle cx="45" cy="510" r="62" />
    </g>
  </svg>
);

type Trip = { id: number; to: string; dir: TravelDirection };

/**
 * Plays a short "journey" whenever the visitor crosses into a new land: cloud
 * banks drift past the screen edges in the direction of travel, and a signpost
 * names the land and marks it on a little route map. Purely decorative.
 */
const KingdomTravel = () => {
  const active = useActiveSection();
  const { dir } = useTravel();
  const reduceMotion = useReducedMotion();
  const [trip, setTrip] = useState<Trip | null>(null);
  const shown = useRef<string | null>(null);
  const tripId = useRef(0);

  // Wait for the visitor to settle in a land, so a fast scroll across several
  // lands plays one journey (to where they stopped), not a burst of them.
  useEffect(() => {
    if (!active || !KINGDOMS[active]) return;
    // The land the page opens in needs no journey; it just becomes the start.
    if (shown.current === null) { shown.current = active; return; }
    if (active === shown.current) return;
    const timer = window.setTimeout(() => {
      shown.current = active;
      setTrip({ id: ++tripId.current, to: active, dir });
    }, 180);
    return () => window.clearTimeout(timer);
  }, [active, dir]);

  // The signpost hangs around long enough to read, then packs up.
  useEffect(() => {
    if (!trip) return;
    const timer = window.setTimeout(() => setTrip(null), 2600);
    return () => window.clearTimeout(timer);
  }, [trip]);

  const land = trip ? KINGDOMS[trip.to] : null;
  const stop = trip ? THEMED_SECTIONS.indexOf(trip.to as (typeof THEMED_SECTIONS)[number]) : -1;
  // Descending the page, the clouds rush up past you; climbing back, they fall.
  const from = trip?.dir === 'up' ? '-100%' : '100%';
  const to = trip?.dir === 'up' ? '100%' : '-100%';

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <AnimatePresence>
        {trip && land && !reduceMotion && (
          <motion.div key={`clouds-${trip.id}`} className="absolute inset-0 hidden md:block" exit={{ opacity: 0 }}>
            {[false, true].map((right) => (
              <motion.div
                key={String(right)}
                className={`absolute top-0 h-full w-[11vw] max-w-[170px] ${right ? 'right-0' : 'left-0'}`}
                initial={{ y: from, opacity: 0 }}
                animate={{ y: to, opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.3, ease: [0.45, 0, 0.55, 1], delay: right ? 0.08 : 0 }}
              >
                <CloudBank tint={land.tint} flip={right} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {trip && land && (
          <motion.div
            key={`sign-${trip.id}`}
            className="absolute left-3 bottom-4 md:left-6 md:bottom-6 flex items-center gap-3 rounded-2xl border-[3px] border-[#170414] bg-white/92 backdrop-blur-md px-3 py-2.5 md:px-4 md:py-3 text-[#170414] max-w-[calc(100vw-7rem)]"
            style={{ boxShadow: `4px 4px 0 ${land.tint}` }}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, rotate: -4 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          >
            <span
              className="w-10 h-10 md:w-12 md:h-12 shrink-0 overflow-hidden rounded-full border-[3px] border-[#170414]"
              style={{ background: land.tint }}
            >
              <img src={land.mascot} alt="" className="h-full w-full object-cover object-top" draggable={false} />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-widest opacity-60">Now entering</span>
              <span className="block truncate font-display text-base md:text-lg font-bold leading-tight">{land.name}</span>
              {/* Route map: every land as a stop, the ones behind you filled in. */}
              <span className="mt-1.5 hidden sm:flex items-center gap-1">
                {THEMED_SECTIONS.map((id, i) => (
                  <span
                    key={id}
                    className={`rounded-full transition-all ${i === stop ? 'w-3 h-3 border-2 border-[#170414]' : 'w-1.5 h-1.5'}`}
                    style={{ background: i <= stop ? KINGDOMS[id].tint : 'rgba(23,4,20,0.18)' }}
                  />
                ))}
              </span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KingdomTravel;
