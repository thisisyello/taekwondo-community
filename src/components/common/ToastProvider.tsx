import { useCallback, useRef, useState } from "react";
import type { ReactNode } from "react";
import { FiInfo } from "react-icons/fi";
import { ToastContext } from "../../hooks/useToast";

type Toast = {
    id: number;
    message: string;
};

export default function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<Toast | null>(null);
    const activeToast = useRef<Toast | null>(null);
    const nextId = useRef(0);

    const showToast = useCallback((message: string) => {
        if (activeToast.current?.message === message) return;

        const nextToast = { id: ++nextId.current, message };
        activeToast.current = nextToast;
        setToast(nextToast);
    }, []);

    const dismissToast = (id: number) => {
        if (activeToast.current?.id !== id) return;

        activeToast.current = null;
        setToast(null);
    };

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
            >
                {toast && (
                    <div
                        key={toast.id}
                        className="app-toast flex max-w-md items-center gap-2 rounded-kta-md bg-kta-text px-4 py-3 text-sm font-semibold text-white shadow-kta-md"
                        onAnimationEnd={() => dismissToast(toast.id)}
                    >
                        <FiInfo aria-hidden="true" className="shrink-0 text-lg" />
                        <span>{toast.message}</span>
                    </div>
                )}
            </div>
        </ToastContext.Provider>
    );
}
