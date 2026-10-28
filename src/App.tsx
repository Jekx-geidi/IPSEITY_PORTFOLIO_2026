import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import ChatBot from './components/ChatBot/ChatBot';
import CheckIn from './components/CheckIn/CheckIn';
import NumberTicker from './components/NumberTicker/NumberTicker';
import { reviews } from './components/Reviews/Reviews';
import {
  Linkedin,
  Instagram,
  Facebook,
  Github,
  Plus,
  Minus,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  ChevronsRight,
  Mail,
  Phone,
  MapPin,
  Globe,
  Asterisk,
  Crosshair,
  Download,
  Menu,
  X,
  Lock,
  Send,
  BadgeCheck,
  Code2,
  Layers,
  Database,
  Bot,
  Palette,
  Wrench,
  PenTool,
  Megaphone,
  Clapperboard,
  CalendarDays,
  Rocket,
  Star,
  Trophy,
  Award,
  Camera,
  Film,
  Printer,
  ShoppingBag
} from 'lucide-react';


// --- Shared bits ---

const FadeIn = ({ children, delay = 0, direction = 'up', className = "" }: { children: React.ReactNode, delay?: number, direction?: 'up' | 'left' | 'right', className?: string }) => {
  const variants = {
    hidden: { opacity: 0, y: direction === 'up' ? 40 : 0, x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0 },
    visible: { opacity: 1, y: 0, x: 0 }
  };
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
      variants={variants}
    >
      {children}
    </motion.div>
  );
};

// Section title in a clipped lime-outlined box, with a short blurb beside it
// (the "SELECTED WORK ↘" header from the reference design).
const SectionHead = ({ top, bottom, blurb, children }: { top: string, bottom: string, blurb?: string, children?: React.ReactNode }) => (
  <FadeIn className="mb-10 md:mb-14 flex flex-col md:flex-row md:items-center gap-5 md:gap-10">
    <div className="cut self-start bg-lime/80 p-px">
      <div className="cut bg-void flex items-end gap-6 pl-6 pr-5 py-4">
        <h2 className="font-display font-bold uppercase text-2xl md:text-3xl leading-[1.05] tracking-wide text-lime">
          {top}<br />{bottom}
        </h2>
        <ArrowDownRight className="text-lime mb-1 shrink-0" size={26} strokeWidth={1.5} />
      </div>
    </div>
    {blurb && <p className="max-w-sm text-sm md:text-base text-mist leading-relaxed">{blurb}</p>}
    {children && <div className="md:ml-auto">{children}</div>}
  </FadeIn>
);

const Kicker = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <p className={`font-mono text-[11px] md:text-xs uppercase tracking-[0.25em] text-mist ${className}`}>{children}</p>
);

const NAV_LINKS = [
  { href: '#work', label: 'Work' },
  { href: '#services', label: 'Services' },
  { href: '#journey', label: 'Journey' },
  { href: '#experience', label: 'Experience' },
  { href: '#tools', label: 'Tools' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#contact', label: 'Contact' }
];
const SOCIAL_LINKS = [
  { href: 'https://www.linkedin.com/in/riel-jake-engana-585644372/', label: 'LinkedIn', Icon: Linkedin },
  { href: 'https://www.instagram.com/real_jexkz/?hl=en', label: 'Instagram', Icon: Instagram },
  { href: 'https://www.facebook.com/Engana08', label: 'Facebook', Icon: Facebook },
  { href: 'https://github.com/Jekx-geidi', label: 'GitHub', Icon: Github }
];
const RESUME_HREF = "/RIEL JAKE_ENGANA _VERCEL RESUME_ Geidi.jpg";

const BrandMark = ({ className = "" }: { className?: string }) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <Crosshair className="text-lime shrink-0" size={20} strokeWidth={1.75} />
    <span className="font-mono text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-white">Profilio<span className="text-lime">.</span></span>
  </span>
);

// --- Navbar ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Esc closes the menu, and so does widening the window to desktop.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    const desktop = window.matchMedia('(min-width: 1024px)');
    const onResize = () => { if (desktop.matches) setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    desktop.addEventListener('change', onResize);
    return () => { window.removeEventListener('keydown', onKey); desktop.removeEventListener('change', onResize); };
  }, [menuOpen]);

  // Mobile menu links scroll by hand: on touch screens the tap gesture cancels the
  // browser's smooth anchor scroll (the hash changed but the page never moved).
  const goToSection = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    setMenuOpen(false);
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;
    window.setTimeout(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', href);
    }, 80);
  };

  const solid = isScrolled || menuOpen;

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${solid ? 'bg-void/85 backdrop-blur-xl border-b border-electric-soft/25' : 'bg-transparent border-b border-transparent'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-5 md:px-10 py-4">
        <a href="#" onClick={() => setMenuOpen(false)} aria-label="Back to top">
          <BrandMark />
        </a>

        <div className="hidden lg:flex items-center gap-1">
          <span className="mr-4 h-px w-16 bg-electric-soft/50" aria-hidden="true" />
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="px-3 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-mist hover:text-lime transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden xl:inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-mist">
            Available for freelance
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-lime opacity-60 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime" />
            </span>
          </span>
          <a
            href={RESUME_HREF}
            download
            className="cut-sm inline-flex items-center gap-2 bg-lime text-void px-4 py-2.5 font-mono text-[11px] md:text-xs font-bold uppercase tracking-[0.15em] hover:bg-white transition-colors"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Resume</span>
            <span className="sm:hidden">CV</span>
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="lg:hidden w-10 h-10 shrink-0 border border-electric-soft/40 text-white flex items-center justify-center hover:border-lime hover:text-lime transition-colors"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            className="lg:hidden overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <ul className="px-5 md:px-10 pb-6 border-t border-electric-soft/20">
              {NAV_LINKS.map((l, i) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={(e) => goToSection(e, l.href)}
                    className="flex items-center justify-between py-4 border-b border-electric-soft/15 font-display text-xl font-bold uppercase tracking-wide text-white hover:text-lime transition-colors"
                  >
                    <span><span className="font-mono text-xs text-lime mr-3">0{i + 1}</span>{l.label}</span>
                    <ArrowUpRight size={18} className="opacity-50" />
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Hero ---

const PROFILE_TEXT = [
  "Hi, I'm Riel Jake Engaña, a Software-Augmented Software Developer Intern at Geidi IT, specializing in AI automation and intelligent software systems. My work focuses on developing AI-augmented applications, autonomous agents, and agentic workflows capable of reasoning, planning, and executing complex tasks.",
  "My background combines the analytical and process-oriented principles of Industrial Engineering with practical experience in software development and artificial intelligence. I work with multi-agent architectures, LLM orchestration, AI integration, and end-to-end process automation to develop efficient and scalable software solutions.",
  "Currently, I contribute to the development and deployment of production-ready AI-augmented and agentic systems at Geidi IT while completing my degree in Software Development at the University of San Jose–Recoletos (USJ-R)."
].join("\n\n");

// "Read Profile": a terminal window that types the bio out. Skip / Esc / backdrop close.
const ProfileTerminal = ({ onClose }: { onClose: () => void }) => {
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [count, setCount] = useState(reduceMotion ? PROFILE_TEXT.length : 0);
  const done = count >= PROFILE_TEXT.length;
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const textRef = React.useRef<HTMLDivElement>(null);

  // type ~3 characters every 18ms, after the window has opened
  useEffect(() => {
    if (done) return;
    let tick: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      tick = setInterval(() => setCount((c) => Math.min(PROFILE_TEXT.length, c + 3)), 18);
    }, 400);
    return () => { clearTimeout(start); if (tick) clearInterval(tick); };
  }, [done]);

  // keep the caret in view as the text grows
  useEffect(() => {
    const el = textRef.current;
    if (el && !done) el.scrollTop = el.scrollHeight;
  }, [count, done]);

  // Esc closes, lock page scroll, focus the close button
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-void/80 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-title"
    >
      <motion.div
        className="cut w-[min(94vw,820px)] max-h-[85vh] flex flex-col bg-navy border border-electric-soft/40 shadow-[0_0_80px_rgb(30_55_255/0.35)]"
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-3 border-b border-electric-soft/30 bg-electric/20">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-lime" />
            <span className="w-3 h-3 rounded-full bg-electric-soft" />
            <span className="w-3 h-3 rounded-full bg-mist/50" />
          </span>
          <h2 id="profile-title" className="font-mono text-xs uppercase tracking-[0.2em] text-mist">~/riel-jake/about.md</h2>
          <div className="ml-auto flex items-center gap-2">
            {!done && (
              <button type="button" onClick={() => setCount(PROFILE_TEXT.length)} className="font-mono text-[11px] uppercase tracking-widest text-lime border border-lime/50 px-3 py-1 hover:bg-lime hover:text-void transition-colors">
                Skip
              </button>
            )}
            <button ref={closeRef} type="button" onClick={onClose} aria-label="Close profile" className="w-8 h-8 flex items-center justify-center text-white border border-electric-soft/40 hover:border-lime hover:text-lime transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
        <div ref={textRef} className="overflow-y-auto no-scrollbar p-6 md:p-8 font-mono text-sm md:text-base leading-relaxed text-white/90 whitespace-pre-line">
          <p className="text-lime mb-4">$ cat about.md</p>
          <span className="sr-only">{PROFILE_TEXT}</span>
          <span aria-hidden="true">
            {PROFILE_TEXT.slice(0, count)}
            <span className="caret" />
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Circular text badge that slowly rotates around a globe.
// Size and position come from className, so nothing here can clash with them.
const SpinBadge = ({ className = "relative w-32 h-32" }: { className?: string }) => (
  <div className={className} aria-hidden="true">
    <svg viewBox="0 0 120 120" className="spin-slow absolute inset-0 w-full h-full">
      <defs>
        <path id="badge-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
      </defs>
      <circle cx="60" cy="60" r="58" fill="none" stroke="rgb(169 180 232 / 0.35)" strokeWidth="1" />
      <text className="font-mono" fontSize="9.5" letterSpacing="3.2" fill="#A9B4E8">
        <textPath href="#badge-circle">AGENTS • AUTOMATION • SOFTWARE •</textPath>
      </text>
    </svg>
    <div className="absolute inset-[30%] rounded-full border border-electric-soft/60 flex items-center justify-center text-white">
      <Globe className="w-[45%] h-[45%]" strokeWidth={1} />
    </div>
  </div>
);

const HeroPhoto = () => {
  const [waving, setWaving] = useState(false);
  // Touch taps also fire emulated mouse-enter then click; hover (mouse only) shows
  // the greeting and a tap/click toggles it once.
  const pointerType = React.useRef<string>('mouse');

  return (
    <div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full lg:left-auto lg:-right-[18%] lg:translate-x-0 lg:w-[125%] lg:top-0 lg:bottom-auto isolate cursor-pointer select-none"
      role="button"
      tabIndex={0}
      aria-label="Say hello to Jake"
      aria-pressed={waving}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setWaving(w => !w);
        }
      }}
      onPointerDown={(e) => { pointerType.current = e.pointerType; }}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setWaving(true); }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') setWaving(false); }}
      onBlur={() => setWaving(false)}
      onClick={() => { if (pointerType.current !== 'mouse') setWaving(w => !w); pointerType.current = 'mouse'; }}
    >
      {/* backlight behind the portrait: a wide electric-blue glow with a lime one around the head and shoulders */}
      <div aria-hidden="true" className="pointer-events-none absolute -z-10 left-[8%] top-[0%] w-[84%] aspect-square rounded-full bg-[radial-gradient(circle,rgb(69_96_255/0.55)_0%,rgb(30_55_255/0.25)_45%,transparent_70%)] blur-2xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -z-10 left-[26%] top-[6%] w-[58%] aspect-square rounded-full bg-[radial-gradient(circle,rgb(212_255_31/0.55)_0%,rgb(212_255_31/0.2)_40%,transparent_68%)] blur-3xl" />
      {/* The cutout ends in a flat edge across the arms, so fade the bottom out, glow included.
          The padding gives the glow room so the mask doesn't clip it to a rectangle. */}
      <div className="relative -m-20 p-20 [mask-image:linear-gradient(to_bottom,black_calc(100%-15rem),transparent_calc(100%-5rem))]">
      <div className="[filter:drop-shadow(0_0_2px_rgb(212_255_31/0.65))_drop-shadow(0_0_22px_rgb(212_255_31/0.4))_drop-shadow(0_0_48px_rgb(69_96_255/0.6))]">
      <motion.img
        src="/riel-hero.webp"
        alt="Riel Jake Engaña in a navy blazer and sunglasses"
        width={1375}
        height={1339}
        animate={waving ? { y: -10 } : { y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="w-full h-auto"
        draggable={false}
      />
      </div>
      </div>
      <AnimatePresence>
        {waving && (
          <motion.div
            key="hi"
            initial={{ opacity: 0, scale: 0.6, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 420, damping: 20 }}
            className="cut-sm absolute top-[8%] right-[6%] md:right-[10%] bg-lime px-4 py-2.5 font-mono text-sm md:text-base font-bold text-void whitespace-nowrap pointer-events-none"
            role="status"
          >
            &gt; Hi, I'm Jake!<span className="caret !bg-void" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Hero headline typed out letter by letter with a lime caret. Each line reserves its full
// width (invisible copy underneath) so nothing shifts while it types.
const HEADLINE = [
  { text: 'Building', className: 'text-white' },
  { text: 'Agentic', className: 'text-lime neon-glow' },
  { text: 'Systems.', className: 'text-white' },
];
const HEADLINE_LEN = HEADLINE.reduce((n, l) => n + l.text.length, 0);

const TypedHeadline = () => {
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [count, setCount] = useState(reduceMotion ? HEADLINE_LEN : 0);

  useEffect(() => {
    if (count >= HEADLINE_LEN) return;
    const t = setTimeout(() => setCount((c) => c + 1), count === 0 ? 500 : 85);
    return () => clearTimeout(t);
  }, [count]);

  let start = 0;
  return (
    <>
      <span className="sr-only">{HEADLINE.map((l) => l.text).join(' ')}</span>
      {HEADLINE.map((line) => {
        const shown = Math.max(0, Math.min(line.text.length, count - start));
        const typing = count >= start && count < start + line.text.length + (line === HEADLINE[HEADLINE.length - 1] ? 1 : 0);
        start += line.text.length;
        return (
          <span key={line.text} aria-hidden="true" className={`relative block ${line.className}`}>
            <span className="invisible">{line.text}</span>
            <span className="absolute inset-0 whitespace-nowrap">
              {line.text.slice(0, shown)}
              {typing && <span className="caret !w-[0.12em] !h-[0.8em] !align-baseline" />}
            </span>
          </span>
        );
      })}
    </>
  );
};

const Hero = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const closeProfile = React.useCallback(() => setProfileOpen(false), []);

  return (
    <section id="home" className="relative overflow-hidden grid-bg pt-24 md:pt-28 pb-16 px-5 md:px-10">
      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-6 items-stretch">
        {/* Left: headline */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative flex flex-col justify-center py-6 lg:py-16"
        >
          <svg viewBox="0 0 60 28" className="w-14 h-7 text-lime mb-6" aria-hidden="true">
            {[8, 22, 36].map((x) => <path key={x} d={`M${x} 26 L${x + 14} 2`} stroke="currentColor" strokeWidth="3.5" strokeLinecap="square" />)}
          </svg>
          <Kicker className="mb-4">AI-Augmented Software Developer</Kicker>
          <h1 className="font-spy font-bold uppercase leading-[0.95] text-[clamp(2.6rem,8vw,6rem)]">
            <TypedHeadline />
          </h1>
          <p className="mt-7 max-w-md text-base md:text-lg leading-relaxed text-mist">
            I build AI automation, autonomous agents and agentic workflows that are{' '}
            <strong className="text-lime font-semibold">reliable</strong>,{' '}
            <strong className="text-lime font-semibold">scalable</strong>, and{' '}
            <strong className="text-lime font-semibold">production-ready</strong>.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a href="#contact" className="cut-sm group inline-flex items-center gap-4 bg-lime px-7 py-4 font-mono text-xs font-bold uppercase tracking-[0.25em] text-void shadow-[0_0_28px_rgb(212_255_31/0.45)] hover:bg-white hover:shadow-[0_0_36px_rgb(255_255_255/0.4)] transition-all">
              <Mail size={18} />
              Contact me
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </a>
            <button type="button" onClick={() => setProfileOpen(true)} className="cut-sm group inline-flex items-center gap-3 border border-lime/70 bg-lime/5 px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.25em] text-white hover:bg-lime/15 hover:border-lime transition-colors">
              <span className="text-lime">&gt;_</span> Read profile
              <span className="caret !w-[0.5em] !h-[1em]" />
            </button>
          </div>

          {/* sits in the open space above the headline, right of the slashes */}
          <SpinBadge className="absolute hidden sm:block top-0 sm:right-[12%] lg:-top-[2%] lg:right-[20%] sm:w-32 sm:h-32 lg:w-40 lg:h-40" />
        </motion.div>

        {/* Right: the portrait, straight on the page background */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative min-h-[520px] md:min-h-[600px] lg:min-h-[680px]"
        >
          {/* sparkles */}
          <Plus className="absolute top-8 right-16 text-white/70" size={14} aria-hidden="true" />
          <Plus className="absolute top-16 right-24 text-white/40" size={10} aria-hidden="true" />
          <Plus className="absolute top-[38%] left-6 text-white/40" size={12} aria-hidden="true" />

          {/* scroll cue on the right edge */}
          <div className="absolute right-4 top-6 z-20 hidden sm:flex flex-col items-center gap-4" aria-hidden="true">
            <span className="w-10 h-12 flex items-center justify-center border border-lime/70 text-lime [clip-path:polygon(50%_0,100%_22%,100%_78%,50%_100%,0_78%,0_22%)] bg-void/30">
              <Asterisk size={18} />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/80 [writing-mode:vertical-rl]">Scroll to discover</span>
          </div>

          <HeroPhoto />

          {/* name plate, over the photo's faded bottom edge */}
          <div className="absolute left-5 right-5 bottom-5 md:left-auto md:right-6 md:bottom-7 z-10 md:text-right pointer-events-none [text-shadow:0_2px_10px_rgb(5_8_30/0.95)]">
            <p className="font-mono font-bold uppercase tracking-[0.2em] text-lime text-sm md:text-base flex md:justify-end items-center gap-2">
              Riel Jake Engaña <ChevronsRight size={18} />
            </p>
            <p className="mt-1 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-white/75">Software Developer Intern · Geidi IT</p>
          </div>
        </motion.div>
      </div>

      {createPortal(
        <AnimatePresence>
          {profileOpen && <ProfileTerminal key="profile" onClose={closeProfile} />}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
};

// --- Selected work ---

// Projects without a `url` are private: no link, shown with a lock.
const projects: { title: string; category: string; img: string; url?: string }[] = [
  { title: "Before you Dig Australia", category: "Mining Documentation Automation System", img: "/BYDA.png", url: "https://byda-frontend-268992122217.australia-southeast1.run.app/login" },
  { title: "Vehicle Management System", category: "Barangay Fleet Management Platform", img: "/VMS.webp" },
  { title: "PNPh Tourna Website", category: "Tournament Website", img: "/TOUR.png" },
  { title: "MAAI WebApp Project", category: "SEO AI Agent", img: "/maai.png", url: "https://kriti-maai-790275471938.australia-southeast1.run.app/" },
  { title: "LostLink WebApp Project", category: "Lost and Found Management", img: "/Web App.png", url: "https://paknaan-lost-link.vercel.app/" },
  { title: "Wendears Cake", category: "E-Commerce Website", img: "/Wendears.png", url: "https://wendears-cake.vercel.app/" },
  { title: "Tourmate", category: "AI Travel Companion App", img: "/Tourmate'.png", url: "https://tour-mate-ai-game-agent.vercel.app/" },
  { title: "COMS.AI", category: "Cebu Outage Monitoring System", img: "/COMS.png", url: "https://coms-ai.vercel.app/" },
  { title: "PLAYPANDA", category: "Sports & E-Sports Tournament Site", img: "/PLAYPANDA.png" }
];

const Work = () => (
  <section id="work" className="relative scroll-mt-20 py-20 md:py-28 px-5 md:px-10">
    <div className="max-w-7xl mx-auto">
      <SectionHead top="Selected" bottom="Work" blurb={`${projects.length} builds where automation meets craft, from AI agents and monitoring systems to websites and e-commerce.`} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => {
          const isPrivate = !project.url;
          return (
            <FadeIn key={project.title} delay={(i % 3) * 0.08}>
              <a
                href={project.url}
                target={isPrivate ? undefined : '_blank'}
                rel={isPrivate ? undefined : 'noopener noreferrer'}
                aria-label={isPrivate ? `${project.title} (private project)` : `Open ${project.title} in a new tab`}
                className={`brackets group flex h-full flex-col border border-electric-soft/25 bg-navy/70 p-5 transition-colors hover:border-electric-soft/60 hover:bg-panel/80 ${isPrivate ? 'cursor-default' : ''}`}
              >
                <span className="font-mono text-xs text-mist">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-2 font-display font-bold uppercase tracking-wide text-lg md:text-xl text-white leading-tight">{project.title}</h3>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-mist/80">{project.category}</p>
                <div className="relative mt-5 aspect-[16/10] overflow-hidden border border-electric-soft/20 bg-void">
                  <img
                    src={project.img}
                    alt={project.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-electric/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-5 flex items-center justify-between">
                  {isPrivate ? (
                    <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-mist/70"><Lock size={13} /> Private build</span>
                  ) : (
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-mist border-b border-mist/40 pb-0.5 group-hover:text-lime group-hover:border-lime transition-colors">View live project</span>
                  )}
                  <span className="w-8 h-8 border border-lime/70 text-lime flex items-center justify-center transition-colors group-hover:bg-lime group-hover:text-void">
                    {isPrivate ? <Lock size={14} /> : <Plus size={16} className="transition-transform duration-300 group-hover:rotate-90" />}
                  </span>
                </div>
              </a>
            </FadeIn>
          );
        })}
      </div>
    </div>
  </section>
);

// --- Stats band ---

const stats = [
  { label: "Years of experience", value: 5, minIntegerDigits: 2, Icon: CalendarDays },
  { label: "Projects completed", value: 50, suffix: "+", Icon: Rocket },
  { label: "Client rating", value: 4.5, decimalPlaces: 1, Icon: Star },
  { label: "Design awards", value: 17, Icon: Trophy }
];

const StatsBand = () => (
  <section className="px-5 md:px-10 pb-20 md:pb-28">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_340px] gap-5">
      <FadeIn className="cut relative overflow-hidden bg-linear-to-br from-electric/45 via-panel to-navy border border-electric-soft/30">
        <div className="absolute inset-0 grid-bg opacity-50" aria-hidden="true" />
        <div className="relative grid grid-cols-2 md:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} className={`flex flex-col items-center text-center px-4 py-10 md:py-12 ${i % 2 === 1 ? 'border-l' : ''} ${i >= 2 ? 'border-t md:border-t-0' : ''} md:border-l md:first:border-l-0 border-electric-soft/25`}>
              <s.Icon className="text-white/85 mb-5" size={34} strokeWidth={1.25} />
              <span className="font-display font-black text-5xl md:text-6xl text-lime neon-glow">
                <NumberTicker value={s.value} decimalPlaces={s.decimalPlaces} minIntegerDigits={s.minIntegerDigits} delay={0.15 + i * 0.12} />
                {s.suffix}
              </span>
              <span className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-mist">{s.label}</span>
            </div>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={0.1} className="cut relative overflow-hidden bg-lime text-void p-8 flex flex-col justify-between min-h-[240px]">
        <svg viewBox="0 0 200 60" className="absolute -top-2 left-0 w-full opacity-25" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx="100" cy="30" rx={95 - i * 18} ry={22 - i * 4} fill="none" stroke="currentColor" strokeWidth="0.8" />)}
        </svg>
        <p className="relative mt-8 font-mono font-bold uppercase leading-relaxed tracking-wide text-sm md:text-base">
          "Systems that<br />reason, plan<br />and execute."
        </p>
        <div className="relative mt-6 flex gap-1.5" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => <span key={i} className="h-2.5 w-3 bg-void -skew-x-[30deg]" style={{ opacity: i > 9 ? 0.25 : 1 }} />)}
        </div>
      </FadeIn>
    </div>
  </section>
);

// --- Services ---

const services = [
  { title: "Agentic Automation", Icon: Bot, desc: "Building autonomous AI agents and automated workflows that reason, plan, and execute complex tasks independently." },
  { title: "Code", Icon: Code2, desc: "Clean, performant front-end development using the latest modern frameworks and best practices." },
  { title: "Design", Icon: PenTool, desc: "Efficient, knowledgeable, and smooth experience. Highly recommended for complex UI/UX challenges." },
  { title: "Branding", Icon: Palette, desc: "Crafting unique visual identities that resonate with your audience and stand the test of time." },
  { title: "Marketing", Icon: Megaphone, desc: "Strategic digital marketing campaigns designed to drive growth and maximize ROI." },
  { title: "Video Editing", Icon: Clapperboard, desc: "Creating high-quality, engaging videos by cutting, mixing, and adding effects to tell your story." }
];

const Services = () => (
  <section id="services" className="relative scroll-mt-20 py-20 md:py-28 px-5 md:px-10 grid-bg">
    <div className="max-w-7xl mx-auto">
      <SectionHead top="What" bottom="I do" blurb="Design and engineering under one roof, with AI automation at the core." />
      <div className="grid gap-px bg-electric-soft/20 border border-electric-soft/20 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <FadeIn key={s.title} delay={(i % 3) * 0.08} className="h-full">
            <div className="group h-full bg-void p-7 md:p-8 transition-colors hover:bg-navy">
              <div className="flex items-start justify-between">
                <span className="w-12 h-12 flex items-center justify-center border border-electric-soft/40 text-white transition-colors group-hover:border-lime group-hover:text-lime">
                  <s.Icon size={22} strokeWidth={1.5} />
                </span>
                <span className="font-mono text-xs text-mist/60">/{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="mt-6 font-display font-bold uppercase tracking-wide text-xl text-white group-hover:text-lime transition-colors">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mist">{s.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

// --- Journey + education ---

const journey = [
  { year: "2022", title: "Started as a student builder", body: "I began turning curiosity into real output: websites, graphic design work, and small systems that trained my eye for details and delivery at AMA ACLC College of Mandaue.", image: "/GRAP.jpg" },
  { year: "2023", title: "Graduated at AMA", body: "Afterall, I Graduate at AMA ACLC College of Mandaue as Visual Graphic Design and Animation, but instead of continue to work, I continue my studies;", image: "/CERTS.jpg" },
  { year: "2024", title: "Joined PNPh", body: "I joined PNPh become their student scholar, Taking 2.5yrs of professional training at USJR. While focusing to study Software Development as an Associate of Computer Technology.", image: "/PN.png" },
  { year: "2025", title: "Prepared for the workplace", body: "I sharpened my portfolio, practiced professional communication, and kept delivering freelance and school projects with stronger standards.", image: "/JP.jpg" },
  { year: "2026", title: "From student to work", body: "Now I am growing as an Software Developer Intern at Geidi IT, building AI automation, agentic workflows, and production-minded tools.", image: "/GEIDI.jpg", image2: "/GEIDI-2.jpg" }
];

// A milestone with a second photo crossfades between the two.
const MilestonePhoto = ({ images, alt }: { images: string[]; alt: string }) => {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setShown((s) => (s + 1) % images.length), 4000);
    return () => clearInterval(t);
  }, [images]);
  return (
    <>
      {images.map((src, i) => (
        <img key={src} src={src} alt={i === shown ? alt : ''} aria-hidden={i !== shown} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === shown ? 'opacity-100' : 'opacity-0'}`} />
      ))}
    </>
  );
};

const education = [
  { years: "2016 – 2021", title: "Junior High School", institution: "Junior High School Science Class", body: "Completed junior high school under the Science curriculum, building the academic foundation before pursuing a technical and creative track in senior high.", link: "https://www.youtube.com/channel/UCSZq2Jfqy8chv6jnsC1E0NA", logo: "/PaknaanNHS-logo.png" },
  { years: "2022 – 2024", title: "Senior High School", institution: "ACLC College of Mandaue", body: "TVL strand, Major in Visual Graphic Design and Animation — where I first started applying design and technical skills to real projects.", link: "https://www.facebook.com/ACLCCMandaueRegistrar/", logo: "/ACLC-logo.png" },
  { years: "2024 – Present", title: "College", institution: "University of San Jose–Recoletos", body: "Associate in Computer Technology, Major in Software Development — currently completing my degree while working as a Software Developer Intern.", link: "https://en.wikipedia.org/wiki/University_of_San_Jose%E2%80%93Recoletos", logo: "/USJR-logo.png" }
];

const Journey = () => {
  const [active, setActive] = useState(journey.length - 1);
  const item = journey[active];

  return (
    <section id="journey" className="relative scroll-mt-20 py-20 md:py-28 px-5 md:px-10">
      <div className="max-w-7xl mx-auto">
        <SectionHead top="Journey" bottom="Log" blurb="From student builder to software developer intern, plus the schools that got me here." />

        {/* Year selector */}
        <div className="relative mb-10">
          <div className="absolute left-0 right-0 top-1/2 h-px bg-electric-soft/30" aria-hidden="true" />
          <div className="relative grid grid-cols-5 gap-2">
            {journey.map((j, i) => (
              <button
                key={j.year}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                className={`cut-sm mx-auto px-3 md:px-6 py-2 md:py-3 font-display font-bold text-sm md:text-2xl transition-colors ${i === active ? 'bg-lime text-void' : 'bg-void border border-electric-soft/40 text-mist hover:text-white hover:border-white/60'}`}
              >
                {j.year}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={item.year}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="brackets grid md:grid-cols-[0.9fr_1.1fr] border border-electric-soft/25 bg-navy/70"
          >
            <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[340px] overflow-hidden bg-void">
              <MilestonePhoto images={'image2' in item ? [item.image, item.image2] : [item.image]} alt={`${item.year}: ${item.title}`} />
              <div className="absolute inset-0 bg-linear-to-tr from-electric/40 via-transparent to-transparent mix-blend-screen" />
            </div>
            <div className="p-7 md:p-10 flex flex-col justify-center">
              <Kicker className="text-lime">{item.year} · Milestone {String(active + 1).padStart(2, '0')}</Kicker>
              <h3 className="mt-3 font-display font-bold uppercase tracking-wide text-2xl md:text-4xl text-white">{item.title}</h3>
              <p className="mt-4 text-base md:text-lg leading-relaxed text-mist">{item.body}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Education */}
        <div id="education" className="scroll-mt-24 mt-16">
          <Kicker className="mb-5 flex items-center gap-3"><span className="h-px w-10 bg-lime" />Education</Kicker>
          <div className="grid gap-5 md:grid-cols-3">
            {education.map((e, i) => (
              <FadeIn key={e.years} delay={i * 0.08} className="h-full">
                <div className="cut h-full flex flex-col bg-panel/60 border border-electric-soft/25 p-6">
                  <div className="flex items-center gap-4">
                    <span className="w-14 h-14 shrink-0 rounded-full bg-white p-2 ring-2 ring-electric-soft/50">
                      <img src={e.logo} alt={`${e.institution} logo`} className="w-full h-full object-contain" />
                    </span>
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-lime">{e.years}</p>
                      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-mist">{e.title}</p>
                    </div>
                  </div>
                  <h3 className="mt-5 font-display font-bold uppercase tracking-wide text-lg text-white">{e.institution}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist flex-1">{e.body}</p>
                  <a href={e.link} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 self-start font-mono text-[11px] uppercase tracking-[0.2em] text-white hover:text-lime transition-colors">
                    Visit <ArrowUpRight size={14} />
                  </a>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Experience ---

type ExpKind = 'Work' | 'Freelance' | 'OJT';
const experiences: { org: string; role: string; period: string; kind: ExpKind; Icon: typeof Code2; points: string[]; tags: string[] }[] = [
  {
    org: 'Geidi IT Services', role: 'Software Developer Intern', period: '2026 – Present', kind: 'Work', Icon: Bot,
    points: [
      'Builds and deploys production-ready AI-augmented and agentic systems',
      'Works on AI automation, autonomous agents, and multi-agent workflows',
      'Uses LLM orchestration and end-to-end process automation to ship scalable tools',
    ],
    tags: ['AI Automation', 'Agentic Workflows', 'LLM Orchestration'],
  },
  {
    org: 'Upwork & LinkedIn', role: 'Freelance Web & UI/UX Designer', period: '2024 – 2026', kind: 'Freelance', Icon: Globe,
    points: [
      'Designed responsive websites for international clients',
      'Created UI/UX prototypes in Figma',
      'Delivered branding, graphic design, and digital marketing assets',
    ],
    tags: ['Web Design', 'Figma', 'Branding'],
  },
  {
    org: 'Mandaue City Hall', role: "Job Order Documentator · PIO, Mayor's Office", period: '2023 – 2024', kind: 'Work', Icon: Camera,
    points: [
      'Documented city events and programmes as a job-order documentator',
      "Served as Public Information Officer in the Mayor's Office",
    ],
    tags: ['Documentation', 'Photography', 'Public Information'],
  },
  {
    org: 'HighLight Studio', role: 'Editor · Photographer · Encoder', period: '2023 – 2024', kind: 'Work', Icon: Film,
    points: [
      'Edited photos and videos and handled studio photography',
      'Encoded and prepared client projects',
      'Provided technical maintenance and system updates, and helped improve website performance',
    ],
    tags: ['Video Editing', 'Photography', 'Maintenance'],
  },
  {
    org: 'SunStar Cebu', role: 'Photojournalist · Editorial Cartoonist', period: '2023', kind: 'Work', Icon: PenTool,
    points: ['Covered stories as a photojournalist', 'Drew editorial cartoons for the paper'],
    tags: ['Photojournalism', 'Illustration'],
  },
  {
    org: 'EJ Cortes · Brgy. Paknaan Councilor', role: 'Videographer · Photographer · Editor', period: 'Paknaan, Mandaue', kind: 'Work', Icon: Camera,
    points: ["Shot and edited photo and video coverage for the councilor's office"],
    tags: ['Videography', 'Photography', 'Editing'],
  },
  {
    org: 'Scarlett Digital Printing & Services', role: 'Creative Intern / OJT · Tarpaulin Operator', period: '2022 – 2023', kind: 'OJT', Icon: Printer,
    points: [
      'Completed Senior High School on-the-job training as a tarpaulin operator',
      'Earned NC II certification in UI/UX Design and Visual Graphics',
      'Created UI prototypes with Figma and Adobe tools',
    ],
    tags: ['Printing', 'Figma', 'Adobe'],
  },
  {
    org: 'Bisdak influencers', role: 'Video Editor', period: '2022', kind: 'Freelance', Icon: Clapperboard,
    points: ['Edited videos for Cebuano creators such as Joseph Sabello, Patrick and Abby, and Jayat during the pandemic'],
    tags: ['Video Editing', 'Content Creation'],
  },
  {
    org: 'Amazon Kindle & Etsy', role: 'Digital Products Seller', period: 'Ongoing', kind: 'Freelance', Icon: ShoppingBag,
    points: ['Designs and sells digital products worldwide on Amazon Kindle', 'Sells digital products to Philippine buyers on Etsy'],
    tags: ['E-commerce', 'Digital Products'],
  },
];
const EXP_FILTERS = ['All', 'Work', 'Freelance', 'OJT'] as const;

const ExperienceDetail = ({ exp, index }: { exp: typeof experiences[number], index: number }) => (
  <div>
    <div className="flex items-start justify-between gap-4">
      <span className="w-14 h-14 shrink-0 flex items-center justify-center border border-lime/60 bg-lime/10 text-lime shadow-[0_0_24px_rgb(212_255_31/0.2)]">
        <exp.Icon size={26} strokeWidth={1.5} />
      </span>
      <div className="text-right">
        <span className="inline-block border border-lime/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-lime">{exp.kind}</span>
        <p className="mt-2 font-mono text-[11px] text-mist">{String(index + 1).padStart(2, '0')} / {String(experiences.length).padStart(2, '0')}</p>
      </div>
    </div>
    <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-lime">{exp.period}</p>
    <h3 className="mt-2 font-display font-bold uppercase tracking-wide text-2xl md:text-3xl text-white leading-tight">{exp.role}</h3>
    <p className="mt-1 text-mist">{exp.org}</p>
    <ul className="mt-6 space-y-3">
      {exp.points.map((pt, i) => (
        <motion.li key={pt} className="flex gap-3 text-white/85 leading-relaxed" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
          <span className="text-lime shrink-0">▸</span>{pt}
        </motion.li>
      ))}
    </ul>
    <div className="mt-6 flex flex-wrap gap-2">
      {exp.tags.map((t) => <span key={t} className="border border-electric-soft/40 bg-electric/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white/85">{t}</span>)}
    </div>
  </div>
);

// Timeline list on the left; picking a role animates its details in on the right
// (on phones the details open inline under the picked role instead).
const Experience = () => {
  const [filter, setFilter] = useState<typeof EXP_FILTERS[number]>('All');
  const [active, setActive] = useState(experiences[0].org);
  const list = experiences.filter((e) => filter === 'All' || e.kind === filter);
  const current = list.find((e) => e.org === active) ?? list[0];
  const indexOf = (e: typeof experiences[number]) => experiences.indexOf(e);

  return (
    <section id="experience" className="relative scroll-mt-20 py-20 md:py-28 px-5 md:px-10 grid-bg">
      <div className="max-w-7xl mx-auto">
        <SectionHead top="Work" bottom="Experience" blurb={`${experiences.length} roles across tech, media, and design, from OJT to building AI systems.`}>
          <div role="tablist" aria-label="Filter experience" className="flex flex-wrap gap-2">
            {EXP_FILTERS.map((f) => (
              <button
                key={f}
                role="tab"
                type="button"
                aria-selected={filter === f}
                onClick={() => { setFilter(f); const first = experiences.find((e) => f === 'All' || e.kind === f); if (first) setActive(first.org); }}
                className={`cut-sm px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${filter === f ? 'bg-lime text-void' : 'border border-electric-soft/40 text-mist hover:text-white'}`}
              >
                {f} <span className="opacity-60">{f === 'All' ? experiences.length : experiences.filter((e) => e.kind === f).length}</span>
              </button>
            ))}
          </div>
        </SectionHead>

        <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-6 items-start">
          {/* timeline list */}
          <motion.ul layout className="relative border-l border-electric-soft/30 ml-2">
            <AnimatePresence initial={false}>
              {list.map((e) => {
                const on = e === current;
                return (
                  <motion.li key={e.org} layout initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }}>
                    <button
                      type="button"
                      onClick={() => setActive(e.org)}
                      aria-pressed={on}
                      className={`relative w-full text-left pl-7 pr-4 py-4 transition-colors ${on ? 'bg-navy/90' : 'hover:bg-navy/50'}`}
                    >
                      <span className={`absolute -left-[7px] top-6 w-3 h-3 rounded-full border-2 transition-all ${on ? 'bg-lime border-lime shadow-[0_0_12px_#D4FF1F] scale-125' : 'bg-void border-electric-soft'}`} />
                      <span className="block font-mono text-[11px] uppercase tracking-[0.2em] text-mist">{e.period} · {e.kind}</span>
                      <span className={`mt-1 block font-display font-bold uppercase tracking-wide text-base md:text-lg transition-colors ${on ? 'text-lime' : 'text-white'}`}>{e.org}</span>
                      <span className="block text-sm text-mist">{e.role}</span>
                    </button>
                    {/* phones: details inline */}
                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.div className="lg:hidden overflow-hidden" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                          <div className="cut m-3 border border-electric-soft/30 bg-navy p-5"><ExperienceDetail exp={e} index={indexOf(e)} /></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>

          {/* desktop: detail panel */}
          <div className="hidden lg:block sticky top-24">
            <div className="cut relative overflow-hidden border border-electric-soft/30 bg-linear-to-br from-electric/30 via-panel to-navy p-8 min-h-[420px]">
              <div className="absolute inset-0 grid-bg opacity-50" aria-hidden="true" />
              <AnimatePresence mode="wait">
                {current && (
                  <motion.div key={current.org} className="relative" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
                    <ExperienceDetail exp={current} index={indexOf(current)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Achievements ---

type AchKind = 'Awards' | 'Certifications' | 'Recognition';
const achievements: { badge: string; title: string; org: string; year?: string; kind: AchKind }[] = [
  { badge: 'Champion', title: 'Poster Making Contest, Dance and Band', org: 'USJ-R CWTS', year: '2025', kind: 'Awards' },
  { badge: 'Champion', title: 'Battle of the Beat', org: 'USJ-R CWTS', year: '2025', kind: 'Awards' },
  { badge: 'Champion', title: 'Sinulog Photography Contest', org: 'Sinulog Festival', year: '2023', kind: 'Awards' },
  { badge: '3rd Place', title: 'Mental Health Awareness Poster Making Contest', org: 'Poster Making Contest', year: '2024', kind: 'Awards' },
  { badge: 'Best', title: 'Best Technical Manager', org: 'Don Macchiatos', year: 'Dec 2023', kind: 'Awards' },
  { badge: 'Best', title: 'Best in Character Sketching', org: 'ACLC College of Mandaue', kind: 'Awards' },
  { badge: 'Awarded', title: 'PIO for handling multiple brand-material projects', org: 'Skriptura Publication', kind: 'Awards' },
  { badge: 'Certified', title: 'Prompt Engineering', org: 'Google & Coursera', year: '2025', kind: 'Certifications' },
  { badge: 'Completed', title: 'Customer Service Training', org: 'JPMorgan Chase', year: '2025', kind: 'Certifications' },
  { badge: 'Completed', title: 'S2S Academy modules', org: 'Accenture', year: '2025', kind: 'Certifications' },
  { badge: 'NC II', title: 'UI/UX Design and Visual Graphics', org: 'Senior High School OJT', kind: 'Certifications' },
  { badge: 'Workshop', title: 'Layout Grids, Components, Color Psychology & Design Fundamentals', org: 'AMA ACLC College of Mandaue', year: '2023', kind: 'Certifications' },
  { badge: '56 projects', title: 'Completed 56 global projects before finishing Senior High School', org: 'Freelance', kind: 'Recognition' },
  { badge: 'Analyst', title: 'Business Analyst of the capstone project', org: 'USJ-R Capstone', year: '2026', kind: 'Recognition' },
];
const ACH_FILTERS = ['All', 'Awards', 'Certifications', 'Recognition'] as const;
const ACH_ICON: Record<AchKind, typeof Code2> = { Awards: Trophy, Certifications: BadgeCheck, Recognition: Award };

const Achievements = () => {
  const [filter, setFilter] = useState<typeof ACH_FILTERS[number]>('All');
  const list = achievements.filter((a) => filter === 'All' || a.kind === filter);
  const champions = achievements.filter((a) => a.badge === 'Champion').length;

  return (
    <section id="achievements" className="relative scroll-mt-20 py-20 md:py-28 px-5 md:px-10">
      <div className="max-w-7xl mx-auto">
        <SectionHead top="Achievements" bottom="& Awards" blurb={`${champions} championships, ${achievements.filter((a) => a.kind === 'Certifications').length} certifications, and the wins that shaped how I work.`}>
          <div role="tablist" aria-label="Filter achievements" className="flex flex-wrap gap-2">
            {ACH_FILTERS.map((f) => (
              <button
                key={f}
                role="tab"
                type="button"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                className={`cut-sm px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${filter === f ? 'bg-lime text-void' : 'border border-electric-soft/40 text-mist hover:text-white'}`}
              >
                {f} <span className="opacity-60">{f === 'All' ? achievements.length : achievements.filter((a) => a.kind === f).length}</span>
              </button>
            ))}
          </div>
        </SectionHead>

        <motion.ul layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((a) => {
              const Icon = ACH_ICON[a.kind];
              const top = a.badge === 'Champion';
              return (
                <motion.li
                  key={a.title}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  whileHover={{ y: -6 }}
                  className={`group cut relative overflow-hidden border p-6 transition-colors ${top ? 'border-lime/60 bg-linear-to-br from-lime/10 via-navy to-navy' : 'border-electric-soft/30 bg-navy/80 hover:border-lime/50'}`}
                >
                  {top && <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-lime shadow-[0_0_14px_#D4FF1F]" />}
                  <div className="flex items-start justify-between gap-3">
                    <span className={`w-11 h-11 flex items-center justify-center border transition-colors ${top ? 'border-lime text-lime' : 'border-electric-soft/50 text-white group-hover:border-lime group-hover:text-lime'}`}>
                      <Icon size={20} strokeWidth={1.5} />
                    </span>
                    <span className={`px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] ${top ? 'bg-lime text-void' : 'border border-lime/50 text-lime'}`}>{a.badge}</span>
                  </div>
                  <h3 className="mt-5 font-display font-bold uppercase tracking-wide text-base md:text-lg leading-snug text-white">{a.title}</h3>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-mist">{a.org}{a.year ? ` · ${a.year}` : ''}</p>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  );
};

// --- Tools ---

const toolGroups: { title: string; Icon: typeof Code2; tools: { name: string; icon: string; invert?: boolean }[] }[] = [
  {
    title: "AI & Agents", Icon: Bot,
    tools: [
      { name: "Claude", icon: "https://cdn.simpleicons.org/claude/D97757" },
      { name: "OpenAI", icon: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/openai.svg", invert: true },
      { name: "Hermes Agent", icon: "https://hermes-agent.nousresearch.com/img/desktop/badge.webp" },
      { name: "Composio", icon: "https://composio.dev/favicon.ico" },
      { name: "Sixth AI", icon: "https://trysixth.com/favicon.ico", invert: true },
      { name: "GitHub Copilot", icon: "https://cdn.simpleicons.org/githubcopilot/white" },
      { name: "Gemini", icon: "https://cdn.simpleicons.org/googlegemini/8E75B2" },
      { name: "Cursor", icon: "https://cdn.simpleicons.org/cursor/white" },
      { name: "Hugging Face", icon: "https://cdn.simpleicons.org/huggingface/FFD21E" },
      { name: "LangChain", icon: "https://cdn.simpleicons.org/langchain/white" },
      { name: "Ollama", icon: "https://cdn.simpleicons.org/ollama/white" },
      { name: "Perplexity", icon: "https://cdn.simpleicons.org/perplexity/1FB8CD" },
      { name: "DeepSeek", icon: "https://cdn.simpleicons.org/deepseek/4D6BFE" },
      { name: "Llama", icon: "https://cdn.simpleicons.org/meta/0467DF" },
      { name: "Mistral", icon: "https://cdn.simpleicons.org/mistralai/FA520F" },
      { name: "n8n", icon: "https://cdn.simpleicons.org/n8n/EA4B71" }
    ]
  },
  {
    title: "Languages", Icon: Code2,
    tools: [
      { name: "HTML", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
      { name: "CSS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
      { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
      { name: "TypeScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
      { name: "PHP", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" },
      { name: "Java", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
      { name: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
      { name: "C++", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" },
      { name: "C", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" }
    ]
  },
  {
    title: "Frameworks", Icon: Layers,
    tools: [
      { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
      { name: "Vue", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg" },
      { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
      { name: "Laravel", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg" },
      { name: "Tailwind", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
      { name: "FastAPI", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg" },
      { name: "Next.js", icon: "https://cdn.simpleicons.org/nextdotjs/white" },
      { name: "NestJS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg" },
      { name: "Express", icon: "https://cdn.simpleicons.org/express/white" },
      { name: "Angular", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angular/angular-original.svg" },
      { name: "Svelte", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg" },
      { name: "Nuxt", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nuxtjs/nuxtjs-original.svg" },
      { name: "Astro", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/astro/astro-original.svg" },
      { name: "Remix", icon: "https://cdn.simpleicons.org/remix/white" },
      { name: "Django", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg" },
      { name: "Flask", icon: "https://cdn.simpleicons.org/flask/white" },
      { name: "Spring Boot", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" },
      { name: ".NET", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dotnetcore/dotnetcore-original.svg" },
      { name: "Bootstrap", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg" },
      { name: "Sass", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg" },
      { name: "jQuery", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jquery/jquery-original.svg" },
      { name: "Redux", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg" },
      { name: "Prisma", icon: "https://cdn.simpleicons.org/prisma/white" },
      { name: "Three.js", icon: "https://cdn.simpleicons.org/threedotjs/white" },
      { name: "Vite", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" },
      { name: "React Native", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
      { name: "Flutter", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg" },
      { name: "Electron", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/electron/electron-original.svg" }
    ]
  },
  {
    title: "Databases", Icon: Database,
    tools: [
      { name: "MongoDB", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
      { name: "MySQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
      { name: "Oracle", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/oracle/oracle-original.svg" },
      { name: "Supabase", icon: "https://cdn.simpleicons.org/supabase/3ECF8E" },
      { name: "Apache Lounge", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apache/apache-original.svg" }
    ]
  },
  {
    title: "Design", Icon: Palette,
    tools: [
      { name: "Figma", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
      { name: "Canva", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/canva/canva-original.svg" },
      { name: "Photoshop", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-original.svg" },
      { name: "Illustrator", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/illustrator/illustrator-original.svg" },
      { name: "Affinity", icon: "/affinity-logotype.svg" }
    ]
  },
  {
    title: "Dev Tools & OS", Icon: Wrench,
    tools: [
      { name: "Git", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
      { name: "GitHub", icon: "https://cdn.simpleicons.org/github/white" },
      { name: "GitLab", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg" },
      { name: "Ubuntu", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ubuntu/ubuntu-original.svg" },
      { name: "Linux", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" },
      { name: "Obsidian", icon: "https://cdn.simpleicons.org/obsidian/7C3AED" },
      { name: "Notepad++", icon: "https://cdn.simpleicons.org/notepadplusplus/90E59A" }
    ]
  }
];

// Every tool in one list, split across three rows that loop in alternating directions.
const allTools = toolGroups.flatMap((g) => g.tools.map((t) => ({ ...t, group: g.title })));
const toolRows = [0, 1, 2].map((r) => allTools.filter((_, i) => i % 3 === r));

const ToolTile = ({ tool, hidden }: { tool: typeof allTools[number], hidden?: boolean }) => (
  <li aria-hidden={hidden || undefined} className="group mr-3 w-32 md:w-36 shrink-0 flex flex-col items-center gap-3 border border-electric-soft/15 bg-void/60 px-2 py-5 text-center transition-colors hover:border-lime/60">
    <span className="w-11 h-11 flex items-center justify-center drop-shadow-[0_0_10px_rgb(69_96_255/0.45)] group-hover:drop-shadow-[0_0_12px_rgb(212_255_31/0.5)] transition-[filter]">
      <img src={tool.icon} alt="" className={`w-full h-full object-contain ${tool.invert ? "invert" : ""}`} referrerPolicy="no-referrer" />
    </span>
    <span className="font-mono text-[10px] md:text-[11px] uppercase tracking-wider text-mist group-hover:text-white leading-tight">{tool.name}</span>
  </li>
);

const Tools = () => (
  <section id="tools" className="relative scroll-mt-20 py-20 md:py-28 grid-bg overflow-hidden">
    <div className="max-w-7xl mx-auto px-5 md:px-10">
      <SectionHead top="Tools" bottom="& Skills" blurb={`${allTools.length} tools across ${toolGroups.length} areas, from code and databases to AI agents and design.`} />
    </div>

    <div className="border-y border-electric-soft/25 bg-navy/80 py-5 flex flex-col gap-3" aria-label="Tools I use">
      {toolRows.map((row, r) => (
        <div key={r} className="marquee marquee-mask overflow-hidden">
          {/* the list is rendered twice and the track slides by half, so it loops seamlessly */}
          <ul
            className={`marquee-track flex w-max ${r % 2 === 1 ? 'marquee-track--reverse' : ''}`}
            style={{ '--marquee-duration': `${70 + r * 10}s` } as React.CSSProperties}
          >
            {[...row, ...row].map((tool, i) => (
              <ToolTile key={`${tool.name}-${i}`} tool={tool} hidden={i >= row.length} />
            ))}
          </ul>
        </div>
      ))}
    </div>

    <div className="max-w-7xl mx-auto px-5 md:px-10 mt-6 flex flex-wrap gap-x-6 gap-y-2">
      {toolGroups.map((g) => (
        <span key={g.title} className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-mist">
          <g.Icon size={14} className="text-lime" /> {g.title} <span className="opacity-50">{g.tools.length}</span>
        </span>
      ))}
    </div>
  </section>
);

// --- Reviews ---

type Review = typeof reviews[number];

const initials = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const Avatar = ({ review, className }: { review: Review, className: string }) =>
  review.avatarSrc ? (
    <img src={review.avatarSrc} alt={review.name} loading="lazy" className={`${className} object-cover`} />
  ) : (
    <span role="img" aria-label={review.name} className={`${className} flex items-center justify-center bg-electric text-white font-bold`}>{initials(review.name)}</span>
  );

// `dark` makes the client logos (which use dark: variants) render light.
const ReviewCard = ({ review, hidden = false }: { review: Review, hidden?: boolean }) => (
  <figure aria-hidden={hidden || undefined} className="dark w-[300px] md:w-[380px] mr-5 shrink-0 flex flex-col justify-between gap-6 border border-electric-soft/25 bg-navy/80 p-6 transition-colors hover:border-lime/50">
    <div className="flex flex-col gap-5">
      <review.Logo />
      <blockquote className="text-sm md:text-base leading-relaxed text-white/85">&ldquo;{review.quote}&rdquo;</blockquote>
    </div>
    <figcaption className="flex items-center gap-3">
      <Avatar review={review} className="w-10 h-10 shrink-0 rounded-full ring-2 ring-electric-soft/60 text-xs" />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 font-semibold text-white text-sm">
          <span className="truncate">{review.name}</span>
          <BadgeCheck size={15} className="shrink-0 text-lime" aria-label="Verified" />
        </div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-mist truncate">{review.role}</div>
      </div>
    </figcaption>
  </figure>
);

const ReviewRow = ({ items, reverse = false, duration }: { items: Review[], reverse?: boolean, duration: string }) => (
  <div className="marquee marquee-mask overflow-hidden py-2">
    <div className={`marquee-track flex w-max ${reverse ? 'marquee-track--reverse' : ''}`} style={{ '--marquee-duration': duration } as React.CSSProperties}>
      {[0, 1].map((copy) => (
        <div key={copy} className="flex">
          {[...items, ...items].map((review, i) => (
            <ReviewCard key={`${copy}-${i}-${review.id}`} review={review} hidden={copy === 1 || i >= items.length} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

const Reviews = () => {
  const [spotlight, ...rest] = reviews;
  const SpotlightLogo = spotlight.Logo;

  return (
    <section id="reviews" className="relative scroll-mt-20 py-20 md:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <SectionHead top="Client" bottom="Signals" blurb="Hear first-hand from the teams and clients I've built for." />

        <FadeIn className="cut dark relative mb-10 overflow-hidden bg-linear-to-br from-electric/50 via-panel to-navy border border-electric-soft/30 p-8 md:p-12">
          <span aria-hidden="true" className="absolute -top-8 right-6 md:right-12 font-display text-[10rem] md:text-[13rem] leading-none text-lime/20 select-none">&ldquo;</span>
          <div className="relative grid md:grid-cols-[1fr_auto] gap-8 items-end">
            <div>
              <SpotlightLogo />
              <blockquote className="mt-6 text-xl md:text-3xl leading-snug font-medium text-white">&ldquo;{spotlight.quote}&rdquo;</blockquote>
            </div>
            <figcaption className="flex items-center gap-4">
              <Avatar review={spotlight} className="w-16 h-16 shrink-0 rounded-full ring-2 ring-lime" />
              <div>
                <div className="flex items-center gap-1.5 text-lg font-semibold text-white">
                  {spotlight.name}
                  <BadgeCheck size={18} className="text-lime" aria-label="Verified" />
                </div>
                <div className="font-mono text-xs uppercase tracking-wider text-mist">{spotlight.role}</div>
              </div>
            </figcaption>
          </div>
        </FadeIn>
      </div>

      <div className="flex flex-col gap-3">
        <ReviewRow items={rest.slice(0, 4)} duration="55s" />
        <ReviewRow items={rest.slice(4)} duration="60s" reverse />
      </div>
    </section>
  );
};

// --- FAQ ---

const faqs = [
  { q: "What services do you offer?", a: "I offer a full range of design services including UI/UX design, branding, product strategy, graphic design, motion graphics, video editing, photo manipulation, system management, and web development and many more." },
  { q: "How can I contact you?", a: "You can reach out via the contact: Email: riel.engana@student.passerellesnumeriques.org. or call 09850254857" },
  { q: "How much does a project cost?", a: "Project costs vary based on scope and complexity. I provide custom quotes after an initial discovery call." },
  { q: "Which tools do you provide?", a: "I primarily use Figma for design, and for development I use HTML, CSS, PHP, JAVA, REACT, NODEJS, TYPESCRIPT, and modern web technologies like LARAVEL, TAILWIND, and ANYTHING for development, and in regards with databases, I use MongoDB, MySQL and Oracle." }
];

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative scroll-mt-20 py-20 md:py-28 px-5 md:px-10">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[0.8fr_1.2fr] gap-10">
        <div>
          <SectionHead top="Frequently" bottom="Asked" />
          <p className="text-mist max-w-sm leading-relaxed -mt-4">
            Something else on your mind? <a href="#contact" className="text-lime underline underline-offset-4">Send me a message</a> or ask Profilio Bot in the corner.
          </p>
        </div>
        <div className="border-t border-electric-soft/25">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="border-b border-electric-soft/25">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center gap-5 py-6 text-left group"
                >
                  <span className="font-mono text-xs text-lime">{String(i + 1).padStart(2, '0')}</span>
                  <span className={`flex-1 font-display font-bold uppercase tracking-wide text-lg md:text-xl transition-colors ${isOpen ? 'text-lime' : 'text-white group-hover:text-lime'}`}>{f.q}</span>
                  <span className={`w-9 h-9 shrink-0 flex items-center justify-center border transition-colors ${isOpen ? 'bg-lime border-lime text-void' : 'border-electric-soft/50 text-white'}`}>
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pl-10 pr-12 text-mist leading-relaxed">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// --- Contact ---

// Magellan's Cross kiosk (Cebu) as a rotating 3D wireframe. Octagon geometry:
// apothem = side / (2·tan 22.5°); roof faces tilt in by atan(roofApothem / roofHeight).
const KIOSK = (() => {
  const t = Math.tan(Math.PI / 8);
  const wall = { side: 44, height: 54, top: -6 };
  const roof = { side: 56, height: 34 };
  const wallApothem = wall.side / (2 * t);
  const roofApothem = roof.side / (2 * t);
  const roofSlant = Math.hypot(roofApothem, roof.height);
  const roofTilt = (Math.atan(roofApothem / roof.height) * 180) / Math.PI;
  return { wall, roof, wallApothem, roofApothem, roofSlant, roofTilt };
})();

const KioskWall = ({ arched }: { arched: boolean }) => {
  const { side: w, height: h } = KIOSK.wall;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="overflow-visible">
      <rect x="0.5" y="0.5" width={w - 1} height={h - 1} fill="rgb(30 55 255 / 0.12)" stroke="#6B83FF" strokeWidth="1.2" />
      <line x1="0" y1="5" x2={w} y2="5" stroke="#6B83FF" strokeWidth="0.8" opacity="0.7" />
      {arched ? (
        <path d={`M9 ${h} V24 A13 13 0 0 1 ${w - 9} 24 V${h}`} fill="rgb(4 5 15 / 0.35)" stroke="#9FB2FF" strokeWidth="1.3" />
      ) : (
        <>
          <line x1={w / 2} y1="5" x2={w / 2} y2={h} stroke="#6B83FF" strokeWidth="0.7" opacity="0.6" />
          <rect x="12" y="16" width={w - 24} height="24" fill="none" stroke="#6B83FF" strokeWidth="0.7" opacity="0.6" />
        </>
      )}
    </svg>
  );
};

const KioskRoofFace = () => {
  const w = KIOSK.roof.side;
  const h = KIOSK.roofSlant;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="overflow-visible">
      <path d={`M${w / 2} 0 L${w} ${h} L0 ${h} Z`} fill="rgb(69 96 255 / 0.18)" stroke="#9FB2FF" strokeWidth="1.2" strokeLinejoin="round" />
      {/* tile courses */}
      {[0.35, 0.55, 0.75, 0.9].map((f) => (
        <line key={f} x1={w / 2 - (w / 2) * f} y1={h * f} x2={w / 2 + (w / 2) * f} y2={h * f} stroke="#6B83FF" strokeWidth="0.7" opacity="0.7" />
      ))}
    </svg>
  );
};

const Kiosk = () => {
  const { wall, roof, wallApothem, roofApothem, roofSlant, roofTilt } = KIOSK;
  const faces = Array.from({ length: 8 }, (_, i) => i * 45);
  const roofTop = wall.top - roof.height;
  return (
    <div className="kiosk absolute left-1/2 top-1/2">
      {faces.map((deg, i) => (
        <div key={`w${deg}`} className="absolute" style={{ left: -wall.side / 2, top: wall.top, transform: `rotateY(${deg}deg) translateZ(${wallApothem}px)` }}>
          <KioskWall arched={i % 2 === 0} />
        </div>
      ))}
      {faces.map((deg) => (
        <div
          key={`r${deg}`}
          className="absolute"
          style={{ left: -roof.side / 2, top: wall.top - roofSlant, transformOrigin: '50% 100%', transform: `rotateY(${deg + 22.5}deg) translateZ(${roofApothem}px) rotateX(${roofTilt}deg)` }}
        >
          <KioskRoofFace />
        </div>
      ))}
      {/* floor octagon */}
      <div
        className="absolute rounded-full border border-electric-soft/60 bg-electric/15"
        style={{ width: roofApothem * 2.4, height: roofApothem * 2.4, left: -roofApothem * 1.2, top: wall.top + wall.height - roofApothem * 1.2, transform: 'rotateX(90deg)' }}
      />
      {/* cross finial on the roof peak: two crossed planes so it reads from every angle */}
      {[0, 90].map((deg) => (
        <svg key={`c${deg}`} viewBox="0 0 12 18" width="12" height="18" className="absolute overflow-visible" style={{ left: -6, top: roofTop - 17, transform: `rotateY(${deg}deg)` }}>
          <path d="M6 0 V18 M1.5 5 H10.5" stroke="#D4FF1F" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ))}
    </div>
  );
};

// Buildings as 3D wireframe boxes. Each box gets a window facade on all four
// sides (arched on the ground floor unless `arches` is off) and a lit roof slab.
type BoxSpec = { w: number; h: number; d: number; x: number; y: number; z?: number; cols: number; floors?: number; arches?: boolean };

const Facade = ({ w, h, cols, floors = 2, arches = true }: { w: number; h: number; cols: number; floors?: number; arches?: boolean }) => {
  const gap = w / cols;
  const rowH = (h - 6) / floors;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="overflow-visible">
      <rect x="0.5" y="0.5" width={w - 1} height={h - 1} fill="rgb(30 55 255 / 0.12)" stroke="#6B83FF" strokeWidth="1" />
      <line x1="0" y1="4" x2={w} y2="4" stroke="#9FB2FF" strokeWidth="0.8" />
      {Array.from({ length: floors }, (_, f) => f).map((f) =>
        Array.from({ length: cols }, (_, c) => {
          const x = c * gap + gap * 0.28;
          const ww = gap * 0.44;
          const y = 6 + f * rowH + rowH * 0.2;
          const wh = rowH * 0.6;
          return arches && f === floors - 1 ? (
            <path key={`${f}-${c}`} d={`M${x} ${y + wh} V${y + ww / 2} A${ww / 2} ${ww / 2} 0 0 1 ${x + ww} ${y + ww / 2} V${y + wh}`} fill="none" stroke="#9FB2FF" strokeWidth="0.8" />
          ) : (
            <rect key={`${f}-${c}`} x={x} y={y} width={ww} height={wh} fill="rgb(159 178 255 / 0.15)" stroke="#9FB2FF" strokeWidth="0.7" />
          );
        })
      )}
    </svg>
  );
};

const Slab = ({ w, d, x = 0, y, z = 0 }: { w: number; d: number; x?: number; y: number; z?: number }) => (
  <div className="absolute border border-electric-soft/80 bg-electric/25" style={{ width: w, height: d, left: -w / 2, top: -d / 2, transform: `translate3d(${x}px, ${y}px, ${z}px) rotateX(90deg)` }} />
);

const Box = ({ w, h, d, x, y, z = 0, cols, floors, arches }: BoxSpec) => {
  const sideCols = Math.max(1, Math.round((cols * d) / w));
  const face = (fw: number, fh: number, transform: string, content: React.ReactNode) => (
    <div className="absolute" style={{ width: fw, height: fh, left: -fw / 2, top: -fh / 2, transform }}>{content}</div>
  );
  return (
    <div className="absolute p3d" style={{ transform: `translate3d(${x}px, ${y}px, ${z}px)` }}>
      {face(w, h, `translateZ(${d / 2}px)`, <Facade w={w} h={h} cols={cols} floors={floors} arches={arches} />)}
      {face(w, h, `rotateY(180deg) translateZ(${d / 2}px)`, <Facade w={w} h={h} cols={cols} floors={floors} arches={arches} />)}
      {face(d, h, `rotateY(90deg) translateZ(${w / 2}px)`, <Facade w={d} h={h} cols={sideCols} floors={floors} arches={arches} />)}
      {face(d, h, `rotateY(-90deg) translateZ(${w / 2}px)`, <Facade w={d} h={h} cols={sideCols} floors={floors} arches={arches} />)}
      {face(w, d, `rotateX(90deg) translateZ(${h / 2}px)`, <div className="w-full h-full border border-electric-soft/80 bg-electric/20" />)}
    </div>
  );
};

// Ground level is y = 34; each box's y is its centre.
const CITY_HALL: BoxSpec[] = [
  { w: 120, h: 38, d: 30, x: 0, y: 15, cols: 9 },
  { w: 28, h: 46, d: 40, x: -70, y: 11, cols: 2 },
  { w: 28, h: 46, d: 40, x: 70, y: 11, cols: 2 },
  { w: 40, h: 58, d: 42, x: 0, y: 5, cols: 3, floors: 3 },
  { w: 22, h: 16, d: 22, x: 0, y: -32, cols: 1, floors: 1 }
];

// Mandaue City Hall: long main hall, end wings, taller centre block, attic with pediment + flag.
const CityHall = () => (
  <div className="holo-sway absolute left-1/2 top-1/2">
    {CITY_HALL.map((b, i) => <Box key={i} {...b} />)}
    <svg viewBox="0 0 30 34" width="30" height="34" className="absolute overflow-visible" style={{ left: -15, top: -74, transform: 'translateZ(11px)' }}>
      <path d="M15 0 V22" stroke="#D4FF1F" strokeWidth="1.2" />
      <path d="M15 1 H24 V6 H15" fill="rgb(212 255 31 / 0.35)" stroke="#D4FF1F" strokeWidth="0.8" />
      <path d="M1 34 L15 24 L29 34 Z" fill="rgb(69 96 255 / 0.25)" stroke="#9FB2FF" strokeWidth="1" />
    </svg>
    <Slab w={190} d={70} y={34} />
  </div>
);

// Barangay Paknaan hall: two-storey block, canopy roof between floors, roof slab,
// domed balcony canopy, outside staircase on the right, and the seal on top.
const Paknaan = () => (
  <div className="holo-sway absolute left-1/2 top-1/2">
    <Box w={96} h={64} d={50} x={0} y={2} cols={3} floors={2} arches={false} />
    <Slab w={110} d={62} y={2} />
    <Slab w={106} d={58} y={-31} />
    {/* domed canopy over the balcony door */}
    <svg viewBox="0 0 34 14" width="34" height="14" className="absolute overflow-visible" style={{ left: -17, top: -22, transform: 'translateZ(28px)' }}>
      <path d="M1 14 A16 13 0 0 1 33 14 Z" fill="rgb(69 96 255 / 0.3)" stroke="#9FB2FF" strokeWidth="1" />
    </svg>
    {/* outside staircase running up the right wall */}
    <svg viewBox="0 0 50 34" width="50" height="34" className="absolute overflow-visible" style={{ left: -25, top: 0, transform: 'rotateY(90deg) translateZ(52px)' }}>
      <path d="M2 34 h6 v-4 h6 v-4 h6 v-4 h6 v-4 h6 v-4 h6 v-4 h6 v-6" fill="none" stroke="#D4FF1F" strokeWidth="1.2" />
      <path d="M2 26 L44 0" stroke="#9FB2FF" strokeWidth="0.8" />
    </svg>
    {/* barangay seal above the roof */}
    <svg viewBox="0 0 26 26" width="26" height="26" className="absolute overflow-visible" style={{ left: -13, top: -60, transform: 'translateZ(25px)' }}>
      <circle cx="13" cy="13" r="11.5" fill="rgb(212 255 31 / 0.15)" stroke="#D4FF1F" strokeWidth="1.4" />
      <circle cx="13" cy="13" r="6.5" fill="none" stroke="#D4FF1F" strokeWidth="0.8" />
      <path d="M13 9 V17 M9 13 H17" stroke="#D4FF1F" strokeWidth="0.8" />
    </svg>
    <Slab w={150} d={80} y={34} />
  </div>
);

// One hologram per landmark, projected from a base:
// pulsing core, orbit ring, scanlines and rising particles.
const holoParticles = [[18, 0], [30, 1.1], [44, 2.3], [56, 0.6], [68, 1.8], [80, 2.9], [36, 3.2], [62, 0.3]] as const;
const LANDMARKS = [
  { label: "Province of Cebu", Model: Kiosk },
  { label: "Mandaue City", Model: CityHall },
  { label: "Barangay Paknaan", Model: Paknaan }
];

const Hologram = ({ landmark, className = "" }: { landmark: typeof LANDMARKS[number], className?: string }) => {
  const { label, Model } = landmark;

  return (
    <div className={`relative w-64 h-80 shrink-0 ${className}`} aria-hidden="true">
      {holoParticles.map(([left, delay], i) => (
        <span key={i} className="holo-particle" style={{ left: `${left}%`, animationDelay: `${delay}s` }} />
      ))}

      {/* light beam + projector base */}
      <div className="holo-beam absolute bottom-7 left-1/2 -translate-x-1/2 w-56 h-52" />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-40 h-8 rounded-[50%] border-2 border-electric-soft bg-electric/30 shadow-[0_0_30px_rgb(69_96_255/0.8)]" />
      <div className="absolute bottom-[1.15rem] left-1/2 -translate-x-1/2 w-14 h-3 rounded-[50%] bg-lime/80 blur-[3px]" />

      {/* the projection */}
      <div className="holo-flicker absolute left-1/2 top-8 -translate-x-1/2 w-48 h-48 drop-shadow-[0_0_10px_rgb(69_96_255/0.9)]">
        {/* perspective sits on this wrapper because it only reaches direct children */}
        <div className="absolute inset-0 [perspective:800px]">
          <Model />
        </div>
        <div className="core-pulse absolute left-1/2 top-[58%] -ml-4 -mt-4 w-8 h-8 rounded-full bg-white/80 blur-[10px]" />

        {/* orbit ring: a squashed parent turns the spinning circle into an ellipse */}
        <div className="absolute -inset-2 top-[40%] bottom-[-30%]" style={{ transform: 'scaleY(0.22)' }}>
          <div className="orbit absolute inset-0 rounded-full border border-dashed border-mist/60">
            <span className="absolute -top-1.5 left-1/2 -ml-1.5 w-3 h-3 rounded-full bg-lime shadow-[0_0_10px_#D4FF1F]" />
          </div>
        </div>

        <div className="holo-scan absolute -inset-6 mix-blend-screen" />
      </div>

      <p className="absolute bottom-[-0.75rem] inset-x-0 text-center font-mono text-[9px] uppercase tracking-[0.3em] text-electric-soft">
        <span className="text-lime">●</span> {label}
      </p>
    </div>
  );
};

const contactRows = [
  { Icon: Mail, label: "riel.engana@student.passerellesnumeriques.org", href: "mailto:riel.engana@student.passerellesnumeriques.org" },
  { Icon: Phone, label: "0985 025 4857", href: "tel:09850254857" },
  { Icon: Linkedin, label: "in/riel-jake-engana", href: SOCIAL_LINKS[0].href },
  { Icon: Github, label: "@Jekx-geidi", href: SOCIAL_LINKS[3].href }
];

const Contact = () => {
  const field = "w-full bg-void/70 border border-electric-soft/30 px-4 py-3.5 text-white placeholder:text-mist/50 outline-none transition-colors focus:border-lime";
  const label = "font-mono text-[11px] uppercase tracking-[0.2em] text-mist";

  return (
    <section id="contact" className="relative scroll-mt-20 py-20 md:py-28 px-5 md:px-10">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="cut relative overflow-hidden border border-electric-soft/30 bg-navy">
          <div className="absolute inset-0 grid-bg opacity-60" aria-hidden="true" />
          <div className="relative grid lg:grid-cols-[1.1fr_1fr_auto] gap-10 p-7 md:p-10">
            {/* Heading + location */}
            <div className="relative">
              <h2 className="font-display font-black uppercase leading-[0.95] text-5xl md:text-6xl">
                <span className="text-white">Let's</span><br />
                <span className="text-lime neon-glow">Connect</span>
              </h2>
              <p className="mt-5 max-w-xs font-mono text-xs uppercase leading-relaxed tracking-[0.15em] text-mist">
                I'm always open to new ideas, collaborations, and exciting projects.
              </p>
              <div className="mt-8">
                <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-mist">
                  <span className="w-10 h-10 rounded-full border border-electric-soft/50 flex items-center justify-center text-white"><MapPin size={16} /></span>
                  Based in<br />Paknaan, Mandaue<br />Cebu, PH
                </div>
              </div>
            </div>

            {/* Get in touch */}
            <div>
              <h3 className="font-mono font-bold text-sm uppercase tracking-[0.25em] text-lime pb-3 border-b border-lime/40">Get in touch</h3>
              <ul className="mt-5 space-y-4">
                {contactRows.map(({ Icon, label: text, href }) => (
                  <li key={href}>
                    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="group flex items-center gap-4 min-w-0">
                      <Icon size={18} className="shrink-0 text-electric-soft group-hover:text-lime transition-colors" />
                      <span className="truncate text-sm text-white/85 group-hover:text-lime transition-colors">{text}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex gap-2">
                {SOCIAL_LINKS.map(({ href, label: name, Icon }) => (
                  <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={name} className="w-10 h-10 border border-electric-soft/40 flex items-center justify-center text-mist hover:text-void hover:bg-lime hover:border-lime transition-colors">
                    <Icon size={17} />
                  </a>
                ))}
              </div>
            </div>

            {/* QR */}
            <div className="w-fit justify-self-center lg:justify-self-auto flex flex-col items-stretch gap-3 self-start">
              <div className="relative p-4 border-2 border-lime/80">
                <img src="/qr-portfolio.svg" alt="QR code to profilio-e26e.vercel.app" className="w-32 h-32" />
              </div>
              <span className="w-full text-center bg-lime text-void font-mono font-bold text-xs uppercase tracking-[0.25em] py-2">Scan me!</span>
            </div>
          </div>

          {/* Holograms, zooming in from province to city to barangay */}
          <div className="relative grid sm:grid-cols-3 gap-10 sm:gap-4 justify-items-center px-7 md:px-10 pb-12">
            {LANDMARKS.map((l) => <Hologram key={l.label} landmark={l} />)}
          </div>

          {/* Form */}
          <form action="https://formsubmit.co/rieljake.engana.24@usjr.edu.ph" method="POST" className="relative border-t border-electric-soft/25 p-7 md:p-10 grid md:grid-cols-2 gap-5">
            <input type="hidden" name="_subject" value="You have New Message from your client Jake!" />
            <input type="hidden" name="_captcha" value="false" />
            <p className="md:col-span-2 font-mono text-xs uppercase tracking-[0.25em] text-white"><span className="text-lime">&gt;_</span> Send a transmission</p>
            <div className="space-y-2">
              <label htmlFor="contact-name" className={label}>Full name</label>
              <input id="contact-name" type="text" name="name" required placeholder="Name" className={field} />
            </div>
            <div className="space-y-2">
              <label htmlFor="contact-email" className={label}>Email</label>
              <input id="contact-email" type="email" name="email" required placeholder="yourname@email.com" className={field} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="contact-message" className={label}>Message</label>
              <textarea id="contact-message" name="message" required rows={5} placeholder="Write your message..." className={`${field} resize-none`} />
            </div>
            <button type="submit" className="cut-sm md:col-span-2 md:justify-self-start inline-flex items-center justify-center gap-3 bg-lime text-void px-8 py-4 font-mono font-bold text-xs uppercase tracking-[0.25em] hover:bg-white transition-colors">
              <Send size={16} /> Send message
            </button>
          </form>
        </FadeIn>
      </div>
    </section>
  );
};

// --- Footer ---

const Ticker = () => (
  <div className="bg-electric overflow-hidden py-3" aria-hidden="true">
    <div className="marquee-track flex w-max" style={{ '--marquee-duration': '30s' } as React.CSSProperties}>
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} className="flex items-center gap-6 px-6 font-mono text-xs uppercase tracking-[0.3em] text-white whitespace-nowrap">
          <Asterisk size={14} /> Let's build the future together
        </span>
      ))}
    </div>
  </div>
);

const Footer = () => (
  <footer>
    <Ticker />
    <div className="px-5 md:px-10 py-10 bg-void border-t border-electric-soft/20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
        <BrandMark />
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {NAV_LINKS.map((l) => (
            <li key={l.href}><a href={l.href} className="font-mono text-[11px] uppercase tracking-[0.2em] text-mist hover:text-lime transition-colors">{l.label}</a></li>
          ))}
        </ul>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-mist/60">© 2026 Riel Jake Engaña</p>
      </div>
    </div>
  </footer>
);

export default function PortfolioPage() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    document.documentElement.style.colorScheme = 'dark';
  }, []);

  useEffect(() => {
    const target = window.location.hash ? document.querySelector(window.location.hash) : null;
    if (target) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-void text-white">
      {/* soft electric glow at the top of the page */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(ellipse_at_70%_0%,rgb(30_55_255/0.28),transparent_60%)]" aria-hidden="true" />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <Work />
        <StatsBand />
        <Services />
        <Journey />
        <Experience />
        <Achievements />
        <Tools />
        <Reviews />
        <FAQ />
        <Contact />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
      <ChatBot />
      <CheckIn />
    </div>
  );
}
