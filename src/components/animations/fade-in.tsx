"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps } from "react";

export function FadeIn({
  children,
  delay = 0,
  ...props
}: ComponentProps<typeof motion.div> & { delay?: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, margin: "-8%" }}
      whileInView={{ opacity: 1, y: 0 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
