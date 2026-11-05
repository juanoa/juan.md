import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { ArrowUpRightIcon } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

interface Props {
  name: string;
  logo: string;
  href: string;
  variant: "light" | "dark";
}

interface IconAnimation {
  direction: number;
  reduceMotion: boolean;
}

const iconVariants: Variants = {
  initial: ({ direction, reduceMotion }: IconAnimation) => ({
    opacity: 0,
    transform: `translateY(${reduceMotion ? 0 : direction * 150}%)`,
  }),
  visible: { opacity: 1, transform: "translateY(0%)" },
  exit: ({ direction, reduceMotion }: IconAnimation) => ({
    opacity: 0,
    transform: `translateY(${reduceMotion ? 0 : direction * -150}%)`,
  }),
};

export function CompanyPill({ name, logo, href, variant }: Props) {
  const [hovered, setHovered] = useState(false);
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const reduceMotion = useReducedMotion();
  const showArrow = hovered || keyboardFocused;
  const animation: IconAnimation = {
    direction: showArrow ? 1 : -1,
    reduceMotion: Boolean(reduceMotion) || keyboardFocused,
  };

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${name} (opens in a new tab)`}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onFocus={(event) =>
        setKeyboardFocused(event.currentTarget.matches(":focus-visible"))
      }
      onBlur={() => setKeyboardFocused(false)}
      className={cn(
        "not-prose focus-visible:ring-ring focus-visible:ring-offset-background relative -top-0.5 inline-flex h-6 items-center gap-1.5 rounded-full py-0.5 pr-2 pl-0.5 align-middle text-sm leading-none whitespace-nowrap no-underline outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        variant === "light"
          ? "bg-neutral-200 text-black"
          : "bg-neutral-700 text-white",
      )}
    >
      <span
        className={cn(
          "relative flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full",
          variant === "light" ? "bg-black text-white" : "bg-white text-black",
        )}
        aria-hidden="true"
      >
        <AnimatePresence initial={false} custom={animation}>
          <motion.span
            key={showArrow ? "arrow" : "logo"}
            custom={animation}
            variants={iconVariants}
            initial="initial"
            animate="visible"
            exit="exit"
            transition={{
              duration: keyboardFocused ? 0 : 0.2,
              ease: [0.19, 1, 0.22, 1],
            }}
            className="absolute flex size-3.5 items-center justify-center"
          >
            {showArrow ? (
              <ArrowUpRightIcon size={14} weight="bold" />
            ) : (
              <img
                src={logo}
                alt=""
                width={14}
                height={14}
                className="size-3.5 object-contain"
              />
            )}
          </motion.span>
        </AnimatePresence>
      </span>
      <span>{name}</span>
    </motion.a>
  );
}
