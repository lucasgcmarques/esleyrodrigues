import { useRef, useEffect, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Formato do CodePen GreenSock: grid 12 colunas, alturas em vh, posições variadas
const GRID_LAYOUTS = [
  { gridColumn: "1 / -1", height: "95vh" },
  { gridColumn: "2 / span 8", height: "60vh" },
  { gridColumn: "4 / span 8", height: "60vh" },
  { gridColumn: "1 / -1", height: "60vh" },
  { gridColumn: "4 / span 8", height: "80vh" },
  { gridColumn: "2 / span 8", height: "80vh" },
];

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

  // Mesmo layout para item i e i+n para o loop infinito bater
  const layoutConfigs = useMemo(
    () =>
      Array.from({ length: projects.length }, (_, i) =>
        GRID_LAYOUTS[i % GRID_LAYOUTS.length]
      ),
    [projects.length]
  );

  // Scroll da página inteira controla o carrossel de imagens
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      if (el.contains(e.target)) return; // já está sobre as imagens, deixa o scroll nativo
      e.preventDefault();
      el.scrollTop += e.deltaY;
    };

    document.addEventListener("wheel", handleWheel, { passive: false });
    return () => document.removeEventListener("wheel", handleWheel, { passive: false });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    const content = contentRef.current;
    if (!el || !content || !layoutConfigs.length) return;

    const imageTweens = [];

    // Parallax no estilo GreenSock: imagem move mais devagar que o scroll (speed ~0.6)
    const items = content.querySelectorAll(".infinite-scroll-item");
    items.forEach((item) => {
      const img = item.querySelector("img");
      if (!img) return;

      const tween = gsap.fromTo(
        img,
        { "--img-y": "0%" },
        {
          "--img-y": "-12%",
          ease: "none",
          scrollTrigger: {
            scroller: el,
            trigger: item,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );

      imageTweens.push(tween);
    });

    let innerRafId;
    const rafId = requestAnimationFrame(() => {
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
      imageTweens.forEach((tween) => tween.kill());
      scrollTriggerRef.current?.kill();
    };
  }, [projects.length, layoutConfigs.length]);

  if (!projects.length) return null;

  return (
    <div className="infinite-scroll-wrap" ref={scrollRef}>
      <div className="infinite-scroll-content" ref={contentRef}>
        {duplicatedProjects.map((project, i) => {
          const projectIndex = i % projects.length;
          const layout = layoutConfigs[projectIndex];
          const isHovered = hoveredProjectIndex === projectIndex;
          const imageUrl =
            project.image ||
            `https://picsum.photos/1200/800?random=${projectIndex + 1}`;
          return (
            <div
              key={`${project.url}-${i}`}
              className={`infinite-scroll-item ${isHovered ? "hovered" : ""}`}
              style={{
                gridColumn: layout.gridColumn,
                height: layout.height,
              }}
              onMouseEnter={() => onProjectHover?.(projectIndex)}
              onMouseLeave={() => onProjectHover?.(null)}
            >
              <img src={imageUrl} alt="" loading="lazy" />
              <span className="infinite-scroll-play" aria-hidden="true" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
