import { useState, useEffect } from "react";

const VIMEO_API_BASE = "https://api.vimeo.com";

/**
 * Converte um vídeo da API Vimeo no formato { name, url, image, width, height } usado em projects.
 * image = thumbnail do Vimeo (melhor tamanho disponível).
 * width/height = do próprio objeto do vídeo (video.width, video.height) para a proporção correta.
 */
function videoToProject(video) {
  const sizes = video.pictures?.sizes ?? [];
  const thumb =
    sizes.find((s) => s.width >= 1920) ||
    sizes.find((s) => s.width >= 1280) ||
    sizes.find((s) => s.width >= 960) ||
    sizes.find((s) => s.width >= 640) ||
    sizes[sizes.length - 1];
  return {
    name: video.name,
    url: video.link,
    image: thumb?.link ?? "",
    width: video.width ?? thumb?.width ?? 16,
    height: video.height ?? thumb?.height ?? 9,
  };
}

/**
 * Busca os vídeos do Vimeo e retorna como lista de projects.
 * Token: coloque VITE_VIMEO_TOKEN no arquivo .env na raiz do projeto.
 * @returns {{ projects: Array<{ name, url, image, width, height }>, loading: boolean, error: Error | null }}
 */
export function useVimeoApi() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = import.meta.env.VITE_VIMEO_TOKEN;
    if (!token || token.trim() === "") {
      console.info(
        "[Vimeo] Token não configurado. Crie um .env com VITE_VIMEO_TOKEN=seu_token"
      );
      setLoading(false);
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.vimeo.*+json;version=3.4",
    };

    async function fetchVideos() {
      try {
        const videosRes = await fetch(`${VIMEO_API_BASE}/me/videos`, {
          headers,
        });
        const json = await videosRes.json();
        console.log("[Vimeo] Resposta da API:", json);

        if (!videosRes.ok) {
          setError(new Error(json.error ?? "Erro ao buscar vídeos"));
          setLoading(false);
          return;
        }
        const list = json.data ?? [];
        const mapped = list.map(videoToProject);
        console.log("[Vimeo] Projetos mapeados (name, url, image, width, height):", mapped);
        setProjects(mapped);
      } catch (err) {
        console.error("[Vimeo] Erro ao chamar a API:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, []);

  return { projects, loading, error };
}
