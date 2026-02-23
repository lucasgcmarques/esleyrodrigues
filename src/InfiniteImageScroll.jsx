import { useRef, useEffect, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const alignments = ["flex-start", "flex-end", "center"];

function getStylesForProjects(n) {
  return Array.from({ length: n }, () => ({
    widthPct: 55 + Math.random() * 42,
    align: alignments[Math.floor(Math.random() * alignments.length)],
  }));
}

export function InfiniteImageScroll({
  projects = [],
  hoveredProjectIndex,
  onProjectHover,
}) {
  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  const isAdjustingRef = useRef(false);
  const scrollTriggerRef = useRef(null);

  const duplicatedProjects = [...projects, ...projects];

  const itemStyles = useMemo(
    () => getStylesForProjects(projects.length),
    [projects.length],
  );

  useEffect(() => {
    const el = scrollRef.current;
    const content = contentRef.current;
    if (!el || !content || !itemStyles.length) return;

    const applyWidths = () => {
      const items = content.querySelectorAll(".infinite-scroll-item");
      items.forEach((item, i) => {
        const s = itemStyles[i % itemStyles.length];
        gsap.set(item, {
          width: `${s.widthPct}%`,
          alignSelf: s.align,
        });
      });
    };

    applyWidths();

    let innerRafId;
    const rafId = requestAnimationFrame(() => {
      applyWidths();
      innerRafId = requestAnimationFrame(() => {
        const singleSetHeight = content.offsetHeight / 2;

        scrollTriggerRef.current = ScrollTrigger.create({
          scroller: el,
          trigger: content,
          start: "top top",
          end: "bottom bottom",
          onUpdate: () => {
            if (isAdjustingRef.current) return;

            const scrollTop = el.scrollTop;

            if (scrollTop > singleSetHeight) {
              isAdjustingRef.current = true;
              gsap.set(el, { scrollTop: scrollTop - singleSetHeight });
              requestAnimationFrame(() => {
                isAdjustingRef.current = false;
              });
            } else if (scrollTop <= 0) {
              isAdjustingRef.current = true;
              gsap.set(el, { scrollTop: singleSetHeight });
              requestAnimationFrame(() => {
                isAdjustingRef.current = false;
              });
            }
          },
        });
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (innerRafId != null) cancelAnimationFrame(innerRafId);
      scrollTriggerRef.current?.kill();
    };
  }, [projects.length, itemStyles]);

  if (!projects.length) return null;

  return (
    <div className="infinite-scroll-wrap" ref={scrollRef}>
      <div className="infinite-scroll-content" ref={contentRef}>
        {duplicatedProjects.map((project, i) => {
          const projectIndex = i % projects.length;
          const isHovered = hoveredProjectIndex === projectIndex;
          const imageUrl = project.image || `https://picsum.photos/400/300?random=${projectIndex + 1}`;
          return (
            <div
              key={`${project.url}-${i}`}
              className={`infinite-scroll-item ${isHovered ? "hovered" : ""}`}
              onMouseEnter={() => onProjectHover?.(projectIndex)}
              onMouseLeave={() => onProjectHover?.(null)}
            >
              <img src={imageUrl} alt="" loading="lazy" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
