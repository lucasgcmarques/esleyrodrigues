import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const debounce = (func, timeout = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), timeout);
  };
};

const IMAGES = [
  "https://raw.githubusercontent.com/jankohlbach/canary-islands/main/assets/images/slider-1.jpeg",
  "https://raw.githubusercontent.com/jankohlbach/canary-islands/main/assets/images/slider-2.jpeg",
  "https://raw.githubusercontent.com/jankohlbach/canary-islands/main/assets/images/slider-3.jpeg",
  "https://raw.githubusercontent.com/jankohlbach/canary-islands/main/assets/images/slider-4.jpeg",
  "https://raw.githubusercontent.com/jankohlbach/canary-islands/main/assets/images/slider-5.jpeg",
  "https://raw.githubusercontent.com/jankohlbach/canary-islands/main/assets/images/slider-6.jpeg",
  "https://raw.githubusercontent.com/jankohlbach/canary-islands/main/assets/images/slider-7.jpeg",
  "https://raw.githubusercontent.com/jankohlbach/canary-islands/main/assets/images/slider-8.jpeg",
  "https://raw.githubusercontent.com/jankohlbach/canary-islands/main/assets/images/slider-9.jpeg",
];

const vertexShader = `
  #define PI 3.141592653589793

  uniform vec2 uOffset;

  varying vec2 vUv;

  vec3 deformationCurve(vec3 position, vec2 uv) {
    position.x = position.x - (sin(uv.y * PI) * uOffset.x);
    return position;
  }

  void main() {
    vUv = uv;
    vec3 newPosition = deformationCurve(position, uv);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  uniform vec2 uOffset;
  uniform sampler2D uTexture;
  uniform float uAlpha;

  varying vec2 vUv;

  vec3 rgbShift(sampler2D textureImage, vec2 uv, vec2 offset) {
    vec2 rg = texture(textureImage, uv).rg;
    float b = texture(textureImage, uv + offset).b;
    return vec3(rg, b);
  }

  void main() {
    vec3 color = rgbShift(uTexture, vUv, uOffset);
    gl_FragColor = vec4(color, uAlpha);
  }
`;

export function GsapExample() {
  const watermarkWrapRef = useRef(null);
  const watermarkTextRef = useRef(null);
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const lenisRef = useRef(null);
  const rafRef = useRef(null);
  const renderRef = useRef(null);
  const stRef = useRef(null);
  const uOffsetRef = useRef(new THREE.Vector2(0, 0));
  const velocityRef = useRef(0);

  useEffect(() => {
    const watermarkWrap = watermarkWrapRef.current;
    const watermarkText = watermarkTextRef.current;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!watermarkWrap || !watermarkText || !wrap || !canvas) return;

    const uOffset = uOffsetRef.current;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      wheelMultiplier: 1,
      syncTouch: false,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    lenis.on("scroll", () => {
      velocityRef.current = lenis.velocity;
      ScrollTrigger.update();
    });

    const raf = (time) => {
      lenis.raf(time);
      ScrollTrigger.update();
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);

    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length) lenis.scrollTo(value);
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
    });

    const tlWatermark = gsap.timeline({
      scrollTrigger: {
        trigger: watermarkWrap,
        start: "top top",
        end: "+=600%",
        scrub: true,
        pin: true,
        pinSpacing: false,
      },
      defaults: { ease: "none" },
    });

    tlWatermark.fromTo(watermarkText, { x: "20%" }, { x: "-60%" });

    const st = ScrollTrigger.create({
      trigger: wrap,
      start: "top top",
      end: "+=500%",
      pin: true,
    });
    stRef.current = st;

    const width = Math.max(wrap.clientWidth || 1, 1);
    const height = Math.max(wrap.clientHeight || 1, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 1.75;
    camera.position.y = 0.3;
    camera.rotation.z = 2 * Math.PI * 0.01;

    const textureLoader = new THREE.TextureLoader();
    const images = [...IMAGES];
    images.unshift(images[images.length - 2], images[images.length - 1]);
    images.splice(images.length - 2, 2);
    textureLoader.setCrossOrigin("");
    const textures = images.map((src) =>
      textureLoader.load(src, undefined, undefined, () => {})
    );

    const geometry = new THREE.PlaneGeometry(1, 0.75, 10, 10);
    const items = [];

    for (let i = 0; i < textures.length; i++) {
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.ShaderMaterial({
          uniforms: {
            uOffset: { value: uOffset },
            uTexture: { value: textures[i] },
            uAlpha: { value: 1.0 },
          },
          vertexShader,
          fragmentShader,
        })
      );
      items.push({ mesh, index: i });
      scene.add(mesh);
    }

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const resizeCanvas = () => {
      const w = wrap.clientWidth || window.innerWidth;
      const h = wrap.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    const updateMeshes = () => {
      const width = 1.1;
      const wholeWidth = items.length * width;
      items.forEach((item) => {
        item.mesh.position.x =
          ((width * item.index - st.progress * 10 + 42069 * wholeWidth) % wholeWidth) - 2 * width;
        item.mesh.rotation.y = 2 * Math.PI * 0.03;
      });
    };

    const render = () => {
      if (st.isActive) {
        const vel = typeof st.getVelocity === "function" ? st.getVelocity() : velocityRef.current;
        uOffset.set((vel || 0) * 0.00002, 0);
      } else {
        uOffset.set(0, 0);
      }
      updateMeshes();
      renderer.render(scene, camera);
      renderRef.current = requestAnimationFrame(render);
    };
    renderRef.current = requestAnimationFrame(render);

    const debouncedResize = debounce(() => {
      resizeCanvas();
      ScrollTrigger.refresh();
    });
    window.addEventListener("resize", debouncedResize);

    const resizeObserver = new ResizeObserver(debouncedResize);
    resizeObserver.observe(wrap);

    // Re-measure triggers after layout (e.g. fonts, images)
    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 300);

    return () => {
      clearTimeout(refreshTimer);
      resizeObserver.disconnect();
      window.removeEventListener("resize", debouncedResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (renderRef.current) cancelAnimationFrame(renderRef.current);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      renderer.dispose();
      geometry.dispose();
      textures.forEach((t) => t.dispose());
      items.forEach(({ mesh }) => mesh.material.dispose());
    };
  }, []);

  return (
    <>
      <div
        ref={watermarkWrapRef}
        className="flex min-h-screen items-center overflow-hidden"
      >
        <span
          ref={watermarkTextRef}
          id="watermark-text"
          className="inline-block font-sans text-[35vw] font-black uppercase leading-none opacity-5 pointer-events-none"
        >
          Culture
        </span>
      </div>
      <div ref={wrapRef} className="h-screen w-full">
        <canvas
          ref={canvasRef}
          id="canvas"
          className="block h-full w-full"
        />
      </div>
    </>
  );
}

export default GsapExample;
