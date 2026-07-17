import { useEffect, useMemo, useRef } from "react";
import { Glass, type GlassOptics, glassValue } from "@samasante/liquid-glass";

const CANVAS_OPTICS: Partial<GlassOptics> = {
  mapSize: 512,
  clipToShape: true,
  softEdge: false,
  strength: 0.22,
  depth: 0.85,
  curvature: 0.6,
  bend: 0.55,
  bendWidth: 0.12,
  dispersion: 0.4,
  specular: 1.8,
  sheenAngle: 50,
  glow: 0.55,
  glowSpread: 1.2,
  glowFalloff: 1.2,
  sheen: 1.2,
  sheenWidth: 2,
  sheenFalloff: 1.2,
  frost: 0,
  brightness: 0,
  edgeShadow: "0 0 0 1px rgba(255,255,255,0.25), 0 8px 32px rgba(0,0,0,0.6)",
  restEdgeShadow: "0 0 0 1px rgba(255,255,255,0.30), 0 8px 40px rgba(0,0,0,0.65)",
  edgeInsetShadow: "0 0 0 1px rgba(255,255,255,0.12)",
};

const draw = (ctx: CanvasRenderingContext2D, t: number) => {
  const { width: W, height: H } = ctx.canvas;
  const slow = t * 0.00028;

  // 深蓝底色
  ctx.fillStyle = "#060e1c";
  ctx.fillRect(0, 0, W, H);

  // 缓慢漂移的彩色光晕，让背景有色彩层次
  const blobs = [
    { cx: 0.28 + 0.12 * Math.sin(slow * 0.6),  cy: 0.38 + 0.1  * Math.cos(slow * 0.5),  r: 0.55, color: [30,  110, 255, 0.30] },
    { cx: 0.72 + 0.10 * Math.cos(slow * 0.5),  cy: 0.62 + 0.12 * Math.sin(slow * 0.7),  r: 0.45, color: [110,  20, 255, 0.22] },
    { cx: 0.50 + 0.14 * Math.sin(slow * 0.35), cy: 0.25 + 0.08 * Math.cos(slow * 0.9),  r: 0.38, color: [0,  200, 230, 0.18] },
    { cx: 0.15 + 0.08 * Math.cos(slow * 0.8),  cy: 0.75 + 0.09 * Math.sin(slow * 0.45), r: 0.35, color: [60,  0,  180, 0.16] },
  ] as const;

  for (const b of blobs) {
    const gx = b.cx * W, gy = b.cy * H;
    const gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, b.r * Math.max(W, H));
    const [r, g, bl, a] = b.color;
    gr.addColorStop(0, `rgba(${r},${g},${bl},${a})`);
    gr.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, W, H);
  }

  // 水波线条
  const lineCount = 72;
  for (let i = 0; i < lineCount; i++) {
    const frac = i / lineCount;
    const midAlpha = Math.sin(frac * Math.PI);
    const base = 0.18 + 0.45 * midAlpha;
    const shimmer = Math.max(
      0,
      Math.sin(i * 1.4 + slow * 2.8) * Math.sin(i * 2.9 - slow * 1.8),
    );

    const alpha = base + shimmer * 0.45;
    const hue = 195 + frac * 35 + shimmer * 20;  // 青色 → 蓝紫，高光偏白
    const light = 68 + shimmer * 28;
    ctx.strokeStyle = `hsla(${hue},72%,${light}%,${alpha})`;
    ctx.lineWidth = 0.6 + shimmer * 0.5;

    ctx.beginPath();
    for (let x = 0; x <= W; x += 2) {
      const px = x / W;
      const y =
        frac * H +
        Math.sin(px * Math.PI * 3.2 + slow * 1.1  + frac * 2.8) * 10 +
        Math.sin(px * Math.PI * 1.7 + slow * 1.8  - frac * 4.2) *  7 +
        Math.sin(px * Math.PI * 5.5 + slow * 0.6  + frac * 1.6) *  4;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
};

export interface GlassCanvasProps {
  optics?: Partial<GlassOptics>;
}

export function GlassCanvas({ optics }: GlassCanvasProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Use motion values so mouse moves don't cause React re-renders
  const mx = useMemo(() => glassValue(0.5), []);
  const my = useMemo(() => glassValue(0.5), []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mx.set((e.clientX - r.left) / r.width);
      my.set((e.clientY - r.top) / r.height);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative", width: "100%", height: "100%",
        overflow: "hidden", borderRadius: "inherit", cursor: "crosshair",
      }}
    >
      <Glass
        draw={draw}
        size={180}
        radius={90}
        center={{ x: mx, y: my }}
        optics={{ ...CANVAS_OPTICS, ...optics }}
        live
        style={{ position: "absolute", inset: 0 }}
      />
    </div>
  );
}
