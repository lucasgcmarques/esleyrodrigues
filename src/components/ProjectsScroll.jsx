import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function getVimeoId(url) {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(?:.*\/)?(\d{7,})/);
  return match ? match[1] : null;
}

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

function HoverDistortText({ text }) {
  const containerRef = useRef(null);
  const charRefs = useRef([]);
  const metricsRef = useRef(null);
  const rafRef = useRef(0);
  const isActiveRef = useRef(false);

  const SCALE_X_MIN = 0.92;
  const SCALE_X_MAX = 1.08;
  const SKEW_MAX_DEG = 10;

  const measure = () => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const centers = charRefs.current.map((el) => {
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      return r.left - containerRect.left + r.width / 2;
    });

    metricsRef.current = {
      left: containerRect.left,
      width: containerRect.width,
      centers,
    };
  };

  const reset = () => {
    charRefs.current.forEach((el) => {
      if (!el) return;
      el.style.transform = "";
    });
  };

  const update = (xLocal) => {
    const metrics = metricsRef.current;
    if (!metrics) return;

    const maxDist = Math.max(1, metrics.width);
    const { centers } = metrics;

    for (let i = 0; i < centers.length; i++) {
      const el = charRefs.current[i];
      if (!el) continue;

      const d = Math.abs(xLocal - centers[i]);
      const closeness = clamp01(1 - d / maxDist);

      const scaleX = SCALE_X_MIN + closeness * (SCALE_X_MAX - SCALE_X_MIN);
      const skewX = -SKEW_MAX_DEG * closeness;

      el.style.transform = `scaleX(${scaleX.toFixed(3)}) skewX(${skewX.toFixed(
        2,
      )}deg)`;
    }
  };

  const scheduleUpdate = (xLocal) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => update(xLocal));
  };

  const handlePointerEnter = () => {
    isActiveRef.current = true;
    measure();
  };

  const handlePointerMove = (e) => {
    if (!isActiveRef.current || !metricsRef.current) return;
    const xLocal = e.clientX - metricsRef.current.left;
    scheduleUpdate(xLocal);
  };

  const handlePointerLeave = () => {
    isActiveRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    reset();
  };

  useEffect(() => {
    const onReflow = () => {
      if (!isActiveRef.current) return;
      requestAnimationFrame(() => measure());
    };

    window.addEventListener("resize", onReflow, { passive: true });
    window.addEventListener("scroll", onReflow, { passive: true });
    return () => {
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <span
      ref={containerRef}
      className="project-distort-text"
      role="text"
      aria-label={text}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onFocus={handlePointerEnter}
      onBlur={handlePointerLeave}
    >
      {Array.from(text).map((ch, i) => (
        <span
          key={`${ch}-${i}`}
          ref={(el) => {
            charRefs.current[i] = el;
          }}
          aria-hidden="true"
          className="project-distort-char"
        >
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );
}

export function ProjectsScroll({ projects = [] }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const overlayImageRef = useRef(null);
  const overlayVideoRef = useRef(null);
  const [enableListHoverDistort, setEnableListHoverDistort] = useState(false);

  const handleCardClick = (e, project) => {
    const card = e.currentTarget;
    const imgEl = card.querySelector(".project-box img");
    if (!imgEl) return;
    const rect = imgEl.getBoundingClientRect();
    setSelectedProject({ project, rect });
  };

  useEffect(() => {
    if (!selectedProject) return;
    const img = overlayImageRef.current;
    const vid = overlayVideoRef.current;
    if (!img || !selectedProject.rect) return;
    const { rect, project } = selectedProject;
    const pw = project.width ?? 1920;
    const ph = project.height ?? 1080;
    const isPortrait = ph > pw;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const endWidth = vw;
    const endHeight = isPortrait ? vw * (ph / pw) : vh;
    const endTop = isPortrait ? (vh - endHeight) / 2 : 0;

    gsap.set(img, {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      opacity: 1,
    });
    gsap.set(vid, { opacity: 0 });
    const tl = gsap.timeline();
    tl.to(img, {
      left: 0,
      top: endTop,
      width: endWidth,
      height: endHeight,
      duration: 0.5,
      ease: "power2.inOut",
      opacity: 0.3,
      filter: "blur(50px)",
    }).to(vid, { opacity: 1, duration: 0.25 }, "-=0.15");
    return () => tl.kill();
  }, [selectedProject]);

  useEffect(() => {
    if (!projects.length) return;

    const ctx = gsap.context(() => {
      const boxes = gsap.utils.toArray(".project-box");
      const listItems = gsap.utils.toArray(".project-list-item");

      // Animação de scale/scrub só em telas grandes (lg: 1024px+)
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        boxes.forEach((box, i) => {
          const img = box.querySelector("img");
          if (!img) return;

          const smallW = parseInt(box.dataset.width, 10);
          const smallH = parseInt(box.dataset.height, 10);
          const scaleFactor = parseFloat(box.dataset.scale, 10) || 1.8;
          if (Number.isNaN(smallW) || Number.isNaN(smallH)) return;
          const bigW = smallW * scaleFactor;
          const bigH = smallH * scaleFactor;

          gsap.set(box, {
            width: smallW,
            height: smallH,
          });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: box,
              start: "top 85%",
              end: "bottom 25%",
              scrub: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                if (self.progress > 0.2 && self.progress < 0.8) {
                  gsap.set(listItems, { opacity: 0.4 });
                  gsap.set(listItems[i], { opacity: 1 });
                }
              },
            },
          });

          tl.to(box, {
            width: bigW,
            height: bigH,
            duration: 0.5,
            ease: "none",
          }).to(box, {
            width: smallW,
            height: smallH,
            duration: 0.5,
            ease: "none",
          });
        });

        const projectsList = gsap.utils.toArray(".projects-list");
        projectsList.forEach((list) => {
          gsap.fromTo(
            list,
            { opacity: 0, y: 100 },
            { opacity: 1, y: 0, duration: 0.5, ease: "none" },
          );
        });
        ScrollTrigger.refresh();
      });
    });

    return () => {
      ctx.revert();
    };
  }, [projects.length]);

  useEffect(() => {
    const hoverMql = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduceMql = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      setEnableListHoverDistort(hoverMql.matches && !reduceMql.matches);
    };

    update();
    hoverMql.addEventListener("change", update);
    reduceMql.addEventListener("change", update);
    return () => {
      hoverMql.removeEventListener("change", update);
      reduceMql.removeEventListener("change", update);
    };
  }, []);

  if (!projects.length) return null;

  const GAP = 20;
  /** Largura fixa no tamanho pequeno; altura proporcional para manter proporção original (sem bordas pretas) */
  const SMALL_WIDTH = 320;

  function getSmallDimensions(origW, origH) {
    const smallH = Math.round((SMALL_WIDTH / origW) * origH);
    const isLandscape = origW >= origH;
    const scaleFactor = isLandscape ? 2.8 : 1.45;
    return { smallW: SMALL_WIDTH, smallH, scaleFactor };
  }

  // Altura mínima = soma das alturas no tamanho pequeno
  const totalMinHeight =
    projects.reduce((acc, project) => {
      if (!project.image) return acc;
      const origW = project.width ?? 1920;
      const origH = project.height ?? 1080;
      const { smallH } = getSmallDimensions(origW, origH);
      return acc + smallH + GAP;
    }, 0) + 80;

  return (
    <div
      className="flex flex-col lg:flex-row mx-4 sm:mx-6 justify-center lg:justify-start"
      style={{ minHeight: totalMinHeight }}
    >
      {/* Lista lateral: só em desktop */}
      <div
        className="projects-list hidden lg:block sticky self-end mb-25 min-w-80"
        style={{ bottom: 20 }}
      >
        <ul className="flex flex-col items-start">
          {projects.map((project) => (
            <li key={project.url} className="project-list-item">
              <a href={project.url} target="_blank" rel="noopener noreferrer">
                {enableListHoverDistort ? (
                  <HoverDistortText text={project.name} />
                ) : (
                  project.name
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Coluna de projetos: centralizada em mobile/tablet */}
      <div className="mt-30 lg:mt-[450px] flex flex-col items-center lg:items-start gap-5 mb-20 w-full max-w-lg lg:max-w-none lg:ml-10 xl:ml-50 mx-auto lg:mx-0">
        {projects.map((project) => {
          if (!project.image) return null;
          const origW = project.width ?? 1920;
          const origH = project.height ?? 1080;
          const { smallW, smallH, scaleFactor } = getSmallDimensions(
            origW,
            origH,
          );

          return (
            <div
              key={project.url}
              className="w-full flex flex-col items-center lg:items-start"
            >
              {/* Nome acima do projeto: só em mobile/tablet */}
              <span className="lg:hidden  font-medium mb-1  w-full">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:font-semibold transition-[font-weight]"
                >
                  {project.name}
                </a>
              </span>
              <button
                type="button"
                onClick={(e) => handleCardClick(e, project)}
                className="group block text-left  cursor-pointer border-0 p-0 bg-transparent"
              >
                <div
                  className="project-box relative overflow-hidden mx-auto lg:mx-0"
                  style={{ width: `${smallW}px`, height: `${smallH}px` }}
                  data-width={smallW}
                  data-height={smallH}
                  data-scale={scaleFactor}
                >
                  <img
                    src={project.image}
                    alt={project.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {selectedProject && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center overflow-visible"
          role="dialog"
          aria-modal="true"
          aria-label={`Vídeo: ${selectedProject.project.name}`}
          onClick={() => setSelectedProject(null)}
        >
          <div className="fixed inset-0 bg-black" aria-hidden="true" />
          <img
            ref={overlayImageRef}
            src={selectedProject.project.image}
            alt=""
            className="fixed object-cover pointer-events-none"
            style={{
              left: selectedProject.rect.left,
              top: selectedProject.rect.top,
              width: selectedProject.rect.width,
              height: selectedProject.rect.height,
            }}
            aria-hidden="true"
          />
          <div
            ref={overlayVideoRef}
            className="relative z-10 w-full max-w-6xl aspect-video mx-4 rounded overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {getVimeoId(selectedProject.project.url) ? (
              <iframe
                src={`https://player.vimeo.com/video/${getVimeoId(selectedProject.project.url)}?autoplay=1`}
                title={selectedProject.project.name}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <a
                href={selectedProject.project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full h-full bg-black/80 text-white text-lg"
              >
                Abrir: {selectedProject.project.url}
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSelectedProject(null)}
            className="absolute top-4 right-4 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors text-2xl leading-none backdrop-blur-sm"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
