import { ScrambleText } from "./ScrambleText";

export function SiteHeader({ siteTitle, links, lang, onChangeLang, titleRef }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-2 flex flex-wrap items-center justify-between border-b border-b-gray-200 bg-white px-6 py-2 text-site font-medium  md:min-h-11 md:h-auto md:flex-row">
      <div className=" min-w-fit ">
        <a
          href="#"
          className="flex items-center justify-start font-medium text-lg"
        >
          <ScrambleText ref={titleRef} text={siteTitle} as="h1" timeline />
        </a>
      </div>
      <div className="w-2/3 flex">
        <div className="w-full flex flex-wrap items-center justify-evenly gap-6 px-6">
          {links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium min-w-18 text-lg"
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
      </div>
    </header>
  );
}
