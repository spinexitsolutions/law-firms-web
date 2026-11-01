"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-x-0 bottom-0 top-10 z-50 flex flex-col overflow-hidden rounded-t-[28px] bg-[#fbfbfd] shadow-2xl sm:inset-y-3 sm:left-auto sm:right-3 sm:top-3 sm:w-[600px] sm:rounded-[24px]"
            initial={{ x: 0, y: "100%" }}
            animate={{ x: 0, y: 0 }}
            exit={{ x: 0, y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] bg-white/70 px-5 py-4 backdrop-blur-xl sm:px-6">
              <div className="min-w-0">
                <h2 className="truncate text-[19px] font-semibold tracking-tight text-[#1d1d1f]">{title}</h2>
                {subtitle && <div className="mt-0.5 text-[13px] text-black/45">{subtitle}</div>}
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid size-8 shrink-0 place-items-center rounded-full bg-black/[0.05] hover:bg-black/10"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
            {footer && (
              <div className="flex items-center justify-between gap-2 border-t border-black/[0.06] bg-white/80 px-5 py-3 backdrop-blur-xl sm:px-6">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
