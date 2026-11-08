import { useEffect, useRef } from 'react';

interface UseFocusTrapOptions {
  isOpen: boolean;
  onClose: () => void;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Custom hook to trap focus within a modal/dialog container for WCAG 2.2 AA compliance:
 * - Traps Tab and Shift+Tab focus navigation within the modal boundary (SC 2.1.2 No Keyboard Trap)
 * - Listens for Escape key to dismiss the dialog (SC 2.1.1 Keyboard)
 * - Sets initial focus to the first interactive element or initialFocusRef
 * - Restores focus to the triggering element upon close (SC 2.4.3 Focus Order)
 */
export function useFocusTrap<T extends HTMLElement>({
  isOpen,
  onClose,
  initialFocusRef,
  returnFocusRef
}: UseFocusTrapOptions) {
  const containerRef = useRef<T | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element before opening
    previousActiveElement.current = document.activeElement as HTMLElement;
    const prevElement = previousActiveElement.current;
    const returnElement = returnFocusRef?.current;

    const container = containerRef.current;
    if (!container) return;

    // Set initial focus inside container after render
    const focusTimer = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else {
        const focusables = container.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length > 0) {
          focusables[0].focus();
        } else {
          container.focus();
        }
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusables = Array.from(
          container.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter(el => el.offsetParent !== null); // Filter visible elements

        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || document.activeElement === container) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);

      // Restore focus to return element or trigger
      if (returnElement) {
        returnElement.focus();
      } else if (prevElement && typeof prevElement.focus === 'function') {
        prevElement.focus();
      }
    };
  }, [isOpen, onClose, initialFocusRef, returnFocusRef]);

  return containerRef;
}
