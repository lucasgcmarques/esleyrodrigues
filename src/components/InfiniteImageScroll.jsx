import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      if (el.contains(e.target)) return;
      e.preventDefault();
      el.scrollTop += e.deltaY;
    };

    document.addEventListener("wheel", handleWheel, { passive: false });
    return () =>
      document.removeEventListener("wheel", handleWheel, { passive: false });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    const content = contentRef.current;
    if (!el || !content || !projects.length) return;

    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
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
      scrollTriggerRef.current?.kill();
    };
  }, [projects.length]);

  // Altura 700–900px; largura proporcional com teto para não estourar os horizontais
  const MIN_H = 700;
  const MAX_H = 500;
  const REF_HEIGHT = 500;
  const MAX_W = 600; // limita largura dos mais horizontais

  function sizeFromAspectRatio(ar) {
    let width = Math.round(REF_HEIGHT * ar);
    let height = REF_HEIGHT;
    if (width > MAX_W) {
      width = MAX_W;
      height = Math.round(MAX_W / ar);
    }
    // Garante altura no intervalo quando não limitamos por largura
    if (height > MAX_H) {
      height = MAX_H;
      width = Math.round(MAX_H * ar);
    }
    return { width, height };
  }

  if (!projects.length) return null;

  return (
    <div
      className="infinite-scroll-wrap fixed top-0 bottom-0 right-50  z-0 overflow-x-hidden overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden "
      ref={scrollRef}
    >
      <div
        className="infinite-scroll-content flex w-full max-w-[90vw] mx-auto flex-col items-start  "
        ref={contentRef}
      >
        {duplicatedProjects.map((project, i) => {
          const projectIndex = i % projects.length;
          const isHovered = hoveredProjectIndex === projectIndex;
          const imageUrl = project.image;
          const w = project.width ?? 16;
          const h = project.height ?? 9;
          const aspectRatio = w / h;
          const { width: widthPx, height: heightPx } =
            sizeFromAspectRatio(aspectRatio);

          return (
            <div
              key={`${project.url}-${i}`}
              className={`group infinite-scroll-item relative cursor-pointer overflow-hidden shrink-0 ${isHovered ? "hovered" : ""}`}
              style={{
                height: `${heightPx}px`,
                width: `${widthPx}px`,
              }}
              onMouseEnter={() => onProjectHover?.(projectIndex)}
              onMouseLeave={() => onProjectHover?.(null)}
            >
              <img
                src={imageUrl}
                className="w-full h-full object-cover object-center block"
                alt=""
                loading="lazy"
              />
              <span className="infinite-scroll-play" aria-hidden="true" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
