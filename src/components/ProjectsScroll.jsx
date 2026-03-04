import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ProjectsScroll({ projects = [] }) {
  useEffect(() => {
    if (!projects.length) return;

    const ctx = gsap.context(() => {
      const boxes = gsap.utils.toArray(".project-box");

      boxes.forEach((box) => {
        const img = box.querySelector("img");
        if (!img) return;

        const originalWidth = parseInt(box.dataset.width, 10);
        const originalHeight = parseInt(box.dataset.height, 10);
        if (Number.isNaN(originalWidth) || Number.isNaN(originalHeight)) return;
        const smallW = originalWidth * 1;
        const smallH = originalHeight * 1;
        const bigW = originalWidth * 1.8;
        const bigH = originalHeight * 1.8;

        // Todas começam pequenas para terem a mesma animação de scale
        gsap.set(box, {
          width: smallW,
          height: smallH,
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: box,
            start: "top 70%",
            end: "bottom 40%",
            scrub: 1,
            invalidateOnRefresh: true,
            markers: true,
          },
        });

        // Todas: entrar pequenas → crescer → voltar para pequeno
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

      ScrollTrigger.refresh();
    });

    return () => {
      ctx.revert();
    };
  }, [projects.length]);

  if (!projects.length) return null;

  const MAX_W = 500;
  const MAX_H = 300;
  const GAP = 20;

  // Altura mínima = conteúdo no tamanho original (evita glitch no fim sem espaço excessivo)
  const totalMinHeight =
    projects.reduce((acc, project) => {
      if (!project.image) return acc;
      const origW = project.width ?? 1920;
      const origH = project.height ?? 1080;
      let scale = 1;
      if (origW > MAX_W || origH > MAX_H) {
        scale = Math.min(MAX_W / origW, MAX_H / origH);
      }
      const h = Math.round(origH * scale);
      return acc + h + GAP;
    }, 0) + 80;

  return (
    <div
      className="mx-6 my-10 flex flex-col items-start gap-5 mb-20 mt-[300px] ml-10 md:ml-100 lg:ml-110"
      style={{ minHeight: totalMinHeight }}
    >
      {projects.map((project) => {
        if (!project.image) return null;
        const origW = project.width ?? 1920;
        const origH = project.height ?? 1080;

        let scale = 1;
        if (origW > MAX_W || origH > MAX_H) {
          scale = Math.min(MAX_W / origW, MAX_H / origH);
        }
        const w = Math.round(origW * scale);
        const h = Math.round(origH * scale);

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
              style={{ width: `${w}px`, height: `${h}px` }}
              data-width={w}
              data-height={h}
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
  );
}
