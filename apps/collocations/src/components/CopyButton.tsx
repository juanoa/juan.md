"use client";

import * as React from "react";

import { CheckIcon, CopyIcon } from "@juan/ui/icons/phosphor";
import { AnimatePresence, motion } from "motion/react";

interface CopyButtonProps {
  text: string;
}

const variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1 },
};

const transition = {
  duration: 0.2,
};

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const copy = React.useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
  }, [text]);

  React.useEffect(() => {
    if (!copied) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopied(false);
    }, 1500);

    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  return (
    <button
      type="button"
      aria-label={`Copy "${text}" to clipboard`}
      onClick={copy}>
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="checkmark"
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={transition}>
            <CheckIcon
              size={20}
              className="text-muted-foreground mt-1 opacity-0 transition-opacity group-hover:opacity-100"
            />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={transition}>
            <CopyIcon
              size={20}
              className="text-muted-foreground mt-2 opacity-0 transition-opacity group-hover:opacity-100"
            />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
