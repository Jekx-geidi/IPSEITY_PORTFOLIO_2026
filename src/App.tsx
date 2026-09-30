import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveSectionContext, useActiveSection, useSectionActive, useTrackActiveSection } from './activeSection';
import { AnimatedAsset } from './components/PortfolioMotion/PortfolioMotion';
import Logo from './components/Logo/Logo';
import Reviews from './components/Reviews/Reviews';
import BmoChat from './components/BmoChat/BmoChat';
import TreasureChest from './components/TreasureChest/TreasureChest';
import ScrollExpand from './components/ScrollExpand/ScrollExpand';
import NumberTicker from './components/NumberTicker/NumberTicker';
import { DiaTextReveal } from './components/DiaTextReveal/DiaTextReveal';
import { 
  Linkedin, 
  Instagram, 
  Dribbble, 
  Plus, 
  Minus, 
  ArrowUpRight, 
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Facebook,
  Github,
  Download,
  Heading1,
  Code2,
  Layers,
  Database,
  Bot,
  Palette,
  Wrench,
  Menu,
  X,
  Play,
  Pause
} from 'lucide-react';

// --- Components ---

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
      data-motion-card={className.includes("motion-stat") || undefined}
      variants={variants}
    >
      {children}
    </motion.div>
  );
};

// Navbar look per section (see activeSection.ts). Each also sets the hover
// colour of .nav-link so links stay readable on that section's surface.
const NAV_THEMES: Record<string, string> = {
  home:      'bg-jake-cream/90 border-jake-wood/25 text-jake-ink [&_.nav-link:hover]:text-jake-wood',
  services:  'bg-bmo-screen/90 border-bmo-ink/20 text-bmo-ink [&_.nav-link:hover]:text-bmo-slot',
  about:     'bg-finn-hat/90 border-finn-ink/15 text-finn-ink [&_.nav-link:hover]:text-finn-shorts',
  journey:   'bg-marcy-hair/85 border-marcy-skin/15 text-marcy-skin [&_.nav-link:hover]:text-marcy-red',
  education: 'bg-gunter-belly/95 border-gunter-navy/15 text-gunter-navy [&_.nav-link:hover]:text-gunter-gold-deep',
  portfolio: 'bg-pb-skin/90 border-pb-magenta/20 text-pb-ink [&_.nav-link:hover]:text-pb-magenta',
  reviews:   'bg-fire-ember/85 border-fire-hair/20 text-fire-cream [&_.nav-link:hover]:text-fire-gold',
  tools:     'bg-rain-blush/90 border-rain-purple/20 text-rain-ink [&_.nav-link:hover]:text-rain-purple',
  faq:       'bg-lsp-mist/90 border-lsp-deep/15 text-lsp-deep [&_.nav-link:hover]:text-lsp-ink',
  contact:   'bg-ik-navy/85 border-ik-skin/20 text-white [&_.nav-link:hover]:text-ik-crown',
};
const NAV_DEFAULT = 'bg-white/70 border-black/5 text-ink';

// Download Resume button per section, in that character's colours. (Themed
// entries use plain bg utilities; title-bg is only the default, since its
// unlayered gradient would override them.)
const RESUME_THEMES: Record<string, string> = {
  home:      'bg-jake-fur text-jake-hoodie border-2 border-jake-hoodie shadow-jake-wood/40',
  services:  'bg-bmo-pink text-bmo-ink border-2 border-bmo-ink shadow-bmo-ink/25',
  about:     'bg-finn-shorts text-white border-2 border-finn-ink shadow-finn-ink/25',
  journey:   'bg-marcy-red text-white border-2 border-marcy-skin/40 shadow-marcy-red/40',
  education: 'bg-gunter-gown text-gunter-gold border-2 border-gunter-gold shadow-gunter-navy/30',
  portfolio: 'bg-pb-pink text-white border-2 border-pb-ink shadow-pb-magenta/30',
  reviews:   'bg-linear-to-b from-fire-gold via-fire-hair to-fire-flame text-fire-ember border-2 border-fire-gold/60 shadow-fire-flame/40',
  tools:     'bg-rain-purple text-white border-2 border-rain-ink shadow-rain-pink/50',
  faq:       'bg-lsp-body text-lsp-ink border-2 border-lsp-ink shadow-lsp-deep/30',
  contact:   'bg-ik-crown text-ik-navy border-2 border-ik-navy shadow-ik-crown/40',
};
const RESUME_DEFAULT = 'title-bg text-white border-2 border-transparent shadow-title/30';

// Full-bleed themed background that fades in only while its section is current.
// Parent section must be `relative`, and its content `relative` so it paints above.
const SectionBackdrop = ({ show, className = "", children }: { show: boolean, className?: string, children?: React.ReactNode }) => (
  <div
    aria-hidden="true"
    className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${show ? 'opacity-100' : 'opacity-0'} ${className}`}
  >
    {children}
  </div>
);

// Shared by the navbar (desktop row + mobile menu) and the footer.
const NAV_LINKS = [
  { href: '#services', label: 'Services' },
  { href: '#education', label: 'Education' },
  { href: '#portfolio', label: 'Portfolio' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' }
];
const SOCIAL_LINKS = [
  { href: 'https://www.linkedin.com/in/riel-jake-engana-585644372/', label: 'LinkedIn', Icon: Linkedin },
  { href: 'https://www.instagram.com/real_jexkz/?hl=en', label: 'Instagram', Icon: Instagram },
  { href: 'https://www.facebook.com/Engana08', label: 'Facebook', Icon: Facebook },
  { href: 'https://github.com/Jekx-geidi', label: 'GitHub', Icon: Github }
];

// Background song toggle. Browsers block autoplay (scrolling doesn't count as a
// user gesture), so the visitor starts it with a tap; it loops while playing.
const SONG_SRC = '/' + encodeURIComponent('Island Song (Come Along with Me) (feat. Ashley Eriksson).mp3');

const MusicToggle = ({ className = "" }: { className?: string }) => {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={SONG_SRC}
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? 'Pause song' : 'Play song'}
        title={playing ? 'Pause song' : 'Play song: Island Song'}
        className={`w-10 h-10 shrink-0 rounded-full border border-current/25 flex items-center justify-center hover:bg-current/10 transition-colors ${className}`}
      >
        {playing ? <Pause size={18} /> : <Play size={18} className="translate-x-px" />}
      </button>
    </>
  );
};

// Desktop/laptop (lg+): full link row + Resume. Phones/tablets: logo, Resume
// and a burger that drops a menu panel in the current section's theme.
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const section = useActiveSection();
  const theme = (section && NAV_THEMES[section]) || NAV_DEFAULT;
  const resumeTheme = (section && RESUME_THEMES[section]) || RESUME_DEFAULT;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
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

  // An open menu needs a solid bar even at the very top of the page.
  const solid = isScrolled || menuOpen;

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

  return (
    <nav
      className={`fixed z-50 transition-all duration-500 ${
        solid
          ? `top-3 md:top-4 left-3 right-3 md:left-6 md:right-6 lg:left-12 lg:right-12 rounded-xl backdrop-blur-xl shadow-lg border ${theme}`
          : 'top-0 left-0 right-0 rounded-none bg-transparent border border-transparent text-ink'
      }`}
    >
      <div className={`flex justify-between items-center gap-3 px-4 md:px-6 transition-all duration-500 ${solid ? 'py-3 md:py-4' : 'py-5 md:py-6'}`}>
        <a href="#" className="flex items-center shrink-0" onClick={() => setMenuOpen(false)}>
          <Logo className="text-lg md:text-2xl" />
        </a>
        <div className="hidden lg:flex items-center gap-8 font-medium">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="nav-link hover:text-jake transition-colors">{l.label}</a>
          ))}
        </div>
        <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
          <a
            href="/RIEL JAKE_ENGANA _VERCEL RESUME_ Geidi.jpg"
            download
            className={`flex items-center gap-2 ${resumeTheme} px-3.5 md:px-6 py-2 rounded-full font-semibold text-xs md:text-sm hover:scale-105 transition-all duration-300 shadow-lg`}
          >
            <Download size={16}/>
            <span className="hidden sm:inline">Download Resume</span>
            <span className="inline sm:hidden">Resume</span>
          </a>
          {/* Mobile: between Resume and the burger. Desktop: left of Resume. */}
          <MusicToggle className="lg:order-first" />
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="lg:hidden w-10 h-10 shrink-0 rounded-full border border-current/25 flex items-center justify-center hover:bg-current/10 transition-colors"
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
            <div className="px-4 md:px-6 pb-5 border-t border-current/10">
              <ul className="flex flex-col pt-2">
                {NAV_LINKS.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.04 }}
                  >
                    <a
                      href={l.href}
                      onClick={(e) => goToSection(e, l.href)}
                      className="nav-link flex items-center justify-between py-3 text-xl font-display font-bold border-b border-current/10 transition-colors"
                    >
                      {l.label}
                      <ArrowUpRight size={18} className="opacity-50" />
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// Coding Jake that waves and says hi on hover (tap toggles on touch screens).
// Both images share one crop (see public/jake-*.webp) so the swap doesn't shift.
const HeroJake = () => {
  const [waving, setWaving] = useState(false);
  // Touch taps also fire emulated mouse-enter then click, which toggled the wave on and
  // straight back off. Hover (mouse only) shows it; a tap/click toggles it once.
  const pointerType = React.useRef<string>('mouse');

  return (
    <div
      className="relative w-full max-w-xl lg:w-[125%] lg:max-w-none cursor-pointer select-none"
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
      <motion.div
        animate={waving ? { y: [0, -14, 0], rotate: [0, -1.5, 1.5, 0] } : { y: 0, rotate: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative"
      >
        <img
          src="/jake-coding.webp"
          alt="Jake the Dog coding on a laptop at a desk"
          width={1200}
          height={671}
          className={`w-full h-auto drop-shadow-2xl transition-opacity duration-200 ${waving ? 'opacity-0' : 'opacity-100'}`}
          draggable={false}
        />
        <img
          src="/jake-wave.webp"
          alt=""
          aria-hidden="true"
          width={1200}
          height={671}
          className={`absolute inset-0 w-full h-auto drop-shadow-2xl transition-opacity duration-200 ${waving ? 'opacity-100' : 'opacity-0'}`}
          draggable={false}
        />
      </motion.div>

      <AnimatePresence>
        {waving && (
          // Phones/tablets: centred above Jake's head. lg+: beside his head (left 62%). The outer
          // div positions (no transform) so motion's scale/y on the inner one can't undo it.
          <div key="jake-hi" className="absolute inset-x-0 -top-14 lg:-top-10 lg:inset-x-auto lg:left-[62%] z-10 flex justify-center lg:block pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.4, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 6 }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
            style={{ transformOrigin: 'bottom center' }}
            role="status"
          >
            <div className="relative whitespace-nowrap rounded-2xl border-4 border-ink bg-white px-5 py-2.5 md:px-5 md:py-3 font-display text-2xl md:text-3xl text-ink shadow-[4px_4px_0_var(--color-ink)]">
              Hi I am <span className="text-jake">Jake!</span>
              {/* Bubble tail pointing down-left toward Jake's head */}
              <span className="absolute -bottom-[14px] left-5 h-0 w-0 border-x-[10px] border-t-[14px] border-x-transparent border-t-ink" />
              <span className="absolute -bottom-[8px] left-[23px] h-0 w-0 border-x-[7px] border-t-[10px] border-x-transparent border-t-white" />
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PROFILE_TEXT = [
  "Hi, I'm Riel Jake Engaña, a Software-Augmented Software Developer Intern at Geidi IT, specializing in AI automation and intelligent software systems. My work focuses on developing AI-augmented applications, autonomous agents, and agentic workflows capable of reasoning, planning, and executing complex tasks.",
  "My background combines the analytical and process-oriented principles of Industrial Engineering with practical experience in software development and artificial intelligence. I work with multi-agent architectures, LLM orchestration, AI integration, and end-to-end process automation to develop efficient and scalable software solutions.",
  "Currently, I contribute to the development and deployment of production-ready AI-augmented and agentic systems at Geidi IT while completing my degree in Software Development at the University of San Jose–Recoletos (USJ-R)."
].join("\n\n");

// "Read Profile": the parchment unrolls, then the bio is written onto it a few
// letters at a time in handwriting, and signed. Skip / Esc / backdrop close.
const ProfileScroll = ({ onClose }: { onClose: () => void }) => {
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [count, setCount] = useState(reduceMotion ? PROFILE_TEXT.length : 0);
  const done = count >= PROFILE_TEXT.length;
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const textRef = React.useRef<HTMLDivElement>(null);

  // write ~2 letters every 22ms, starting once the paper has unrolled
  useEffect(() => {
    if (done) return;
    let tick: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      tick = setInterval(() => setCount((c) => Math.min(PROFILE_TEXT.length, c + 2)), 22);
    }, 700);
    return () => { clearTimeout(start); if (tick) clearInterval(tick); };
  }, [done]);

  // keep the pen in view as the text grows
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
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-jake-hoodie/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-scroll-title"
    >
      <motion.div
        className="parchment @container relative flex w-[min(94vw,880px)] h-[min(90vh,1040px)] drop-shadow-[0_24px_40px_rgba(0,0,0,0.45)]"
        style={{ transformOrigin: 'center' }}
        initial={{ scaleY: 0.08, opacity: 0, rotate: -2 }}
        animate={{ scaleY: 1, opacity: 1, rotate: 0 }}
        exit={{ scaleY: 0.08, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 140, damping: 18 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex-1 min-w-0 flex flex-col px-[2cqw] pt-[1cqw]">
          <h2 id="profile-scroll-title" className="handwriting font-bold text-[clamp(26px,min(7cqw,5vh),54px)] leading-none -rotate-2 mb-[0.5em]">
            About me
          </h2>
          <div
            ref={textRef}
            className="handwriting flex-1 min-h-0 overflow-y-auto no-scrollbar whitespace-pre-line text-[clamp(15px,min(3.4cqw,2.45vh),24px)] leading-[1.32] -rotate-[0.3deg] pr-1"
            aria-live="off"
          >
            <span className="sr-only">{PROFILE_TEXT}</span>
            <span aria-hidden="true">
              {PROFILE_TEXT.slice(0, count)}
              {!done && <span className="pen-tip" />}
            </span>
          </div>
          {done && (
            <motion.div
              className="self-end mt-1 flex flex-col items-end"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="handwriting font-bold text-[clamp(24px,min(6cqw,4.4vh),46px)] leading-none -rotate-3">— Jake</span>
              <svg viewBox="0 0 140 14" className="w-28 h-3 -mt-1" aria-hidden="true">
                <motion.path
                  d="M2 9 C 30 2, 60 13, 90 6 S 130 4, 138 8"
                  fill="none"
                  stroke="#2B1A0A"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </svg>
            </motion.div>
          )}
        </div>
      </motion.div>

      <div className="absolute top-4 right-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {!done && (
          <button
            type="button"
            onClick={() => setCount(PROFILE_TEXT.length)}
            className="rounded-full bg-jake-fur text-jake-hoodie border-2 border-jake-hoodie px-4 py-2 text-sm font-bold uppercase tracking-widest"
          >
            Skip
          </button>
        )}
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close profile"
          className="w-11 h-11 rounded-full bg-white text-jake-hoodie border-2 border-jake-hoodie flex items-center justify-center text-xl font-bold"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
};

// Sweep colours for the headline reveal: Jake's fur, desk, and the books on it.
const JAKE_SWEEP = ['#F9BB00', '#DE8234', '#B5352E', '#2E4C7C', '#285039'];

// Jake-themed hero: warm cream -> golden backdrop over the Tree Fort scene,
// cocoa headline with Jake-orange "AI" and Jake-yellow "Software" (orange offset shadow),
// desk-book coloured tags, and Jake at his desk.
const Hero = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const closeProfile = React.useCallback(() => setProfileOpen(false), []);

  return (
  <section id="home" className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden px-6 md:px-20 bg-linear-to-b from-jake-cream via-[#FFEAB0] to-[#FFD65C]">
    <img
      src="/BG.webp"
      alt=""
      aria-hidden="true"
      className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-multiply select-none pointer-events-none"
      style={{
        maskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)'
      }}
    />
    {/* Warm wash behind the headline, clearing toward Jake on the right */}
    <div className="absolute inset-0 pointer-events-none bg-linear-to-r from-jake-cream/85 via-jake-cream/35 to-transparent" />

    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center w-full max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10"
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-jake-hoodie text-jake-fur px-4 py-2 text-sm font-bold tracking-wide shadow-[3px_3px_0_var(--color-jake-wood)]">
          Hi, I'm Riel Jake Engaña
        </span>
        <h1 className="mt-6 text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-[0.9] tracking-tighter text-jake-ink">
          <DiaTextReveal text="AI" colors={JAKE_SWEEP} textColor="var(--color-jake-wood)" delay={0.2} duration={1.1} startOnView={false} />{' '}
          <DiaTextReveal text="Augmented," colors={JAKE_SWEEP} textColor="var(--color-jake-ink)" delay={0.45} duration={1.3} startOnView={false} /><br />
          <DiaTextReveal text="Software" colors={JAKE_SWEEP} textColor="var(--color-jake-fur)" delay={0.85} duration={1.3} startOnView={false} className="jake-shadow" /><br />
          <DiaTextReveal text="Developer." colors={JAKE_SWEEP} textColor="var(--color-jake-ink)" delay={1.25} duration={1.3} startOnView={false} />
        </h1>
        <p className="mt-6 max-w-lg text-lg md:text-xl leading-relaxed text-jake-ink/75 font-medium">
          Software Developer Intern at Geidi IT, building AI automation, autonomous agents and agentic workflows.
        </p>
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Focus areas">
          {[
            { label: "AI Automation", cls: "bg-jake-book-red" },
            { label: "Agentic Workflows", cls: "bg-jake-book-blue" },
            { label: "Full-Stack Development", cls: "bg-jake-book-green" }
          ].map((t) => (
            <li key={t.label} className={`${t.cls} text-white text-xs md:text-sm font-bold uppercase tracking-wider rounded-md px-3 py-1.5 border-2 border-jake-hoodie shadow-[2px_2px_0_var(--color-jake-hoodie)]`}>
              {t.label}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-6 mt-9">
          <a href="#contact" className="glitch-btn glitch-btn--jake" data-text="ENQUIRE">ENQUIRE</a>
          <button type="button" onClick={() => setProfileOpen(true)} className="glitch-btn glitch-btn--jake-alt" data-text="READ PROFILE">READ PROFILE</button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative flex justify-center lg:justify-start"
      >
        {/* warm glow under Jake */}
        <div className="absolute inset-x-[10%] bottom-[6%] h-[30%] rounded-full bg-jake-wood/25 blur-3xl" aria-hidden="true" />
        <HeroJake />
      </motion.div>
    </div>

    {/* Portal to <body> so the modal sits above the fixed navbar; AnimatePresence
        goes inside the portal (it ignores portal objects as direct children). */}
    {createPortal(
      <AnimatePresence>
        {profileOpen && <ProfileScroll key="profile" onClose={closeProfile} />}
      </AnimatePresence>,
      document.body
    )}
  </section>
  );
};

const ServiceAccordion = () => {
  const [expanded, setExpanded] = useState<number | null>(1);
  const onSection = useSectionActive('services');

  const services = [
    { id: 0, title: "Branding", desc: "Crafting unique visual identities that resonate with your audience and stand the test of time." },
    { id: 1, title: "Design", desc: "Efficient, knowledgeable, and smooth experience. Highly recommended for complex UI/UX challenges." },
    { id: 2, title: "Marketing", desc: "Strategic digital marketing campaigns designed to drive growth and maximize ROI." },
    { id: 3, title: "Code", desc: "Clean, performant front-end development using the latest modern frameworks and best practices." },
    { id: 4, title: "Video Editing", desc: "Creating high-quality, engaging videos by cutting, mixing, and adding effects to tell your story." },
    { id: 5, title: "Agentic Automation", desc: "Building autonomous AI agents and automated workflows that reason, plan, and execute complex tasks independently." }
  ];

  return (
    // BMO-themed: body-teal backdrop, screen-cream cards with BMO's line-art
    // outline and a hard cartoon shadow, D-pad / big-pink-button toggles.
    <section id="services" className="relative overflow-hidden py-32 px-6 text-bmo-ink">
      <SectionBackdrop show={onSection} className="bg-linear-to-b from-bmo to-bmo-shade">
        {/* Tree Fort scene, dimmed and faded at the edges like the hero background */}
        <img
          src="/bmo-bg.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-35 select-none"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 80%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 80%, transparent 100%)'
          }}
        />
      </SectionBackdrop>
      <div className="relative max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between lg:items-end mb-16 lg:mb-20 gap-8">
          <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter text-bmo-ink">
            My Specialized<br /><span className="bmo-outline text-bmo-pink">Services.</span>
          </h2>
          <div className="flex items-end gap-6">
            <div className="flex flex-col gap-4 pb-4">
              {/* BMO's face buttons as a little accent row */}
              <div className="flex items-center gap-3" aria-hidden="true">
                <span className="w-6 h-6 bg-bmo-blue border-[3px] border-bmo-ink [clip-path:polygon(50%_0,100%_100%,0_100%)]" />
                <span className="w-4 h-4 rounded-full bg-bmo-yellow border-[3px] border-bmo-ink" />
                <span className="w-3 h-3 rounded-full bg-bmo-pink border-2 border-bmo-ink" />
                <span className="w-10 h-3 rounded-full bg-bmo-slot border-2 border-bmo-ink" />
              </div>
              <p className="text-bmo-ink/80 max-w-xs text-lg font-medium">
                I provide comprehensive design solutions tailored to your business goals.
              </p>
            </div>
            <AnimatedAsset
              src="/bmo.webp"
              alt="BMO from Adventure Time sitting and smiling"
              width={600}
              height={577}
              animate={{ y: [0, -10, 0], rotate: [0, -2, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              className="w-32 md:w-48 h-auto shrink-0 select-none drop-shadow-[6px_6px_0_rgba(23,4,20,0.25)]"
              draggable={false}
            />
          </div>
        </div>

        <div className="space-y-5">
          {services.map((service, idx) => {
            const isOpen = expanded === service.id;
            return (
            <FadeIn
              key={service.id}
              delay={idx * 0.1}
              data-motion-card
              className={`rounded-[1.75rem] border-4 border-bmo-ink bg-bmo-screen overflow-hidden transition-all duration-300 ${
                isOpen ? 'shadow-[8px_8px_0_var(--color-bmo-ink)] ' : 'shadow-[5px_5px_0_var(--color-bmo-ink)] hover:shadow-[8px_8px_0_var(--color-bmo-ink)]'
              }`}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : service.id)}
                aria-expanded={isOpen}
                className="w-full p-6 md:px-8 md:py-9 flex justify-between items-center text-left gap-4"
              >
                <span className="text-2xl md:text-5xl font-display font-bold tracking-tight text-bmo-ink">
                  {service.title}
                </span>
                <div className={`w-11 h-11 md:w-14 md:h-14 shrink-0 flex items-center justify-center border-[3px] border-bmo-ink text-bmo-ink transition-all duration-300 ${
                  isOpen ? 'rounded-full bg-bmo-pink shadow-[inset_0_-4px_0_rgba(23,4,20,0.25)]' : 'rounded-xl bg-bmo-yellow shadow-[inset_0_-4px_0_rgba(23,4,20,0.2)]'
                }`}>
                  {isOpen ? <Minus strokeWidth={3} /> : <Plus strokeWidth={3} />}
                </div>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 md:px-8 md:pb-9 max-w-2xl">
                      {/* BMO's screen slot */}
                      <span className="block w-20 h-3 mb-4 rounded-full bg-bmo-slot border-2 border-bmo-ink" aria-hidden="true" />
                      <p className="text-lg md:text-xl text-bmo-slot font-medium leading-relaxed">
                        {service.desc}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Finn-themed: shirt-to-shorts blue backdrop, hat-white outlined quote, a
// Finn-hat frame (with ears) on the photo, and hat-white stat cards.
const AboutStats = () => {
  const onSection = useSectionActive('about');

  return (
  <section id="about" className="py-32 px-6 relative overflow-hidden">
    <SectionBackdrop show={onSection} className="bg-linear-to-b from-finn-shirt to-finn-shorts">
      {/* Finn background scene, dimmed and faded at the edges like the hero background */}
      <img
        src="/finn-bg.webp"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-35 select-none"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 80%, transparent 100%)'
        }}
      />
    </SectionBackdrop>
    <AnimatedAsset
      src="/finn.webp"
      alt="Finn the Human jumping with a fist in the air"
      width={457}
      height={900}
      animate={{ y: [0, -18, 0], rotate: [-3, 3, -3] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      className="relative z-10 block mx-auto w-28 mb-10 xl:absolute xl:left-[2%] xl:top-28 xl:w-44 2xl:w-56 xl:mb-0 h-auto select-none drop-shadow-[8px_8px_0_rgba(17,17,17,0.25)]"
      draggable={false}
    />

    <div className="max-w-4xl mx-auto text-center relative z-10">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className={`finn-outline text-2xl md:text-5xl font-display font-medium leading-tight mb-12 md:mb-20 transition-colors duration-700 ${onSection ? 'text-finn-hat' : 'text-finn-shorts'}`}
      >
        "UI/UX designer crafting intuitive, user-friendly experiences through wireframing, prototyping, and visual design."
      </motion.h2>

      <div className="flex justify-center mb-20">
        <div className="relative group pt-5">
          {/* Finn's hat ears */}
          <span className="absolute top-0 left-[18%] w-8 h-8 md:w-11 md:h-11 rounded-t-full rounded-b-md bg-finn-hat border-4 border-finn-ink" aria-hidden="true" />
          <span className="absolute top-0 right-[18%] w-8 h-8 md:w-11 md:h-11 rounded-t-full rounded-b-md bg-finn-hat border-4 border-finn-ink" aria-hidden="true" />
          <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-[10px] border-finn-hat ring-4 ring-finn-ink shadow-[8px_8px_0_rgba(17,17,17,0.35)] cursor-pointer hover:scale-105 transition-transform duration-500">
            <img 
              src="/699273422_1702802617512994_1962015335284207172_n.jpg" 
              alt="Designer Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
        {[
          { label: "Years of Experience", value: 5, minIntegerDigits: 2 },
          { label: "Projects Completed", value: 50, suffix: "+" },
          { label: "Client Rating", value: 4.5, decimalPlaces: 2 },
          { label: "Design Awards", value: 17 }
        ].map((stat, i) => (
          <FadeIn key={i} delay={i * 0.1} className="motion-stat flex flex-col items-center rounded-3xl bg-finn-hat border-4 border-finn-ink shadow-[6px_6px_0_var(--color-finn-ink)] px-3 pt-6 pb-5 overflow-hidden">
            <span className="text-4xl md:text-6xl font-display font-bold mb-2 text-finn-shorts">
              <NumberTicker value={stat.value} decimalPlaces={stat.decimalPlaces} minIntegerDigits={stat.minIntegerDigits} delay={0.15 + i * 0.12} />
              {stat.suffix}
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-finn-ink/60">{stat.label}</span>
            {/* backpack-green strip */}
            <span className="mt-4 h-2 w-12 rounded-full bg-finn-pack border-2 border-finn-ink" aria-hidden="true" />
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
  );
};

const JourneyTimeline = () => {
  const journey = [
    {
      year: "2022",
      title: "Started as a student builder",
      body: "I began turning curiosity into real output: websites, graphic design work, and small systems that trained my eye for details and delivery at AMA ACLC College of Mandaue.",
      image: "/GRAP.jpg"
    },
    {
      year: "2023",
      title: "Graduated at AMA ",
      body: "Afterall, I Graduate at AMA ACLC College of Mandaue as Visual Graphic Design and Animation, but instead of continue to work, I continue my studies;",
      image: "/CERTS.jpg"
    },
    {
      year: "2024",
      title: "Joined PNPh",
      body: "I joined PNPh become their student scholar, Taking 2.5yrs of professional training at USJR. While focusing to study Software Development as an Associate of Computer Technology.",
      image: "/PN.png"
    },
    {
      year: "2025",
      title: "Prepared for the workplace",
      body: "I sharpened my portfolio, practiced professional communication, and kept delivering freelance and school projects with stronger standards.",
      image: "/JP.jpg"
    },
    {
      year: "2026",
      title: "From student to work",
      body: "Now I am growing as an Software Developer Intern at Geidi IT, building AI automation, agentic workflows, and production-minded tools.",
      image: "/GEIDI.jpg"
    }
  ];
  const [activeIndex, setActiveIndex] = useState(journey.length - 1);
  const active = journey[activeIndex];
  const goToPrevious = () => setActiveIndex((activeIndex - 1 + journey.length) % journey.length);
  const goToNext = () => setActiveIndex((activeIndex + 1) % journey.length);
  // Section fades to black (and switches its dark: styles on) while it's on screen.
  // Marceline-themed while current: night sky from her hair, pale-cyan skin
  // lettering, red accents. `dark` also switches on the section's dark: styles.
  const onSection = useSectionActive('journey');

  return (
    <section
      id="journey"
      className={`relative scroll-mt-24 py-32 px-6 overflow-hidden transition-colors duration-700 ${onSection ? 'dark text-marcy-skin' : ''}`}
    >
      <SectionBackdrop show={onSection} className="bg-linear-to-b from-marcy-hair via-[#15123A] to-marcy-jeans/80">
        {/* Marceline background scene, dimmed and faded at the edges like the hero background */}
        <img
          src="/marceline-bg.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-35 select-none"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 80%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 80%, transparent 100%)'
          }}
        />
      </SectionBackdrop>
      <AnimatedAsset
        src="/marceline.webp"
        alt="Marceline the Vampire Queen floating and playing her bass"
        width={700}
        height={707}
        initial={false}
        animate={onSection ? { opacity: 1, x: 0, y: [0, -14, 0] } : { opacity: 0, x: 40, y: 0 }}
        transition={onSection ? { opacity: { duration: 0.7 }, x: { duration: 0.7 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } } : { duration: 0.4 }}
        className="relative z-10 block mx-auto w-40 sm:w-52 mb-10 xl:absolute xl:right-[3%] xl:bottom-16 xl:w-72 2xl:w-80 xl:mb-0 h-auto pointer-events-none select-none drop-shadow-[0_0_30px_rgba(195,236,238,0.25)]"
        draggable={false}
      />
      <div className="relative max-w-7xl mx-auto">
        <FadeIn>
          <div className="mb-16 md:mb-24">
            <p className="text-sm font-bold uppercase tracking-widest text-accent-start dark:text-marcy-skin/70 transition-colors mb-4">Philippines</p>
            <div className="grid md:grid-cols-[0.9fr_1.1fr] gap-8 md:gap-16 items-end">
              <h2 className={`text-5xl md:text-7xl font-display font-bold tracking-tighter ${onSection ? 'text-marcy-skin' : 'title-text'}`}>
                Tech Journey<br />the years.
              </h2>
              <p className="text-lg md:text-xl text-ink/65 dark:text-slate-300 leading-relaxed max-w-2xl">
              My journey as a student, builder, and young professional - from learning the craft to applying it at work.
              </p>
            </div>
          </div>
        </FadeIn>

        <div className="relative">
          <div className="hidden md:block absolute left-16 right-16 top-[7.35rem] border-t-2 border-dashed border-black/25 dark:border-white/25" />

          <div className="flex items-center justify-between gap-2 md:gap-4 mb-10 pr-14 md:pr-0">
            <button
              type="button"
              onClick={goToPrevious}
              className="relative z-10 w-10 h-10 md:w-12 md:h-12 rounded-full border border-black/20 dark:border-white/20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex items-center justify-center hover:border-accent-start hover:text-accent-start transition-colors"
              aria-label="Previous journey milestone"
            >
              <ChevronLeft size={22} />
            </button>

            <div className="relative z-10 flex-1 grid grid-cols-5 gap-1 md:gap-6">
              {journey.map((item, index) => (
                <button
                  key={item.year}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`group flex flex-col items-center gap-3 transition-opacity ${index === activeIndex ? 'opacity-100' : 'opacity-45 hover:opacity-80'}`}
                  aria-label={`Show ${item.year} journey milestone`}
                >
                  <span className={`text-sm md:text-4xl font-display font-bold transition-colors ${index === activeIndex ? (onSection ? 'text-marcy-skin' : 'title-text') : 'text-title/50 dark:text-marcy-skin/35'}`}>
                    {item.year}
                  </span>
                  <span className={`w-5 h-5 rounded-full border-4 transition-colors ${index === activeIndex ? 'bg-accent-start border-white shadow-lg shadow-accent-start/30 dark:bg-marcy-red dark:border-marcy-hair dark:shadow-marcy-red/40' : 'bg-white border-accent-start/70 dark:bg-marcy-hair dark:border-marcy-red/60'}`} />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={goToNext}
              className="relative z-10 w-10 h-10 md:w-12 md:h-12 rounded-full border border-black/20 dark:border-white/20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex items-center justify-center hover:border-accent-start hover:text-accent-start transition-colors"
              aria-label="Next journey milestone"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active.year}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="grid md:grid-cols-[0.9fr_1.1fr] gap-10 md:gap-16 items-center"
            >
              <div className="md:text-right">
                <p className="text-sm font-bold uppercase tracking-widest text-accent-start dark:text-marcy-skin/70 mb-3">My journey</p>
                <h3 className={`text-3xl md:text-5xl font-display font-bold tracking-tight mb-5 ${onSection ? 'text-marcy-skin' : 'title-text'}`}>{active.title}</h3>
                <p className="text-lg text-ink/65 dark:text-slate-300 leading-relaxed md:ml-auto max-w-xl">
                  {active.body}
                </p>
              </div>

              <div className="relative flex justify-center md:justify-start">
                <div className="absolute top-1/2 left-1/2 md:left-28 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-80 md:h-80 rounded-full bg-accent-start/10 dark:bg-marcy-red/25 blur-3xl" />
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-8 border-white/80 dark:border-marcy-red shadow-2xl bg-white/40 dark:bg-slate-900/40">
                  <img
                    src={active.image}
                    alt={`${active.year} ${active.title}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const Education = () => {
  const education = [
    {
      years: "2016 – 2021",
      title: "Junior High School",
      institution: "Junior High School Science Class",
      body: "Completed junior high school under the Science curriculum, building the academic foundation before pursuing a technical and creative track in senior high.",
      link: "https://www.youtube.com/channel/UCSZq2Jfqy8chv6jnsC1E0NA",
      logo: "/PaknaanNHS-logo.png"
    },
    {
      years: "2022 – 2024",
      title: "Senior High School",
      institution: "ACLC College of Mandaue",
      body: "TVL strand, Major in Visual Graphic Design and Animation — where I first started applying design and technical skills to real projects.",
      link: "https://www.facebook.com/ACLCCMandaueRegistrar/",
      logo: "/ACLC-logo.png"
    },
    {
      years: "2024 – Present",
      title: "College",
      institution: "University of San Jose–Recoletos",
      body: "Associate in Computer Technology, Major in Software Development — currently completing my degree while working as a Software Developer Intern.",
      link: "https://en.wikipedia.org/wiki/University_of_San_Jose%E2%80%93Recoletos",
      logo: "/USJR-logo.png"
    }
  ];
  const [activeIndex, setActiveIndex] = useState(education.length - 1);
  const active = education[activeIndex];
  // Gunter-themed while current: cream belly backdrop, navy lettering, and the
  // active school shown as a black graduation-gown card with gold trim (gunter: styles).
  const onSection = useSectionActive('education');

  return (
    <section
      id="education"
      className={`relative overflow-hidden scroll-mt-24 py-32 px-6 transition-colors duration-700 ${onSection ? 'gunter bg-gunter-belly' : 'bg-transparent'}`}
    >
      <SectionBackdrop show={onSection}>
        {/* Snowy mountain scene, dimmed and faded at the edges like the hero background */}
        <img
          src="/gunter-bg.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-35 select-none"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 80%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 80%, transparent 100%)'
          }}
        />
      </SectionBackdrop>
      <div className="relative max-w-7xl mx-auto">
        <FadeIn>
          <div className="mb-16 md:mb-24 flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-accent-start gunter:text-gunter-navy transition-colors mb-4">Background</p>
              <h2 className={`text-5xl md:text-7xl font-display font-bold tracking-tighter ${onSection ? 'text-gunter-navy' : 'title-text'}`}>
                Education.
              </h2>
            </div>
            {/* Gunter, graduated — gold trim matches the section's Jake-yellow */}
            <AnimatedAsset
              src="/gunter.webp"
              alt="Gunter the penguin in a graduation cap and gown"
              width={626}
              height={700}
              animate={{ rotate: [0, -4, 0, 4, 0], y: [0, -6, 0] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
              className="w-28 md:w-44 h-auto shrink-0 select-none origin-bottom drop-shadow-[6px_6px_0_rgba(17,17,17,0.2)]"
              draggable={false}
            />
          </div>
        </FadeIn>

        <div className="relative">
          <div className="hidden md:block absolute left-0 right-0 top-6 border-t-2 border-dashed border-black/25 gunter:border-gunter-navy/30" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 mb-14">
            {education.map((item, index) => (
              <button
                key={item.years}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`group flex flex-col items-center text-center gap-3 transition-opacity ${index === activeIndex ? 'opacity-100' : 'opacity-45 hover:opacity-80'}`}
                aria-label={`Show ${item.years} education milestone`}
              >
                <span className={`w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-white p-1.5 border-4 transition-colors ${index === activeIndex ? 'border-accent-start shadow-lg shadow-accent-start/30 gunter:border-gunter-gold gunter:shadow-gunter-gold/40' : 'border-black/10 dark:border-white/20'}`}>
                  <img src={item.logo} alt={`${item.institution} logo`} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </span>
                <span className={`text-sm md:text-base font-bold uppercase tracking-widest transition-colors ${index === activeIndex ? 'text-ink gunter:text-gunter-navy' : 'text-ink/50 gunter:text-gunter-navy/50'}`}>
                  {item.years}
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active.years}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
              // Padding/border are constant so the section's height never changes when the
              // theme switches (it used to grow ~166px and make anchor scrolls overshoot).
              className={`text-center max-w-2xl mx-auto rounded-[2rem] border-4 p-8 md:p-12 transition-colors duration-500 ${onSection ? 'bg-gunter-gown border-gunter-gold text-gunter-belly shadow-[8px_8px_0_var(--color-gunter-navy)]' : 'bg-transparent border-transparent'}`}
            >
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 rounded-full bg-white p-3 shadow-xl border border-black/5">
                <img src={active.logo} alt={`${active.institution} logo`} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest text-accent-start gunter:text-gunter-gold transition-colors mb-3">{active.title}</p>
              <h3 className={`text-3xl md:text-5xl font-display font-bold tracking-tight mb-5 ${onSection ? 'text-gunter-belly' : 'title-text'}`}>{active.institution}</h3>
              <p className="text-lg text-ink/65 gunter:text-gunter-belly/80 leading-relaxed mb-6">{active.body}</p>
              <a
                href={active.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm hover:text-accent-start gunter:text-gunter-gold gunter:hover:text-gunter-belly transition-colors"
              >
                Visit <ArrowUpRight size={18} />
              </a>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

// Scroll-expand intro that sits just before the Portfolio section: the photo
// grows from a framed card to full screen as you scroll, then hands off.
const PortfolioIntro = () => (
  <ScrollExpand
    useWindowScroll
    src="/things-built.webp"
    alt="The Adventure Time cast celebrating across the Land of Ooo"
    title="Things I've Built"
    scrollHint="Scroll to open the portfolio"
    startWidth={46}
    startHeight={56}
    startRadius={32}
    mediaZoom={1.3}
    scrollDistance={1.1}
    holdDistance={0.3}
    overlayScrim={0.55}
    className="font-display"
  >
    <p className="font-sans text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-pb-skin bg-pb-ink/75 backdrop-blur-sm rounded-full px-5 py-2 mb-5">Selected work</p>
    <h2 className="pb-outline text-5xl md:text-8xl font-bold tracking-tighter text-white">
      Latest <span className="text-pb-pink">Portfolio.</span>
    </h2>
  </ScrollExpand>
);

// Princess Bubblegum-themed while current: candy-pink lab backdrop, magenta
// lettering, and a bento grid — one featured project plus five supporting ones.
const Portfolio = () => {
  const onSection = useSectionActive('portfolio');
  const projects = [
    { title: "Before you Dig Australia", category: "Mining Documentation Automation System", img: "/BYDA.png" },
    { title: "PNPh Tourna Website", category: "Tournament Website", img: "/TOUR.png" },
    { title: "MAAI WebApp Project", category: "SEO AI Agent", img: "/maai.png" },
    { title: "LostLink WebApp Project", category: "Lost and Found Management", img: "/Web App.png" },
    { title: "Wendears Cake", category: "E-Commerce Website", img: "/Wendears.png" },
    { title: "Tourmate", category: "AI Travel Companion App", img: "/Tourmate'.png" },
    { title: "COMS.AI", category: "Cebu Outage Monitoring System", img: "/COMS.png" }
  ];

  return (
    <section id="portfolio" className="relative py-32 px-6 overflow-hidden">
      <SectionBackdrop show={onSection} className="bg-linear-to-b from-pb-skin via-[#FEE6F7] to-pb-skin">
        {/* Candy Kingdom scene, dimmed and faded at the edges like the hero background */}
        <img
          src="/bubblegum-bg.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-35 select-none"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 80%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 80%, transparent 100%)'
          }}
        />
      </SectionBackdrop>

      <div className="relative max-w-7xl mx-auto">
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-widest text-pb-magenta mb-4">Candy Kingdom Lab</p>
              <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter text-pb-magenta">
                Latest<br /><span className="pb-outline text-pb-pink">Portfolio.</span>
              </h2>
              <p className="mt-6 text-lg text-pb-ink/70 leading-relaxed">
                {projects.length} projects, from AI agents and automation systems to websites and e-commerce.
              </p>
              <button className="mt-8 inline-flex items-center gap-2 rounded-full border-[3px] border-pb-ink bg-pb-pink px-6 py-3 font-bold uppercase tracking-widest text-sm text-white shadow-[4px_4px_0_var(--color-pb-ink)] hover:shadow-[6px_6px_0_var(--color-pb-ink)] transition-shadow">
                View All Projects <ArrowUpRight size={18} />
              </button>
            </div>
            <AnimatedAsset
              src="/bubblegum.webp"
              alt="Princess Bubblegum holding BMO"
              width={608}
              height={1000}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
              className="self-center md:self-end w-32 md:w-44 lg:w-52 h-auto shrink-0 select-none drop-shadow-[8px_8px_0_rgba(176,48,127,0.25)]"
              draggable={false}
            />
          </div>
        </FadeIn>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[270px]">
          {projects.map((project, i) => {
            const featured = i === 0;
            // On lg the featured card fills 4 cells; a lone card left on the last row spans it.
            const lgOrphan = i === projects.length - 1 && (projects.length + 3) % 3 === 1;
            return (
              <FadeIn
                key={project.title}
                delay={i * 0.08}
                className={featured ? 'md:col-span-2 lg:row-span-2' : lgOrphan ? 'lg:col-span-3' : ''}
              >
                <div data-motion-card
                className={`group relative h-full ${featured ? 'min-h-[420px]' : 'min-h-[300px] lg:min-h-0'} rounded-[2rem] overflow-hidden border-[3px] border-pb-ink bg-white cursor-pointer shadow-[6px_6px_0_var(--color-pb-magenta)] hover:shadow-[10px_10px_0_var(--color-pb-magenta)] transition-shadow duration-300`}>
                  <img
                    src={project.img}
                    alt={project.title}
                    className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-pb-ink/90 via-pb-ink/25 to-transparent" />

                  <div className="absolute top-5 left-5 right-5 flex items-start justify-between gap-3">
                    <span className="w-11 h-11 shrink-0 rounded-full bg-pb-crown border-[3px] border-pb-ink flex items-center justify-center font-bold text-sm text-pb-ink">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] md:text-xs font-bold uppercase tracking-widest text-pb-magenta text-right">
                      {project.category}
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-7 flex items-end justify-between gap-4">
                    <div>
                      {featured && <p className="text-xs font-bold uppercase tracking-widest text-pb-skin mb-2">Featured project</p>}
                      <h3 className={`font-display font-bold leading-tight text-white ${featured ? 'text-3xl md:text-5xl' : 'text-2xl'}`}>{project.title}</h3>
                    </div>
                    <span className="w-12 h-12 shrink-0 rounded-full bg-pb-pink border-[3px] border-pb-ink text-white flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
                      <ArrowUpRight size={20} />
                    </span>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Tools grouped by what they're for; each group takes one of Lady Rainicorn's
// rainbow stripes. (`stripe` = accent colour var, `Icon` = the group's tile icon.)
const toolGroups: { title: string; stripe: string; Icon: typeof Code2; tools: { name: string; icon: string }[] }[] = [
  {
    title: "Languages", stripe: "var(--color-rain-red)", Icon: Code2,
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
    title: "Frameworks & Libraries", stripe: "var(--color-rain-gold)", Icon: Layers,
    tools: [
      { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
      { name: "Vue", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg" },
      { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
      { name: "Laravel", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg" },
      { name: "Tailwind", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
      { name: "FastAPI", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg" },
      { name: "Next.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
      { name: "NestJS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg" },
      { name: "Express", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
      { name: "Angular", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angular/angular-original.svg" },
      { name: "Svelte", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg" },
      { name: "Nuxt", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nuxtjs/nuxtjs-original.svg" },
      { name: "Astro", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/astro/astro-original.svg" },
      { name: "Remix", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/remix/remix-original.svg" },
      { name: "Django", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg" },
      { name: "Flask", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg" },
      { name: "Spring Boot", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" },
      { name: ".NET", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dotnetcore/dotnetcore-original.svg" },
      { name: "Bootstrap", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg" },
      { name: "Sass", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg" },
      { name: "jQuery", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jquery/jquery-original.svg" },
      { name: "Redux", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg" },
      { name: "Prisma", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg" },
      { name: "Three.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg" },
      { name: "Vite", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" },
      { name: "React Native", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
      { name: "Flutter", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg" },
      { name: "Electron", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/electron/electron-original.svg" }
    ]
  },
  {
    title: "Databases & Servers", stripe: "var(--color-rain-green)", Icon: Database,
    tools: [
      { name: "MongoDB", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
      { name: "MySQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
      { name: "Oracle", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/oracle/oracle-original.svg" },
      { name: "Supabase", icon: "https://cdn.simpleicons.org/supabase/3ECF8E" },
      { name: "Apache Lounge", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apache/apache-original.svg" }
    ]
  },
  {
    title: "AI & Agents", stripe: "var(--color-rain-blue)", Icon: Bot,
    tools: [
      { name: "Claude", icon: "https://cdn.simpleicons.org/claude/D97757" },
      { name: "OpenAI", icon: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/openai.svg" },
      { name: "Hermes Agent", icon: "https://hermes-agent.nousresearch.com/img/desktop/badge.webp" },
      { name: "Composio", icon: "https://composio.dev/favicon.ico" },
      { name: "Sixth AI", icon: "https://trysixth.com/favicon.ico" },
      { name: "GitHub Copilot", icon: "https://cdn.simpleicons.org/githubcopilot/000000" },
      { name: "Gemini", icon: "https://cdn.simpleicons.org/googlegemini/8E75B2" },
      { name: "Cursor", icon: "https://cdn.simpleicons.org/cursor/000000" },
      { name: "Hugging Face", icon: "https://cdn.simpleicons.org/huggingface/FFD21E" },
      { name: "LangChain", icon: "https://cdn.simpleicons.org/langchain/1C3C3C" },
      { name: "Ollama", icon: "https://cdn.simpleicons.org/ollama/000000" },
      { name: "Perplexity", icon: "https://cdn.simpleicons.org/perplexity/1FB8CD" },
      { name: "DeepSeek", icon: "https://cdn.simpleicons.org/deepseek/4D6BFE" },
      { name: "Llama", icon: "https://cdn.simpleicons.org/meta/0467DF" },
      { name: "Mistral", icon: "https://cdn.simpleicons.org/mistralai/FA520F" },
      { name: "n8n", icon: "https://cdn.simpleicons.org/n8n/EA4B71" }
    ]
  },
  {
    title: "Design", stripe: "var(--color-rain-purple)", Icon: Palette,
    tools: [
      { name: "Figma", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
      { name: "Canva", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/canva/canva-original.svg" },
      { name: "Photoshop", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-original.svg" },
      { name: "Illustrator", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/illustrator/illustrator-original.svg" },
      { name: "Affinity", icon: "/affinity-logotype.svg" }
    ]
  },
  {
    title: "Dev Tools & OS", stripe: "var(--color-rain-pink-deep)", Icon: Wrench,
    tools: [
      { name: "Git", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
      { name: "GitHub", icon: "https://cdn.simpleicons.org/github/181717" },
      { name: "GitLab", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg" },
      { name: "Ubuntu", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ubuntu/ubuntu-original.svg" },
      { name: "Linux", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" },
      { name: "Obsidian", icon: "https://cdn.simpleicons.org/obsidian/7C3AED" },
      { name: "Notepad++", icon: "https://cdn.simpleicons.org/notepadplusplus/90E59A" }
    ]
  }
];

const rainbowStripes = ['--color-rain-red', '--color-rain-gold', '--color-rain-mane', '--color-rain-green', '--color-rain-teal', '--color-rain-blue', '--color-rain-purple', '--color-rain-pink'];

// Lady Rainicorn-themed while current: blush-pink backdrop with a rainbow band,
// rainbow lettering, and tools sorted into six colour-coded cards.
const ToolsSection = () => {
  const onSection = useSectionActive('tools');
  const total = toolGroups.reduce((n, g) => n + g.tools.length, 0);

  return (
    <section id="tools" className="relative overflow-hidden py-28 px-6">
      <SectionBackdrop show={onSection} className="bg-linear-to-b from-rain-blush via-white to-[#EEF3FF]">
        {/* rainbow band across the top */}
        <div className="absolute inset-x-0 top-0 flex h-2">
          {rainbowStripes.map((v) => <span key={v} className="flex-1" style={{ background: `var(${v})` }} />)}
        </div>
        {/* Tree Fort couch scene, dimmed and faded at the edges like the hero background */}
        <img
          src="/tools-bg.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 select-none"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 80%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 80%, transparent 100%)'
          }}
        />
      </SectionBackdrop>

      <div className="relative max-w-7xl mx-auto">
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
            <div className="max-w-2xl">
              <p className={`text-sm font-bold uppercase tracking-widest mb-4 transition-colors ${onSection ? 'text-rain-purple' : 'text-accent-start'}`}>My toolbox</p>
              <h2 className={`text-5xl md:text-7xl font-display font-bold tracking-tighter ${onSection ? 'rainbow-text' : 'title-text'}`}>
                Tools &amp;<br />Technologies.
              </h2>
              <p className="mt-5 text-lg font-medium text-ink/75">
                {total} tools across {toolGroups.length} areas, from code and databases to AI agents and design.
              </p>
            </div>
            <AnimatedAsset
              src="/rainicorn.webp"
              alt="Lady Rainicorn surrounded by coding tool icons"
              width={899}
              height={900}
              animate={{ y: [0, -12, 0], rotate: [-2, 2, -2] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
              className="self-center md:self-end w-40 md:w-56 lg:w-64 h-auto shrink-0 select-none drop-shadow-[0_12px_24px_rgba(120,96,240,0.25)]"
              draggable={false}
            />
          </div>
        </FadeIn>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
          {toolGroups.map((group, gi) => (
            <FadeIn key={group.title} delay={gi * 0.08} className="break-inside-avoid mb-6">
              <div
                data-motion-card
                className="h-full rounded-3xl border-2 bg-white/85 backdrop-blur-md p-6 shadow-sm transition-shadow hover:shadow-lg overflow-hidden relative"
                style={{ borderColor: `color-mix(in oklab, ${group.stripe} 45%, transparent)` }}
              >
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5" style={{ background: group.stripe }} />
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ background: group.stripe }}>
                    <group.Icon size={22} strokeWidth={2.4} />
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-xl leading-tight text-ink">{group.title}</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-ink/40">{group.tools.length} tools</p>
                  </div>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {group.tools.map((tool) => (
                    <li
                      key={tool.name}
                      className="motion-tool flex items-center gap-2 rounded-full border border-black/10 bg-white pl-2 pr-3 py-1.5 text-sm font-medium text-ink shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <img src={tool.icon} alt="" loading="lazy" className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                      {tool.name}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

const faqGradients = [
  'linear-gradient(160deg, var(--color-accent-start) 0%, var(--color-secondary) 100%)',
  'linear-gradient(160deg, var(--color-highlight) 0%, var(--color-accent-end) 100%)',
  'linear-gradient(160deg, var(--color-accent-end) 0%, var(--color-tertiary) 100%)',
  'linear-gradient(160deg, var(--color-secondary) 0%, var(--color-highlight) 100%)'
];
// Lumpy Space Princess versions — lavender body, blush, star yellow.
const faqGradientsLsp = [
  'linear-gradient(160deg, var(--color-lsp-body) 0%, var(--color-lsp-blush) 100%)',
  'linear-gradient(160deg, var(--color-lsp-star) 0%, var(--color-lsp-body) 100%)',
  'linear-gradient(160deg, var(--color-lsp-blush) 0%, var(--color-lsp-mist) 100%)',
  'linear-gradient(160deg, var(--color-lsp-mist) 0%, var(--color-lsp-body) 100%)'
];

// Twinkling star positions for the FAQ backdrop (left %, top %, size px, delay s).
const lspStars = [
  [6, 18, 18, 0], [14, 70, 12, 1.2], [24, 35, 10, 0.6], [78, 22, 16, 0.3],
  [88, 62, 20, 1.6], [94, 30, 10, 0.9], [60, 85, 12, 2.1], [40, 12, 9, 1.8]
] as const;

// Fanned card carousel — center card active, side cards splay out and rotate,
// styled after the "Daily Energy" Framer demo (decisive-reassurance-155626.framer.app).
const FaqFanCard = ({
  faq,
  offset,
  isActive,
  onSelect,
  gradient
}: {
  faq: { q: string; a: string };
  offset: number;
  isActive: boolean;
  onSelect: () => void;
  gradient: string;
}) => {
  const abs = Math.abs(offset);
  const hidden = abs > 3;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-current={isActive}
      className="absolute top-0 left-1/2 w-[240px] h-[340px] md:w-[300px] md:h-[400px] rounded-[1.75rem] overflow-hidden text-left shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      style={{ background: gradient, transformOrigin: 'bottom center' }}
      initial={false}
      animate={{
        x: `calc(-50% + ${offset * 64}px)`,
        y: abs * 16,
        rotate: offset * 10,
        scale: isActive ? 1 : Math.max(0.8, 1 - abs * 0.09),
        opacity: hidden ? 0 : isActive ? 1 : 0.45,
        filter: isActive ? 'blur(0px)' : 'blur(1.5px)',
        zIndex: 100 - abs
      }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
    >
      <div className="relative h-full p-6 md:p-7 flex flex-col text-ink">
        <span className="self-end shrink-0 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest">
          FAQ
        </span>
        <div className="mt-4 flex-1 min-h-0 flex flex-col">
          <h3 className="font-display font-bold text-xl md:text-2xl leading-tight mb-3 line-clamp-2 shrink-0">{faq.q}</h3>
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="flex-1 min-h-0 overflow-y-auto no-scrollbar pr-1"
              >
                <p className="text-sm md:text-base leading-relaxed text-ink/90">{faq.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {isActive && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/25 to-transparent rounded-b-[1.75rem]" />
        )}
      </div>
    </motion.button>
  );
};

const FAQ = () => {
  const faqs = [
    { q: "What services do you offer?", a: "I offer a full range of design services including UI/UX design, branding, product strategy, graphic design, motion graphics, video editing, photo manipulation, system management, and web development and many more." },
    { q: "How can I contact you?", a: "You can reach out via the contact: Email: riel.engana@student.passerellesnumeriques.org. or call 09850254857" },
    { q: "How much does a project cost?", a: "Project costs vary based on scope and complexity. I provide custom quotes after an initial discovery call." },
    { q: "Which tools do you provide?", a: "I primarily use Figma for design, and for development I use HTML, CSS, PHP, JAVA, REACT, NODEJS, TYPESCRIPT, and modern web technologies like LARAVEL, TAILWIND, and ANYTHING for development, and in regards with databases, I use MongoDB, MySQL and Oracle." }
  ];
  const [activeIndex, setActiveIndex] = useState(Math.floor((faqs.length - 1) / 2));
  const goToPrevious = () => setActiveIndex((activeIndex - 1 + faqs.length) % faqs.length);
  const goToNext = () => setActiveIndex((activeIndex + 1) % faqs.length);
  // Lumpy Space Princess-themed while current: lavender mist with twinkling
  // stars, purple lettering with a star-yellow "Questions.", LSP card gradients.
  const onSection = useSectionActive('faq');
  const gradients = onSection ? faqGradientsLsp : faqGradients;

  return (
    <section id="faq" className="relative py-32 px-6 overflow-hidden">
      <SectionBackdrop show={onSection} className="bg-linear-to-b from-lsp-mist via-[#E4D2F3] to-lsp-mist">
        {/* Lumpy Space scene, dimmed and faded at the edges like the hero background */}
        <img
          src="/faq-bg.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-35 select-none"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 80%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 80%, transparent 100%)'
          }}
        />
        {lspStars.map(([left, top, size, delay], i) => (
          <span
            key={i}
            className="motion-sparkle absolute bg-lsp-star [clip-path:polygon(50%_0,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]"
            style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, animationDelay: `${delay}s` }}
          />
        ))}
      </SectionBackdrop>

      <div className="relative max-w-6xl mx-auto">
        <FadeIn>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 mb-16 md:mb-20">
            <div className="text-center md:text-left">
              <h2 className={`text-4xl md:text-6xl font-display font-bold mb-4 tracking-tighter ${onSection ? 'text-lsp-deep' : 'title-text'}`}>
                Frequently Asked<br /><span className={onSection ? 'lsp-outline text-lsp-star' : ''}>Questions.</span>
              </h2>
              <p className={`inline-block rounded-full px-4 py-1.5 font-medium transition-colors duration-700 ${onSection ? 'text-lsp-deep bg-lsp-mist/85 backdrop-blur-sm' : 'text-ink/60 bg-transparent'}`}>Tap a card to flip through the answers.</p>
            </div>
            <AnimatedAsset
              src="/lsp.webp"
              alt="Lumpy Space Princess thinking with a finger on her lip"
              width={702}
              height={700}
              animate={{ y: [0, -12, 0], rotate: [-2, 2, -2] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
              className="w-28 md:w-40 h-auto shrink-0 select-none drop-shadow-[6px_6px_0_rgba(107,63,143,0.25)]"
              draggable={false}
            />
          </div>
        </FadeIn>

        <div className="relative h-[400px] md:h-[460px] mb-12">
          {faqs.map((faq, index) => (
            <FaqFanCard
              key={faq.q}
              faq={faq}
              offset={index - activeIndex}
              isActive={index === activeIndex}
              onSelect={() => setActiveIndex(index)}
              gradient={gradients[index % gradients.length]}
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={goToPrevious}
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full border bg-white/50 backdrop-blur-md flex items-center justify-center transition-colors ${onSection ? 'border-lsp-deep/40 text-lsp-deep hover:bg-lsp-deep hover:text-white' : 'border-black/20 hover:border-accent-start hover:text-accent-start'}`}
            aria-label="Previous question"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            {faqs.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${index === activeIndex ? (onSection ? 'bg-lsp-deep' : 'bg-accent-start') : 'bg-black/20'}`}
                aria-label={`Show question ${index + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={goToNext}
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full border bg-white/50 backdrop-blur-md flex items-center justify-center transition-colors ${onSection ? 'border-lsp-deep/40 text-lsp-deep hover:bg-lsp-deep hover:text-white' : 'border-black/20 hover:border-accent-start hover:text-accent-start'}`}
            aria-label="Next question"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

// Falling snow positions for the Contact backdrop (left %, size px, duration s, delay s, drift px).
const snowflakes = [
  [3, 6, 11, 0, 20], [10, 4, 14, 3, -15], [18, 8, 12, 6, 30], [26, 5, 16, 1.5, -25],
  [34, 3, 13, 4.5, 10], [42, 7, 15, 2, -30], [50, 4, 12, 7, 25], [58, 6, 17, 0.5, -20],
  [66, 3, 14, 5, 15], [74, 8, 13, 2.5, -10], [82, 5, 16, 6.5, 30], [90, 4, 12, 1, -25],
  [96, 6, 15, 3.5, 12]
] as const;

// Ice King's royal mail while current: royal-blue backdrop with the Ice Kingdom
// scene and falling snow, frost lettering, and the form in a frosted-ice card
// under a gold crown. `dark` switches the section's dark: styles on.
const Contact = () => {
  const onSection = useSectionActive('contact');
  const field = "w-full rounded-2xl px-5 py-4 outline-none transition-shadow bg-black/5 focus:ring-2 focus:ring-accent-start dark:bg-white/10 dark:text-white dark:placeholder:text-ik-skin/50 border border-transparent dark:border-ik-skin/25 dark:focus:ring-ik-crown";
  const label = "text-xs font-bold uppercase tracking-widest text-ink/40 dark:text-ik-skin";

  return (
  <section id="contact" className={`py-32 px-6 relative overflow-hidden transition-colors duration-700 ${onSection ? 'dark text-white' : ''}`}>
    <SectionBackdrop show={onSection} className="bg-linear-to-b from-ik-navy via-ik-robe/80 to-ik-navy">
      {/* Ice Kingdom scene, dimmed and faded at the edges like the hero background */}
      <img
        src="/contact-bg.webp"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-35 select-none"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 80%, transparent 100%)'
        }}
      />
      {snowflakes.map(([left, size, dur, delay, drift], i) => (
        <span
          key={i}
          className="snowflake"
          style={{ left: `${left}%`, width: size, height: size, '--dur': `${dur}s`, '--delay': `${delay}s`, '--drift': `${drift}px` } as React.CSSProperties}
        />
      ))}
    </SectionBackdrop>

    <div className="max-w-7xl mx-auto relative z-10">
      <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-14 lg:gap-16 items-center">
        {/* Left: invitation, contact details, Ice King with his letter */}
        <FadeIn direction="right" className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-widest text-accent-start dark:text-ik-crown mb-4">Royal mail</p>
          <h2 className={`text-5xl md:text-6xl font-display font-bold tracking-tighter leading-[0.95] ${onSection ? 'frost-text' : 'title-text'}`}>
            Send me an<br />email now!
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/60 dark:text-ik-skin/85">
            Got a project, a question, or just want to say hi? Send a message and I'll get back to you.
          </p>

          <div className="mt-8 flex flex-col gap-3 max-w-md">
            <a href="mailto:riel.engana@student.passerellesnumeriques.org" className="group flex items-center gap-4 rounded-2xl border px-4 py-3 transition-colors border-black/10 bg-white/60 hover:border-accent-start dark:border-ik-skin/25 dark:bg-white/10 dark:hover:border-ik-crown">
              <span className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center bg-accent-start/15 text-accent-start dark:bg-ik-crown dark:text-ik-navy"><Mail size={20} /></span>
              <span className="min-w-0">
                <span className="block text-xs font-bold uppercase tracking-widest text-ink/40 dark:text-ik-skin/70">Email</span>
                <span className="block truncate font-medium">riel.engana@student.passerellesnumeriques.org</span>
              </span>
            </a>
            <a href="tel:09850254857" className="group flex items-center gap-4 rounded-2xl border px-4 py-3 transition-colors border-black/10 bg-white/60 hover:border-accent-start dark:border-ik-skin/25 dark:bg-white/10 dark:hover:border-ik-crown">
              <span className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center bg-accent-start/15 text-accent-start dark:bg-ik-crown dark:text-ik-navy"><Phone size={20} /></span>
              <span>
                <span className="block text-xs font-bold uppercase tracking-widest text-ink/40 dark:text-ik-skin/70">Phone</span>
                <span className="block font-medium">0985 025 4857</span>
              </span>
            </a>
          </div>

          <div className="mt-10 flex items-end gap-5">
            <AnimatedAsset
              src="/ice-king.webp"
              alt="Ice King waving a letter"
              width={705}
              height={900}
              animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
              className="w-36 md:w-48 h-auto shrink-0 select-none drop-shadow-[0_10px_24px_rgba(0,16,96,0.45)]"
              draggable={false}
            />
            {/* BMO on the line — framed like a pane of ice */}
            <div className="relative w-36 md:w-44 aspect-[4/3] rounded-2xl overflow-hidden rotate-3 border-4 border-white/70 dark:border-ik-skin/70 shadow-xl">
              <img src="/contact-bmo.gif" alt="BMO happily dancing" className="w-full h-full object-cover" />
            </div>
          </div>
        </FadeIn>

        {/* Right: the form in a frosted-ice card under a gold crown */}
        <FadeIn direction="left" className="min-w-0">
          <div className="relative rounded-[2rem] border p-7 pt-12 md:p-10 md:pt-14 backdrop-blur-xl border-black/5 bg-white/70 shadow-xl dark:border-ik-skin/35 dark:bg-ik-navy/45 dark:shadow-[0_0_60px_rgba(184,238,251,0.18)]">
            {/* crown badge */}
            <svg viewBox="0 0 64 40" aria-hidden="true" className="absolute -top-7 left-1/2 -translate-x-1/2 w-20 h-auto drop-shadow-[0_4px_0_rgba(0,16,96,0.35)]">
              <path d="M4 36 L4 12 L18 24 L32 4 L46 24 L60 12 L60 36 Z" fill="var(--color-ik-crown)" stroke="var(--color-ik-navy)" strokeWidth="3" strokeLinejoin="round" />
              <circle cx="18" cy="29" r="3.5" fill="var(--color-ik-gem)" />
              <circle cx="32" cy="27" r="4.5" fill="var(--color-ik-gem)" />
              <circle cx="46" cy="29" r="3.5" fill="var(--color-ik-gem)" />
            </svg>

            <form action="https://formsubmit.co/rieljake.engana.24@usjr.edu.ph" method="POST" className="space-y-5">
              <input type="hidden" name="_subject" value="You have New Message from your client Jake!" />
              <input type="hidden" name="_captcha" value="false" />

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="contact-name" className={label}>Full Name</label>
                  <input id="contact-name" type="text" name="name" required placeholder="Name" className={field} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contact-email" className={label}>Email</label>
                  <input id="contact-email" type="email" name="email" required placeholder="yourname@email.com" className={field} />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-message" className={label}>Message</label>
                <textarea id="contact-message" name="message" required rows={6} placeholder="Write your message..." className={`${field} resize-none`} />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-transform hover:scale-[1.02] bg-linear-to-r from-accent-start to-accent-end text-ink border-2 border-transparent dark:bg-none dark:bg-ik-crown dark:text-ik-navy dark:border-ik-navy dark:shadow-[0_6px_0_var(--color-ik-navy)]"
              >
                <Mail size={20} /> Send Email
              </button>
            </form>
          </div>
        </FadeIn>
      </div>

      {/* The end of the adventure: open the chest for a thank-you */}
      <TreasureChest onSection={onSection} />
    </div>
  </section>
  );
};

const Footer = () => (
  <footer className="py-14 px-6 bg-ink text-white">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <a href="#" className="self-start lg:self-auto"><Logo className="text-2xl" /></a>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-8 gap-y-3 font-medium">
            {NAV_LINKS.map((l) => (
              <li key={l.href}><a href={l.href} className="text-white/75 hover:text-jake-fur transition-colors">{l.label}</a></li>
            ))}
          </ul>
        </nav>
        <div className="flex gap-3">
          {SOCIAL_LINKS.map(({ href, label, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/75 hover:text-jake-fur hover:border-jake-fur transition-colors">
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 text-xs text-white/45">
        <p>© 2026 Portfolio. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
);

export default function PortfolioPage() {
  const activeSection = useTrackActiveSection();

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    document.documentElement.style.colorScheme = 'light';
  }, []);

  useEffect(() => {
    const target = window.location.hash ? document.querySelector(window.location.hash) : null;
    if (target) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }, []);

  return (
    <ActiveSectionContext.Provider value={activeSection}>
    <div className="relative min-h-screen overflow-x-clip bg-bg text-ink selection:bg-accent-start selection:text-white">
      <div className="fixed inset-0 z-0 pointer-events-none bg-linear-to-b from-white to-accent-start/40" />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <ServiceAccordion />
        <AboutStats />
        <JourneyTimeline />
        <Education />
        <PortfolioIntro />
        <Portfolio />
        <Reviews />
        <ToolsSection />
        <FAQ />
        <Contact />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
      <BmoChat />
    </div>
    </ActiveSectionContext.Provider>
  );
}
