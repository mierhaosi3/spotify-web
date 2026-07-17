import React, { useLayoutEffect, useRef, useState } from "react";
import { Glass, type GlassOptics } from "@samasante/liquid-glass";

const sans = "-apple-system, 'SF Pro Text', ui-sans-serif, system-ui, sans-serif";

export const PANEL_LENS: Partial<GlassOptics> = {
  mapSize: 256,
  clipToShape: true,
  softEdge: true,
  depth: 1,
  curvature: 0.5,
  dispersion: 0.6,
  strength: 0.17,
  bend: 0.7,
  bendWidth: 0.12,
  frost: 3,
  brightness: 0.22,
  specular: 1.3,
  sheenAngle: 50,
  glow: 0.32,
  glowSpread: 1,
  glowFalloff: 1,
  sheen: 1.3,
  sheenWidth: 3,
};

const DEFAULT_WALLPAPER =
  "radial-gradient(120% 120% at 12% 18%, #ff9d4d 0%, transparent 46%)," +
  "radial-gradient(120% 120% at 82% 14%, #4dc3ff 0%, transparent 44%)," +
  "radial-gradient(130% 130% at 78% 88%, #ff5d8f 0%, transparent 50%)," +
  "radial-gradient(140% 140% at 22% 86%, #7a5cff 0%, transparent 52%)," +
  "linear-gradient(135deg, #b24bd8, #f0793b)";

const Wallpaper = ({ bg }: { bg: string }) => (
  <div style={{ position: "absolute", inset: 0, background: bg }} />
);

const PANEL_MAX_W = 420;
const PANEL_MARGIN_X = 48;
const PANEL_H = 84;
const PANEL_RADIUS = 20;

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

export interface GlassNotificationProps {
  title?: string;
  time?: string;
  body?: string;
  avatar?: string;
  wallpaper?: string;
  lens?: Partial<GlassOptics>;
}

export const GlassNotification: React.FC<GlassNotificationProps> = ({
  title = "Priya Raman",
  time = "now",
  body = "Just landed — grabbing a cab. Save me a seat and order the usual?",
  avatar = "PR",
  wallpaper = DEFAULT_WALLPAPER,
  lens,
}) => {
  const [ref, { w, h }] = useSize();
  const panelW = Math.round(Math.min(w - PANEL_MARGIN_X, PANEL_MAX_W));
  const ready = w > 0 && h > 0 && panelW > 0;
  const cardLeft = Math.round((w - panelW) / 2);
  const cardTop = Math.round((h - PANEL_H) / 2);

  return (
    <div
      ref={ref}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: "inherit" }}
    >
      <Wallpaper bg={wallpaper} />
      {ready && (
        <>
          {/* Glass card — refracts a copy of the wallpaper */}
          <Glass
            refract={<Wallpaper bg={wallpaper} />}
            behind="#c8569f"
            optics={{ ...PANEL_LENS, ...lens }}
            style={{
              position: "absolute",
              left: cardLeft,
              top: cardTop,
              width: panelW,
              height: PANEL_H,
              borderRadius: PANEL_RADIUS,
            }}
          />
          {/* Crisp content overlay */}
          <div
            style={{
              position: "absolute",
              left: cardLeft,
              top: cardTop,
              width: panelW,
              height: PANEL_H,
              borderRadius: PANEL_RADIUS,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "0 16px",
              boxShadow:
                "inset 0 0 0 0.5px rgba(255,255,255,0.5), 0 0 0 0.5px rgba(0,0,0,0.15), 0 8px 32px rgba(0,0,0,0.18)",
              fontFamily: sans,
            }}
          >
            <div
              style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "linear-gradient(135deg, #5856d6, #af52de)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 600, fontSize: 14, flexShrink: 0,
              }}
            >
              {avatar}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1c1c1e" }}>{title}</span>
                <span style={{ fontSize: 11, color: "rgba(0,0,0,0.5)", flexShrink: 0, marginLeft: 8 }}>{time}</span>
              </div>
              <p style={{
                fontSize: 12, color: "rgba(0,0,0,0.74)", lineHeight: 1.4, margin: 0,
                overflow: "hidden", display: "-webkit-box",
                WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              }}>
                {body}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
