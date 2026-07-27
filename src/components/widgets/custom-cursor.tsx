"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

type CursorMode = {
  interactive: boolean;
  label: string;
};

type ClickPulse = {
  id: number;
  x: number;
  y: number;
};

export function CustomCursor() {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(-100);
  const pointerY = useMotionValue(-100);
  const ringX = useSpring(pointerX, {
    stiffness: 360,
    damping: 28,
    mass: 0.32,
  });
  const ringY = useSpring(pointerY, {
    stiffness: 360,
    damping: 28,
    mass: 0.32,
  });
  const trailOneX = useSpring(pointerX, {
    stiffness: 230,
    damping: 26,
    mass: 0.38,
  });
  const trailOneY = useSpring(pointerY, {
    stiffness: 230,
    damping: 26,
    mass: 0.38,
  });
  const trailTwoX = useSpring(pointerX, {
    stiffness: 150,
    damping: 24,
    mass: 0.5,
  });
  const trailTwoY = useSpring(pointerY, {
    stiffness: 150,
    damping: 24,
    mass: 0.5,
  });
  const trailThreeX = useSpring(pointerX, {
    stiffness: 95,
    damping: 22,
    mass: 0.62,
  });
  const trailThreeY = useSpring(pointerY, {
    stiffness: 95,
    damping: 22,
    mass: 0.62,
  });
  const [mode, setMode] = useState<CursorMode>({
    interactive: false,
    label: "",
  });
  const [pressed, setPressed] = useState(false);
  const [clickPulses, setClickPulses] = useState<ClickPulse[]>([]);
  const pulseId = useRef(0);

  useEffect(() => {
    if (reduceMotion) return;

    function handlePointerMove(event: PointerEvent) {
      pointerX.set(event.clientX);
      pointerY.set(event.clientY);
      document.documentElement.style.setProperty(
        "--pointer-x",
        `${event.clientX}px`,
      );
      document.documentElement.style.setProperty(
        "--pointer-y",
        `${event.clientY}px`,
      );
    }

    function handlePointerOver(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const interactive = target.closest<HTMLElement>(
        "[data-cursor], a, button, summary",
      );
      setMode({
        interactive: Boolean(interactive),
        label: interactive?.dataset.cursor ?? "",
      });
    }

    function handlePointerDown(event: PointerEvent) {
      setPressed(true);
      const id = pulseId.current++;
      setClickPulses((current) => [
        ...current.slice(-3),
        { id, x: event.clientX, y: event.clientY },
      ]);
    }

    function handlePointerUp() {
      setPressed(false);
    }

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointerover", handlePointerOver, {
      passive: true,
    });
    window.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerover", handlePointerOver);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [pointerX, pointerY, reduceMotion]);

  if (reduceMotion) return null;

  return (
    <div className="custom-cursor" aria-hidden>
      <motion.span
        className="custom-cursor-trail custom-cursor-trail-three"
        style={{ x: trailThreeX, y: trailThreeY }}
      />
      <motion.span
        className="custom-cursor-trail custom-cursor-trail-two"
        style={{ x: trailTwoX, y: trailTwoY }}
      />
      <motion.span
        className="custom-cursor-trail custom-cursor-trail-one"
        style={{ x: trailOneX, y: trailOneY }}
      />
      <motion.span
        animate={{
          height: mode.interactive ? 52 : 34,
          opacity: pressed ? 0.65 : 1,
          rotate: mode.interactive ? 45 : 0,
          scale: pressed ? 0.78 : 1,
          width: mode.interactive ? 52 : 34,
        }}
        className="custom-cursor-ring"
        style={{ x: ringX, y: ringY }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="custom-cursor-orbit" />
      </motion.span>
      <motion.span
        animate={{ scale: pressed ? 2.2 : mode.interactive ? 0.5 : 1 }}
        className="custom-cursor-dot"
        style={{ x: pointerX, y: pointerY }}
      />
      <AnimatePresence>
        {mode.label ? (
          <motion.span
            animate={{ opacity: 1, scale: 1 }}
            className="custom-cursor-label"
            exit={{ opacity: 0, scale: 0.8 }}
            initial={{ opacity: 0, scale: 0.8 }}
            key={mode.label}
            style={{ x: ringX, y: ringY }}
          >
            {mode.label}
          </motion.span>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {clickPulses.map((pulse) => (
          <motion.span
            animate={{ opacity: 0, scale: 1.8 }}
            className="custom-cursor-click"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0.8, scale: 0.2 }}
            key={pulse.id}
            onAnimationComplete={() =>
              setClickPulses((current) =>
                current.filter((item) => item.id !== pulse.id),
              )
            }
            style={{ left: pulse.x, top: pulse.y }}
            transition={{ duration: 0.48, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
