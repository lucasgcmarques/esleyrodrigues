import { useRef, useEffect } from "react";

const DEFAULT_IMAGES = [
  "https://picsum.photos/400/300?random=1",
  "https://picsum.photos/400/300?random=2",
  "https://picsum.photos/400/300?random=3",
  "https://picsum.photos/400/300?random=4",
  "https://picsum.photos/400/300?random=5",
  "https://picsum.photos/400/300?random=6",
];

export function InfiniteImageScroll({ images = DEFAULT_IMAGES }) {
  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  const isAdjustingRef = useRef(false);

  // Duplicamos a lista para criar o efeito de loop contínuo
  const duplicatedImages = [...images, ...images];

  useEffect(() => {
    const el = scrollRef.current;
    const content = contentRef.current;
    if (!el || !content) return;

    const singleSetHeight = content.offsetHeight / 2;

    const handleScroll = () => {
      if (isAdjustingRef.current) return;

      const { scrollTop } = el;

      // Passou do fim da primeira metade → volta para manter loop contínuo
      if (scrollTop > singleSetHeight) {
        isAdjustingRef.current = true;
        el.scrollTop = scrollTop - singleSetHeight;
        requestAnimationFrame(() => {
          isAdjustingRef.current = false;
        });
      }

      // No topo (scroll para cima) → vai para o fim da primeira metade para poder continuar
      if (scrollTop <= 0) {
        isAdjustingRef.current = true;
        el.scrollTop = singleSetHeight;
        requestAnimationFrame(() => {
          isAdjustingRef.current = false;
        });
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [images.length]);

  return (
    <div className="infinite-scroll-wrap" ref={scrollRef}>
      <div className="infinite-scroll-content" ref={contentRef}>
        {duplicatedImages.map((src, i) => (
          <div key={`${src}-${i}`} className="infinite-scroll-item">
            <img src={src} alt="" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
}
