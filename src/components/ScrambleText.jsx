import { useLayoutEffect, useRef, forwardRef } from "react";
import gsap from "gsap";

const CHARS_NUMBERS = "0123456789#$!";

function runScrambleUpdate(el, text, progress) {
  if (!el || !text) return;
  const len = text.length;
  const visibleCount = Math.floor(progress * len);
  if (visibleCount === 0) el.textContent = "";
  else if (visibleCount >= len) el.textContent = text;
  else {
    const revealed = text.slice(0, visibleCount - 1);
    const randomChar =
      CHARS_NUMBERS[Math.floor(Math.random() * CHARS_NUMBERS.length)];
    el.textContent = revealed + randomChar;
  }
}

function ScrambleTextInner(
  {
    text,
    // eslint-disable-next-line no-unused-vars -- Component usado no JSX como <Component />
    as: Component = "span",
    duration = 0.6,
    delay = 0,
    timeline: useTimeline = false,
    ...props
  },
  ref,
) {
  const internalRef = useRef(null);
  const elRef = ref ?? internalRef;

  useLayoutEffect(() => {
    if (useTimeline || !elRef.current || !text) return;
    const el = elRef.current;
    el.textContent = "";

    const obj = { progress: 0 };
    gsap.to(obj, {
      progress: 1,
      duration,
      delay,
      ease: "none",
      onUpdate: () => runScrambleUpdate(el, text, obj.progress),
      onComplete: () => {
        el.textContent = text;
      },
    });
  }, [text, duration, delay, useTimeline, elRef]);

  return <Component ref={elRef} {...props} />;
}

export const ScrambleText = forwardRef(ScrambleTextInner);
