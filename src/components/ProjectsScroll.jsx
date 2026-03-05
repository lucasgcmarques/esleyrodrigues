import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ProjectsScroll({ projects = [] }) {
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
          // .to(listItems[i], { opacity: 0.5, duration: 0 }, 0.5)
          .to(box, {
            width: smallW,
            height: smallH,
            duration: 0.5,
            ease: "none",
          });
        // .to(listItems[i], { opacity: 1, duration: 0 }, 1);
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
            <a
              key={project.url}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
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
            </a>
          );
        })}
      </div>
    </div>
  );
}
