"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { HelpCircle, Plus } from "lucide-react";
import { HOME_FAQS } from "@/app/data/faqs";

/* Home page FAQ — accordion. Answers always stay in the HTML (only visually
   collapsed) so search engines can read them and they match the FAQ schema. */
export default function FAQSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [open, setOpen] = useState(0);

  return (
    <section ref={ref} id="faq" className="relative overflow-hidden bg-canvas py-24 lg:py-28">
      <div className="pointer-events-none absolute -left-40 top-1/4 size-[430px] rounded-full bg-aqua-400/16 blur-[135px]" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 size-[430px] rounded-full bg-accent-400/16 blur-[135px]" />

      <div className="container-x relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 rounded-full border border-brand-200 bg-white px-4 py-2 text-[11.5px] font-bold uppercase tracking-[0.14em] text-brand-600"
          >
            <HelpCircle className="size-3.5" />
            FAQs
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 26 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="mt-6 text-[34px] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-[44px]"
          >
            Frequently Asked <span className="grad-text-anim">Questions</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-ink-soft"
          >
            Quick answers about digital marketing, AI marketing, AEO and working with Cybertricks Media.
          </motion.p>
        </div>

        <div className="mx-auto mt-12 max-w-4xl space-y-3">
          {HOME_FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={f.q}
                initial={{ opacity: 0, y: 18 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.25 + Math.min(i, 8) * 0.05 }}
                className={`overflow-hidden rounded-2xl border bg-white transition-shadow ${
                  isOpen ? "border-brand-200 shadow-lg shadow-brand-600/10" : "border-brand-100"
                }`}
              >
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-[12px] font-bold text-brand-600">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-[15px] font-bold leading-snug text-ink sm:text-[16.5px]">
                      {f.q}
                    </span>
                    <Plus
                      className={`size-5 shrink-0 text-brand-600 transition-transform duration-300 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    />
                  </button>
                </h3>
                <div
                  id={`faq-a-${i}`}
                  role="region"
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-[14.5px] leading-relaxed text-ink-soft sm:px-6 sm:pl-[72px] sm:text-[15px]">
                      {f.a}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
