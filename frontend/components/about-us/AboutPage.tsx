// @ts-nocheck
"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createScrollTriggerRefresh } from "../animation/scrollTriggerRefresh";
import CoreValuesAccordion from "./CoreValuesAccordion";
import Footer from "../shares/Footer";
import Navbar from "../shares/Navbar";
import {
  aboutHero,
  coreValues,
  missionVision,
  whoWeAre,
  whyWeExist,
} from "./aboutData";

gsap.registerPlugin(ScrollTrigger);

function SectionEyebrow({ children, className = "" }) {
  return (
    <p className={`font-['Poppins',sans-serif] text-sm font-semibold normal-case tracking-normal text-[#e39b4d] sm:text-base ${className}`}>
      {children}
    </p>
  );
}

function RemoteImage({
  alt,
  className = "",
  revealGroup = "who",
  revealOrder,
  src,
  priority = false,
}) {
  const frameRevealProps = revealOrder
    ? {
        "data-reveal-order": revealOrder,
        [`data-${revealGroup}-frame`]: "",
      }
    : {};

  const imageRevealProps = revealOrder
    ? {
        "data-reveal-order": revealOrder,
        [`data-${revealGroup}-image`]: "",
      }
    : {};

  return (
    <div
      data-revealed={revealOrder ? "false" : "true"}
      {...frameRevealProps}
      className={`relative overflow-hidden rounded-[14px] shadow-none data-[revealed=true]:shadow-[0_24px_60px_rgba(34,0,37,0.12)] ${
        revealOrder ? "opacity-0" : ""
      } ${className}`}
    >
      <div {...imageRevealProps} className="absolute inset-0">
        <Image
          alt={alt}
          className="object-cover"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 33vw"
           loading="lazy"
          src={src}
        />
      </div>
    </div>
  );
}

function ValueCard({ image, title }) {
  return (
    <article className="overflow-hidden rounded-[10px] border border-[#d8d3cf] bg-white shadow-[0_16px_40px_rgba(37,16,44,0.06)]">
      <div className="h-32 overflow-hidden sm:h-44">
        <Image
          alt={title}
          className="h-full w-full object-cover"
          height={176}
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          src={image}
          width={420}
        loading="lazy" />
      </div>
      <div className="flex min-h-[78px] items-center justify-center px-4 py-4 text-center sm:min-h-[108px] sm:px-5 sm:py-6">
        <h3 className="font-ibrand text-[1.32rem] leading-[1.05] text-[#161616] sm:text-[1.7rem]">
          {title}
        </h3>
      </div>
    </article>
  );
}

function PlatformSnapshot() {
  return (
    <div className="relative h-[342px] w-[378px] max-w-full">
      <Image
        alt="Tijaruk platform dashboard mockup"
        className="object-contain"
        fill
        loading="lazy"
        sizes="378px"
        src="/about/tijaruk-mockup.webp"
      />
    </div>
  );
}

function SupportInfoSection() {
  const cards = [
    "xl:left-10 xl:top-4",
    "xl:right-10 xl:top-4",
    "xl:bottom-24 xl:left-10",
    "xl:bottom-24 xl:right-10",
  ];

  return (
    <section className="bg-white pb-16 pt-4 sm:py-20 xl:pb-0 xl:pt-8">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-4 sm:px-6 md:grid-cols-2 md:gap-x-8 md:gap-y-10 xl:relative xl:h-[1000px] xl:grid-cols-none xl:px-10">
        {cards.map((positionClass, index) => (
          <article
            key={index}
            className={`max-w-[469px] xl:absolute xl:w-[469px] xl:max-w-[469px] ${positionClass}`}
          >
            <h2 className="font-['Poppins',sans-serif] text-[26px] font-semibold leading-[24px] text-[#e39b4d] sm:text-[31px]">
              Who We Are
            </h2>
            <div className="mt-[27px] space-y-3 font-['Roboto',sans-serif] text-[17px] leading-[25px] text-[#666] sm:text-[19px] sm:leading-[27px]">
              <p>
                Tijaruk is built to simplify how businesses connect across
                trade. We bring buyers and suppliers together through a
                structured platform that removes friction and creates direct,
                reliable access to global markets.
              </p>
              <p>
                By combining sourcing, pricing clarity, and supplier
                verification into one system, we eliminated opportunities turn
                into real, scalable business.
              </p>
            </div>
          </article>
        ))}

        <div className="order-first flex items-center justify-center md:col-span-2 xl:absolute xl:left-1/2 xl:top-[326px] xl:order-none xl:w-[378px] xl:-translate-x-1/2">
          <PlatformSnapshot />
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  const coreValuesMobileRef = useRef(null);
  const whoImagesRef = useRef(null);
  const whoSectionRef = useRef(null);
  const missionVisionRef = useRef(null);
  const whyHeadingRef = useRef(null);
  const whySectionRef = useRef(null);

  useLayoutEffect(() => {
    if (
      !coreValuesMobileRef.current ||
      !whoImagesRef.current ||
      !whoSectionRef.current ||
      !missionVisionRef.current ||
      !whyHeadingRef.current ||
      !whySectionRef.current
    ) {
      return;
    }

    const page = whoSectionRef.current.closest("main");

    const ctx = gsap.context(() => {
      const createCurtainReveal = ({
        axis = "y",
        frameSelector,
        imageSelector,
        section,
        stagger = 0.48,
        start = "top 72%",
        trigger = section,
      }) => {
        const frames = gsap.utils
          .toArray(frameSelector, section)
          .sort(
            (a, b) =>
              Number(a.dataset.revealOrder) - Number(b.dataset.revealOrder)
          );

        const images = gsap.utils
          .toArray(imageSelector, section)
          .sort(
            (a, b) =>
              Number(a.dataset.revealOrder) - Number(b.dataset.revealOrder)
          );

        if (!images.length) return;

        const positionProp = axis === "x" ? "xPercent" : "yPercent";

        gsap.set(frames, {
          autoAlpha: 0,
          willChange: "opacity",
        });

        gsap.set(images, {
          autoAlpha: 1,
          force3D: true,
          scale: 1,
          transformOrigin: axis === "x" ? "left center" : "center top",
          willChange: "transform",
          [positionProp]: -105,
        });

        const tl = gsap.timeline({
          defaults: { duration: 1.05, ease: "power2.out" },
          onComplete: () => {
            frames.forEach((frame) => {
              frame.dataset.revealed = "true";
            });
            gsap.set(frames, { clearProps: "willChange" });
            gsap.set(images, { clearProps: "willChange" });
          },
          onReverseComplete: () => {
            gsap.set(frames, { autoAlpha: 0 });
          },
          scrollTrigger: {
            trigger,
            start,
            toggleActions: "play none none none",
            invalidateOnRefresh: true,
          },
        });

        images.forEach((image, index) => {
          const position = index * stagger;

          if (frames[index]) {
            tl.fromTo(
              frames[index],
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.01, ease: "none" },
              position
            );
          }

          tl.to(
            image,
            {
              force3D: true,
              [positionProp]: 0,
            },
            position
          );
        });
      };

      createCurtainReveal({
        frameSelector: "[data-who-frame]",
        imageSelector: "[data-who-image]",
        section: whoSectionRef.current,
        trigger: whoImagesRef.current,
      });

      createCurtainReveal({
        axis: "x",
        frameSelector: "[data-why-frame]",
        imageSelector: "[data-why-image]",
        section: whySectionRef.current,
        stagger: 0.68,
        start: "top 18%",
        trigger: whyHeadingRef.current,
      });

      createCurtainReveal({
        frameSelector: "[data-mission-frame]",
        imageSelector: "[data-mission-image]",
        section: missionVisionRef.current,
        stagger: 0.6,
        start: "top 70%",
      });

      ScrollTrigger.refresh();
    });

    const cleanupRefresh = createScrollTriggerRefresh(
      ScrollTrigger,
      page || undefined
    );

    return () => {
      cleanupRefresh();
      ctx.revert();
    };
  }, []);

  return (
    <main className="overflow-x-hidden bg-[#f5f5f5] text-[#151525]">
      <section
        className="relative isolate overflow-hidden bg-[#220025] text-white sm:pt-6 lg:h-screen lg:min-h-[760px]"
        id="about"
      >
        <video
          aria-hidden="true"
          autoPlay
          className="absolute inset-0 size-full object-cover object-center opacity-45"
          loop
          muted
          playsInline
          preload="metadata"
        >
          <source src="/about/about us hero.webm" type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(34,0,37,0.66)_0%,rgba(34,0,37,0.74)_100%)]" />

        <div className="relative mx-auto flex h-full max-w-[1440px] flex-col px-4 sm:px-6 lg:px-10">
          <Navbar />

          <div className="grid flex-1 content-center gap-10 py-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(180px,0.35fr)] lg:items-center">
            <div className="w-full max-w-[980px] rounded-[24px] border border-white/20 bg-white/18 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.14)] backdrop-blur-[10px] sm:p-8 lg:p-10">
              <h1 className="font-ibrand text-[2.75rem] leading-[0.92] text-[#e39b4d] sm:text-[3.45rem] lg:text-[4.25rem]">
                {aboutHero.title}
              </h1>

              <div className="mt-8 max-w-[680px] space-y-4 text-left font-['Poppins',sans-serif] text-[14.5px] font-medium leading-7 text-white/92 sm:mt-10 sm:space-y-5 sm:text-[18px] sm:leading-[1.75] lg:max-w-[720px]">
                {aboutHero.description.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="hidden lg:block" />
          </div>
        </div>
      </section>

      <section
        ref={whoSectionRef}
        className="-mt-8 bg-white pb-16 pt-8 sm:-mt-6 sm:py-20 lg:-mt-8 lg:py-24"
      >
        <div className="mx-auto mt-6 grid max-w-[1320px] gap-10 px-4 sm:px-6 lg:mt-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(340px,0.78fr)] lg:items-start lg:px-10">
          <div className="max-w-[660px]">
            <SectionEyebrow className="mt-4 text-xl sm:text-2xl lg:mt-6 lg:text-[1.65rem]">
              {whoWeAre.eyebrow}
            </SectionEyebrow>
            <h4 className="mt-6 font-ibrand text-[1.55rem] leading-[1.04] text-[#5f0c66] sm:mt-7 sm:text-[2.05rem] lg:mt-8 lg:text-[2.35rem]">
              {whoWeAre.title}
            </h4>

            <div className="mt-7 space-y-5 font-['Poppins',sans-serif] text-[15px] leading-8 text-[#5a5a5a] sm:text-[16px] sm:leading-[1.85]">
              {whoWeAre.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div
            ref={whoImagesRef}
            className="grid gap-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-2"
          >
            <RemoteImage
              alt={whoWeAre.images[0].alt}
              className="h-[202px] sm:h-[222px] lg:h-[247px] lg:w-[82%] lg:justify-self-end lg:translate-x-[10%]"
              priority
              revealOrder={1}
              src={whoWeAre.images[0].src}
            />
            <RemoteImage
              alt={whoWeAre.images[1].alt}
              className="h-[202px] sm:mt-10 sm:h-[222px] sm:translate-y-4 lg:h-[247px] lg:w-[82%] lg:justify-self-center lg:translate-y-24"
              revealOrder={2}
              src={whoWeAre.images[1].src}
            />
            <RemoteImage
              alt={whoWeAre.images[2].alt}
              className="h-[202px] sm:col-span-1 sm:h-[222px] lg:-mt-8 lg:h-[247px] lg:w-[82%] lg:justify-self-end lg:translate-x-[10%]"
              revealOrder={3}
              src={whoWeAre.images[2].src}
            />
          </div>
        </div>
      </section>

      <section ref={whySectionRef} className="bg-white pb-16 pt-2 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,0.95fr)] lg:items-start">
            <div ref={whyHeadingRef} className="max-w-[500px]">
              <SectionEyebrow className="!text-xl sm:!text-xl lg:!text-2xl">
                {whyWeExist.eyebrow}
              </SectionEyebrow>
              <h2 className="mt-4 font-ibrand text-[1.85rem] leading-[0.98] text-[#5f0c66] sm:text-[2.35rem] lg:text-[2.85rem]">
                {whyWeExist.title}
              </h2>
            </div>

            <div className="space-y-5 font-['Poppins',sans-serif] text-[15px] leading-7 text-[#656565] sm:text-[17px] sm:leading-8">
              {whyWeExist.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            {whyWeExist.images.map((image, index) => (
              <RemoteImage
                key={image.src}
                alt={image.alt}
                className="h-[250px] sm:h-[320px] lg:h-[360px]"
                revealGroup="why"
                revealOrder={index + 1}
                src={image.src}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        ref={missionVisionRef}
        className="bg-white pb-16 pt-4 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
          <div className="space-y-10 lg:space-y-12">
            {missionVision.map((item, index) => (
              <div
                key={item.title}
                className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(300px,0.8fr)] lg:items-stretch"
              >
                <article className="max-w-[690px]">
                  <h2 className="font-ibrand text-[2rem] leading-none text-[#151525] sm:text-[2.6rem]">
                    {item.title}
                  </h2>
                  <div className="mt-5 space-y-4 font-['Poppins',sans-serif] text-[15px] leading-7 text-[#4e4e4e] sm:text-[17px] sm:leading-8">
                    {item.description.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </article>

                <RemoteImage
                  alt={item.image.alt}
                  className="h-[260px] sm:h-[340px] lg:h-full lg:min-h-[360px]"
                  revealGroup="mission"
                  revealOrder={index + 1}
                  src={item.image.src}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <SupportInfoSection />

      <section className="bg-white pb-6 pt-4 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
          <h2 className="font-ibrand text-[2rem] font-medium leading-none text-[#5f0c66] sm:text-[2.45rem]">
            Our Core Values
          </h2>

          <div
            ref={coreValuesMobileRef}
            className="relative mt-10 md:hidden"
          >
            {coreValues.map((value, index) => (
              <div
                key={value.title}
                className="sticky top-[90px]"
                style={{
                  zIndex: index + 1,
                  paddingTop: index === 0 ? "0px" : "16px",
                  marginBottom: "24px",
                }}
              >
                <div className="bg-white">
                  <ValueCard image={value.image} title={value.title} />
                </div>
              </div>
            ))}

            <div className="h-[80px]" />
          </div>

          <div className="hidden md:block">
            <CoreValuesAccordion values={coreValues} />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

