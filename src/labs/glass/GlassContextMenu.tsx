import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Glass, type GlassOptics } from "@samasante/liquid-glass";

const sans = "-apple-system, 'SF Pro Text', ui-sans-serif, system-ui, sans-serif";

export const MENU_LENS: Partial<GlassOptics> = {
  mapSize: 256,
  clipToShape: true,
  softEdge: true,
  depth: 0.65,
  curvature: 0.26,
  dispersion: 0.16,
  strength: 0.22,
  bend: 0.65,
  bendWidth: 0.07,
  frost: 3.5,
  brightness: 0.55,
  specular: 0.8,
  sheenAngle: 45,
  glow: 0.06,
  glowSpread: 1,
  glowFalloff: 0.8,
  sheen: 0.4,
  sheenWidth: 1,
};

const DEFAULT_WALLPAPER =
  "radial-gradient(120% 120% at 14% 16%, #ffb347 0%, transparent 46%)," +
  "radial-gradient(120% 120% at 86% 12%, #4dc3ff 0%, transparent 44%)," +
  "radial-gradient(130% 130% at 80% 90%, #ff5d8f 0%, transparent 50%)," +
  "radial-gradient(140% 140% at 18% 88%, #7a5cff 0%, transparent 52%)," +
  "linear-gradient(135deg, #9b4bd8, #f0793b)";

export type GlassMenuItem =
  | { label: string; shortcut?: string; danger?: boolean }
  | "separator";

const DEFAULT_ITEMS: GlassMenuItem[] = [
  { label: "Open" },
  { label: "Quick Look" },
  "separator",
  { label: "Get Info" },
  { label: "Rename" },
  "separator",
  { label: "Copy" },
  { label: "Share" },
];

const ROW_H = 24;
const SEP_H = 11;
const PAD_Y = 5;
const MENU_W = 210;
const MENU_RADIUS = 9;

const useSize = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
};

export interface GlassContextMenuProps {
  items?: GlassMenuItem[];
  wallpaper?: string;
  onSelect?: (label: string) => void;
  lens?: Partial<GlassOptics>;
}

export const GlassContextMenu: React.FC<GlassContextMenuProps> = ({
  items = DEFAULT_ITEMS,
  wallpaper = DEFAULT_WALLPAPER,
  onSelect,
  lens,
}) => {
  const [ref, { w, h }] = useSize();
  const menuW = Math.round(Math.min(MENU_W, w - 16));
  const menuH = useMemo(
    () => PAD_Y * 2 + items.reduce((acc, it) => acc + (it === "separator" ? SEP_H : ROW_H), 0),
    [items],
  );
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [hover, setHover] = useState<number | null>(null);

  const cx = Math.round(pos ? pos.x : Math.max(8, (w - menuW) / 2));
  const cy = Math.round(pos ? pos.y : Math.max(8, (h - menuH) / 2));
  const ready = w > 0 && h > 0 && menuW > 0;

  const onContext = (e: React.MouseEvent) => {
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    setPos({
      x: Math.min(Math.max(8, e.clientX - r.left), Math.max(8, w - menuW - 8)),
      y: Math.min(Math.max(8, e.clientY - r.top), Math.max(8, h - menuH - 8)),
    });
  };

  // Offset refract copy so wallpaper aligns under the menu
  const refractCopy = (
    <div style={{
      position: "absolute",
      left: -cx, top: -cy,
      width: w, height: h,
      background: wallpaper,
    }} />
  );

  return (
    <div
      ref={ref}
      onContextMenu={onContext}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: "inherit", userSelect: "none" }}
    >
      {/* Wallpaper background */}
      <div style={{ position: "absolute", inset: 0, background: wallpaper }} />

      {ready && (
        <>
          {/* Glass panel */}
          <Glass
            refract={refractCopy}
            behind="rgba(180,120,60,0.8)"
            optics={{ ...MENU_LENS, ...lens }}
            style={{
              position: "absolute",
              left: cx, top: cy,
              width: menuW, height: menuH,
              borderRadius: MENU_RADIUS,
            }}
          />
          {/* Crisp menu rows */}
          <div
            style={{
              position: "absolute",
              left: cx, top: cy,
              width: menuW, height: menuH,
              borderRadius: MENU_RADIUS,
              overflow: "hidden",
              padding: `${PAD_Y}px 5px`,
              boxShadow:
                "inset 0 0 0 0.5px rgba(255,255,255,0.5), 0 0 0 0.5px rgba(0,0,0,0.12), 0 12px 40px rgba(0,0,0,0.22)",
              fontFamily: sans,
            }}
          >
            {items.map((it, i) => {
              if (it === "separator") {
                return (
                  <div key={i} style={{ height: SEP_H, display: "flex", alignItems: "center", padding: "0 6px" }}>
                    <div style={{ width: "100%", height: 0.5, background: "rgba(0,0,0,0.15)" }} />
                  </div>
                );
              }
              const active = hover === i;
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(cur => cur === i ? null : cur)}
                  onClick={() => onSelect?.(it.label)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    height: ROW_H, padding: "0 11px", borderRadius: 6, fontSize: 13,
                    cursor: "default",
                    color: active ? "#fff" : it.danger ? "#ff3b30" : "rgba(0,0,0,0.85)",
                    background: active
                      ? it.danger ? "rgba(255,59,48,0.95)" : "rgba(10,132,255,0.95)"
                      : "transparent",
                  }}
                >
                  <span>{it.label}</span>
                  {it.shortcut && (
                    <span style={{ fontSize: 12, opacity: 0.5, marginLeft: 16 }}>{it.shortcut}</span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 操作提示 */}
      <div style={{
        position: "absolute", bottom: 12, left: 0, right: 0,
        textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.5)",
        fontFamily: sans, pointerEvents: "none",
      }}>
      </div>
    </div>
  );
};
