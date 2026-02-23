import { useLayoutEffect } from "react";
import gsap from "gsap";

const CHARS = "0123456789";

function runScrambleOnUpdate(el, text, progress) {
  if (!el || !text) return;
  const len = text.length;
  const visibleCount = Math.floor(progress * len);
  if (visibleCount === 0) el.textContent = "";
  else if (visibleCount >= len) el.textContent = text;
  else {
    const revealed = text.slice(0, visibleCount - 1);
    const randomChar = CHARS[Math.floor(Math.random() * CHARS.length)];
    el.textContent = revealed + randomChar;
  }
}

export function useScrambleTimeline(elements, cursorRef) {
  useLayoutEffect(() => {
    const cursorEl = cursorRef?.current;
    const cursorTl = gsap.timeline({ repeat: -1 });
    if (cursorEl) {
      cursorTl
        .to(cursorEl, { opacity: 0, duration: 0.5, ease: "none", delay: 0.2 })
        .to(cursorEl, { opacity: 1, duration: 0.5, ease: "none", delay: 0.2 });
    }

    const tl = gsap.timeline({
      id: "text-scramble",
      defaults: { ease: "none" },
    });

    const stagger = 0.06; // pequena diferença em segundos entre cada um

    elements.forEach(({ ref: elRef, text, duration = 2 }, i) => {
      const el = elRef?.current;
      if (!el || text == null) return;
      el.textContent = "";
      const obj = { progress: 0 };
      const position = i * stagger; // todos começam quase juntos, com leve atraso
      tl.to(
        obj,
        {
          progress: 1,
          duration,
          ease: "none",
          onUpdate: () => runScrambleOnUpdate(el, text, obj.progress),
          onComplete: () => { el.textContent = text; },
        },
        position
      );
    });

    if (cursorEl) tl.add(cursorTl, 0);
  }, []); // roda uma vez no mount
}
