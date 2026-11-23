"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import {
  ArrowRight, ArrowUpRight, Bot, Workflow, BrainCircuit, Mic, Sparkles, Cpu,
} from "lucide-react";

/* ================= DATA ================= */
const SOLUTIONS = [
  {
    Icon: Bot,
    t: "AI Agents",
    d: "Agents that qualify leads, support customers and handle operations tasks across your tools — 24/7.",
    tags: ["Sales", "Support", "Operations"],
    href: "/ai-agents",
    grad: "from-brand-600 to-plum-600",
    glow: "bg-brand-500/25",
  },
  {
    Icon: Workflow,
    t: "AI Workflow Automation",
    d: "Lead routing, follow-ups, data entry, documents and reports — automated across your apps.",
    tags: ["CRM Sync", "Follow-ups", "Reports"],
    href: "/ai-workflow-automation",
    grad: "from-aqua-500 to-brand-600",
    glow: "bg-aqua-400/30",
  },
  {
    Icon: BrainCircuit,
    t: "AI Co-Pilots",
    d: "Private assistants trained on your business knowledge that help every team work faster.",
    tags: ["Knowledge", "Drafting", "Insights"],
    href: "/ai-copilots",
    grad: "from-plum-600 to-accent-500",
    glow: "bg-plum-500/25",
  },
  {
    Icon: Mic,
    t: "AI Voice",
    d: "Voice agents that answer calls, qualify leads and book appointments in multiple languages.",
    tags: ["Calling", "Multilingual", "Voice-overs"],
    href: "/ai-voice",
    grad: "from-accent-500 to-plum-600",
    glow: "bg-accent-500/25",
  },
];

/* Orbit positions for the 4 icons around the core (degrees) */
const ORBIT = [0, 90, 180, 270];

const PARTICLES = [
  { top: "12%", left: "6%",  color: "bg-aqua-400",   dur: 18, dx: 40,  dy: -30 },
  { top: "72%", left: "12%", color: "bg-accent-400", dur: 22, dx: -35, dy: 40  },
  { top: "20%", left: "90%", color: "bg-plum-400",   dur: 20, dx: 45,  dy: 35  },
  { top: "84%", left: "80%", color: "bg-aqua-300",   dur: 24, dx: -40, dy: -35 },
  { top: "46%", left: "52%", color: "bg-accent-300", dur: 19, dx: 30,  dy: 45  },
];

/* ================================================================
   COMPONENT
================================================================ */
export default function AIDrivenSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative overflow-hidden bg-white py-20 lg:py-28">
      {/* ============ BACKGROUND ============ */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(43,57,144,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(43,57,144,0.06) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 100%)",
        }}
      />
      <div className="pointer-events-none absolute -left-40 top-10 size-[460px] rounded-full bg-aqua-400/20 blur-[130px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 size-[460px] rounded-full bg-accent-400/20 blur-[130px]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            className={`absolute size-[6px] rounded-full ${p.color}`}
            style={{ top: p.top, left: p.left }}
            animate={{
              x: [0, p.dx, 0, -p.dx * 0.6, 0],
              y: [0, p.dy, -p.dy * 0.5, p.dy * 0.3, 0],
              opacity: [0.25, 0.85, 0.45, 0.8, 0.25],
              scale: [1, 1.6, 1.1, 1.4, 1],
            }}
            transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
          />
        ))}
      </div>

      <div className="container-x relative z-10">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1fr] lg:gap-12">
          {/* ================= LEFT — CONTENT ================= */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 22 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-brand-600 via-plum-600 to-accent-500 px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_14px_34px_-12px_rgba(224,69,154,0.6)]"
            >
              {/* shimmer sweep */}
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ["0%", "400%"] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
              />
              <Sparkles className="relative size-4" />
              <span className="relative">AI Driven Solutions</span>
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.22 }}
              className="mt-6 text-[34px] font-extrabold leading-[1.12] tracking-tight text-ink sm:text-[42px] lg:text-[46px]"
            >
              Best AI Digital Marketing{" "}
              <span className="grad-text-anim">Agency in India</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.34 }}
              className="mt-5 max-w-xl text-[16px] leading-relaxed text-ink-soft"
            >
              Agents that act, workflows that run themselves, co-pilots that know
              your business and voice agents that never miss a call — practical
              AI built around your processes, with humans in control.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.46 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link href="/ai-services" className="btn-shine">
                <span className="btn-shine-text">
                  Explore AI Services
                  <ArrowRight className="size-4" />
                </span>
              </Link>
              <Link
                href="/contact-us"
                className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-brand-200 px-6 py-3.5 text-[14.5px] font-semibold text-brand-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-600 hover:bg-brand-50"
              >
                Book a Free AI Audit
              </Link>
            </motion.div>
          </div>

          {/* ================= RIGHT — ANIMATED AI CORE ================= */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto flex aspect-square w-full max-w-[440px] items-center justify-center"
          >
            {/* soft backdrop */}
            <div className="absolute inset-[12%] rounded-full bg-gradient-to-br from-aqua-100 via-plum-100 to-accent-100 blur-2xl" />

            {/* rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[4%] rounded-full border-2 border-dashed border-brand-200"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[22%] rounded-full border border-dashed border-plum-300"
            />

            {/* pulse waves */}
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="absolute size-[30%] rounded-full border-2 border-accent-400/60"
                animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: i * 1 }}
              />
            ))}

            {/* core */}
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 grid size-[30%] place-items-center rounded-full bg-gradient-to-br from-brand-600 via-plum-600 to-accent-500 text-white shadow-[0_24px_60px_-14px_rgba(123,63,160,0.7)]"
            >
              <Cpu className="size-1/3" />
              <span className="absolute -bottom-7 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
                AI Core
              </span>
            </motion.div>

            {/* orbiting solution icons */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[4%]"
            >
              {SOLUTIONS.map((s, i) => {
                const a = (ORBIT[i] * Math.PI) / 180;
                return (
                  <div
                    key={s.t}
                    className="absolute"
                    style={{
                      left: `${50 + 50 * Math.cos(a)}%`,
                      top: `${50 + 50 * Math.sin(a)}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {/* counter-rotate so icons stay upright */}
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <span
                        className={`grid size-12 place-items-center rounded-2xl bg-gradient-to-br ${s.grad} text-white shadow-[0_14px_30px_-10px_rgba(43,57,144,0.55)] ring-4 ring-white sm:size-14`}
                      >
                        <s.Icon className="size-5 sm:size-6" />
                      </span>
                      <span className="hidden whitespace-nowrap rounded-full bg-white/90 px-2.5 py-1 sm:inline text-[10.5px] font-bold text-ink shadow-sm backdrop-blur-sm">
                        {s.t}
                      </span>
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>

        {/* ================= CARDS ================= */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {SOLUTIONS.map((s, i) => (
            <motion.div
              key={s.t}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={s.href}
                className="group relative block h-full overflow-hidden rounded-[24px] p-[1.5px] transition-transform duration-500 hover:-translate-y-2"
              >
                {/* animated gradient border */}
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-[-60%] opacity-40 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      "conic-gradient(from 0deg, #6fcfe7, #2b3990, #7b3fa0, #e0459a, #6fcfe7)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />

                <div className="relative flex h-full flex-col rounded-[22.5px] bg-white p-6">
                  <div className={`pointer-events-none absolute -right-10 -top-10 size-32 rounded-full ${s.glow} blur-2xl transition-transform duration-500 group-hover:scale-150`} />

                  <div className="relative flex items-start justify-between">
                    <span
                      className={`grid size-12 place-items-center rounded-2xl bg-gradient-to-br ${s.grad} text-white shadow-[0_12px_26px_-10px_rgba(43,57,144,0.6)] transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110`}
                    >
                      <s.Icon className="size-5" />
                    </span>
                    <span className="grid size-9 place-items-center rounded-full border border-line text-ink-soft transition-all duration-300 group-hover:border-transparent group-hover:bg-gradient-to-br group-hover:from-brand-600 group-hover:to-accent-500 group-hover:text-white">
                      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
                    </span>
                  </div>

                  <h3 className="relative mt-5 text-[18px] font-extrabold text-ink">{s.t}</h3>
                  <p className="relative mt-2 flex-1 text-[13.5px] leading-relaxed text-ink-soft">{s.d}</p>

                  <div className="relative mt-5 flex flex-wrap gap-1.5">
                    {s.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-brand-50 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-brand-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
