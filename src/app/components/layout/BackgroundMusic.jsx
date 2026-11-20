"use client";

import { useEffect, useRef } from "react";

/* Site-wide background music.
   - Lives in the root layout, so it keeps playing across page changes.
   - Loops forever, volume capped at 15% of the device volume.
   - Same trick as the contact-page video: start MUTED (browsers always allow
     muted autoplay), then try to unmute. If the browser blocks sound, it keeps
     playing silently and unmutes on the very first click / tap / key press. */
const SRC = "/bgmusic.mp3";
const MAX_VOLUME = 0.15;
const GESTURES = ["pointerdown", "mousedown", "touchstart", "touchend", "keydown", "click"];

export default function BackgroundMusic() {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = MAX_VOLUME;
    const clamp = () => {
      if (audio.volume > MAX_VOLUME) audio.volume = MAX_VOLUME;
    };
    audio.addEventListener("volumechange", clamp);

    const removeGestures = () =>
      GESTURES.forEach((g) => window.removeEventListener(g, unmuteOnGesture, true));

    // Other media (e.g. the mobile hero video) can hold the music while it
    // plays with sound: "bgmusic:pause" / "bgmusic:resume".
    let held = false;
    const hold = () => {
      held = true;
      audio.pause();
    };
    const release = () => {
      if (!held) return;
      held = false;
      audio.play().catch(() => {});
    };
    window.addEventListener("bgmusic:pause", hold);
    window.addEventListener("bgmusic:resume", release);

    // Unmute and make sure it is playing; resolves true if sound is on.
    const tryUnmute = () => {
      if (held) {
        audio.muted = false;
        return Promise.resolve(true);
      }
      audio.muted = false;
      return audio
        .play()
        .then(() => true)
        .catch(() => {
          // Sound blocked — fall back to silent playback until a gesture.
          audio.muted = true;
          audio.play().catch(() => {});
          return false;
        });
    };

    function unmuteOnGesture() {
      tryUnmute().then((ok) => ok && removeGestures());
    }

    // 1) start muted so autoplay is allowed
    audio.muted = true;
    if (!held) audio.play().catch(() => {});

    // 2) shortly after, try to turn the sound on
    const t = setTimeout(() => {
      tryUnmute().then((ok) => {
        if (!ok) GESTURES.forEach((g) => window.addEventListener(g, unmuteOnGesture, true));
      });
    }, 400);

    return () => {
      clearTimeout(t);
      removeGestures();
      window.removeEventListener("bgmusic:pause", hold);
      window.removeEventListener("bgmusic:resume", release);
      audio.removeEventListener("volumechange", clamp);
    };
  }, []);

  return <audio ref={audioRef} src={SRC} loop preload="auto" />;
}
