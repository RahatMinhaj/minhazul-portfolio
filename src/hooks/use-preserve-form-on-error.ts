"use client";

import { useEffect, useRef } from "react";

export function usePreserveFormOnError(
  shouldRestore: boolean,
  submissionResult: unknown,
) {
  const restoreSubmittedValues = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (shouldRestore) restoreSubmittedValues.current?.();
  }, [shouldRestore, submissionResult]);

  return (form: HTMLFormElement) => {
    restoreSubmittedValues.current = captureFormValues(form);
  };
}

function captureFormValues(form: HTMLFormElement) {
  const controls = Array.from(form.elements).flatMap((control) => {
    if (control instanceof HTMLInputElement) {
      if (control.type === "file") return [];
      const value = control.value;
      const checked = control.checked;
      return [
        () => {
          control.value = value;
          control.checked = checked;
        },
      ];
    }

    if (control instanceof HTMLTextAreaElement) {
      const value = control.value;
      return [
        () => {
          control.value = value;
        },
      ];
    }

    if (control instanceof HTMLSelectElement) {
      const selected = Array.from(control.options, (option) => option.selected);
      return [
        () => {
          Array.from(control.options).forEach((option, index) => {
            option.selected = selected[index] ?? false;
          });
        },
      ];
    }

    return [];
  });

  return () => controls.forEach((restore) => restore());
}
