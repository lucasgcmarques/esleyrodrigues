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

import { gsap } from "gsap";

import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(useGSAP, ScrollTrigger);

function App() {
  const [lang, setLang] = useState("pt");
  const t = texts[lang];
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showSplash, setShowSplash] = useState(true);

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

  const container = useRef(null);
  const boxRef = useRef(null);

  useGSAP(
    () => {
      gsap.fromTo(
        boxRef.current,
        { x: 200, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          rotation: 0,
          duration: 3.2,
          ease: "power3.out",
        },
      );
    },
    { scope: container },
  );

  // Roda o texto animado apenas quando o conteúdo principal já está visível
  useScrambleTimeline(showSplash ? [] : timelineElements, cursorRef);
  const { projects: vimeoProjects, loading: vimeoLoading } = useVimeoApi();
  const projects = vimeoProjects?.length > 0 ? vimeoProjects : staticProjects;

  // Splash de loading com contador até 100
  useEffect(() => {
    if (!showSplash) return;

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 99) return prev;
        return prev + 1;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [showSplash]);

  useEffect(() => {
    if (vimeoLoading) return;

    // Quando terminar de carregar os projetos, finaliza o contador e esconde o splash
    const timeout = setTimeout(() => {
      setLoadingProgress(100);
      setShowSplash(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [vimeoLoading]);

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

  if (showSplash) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <span className="text-6xl font-mono">{loadingProgress}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader
        siteTitle={siteTitle}
        links={links}
        lang={lang}
        onChangeLang={setLang}
        titleRef={titleRef}
      />
      {/* <div ref={container} className="fixed top-0 bottom-0 left-0 right-0 z-1">
        <div ref={boxRef} className="box">
          <MainContent
            t={t}
            projects={projects}
            descriptionRef={descriptionRef}
          />
        </div>
      </div> */}

      <ProjectsScroll projects={projects} />
      <div className="h-dvh border-t border-black"></div>
    </div>
  );
}

export default App;
