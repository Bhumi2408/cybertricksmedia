"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import {
  X, SendHorizontal, RotateCcw, Check, CheckCheck, LoaderCircle, Lock, ArrowRight,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

/* Site-wide lead chatbot (bottom-right).
   Flow: name → service → monthly budget → duration → mobile → summary + Submit → thank you.
   Leads go to the same Web3Forms inbox as the contact-page form. */

/* ================= CONFIG ================= */
const WEB3FORMS_ACCESS_KEY = "75064bc8-0384-4b3b-9da8-d29f46f65e7b";
const WHATSAPP = "https://wa.me/919266612221";
const TEASER_DELAY = 4000; // "Hi 👋" bubble appears after 4s
const TEASER_KEY = "ctm-chat-teaser-seen";

const SERVICES = [
  "Social Media Marketing",
  "SEO & Search Marketing",
  "Google & Meta Ads",
  "Film & Ad Production",
  "TV, Radio & Outdoor Ads",
  "Website & App Development",
  "Branding & Influencers",
  "AI & Automation",
  "Events & PR",
];

const BUDGETS = ["Under ₹25K", "₹25K – ₹1L", "₹1L – ₹5L", "₹5L+", "Not sure yet"];

const DURATIONS = [
  { value: "Quarterly", hint: "3 months" },
  { value: "Half-Yearly", hint: "6 months" },
  { value: "Yearly", hint: "12 months" },
];

const firstName = (name = "") => name.split(" ")[0];

const STEPS = [
  {
    key: "name",
    label: "Name",
    type: "text",
    placeholder: "Type your name…",
    ask: () => [
      "Hey there! 👋 Welcome to Cybertricks Media.",
      "I'll help you find the right plan — it takes less than a minute. What's your name?",
    ],
  },
  {
    key: "service",
    label: "Service",
    options: SERVICES,
    allowCustom: true,
    placeholder: "Pick one or type your own…",
    ask: (a) => [
      `Nice to meet you, ${firstName(a.name)}! 🙌`,
      "Which service are you looking for?",
    ],
  },
  {
    key: "budget",
    label: "Budget",
    options: BUDGETS,
    allowCustom: true,
    placeholder: "Pick a range or type an amount…",
    ask: (a) => [`${a.service} — great choice! ✨`, "What's your monthly budget?"],
  },
  {
    key: "duration",
    label: "Duration",
    options: DURATIONS,
    placeholder: "Choose an option above 👆",
    ask: () => ["Got it 👍", "What service duration are you looking for?"],
  },
  {
    key: "phone",
    label: "Mobile",
    type: "tel",
    placeholder: "10-digit mobile number",
    ask: () => [
      "Almost done! 📱",
      "What's your mobile number? Our strategist will call you with a custom plan.",
    ],
  },
];

const TOTAL = STEPS.length;

/* ================= HELPERS ================= */
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const optionValue = (o) => (typeof o === "string" ? o : o.value);

const titleCase = (s) =>
  s.trim().replace(/\s+/g, " ").replace(/\b\p{L}/gu, (c) => c.toUpperCase());

/* Accepts 98765 43210 / +91 98765-43210 / 098765 43210 → "9876543210", else null */
function normalizePhone(raw) {
  let d = raw.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}

const formatPhone = (d) => `+91 ${d.slice(0, 5)} ${d.slice(5)}`;

const nowTime = () =>
  new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

/* Safe storage — iOS Safari private mode throws on setItem() */
const storage = {
  get(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  },
};

/* ================================================================
   CHATBOT
================================================================ */
export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [unread, setUnread] = useState(true);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [step, setStep] = useState(0); // 0..TOTAL-1 = questions, TOTAL = review
  const [awaiting, setAwaiting] = useState(false); // input enabled
  const [answers, setAnswers] = useState({});
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | error | done

  const listRef = useRef(null);
  const inputRef = useRef(null);
  const runId = useRef(0); // bumps on restart/unmount → cancels pending bot replies
  const msgId = useRef(0);
  const started = useRef(false);

  const current = STEPS[step];
  const answeredCount = Object.keys(answers).length;
  const done = status === "done";

  /* ---------- conversation engine ---------- */
  const push = (msg) =>
    setMessages((m) => [...m, { id: ++msgId.current, time: nowTime(), ...msg }]);

  const say = async (lines, id) => {
    for (const text of lines) {
      setTyping(true);
      await wait(450 + Math.min(text.length * 14, 900));
      if (runId.current !== id) return false;
      setTyping(false);
      push({ from: "bot", text });
      await wait(180);
      if (runId.current !== id) return false;
    }
    return true;
  };

  const ask = async (index, ans) => {
    const id = runId.current;
    setStep(index);
    setAwaiting(false);
    if (await say(STEPS[index].ask(ans), id)) setAwaiting(true);
  };

  const review = async (ans) => {
    const id = runId.current;
    setStep(TOTAL);
    setAwaiting(false);
    const ok = await say(
      [`Perfect, ${firstName(ans.name)}! Here's a quick summary 👇`],
      id
    );
    if (ok) push({ from: "bot", kind: "summary" });
  };

  const botNudge = (text) => {
    const id = runId.current;
    setAwaiting(false);
    say([text], id).then((ok) => ok && setAwaiting(true));
  };

  const answer = (raw) => {
    if (!awaiting || !current) return;
    const value = raw.trim();
    if (!value) return;

    let stored = value;
    let shown = value;

    if (current.key === "name") {
      if (!/^\p{L}[\p{L} .'-]{1,39}$/u.test(value)) {
        push({ from: "user", text: value });
        setInput("");
        botNudge("Hmm, I didn't catch that 🙂 Could you share your name? First name is fine.");
        return;
      }
      stored = shown = titleCase(value);
    }

    if (current.key === "phone") {
      const digits = normalizePhone(value);
      push({ from: "user", text: value });
      setInput("");
      if (!digits) {
        botNudge("That doesn't look like a valid 10-digit mobile number. Mind checking it once? 🙏");
        return;
      }
      stored = formatPhone(digits);
      const next = { ...answers, phone: stored };
      setAnswers(next);
      review(next);
      return;
    }

    if (current.allowCustom && value.length < 2) return;

    push({ from: "user", text: shown });
    setInput("");
    const next = { ...answers, [current.key]: stored };
    setAnswers(next);
    if (step + 1 < TOTAL) ask(step + 1, next);
    else review(next);
  };

  const submit = async () => {
    if (status === "sending" || done) return;
    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `New Chatbot Lead from ${answers.name}`,
          from_name: "Cybertricks Media Website (Chatbot)",
          name: answers.name,
          phone: answers.phone,
          service: answers.service,
          budget: `${answers.budget} (monthly)`,
          duration: answers.duration,
          source: "Website Chatbot",
          page: window.location.href,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Submission failed");

      setStatus("done");
      push({ from: "bot", kind: "thanks" });
    } catch (err) {
      console.error("Chatbot submission error:", err);
      setStatus("error");
      say(
        ["Oops — that didn't go through 😕 Please tap Submit again, or message us on WhatsApp."],
        runId.current
      );
    }
  };

  const restart = () => {
    runId.current++;
    setMessages([]);
    setAnswers({});
    setInput("");
    setTyping(false);
    setStatus("idle");
    ask(0, {});
  };

  const openChat = () => {
    setOpen(true);
    setTeaser(false);
    setUnread(false);
    storage.set(TEASER_KEY, "1");
    if (!started.current) {
      started.current = true;
      ask(0, {});
    }
  };

  const toggle = () => (open ? setOpen(false) : openChat());

  const dismissTeaser = () => {
    setTeaser(false);
    storage.set(TEASER_KEY, "1");
  };

  /* ---------- effects ---------- */
  // Teaser bubble, once per session
  useEffect(() => {
    if (storage.get(TEASER_KEY)) return;
    const t = setTimeout(() => setTeaser(true), TEASER_DELAY);
    return () => clearTimeout(t);
  }, []);

  // Cancel pending bot replies on unmount
  useEffect(() => () => void runId.current++, []);

  // Keep the newest message in view
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, typing, awaiting, open]);

  // Focus the input when a typed answer is expected (desktop only — avoids popping the mobile keyboard)
  useEffect(() => {
    if (!open || !awaiting || !current) return;
    if (current.options && !current.allowCustom) return;
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true });
  }, [open, awaiting, current]);

  // Esc closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Full-screen on phones → lock page scroll behind it
  useEffect(() => {
    if (!open || !window.matchMedia("(max-width: 639px)").matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const inputDisabled =
    !awaiting || !current || (Boolean(current.options) && !current.allowCustom);

  const progressLabel = done
    ? "Completed"
    : step >= TOTAL
    ? "Ready to submit"
    : `Step ${step + 1} of ${TOTAL} · ${current.label}`;

  return (
    <MotionConfig reducedMotion="user">
      {/* ================= LAUNCHER ================= */}
      <div className="fixed bottom-6 right-6 z-[55]">
        <AnimatePresence>
          {teaser && !open && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="absolute bottom-[calc(100%_+_14px)] right-0 w-[250px] origin-bottom-right"
            >
              <button
                onClick={openChat}
                className="relative block w-full rounded-2xl rounded-br-md border border-line bg-white p-4 text-left shadow-[0_24px_50px_-18px_rgba(26,33,82,0.45)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                <p className="text-[14px] font-bold text-ink">Hi there! 👋</p>
                <p className="mt-1 text-[13px] leading-snug text-ink-soft">
                  Looking to grow your brand? Get a custom plan in under a minute.
                </p>
                <span className="mt-2.5 inline-flex items-center gap-1 text-[12.5px] font-semibold text-accent-600">
                  Let&apos;s talk <ArrowRight className="size-3.5" />
                </span>
              </button>
              <button
                onClick={dismissTeaser}
                aria-label="Dismiss message"
                className="absolute -left-2 -top-2 grid size-6 place-items-center rounded-full bg-ink text-white shadow-md transition hover:bg-accent-500"
              >
                <X className="size-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.6 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={toggle}
          aria-label={open ? "Close chat" : "Chat with us"}
          aria-expanded={open}
          className="relative grid size-16 place-items-center rounded-full text-white shadow-[0_16px_40px_-10px_rgba(224,69,154,0.7)]"
        >
          {!open && (
            <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-accent-500/40" />
          )}
          {/* rotating gradient ring */}
          <motion.span
            aria-hidden
            className="absolute -inset-[3px] rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, var(--color-aqua-400), var(--color-plum-600), var(--color-accent-500), var(--color-aqua-400))",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <span aria-hidden className="grad-deep absolute inset-0 rounded-full" />

          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <X className="size-7" />
              </motion.span>
            ) : (
              <motion.span
                key="bot"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, rotate: [0, 0, -12, 12, -8, 8, 0] }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{
                  scale: { duration: 0.2 },
                  opacity: { duration: 0.2 },
                  rotate: { duration: 1.2, repeat: Infinity, repeatDelay: 4 },
                }}
                className="relative"
              >
                <BotFace className="size-9" />
              </motion.span>
            )}
          </AnimatePresence>

          {/* online dot */}
          <span className="absolute bottom-0.5 right-0.5 size-3.5 rounded-full border-2 border-white bg-green-400" />

          {/* unread badge */}
          <AnimatePresence>
            {unread && !open && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15, delay: 1.4 }}
                className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-accent-500 text-[11px] font-bold text-white ring-2 ring-white"
              >
                1
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ================= PANEL ================= */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Chat with Cybertricks Media"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            data-lenis-prevent
            className="fixed inset-0 z-[60] flex origin-bottom-right flex-col overflow-hidden bg-canvas sm:inset-auto sm:bottom-[104px] sm:right-6 sm:h-[min(620px,calc(100dvh_-_128px))] sm:w-[390px] sm:rounded-[28px] sm:border sm:border-line sm:shadow-[0_40px_90px_-30px_rgba(26,33,82,0.55)]"
          >
            {/* ---------- HEADER ---------- */}
            <div className="grad-deep relative shrink-0 overflow-hidden px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] text-white">
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-aqua-400/30 blur-3xl"
                animate={{ x: [0, -20, 0], y: [0, 14, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -bottom-14 left-6 size-36 rounded-full bg-accent-500/30 blur-3xl"
                animate={{ x: [0, 24, 0], y: [0, -10, 0] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="relative flex items-center gap-3">
                <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm">
                  <BotFace className="size-8" />
                  <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-brand-700 bg-green-400" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-[16px] font-extrabold leading-tight">Cybertricks Assistant</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[12px] text-white/70">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-green-400" />
                    </span>
                    {typing ? "Typing…" : "Online · replies instantly"}
                  </p>
                </div>

                <button
                  onClick={restart}
                  aria-label="Start over"
                  title="Start over"
                  className="grid size-9 place-items-center rounded-full bg-white/10 transition hover:rotate-[-90deg] hover:bg-white/20"
                >
                  <RotateCcw className="size-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="grid size-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* progress */}
              <div className="relative mt-4">
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60">
                  <span>{progressLabel}</span>
                  <span>{Math.round((answeredCount / TOTAL) * 100)}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/15">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-aqua-300 via-plum-300 to-accent-400"
                    animate={{ width: `${(answeredCount / TOTAL) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            {/* ---------- MESSAGES ---------- */}
            <div
              ref={listRef}
              aria-live="polite"
              className="no-scrollbar relative flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-5"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(43,57,144,0.08) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            >
              <p className="mx-auto w-fit rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-ink-mute shadow-sm">
                Today
              </p>

              {messages.map((m, i) => {
                const prev = messages[i - 1];
                const showAvatar = m.from === "bot" && prev?.from !== "bot";

                if (m.kind === "summary") {
                  return (
                    <BotRow key={m.id} showAvatar={showAvatar}>
                      <SummaryCard
                        answers={answers}
                        status={status}
                        onSubmit={submit}
                        onRestart={restart}
                      />
                    </BotRow>
                  );
                }
                if (m.kind === "thanks") {
                  return (
                    <ThanksCard key={m.id} answers={answers} />
                  );
                }
                if (m.from === "bot") {
                  return (
                    <BotRow key={m.id} showAvatar={showAvatar}>
                      <div className="break-words rounded-2xl rounded-tl-md border border-line bg-white px-4 py-2.5 text-[14px] leading-relaxed text-ink shadow-[0_6px_18px_-12px_rgba(26,33,82,0.35)]">
                        {m.text}
                      </div>
                    </BotRow>
                  );
                }
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: 16, scale: 0.96 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-end"
                  >
                    <div className="max-w-[80%] break-words rounded-2xl rounded-tr-md bg-gradient-to-br from-brand-600 via-plum-600 to-accent-500 px-4 py-2.5 text-[14px] leading-relaxed text-white shadow-[0_10px_24px_-12px_rgba(123,63,160,0.7)]">
                      {m.text}
                    </div>
                    <span className="mt-1 flex items-center gap-1 text-[10.5px] text-ink-mute">
                      {m.time}
                      <CheckCheck className="size-3.5 text-aqua-500" />
                    </span>
                  </motion.div>
                );
              })}

              {/* quick replies */}
              <AnimatePresence>
                {awaiting && current?.options && (
                  <motion.div
                    key={`opts-${step}`}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                    className="flex flex-wrap justify-end gap-2 pl-10"
                  >
                    {current.options.map((o) => {
                      const v = optionValue(o);
                      return (
                        <motion.button
                          key={v}
                          variants={{
                            hidden: { opacity: 0, y: 10, scale: 0.9 },
                            show: { opacity: 1, y: 0, scale: 1 },
                          }}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => answer(v)}
                          className="rounded-full border border-brand-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-brand-600 shadow-sm transition-colors hover:border-transparent hover:bg-gradient-to-r hover:from-brand-600 hover:to-accent-500 hover:text-white"
                        >
                          {v}
                          {o.hint && <span className="ml-1.5 text-[11.5px] font-medium opacity-60">· {o.hint}</span>}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* typing indicator */}
              <AnimatePresence>
                {typing && (
                  <BotRow key="typing" showAvatar={messages.at(-1)?.from !== "bot"}>
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3.5 shadow-sm">
                      {[0, 1, 2].map((d) => (
                        <motion.span
                          key={d}
                          className="size-2 rounded-full bg-gradient-to-br from-plum-500 to-accent-500"
                          animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.15 }}
                        />
                      ))}
                    </div>
                  </BotRow>
                )}
              </AnimatePresence>
            </div>

            {/* ---------- FOOTER ---------- */}
            <div className="shrink-0 border-t border-line bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
              {done ? (
                <div className="flex gap-2.5">
                  <a
                    href={WHATSAPP}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-[14px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(37,211,102,0.7)] transition hover:-translate-y-0.5"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="h-4 w-4" />
                    WhatsApp us
                  </a>
                  <button
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-full border border-line px-4 py-3 text-[14px] font-semibold text-ink transition hover:border-accent-500 hover:text-accent-600"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    answer(input);
                  }}
                  className={`flex items-center gap-2 rounded-full border bg-canvas py-1.5 pl-4 pr-1.5 transition-all duration-300 ${
                    inputDisabled
                      ? "border-line opacity-70"
                      : "border-brand-200 focus-within:border-accent-400 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(224,69,154,0.1)]"
                  }`}
                >
                  {current?.type === "tel" && (
                    <span className="shrink-0 border-r border-line pr-2 text-[14px] font-semibold text-ink-soft">
                      +91
                    </span>
                  )}
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={inputDisabled}
                    type={current?.type === "tel" ? "tel" : "text"}
                    inputMode={current?.type === "tel" ? "tel" : "text"}
                    autoComplete={
                      current?.type === "tel" ? "tel-national" : current?.key === "name" ? "name" : "off"
                    }
                    maxLength={current?.type === "tel" ? 16 : 60}
                    placeholder={
                      !current
                        ? "Review your details above"
                        : !awaiting
                        ? "Assistant is typing…"
                        : current.placeholder
                    }
                    aria-label={current ? current.label : "Message"}
                    className="min-w-0 flex-1 bg-transparent py-1.5 text-[16px] text-ink outline-none placeholder:text-ink-mute disabled:cursor-not-allowed sm:text-[14.5px]"
                  />
                  <motion.button
                    type="submit"
                    disabled={inputDisabled || !input.trim()}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Send"
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-600 via-plum-600 to-accent-500 text-white shadow-[0_8px_20px_-8px_rgba(224,69,154,0.8)] transition-opacity disabled:opacity-40"
                  >
                    <SendHorizontal className="size-4" />
                  </motion.button>
                </form>
              )}
              <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-ink-mute">
                <Lock className="size-3" />
                Your details are safe with Cybertricks Media
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

/* ================= BOT MESSAGE ROW ================= */
function BotRow({ children, showAvatar }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
      transition={{ duration: 0.28 }}
      className="flex items-end gap-2"
    >
      <span className="grid size-8 shrink-0 place-items-center">
        {showAvatar && (
          <span className="grad-deep grid size-8 place-items-center rounded-full shadow-md">
            <BotFace className="size-5" />
          </span>
        )}
      </span>
      <div className="max-w-[82%]">{children}</div>
    </motion.div>
  );
}

/* ================= SUMMARY + SUBMIT ================= */
function SummaryCard({ answers, status, onSubmit, onRestart }) {
  const sending = status === "sending";
  const done = status === "done";

  return (
    <div className="w-[260px] max-w-full overflow-hidden rounded-2xl rounded-tl-md border border-line bg-white shadow-[0_14px_34px_-18px_rgba(26,33,82,0.45)]">
      <div className="grad-bg h-1" />
      <div className="p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-mute">Your request</p>
        <dl className="mt-3 space-y-2">
          {STEPS.map((s) => (
            <div key={s.key} className="flex items-start justify-between gap-3">
              <dt className="shrink-0 text-[12px] text-ink-mute">{s.label}</dt>
              <dd className="text-right text-[13px] font-semibold text-ink">
                {answers[s.key]}
                {s.key === "budget" && <span className="font-normal text-ink-mute"> /mo</span>}
              </dd>
            </div>
          ))}
        </dl>

        {done ? (
          <p className="mt-4 flex items-center justify-center gap-1.5 rounded-full bg-green-50 py-2.5 text-[13px] font-semibold text-green-700">
            <Check className="size-4" strokeWidth={3} /> Submitted
          </p>
        ) : (
          <>
            <button
              onClick={onSubmit}
              disabled={sending}
              className="btn-shine mt-4 w-full justify-center py-3! disabled:opacity-70"
            >
              <span className="btn-shine-text">
                {sending ? (
                  <>
                    Submitting <LoaderCircle className="size-4 animate-spin" />
                  </>
                ) : (
                  <>
                    {status === "error" ? "Try again" : "Submit"} <SendHorizontal className="size-4" />
                  </>
                )}
              </span>
            </button>
            <button
              onClick={onRestart}
              disabled={sending}
              className="mt-2 w-full text-center text-[12px] font-medium text-ink-mute transition hover:text-accent-600"
            >
              Edit answers · Start over
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ================= THANK YOU ================= */
const BURST = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  return {
    x: Math.cos(a) * 70,
    y: Math.sin(a) * 70,
    color: ["bg-aqua-300", "bg-accent-400", "bg-plum-300", "bg-yellow-300"][i % 4],
  };
});

function ThanksCard({ answers }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className="grad-deep relative overflow-hidden rounded-3xl px-5 pb-6 pt-8 text-center text-white shadow-[0_24px_50px_-20px_rgba(123,63,160,0.8)]"
    >
      <div className="relative mx-auto grid size-16 place-items-center">
        {BURST.map((p, i) => (
          <motion.span
            key={i}
            className={`absolute size-2 rounded-full ${p.color}`}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.4 }}
            transition={{ duration: 1.1, delay: 0.25, ease: "easeOut" }}
          />
        ))}
        <motion.span
          className="absolute inset-0 rounded-full bg-white/20"
          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.span
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.1 }}
          className="relative grid size-16 place-items-center rounded-full bg-white text-green-500 shadow-lg"
        >
          <Check className="size-8" strokeWidth={3.5} />
        </motion.span>
      </div>

      <h4 className="mt-5 text-[20px] font-extrabold">Thank you, {firstName(answers.name)}! 🎉</h4>
      <p className="mx-auto mt-2 max-w-[280px] text-[13.5px] leading-relaxed text-white/75">
        We&apos;ve received your request for <strong className="text-white">{answers.service}</strong>.
        Our strategist will call you on <strong className="text-white">{answers.phone}</strong> within
        4 working hours.
      </p>
    </motion.div>
  );
}

/* ================= ANIMATED BOT FACE ================= */
function BotFace({ className = "" }) {
  return (
    <span aria-hidden className={`relative flex flex-col items-center ${className}`}>
      {/* antenna */}
      <motion.span
        className="size-[18%] rounded-full bg-aqua-300 shadow-[0_0_8px_2px_rgba(111,207,231,0.8)]"
        animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="h-[10%] w-[7%] rounded-full bg-white" />
      {/* head */}
      <span className="flex h-[64%] w-full items-center justify-center rounded-[38%] bg-white p-[11%]">
        <motion.span
          className="flex h-full w-full items-center justify-center gap-[22%] rounded-[34%] bg-brand-900"
          animate={{ x: [0, 1.5, 0, -1.5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          {[0, 1].map((e) => (
            <motion.span
              key={e}
              className="h-[46%] w-[16%] rounded-full bg-aqua-300"
              animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
              transition={{ duration: 3.6, times: [0, 0.46, 0.5, 0.54, 1], repeat: Infinity }}
            />
          ))}
        </motion.span>
      </span>
    </span>
  );
}
