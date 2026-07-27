"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";

import {
  fadeVariants,
  scaleVariants,
  slideVariants,
  staggerContainerVariants,
} from "@/lib/animations/transitions";

type MotionDivProps = React.ComponentProps<typeof motion.div>;

export function SlideIn(props: MotionDivProps) {
  return <Reveal variants={slideVariants} {...props} />;
}

export function ScaleIn(props: MotionDivProps) {
  return <Reveal variants={scaleVariants} {...props} />;
}

export function ScrollReveal(props: MotionDivProps) {
  return <Reveal variants={fadeVariants} {...props} />;
}

function Reveal({
  children,
  variants = fadeVariants,
  ...props
}: MotionDivProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : "hidden"}
      variants={variants}
      viewport={{ once: true, margin: "-10%" }}
      whileInView="visible"
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer(props: MotionDivProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : "hidden"}
      variants={staggerContainerVariants}
      viewport={{ once: true, margin: "-8%" }}
      whileInView="visible"
      {...props}
    />
  );
}

export function StaggerItem(props: MotionDivProps) {
  return <motion.div variants={fadeVariants} {...props} />;
}

export function BlurReveal({ children, ...props }: MotionDivProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, filter: "blur(12px)" }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1, filter: "blur(0px)" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function TextReveal({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const words = children.split(" ");
  return (
    <span className={className} aria-label={children}>
      {words.map((word, index) => (
        <motion.span
          animate={{ opacity: 1, y: 0 }}
          aria-hidden
          className="inline-block"
          initial={reduceMotion ? false : { opacity: 0, y: "0.6em" }}
          key={`${word}-${index}`}
          transition={{ delay: index * 0.045, duration: 0.4 }}
        >
          {word}
          {index < words.length - 1 ? "\u00a0" : ""}
        </motion.span>
      ))}
    </span>
  );
}

export function MagneticElement({
  children,
  strength = 0.16,
}: {
  children: React.ReactNode;
  strength?: number;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  return (
    <motion.div
      onPointerLeave={() => {
        animate(x, 0, { duration: 0.25 });
        animate(y, 0, { duration: 0.25 });
      }}
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - bounds.left - bounds.width / 2) * strength);
        y.set((event.clientY - bounds.top - bounds.height / 2) * strength);
      }}
      style={{ x, y }}
    >
      {children}
    </motion.div>
  );
}

export function ParallaxLayer({
  children,
  distance = 48,
}: {
  children: React.ReactNode;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);

  return (
    <motion.div ref={ref} style={{ y }}>
      {children}
    </motion.div>
  );
}

export function AnimatedCounter({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const element = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1,
      onUpdate: (latest) => {
        if (element.current) {
          element.current.textContent = `${Math.round(latest)}${suffix}`;
        }
      },
    });
    return () => controls.stop();
  }, [suffix, value]);

  return (
    <span ref={element}>
      {value}
      {suffix}
    </span>
  );
}

export function SharedLayoutTransition(props: MotionDivProps) {
  return <motion.div layout {...props} />;
}
