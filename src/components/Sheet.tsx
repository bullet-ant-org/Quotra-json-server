import { useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { useScrollLock } from "../lib/useScrollLock";

// Bottom sheet on phones (drag the handle down to close), floating panel on desktop.
export function Sheet({ title, onClose, children, tall = false }: { title?: string; onClose: () => void; children: ReactNode; tall?: boolean }) {
  useScrollLock();
  const y0 = useRef(0);
  return createPortal(
    <motion.div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} style={{ touchAction: "none" }}>
      <motion.div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
        initial={{ y: 400 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 380, damping: 36 }}
        drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.6 }} onDragStart={(_, i) => (y0.current = i.point.y)} onDragEnd={(_, i) => i.offset.y > 120 && onClose()}
        className={`flex w-full max-w-lg flex-col overflow-hidden rounded-t-[1.75rem] bg-bg shadow-2xl sm:rounded-[1.75rem] ${tall ? "h-[85dvh] sm:h-[80dvh]" : "max-h-[85dvh]"}`} style={{ touchAction: "pan-y" }}>
        <div className="flex shrink-0 cursor-grab flex-col items-center pt-2.5"><span className="h-1.5 w-10 rounded-full bg-line" /></div>
        {title && <h2 className="shrink-0 border-b border-line py-3 text-center font-display font-bold">{title}</h2>}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" onPointerDownCapture={(e) => e.stopPropagation()}>{children}</div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
