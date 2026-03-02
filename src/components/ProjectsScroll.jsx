export function ProjectsScroll({ projects = [] }) {
  if (!projects.length) return null;

  return (
    <div className="mx-6 my-10 flex flex-col items-end">
      {projects.map((project) => {
        if (!project.image) return null;
        const origW = project.width ?? 1920;
        const origH = project.height ?? 1080;

        const MAX_W = 1200;
        const MAX_H = 800;

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
              className="relative overflow-hidden bg-black"
              style={{ width: `${w}px`, height: `${h}px` }}
            >
              <img
                src={project.image}
                alt={project.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>
          </a>
        );
      })}
    </div>
  );
}
