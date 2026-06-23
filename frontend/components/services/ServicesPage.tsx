// @ts-nocheck
"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";
import { createScrollTriggerRefresh } from "../animation/scrollTriggerRefresh";
import Footer from "../shares/Footer";
import Navbar from "../shares/Navbar";
import ServiceSection from "./ServiceSection";
import { servicesIntro, serviceSections } from "./servicesData";

gsap.registerPlugin(ScrollTrigger);

function ServicesHero() {
  return (
    <section className="px-4 pb-10 pt-8 sm:px-6 lg:px-10 lg:pb-14 lg:pt-8">
      <div className="mx-auto max-w-[1440px]">
        <Navbar />

        <div className="mx-auto mt-10 max-w-[1248px] text-center lg:mt-14">
          <div className="mx-auto inline-flex h-[54px] items-center justify-center rounded-[7px] border border-[#b3b3b3] px-5">
            <span className="font-ibrand text-[1.55rem] text-[#111111]">Our Services</span>
          </div>

          <h1 className="mx-auto mt-10 max-w-[660px] font-ibrand text-[2.25rem] leading-[0.95] text-[#141414] sm:text-[2.75rem] lg:text-[3.85rem]">
            <span className="block">Built for Your</span>
            <span className="block">Growth</span>
          </h1>

          <div className="mx-auto mt-10 max-w-[1248px] space-y-5 font-['Poppins',sans-serif] text-[15px] leading-7 text-[#5d5a5a] sm:text-[18px] sm:leading-[30px]">
            {servicesIntro.map((paragraph, index) => {
              if (index === 1) {
                const ending = "accelerate growth.";
                const intro = paragraph.replace(` ${ending}`, "");

                return (
                  <p key={paragraph}>
                    {intro}
                    <span className="block text-center whitespace-nowrap">{ending}</span>
                  </p>
                );
              }

              return <p key={paragraph}>{paragraph}</p>;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ServicesPage() {
  const stackRef = useRef(null);

  useLayoutEffect(() => {
    if (!stackRef.current) return;
    const stack = stackRef.current;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".service-stack-card", stack);
      const lastCard = cards[cards.length - 1];

      if (!cards.length) return;

      cards.forEach((card, index) => {
        gsap.set(card, {
          backfaceVisibility: "hidden",
          force3D: true,
          transformOrigin: "center top",
          willChange: "transform",
          zIndex: index + 1,
        });

        ScrollTrigger.create({
          anticipatePin: 1,
          end: "bottom top",
          endTrigger: lastCard,
          invalidateOnRefresh: true,
          pin: true,
          pinSpacing: index === cards.length - 1, // Only add gap for the last card to prevent footer overlap
          start: () =>
            card.offsetHeight > window.innerHeight ? "bottom bottom" : "top top",
          trigger: card,
        });

        if (index > 0) {
          // Fade out the previous card as the new one overlaps it
          // This hides shadows and unaligned borders, giving the impression of replaced "single cards"
          gsap.to(cards[index - 1], {
            opacity: 0,
            scrollTrigger: {
              trigger: card,
              start: "top 40%", // Starts fading out later to allow full view
              end: "top 10%",      // Fully faded out just before reaching the top
              scrub: true,
            },
          });
        }
      });
    }, stack);

    const cleanupRefresh = createScrollTriggerRefresh(ScrollTrigger);

    return () => {
      cleanupRefresh();
      ctx.revert();
    };
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f5f5] text-[#141414]">
      <ServicesHero />

      <section className="px-4 pb-16 sm:px-6 lg:px-10 lg:pb-24">
        <div ref={stackRef} className="mx-auto flex max-w-[1440px] flex-col">
          {serviceSections.map((service, index) => (
            <div
              key={service.id}
              className={`service-stack-card min-h-screen ${
                index !== serviceSections.length - 1 ? "mb-[100vh]" : ""
              }`}
            >
              <ServiceSection service={service} />
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}

