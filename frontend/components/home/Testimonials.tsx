// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { assets, testimonials } from "../data";
import { ArrowIcon, SectionTag, StarIcon } from "../ui";

function TestimonialCard({ name, role, quote, className = "" }) {
  return (
    <article
      className={`relative overflow-hidden rounded-[22px] border border-white/25 bg-[#5f0c66] px-5 py-5 text-center text-white shadow-[0_20px_55px_rgba(88,8,97,0.18)] sm:px-7 sm:py-8 ${className}`}
    >
      <div className="absolute inset-0 opacity-[0.04]">
        <img
          alt=""
          className="size-full object-cover"
          decoding="async"
          loading="lazy"
          src="/sourcing/rfq-pattern.webp"
        />
      </div>

      <div className="relative flex h-full flex-col items-center justify-center sm:justify-start">
        <Image
          alt={name}
          className="mb-3 size-[48px] rounded-full border border-white/40 object-cover sm:mb-4 sm:size-[58px]"
          height={58}
          sizes="58px"
          src={assets.testimonialAvatar}
          width={58}
        loading="lazy" />
        <h3 className="min-h-[2rem] font-['Manrope',sans-serif] text-[0.95rem] font-bold leading-tight text-white sm:min-h-[2.5rem] sm:text-[1.05rem]">
          {name}
        </h3>
        <p className="mt-1 min-h-[1rem] text-[10px] text-white/75 sm:mt-2 sm:text-[11px]">{role}</p>

        <div className="mt-3 flex min-h-[1.25rem] items-center gap-1 text-[#f0b34f] sm:mt-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <StarIcon key={index} />
          ))}
          <span className="ml-2 text-xs font-semibold text-white">5.0</span>
        </div>

        <p className="mt-3 text-[10px] leading-[17px] text-white/80 sm:mt-5 sm:min-h-[8.75rem] sm:text-[11px] sm:leading-5">{quote}</p>
      </div>
    </article>
  );
}

export default function Testimonials() {
  const sectionRef = useRef(null);
  const swipeStartXRef = useRef(0);
  const touchStartXRef = useRef(0);
  const wheelLockUntilRef = useRef(0);
  const motionTimerRef = useRef(null);
  const [desktopOrder, setDesktopOrder] = useState([0, 1, 2]);
  const [isMoving, setIsMoving] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    return () => {
      if (motionTimerRef.current) {
        window.clearTimeout(motionTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateLayoutMode = () => setIsCompact(mediaQuery.matches);

    updateLayoutMode();
    mediaQuery.addEventListener("change", updateLayoutMode);

    return () => {
      mediaQuery.removeEventListener("change", updateLayoutMode);
    };
  }, []);

  const rotateTestimonials = (direction) => {
    setIsMoving(true);
    setDesktopOrder((prev) =>
      direction === "next" ? [prev[1], prev[2], prev[0]] : [prev[2], prev[0], prev[1]]
    );

    if (motionTimerRef.current) {
      window.clearTimeout(motionTimerRef.current);
    }

    motionTimerRef.current = window.setTimeout(() => {
      setIsMoving(false);
    }, 720);
  };

  const rotateRight = () => {
    rotateTestimonials("next");
  };

  const rotateLeft = () => {
    rotateTestimonials("previous");
  };

  const stopCarouselButtonSwipe = (event) => {
    event.stopPropagation();
  };

  const handlePreviousClick = (event) => {
    event.stopPropagation();
    rotateLeft();
  };

  const handleNextClick = (event) => {
    event.stopPropagation();
    rotateRight();
  };

  const handlePointerDown = (event) => {
    if (event.currentTarget?.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    swipeStartXRef.current = event.clientX;
  };

  const handlePointerUp = (event) => {
    const deltaX = event.clientX - swipeStartXRef.current;
    if (Math.abs(deltaX) < 50) return;
    if (deltaX > 0) {
      rotateRight();
      return;
    }
    rotateLeft();
  };

  const handleTouchStart = (event) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? 0;
  };

  const handleTouchEnd = (event) => {
    const touchEndX = event.changedTouches[0]?.clientX ?? 0;
    const deltaX = touchEndX - touchStartXRef.current;
    if (Math.abs(deltaX) < 40) return;
    if (deltaX > 0) {
      rotateRight();
      return;
    }
    rotateLeft();
  };

  const handleWheel = (event) => {
    const hasHorizontalInput = Math.abs(event.deltaX) > 4;
    const hasShiftHorizontalInput = event.shiftKey && Math.abs(event.deltaY) > 4;
    if (!hasHorizontalInput && !hasShiftHorizontalInput) return;

    event.preventDefault();
    event.stopPropagation();

    const horizontalDelta = hasHorizontalInput ? event.deltaX : event.deltaY;
    const now = Date.now();
    if (now < wheelLockUntilRef.current) return;
    wheelLockUntilRef.current = now + 420;

    if (horizontalDelta > 0) {
      rotateRight();
      return;
    }
    rotateLeft();
  };

  return (
    <section
      ref={sectionRef}
      className="overflow-hidden bg-white py-14 sm:py-16 lg:py-16"
    >
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-10">
        <SectionTag className="relative z-20 !text-[#6b1178] normal-case tracking-normal">
          <span className="font-['Manrope',sans-serif] text-lg font-extrabold sm:text-[1.2rem]">
            Testimonials
          </span>
        </SectionTag>

        <div className="relative z-20 mx-auto mt-6 max-w-[42rem] text-center">
          <h2 className="font-['ibrand',sans-serif] text-[2.25rem] font-semibold leading-tight text-[#6b1178] sm:text-[2.5rem]">
            What Our Clients Say
          </h2>
          <p className="mx-auto mt-4 max-w-[34rem] font-['Poppins',sans-serif] text-[1rem] leading-6 text-[#111111] sm:text-[1.02rem]">
            Our customers are at the heart of everything we do. Here&apos;s what they have to say
            about their experience with our roofing services.
          </p>
        </div>

        <div
          className="relative mt-8 h-[410px] select-none touch-pan-y overscroll-x-contain sm:h-[470px] md:mt-12 md:h-[460px] lg:h-[500px]"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          <button
            aria-label="Previous testimonial"
            className="absolute bottom-5 left-1/2 z-30 flex size-12 -translate-x-[calc(100%+8px)] items-center justify-center rounded-full bg-[#5f0c66] text-white shadow-[0_14px_30px_rgba(95,12,102,0.22)] transition hover:bg-[#7a0c82] md:bottom-auto md:left-0 md:top-[39%] md:-translate-x-0 md:-translate-y-1/2"
            onClick={handlePreviousClick}
            onPointerDown={stopCarouselButtonSwipe}
            onPointerUp={stopCarouselButtonSwipe}
            onTouchEnd={stopCarouselButtonSwipe}
            onTouchStart={stopCarouselButtonSwipe}
            type="button"
          >
            <ArrowIcon className="size-4 rotate-180" />
          </button>

          <button
            aria-label="Next testimonial"
            className="absolute bottom-5 left-1/2 z-30 flex size-12 translate-x-2 items-center justify-center rounded-full bg-[#5f0c66] text-white shadow-[0_14px_30px_rgba(95,12,102,0.22)] transition hover:bg-[#7a0c82] md:bottom-auto md:left-auto md:right-0 md:top-[39%] md:translate-x-0 md:-translate-y-1/2"
            onClick={handleNextClick}
            onPointerDown={stopCarouselButtonSwipe}
            onPointerUp={stopCarouselButtonSwipe}
            onTouchEnd={stopCarouselButtonSwipe}
            onTouchStart={stopCarouselButtonSwipe}
            type="button"
          >
            <ArrowIcon className="size-4" />
          </button>

          {testimonials.slice(0, 3).map((testimonial, idx) => {
            const slots = isCompact
              ? [
                  {
                    translate: "-34%",
                    y: 22,
                    scale: 0.88,
                    z: 7,
                    opacity: 0.92,
                    height: 318,
                  },
                  {
                    translate: "0%",
                    y: 0,
                    scale: 0.96,
                    z: 14,
                    opacity: 1,
                    height: 348,
                  },
                  {
                    translate: "34%",
                    y: 22,
                    scale: 0.88,
                    z: 7,
                    opacity: 0.92,
                    height: 318,
                  },
                ]
              : [
                  {
                    translate: "-54%",
                    y: 0,
                    scale: 0.94,
                    z: 7,
                    opacity: 0.96,
                    height: 382,
                  },
                  {
                    translate: "0%",
                    y: 0,
                    scale: 1.04,
                    z: 14,
                    opacity: 1,
                    height: 388,
                  },
                  {
                    translate: "60%",
                    y: 0,
                    scale: 0.94,
                    z: 7,
                    opacity: 0.96,
                    height: 382,
                  },
                ];
            const slotIndex = desktopOrder.indexOf(idx);
            const slot = slots[slotIndex];
            return (
              <div
                key={testimonial.name}
                className="absolute left-1/2 top-0 w-[62vw] min-w-[190px] max-w-[260px] sm:w-[54vw] sm:max-w-[320px] md:w-[300px] lg:w-[320px]"
                style={{
                  filter: isMoving ? "blur(0.2px)" : "blur(0px)",
                  transform: `translateX(-50%) translateX(${slot.translate}) translateY(${slot.y}px) scale(${slot.scale})`,
                  transition:
                    "transform 720ms cubic-bezier(0.22, 1, 0.36, 1), opacity 720ms ease, filter 720ms ease, height 720ms cubic-bezier(0.22, 1, 0.36, 1)",
                  opacity: slot.opacity,
                  zIndex: slot.z,
                  height: `${slot.height}px`,
                  willChange: "transform, opacity, filter, height",
                }}
              >
                <TestimonialCard {...testimonial} className="h-full w-full" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

