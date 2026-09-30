import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ArrowUpRight, SendHorizontal, X } from 'lucide-react';

// Floating "Ask BMO" chat. BMO answers questions about Jake only (see api/chat.ts);
// anything else comes back as offTopic and shows the red alert bubble instead.

type Item =
  | { id: number; kind: 'user'; text: string; offTopic?: boolean }
  | { id: number; kind: 'bot'; text: string; character?: string; section?: string; links?: { label: string; url: string }[] }
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
const SUGGESTIONS = ['Who is Jake?', 'What are his skills?', 'Show me his projects', 'How can I contact him?'];
const GREETING = "Hi, I'm BMO, Jake's Assistant! I'll be the one chatting with you since Jake is busy working. Ask me anything about him: his work, skills, projects, or how to reach him.";

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

const Thinking = () => {
  const [line, setLine] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setLine((l) => (l + 1) % THINKING_LINES.length), 1400);
    return () => clearInterval(t);
  }, []);
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
        <AnimatePresence mode="wait">
          <motion.p
            key={line}
            className="text-xs italic text-bmo-slot"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {THINKING_LINES[line]}
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
  const [thinking, setThinking] = useState(false);
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
    const userItem: Item = { id: nextId.current++, kind: 'user', text };
    const next = [...items, userItem];
    setItems(next);
    setInput('');
    setThinking(true);

    // History for the model: real Q&A only (skip the greeting, alerts, errors and off-topic questions).
    const messages = next
      .slice(1)
      .flatMap((m) =>
        m.kind === 'user' && !m.offTopic ? [{ role: 'user', content: m.text }]
        : m.kind === 'bot' ? [{ role: 'assistant', content: m.text }]
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
      } else if (res.ok && data.reply) {
        result = { id: nextId.current++, kind: 'bot', text: data.reply, character: data.character, section: data.section, links: data.links };
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
              {thinking && <Thinking />}
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
                disabled={thinking || !input.trim()}
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
