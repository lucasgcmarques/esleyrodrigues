import { useEffect, useRef } from "react";

function dist(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function SiteFooter({ email }) {
  const titleRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;

    const lines = ["Let's work", "together"];
    title.textContent = "";
    title.classList.add("flex", "stroke");

    let maxDist = 0;
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const chars = [];
    lines.forEach((str) => {
      const lineEl = document.createElement("div");
      lineEl.className = "footer-compressa-line";
      title.appendChild(lineEl);

      for (let i = 0; i < str.length; i++) {
        const span = document.createElement("span");
        span.setAttribute("data-char", str[i]);
        span.textContent = str[i];
        lineEl.appendChild(span);

        chars.push({
          span,
          getDist() {
            const pos = span.getBoundingClientRect();
            return dist(mouse, { x: pos.x + pos.width / 1.75, y: pos.y });
          },
          getAttr(distVal, min, max) {
            const wght = max - Math.abs((max * distVal) / maxDist);
            return Math.max(min, wght + min);
          },
          update(opts) {
            const d = this.getDist();
            const wdth = opts.wdth ? ~~this.getAttr(d, 5, 200) : 100;
            const wght = opts.wght ? ~~this.getAttr(d, 100, 800) : 400;
            const alpha = opts.alpha ? this.getAttr(d, 0, 1).toFixed(2) : 1;
            const ital = opts.ital ? this.getAttr(d, 0, 1).toFixed(2) : 0;
            this.span.style.cssText = `opacity: ${alpha}; font-variation-settings: 'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${ital};`;
          },
        });
      }
    });

    const setSize = () => {
      const container = title.parentElement;
      const rect = container ? container.getBoundingClientRect() : null;
      const height = rect ? rect.height : window.innerHeight * (2 / 3);
      const lineCount = lines.length;
      const lineHeight = 0.8;
      const fontSize = (height * 0.92) / (lineCount * lineHeight);
      title.style.fontSize = `${fontSize}px`;
    };

    const render = () => {
      maxDist = title.getBoundingClientRect().width / 2;
      chars.forEach((c) =>
        c.update({ wght: true, wdth: true, ital: true, alpha: false }),
      );
    };

    const animate = () => {
      mouse.x += (cursor.x - mouse.x) / 20;
      mouse.y += (cursor.y - mouse.y) / 20;
      render();
      animRef.current = requestAnimationFrame(animate);
    };

    const onMouseMove = (e) => {
      cursor.x = e.clientX;
      cursor.y = e.clientY;
    };

    const onTouchMove = (e) => {
      const t = e.touches[0];
      cursor.x = t.clientX;
      cursor.y = t.clientY;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("resize", setSize);
    setSize();
    animate();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", setSize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <footer id="contact" className="h-dvh border-t border-gray-300">
      <div className="h-2/3 flex items-center justify-center footer-title mx-6">
        <h1
          ref={titleRef}
          id="footer-compressa-title"
          className="footer-compressa-title"
        />
      </div>
      {/* Divisor: centralizado em mobile/tablet */}
      <div className="h-1/3 flex flex-col lg:flex-row lg:mx-6 lg:pl-[520px] items-center justify-center lg:items-start lg:justify-between gap-6 lg:gap-0 footer-title border-t border-gray-300 py-6 lg:py-0">
        <div className="w-content lg:min-h-1/2 flex flex-col items-center lg:items-start my-auto text-center lg:text-left bg-amber-50">
          <h2 className="text-3xl font-bold mb-2 lg:mb-auto">Get in touch</h2>
          <a href={`mailto:${email}`}>{email}</a>
          <p>São Paulo, Brazil</p>
        </div>
        <div className="lg:min-h-1/2 lg:min-w-1/2 my-auto flex items-center lg:items-end justify-center lg:justify-start">
          <ul className="flex flex-row sm:flex-col items-center  lg:items-start gap-4 lg:gap-0">
            <li>
              <a href="https://www.instagram.com/esleyrodrigues/">Instagram</a>
            </li>
            <li>
              <a href="https://vimeo.com/esleyrodrigues">Vimeo</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
