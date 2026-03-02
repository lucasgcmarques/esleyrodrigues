import { ScrambleText } from "./ScrambleText";

export function SiteHeader({ siteTitle, links, lang, onChangeLang, titleRef }) {
  return (
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
        onChange={(e) => onChangeLang(e.target.value)}
        aria-label="Idioma"
      >
        <option value="pt">PT</option>
        <option value="en">EN</option>
      </select>
    </header>
  );
}

