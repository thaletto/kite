import { useEffect, useRef } from "react";

const SVG_CONFIG = {
  particleCount: 64,
  trailSpan: 0.38,
  durationMs: 8000,
  rotationDurationMs: 28000,
  pulseDurationMs: 3000,
  strokeWidth: 5.5,
  baseRadius: 7,
  detailAmplitude: 3,
  petalCount: 7,
  curveScale: 3.9,
} as const;

function normalizeProgress(progress: number) {
  return ((progress % 1) + 1) % 1;
}

function getDetailScale(time: number) {
  const pulseProgress =
    (time % SVG_CONFIG.pulseDurationMs) / SVG_CONFIG.pulseDurationMs;
  return 0.52 + ((Math.sin(pulseProgress * Math.PI * 2 + 0.55) + 1) / 2) * 0.48;
}

function getRotation(time: number) {
  return (
    -((time % SVG_CONFIG.rotationDurationMs) / SVG_CONFIG.rotationDurationMs) *
    360
  );
}

function getPoint(progress: number, detailScale: number) {
  const t = progress * Math.PI * 2;
  const petals = SVG_CONFIG.petalCount;
  const x =
    SVG_CONFIG.baseRadius * Math.cos(t) -
    SVG_CONFIG.detailAmplitude * detailScale * Math.cos(petals * t);
  const y =
    SVG_CONFIG.baseRadius * Math.sin(t) -
    SVG_CONFIG.detailAmplitude * detailScale * Math.sin(petals * t);
  return {
    x: 50 + x * SVG_CONFIG.curveScale,
    y: 50 + y * SVG_CONFIG.curveScale,
  };
}

function buildPath(detailScale: number, steps = 480) {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const p = getPoint(i / steps, detailScale);
    return `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
  }).join(" ");
}

function getParticle(index: number, progress: number, detailScale: number) {
  const tailOffset = index / (SVG_CONFIG.particleCount - 1);
  const point = getPoint(
    normalizeProgress(progress - tailOffset * SVG_CONFIG.trailSpan),
    detailScale,
  );
  const fade = Math.pow(1 - tailOffset, 0.56);
  return {
    x: point.x,
    y: point.y,
    radius: 0.9 + fade * 2.7,
    opacity: 0.04 + fade * 0.96,
  };
}

const SVG_NS = "http://www.w3.org/2000/svg";

export function ThinkingLoader({ size = 16 }: { size?: number }) {
  const groupRef = useRef<SVGGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const particleRefs = useRef<SVGCircleElement[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const group = groupRef.current;
    const path = pathRef.current;
    if (!group || !path) return;

    // Create particle circles
    particleRefs.current = Array.from(
      { length: SVG_CONFIG.particleCount },
      () => {
        const circle = document.createElementNS(SVG_NS, "circle");
        circle.setAttribute("fill", "currentColor");
        group.appendChild(circle);
        return circle;
      },
    );

    const startedAt = performance.now();

    function render(now: number) {
      const time = now - startedAt;
      const progress = (time % SVG_CONFIG.durationMs) / SVG_CONFIG.durationMs;
      const detailScale = getDetailScale(time);

      group!.setAttribute("transform", `rotate(${getRotation(time)} 50 50)`);
      path!.setAttribute("d", buildPath(detailScale));

      particleRefs.current.forEach((node, i) => {
        const p = getParticle(i, progress, detailScale);
        node.setAttribute("cx", p.x.toFixed(2));
        node.setAttribute("cy", p.y.toFixed(2));
        node.setAttribute("r", p.radius.toFixed(2));
        node.setAttribute("opacity", p.opacity.toFixed(3));
      });

      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      // Clean up appended circles
      particleRefs.current.forEach((c) => c.parentNode?.removeChild(c));
      particleRefs.current = [];
    };
  }, []);

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      style={{ width: size, height: size, overflow: "visible" }}
    >
      <g ref={groupRef}>
        <path
          ref={pathRef}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={SVG_CONFIG.strokeWidth}
          opacity={0.1}
        />
      </g>
    </svg>
  );
}
