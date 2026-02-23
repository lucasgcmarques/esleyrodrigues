import { useState } from "react";

const projects = [
  { name: "Ipanema", url: "https://vimeo.com/1049447083" },
  { name: "Rabanne - Manu Gavassi", url: "https://vimeo.com/1049449392" },
  { name: "Zasm", url: "https://vimeo.com/1050914691" },
  { name: "Lofficiel Chile", url: "https://vimeo.com/1056363481" },
  { name: "Egeo Cogu - O Boticário", url: "https://vimeo.com/1079961555" },
  { name: "NBA - O Boticário", url: "https://vimeo.com/1079963535" },
  { name: "Shark beauty", url: "https://vimeo.com/1084248690" },
  { name: "Noize - Marina Sena", url: "https://vimeo.com/1086193697" },
  { name: "Silvia Braz - Goly", url: "https://vimeo.com/1102044884" },
  { name: "Boticário Hadiya", url: "https://vimeo.com/1140094422" },
  {
    name: "Carta de Maria - Rubel & Marina Senna",
    url: "https://vimeo.com/1166383950",
  },
];

const links = [
  { name: "vimeo", url: "https://vimeo.com/esleyrodrigues" },
  { name: "instagram", url: "https://instagram.com/user123456789" },
];

const texts = {
  pt: {
    profession: "Diretor de Fotografia",
    description:
      "Criativo e desenvolvedor. Trabalho com design e código para contar histórias e construir experiências.",
    about: "sobre",
    projectsTitle: "projetos",
  },
  en: {
    profession: "Director of Photography",
    description:
      "Creative and developer. I work with design and code to tell stories and build experiences.",
    about: "about",
    projectsTitle: "projects",
  },
};

function App() {
  const [lang, setLang] = useState("pt");

  const t = texts[lang];

  return (
    <div className="layout">
      <header className="header">
        <a href="#">
          <h1>Esley Rodrigues</h1>
        </a>
        <div className="header-links">
          <a href="#">
            <span>{t.about}</span>
          </a>
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
        <p style={{ marginBottom: "0" }}>__{t.profession}</p>
        <p style={{ marginTop: "0" }}>{t.description}</p>
        <p style={{ marginBottom: "0" }}>__{t.projectsTitle}</p>
        <ul className="content-links">
          {projects.map((project) => (
            <li key={project.url}>
              <a href={project.url} target="_blank" rel="noopener noreferrer">
                {project.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <footer className="footer">
        {links.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{link.name}</span>
          </a>
        ))}
      </footer>
    </div>
  );
}

export default App;
