import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, animate, useMotionValue } from 'motion/react';
import { AlertTriangle, ArrowUpRight, SendHorizontal, X } from 'lucide-react';
import { quickReply } from '../../../api/_bot';

// Floating "Profilio Bot" chat. It answers questions about Jake only (see api/chat.ts);
// anything else comes back as offTopic and shows the red alert bubble instead.

// Animated bot moods, recoloured to the site palette (public/bot/<mood>.webp).
type Mood = 'idle' | 'wave' | 'think' | 'happy' | 'love' | 'bye' | 'shy' | 'hide' | 'ask' | 'fly';
const moodSrc = (mood: Mood) => `/bot/${mood}.webp`;

type Item =
  | { id: number; kind: 'user'; text: string; offTopic?: boolean; local?: boolean }
  | { id: number; kind: 'bot'; text: string; local?: boolean; section?: string; links?: { label: string; url: string }[]; mood?: Mood }
  | { id: number; kind: 'alert' }
  | { id: number; kind: 'error'; text: string };

const THINKING_LINES = [
  "Let me check Jake's resume…",
  'Finding the information…',
  'Reviewing his details…',
  'Checking his portfolio…',
  "Crawling Jake's GitHub…",
  'Almost there…',
];
// "Where is Jake now?" is answered from his phone's last check-in (api/where.ts), not the model.
// "Where is Jake from / based / studying…" still goes to the API.
// Cebuano "asa na si Jake (karon)?" and Tagalog "nasaan si Jake (ngayon)?" count too.
const WHERE_RE = /\bwhere\s*(is|'s|s)\s*(jake|riel|reil|he)\b(?!\s*(from|based|study|studying|work|working|living|live)\b)|\basa\s+(na\s+)?(si\s+jake|siya)\b(?!\s+(gikan|nagpuyo|nakapuyo|puyo|nag-?eskwela|nagtrabaho)\b)|\bnasaan\s+(na\s+)?(si\s+jake|siya)\b/i;
const TRACKING_LINES = [
  "Tracking Jake's location right now…",
  "Pinging Jake's phone…",
  'Reading the map…',
];
const MIN_TRACKING_MS = 2500; // long enough to read the tracking line even when the lookup is instant

const timeAgo = (at: number) => {
  const mins = Math.round((Date.now() - at) / 60000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return hours === 1 ? 'an hour ago' : `${hours} hours ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
};

const trackJake = async (question: string): Promise<string> => {
  const [data] = await Promise.all([
    fetch('/api/where').then((r) => (r.ok ? r.json() : null)).catch(() => null),
    new Promise((r) => setTimeout(r, MIN_TRACKING_MS)),
  ]);
  const lang = /\basa\b/i.test(question) ? 'ceb' : /\bnasaan\b/i.test(question) ? 'tl' : 'en';
  if (!data) return { en: 'My tracker lost the signal. Try again in a moment!', ceb: 'Nawala ang signal sa akong tracker. Sulayi balik kadiyot!', tl: 'Nawalan ng signal ang tracker ko. Subukan ulit mamaya!' }[lang];
  if (!data.place) return { en: "Jake's phone hasn't checked in yet, so I can't find him right now.", ceb: 'Wala pa nag-check in ang phone ni Jake, mao nga dili pa nako siya makit-an karon.', tl: 'Hindi pa nag-check in ang phone ni Jake, kaya hindi ko pa siya mahanap ngayon.' }[lang];
  const where = `**${data.place}, ${data.country}**`;
  return {
    en: `Found him! Jake is in ${where} right now. (Last check-in: ${timeAgo(data.at)}.)`,
    ceb: `Nakit-an na nako siya! Naa si Jake sa ${where} karon. (Last check-in: ${timeAgo(data.at)}.)`,
    tl: `Nahanap ko na siya! Nasa ${where} si Jake ngayon. (Last check-in: ${timeAgo(data.at)}.)`,
  }[lang];
};

// Small talk is answered right here with no API call. Also understands Cebuano and Tagalog.
const BYE_RE = /^((good\s*)?bye+(\s*bye+)*|ba+bay|paalam|amping|ingat)(\s+(na|ka|kayo|bot))*[\s!.~]*$/i;
const HAPPY_RE = /^(thanks?( you)?( so much)?|thx|ty|tysm|(daghang |maraming )?salamat( kaayo| po)?|ang (cute|galing) mo|nindot kaayo|galing|you'?re (so )?(cute|awesome|amazing|the best|great|cool)|(so )?(cute|awesome|amazing|cool|nice|great|perfect)|good (job|work)|well done|good bot)(\s+bot)?[\s!.~<3]*$/i;
const LOVE_RE = /^((i\s*)?(love\s*(you|u)|ily)|love\s+tika|gihigugma\s+tika|mahal\s+kita)(\s*(so much|too|bot|kaayo|din|rin))*[\s!.~<3]*$/i;
// Questions ("sorry, what are his skills?") still go through.
const SORRY_RE = /\b(sorry|sorri|sori|sowi|sowwy|soree|pasensya|pasensiya|pasaylo|patawad|my bad|apologi[sz]e)\b/i;
const pick = (lines: string[]) => lines[Math.floor(Math.random() * lines.length)];
const smallTalk = (text: string): { text: string; mood: Mood } | null =>
  SORRY_RE.test(text) && !text.includes('?') ? { text: pick(['Okay!', 'No worries!', 'All good!']), mood: 'shy' }
  : BYE_RE.test(text) ? { text: pick(["Bye! Thanks for visiting Jake's portfolio.", 'See you! Come back anytime.']), mood: 'bye' }
  : LOVE_RE.test(text) ? { text: "Aww, thank you! I'll let Jake know.", mood: 'love' }
  : HAPPY_RE.test(text) ? { text: pick(['Glad I could help! Anything else about Jake?', 'Happy to help!']), mood: 'happy' }
  : null;
// When the profile doesn't cover a question, api/chat.ts answers "Jake hasn't shared that one yet…".
const DUNNO_RE = /hasn't shared that|wala pa ni nag-share|hindi pa ito naibabahagi/i;

// Answers from the model, keyed by the exact conversation sent, so asking the same thing again
// (or tapping the same suggestion) answers at once. Cleared on reload.
const answerCache = new Map<string, Item>();
const SUGGESTIONS = ['Who is Jake?', 'What are his skills?', 'Show me his projects', 'How can I contact him?'];
const GREETING = "Hi, I'm Profilio Bot, Jake's assistant! I'll be the one chatting with you since Jake is busy working. Ask me anything about him: his work, skills, projects, or how to reach him. You can ask in English, Cebuano, or Tagalog!";

// Inline **bold**; everything else stays plain text.
const renderText = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={i} className="text-lime font-semibold">{part.slice(2, -2)}</strong> : part
  );

// The small slice of markdown the bot is allowed to use (api/chat.ts rule 4): paragraphs,
// "- " bullet lists, and "| a | b |" tables. Consecutive lines of one kind form one block;
// a blank line ends it (so two tables in a row stay two tables).
const cells = (row: string) => row.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
const RichText = ({ text }: { text: string }) => {
  const blocks: { kind: 'p' | 'ul' | 'table'; lines: string[] }[] = [];
  let gap = false;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) { gap = true; continue; }
    const kind = line.startsWith('|') ? 'table' : /^[-*•]\s+/.test(line) ? 'ul' : 'p';
    const last = blocks[blocks.length - 1];
    if (last && !gap && last.kind === kind && kind !== 'p') last.lines.push(line);
    else blocks.push({ kind, lines: [line] });
    gap = false;
  }
  return (
    <div className="space-y-2">
      {blocks.map((b, i) => {
        if (b.kind === 'ul') {
          return (
            <ul key={i} className="space-y-1">
              {b.lines.map((l, j) => (
                <li key={j} className="flex gap-2"><span className="text-lime shrink-0">▸</span><span>{renderText(l.replace(/^[-*•]\s+/, ''))}</span></li>
              ))}
            </ul>
          );
        }
        if (b.kind === 'table') {
          const rows = b.lines.filter((l) => !/^\|?[\s:|-]+\|?$/.test(l)).map(cells); // drop the |---| rule
          const [head, ...body] = rows;
          return (
            <div key={i} className="overflow-x-auto no-scrollbar -mx-1">
              <table className="w-full border-collapse font-mono text-[11px] leading-snug">
                <thead>
                  <tr>{head.map((c, j) => <th key={j} className="border border-electric-soft/40 bg-electric/25 px-2 py-1.5 text-left font-bold uppercase tracking-wider text-lime">{renderText(c)}</th>)}</tr>
                </thead>
                <tbody>
                  {body.map((r, j) => (
                    <tr key={j} className="odd:bg-void/40">
                      {r.map((c, k) => <td key={k} className="border border-electric-soft/25 px-2 py-1.5 align-top text-white/90">{renderText(c)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return <p key={i}>{renderText(b.lines[0])}</p>;
      })}
    </div>
  );
};

const BotAvatar = ({ size = 'w-9 h-9' }: { size?: string }) => (
  <img
    src={moodSrc('idle')}
    alt=""
    aria-hidden="true"
    className={`${size} shrink-0 rounded-full bg-panel ring-1 ring-electric-soft/50 object-contain`}
    draggable={false}
  />
);

const Thinking = ({ lines }: { lines: string[] }) => {
  const [line, setLine] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setLine((l) => (l + 1) % lines.length), 1400);
    return () => clearInterval(t);
  }, [lines]);
  return (
    <div className="flex items-end gap-2" role="status" aria-live="polite">
      <BotAvatar />
      <div className="border border-electric-soft/40 bg-panel/80 px-3.5 py-2.5">
        <img src={moodSrc('think')} alt="" aria-hidden="true" className="h-20 w-auto mb-1" draggable={false} />
        <AnimatePresence mode="wait">
          <motion.p
            key={line}
            className="font-mono text-[11px] text-mist"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {lines[line]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Lines the bot says in a bubble over its head while the chat is closed.
const NUDGES = [
  'Yohoo! Dito ang tingin! Profilio is here to assist you!',
  "Hey! I can tell you all about Jake.",
  'Jake is busy right now, you can ask me directly!',
  'Tap me to ask anything!',
  'Curious about his projects?',
  'Ask me in English, Bisaya, or Tagalog!',
];
const NUDGE_SHOW_MS = 4500;
const NUDGE_GAP_MS = 2500;

// The API can still return section ids from the previous site layout; map them onto this one.
const SECTION_ALIASES: Record<string, string> = { portfolio: 'work', about: 'home' };

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([{ id: 0, kind: 'bot', text: GREETING, mood: 'wave' }]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState<false | 'chat' | 'track'>(false);
  const [nudge, setNudge] = useState<number | null>(null);
  const nextId = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // The launcher is a Messenger-style chat head: drag it anywhere, and on release it
  // snaps to the nearest side edge. x/y are offsets from its resting spot (bottom-right).
  const headRef = useRef<HTMLDivElement>(null);
  const headX = useMotionValue(0);
  const headY = useMotionValue(0);
  const dragged = useRef(false);
  const [side, setSide] = useState<'left' | 'right'>('right');

  const snapHead = () => {
    const el = headRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const baseLeft = r.left - headX.get();
    const baseTop = r.top - headY.get();
    const margin = window.innerWidth - (baseLeft + r.width); // same gap as the resting spot
    const toLeft = r.left + r.width / 2 < window.innerWidth / 2;
    const maxTop = window.innerHeight - margin - r.height;
    const top = Math.min(Math.max(r.top, margin), maxTop);
    setSide(toLeft ? 'left' : 'right');
    const spring = { type: 'spring', stiffness: 500, damping: 35 } as const;
    animate(headX, toLeft ? margin - baseLeft : 0, spring);
    animate(headY, top - baseTop, spring);
  };

  useEffect(() => {
    window.addEventListener('resize', snapHead);
    return () => window.removeEventListener('resize', snapHead);
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // While the chat is closed: show a line, hide it, show the next one, and so on.
  useEffect(() => {
    if (open) { setNudge(null); return; }
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const show = () => {
      setNudge(i);
      timer = setTimeout(() => { setNudge(null); i = (i + 1) % NUDGES.length; timer = setTimeout(show, NUDGE_GAP_MS); }, NUDGE_SHOW_MS);
    };
    timer = setTimeout(show, 2000);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [items, thinking, open]);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || thinking) return;
    setInput('');

    const chat = smallTalk(text);
    if (chat) {
      setItems((cur) => [...cur, { id: nextId.current++, kind: 'user', text, local: true }, { id: nextId.current++, kind: 'bot', text: chat.text, mood: chat.mood, local: true }]);
      return;
    }

    if (WHERE_RE.test(text)) {
      setItems((cur) => [...cur, { id: nextId.current++, kind: 'user', text, local: true }]);
      setThinking('track');
      const reply = await trackJake(text);
      setItems((cur) => [...cur, { id: nextId.current++, kind: 'bot', text: reply, local: true }]);
      setThinking(false);
      return;
    }

    // Keyword hits (girlfriend, family, birthday, contact, being mean…) don't need thinking: answer right away.
    const quick = quickReply(text);
    if (quick) {
      setItems((cur) => [
        ...cur,
        { id: nextId.current++, kind: 'user', text, local: true },
        { id: nextId.current++, kind: 'bot', text: quick.reply, local: true, section: quick.section,
          mood: quick.kind === 'mean' ? 'hide' : quick.kind === 'girlfriend' ? 'love' : quick.kind === 'made' ? 'fly' : undefined },
      ]);
      return;
    }

    const userItem: Item = { id: nextId.current++, kind: 'user', text };
    const next = [...items, userItem];

    // History for the model: real Q&A only (skip the greeting, alerts, errors, local replies, and off-topic questions).
    const messages = next
      .slice(1)
      .flatMap((m) =>
        m.kind === 'user' && !m.offTopic && !m.local ? [{ role: 'user', content: m.text }]
        : m.kind === 'bot' && !m.local ? [{ role: 'assistant', content: m.text }]
        : []
      );

    const cacheKey = JSON.stringify(messages);
    const hit = answerCache.get(cacheKey);
    if (hit) {
      setItems([...next, { ...hit, id: nextId.current++ }]);
      return;
    }
    setItems(next);
    setThinking('chat');

    let result: Item;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.offTopic) {
        setItems((cur) => cur.map((m) => (m.id === userItem.id ? { ...m, offTopic: true } : m)));
        result = { id: nextId.current++, kind: 'alert' };
      } else if (data.mean && data.reply) {
        // Kept out of the model's history, like the other local replies.
        setItems((cur) => cur.map((m) => (m.id === userItem.id ? { ...m, local: true } : m)));
        result = { id: nextId.current++, kind: 'bot', text: data.reply, local: true, mood: 'hide' };
      } else if (res.ok && data.reply) {
        const mood: Mood | undefined = data.girlfriend ? 'love' : data.made ? 'fly' : DUNNO_RE.test(data.reply) ? 'ask' : undefined;
        result = { id: nextId.current++, kind: 'bot', text: data.reply, section: data.section, links: data.links, mood };
        // Personal replies are worded fresh each time, so only cache the router's fixed answers.
        if (!data.girlfriend && !data.family && !data.life) answerCache.set(cacheKey, result);
      } else {
        result = { id: nextId.current++, kind: 'error', text: data.error || 'I lost the signal. Try again!' };
      }
    } catch {
      result = { id: nextId.current++, kind: 'error', text: 'I lost the signal. Check your connection and try again!' };
    }
    setItems((cur) => [...cur, result]);
    setThinking(false);
  };

  // Phones: the chat covers the page, so close it to show the section.
  const visitSection = (id: string) => {
    const target = document.getElementById(SECTION_ALIASES[id] ?? id);
    if (!target) return;
    if (window.matchMedia('(max-width: 767px)').matches) setOpen(false);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  const onlyGreeting = items.length === 1;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat"
            role="dialog"
            aria-label="Chat with Profilio Bot about Jake"
            className={`cut fixed z-[60] bottom-24 md:bottom-28 w-[min(400px,calc(100vw-24px))] h-[min(600px,calc(100dvh-8.5rem))] flex flex-col bg-navy border border-electric-soft/40 shadow-[0_0_80px_rgb(30_55_255/0.35)] overflow-hidden ${
              side === 'left' ? 'left-3 md:left-6 origin-bottom-left' : 'right-3 md:right-6 origin-bottom-right'
            }`}
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Header: terminal title bar, like the Read Profile window */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-electric-soft/30 bg-electric/20">
              <span className="flex gap-1.5" aria-hidden="true">
                <span className="w-3 h-3 rounded-full bg-lime" />
                <span className="w-3 h-3 rounded-full bg-electric-soft" />
                <span className="w-3 h-3 rounded-full bg-mist/50" />
              </span>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-mist">~/profilio/bot</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="ml-auto w-8 h-8 flex items-center justify-center text-white border border-electric-soft/40 hover:border-lime hover:text-lime transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-electric-soft/20">
              <BotAvatar size="w-11 h-11" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-bold uppercase tracking-wide leading-none text-white">Profilio<span className="text-lime">.</span>Bot</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-mist flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-lime animate-pulse" /> Jake's guide · online
                </p>
              </div>
            </div>

            {/* Message list */}
            <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain grid-bg p-4 space-y-3">
              {items.map((m) =>
                m.kind === 'user' ? (
                  <motion.div key={m.id} className="flex justify-end" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="cut-sm max-w-[80%] bg-lime px-3.5 py-2 text-sm font-medium text-void break-words">
                      {m.text}
                    </p>
                  </motion.div>
                ) : m.kind === 'alert' ? (
                  <motion.div
                    key={m.id}
                    role="alert"
                    className="flex items-end gap-2"
                    initial={{ opacity: 0, x: 0 }}
                    animate={{ opacity: 1, x: [0, -8, 8, -6, 6, 0] }}
                    transition={{ duration: 0.45 }}
                  >
                    <BotAvatar />
                    <div className="max-w-[80%] border border-red-400/70 bg-red-500/15 px-3.5 py-2.5 text-red-100">
                      <p className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-red-300">
                        <AlertTriangle size={16} strokeWidth={2.6} /> This is only about Jake
                      </p>
                      <p className="text-xs mt-1 opacity-90">I can only answer questions about Jake. Try one of those!</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key={m.id} className="flex items-end gap-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <BotAvatar />
                    <div className="max-w-[85%] min-w-0">
                      <div
                        className={`border px-3.5 py-2 text-sm leading-relaxed break-words ${
                          m.kind === 'error' ? 'border-lime/40 bg-lime/10 text-lime' : 'border-electric-soft/40 bg-panel/80 text-white/90'
                        }`}
                      >
                        <RichText text={m.text} />
                      </div>
                      {m.kind === 'bot' && m.mood && (
                        <img src={moodSrc(m.mood)} alt="" aria-hidden="true" className="mt-1.5 h-24 w-auto" draggable={false} />
                      )}
                      {m.kind === 'bot' && m.links?.map((l) => (
                        <a
                          key={l.url}
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1.5 mr-1.5 inline-flex items-center gap-1 border border-electric-soft/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white hover:border-lime hover:text-lime transition-colors"
                        >
                          {l.label} <ArrowUpRight size={13} strokeWidth={2.6} />
                        </a>
                      ))}
                      {m.kind === 'bot' && m.section && (
                        <button
                          type="button"
                          onClick={() => visitSection(m.section!)}
                          className="mt-1.5 inline-flex items-center gap-1.5 border border-lime/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-lime hover:bg-lime hover:text-void transition-colors"
                        >
                          Go to section <ArrowUpRight size={13} strokeWidth={2.6} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              )}
              {thinking && <Thinking key={thinking} lines={thinking === 'track' ? TRACKING_LINES : THINKING_LINES} />}
              {onlyGreeting && !thinking && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="border border-lime/50 bg-lime/5 px-3 py-1.5 font-mono text-[11px] text-lime hover:bg-lime hover:text-void transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input row: terminal prompt + lime send button */}
            <form
              className="flex items-center gap-2.5 p-3 border-t border-electric-soft/30 bg-void/60"
              onSubmit={(e) => { e.preventDefault(); send(input); }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={600}
                placeholder="> ask about Jake…"
                aria-label="Your question about Jake"
                className="min-w-0 flex-1 border border-electric-soft/40 bg-navy px-4 py-2.5 font-mono text-sm text-white placeholder:text-mist/50 outline-none focus:border-lime transition-colors"
              />
              <button
                type="submit"
                disabled={!!thinking || !input.trim()}
                aria-label="Send"
                className="cut-sm w-11 h-11 shrink-0 bg-lime text-void flex items-center justify-center hover:bg-white active:translate-y-0.5 disabled:opacity-40 transition"
              >
                <SendHorizontal size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating launcher: a draggable chat head carrying its speech bubble with it */}
      <motion.div
        ref={headRef}
        className="fixed z-[60] right-2 md:right-5 bottom-2 md:bottom-4 w-20 h-20 md:w-24 md:h-24 touch-none cursor-grab active:cursor-grabbing"
        style={{ x: headX, y: headY }}
        drag
        dragMomentum={false}
        onPointerDown={() => { dragged.current = false; }}
        onDragStart={() => { dragged.current = true; setNudge(null); }}
        onDragEnd={snapHead}
      >
        {/* Speech bubble over the bot's head */}
        <AnimatePresence>
          {!open && nudge !== null && (
            <motion.button
              key={nudge}
              type="button"
              onClick={() => setOpen(true)}
              className={`absolute bottom-full mb-1 w-max max-w-[220px] border border-lime/70 bg-navy/95 px-3.5 py-2.5 text-left font-mono text-xs leading-snug text-white shadow-[0_0_24px_rgb(212_255_31/0.25)] ${
                side === 'left' ? 'left-1 origin-bottom-left' : 'right-1 origin-bottom-right'
              }`}
              initial={{ opacity: 0, scale: 0.6, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 6 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            >
              <span className="text-lime">&gt; </span>{NUDGES[nudge]}
              {/* tail pointing down at the bot */}
              <span aria-hidden="true" className={`absolute -bottom-[7px] w-3 h-3 rotate-45 border-r border-b border-lime/70 bg-navy ${side === 'left' ? 'left-8 md:left-10' : 'right-8 md:right-10'}`} />
            </motion.button>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          // A drag ends with a click too; only a plain tap toggles the chat.
          onClick={() => { if (!dragged.current) setOpen((o) => !o); }}
          aria-expanded={open}
          aria-label={open ? 'Close chat' : 'Chat with Profilio Bot about Jake'}
          title="Ask Profilio Bot about Jake (drag to move)"
          className="w-full h-full drop-shadow-[0_0_16px_rgb(69_96_255/0.85)] cursor-[inherit]"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          <img src={moodSrc('idle')} alt="" aria-hidden="true" className="w-full h-full object-contain pointer-events-none" draggable={false} />
          {open && (
            <span className="absolute top-0 right-0 w-7 h-7 rounded-full bg-lime text-void flex items-center justify-center shadow-[0_0_10px_#D4FF1F]">
              <X size={16} strokeWidth={3} />
            </span>
          )}
        </motion.button>
      </motion.div>
    </>
  );
}
