// @ts-nocheck
"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createScrollTriggerRefresh } from "../animation/scrollTriggerRefresh";
import { assets, benefitCards } from "../data";
import { ArrowIcon, BenefitIcon } from "../ui";

gsap.registerPlugin(ScrollTrigger);

function BenefitCard({ title, icon, breakAfterAmp = false }) {
  const shouldSplit = breakAfterAmp && typeof title === "string" && title.includes(" & ");
  const titleLines = shouldSplit ? title.split(" & ") : null;

  return (
    <article className="relative h-[240px] w-[min(300px,calc(100vw-6.5rem))] shrink-0 overflow-hidden rounded-[21px] bg-white shadow-[0_20px_60px_rgba(26,15,44,0.12)] sm:h-[280px] sm:w-[360px]">
      <div className="absolute inset-0 opacity-[0.23]">
        <Image
          alt=""
          className="size-full object-cover"
          fill
          loading="lazy"
          sizes="(min-width: 640px) 360px, 90vw"
          src={assets.doodlePattern}
        />
      </div>

      <div className="relative flex h-full flex-col px-6 pb-6 pt-8 sm:px-8 sm:pb-8 sm:pt-10">
        <BenefitIcon type={icon} />
        <h3 className="mt-8 max-w-[16ch] font-ibrand text-[22px] font-medium leading-[29px] text-[#5f0c66] sm:mt-[42px] sm:text-[26px] sm:leading-[34px]">
          {shouldSplit ? (
            <>
              {titleLines[0]} &amp;
              <br />
              {titleLines[1]}
            </>
          ) : (
            title
          )}
        </h3>
      </div>
    </article>
  );
}

export default function Benefits() {
  const sectionRef = useRef(null);
  const panelRef = useRef(null);
  const trackRef = useRef(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || !panelRef.current) return;

    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const revealItems = gsap.utils.toArray("[data-benefit-reveal]", panel);
      const prefersReducedMotion = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      )?.matches;

      if (prefersReducedMotion) return;

      gsap.set([panel, ...revealItems], {
        force3D: true,
        willChange: "transform, opacity",
      });

      const scrollTrigger = {
        trigger: sectionRef.current,
        start: "top 80%",
        toggleActions: "play none none none",
      };

      gsap.fromTo(
        panel,
        { autoAlpha: 0, scale: 0.985, y: 28 },
        {
          autoAlpha: 1,
          duration: 1.05,
          ease: "power3.out",
          immediateRender: false,
          scale: 1,
          scrollTrigger,
          y: 0,
        }
      );

      gsap.fromTo(
        revealItems,
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          delay: 0.22,
          duration: 0.72,
          ease: "power3.out",
          immediateRender: false,
          scrollTrigger,
          stagger: 0.1,
          y: 0,
          onComplete: () => {
            gsap.set([panel, ...revealItems], { clearProps: "willChange" });
          },
        }
      );
    }, sectionRef);

    const cleanupRefresh = createScrollTriggerRefresh(ScrollTrigger, sectionRef.current);

    return () => {
      cleanupRefresh();
      ctx.revert();
    };
  }, []);

  const scrollOneCard = (direction) => {
    if (!trackRef.current) return;
    const firstCard = trackRef.current.querySelector("[data-benefit-card]");
    if (!firstCard) return;

    const gap = 17;
    const cardWidth = firstCard.getBoundingClientRect().width;
    const distance = cardWidth + gap;

    trackRef.current.scrollBy({
      left: direction * distance,
      behavior: "smooth",
    });
  };

  const showPrevious = () => {
    scrollOneCard(-1);
  };

  const showNext = () => {
    scrollOneCard(1);
  };

  return (
    <section
      ref={sectionRef}
      id="benefits"
      className="px-4 py-8 sm:px-6 sm:py-10 lg:px-0 lg:py-12"
    >
      <div
        ref={panelRef}
        className="relative mx-auto w-full max-w-[1320px] overflow-hidden rounded-[12px] bg-[#5f0c66] shadow-[0_30px_80px_rgba(68,7,82,0.25)]"
      >
        <div className="absolute inset-0 opacity-[0.05]">
          <Image
            alt=""
            className="size-full object-cover"
            fill
            loading="lazy"
            sizes="(min-width: 1024px) 1395px, 100vw"
            src={assets.doodlePattern}
          />
        </div>

        <div className="relative px-6 py-10 sm:px-10 sm:py-12 lg:px-[100px] lg:py-[72px]">
          <h2
            data-benefit-reveal
            className="max-w-[15ch] font-ibrand text-[2.2rem] font-semibold leading-[1.05] text-white sm:text-[2.75rem] lg:text-[52px] lg:leading-[58px]"
          >
            <span className="block whitespace-nowrap">We make trade and</span>
            <span className="mt-1 block whitespace-nowrap">business simple.</span>
          </h2>

          <div data-benefit-reveal className="mt-8 overflow-hidden lg:mt-[56px]">
            <div
              ref={trackRef}
              className="flex gap-[17px] overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {benefitCards.map((card) => (
                <div
                  key={card.title}
                  data-benefit-card
                  className="shrink-0"
                >
                  <BenefitCard {...card} />
                </div>
              ))}
            </div>
          </div>

          <div data-benefit-reveal className="mt-8 flex items-center justify-center gap-3 lg:mt-10">
            <button
              aria-label="Previous"
              className="flex size-[56px] items-center justify-center rounded-full bg-white text-[#5f0c66] transition hover:bg-[#f4dcb8]"
              onClick={showPrevious}
              type="button"
            >
              <ArrowIcon className="size-[18px] rotate-180" />
            </button>
            <button
              aria-label="Next"
              className="flex size-[56px] items-center justify-center rounded-full bg-white text-[#5f0c66] transition hover:bg-[#f4dcb8]"
              onClick={showNext}
              type="button"
            >
              <ArrowIcon className="size-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

