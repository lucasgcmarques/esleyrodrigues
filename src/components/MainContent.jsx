import { ScrambleText } from "./ScrambleText";

export function MainContent({ projects }) {
  return (
    <div className=" bg-amber-100 text-site font-medium uppercase mx-6 mt-18 max-w-100 h-full">
      {/* <p className="mb-8">
        <ScrambleText
          ref={descriptionRef}
          text={t.description}
          as="span"
          timeline
        />
      </p> */}

      <ul className="flex flex-col">
        {projects.map((project) => (
          <li key={project.url} className="list-none">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-start mb-0.5 hover:font-semibold"
            >
              <ScrambleText
                text={project.name}
                as="span"
                duration={0.8}
                delay={1}
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
