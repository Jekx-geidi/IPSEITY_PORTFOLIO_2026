import { useEffect, useRef, type PropsWithChildren } from 'react';
import { MotionConfig, motion, useInView, type HTMLMotionProps } from 'motion/react';
import { useMotionPreference } from './useMotionPreference';
import './portfolio-motion.css';

/** Keep character loops local to the viewport and respect motion preferences. */
export function AnimatedAsset({ animate, transition, ...props }: HTMLMotionProps<'img'>) {
  const ref = useRef<HTMLImageElement>(null);
  const visible = useInView(ref, { margin: '80px' });
  const reduced = useMotionPreference();
  const playing = visible && !reduced;
  const resetFilter = animate && typeof animate === 'object' && 'filter' in animate ? { filter: 'none' } : {};
  return <motion.img {...props} ref={ref} transition={playing ? transition : { duration: 0 }} animate={playing ? animate : { x: 0, y: 0, rotate: 0, opacity: 1, ...resetFilter }} />;
}

export default function PortfolioMotion({ children }: PropsWithChildren) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useMotionPreference();

  useEffect(() => {
    const host = root.current;
    if (!host || reduced) return;
    const animations = new Set<Animation>();
    // Animate only after intersection: content stays readable if scripting fails.
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const element = entry.target as HTMLElement;
        const animation = element.animate([
          { opacity: 0.15, translate: '0 18px' },
          { opacity: 1, translate: '0 0' },
        ], { duration: 650, delay: Number(element.dataset.revealOrder || 0) * 55, easing: 'cubic-bezier(.22,1,.36,1)' });
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
        reveal.unobserve(element);
      });
    }, { threshold: 0.12 });
    host.querySelectorAll('main section').forEach(section => {
      section.querySelectorAll<HTMLElement>('h2, h3, p, [data-motion-card]').forEach((element, index) => {
        element.dataset.revealOrder = String(index % 4);
        reveal.observe(element);
      });
    });

    const sections = host.querySelectorAll<HTMLElement>('main section[id]');
    const visibility = new IntersectionObserver(entries => {
      // A data attribute, not a class: sections re-render their className when their theme
      // switches on, which would wipe a hand-added class and leave loops paused.
      entries.forEach(entry => entry.target.toggleAttribute('data-in-view', entry.isIntersecting));
    });
    sections.forEach(section => visibility.observe(section));

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let frame = 0;
    let current: HTMLElement | null = null;
    let x = 0;
    let y = 0;
    const clear = () => {
      current?.classList.remove('motion-lit');
      current = null;
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const move = (event: PointerEvent) => {
      if (!finePointer.matches || event.pointerType === 'touch') return;
      const section = (event.target as Element).closest<HTMLElement>('main section[id]');
      if (section !== current) {
        clear();
        current = section;
        current?.classList.add('motion-lit');
      }
      x = event.clientX;
      y = event.clientY;
      if (!current || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!current) return;
        const rect = current.getBoundingClientRect();
        current.style.setProperty('--light-x', `${x - rect.left}px`);
        current.style.setProperty('--light-y', `${y - rect.top}px`);
      });
    };
    host.addEventListener('pointermove', move, { passive: true });
    host.addEventListener('pointerleave', clear);
    window.addEventListener('scroll', clear, { passive: true });
    return () => {
      reveal.disconnect();
      visibility.disconnect();
      animations.forEach(animation => animation.cancel());
      clear();
      sections.forEach(section => section.removeAttribute('data-in-view'));
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerleave', clear);
      window.removeEventListener('scroll', clear);
    };
  }, [reduced]);

  return <MotionConfig reducedMotion={reduced ? 'always' : 'never'}><div ref={root} className="portfolio-motion">{children}</div></MotionConfig>;
}
