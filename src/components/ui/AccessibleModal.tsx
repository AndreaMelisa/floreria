"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidthClass = "max-w-xl",
}: AccessibleModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const titleId = React.useId();
  const descId = React.useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const focusTimer = setTimeout(() => {
      if (!dialogRef.current) return;
      // Si el usuario ya tiene el foco dentro del modal, no moverlo
      if (dialogRef.current.contains(document.activeElement)) return;

      // Priorizar el primer campo o control dentro del contenido del modal
      const contentFocusable = contentRef.current?.querySelectorAll<HTMLElement>(
        'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      );
      if (contentFocusable && contentFocusable.length > 0) {
        contentFocusable[0].focus();
        return;
      }

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        dialogRef.current.focus();
      }
    }, 10);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      if (
        previousFocusRef.current &&
        typeof previousFocusRef.current.focus === "function"
      ) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCloseRef.current();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={`relative max-h-[90vh] w-full ${maxWidthClass} overflow-y-auto rounded-2xl border-2 border-cream-border bg-cream-ivory p-6 text-charcoal shadow-2xl focus:outline-none`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-cream-border pb-4">
          <div>
            <h2 id={titleId} className="font-serif text-xl font-bold text-charcoal">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1 text-sm text-charcoal-muted">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onCloseRef.current()}
            aria-label="Cerrar ventana modal"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-cream-border bg-cream text-charcoal transition hover:bg-rose-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rose-deep"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div ref={contentRef} className="mt-5">
          {children}
        </div>
      </div>
    </div>
  );
}
