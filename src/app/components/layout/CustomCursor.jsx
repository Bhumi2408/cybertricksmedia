"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/* Big ring that trails the pointer + small dot that sits exactly on it.
   Only on devices with a real mouse (hidden on touch screens). */
const RING = 36;
const DOT = 8;
const GLOW = 84;

const CLICKABLE = 'a, button, [role="button"], label, select, summary, .cursor-pointer';

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 350, damping: 30, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 350, damping: 30, mass: 0.6 });

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      setHover(!!e.target.closest?.(CLICKABLE));
    };
    const leave = () => setVisible(false);
    const press = () => setDown(true);
    const release = () => setDown(false);

    window.addEventListener("mousemove", move);
    document.documentElement.addEventListener("mouseleave", leave);
    window.addEventListener("mousedown", press);
    window.addEventListener("mouseup", release);
    return () => {
      window.removeEventListener("mousemove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
      window.removeEventListener("mousedown", press);
      window.removeEventListener("mouseup", release);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const ringScale = down ? 0.8 : hover ? 1.6 : 1;

  return (
    <>
      {/* Soft white glow behind the superhero cursor image.
          Image is ~53x64px and starts at the hotspot (3, 8), so its centre
          sits ~24px right / ~24px below the pointer. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9998] rounded-full"
        style={{
          width: GLOW,
          height: GLOW,
          x,
          y,
          marginLeft: -GLOW / 2 + 24,
          marginTop: -GLOW / 2 + 24,
          background:
            "radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.18) 40%, rgba(255,255,255,0) 70%)",
          filter: "blur(4px)",
        }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* Big ring — trails behind */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full border-2 border-accent-500"
        style={{
          width: RING,
          height: RING,
          x: ringX,
          y: ringY,
          marginLeft: -RING / 2,
          marginTop: -RING / 2,
        }}
        animate={{
          scale: ringScale,
          opacity: visible ? 1 : 0,
          backgroundColor: hover ? "rgba(224,69,154,0.12)" : "rgba(224,69,154,0)",
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      />

      {/* Small dot — exactly on the pointer */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full bg-accent-500"
        style={{
          width: DOT,
          height: DOT,
          x,
          y,
          marginLeft: -DOT / 2,
          marginTop: -DOT / 2,
        }}
        animate={{ opacity: visible ? 1 : 0, scale: hover ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      />
    </>
  );
}
