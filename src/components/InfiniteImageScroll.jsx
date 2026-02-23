export function InfiniteImageScroll({ projects = [] }) {
  if (!projects.length) return null;

  // Duplica a lista para o loop infinito (quando a primeira cópia sai, a segunda entra)
  const duplicated = [...projects, ...projects];

  return (
    <div className="infinite-scroll-wrap">
      <div className="infinite-scroll-content">
        {duplicated.map((project, i) => {
          const imageUrl =
            project.image || `https://picsum.photos/400/300?random=${(i % projects.length) + 1}`;
          const sizeClass = `infinite-scroll-item--size-${(i % 3) + 1}`;

          return (
            <div
              key={`${project.url || "project"}-${i}`}
              className={`infinite-scroll-item ${sizeClass}`}
            >
              <img src={imageUrl} alt="" loading="lazy" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
