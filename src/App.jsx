import { useState, useRef, useMemo, useEffect } from "react";
import { SiteHeader } from "./components/SiteHeader";
import { MainContent } from "./components/MainContent";
import { ProjectsScroll } from "./components/ProjectsScroll";
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
      <SiteHeader
        siteTitle={siteTitle}
        links={links}
        lang={lang}
        onChangeLang={setLang}
        titleRef={titleRef}
      />
      <MainContent t={t} projects={projects} descriptionRef={descriptionRef} />
      <ProjectsScroll projects={projects} />
    </div>
  );
}

export default App;
