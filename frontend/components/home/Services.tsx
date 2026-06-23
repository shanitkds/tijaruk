// @ts-nocheck
"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createScrollTriggerRefresh } from "../animation/scrollTriggerRefresh";
import { assets, serviceCards } from "../data";
import { SectionTag } from "../ui";

gsap.registerPlugin(ScrollTrigger);

const serviceCardPositions = [
  "left-0 top-[145px] translate-x-0 sm:left-[28px] sm:top-[80px] sm:translate-x-0 xl:left-[60px] xl:top-[250px]",
  "right-0 top-[145px] translate-x-0 sm:left-auto sm:right-[20px] sm:top-[80px] sm:translate-x-0 xl:left-[800px] xl:top-[250px] xl:right-auto",
  "left-1/2 top-[310px] -translate-x-1/2 sm:left-1/2 sm:top-[330px] sm:-translate-x-1/2 xl:left-[430px] xl:top-[575px] xl:translate-x-0",
  "left-0 top-[475px] translate-x-0 sm:left-[28px] sm:top-[580px] sm:translate-x-0 xl:left-[60px] xl:top-[930px]",
  "right-0 top-[475px] translate-x-0 sm:left-auto sm:right-[20px] sm:top-[580px] sm:translate-x-0 xl:left-[800px] xl:top-[930px] xl:right-auto",
  "left-1/2 top-[640px] -translate-x-1/2 sm:left-1/2 sm:top-[830px] sm:-translate-x-1/2 xl:left-[430px] xl:top-[1275px] xl:translate-x-0",
];

function AsteriskIcon({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="currentColor" strokeLinecap="round" strokeWidth="12">
        <path d="M50 6v88" />
        <path d="M6 50h88" />
        <path d="M18 18l64 64" />
        <path d="M82 18 18 82" />
      </g>
    </svg>
  );
}

const serviceCardCopy = {
  "01": ["Import & Export", "Solutions"],
  "02": ["Business Setup", "in KSA"],
  "03": ["Entrepreneur", "Development"],
  "04": ["Branding &", "Marketing"],
  "05": ["Business Setup", "in KSA"],
  "06": ["Global Product", "Marketing"],
};

const serviceCardAsteriskPositions = {
  "01": "right-[-6px] top-[-6px] size-[48px] sm:right-[-8px] sm:top-[-8px] sm:size-[86px] xl:right-[-10px] xl:top-[-10px] xl:size-[114px]",
  "02": "left-[-6px] top-[-6px] size-[48px] sm:left-[-8px] sm:top-[-8px] sm:size-[86px] xl:left-[-10px] xl:top-[-10px] xl:size-[114px]",
  "03": "right-[-6px] top-[-6px] size-[48px] sm:right-[-8px] sm:top-[-8px] sm:size-[86px] xl:right-[-10px] xl:top-[-10px] xl:size-[114px]",
  "04": "left-[-7px] bottom-[-7px] size-[52px] sm:left-[-10px] sm:bottom-[-10px] sm:size-[92px] xl:left-[-12px] xl:bottom-[-12px] xl:size-[124px]",
  "05": "right-[-7px] bottom-[-7px] size-[52px] sm:right-[-10px] sm:bottom-[-10px] sm:size-[92px] xl:right-[-12px] xl:bottom-[-12px] xl:size-[124px]",
  "06": "left-[-7px] bottom-[-7px] size-[52px] sm:left-[-10px] sm:bottom-[-10px] sm:size-[92px] xl:left-[-12px] xl:bottom-[-12px] xl:size-[124px]",
};

function ServiceCard({ id, positionClassName }) {
  const isLight = id === "03" || id === "06";
  const numberOnRight = id === "02" || id === "05";
  const lines = serviceCardCopy[id] ?? [id, ""];
  const asteriskClassName = serviceCardAsteriskPositions[id] ?? "right-0 top-0 size-[180px]";

  return (
    <article
      className={[
        "service-what-card absolute overflow-hidden rounded-none",
        positionClassName,
        "h-[clamp(126px,38vw,144px)] w-[clamp(132px,40vw,154px)] sm:h-[202px] sm:w-[268px] xl:h-[308px] xl:w-[346px]",
        isLight
          ? "bg-white text-black"
          : "bg-[#5f0c66] text-white",
      ].join(" ")}
    >
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute",
          asteriskClassName,
          isLight ? "text-[#efe9e4] opacity-45" : "text-[#8f0b9e] opacity-40",
        ].join(" ")}
      >
        <AsteriskIcon className="size-full" />
      </div>

      <span
        className={[
          "absolute top-3 font-ibrand text-[clamp(19px,5.4vw,22px)] font-semibold leading-none text-[#e39b4d] sm:top-5 sm:text-[38px] xl:top-7 xl:text-[54px]",
          numberOnRight
            ? "right-2.5 sm:right-5 xl:right-7"
            : "left-2.5 sm:left-5 xl:left-7",
        ].join(" ")}
      >
        {id}
      </span>

      <h3
        className={[
          "absolute left-1/2 top-[69%] w-[10.5ch] -translate-x-1/2 -translate-y-1/2 text-center font-ibrand font-semibold leading-[1.02] sm:top-[69%] xl:top-[71%]",
          isLight ? "text-black" : "text-white",
          "text-[clamp(0.66rem,2.9vw,0.78rem)] sm:text-[1.18rem] xl:text-[2rem] xl:leading-[1.04]",
        ].join(" ")}
      >
        <span className="block">{lines[0]}</span>
        <span className="block">{lines[1]}</span>
      </h3>
    </article>
  );
}

export default function Services() {
  const sectionRef = useRef(null);
  const introRef = useRef(null);
  const cardsTrackRef = useRef(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || !introRef.current || !cardsTrackRef.current) return;
    const section = sectionRef.current;
    const mm = gsap.matchMedia();
    let cleanupRefresh = () => {};

    const resetMobileLayout = () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === section) {
          trigger.kill();
        }
      });

      gsap.set([introRef.current, cardsTrackRef.current], {
        clearProps: "all",
      });
      ScrollTrigger.refresh();
    };

    mm.add("(max-width: 1023px)", () => {
      resetMobileLayout();
      return resetMobileLayout;
    });

    mm.add("(min-width: 1280px)", () => {
      const ctx = gsap.context(() => {
        const cardsTrack = cardsTrackRef.current;

        gsap.fromTo(
          introRef.current,
          { autoAlpha: 0, y: -36 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 78%",
              toggleActions: "play none none none",
            },
          }
        );

        const getScrollDistance = () => {
          const viewportHeight = cardsTrack.parentElement?.offsetHeight || window.innerHeight;
          const lastCard = cardsTrack.querySelector(".service-what-card:last-child");

          if (lastCard) {
            const lastCardCenterOffset = Math.max(
              160,
              (viewportHeight - lastCard.offsetHeight) * 0.5
            );

            const distance = Math.max(
              0,
              lastCard.offsetTop + lastCard.offsetHeight - viewportHeight + lastCardCenterOffset
            );

            return distance;
          }

          return Math.max(0, cardsTrack.scrollHeight - viewportHeight);
        };

        gsap.set(cardsTrack, {
          y: 0,
          willChange: "transform",
        });

        gsap.set(introRef.current, {
          willChange: "transform",
        });

        const pinnedScroll = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => `+=${getScrollDistance()}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        pinnedScroll
          .to(
            cardsTrack,
            {
              y: () => -getScrollDistance(),
              ease: "none",
            },
            0
          )
          .to(
            introRef.current,
            {
              y: () => -Math.min(320, window.innerHeight * 0.42),
              ease: "none",
            },
            0
          );

        ScrollTrigger.refresh();
      }, section);

      cleanupRefresh = createScrollTriggerRefresh(ScrollTrigger, section);

      return () => {
        cleanupRefresh();
        ctx.revert();
      };
    });

    return () => {
      cleanupRefresh();
      mm.revert();
    };
  }, []);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative isolate min-h-screen overflow-hidden bg-[#1f161d] xl:h-screen"
    >
      <Image
        alt=""
        className="absolute inset-0 size-full object-cover object-[center_72%]"
        fill
        loading="lazy"
        sizes="100vw"
        src={assets.servicesImage}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,10,16,0.42)_0%,rgba(22,13,19,0.36)_18%,rgba(16,10,15,0.42)_100%)]" />
      <div
        ref={introRef}
        className="absolute left-6 top-10 z-20 flex max-w-[300px] flex-col items-start text-left sm:left-[28px] sm:top-12 sm:max-w-[360px] xl:left-[60px] xl:top-14 xl:max-w-[430px]"
      >
        <SectionTag className="block text-left text-[1.32rem] normal-case tracking-normal text-[#e3a054] sm:text-[1.38rem] xl:text-[1.48rem]">
          What do We Do?
        </SectionTag>
        <h2 className="mt-3 font-ibrand text-[2.12rem] leading-[1.04] text-white sm:mt-4 sm:text-[2.2rem] xl:mt-4 xl:text-[2.55rem]">
          <span className="block whitespace-nowrap">We make trade and</span>
          <span className="mt-2 block whitespace-nowrap">business simple.</span>
        </h2>
      </div>

      <div className="relative mx-auto w-full max-w-[1440px] px-4 pb-12 pt-16 sm:px-6 xl:h-full xl:px-10 xl:pb-0 xl:pt-24">
        <div className="relative mx-auto w-full max-w-[680px] overflow-visible xl:h-[calc(100vh-96px)] xl:max-w-[1440px] xl:overflow-hidden">
          <div
            ref={cardsTrackRef}
            className="relative mx-auto h-[800px] w-full max-w-[340px] sm:h-[1060px] sm:max-w-[680px] xl:h-[1700px] xl:max-w-[1200px]"
          >
            {serviceCards.map((card, index) => (
              <ServiceCard key={card.id} id={card.id} positionClassName={serviceCardPositions[index]} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

