import { useState, useRef, useMemo, useEffect } from "react";
import { ScrambleText } from "./components/ScrambleText";
import { InfiniteImageScroll } from "./components/InfiniteImageScroll";
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
    <div className="layout">
      <header className="header">
        <a href="#">
          <ScrambleText ref={titleRef} text={siteTitle} as="h1" timeline />
        </a>
        <div className="header-links">
          <a href="#">
            <span>about</span>
          </a>
          {links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ScrambleText text={link.name} as="span" duration={0.6} />
            </a>
          ))}
          <select
            className="lang-select"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            aria-label="Idioma"
          >
            <option value="pt">PT</option>
            <option value="en">EN</option>
          </select>
        </div>
      </header>

      <div className="content">
        {/* <p style={{ marginBottom: "0" }}>
          __
          <ScrambleText
            ref={professionRef}
            text={t.profession}
            as="span"
            timeline
          />
        </p> */}
        <p className="content-description">
          <ScrambleText
            ref={descriptionRef}
            text={t.description}
            as="span"
            timeline
          />
        </p>
        {/* <p>
          {" "}
          <ScrambleText ref={emailRef} text={email} as="span" timeline />
          <span ref={cursorRef} className="scramble-cursor" aria-hidden>
            ⇠
          </span>{" "}
        </p> */}
        {/* <p style={{ marginBottom: "0" }}>
          __
          <ScrambleText
            ref={projectsTitleRef}
            text={t.projectsTitle}
            as="span"
            timeline
          />
        </p> */}
        <ul className="content-links">
          {projects.map((project, i) => (
            <li
              key={project.url}
              className={hoveredProjectIndex === i ? "hovered" : ""}
              onMouseEnter={() => setHoveredProjectIndex(i)}
              onMouseLeave={() => setHoveredProjectIndex(null)}
            >
              <a href={project.url} target="_blank" rel="noopener noreferrer">
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

      <InfiniteImageScroll
        projects={projects}
        hoveredProjectIndex={hoveredProjectIndex}
        onProjectHover={setHoveredProjectIndex}
      />

      <footer className="footer">
        {links.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ScrambleText text={link.name} as="span" duration={0.6} />
          </a>
        ))}
      </footer>
    </div>
  );
}

export default App;
