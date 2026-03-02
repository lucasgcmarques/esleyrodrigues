import { useState, useRef, useMemo, useEffect } from "react";
import { ScrambleText } from "./components/ScrambleText";
import { InfiniteImageScroll } from "./components/InfiniteImageScroll";
import { VerticalCarousel } from "./components/VerticalCarousel";
import {
  useScrambleTimeline,
  runScrambleAnimation,
} from "./hooks/useScrambleTimeline";
import { useVimeoApi } from "./hooks/useVimeoApi";
import {
  siteTitle,
  email,
  projects as staticProjects,
  links,
  texts,
} from "./data";

function App() {
  const [lang, setLang] = useState("pt");
  const [hoveredProjectIndex, setHoveredProjectIndex] = useState(null);
  const t = texts[lang];

  const titleRef = useRef(null);
  const professionRef = useRef(null);
  const descriptionRef = useRef(null);
  const emailRef = useRef(null);
  const projectsTitleRef = useRef(null);
  const cursorRef = useRef(null);

  const timelineElements = useMemo(
    () => [
      { ref: titleRef, text: siteTitle, duration: 2 },
      { ref: professionRef, text: t.profession, duration: 2 },
      { ref: descriptionRef, text: t.description, duration: 2 },
      { ref: emailRef, text: email, duration: 2 },
      { ref: projectsTitleRef, text: t.projectsTitle, duration: 2 },
    ],
    [t.profession, t.description, t.projectsTitle],
  );

  useScrambleTimeline(timelineElements, cursorRef);
  const { projects: vimeoProjects } = useVimeoApi();
  const projects = vimeoProjects?.length > 0 ? vimeoProjects : staticProjects;

  // Quando trocar o idioma, ativa o scramble apenas nos textos que mudam
  const prevLangRef = useRef(lang);
  useEffect(() => {
    if (prevLangRef.current === lang) return; // evita rodar no primeiro mount
    prevLangRef.current = lang;

    const duration = 0.5;
    if (professionRef.current)
      runScrambleAnimation(professionRef.current, t.profession, duration);
    if (descriptionRef.current)
      runScrambleAnimation(descriptionRef.current, t.description, duration);
    if (projectsTitleRef.current)
      runScrambleAnimation(projectsTitleRef.current, t.projectsTitle, duration);
  }, [lang, t.profession, t.description, t.projectsTitle]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-2 flex flex-wrap items-center justify-between border-b border-border bg-white px-6 py-2 text-site font-medium uppercase md:min-h-11 md:h-auto md:flex-row">
        <div className=" min-w-fit flex-1 ">
          <a href="#" className="flex items-center justify-start">
            <ScrambleText ref={titleRef} text={siteTitle} as="h1" timeline />
          </a>
        </div>
        <div className="header-links flex flex-wrap items-center justify-end gap-6 px-6">
          {links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:font-semibold min-w-18"
            >
              <ScrambleText text={link.name} as="span" duration={0.6} />
            </a>
          ))}
        </div>
        <select
          className="lang-select order-3 shrink-0 appearance-none cursor-pointer rounded-none border border-border bg-white px-1 py-0.5 font-sans text-site uppercase tracking-wide outline-none focus:outline-none md:order-3 hover:font-semibold"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          aria-label="Idioma"
        >
          <option value="pt">PT</option>
          <option value="en">EN</option>
        </select>
      </header>

      <div className=" z-1 bg-bg-content text-site font-medium uppercase mx-6 mt-18 max-w-100">
        <p className="mb-8">
          <ScrambleText
            ref={descriptionRef}
            text={t.description}
            as="span"
            timeline
          />
        </p>

        <ul className="flex flex-col">
          {projects.map((project) => (
            <li key={project.url} className={`list-none `}>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-start mb-0.5 hover:font-semibold`}
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

      {/* <VerticalCarousel /> */}
      <InfiniteImageScroll
        projects={projects}
        hoveredProjectIndex={hoveredProjectIndex}
        onProjectHover={setHoveredProjectIndex}
      />
    </div>
  );
}

export default App;
