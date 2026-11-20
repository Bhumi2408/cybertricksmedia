"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/* Events understood by components/layout/BackgroundMusic.jsx */
const pauseBgMusic = () => window.dispatchEvent(new Event("bgmusic:pause"));
const resumeBgMusic = () => window.dispatchEvent(new Event("bgmusic:resume"));

const GESTURES = ["pointerdown", "touchstart", "touchend", "keydown", "click"];

/* ================================================================
   MOBILE / TABLET HERO VIDEO
   - Plays only while the banner is on screen, pauses when scrolled away.
   - Tries to play WITH sound. Browsers block sound until the visitor has
     interacted with the page, so in that case it plays muted and turns the
     sound on at the first tap / click / key press.
   - Background music is paused while this video plays with sound.
================================================================ */
function MobileHeroVideo() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const inViewRef = useRef(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    // Skip on desktop — this section is hidden there (lg:hidden)
    if (window.matchMedia("(min-width: 1024px)").matches) return;

    const syncMuted = () => setMuted(video.muted);
    video.addEventListener("volumechange", syncMuted);

    const removeGestures = () =>
      GESTURES.forEach((g) => window.removeEventListener(g, onGesture, true));

    const playWithSound = () => {
      video.muted = false;
      return video
        .play()
        .then(() => {
          pauseBgMusic();
          return true;
        })
        .catch(() => {
          // Sound blocked — keep it running muted until a gesture
          video.muted = true;
          video.play().catch(() => {});
          return false;
        });
    };

    function onGesture() {
      if (!inViewRef.current) return;
      playWithSound().then((ok) => ok && removeGestures());
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          playWithSound().then((ok) => {
            if (!ok) GESTURES.forEach((g) => window.addEventListener(g, onGesture, true));
          });
        } else {
          video.pause();
          resumeBgMusic();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(section);

    return () => {
      io.disconnect();
      removeGestures();
      video.removeEventListener("volumechange", syncMuted);
      video.pause();
      resumeBgMusic();
    };
  }, []);

  /* Manual sound toggle */
  const toggleSound = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.muted) {
      video.muted = false;
      video.play().catch(() => {});
      pauseBgMusic();
    } else {
      video.muted = true;
      resumeBgMusic();
    }
  };

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-ink lg:hidden">
      <video
        ref={videoRef}
        src="/mobile-video.mp4"
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        className="block h-auto w-full"
      />

      <button
        type="button"
        onClick={toggleSound}
        aria-label={muted ? "Turn video sound on" : "Turn video sound off"}
        className="absolute bottom-5 right-5 z-10 flex items-center gap-2 rounded-full bg-ink/60 px-3.5 py-2.5 text-[12px] font-semibold text-white backdrop-blur-md"
      >
        {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        {muted && <span>Tap for sound</span>}
      </button>

      {/* Bottom line */}
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-aqua-400 via-plum-500 to-accent-500" />
    </section>
  );
}

export default function HeroBanner() {
  return (
    <>
      {/* =====================================================
          DESKTOP
          ONLY VIDEO
      ===================================================== */}

      <section className="relative hidden w-full overflow-hidden bg-transparent lg:block">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          className="block h-auto w-full"
        >
          <source src="/hero-banners.mp4" type="video/mp4" />
        </video>
      </section>

      {/* =====================================================
          MOBILE / TABLET
          mobile-video.mp4 — plays with sound while on screen
      ===================================================== */}

      <MobileHeroVideo />
    </>
  );
}
