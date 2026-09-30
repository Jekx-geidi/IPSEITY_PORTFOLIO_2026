import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { AnimationItem } from 'lottie-web';

// Closing "thank you" at the end of the Contact section: a closed treasure chest
// (LottieFiles "Open Treasure", public/treasure-chest.json). Frame 0 is closed, the
// last frame is open; clicking plays it once, then the quote bursts out of the
// chest with confetti.
// lottie-web and the JSON only load once the chest is close to the viewport.

const ANIMATION_URL = '/treasure-chest.json';
// Gold and gems from the chest, plus a splash of the site's Adventure Time colours.
const CONFETTI_COLORS = ['#FDE876', '#F9BB00', '#FFFFFF', '#FC62A2', '#09E3F9', '#0AE6BE', '#7860F0'];

export default function TreasureChest({ onSection = false }: { onSection?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);
  const chestRef = useRef<HTMLButtonElement>(null);
  const [ready, setReady] = useState(false);
  const [opening, setOpening] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let cancelled = false;
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      try {
        const [{ default: lottie }, data] = await Promise.all([
          import('lottie-web/build/player/lottie_light'),
          fetch(ANIMATION_URL).then((r) => r.json()),
        ]);
        if (cancelled || !lottieRef.current) return;
        const anim = lottie.loadAnimation({
          container: lottieRef.current,
          renderer: 'svg',
          loop: false,
          autoplay: false,
          animationData: data,
        });
        anim.goToAndStop(0, true);
        anim.addEventListener('complete', () => burst());
        animRef.current = anim;
        setReady(true);
      } catch (err) {
        console.error('Treasure chest failed to load', err);
      }
    }, { rootMargin: '400px' });
    observer.observe(wrap);
    return () => { cancelled = true; observer.disconnect(); animRef.current?.destroy(); animRef.current = null; };
  }, []);

  // Lid is open: the quote bursts out, and confetti shoots from the chest (skipped for reduced motion).
  const burst = async () => {
    const rect = chestRef.current?.getBoundingClientRect();
    setRevealed(true);
    if (!rect || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const { default: confetti } = await import('canvas-confetti');
    const origin = {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height * 0.45) / window.innerHeight,
    };
    const base = { origin, colors: CONFETTI_COLORS, zIndex: 70, disableForReducedMotion: true };
    confetti({ ...base, particleCount: 140, angle: 90, spread: 100, startVelocity: 55, scalar: 1.05 });
    setTimeout(() => {
      confetti({ ...base, particleCount: 60, angle: 60, spread: 70, startVelocity: 45 });
      confetti({ ...base, particleCount: 60, angle: 120, spread: 70, startVelocity: 45 });
    }, 180);
    setTimeout(() => confetti({ ...base, particleCount: 40, spread: 160, startVelocity: 30, shapes: ['star'], scalar: 1.3 }), 420);
  };

  const open = () => {
    if (opening) return;
    setOpening(true);
    const anim = animRef.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // No animation (still loading, failed, or reduced motion): jump to the open lid and show the quote.
    if (!anim || reduce) {
      anim?.goToAndStop(anim.totalFrames - 1, true);
      burst();
      return;
    }
    anim.play();
  };

  return (
    <div ref={wrapRef} className="mt-20 md:mt-24 flex flex-col items-center text-center">
      {/* The quote bursts up OUT of the chest: it starts shrunk and down inside it, then springs up above it. */}
      {/* Before opening: the invitation. It fades while the lid opens, then the quote takes its place. */}
      {!revealed && (
        <motion.div
          className="mb-4 max-w-xl px-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          animate={opening ? { opacity: 0, scale: 0.95 } : undefined}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent-start dark:text-ik-crown">✦ Wait, what's this? ✦</p>
          <h3 className={`mt-3 font-display text-3xl md:text-5xl font-bold tracking-tight leading-tight ${onSection ? 'frost-text' : 'title-text'}`}>
            You found a treasure! Open it now.
          </h3>
          <p className="mt-4 text-base md:text-lg leading-relaxed text-ink/60 dark:text-ik-skin/85">
            You made it through the whole Land of Ooo, from Jake's hero to Ice King's royal mail. Every adventure ends with a reward, and this one is yours. Tap the chest to see what's inside.
          </p>
        </motion.div>
      )}

      <AnimatePresence>
        {revealed && (
          <motion.figure
            key="quote"
            className="relative z-10 mb-2 max-w-2xl px-4 origin-bottom"
            initial={{ opacity: 0, scale: 0.1, y: 160 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 13, mass: 0.9 }}
          >
            <blockquote className={`font-display text-3xl md:text-5xl font-bold tracking-tight leading-tight ${onSection ? 'frost-text' : 'title-text'}`}>
              Enquiry or not, thank you for adventuring all the way here.
            </blockquote>
            <motion.figcaption
              className="mt-4 font-signature text-3xl md:text-4xl text-accent-start dark:text-ik-crown"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
            >
              — Jake
            </motion.figcaption>
          </motion.figure>
        )}
      </AnimatePresence>

      <motion.button
        ref={chestRef}
        layout
        type="button"
        onClick={open}
        disabled={opening}
        aria-label={opening ? 'Treasure chest opened' : 'Open the treasure chest'}
        className="relative w-40 h-40 md:w-52 md:h-52 rounded-full outline-none focus-visible:ring-4 focus-visible:ring-ik-crown disabled:cursor-default"
        animate={opening ? { rotate: 0, y: 0 } : { rotate: [0, -4, 4, -3, 3, 0], y: [0, -4, 0] }}
        transition={opening ? { duration: 0.2, layout: { duration: 0.5 } } : { duration: 1.6, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' }}
        whileHover={opening ? undefined : { scale: 1.06 }}
        whileTap={opening ? undefined : { scale: 0.95 }}
      >
        {/* glow behind the chest, brighter once it's open */}
        <span
          aria-hidden="true"
          className={`absolute inset-6 rounded-full blur-2xl transition-opacity duration-700 bg-ik-crown ${revealed ? 'opacity-60' : 'opacity-25'}`}
        />
        {/* flash of light as the treasure bursts out */}
        {revealed && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-[radial-gradient(circle,#FFFBE0_0%,#FDE876_35%,transparent_70%)]"
            initial={{ opacity: 1, scale: 0.3 }}
            animate={{ opacity: 0, scale: 3.2 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        )}
        <div ref={lottieRef} className="relative w-full h-full" />
        {!ready && (
          <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-6xl">🧰</span>
        )}
      </motion.button>

      <motion.p
        className="mt-3 text-xs font-bold uppercase tracking-widest text-ink/45 dark:text-ik-skin/70"
        animate={{ opacity: opening ? 0 : 1 }}
        aria-hidden={opening}
      >
        Tap to open
      </motion.p>
    </div>
  );
}
