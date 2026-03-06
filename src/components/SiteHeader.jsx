import { useState } from "react";
import { ScrambleText } from "./ScrambleText";

export function SiteHeader({ siteTitle, links, lang, onChangeLang, titleRef }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-100 flex flex-wrap items-center justify-between border-b border-b-gray-200 bg-white px-4 py-2 text-site font-medium md:min-h-11 md:h-auto md:flex-row md:px-6">
      <div className="min-w-fit w-[520px]  flex justify-center md:justify-start md:flex-initial">
        <a href="#" className="flex items-center font-medium text-lg">
          <ScrambleText ref={titleRef} text={siteTitle} as="h1" timeline />
        </a>
      </div>

      {/* Desktop nav: visível só em lg+ — alinhado com a coluna de imagens (mx-4 + min-w-80 + ml-10/ml-50) */}
      <div className="hidden lg:flex lg:w-full lg:flex-1">
        <div className="flex w-full flex-wrap items-center justify-between gap-6">
          {links.map((link) => {
            const isAnchor = link.url.startsWith("#");
            return (
              <a
                key={link.url}
                href={link.url}
                {...(isAnchor ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                className="font-medium  text-lg bg-amber-200 min-w-18"
              >
                <ScrambleText text={link.name} as="span" duration={0.6} />
              </a>
            );
          })}
          <select
            className="lang-select shrink-0 appearance-none cursor-pointer rounded-none border border-border bg-white px-1 py-0.5 font-sans text-site uppercase tracking-wide outline-none focus:outline-none hover:font-semibold"
            value={lang}
            onChange={(e) => onChangeLang(e.target.value)}
            aria-label="Idioma"
          >
            <option value="pt">PT</option>
            <option value="en">EN</option>
          </select>{" "}
        </div>
      </div>

      {/* Hamburger: visível só em mobile/tablet */}
      <div className="flex items-center gap-2 md:flex-initial lg:hidden">
        <select
          className="lang-select shrink-0 appearance-none cursor-pointer rounded-none border border-border bg-white px-1 py-0.5 font-sans text-site uppercase tracking-wide outline-none focus:outline-none"
          value={lang}
          onChange={(e) => onChangeLang(e.target.value)}
          aria-label="Idioma"
        >
          <option value="pt">PT</option>
          <option value="en">EN</option>
        </select>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="p-2 -mr-2 rounded hover:bg-gray-100 aria-expanded:bg-gray-100"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        >
          <span className="sr-only">
            {menuOpen ? "Fechar menu" : "Abrir menu"}
          </span>
          <svg
            className="w-6 h-6 text-current"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Overlay do menu mobile/tablet */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-99 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <nav
            className="fixed top-[52px] left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-100 py-4 px-6 lg:hidden"
            aria-label="Navegação principal"
          >
            <ul className="flex flex-col items-center justify-center gap-6">
              {links.map((link) => {
                const isAnchor = link.url.startsWith("#");
                return (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      {...(isAnchor ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                      className="font-medium text-lg"
                      onClick={() => setMenuOpen(false)}
                    >
                      <ScrambleText text={link.name} as="span" duration={0.6} />
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </>
      )}
    </header>
  );
}
