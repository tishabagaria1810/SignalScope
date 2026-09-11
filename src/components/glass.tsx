import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { HTMLAttributes, MouseEvent, ReactNode } from "react";
import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

/** Tracks the cursor and exposes it to the glass sheen via CSS vars. */
function useSheen<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  const onMouseMove = useCallback((event: MouseEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
    el.style.setProperty("--sheen", "0.95");
  }, []);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--sheen", "0.5");
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}

interface GlassProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  refract?: boolean | undefined;
  pill?: boolean | undefined;
}

export function Glass({ className, children, refract, pill, ...rest }: GlassProps) {
  const sheen = useSheen<HTMLDivElement>();
  return (
    <div
      {...rest}
      ref={sheen.ref}
      onMouseMove={sheen.onMouseMove}
      onMouseLeave={sheen.onMouseLeave}
      className={cn(
        "glass-surface",
        refract && "glass-refract",
        pill ? "rounded-[999px]" : "rounded-3xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Glass panel with a restrained 3D tilt toward the cursor. */
export function TiltGlass({
  className,
  children,
  strength = 6,
  refract,
}: {
  className?: string | undefined;
  children?: ReactNode | undefined;
  strength?: number | undefined;
  refract?: boolean | undefined;
}) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [strength, -strength]), {
    stiffness: 240,
    damping: 23,
  });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-strength, strength]), {
    stiffness: 240,
    damping: 23,
  });

  return (
    <motion.div
      style={{ perspective: 1200 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - rect.left) / rect.width - 0.5);
        py.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseLeave={() => {
        px.set(0);
        py.set(0);
      }}
      className={className}
    >
      <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}>
        <Glass refract={refract ?? false} className="h-full w-full">
          {children}
        </Glass>
      </motion.div>
    </motion.div>
  );
}

/** Pill CTA with a magnetic pull toward the pointer. */
export function MagneticButton({
  children,
  className,
  onClick,
  tone = "primary",
  type = "button",
  disabled,
}: {
  children: ReactNode;
  className?: string | undefined;
  onClick?: (() => void) | undefined;
  tone?: "primary" | "ghost" | undefined;
  type?: "button" | "submit" | undefined;
  disabled?: boolean | undefined;
}) {
  const x = useSpring(0, { stiffness: 240, damping: 23 });
  const y = useSpring(0, { stiffness: 240, damping: 23 });

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{ x, y }}
      whileTap={{ scale: 0.97 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(((e.clientX - rect.left) / rect.width - 0.5) * 14);
        y.set(((e.clientY - rect.top) / rect.height - 0.5) * 10);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-[999px] px-6 py-3 text-[15px] font-medium tracking-tight transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        tone === "primary"
          ? "bg-primary text-primary-foreground shadow-[0_16px_40px_-18px_var(--signal)] hover:opacity-90"
          : "glass-surface text-foreground hover:text-foreground",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <span
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.22em] text-subtle-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
