import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ArrowUpRight, SendHorizontal, X } from 'lucide-react';

// Floating "Ask BMO" chat. BMO answers questions about Jake only (see api/chat.ts);
// anything else comes back as offTopic and shows the red alert bubble instead.

type Item =
  | { id: number; kind: 'user'; text: string; offTopic?: boolean; local?: boolean }
  | { id: number; kind: 'bot'; text: string; local?: boolean; character?: string; section?: string; links?: { label: string; url: string }[]; gif?: { src: string; alt: string } }
  | { id: number; kind: 'gif'; src: string; alt: string }
  | { id: number; kind: 'alert' }
  | { id: number; kind: 'error'; text: string };

const THINKING_LINES = [
  "Let me check Jake's resume…",
  'Finding the information…',
  'Reviewing his details…',
  'Asking my friends in Ooo…',
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
  'Reading the map of Ooo…',
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
  if (!data) return { en: "BMO's tracker lost the signal. Try again in a moment!", ceb: 'Nawala ang signal sa tracker ni BMO. Sulayi balik kadiyot!', tl: 'Nawalan ng signal ang tracker ni BMO. Subukan ulit mamaya!' }[lang];
  if (!data.place) return { en: "Jake's phone hasn't checked in yet, so BMO can't find him right now.", ceb: 'Wala pa nag-check in ang phone ni Jake, mao nga dili pa siya makit-an ni BMO karon.', tl: 'Hindi pa nag-check in ang phone ni Jake, kaya hindi pa siya mahanap ni BMO ngayon.' }[lang];
  const where = `**${data.place}, ${data.country}**`;
  return {
    en: `Found him! Jake is in ${where} right now. (Last check-in: ${timeAgo(data.at)}.)`,
    ceb: `Nakit-an na nako siya! Naa si Jake sa ${where} karon. (Last check-in: ${timeAgo(data.at)}.)`,
    tl: `Nahanap ko na siya! Nasa ${where} si Jake ngayon. (Last check-in: ${timeAgo(data.at)}.)`,
  }[lang];
};
// Who BMO went to ask (api/chat.ts GUIDES), shown on the "Visit … section" chip.
const CHARACTER_IMG: Record<string, string> = {
  'BMO': '/bmo.webp',
  'Jake the Dog': '/jake-wave.webp',
  'Finn': '/finn.webp',
  'Marceline': '/marceline.webp',
  'Gunter': '/gunter.webp',
  'Princess Bubblegum': '/bubblegum.webp',
  'Flame Princess': '/flame-princess.webp',
  'Lady Rainicorn': '/rainicorn.webp',
  'Lumpy Space Princess': '/lsp.webp',
  'Ice King': '/ice-king.webp',
};
// "Bye" gets a waving GIF straight from BMO, no API call.
const BYE_GIFS = [
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTNna2M5YzZtbDQwMXhiMGRqa2hpNXF3amp4NzN2ZWN0ZThkcGRxbCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/z9YISRsmFchUeUMzbM/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTNna2M5YzZtbDQwMXhiMGRqa2hpNXF3amp4NzN2ZWN0ZThkcGRxbCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/fYARMNtQu7N5lfMWOk/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3aWI0dGx3MjF3eW1zYzJuYmhwdnlyejBxeG8ybjE5MWZnMW9uZmMydiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/H68qSZkEG9qw39YvRD/giphy.gif',
];
// The quick replies below also understand Cebuano and Tagalog.
const BYE_RE = /^((good\s*)?bye+(\s*bye+)*|ba+bay|paalam|amping|ingat)(\s+(na|ka|kayo|bmo))*[\s!.~]*$/i;
// Thanks and compliments make BMO happy: same treatment, one happy GIF.
const HAPPY_GIF = 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnJpOWZobWxzcmp2cWVmZXg2YWc0MTY3NDVzYWpuc2R3eXpjNWV6MyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/lOHus6F5z7Ftzpm4jS/giphy.gif';
const HAPPY_RE = /^(thanks?( you)?( so much)?|thx|ty|tysm|(daghang |maraming )?salamat( kaayo| po)?|ang (cute|galing) mo|nindot kaayo|galing|you'?re (so )?(cute|awesome|amazing|the best|great|cool)|(so )?(cute|awesome|amazing|cool|nice|great|perfect)|good (job|work)|well done|good bmo)(\s+bmo)?[\s!.~<3]*$/i;
// Asking BMO to dance (or for a party) gets the dancing GIF.
const DANCE_GIF = 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnJpOWZobWxzcmp2cWVmZXg2YWc0MTY3NDVzYWpuc2R3eXpjNWV6MyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/aLI73eIgT41b2/giphy.gif';
const DANCE_RE = /\b(dance|dancing|party|boogie|sayaw|sumayaw|magsayaw|indak)\b/i;
// "I love you" gets its own GIF (checked before the happy one).
const LOVE_GIF = 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnJpOWZobWxzcmp2cWVmZXg2YWc0MTY3NDVzYWpuc2R3eXpjNWV6MyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/h5tnH6Em0i5GZgeTTI/giphy.gif';
const LOVE_RE = /^((i\s*)?(love\s*(you|u)|ily)|love\s+tika|gihigugma\s+tika|mahal\s+kita)(\s*(so much|too|bmo|kaayo|din|rin))*[\s!.~<3]*$/i;
// Threats, cursing, fights, and insults make BMO cry and tell on them to Jake (api/chat.ts flags them `mean`).
const CRY_GIF = 'https://media.tenor.com/iroI0M8PoasAAAAC/adventure-time-cry.gif';
// Shown in the thinking bubble while BMO waits on the answer.
const WAITING_GIF = 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYXdxZ3RqN2F4OXdpYjk2MXBlNWdjczN1cDRycTdxd3l6YzE5ZW5uMCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/JmPabUqU22FAbQYkzN/giphy.gif';
// When the profile doesn't cover a question, api/chat.ts answers "Jake hasn't shared that one yet…"; BMO shrugs along.
const DUNNO_GIF = 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnJpOWZobWxzcmp2cWVmZXg2YWc0MTY3NDVzYWpuc2R3eXpjNWV6MyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/JmPabUqU22FAbQYkzN/giphy.gif';
const DUNNO_RE = /hasn't shared that|wala pa ni nag-share|hindi pa ito naibabahagi/i;
// Questions about Jake's girlfriend come back flagged `girlfriend` (api/chat.ts) and get this GIF.
const GIRLFRIEND_GIF = 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3YWVjZ3J2bHQ1d291OTZpNXZqZmszbWFiYmd1eGF2Yjd4ZWg0dzZkbSZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/6rslXNsiJxwme5Xjyg/giphy.gif';
// "Who is …?" GIFs. Jake and BMO still go to the API and the GIF rides along under the answer;
// the other characters aren't about Jake (the API would flag them off-topic), so BMO answers with just the GIF.
// English "who is …", Cebuano "kinsa (si|ka) …", Tagalog "sino (si|ka) …".
const WHO_IS = String.raw`(\bwho\s*(is|'s|s|are|r)\s*(u\s+|you\s+)?|\b(kinsay|kinsa|sino)\s+(ba\s+)?(si\s+|ang\s+|ka\b\s*)?)`;
const WHO_GIFS: { re: RegExp; src: string; alt: string; local?: boolean }[] = [
  {
    re: new RegExp(WHO_IS + String.raw`(jake|riel|reil|he)\b`, 'i'),
    src: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdmlsNGhrMHBkeWhwNGd3ZzNqMmpmeGhsMW85N2JiNXp2NGxneWt4ayZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/cjExA4kq4KVFtkMLUH/giphy.gif',
    alt: 'BMO introducing Jake',
  },
  {
    re: new RegExp(WHO_IS + String.raw`(bmo|you|u)\b|\b(kinsa|sino)\s+(ba\s+)?ka\b`, 'i'),
    src: 'https://media.tenor.com/EwQ5ZIES3BAAAAAC/bmo-adventure-time.gif',
    alt: 'BMO saying hi',
  },
  {
    re: new RegExp(WHO_IS + String.raw`(princess\s*)?(bubble\s*gum|pb)\b`, 'i'),
    src: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdmlsNGhrMHBkeWhwNGd3ZzNqMmpmeGhsMW85N2JiNXp2NGxneWt4ayZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/YsN9XdfWtvtcTtZdwT/giphy.gif',
    alt: 'Princess Bubblegum',
    local: true,
  },
  {
    re: new RegExp(WHO_IS + String.raw`(lumpy\s*space(\s*princess)?|lsp)\b`, 'i'),
    src: 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3MTQxdGExNTZqOWk1b2hzZ2IwaTY0bjB1azlxNjlvNjFrYzg0ODNyZSZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/L1PwbmWRLGaV38jJ9m/giphy.gif',
    alt: 'Lumpy Space Princess',
    local: true,
  },
  {
    re: new RegExp(WHO_IS + String.raw`((flame|fire)\s*princess|fp)\b`, 'i'),
    src: 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3dmh6c2g0ejF0cXpnb3I1bW9uc3FpeWp3bnRzcDQ2bG1yaXU5ODh4aiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/9GT0BJD6cqhdC/giphy.gif',
    alt: 'Flame Princess',
    local: true,
  },
  {
    re: new RegExp(WHO_IS + String.raw`marceline\b`, 'i'),
    src: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdmlsNGhrMHBkeWhwNGd3ZzNqMmpmeGhsMW85N2JiNXp2NGxneWt4ayZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/5XFYQM7gRAPy8/giphy.gif',
    alt: 'Marceline',
    local: true,
  },
  {
    re: new RegExp(WHO_IS + String.raw`((lady\s*)?rainicorn|rainbow(\s*unicorn)?)\b`, 'i'),
    src: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdmlsNGhrMHBkeWhwNGd3ZzNqMmpmeGhsMW85N2JiNXp2NGxneWt4ayZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/2aON3EshAcUKY/giphy.gif',
    alt: 'Lady Rainicorn',
    local: true,
  },
  {
    re: new RegExp(WHO_IS + String.raw`(the\s+)?(penguin|gunter|gunther)\b`, 'i'),
    src: 'https://media.tenor.com/HHIQUiQEzm0AAAAC/gunter.gif',
    alt: 'Gunter the penguin',
    local: true,
  },
];
const whoGif = (text: string) => WHO_GIFS.find((g) => g.re.test(text));
const SUGGESTIONS = ['Who is Jake?', 'What are his skills?', 'Show me his projects', 'How can I contact him?'];
const GREETING = "Hi, I'm BMO, Jake's Assistant! I'll be the one chatting with you since Jake is busy working. Ask me anything about him: his work, skills, projects, or how to reach him. You can ask in English, Cebuano, or Tagalog!";

// The model sometimes answers with **bold**; render that, leave everything else as text.
const renderText = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part
  );

const BmoAvatar = ({ size = 'w-9 h-9' }: { size?: string }) => (
  <img
    src="/bmo-face.webp"
    alt=""
    aria-hidden="true"
    className={`${size} shrink-0 rounded-lg border-2 border-bmo-ink bg-bmo object-cover`}
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
      <BmoAvatar />
      <div className="rounded-2xl rounded-bl-sm border-2 border-bmo-ink bg-white/70 px-3.5 py-2.5">
        <div className="flex gap-1 mb-1" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-bmo-slot"
              animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
        <img src={WAITING_GIF} alt="" aria-hidden="true" className="mb-1 h-16 object-contain" draggable={false} />
        <AnimatePresence mode="wait">
          <motion.p
            key={line}
            className="text-xs italic text-bmo-slot"
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

export default function BmoChat() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([{ id: 0, kind: 'bot', text: GREETING }]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState<false | 'chat' | 'track'>(false);
  const nextId = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [items, thinking, open]);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || thinking) return;
    setInput('');

    const who = whoGif(text);
    const gif = BYE_RE.test(text) ? { src: BYE_GIFS[Math.floor(Math.random() * BYE_GIFS.length)], alt: 'BMO waving goodbye' }
      : LOVE_RE.test(text) ? { src: LOVE_GIF, alt: 'BMO loves you too' }
      : HAPPY_RE.test(text) ? { src: HAPPY_GIF, alt: 'BMO feeling happy' }
      : DANCE_RE.test(text) ? { src: DANCE_GIF, alt: 'BMO dancing' }
      : who?.local ? { src: who.src, alt: who.alt }
      : null;
    if (gif) {
      setItems((cur) => [...cur, { id: nextId.current++, kind: 'user', text, local: true }, { id: nextId.current++, kind: 'gif', ...gif }]);
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

    const userItem: Item = { id: nextId.current++, kind: 'user', text };
    const next = [...items, userItem];
    setItems(next);
    setThinking('chat');

    // History for the model: real Q&A only (skip the greeting, alerts, errors, GIFs, the messages that got them, and off-topic questions).
    const messages = next
      .slice(1)
      .flatMap((m) =>
        m.kind === 'user' && !m.offTopic && !m.local ? [{ role: 'user', content: m.text }]
        : m.kind === 'bot' && !m.local ? [{ role: 'assistant', content: m.text }]
        : []
      );

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
        // Kept out of the model's history, like the other GIF replies.
        setItems((cur) => cur.map((m) => (m.id === userItem.id ? { ...m, local: true } : m)));
        result = { id: nextId.current++, kind: 'bot', text: data.reply, local: true, gif: { src: CRY_GIF, alt: 'BMO crying' } };
      } else if (res.ok && data.reply) {
        result = { id: nextId.current++, kind: 'bot', text: data.reply, character: data.character, section: data.section, links: data.links, gif: data.girlfriend ? { src: GIRLFRIEND_GIF, alt: 'BMO gushing about Ate Jessa' }
          : DUNNO_RE.test(data.reply) ? { src: DUNNO_GIF, alt: 'BMO shrugging, not sure' }
          : who ? { src: who.src, alt: who.alt }
          : undefined };
      } else {
        result = { id: nextId.current++, kind: 'error', text: data.error || 'BMO lost the signal. Try again!' };
      }
    } catch {
      result = { id: nextId.current++, kind: 'error', text: 'BMO lost the signal. Check your connection and try again!' };
    }
    setItems((cur) => [...cur, result]);
    setThinking(false);
  };

  // Phones: the chat covers the page, so close it to show the section.
  const visitSection = (id: string) => {
    const target = document.getElementById(id);
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
            key="bmo-chat"
            role="dialog"
            aria-label="Chat with BMO about Jake"
            className="fixed z-[60] right-3 md:right-6 bottom-24 md:bottom-28 w-[min(380px,calc(100vw-24px))] h-[min(580px,calc(100dvh-8.5rem))] flex flex-col rounded-[28px] border-[3px] border-bmo-ink bg-bmo shadow-[6px_6px_0_rgba(23,4,20,0.35)] overflow-hidden origin-bottom-right"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Header: BMO's face + name, close button styled like BMO's small slot buttons */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-3">
              <BmoAvatar size="w-11 h-11" />
              <div className="min-w-0 flex-1 text-bmo-ink">
                <p className="font-display text-xl font-bold leading-none">BMO</p>
                <p className="text-xs font-semibold opacity-70 mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-bmo-yellow border border-bmo-ink" /> Jake's guide · online
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="w-9 h-9 rounded-full bg-bmo-slot text-white border-2 border-bmo-ink flex items-center justify-center shadow-[inset_0_-3px_0_rgba(23,4,20,0.3)] hover:brightness-110 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* BMO's screen */}
            <div
              ref={listRef}
              className="flex-1 mx-3 overflow-y-auto overscroll-contain rounded-2xl border-[3px] border-bmo-ink bg-bmo-screen p-3 space-y-3 shadow-[inset_0_3px_0_rgba(23,4,20,0.08)]"
            >
              {items.map((m) =>
                m.kind === 'user' ? (
                  <motion.div key={m.id} className="flex justify-end" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="max-w-[80%] rounded-2xl rounded-br-sm border-2 border-bmo-ink bg-bmo-pink px-3.5 py-2 text-sm text-white break-words">
                      {m.text}
                    </p>
                  </motion.div>
                ) : m.kind === 'gif' ? (
                  <motion.div key={m.id} className="flex items-end gap-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <BmoAvatar />
                    <img
                      src={m.src}
                      alt={m.alt}
                      className="max-w-[60%] max-h-40 rounded-2xl rounded-bl-sm border-2 border-bmo-ink bg-white/70 object-contain"
                      draggable={false}
                    />
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
                    <BmoAvatar />
                    <div className="max-w-[80%] rounded-2xl rounded-bl-sm border-2 border-bmo-ink bg-red-500 px-3.5 py-2.5 text-white">
                      <p className="flex items-center gap-1.5 text-sm font-black tracking-wide">
                        <AlertTriangle size={16} strokeWidth={2.6} /> THIS IS ONLY ABOUT JAKE
                      </p>
                      <p className="text-xs mt-1 opacity-90">BMO can only answer questions about Jake. Try one of those!</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key={m.id} className="flex items-end gap-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <BmoAvatar />
                    <div className="max-w-[80%] min-w-0">
                      <p
                        className={`rounded-2xl rounded-bl-sm border-2 px-3.5 py-2 text-sm whitespace-pre-line break-words ${
                          m.kind === 'error' ? 'border-bmo-ink/40 bg-bmo-yellow/60 text-bmo-ink' : 'border-bmo-ink bg-white/70 text-bmo-ink'
                        }`}
                      >
                        {renderText(m.text)}
                      </p>
                      {m.kind === 'bot' && m.gif && (
                        <img
                          src={m.gif.src}
                          alt={m.gif.alt}
                          className="mt-1.5 max-h-32 rounded-2xl border-2 border-bmo-ink bg-white/70 object-contain"
                          draggable={false}
                        />
                      )}
                      {m.kind === 'bot' && m.links?.map((l) => (
                        <a
                          key={l.url}
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1.5 mr-1.5 inline-flex items-center gap-1 rounded-full border-2 border-bmo-ink bg-bmo-blue px-2.5 py-0.5 text-xs font-semibold text-bmo-ink shadow-[0_2px_0_rgba(23,4,20,0.3)] hover:-translate-y-0.5 transition-transform"
                        >
                          {l.label} <ArrowUpRight size={13} strokeWidth={2.6} />
                        </a>
                      ))}
                      {m.kind === 'bot' && m.section && m.character && (
                        <button
                          type="button"
                          onClick={() => visitSection(m.section!)}
                          className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border-2 border-bmo-ink bg-bmo-yellow pl-0.5 pr-2.5 py-0.5 text-xs font-semibold text-bmo-ink shadow-[0_2px_0_rgba(23,4,20,0.3)] hover:-translate-y-0.5 transition-transform"
                        >
                          {CHARACTER_IMG[m.character] && (
                            <img src={CHARACTER_IMG[m.character]} alt="" aria-hidden="true" className="w-5 h-5 rounded-full bg-white object-cover object-top" />
                          )}
                          Visit {m.character}'s section <ArrowUpRight size={13} strokeWidth={2.6} />
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
                      className="rounded-full border-2 border-bmo-ink bg-bmo-yellow px-3 py-1 text-xs font-semibold text-bmo-ink shadow-[0_2px_0_rgba(23,4,20,0.3)] hover:-translate-y-0.5 transition-transform"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input row: slot-style field and BMO's big pink button as Send */}
            <form
              className="flex items-center gap-2.5 p-3"
              onSubmit={(e) => { e.preventDefault(); send(input); }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={600}
                placeholder="Ask BMO about Jake…"
                aria-label="Your question about Jake"
                className="min-w-0 flex-1 rounded-full border-[3px] border-bmo-ink bg-bmo-screen px-4 py-2.5 text-sm text-bmo-ink placeholder:text-bmo-slot/60 outline-none focus:ring-2 focus:ring-bmo-yellow"
              />
              <button
                type="submit"
                disabled={!!thinking || !input.trim()}
                aria-label="Send"
                className="w-12 h-12 shrink-0 rounded-full border-[3px] border-bmo-ink bg-bmo-pink text-white flex items-center justify-center shadow-[inset_0_-4px_0_rgba(23,4,20,0.25)] hover:brightness-105 active:translate-y-0.5 disabled:opacity-50 transition"
              >
                <SendHorizontal size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating BMO launcher */}
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? 'Close chat with BMO' : 'Chat with BMO about Jake'}
        title="Ask BMO about Jake"
        className="fixed z-[60] right-3 md:right-6 bottom-4 md:bottom-6 w-16 h-16 md:w-[4.5rem] md:h-[4.5rem] rounded-full border-[3px] border-bmo-ink bg-bmo overflow-hidden shadow-[4px_4px_0_rgba(23,4,20,0.35)]"
        animate={open ? { y: 0, rotate: 0 } : { y: [0, -6, 0], rotate: [0, -3, 0, 3, 0] }}
        transition={open ? { duration: 0.2 } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <img src="/bmo-chat.webp" alt="" aria-hidden="true" className="w-full h-full object-cover" draggable={false} />
        {open && (
          <span className="absolute inset-0 flex items-center justify-center bg-bmo-ink/55 text-white">
            <X size={26} strokeWidth={3} />
          </span>
        )}
      </motion.button>
    </>
  );
}
