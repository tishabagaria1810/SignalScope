import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/** Full-page mesh gradient field + center-focused 46px grid with parallax. */
export function MeshBackdrop() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const meshY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-14%"]);
  const meshScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.16]);
  const gridY = useTransform(scrollYProgress, [0, 1], ["0px", reduce ? "0px" : "-92px"]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        style={{ y: meshY, scale: meshScale }}
        className="mesh-field absolute -inset-[18%] opacity-90 transition-[background-image] duration-700"
      />
      <motion.div style={{ y: gridY }} className="focus-grid absolute -inset-[20%]" />
      <div className="absolute inset-0 bg-background/25 backdrop-blur-[64px]" />
    </div>
  );
}
