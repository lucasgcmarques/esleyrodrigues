import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function getVimeoId(url) {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(?:.*\/)?(\d{7,})/);
  return match ? match[1] : null;
}

export function ProjectsScroll({ projects = [] }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const overlayImageRef = useRef(null);
  const overlayVideoRef = useRef(null);

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

      boxes.forEach((box, i) => {
        const img = box.querySelector("img");
        if (!img) return;

        const smallW = parseInt(box.dataset.width, 10);
        const smallH = parseInt(box.dataset.height, 10);
        const scaleFactor = parseFloat(box.dataset.scale, 10) || 1.8;
        if (Number.isNaN(smallW) || Number.isNaN(smallH)) return;
        const bigW = smallW * scaleFactor;
        const bigH = smallH * scaleFactor;

        // Todas começam pequenas para terem a mesma animação de scale
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
            markers: true,
            onUpdate: (self) => {
              if (self.progress > 0.2 && self.progress < 0.8) {
                gsap.set(listItems, { opacity: 0.4 });
                gsap.set(listItems[i], { opacity: 1 });
              }
            },
          },
        });

        // Todas: entrar pequenas → crescer → voltar para pequeno
        tl.to(box, {
          width: bigW,
          height: bigH,
          duration: 0.5,
          ease: "none",
        })

          .to(box, {
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
          {
            opacity: 0,
            y: 100,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "none",
          },
        );
      });
      ScrollTrigger.refresh();
    });

    return () => {
      ctx.revert();
    };
  }, [projects.length]);

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
    <div className="flex mx-6 " style={{ minHeight: totalMinHeight }}>
      <div className="projects-list sticky top-[500px] self-start mb-25  min-w-80">
        <ul className="flex flex-col items-start">
          {projects.map((project) => (
            <li key={project.url} className="project-list-item">
              <a href={project.url} target="_blank" rel="noopener noreferrer">
                {project.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className=" mt-[500px] flex flex-col items-start gap-5 mb-20 ml-10 md:ml-50  bg-blue-50">
        {projects.map((project) => {
          if (!project.image) return null;
          const origW = project.width ?? 1920;
          const origH = project.height ?? 1080;
          const { smallW, smallH, scaleFactor } = getSmallDimensions(
            origW,
            origH,
          );

          return (
            <button
              key={project.url}
              type="button"
              onClick={(e) => handleCardClick(e, project)}
              className="group block text-left w-full cursor-pointer border-0 p-0 bg-transparent"
            >
              <div
                className="project-box relative overflow-hidden "
                style={{ width: `${smallW}px`, height: `${smallH}px` }}
                data-width={smallW}
                data-height={smallH}
                data-scale={scaleFactor}
              >
                <img
                  src={project.image}
                  alt={project.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02] "
                />
              </div>
            </button>
          );
        })}
      </div>

      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-visible"
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
