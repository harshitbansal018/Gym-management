import { useEffect } from "react";
import { FiX } from "react-icons/fi";

// Accessible, reusable modal. Click the backdrop or press Escape to close
// (disabled while a save is in flight so users can't dismiss mid-request).
export function Modal({ title, onClose, locked = false, children }) {
  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape" && !locked) onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, locked]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={() => !locked && onClose()}
    >
      <div
        className="surface w-full max-w-lg p-6"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h2>
          <button className="btn-secondary px-2" aria-label="Close" onClick={onClose} disabled={locked}>
            <FiX />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
