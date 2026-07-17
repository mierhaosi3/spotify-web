import { useEffect, useMemo, useRef, useState } from "react";
import {
  Glass,
  type GlassOptics,
  animateGlassValue,
  cubicBezier,
  deriveGlass,
  glassValue,
  rubberBand,
  useLensWobble,
} from "@samasante/liquid-glass";

const EASE = cubicBezier(0.34, 1.2, 0.42, 1);
const SETTLE = cubicBezier(0.36, 0, 0.18, 1);
const THUMB_ANIM = { ease: EASE, duration: 0.48 };
const EXPAND_ANIM = { ease: EASE, duration: 0.22 };
const COLLAPSE_ANIM = { ease: SETTLE, duration: 0.38 };

const OPTICS: Partial<GlassOptics> = {
  mapSize: 256,
  depth: 0.25,
  dispersion: 0.5,
  strength: 0.14,
  clipToShape: true,
  softEdge: true,
  curvature: 0.25,
  splay: 0.5,
  bend: 0.08,
  bendWidth: 0.06,
  frost: 0.1,
  brightness: 0.18,
  specular: 1.2,
  sheenAngle: 30,
  sheenDark: false,
  glow: 0.25,
  glowSpread: 0.5,
  glowFalloff: 2,
  sheen: 0.7,
  sheenWidth: 1.5,
  sheenFalloff: 1.5,
  edgeShadow: "0 2px 8px rgba(0,0,0,0.22)",
  edgeInsetShadow: "0 -3px 8px rgba(0,0,0,0.10)",
  restEdgeShadow:
    "0 1px 3px rgba(0,0,0,0.28), 0 4px 12px rgba(0,0,0,0.16)",
};

interface GlassSwitchProps {
  checked: boolean;
  onCheckedChange?: (v: boolean) => void;
  disabled?: boolean;
  label?: string;
  /** track width (px) */
  width?: number;
  /** track height (px) */
  height?: number;
  activeColor?: string;
  trackColor?: string;
}

export function GlassSwitch({
  checked,
  onCheckedChange,
  disabled,
  label,
  width: S = 74,
  height: R = 30,
  activeColor = "#0a84ff",
  trackColor = "#d1d1d6",
}: GlassSwitchProps) {
  // --- geometry ---
  const thumbW = Math.round(0.6 * S);
  const thumbH = R - 6;
  const travel = S - thumbW - 6;
  const restRadius = thumbH / 2;
  const restHalfW = thumbW / 2;
  const restHalfH = thumbH / 2;
  const pad = Math.ceil(restHalfW * 0.5 + S * 0.15) + 2;
  const fullW = S + 2 * pad;
  const fullH = R + 2 * pad;

  const travelRef = useRef(travel);
  const thumbWRef = useRef(thumbW);
  const fullWRef = useRef(fullW);
  const padRef = useRef(pad);
  const restHalfWRef = useRef(restHalfW);
  const restHalfHRef = useRef(restHalfH);
  const restRadiusRef = useRef(restRadius);
  useEffect(() => {
    travelRef.current = travel;
    thumbWRef.current = thumbW;
    fullWRef.current = fullW;
    padRef.current = pad;
    restHalfWRef.current = restHalfW;
    restHalfHRef.current = restHalfH;
    restRadiusRef.current = restRadius;
  });

  // --- motion values (created once; refs keep geometry fresh for callbacks) ---
  const mv = useMemo(() => {
    const thumbX = glassValue(checked ? travel : 0);
    const lensX = deriveGlass(
      [thumbX],
      () => (pad + 3 + thumbW / 2 + thumbX.get()) / fullW,
    );
    const halfW = glassValue(restHalfW);
    const halfH = glassValue(restHalfH);
    const radius = glassValue(restRadius);
    const tintOpacity = glassValue(1);
    const shadowOpacity = glassValue(0);
    const restShadowOpacity = deriveGlass(
      [shadowOpacity],
      () => 1 - shadowOpacity.get(),
    );
    const stretch = glassValue(0);
    const lensW = deriveGlass(
      [halfW, stretch],
      () => halfW.get() * (1 - 0.2 * stretch.get()) * 2,
    );
    const lensH = deriveGlass(
      [halfH, stretch],
      () => halfH.get() * (1 + 0.4 * stretch.get()) * 2,
    );
    const edgeBias = deriveGlass(
      [tintOpacity],
      () => 0.5 * tintOpacity.get(),
    );
    return {
      thumbX, lensX, halfW, halfH, radius,
      tintOpacity, shadowOpacity, restShadowOpacity,
      stretch, lensW, lensH, edgeBias,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const holdRef = useRef(0);
  const kickWobbleRef = useRef<() => void>(() => {});
  useLensWobble(mv.thumbX, mv.stretch, holdRef, kickWobbleRef);

  const wrapperRef = useRef<HTMLLabelElement>(null);
  const hitAreaRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);
  const startClientXRef = useRef(0);
  const startThumbXRef = useRef(0);
  const movedRef = useRef(false);
  const suppressRef = useRef(false);
  const stateRef = useRef<"idle" | "pending" | "hold" | "tap">("idle");
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const collapseTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const thumbAnimRef = useRef<{ stop(): void } | null>(null);
  const mountedRef = useRef(true);
  const [, setDragging] = useState(false);

  useEffect(
    () => () => {
      mountedRef.current = false;
      clearTimeout(holdTimeoutRef.current);
      clearTimeout(collapseTimeoutRef.current);
    },
    [],
  );

  // sync --switch-progress without React re-render
  useEffect(() => {
    const apply = (x: number) => {
      const t = travelRef.current;
      wrapperRef.current?.style.setProperty(
        "--switch-progress",
        String(t > 0 ? Math.max(0, Math.min(1, x / t)) : 0),
      );
    };
    apply(mv.thumbX.get());
    return mv.thumbX.on("change", apply);
  }, [mv.thumbX]);

  const expand = () => {
    animateGlassValue(mv.halfW, 1.5 * restHalfWRef.current, EXPAND_ANIM);
    animateGlassValue(mv.halfH, 1.5 * restHalfHRef.current, EXPAND_ANIM);
    animateGlassValue(mv.radius, 1.5 * restRadiusRef.current, EXPAND_ANIM);
    animateGlassValue(mv.tintOpacity, 0, EXPAND_ANIM);
    animateGlassValue(mv.shadowOpacity, 1, EXPAND_ANIM);
  };

  const collapse = () => {
    animateGlassValue(mv.halfW, restHalfWRef.current, COLLAPSE_ANIM);
    animateGlassValue(mv.halfH, restHalfHRef.current, COLLAPSE_ANIM);
    animateGlassValue(mv.radius, restRadiusRef.current, COLLAPSE_ANIM);
    animateGlassValue(mv.tintOpacity, 1, COLLAPSE_ANIM);
    animateGlassValue(mv.shadowOpacity, 0, COLLAPSE_ANIM);
  };

  // sync thumb position when checked changes externally
  useEffect(() => {
    if (stateRef.current === "tap") return;
    thumbAnimRef.current = animateGlassValue(
      mv.thumbX,
      checked ? travel : 0,
      THUMB_ANIM,
    );
  }, [checked, mv.thumbX, travel]);

  const handleChange = (next: boolean) => {
    if (suppressRef.current) return;
    onCheckedChange?.(next);
    if (stateRef.current === "idle") {
      stateRef.current = "tap";
      expand();
      clearTimeout(collapseTimeoutRef.current);
      collapseTimeoutRef.current = setTimeout(() => {
        collapse();
      }, 290);
      thumbAnimRef.current = animateGlassValue(mv.thumbX, next ? travel : 0, {
        ...THUMB_ANIM,
        onComplete: () => {
          if (mountedRef.current && stateRef.current === "tap") {
            stateRef.current = "idle";
          }
        },
      });
    }
  };

  return (
    <label
      ref={wrapperRef}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        cursor: disabled ? "not-allowed" : "pointer",
        userSelect: "none",
        opacity: disabled ? 0.45 : 1,
        // CSS vars for track color crossfade
        ["--glass-track" as string]: trackColor,
        ["--glass-active" as string]: activeColor,
      }}
    >
      {/* hidden real input for a11y */}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => handleChange(e.target.checked)}
        onClick={(e) => { if (suppressRef.current) e.preventDefault(); }}
        disabled={disabled}
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          margin: -1,
          padding: 0,
          border: 0,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          clipPath: "inset(50%)",
          pointerEvents: "none",
        }}
      />

      {/* outer hit-area wrapper (overflow visible so the bleed lens renders) */}
      <div
        style={{
          position: "relative",
          width: fullW,
          height: fullH,
          margin: `-${pad}px`,
        }}
      >
        {/* track */}
        <div
          style={{
            position: "absolute",
            inset: pad,
            borderRadius: R / 2,
            background: `color-mix(in srgb, ${trackColor}, ${activeColor} calc(var(--switch-progress, 0) * 100%))`,
            transition: "background 0s",
          }}
        />

        {/* Glass lens — the thumb itself */}
        <Glass
          width={mv.lensW}
          height={mv.lensH}
          radius={mv.radius}
          center={{ x: mv.lensX, y: 0.5 }}
          optics={OPTICS}
          filterResolution={3}
          unstable_lens={{
            tintColor: "#ffffff",
            tintOpacity: mv.tintOpacity,
            shadowOpacity: mv.shadowOpacity,
            restShadowOpacity: mv.restShadowOpacity,
            edgeBias: mv.edgeBias,
          }}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
          }}
        />

        {/* invisible hit area */}
        <div
          ref={hitAreaRef}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: R / 2 + pad,
            cursor: disabled ? "not-allowed" : "pointer",
          }}
          onPointerDown={(e) => {
            if (pointerIdRef.current !== null || disabled) return;
            pointerIdRef.current = e.pointerId;
            e.currentTarget.setPointerCapture(e.pointerId);
            startClientXRef.current = e.clientX;
            startThumbXRef.current = mv.thumbX.get();
            movedRef.current = false;
            setDragging(true);
            suppressRef.current = true;
            stateRef.current = "pending";
            clearTimeout(holdTimeoutRef.current);
            clearTimeout(collapseTimeoutRef.current);
            holdTimeoutRef.current = setTimeout(() => {
              if (stateRef.current === "pending") {
                stateRef.current = "hold";
                thumbAnimRef.current?.stop();
                expand();
                holdRef.current = 0.175;
                kickWobbleRef.current();
              }
            }, 170);
          }}
          onPointerMove={(e) => {
            if (e.pointerId !== pointerIdRef.current) return;
            const delta = e.clientX - startClientXRef.current;
            if (!movedRef.current) {
              if (Math.abs(delta) < 3) return;
              movedRef.current = true;
              thumbAnimRef.current?.stop();
              startThumbXRef.current = mv.thumbX.get();
              startClientXRef.current = e.clientX;
              clearTimeout(holdTimeoutRef.current);
              holdRef.current = 0;
              if (stateRef.current !== "hold") {
                stateRef.current = "hold";
                expand();
              }
            }
            let next = startThumbXRef.current + (e.clientX - startClientXRef.current);
            const RUBBER_LIMIT = S * 0.15;
            const RUBBER_RANGE = RUBBER_LIMIT * 10;
            if (next < 0) next = -rubberBand(-next, RUBBER_LIMIT, RUBBER_RANGE);
            else if (next > travel) next = travel + rubberBand(next - travel, RUBBER_LIMIT, RUBBER_RANGE);
            mv.thumbX.set(next);
          }}
          onPointerUp={(e) => {
            if (e.pointerId !== pointerIdRef.current) return;
            pointerIdRef.current = null;
            clearTimeout(holdTimeoutRef.current);
            if (movedRef.current) {
              setDragging(false);
              stateRef.current = "idle";
              collapse();
              const next = Math.max(0, Math.min(travel, mv.thumbX.get())) > travel / 2;
              thumbAnimRef.current = animateGlassValue(mv.thumbX, next ? travel : 0, THUMB_ANIM);
              if (next !== checked) onCheckedChange?.(next);
              requestAnimationFrame(() => { suppressRef.current = false; });
            } else if (stateRef.current === "pending" || stateRef.current === "tap") {
              stateRef.current = "tap";
              suppressRef.current = false;
              setDragging(false);
              expand();
              clearTimeout(collapseTimeoutRef.current);
              collapseTimeoutRef.current = setTimeout(() => collapse(), 290);
              const target = checked ? 0 : travel;
              thumbAnimRef.current = animateGlassValue(mv.thumbX, target, {
                ...THUMB_ANIM,
                onComplete: () => {
                  if (mountedRef.current && stateRef.current === "tap") {
                    stateRef.current = "idle";
                  }
                },
              });
              onCheckedChange?.(!checked);
            } else if (stateRef.current === "hold") {
              stateRef.current = "idle";
              setDragging(false);
              holdRef.current = 0;
              collapse();
              thumbAnimRef.current = animateGlassValue(mv.thumbX, checked ? travel : 0, THUMB_ANIM);
              requestAnimationFrame(() => { suppressRef.current = false; });
            } else {
              setDragging(false);
              suppressRef.current = false;
            }
          }}
          onPointerCancel={(e) => {
            if (e.pointerId !== pointerIdRef.current) return;
            pointerIdRef.current = null;
            clearTimeout(holdTimeoutRef.current);
            holdRef.current = 0;
            setDragging(false);
            stateRef.current = "idle";
            collapse();
            thumbAnimRef.current = animateGlassValue(mv.thumbX, checked ? travel : 0, THUMB_ANIM);
            requestAnimationFrame(() => { suppressRef.current = false; });
          }}
          onDragStart={(e) => e.preventDefault()}
        />
      </div>

      {label && (
        <span style={{ fontSize: 15, color: "inherit" }}>{label}</span>
      )}
    </label>
  );
}
