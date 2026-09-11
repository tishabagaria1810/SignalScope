import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { Eyebrow, Glass } from "@/components/glass";

export interface GalleryPanel {
  id: string;
  label: string;
  caption: string;
  render: () => ReactNode;
}

/**
 * Sticky, scroll-linked horizontal gallery: vertical scroll drives horizontal
 * movement. Not a carousel — there are no arrows or autoplay.
 */
export function StickyGallery({
  title,
  intro,
  panels,
}: {
  title: string;
  intro: string;
  panels: GalleryPanel[];
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 240, damping: 23, restDelta: 0.0005 });
  const shift = 100 - 100 / panels.length;
  const x = useTransform(p, [0, 1], ["0%", `-${shift}%`]);

  if (reduce) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Eyebrow>{title}</Eyebrow>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">{intro}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {panels.map((panel) => (
            <Glass key={panel.id} className="p-4">
              <div className="relative z-[3]">{panel.render()}</div>
            </Glass>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} style={{ height: `${panels.length * 90}vh` }} className="relative">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-4">
          <Eyebrow>{title}</Eyebrow>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            {intro}
          </p>
        </div>

        <motion.div style={{ x }} className="mt-8 flex w-max gap-5 px-4 sm:gap-7 sm:px-10">
          {panels.map((panel, i) => (
            <div
              key={panel.id}
              className="w-[78vw] max-w-[560px] shrink-0 sm:w-[46vw] lg:w-[36vw]"
            >
              <Glass className="p-4">
                <div className="relative z-[3]">
                  <div className="mb-3 flex items-baseline justify-between gap-3">
                    <h3 className="text-[16px] font-medium">{panel.label}</h3>
                    <span className="font-mono text-[11px] text-subtle-foreground">
                      0{i + 1}
                    </span>
                  </div>
                  {panel.render()}
                  <p className="mt-3 text-[12px] leading-relaxed text-subtle-foreground">
                    {panel.caption}
                  </p>
                </div>
              </Glass>
            </div>
          ))}
        </motion.div>

        <div className="mx-auto mt-8 h-[3px] w-40 overflow-hidden rounded-[999px] bg-border">
          <motion.div
            style={{ scaleX: p, transformOrigin: "left" }}
            className="h-full w-full rounded-[999px] bg-[var(--signal)]"
          />
        </div>
      </div>
    </section>
  );
}
