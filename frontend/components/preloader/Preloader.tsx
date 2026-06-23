// @ts-nocheck
"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export default function Preloader() {
  const pathname = usePathname();
  const hideTimerRef = useRef(null);
  const removeTimerRef = useRef(null);
  const [isHidden, setIsHidden] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  const clearPreloaderTimers = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }

    if (removeTimerRef.current) {
      window.clearTimeout(removeTimerRef.current);
    }
  }, []);

  const scheduleHide = useCallback(
    (delay = 950) => {
      clearPreloaderTimers();

      hideTimerRef.current = window.setTimeout(() => {
        setIsHidden(true);
      }, delay);

      removeTimerRef.current = window.setTimeout(() => {
        setIsRemoved(true);
      }, delay + 320);
    },
    [clearPreloaderTimers]
  );

  const startPreloader = useCallback(
    ({ autoHide = true, hideDelay = 950 } = {}) => {
      clearPreloaderTimers();

      setIsHidden(false);
      setIsRemoved(false);

      if (autoHide) {
        scheduleHide(hideDelay);
      }
    },
    [clearPreloaderTimers, scheduleHide]
  );


  useEffect(() => {
    startPreloader();

    return () => {
      clearPreloaderTimers();
    };
  }, [clearPreloaderTimers, startPreloader]);

  if (isRemoved) {
    return null;
  }

  return (
    <div
      aria-label="Loading Tijaruk"
      aria-hidden={isHidden}
      className={`fixed inset-0 z-[2147483647] flex items-center justify-center bg-[#5f0c66] transition-opacity duration-300 ${
        isHidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
    >
      <div className="flex -translate-y-1 flex-col items-center">
        <div className="h-[56px] w-[146px] sm:h-[60px] sm:w-[156px]">
          <img
            alt="Tijaruk"
            className="size-full object-fill"
            decoding="async"
            loading="lazy"
            src="/tijaruk-logo.svg"
          />
        </div>
        <span className="mt-3 h-2 w-[146px] overflow-hidden rounded-full bg-[#e39b4d]/20 sm:w-[156px]">
          <span className="block h-full origin-left animate-[preloader-line_1.05s_ease-out_forwards] rounded-full bg-[#e39b4d]" />
        </span>
      </div>
    </div>
  );
}

