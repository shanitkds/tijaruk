// @ts-nocheck
"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { assets } from "../data";
import { ArrowIcon, SectionTag } from "../ui";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Animate Image
      gsap.fromTo(
        imageRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1.8, // Slower animation
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 50%", // Triggers at halfway point
            once: true,
          },
        }
      );

      // Animate Content
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1.8, // Slower animation
          delay: 0.3,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 50%", // Triggers at halfway point
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="about" className="bg-[#f7f3ef] py-10 sm:py-10 lg:py-12 xl:h-screen xl:py-0">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(320px,0.88fr)_minmax(0,1fr)] lg:items-center xl:h-screen lg:gap-8 lg:px-10">
        <div>
          <SectionTag className="-translate-y-2 flex items-center gap-4 font-ibrand !text-[2.05rem] font-medium normal-case tracking-[0.04em] !text-[#5f0c66] sm:!text-[1.95rem] lg:!text-[2.05rem]">
            <span className="size-[14px] rounded-full bg-[#5f0c66] sm:size-4" />
            <span className="translate-x-4">About Tijaruk</span>
          </SectionTag>
          <div ref={imageRef} className="mt-4 overflow-hidden rounded-[12px] shadow-[0_24px_55px_rgba(0,0,0,0.12)] lg:max-w-[520px]">
            <Image
              alt="Team working together"
              className="h-[410px] w-full object-cover"
              height={410}
              sizes="(max-width: 1024px) 100vw, 520px"
              src={assets.aboutImage}
              width={520}
              loading="lazy" />
          </div>
        </div>

        <div ref={contentRef} className="flex w-full max-w-[620px] flex-col items-start justify-center lg:justify-self-start">
          <h2 className="w-full font-ibrand text-[2.22rem] font-medium leading-[1.1] text-[#333333] sm:text-[2.55rem] lg:text-[2.9rem]">
            <span className="block">Trade and Growth,</span>
            <span className="mt-2 block">Handled with Precision.</span>
          </h2>
          <div className="mt-5 w-full max-w-[34rem] font-['Poppins',sans-serif] text-[15.5px] leading-8 text-[#696969] sm:text-[15px] sm:leading-8 lg:max-w-none">
            <p>
              Tijaruk connects businesses in Saudi Arabia to global markets
              <br className="hidden sm:block" /> through structured sourcing and reliable trade execution. We
              <br className="hidden sm:block" /> work closely with suppliers and partners to ensure operations
              <br className="hidden sm:block" /> remain clear and controlled.
            </p>
            <p className="mt-4 sm:mt-0">
              We focus on enabling consistent market access and long-term
              <br className="hidden sm:block" /> expansion, building a dependable link between Saudi Arabia and
              <br className="hidden sm:block" /> international trade.
            </p>
          </div>
          <a
            className="mt-5 inline-flex items-center gap-3 self-start rounded-md bg-[#5f0c66] px-9 py-4 font-['Poppins',sans-serif] text-base font-semibold text-white transition hover:bg-[#7a0c82]"
            href="/about"
          >
            Learn More
            <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  );
}

