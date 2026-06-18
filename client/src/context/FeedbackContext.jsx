import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { FiCheckCircle, FiInfo, FiX, FiXCircle } from "react-icons/fi";
import { Modal } from "../components/Modal";

const FeedbackContext = createContext(null);

let idCounter = 0;

const toastStyles = {
  success: { icon: FiCheckCircle, cls: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100" },
  error: { icon: FiXCircle, cls: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-900/40 dark:text-rose-100" },
  info: { icon: FiInfo, cls: "border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" }
};

// App-wide feedback: toast notifications + promise-based confirm/prompt dialogs
// that replace the native window.alert / confirm / prompt pop-ups.
export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((toast) => toast.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const push = useCallback((message, type = "info", duration = 4000) => {
    const id = ++idCounter;
    setToasts((list) => [...list, { id, message, type }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const toast = useMemo(() => ({
    success: (message, duration) => push(message, "success", duration),
    error: (message, duration) => push(message, "error", duration ?? 6000),
    info: (message, duration) => push(message, "info", duration),
    show: push
  }), [push]);

  // Both return a Promise: confirm -> boolean, prompt -> string | null.
  const confirm = useCallback((options) => new Promise((resolve) => {
    setDialog({ kind: "confirm", confirmLabel: "Confirm", cancelLabel: "Cancel", ...options, resolve });
  }), []);

  const prompt = useCallback((options) => new Promise((resolve) => {
    setDialog({ kind: "prompt", confirmLabel: "Save", cancelLabel: "Cancel", ...options, resolve });
  }), []);

  const value = useMemo(() => ({ toast, confirm, prompt }), [toast, confirm, prompt]);

  const closeDialog = useCallback((result) => {
    setDialog((current) => {
      if (current) current.resolve(result);
      return null;
    });
  }, []);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-4">
        {toasts.map((item) => {
          const { icon: Icon, cls } = toastStyles[item.type] || toastStyles.info;
          return (
            <div key={item.id} className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-3 shadow-soft ${cls}`} role="status">
              <Icon className="mt-0.5 shrink-0 text-lg" />
              <p className="flex-1 text-sm font-medium">{item.message}</p>
              <button className="shrink-0 opacity-60 transition hover:opacity-100" aria-label="Dismiss" onClick={() => dismiss(item.id)}><FiX /></button>
            </div>
          );
        })}
      </div>
      {dialog && <DialogView dialog={dialog} onClose={closeDialog} />}
    </FeedbackContext.Provider>
  );
}

function DialogView({ dialog, onClose }) {
  const isPrompt = dialog.kind === "prompt";
  const [value, setValue] = useState(dialog.initialValue || "");
  const cancelResult = isPrompt ? null : false;

  function submit(event) {
    event.preventDefault();
    onClose(isPrompt ? value : true);
  }

  return (
    <Modal title={dialog.title || (isPrompt ? "Enter a value" : "Are you sure?")} onClose={() => onClose(cancelResult)}>
      <form className="grid gap-4" onSubmit={submit}>
        {dialog.message && <p className="text-sm text-slate-600 dark:text-slate-300">{dialog.message}</p>}
        {isPrompt && (
          <input
            autoFocus
            className="app-input"
            type={dialog.inputType || "text"}
            value={value}
            placeholder={dialog.placeholder || ""}
            onChange={(event) => setValue(event.target.value)}
            required
          />
        )}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={() => onClose(cancelResult)}>{dialog.cancelLabel}</button>
          <button type="submit" className={`btn-primary ${dialog.danger ? "bg-rose-600 hover:bg-rose-700 focus:ring-rose-100" : ""}`}>{dialog.confirmLabel}</button>
        </div>
      </form>
    </Modal>
  );
}

export const useToast = () => useContext(FeedbackContext).toast;
export const useConfirm = () => useContext(FeedbackContext).confirm;
export const usePrompt = () => useContext(FeedbackContext).prompt;
