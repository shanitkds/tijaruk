// @ts-nocheck
"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { createScrollTriggerRefresh } from "../animation/scrollTriggerRefresh";
import Footer from "../shares/Footer";
import Navbar from "../shares/Navbar";
import SourcingRFQForm from "./SourcingRFQForm";
import {
  rfqFormContent,
  sourcingAdvantages,
  sourcingHero,
  sourcingSections,
} from "./sourcingData";

gsap.registerPlugin(ScrollTrigger);

function SourcingIcon({ className = "", type }) {
  const sharedProps = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: "1.9",
    viewBox: "0 0 24 24",
  };

  switch (type) {
    case "domestic-price":
      return (
        <svg {...sharedProps}>
          <path d="M5 9.5c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v5c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2v-5Z" />
          <path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" />
          <path d="M9 12h6" />
          <path d="M12 9.5v5" />
        </svg>
      );
    case "domestic-delivery":
      return (
        <svg {...sharedProps}>
          <path d="M4 8.5h8v6H4z" />
          <path d="M12 10h3.5l2.5 2.5v2H12z" />
          <circle cx="8" cy="17" r="1.75" />
          <circle cx="16.5" cy="17" r="1.75" />
          <path d="M6 6.5h6" />
          <path d="M5.5 12.5h3" />
        </svg>
      );
    case "domestic-no-customs":
      return (
        <svg {...sharedProps}>
          <path d="M8 4.5h8l2 2v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-11l2-2Z" />
          <path d="M9 9.5h6" />
          <path d="M9 13h6" />
          <path d="M5 5l14 14" />
        </svg>
      );
    case "domestic-quality":
      return (
        <svg {...sharedProps}>
          <path d="M12 4.5 18 7v4.2c0 3.7-2.3 6.8-6 8.3-3.7-1.5-6-4.6-6-8.3V7l6-2.5Z" />
          <path d="m9.6 11.9 1.6 1.6 3.4-3.6" />
          <path d="M16.8 16.8 20 20" />
        </svg>
      );
    case "price":
      return (
        <svg {...sharedProps}>
          <path d="M12 3h6l3 3v6l-8.5 8.5a2 2 0 0 1-2.8 0L3.5 14.3a2 2 0 0 1 0-2.8L12 3Z" />
          <circle cx="16.5" cy="7.5" r="1.2" />
        </svg>
      );
    case "truck":
      return (
        <svg {...sharedProps}>
          <path d="M3 7h10v8H3z" />
          <path d="M13 10h4l2 2v3h-6z" />
          <circle cx="8" cy="17" r="2" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      );
    case "shield":
      return (
        <svg {...sharedProps}>
          <path d="M12 3l7 3v5c0 5-3.4 8.7-7 10-3.6-1.3-7-5-7-10V6l7-3Z" />
          <path d="m9.5 12 1.7 1.7 3.5-3.7" />
        </svg>
      );
    case "wrong-access":
      return (
        <svg {...sharedProps} strokeWidth="2.5">
          <circle cx="12" cy="12" r="8.5" />
          <path d="m6.4 17.6 11.2-11.2" />
        </svg>
      );
    case "inspect":
      return (
        <svg {...sharedProps}>
          <circle cx="11" cy="11" r="5" />
          <path d="m20 20-4.2-4.2" />
          <path d="M11 8v6" />
          <path d="M8 11h6" />
        </svg>
      );
    case "globe":
      return (
        <svg {...sharedProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a14 14 0 0 1 0 18" />
          <path d="M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case "customs":
      return (
        <svg {...sharedProps}>
          <path d="M4 8h16" />
          <path d="M7 8V5h10v3" />
          <path d="M5 8v11h14V8" />
          <path d="M9 12h6" />
          <path d="M9 16h4" />
        </svg>
      );
    default:
      return (
        <svg {...sharedProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12h8" />
        </svg>
      );
  }
}

function FeatureRow({ feature, tone }) {
  const isPlum = tone === "plum";

  return (
    <div className="sourcing-feature-card relative ml-4 sm:ml-0">
      <div className="pointer-events-none absolute left-0 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
        <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-[#dedede] bg-white text-[#6a1a73] shadow-[0_8px_18px_rgba(24,24,24,0.08)] sm:h-[60px] sm:w-[60px]">
          {feature.iconImage ? (
            <Image
              alt=""
              className="h-5 w-5 object-contain sm:h-6 sm:w-6"
              height={24}
              loading="lazy"
              src={feature.iconImage}
              width={24}
            />
          ) : (
            <SourcingIcon className="h-5 w-5 sm:h-6 sm:w-6" type={feature.icon} />
          )}
        </div>
      </div>

      <article
        className={`sourcing-feature-card-body relative z-10 rounded-[8px] px-3.5 py-3.5 pl-[60px] shadow-[0_12px_26px_rgba(0,0,0,0.08)] before:pointer-events-none before:absolute before:left-0 before:top-1/2 before:h-[38px] before:w-[38px] before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-[#f5f5f5] sm:px-4 sm:py-4 sm:pl-[72px] sm:before:h-[44px] sm:before:w-[44px] ${
          isPlum ? "bg-[#5f0c66] text-white" : "bg-[#e39b4d] text-white"
        }`}
      >
        <div className="relative z-10">
          <h3 className="font-['Poppins',sans-serif] text-[0.95rem] font-semibold leading-5 sm:text-[1.08rem]">
            {feature.title}
          </h3>
          <p className="mt-1 max-w-[720px] font-['Poppins',sans-serif] text-[11px] leading-5 text-white/85 sm:text-[13px] sm:leading-5">
            {feature.description}
          </p>
        </div>
      </article>
    </div>
  );
}

function SourcingFeatureSection({ section }) {
  const sectionSpacingClass =
    section.id === "domestic" || section.id === "international"
      ? "pt-6 pb-12 sm:pt-10 sm:pb-16"
      : "py-12 sm:py-16";

  return (
    <section
      className={`sourcing-feature-section ${sectionSpacingClass}`}
      data-section-id={section.id}
      data-reverse={section.reverse ? "true" : "false"}
      id={section.id}
    >
      <div
        className={`mx-auto grid max-w-[1320px] gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)] lg:items-start lg:gap-[4%] lg:px-10 ${
          section.reverse ? "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1" : ""
        }`}
      >
        <div className="sourcing-feature-image overflow-hidden rounded-[12px] shadow-[0_24px_60px_rgba(27,0,30,0.1)]">
          <Image
            alt={section.imageAlt}
            className="sourcing-feature-image-img h-[280px] w-full object-cover sm:h-[420px] lg:h-[510px]"
            height={510}
            sizes="(max-width: 1024px) 100vw, 600px"
            src={section.image}
            width={640}
          loading="lazy" />
        </div>

        <div className="sourcing-feature-copy lg:max-w-[620px]">
          <h2 className="font-['Poppins',sans-serif] text-[1.7rem] font-semibold leading-tight text-[#181818] sm:text-[2rem]">
            {section.title}
          </h2>
          <p className="mt-2 font-['Poppins',sans-serif] text-[15px] leading-7 text-[#6b6b6b] sm:text-[18px] sm:leading-8">
            {section.subtitle}
          </p>

          <div className="mt-5 space-y-2 sm:space-y-2.5">
            {section.features.map((feature) => (
              <FeatureRow key={feature.title} feature={feature} tone={section.tone} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AdvantageList() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const copyElements = gsap.utils.toArray(".advantage-copy");
      const listItems = gsap.utils.toArray(".advantage-item");

      gsap.set([...copyElements, ...listItems], {
        autoAlpha: 0,
        y: 30,
        force3D: true,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      tl.to(copyElements, {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
      }).to(
        listItems,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power2.out",
        },
        "-=0.4"
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-14 sm:py-16 lg:py-20">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1fr)] lg:items-start lg:px-10">
        <div className="max-w-[560px]">
          <h2 className="advantage-copy font-['Poppins',sans-serif] text-[1.75rem] font-semibold leading-tight text-[#1d1d1d] sm:text-[2rem]">
            {sourcingAdvantages.title}
          </h2>
          <p className="advantage-copy mt-4 max-w-[500px] font-['Poppins',sans-serif] text-[15px] leading-7 text-[#636363] sm:text-[16px] sm:leading-8">
            {sourcingAdvantages.description}
          </p>
        </div>

        <div className="relative">
          {sourcingAdvantages.items.map((item) => (
            <article
              key={item.id}
              className="advantage-item grid grid-cols-[70px_1fr] border-b border-[#cfcfcf] last:border-b-0 sm:grid-cols-[86px_1fr]"
            >
              <div className="border-r border-[#cfcfcf] py-3 pr-4 text-right font-['Poppins',sans-serif] text-[1.85rem] font-semibold leading-none text-[#4d4d4d] sm:py-4 sm:pr-5 sm:text-[2.1rem]">
                {item.id}
              </div>
              <div className="py-3 pl-5 sm:py-4 sm:pl-6">
                <h3 className="font-['Poppins',sans-serif] text-[1.05rem] font-semibold leading-tight text-[#444444] sm:text-[1.25rem]">
                  {item.title}
                </h3>
                <p className="mt-1 font-['Poppins',sans-serif] text-[14px] leading-5 text-[#5e5e5e] sm:text-[16px] sm:leading-6">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroSection() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    if (!sectionRef.current) return undefined;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      const images = gsap.utils.toArray(".sourcing-hero-media-image", sectionRef.current);
      if (!images.length) return;

      gsap.set(images, {
        opacity: 0,
        y: 20,
        force3D: true,
        willChange: "transform, opacity",
      });

      gsap.to(images, {
        opacity: 1,
        y: 0,
        duration: 1.8,
        ease: "power3.out",
        stagger: 0.3,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="px-4 pb-10 pt-8 sm:px-6 lg:px-10 lg:pb-16">
      <div className="mx-auto max-w-[1440px]">
        <Navbar />

        <div className="pt-10">
          <h1 className="text-center font-ibrand text-[2.3rem] leading-none text-[#e39b4d] sm:text-[3rem] lg:text-[3.35rem]">
            {sourcingHero.label}
          </h1>

          <div className="sourcing-hero-grid mt-8 grid gap-5 lg:grid-cols-[minmax(0,640px)_minmax(0,500px)] lg:items-start lg:justify-center lg:gap-8">
            <div className="lg:justify-self-end">
              <div className="sourcing-hero-media relative overflow-hidden rounded-[12px] shadow-[0_26px_65px_rgba(27,0,30,0.14)]">
                <Image
                  alt="Business sourcing discussion"
                  className="sourcing-hero-media-image h-[290px] w-full object-cover sm:h-[390px] lg:h-[500px]"
                  height={500}
                   loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  src={sourcingHero.imagePrimary}
                  width={680}
                />

                <div className="sourcing-hero-overlay absolute inset-x-4 bottom-4 min-h-[110px] rounded-[10px] bg-white px-5 py-5 shadow-[0_12px_28px_rgba(0,0,0,0.12)] sm:inset-x-6 sm:bottom-6 sm:min-h-[124px] sm:px-6 sm:py-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-['Poppins',sans-serif] text-base font-semibold text-[#1d1d1d] sm:text-[1.1rem]">
                        {sourcingHero.cardTitle}
                      </h3>
                      <p className="mt-2 max-w-[420px] font-['Poppins',sans-serif] text-xs leading-5 text-[#666666] sm:text-[13px]">
                        {sourcingHero.cardDescription}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="mt-6 max-w-[560px] font-['Poppins',sans-serif] text-[1.2rem] font-semibold leading-tight text-[#181818] sm:text-[1.65rem] lg:text-[1.85rem]">
                {sourcingHero.title.split("\n").map((line, index) => (
                  <span key={`${index}-${line}`} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            </div>

            <div className="lg:justify-self-start">
              <div className="sourcing-hero-media overflow-hidden rounded-[12px] shadow-[0_26px_65px_rgba(27,0,30,0.14)] lg:max-w-[500px]">
                <Image
                  alt="Supplier planning around a laptop"
                  className="sourcing-hero-media-image h-[285px] w-full object-cover sm:h-[385px] lg:h-[455px]"
                  height={455}
                  sizes="(max-width: 1024px) 100vw, 500px"
                  src={sourcingHero.imageSecondary}
                  width={500}
                loading="lazy" />
              </div>

              <div className="lg:max-w-[500px]">
                <p className="mt-5 font-['Poppins',sans-serif] text-[14px] leading-7 text-[#4d4d4d] sm:text-[15px] sm:leading-7">
                  {sourcingHero.body}
                </p>

                <a
                  className="mt-5 inline-flex h-[52px] items-center justify-center rounded-[7px] bg-[#5f0c66] px-8 font-['Poppins',sans-serif] text-sm font-semibold text-white transition hover:bg-[#74217a] sm:h-[58px] sm:px-10 sm:text-base"
                  href="#rfq"
                >
                  {sourcingHero.cta}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RFQSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#5f0c66] py-16 sm:py-20 lg:py-24" id="rfq">
      <Image
        alt=""
        className="absolute inset-0 size-full object-cover object-center opacity-[0.045]"
        fill
        sizes="100vw"
        src="/sourcing/rfq-pattern.webp"
      loading="lazy" />

      <div className="relative mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[720px] text-center text-white">
        
       
        </div>

        <div className="mt-10">
          <SourcingRFQForm />
        </div>
      </div>
    </section>
  );
}

export default function SourcingPage() {
  const pageRef = useRef(null);

  useLayoutEffect(() => {
    if (!pageRef.current) return;
    const page = pageRef.current;

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray(".sourcing-feature-section", page);

      sections.forEach((section) => {
        const isDomestic = section.dataset.sectionId === "domestic";
        const isReverse = section.dataset.reverse === "true";
        const image = section.querySelector(".sourcing-feature-image");
        const imageInner = image?.querySelector(".sourcing-feature-image-img");
        const copy = section.querySelector(".sourcing-feature-copy");
        const featureCards = gsap.utils.toArray(".sourcing-feature-card-body", section);
        const animatedItems = [image, imageInner, copy, ...featureCards].filter(Boolean);
        const cardDuration = isDomestic ? 0.82 : 0.76;
        const cardStagger = isDomestic ? 0.14 : 0.12;

        if (animatedItems.length) {
          gsap.set(animatedItems, {
            force3D: true,
            willChange: "transform, opacity",
          });
        }

        if (image && imageInner) {
          gsap.set(image, {
            clipPath: "inset(0% 0% 100% 0%)",
            autoAlpha: 1,
          });

          gsap.set(imageInner, {
            scale: 1.15,
            transformOrigin: "center center",
          });
        }

        if (featureCards.length) {
          gsap.set(featureCards, {
            autoAlpha: 0,
            x: -36,
          });
        }

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            toggleActions: "play none none none",
            invalidateOnRefresh: true,
          },
        });

        if (image && imageInner) {
          tl.to(
            image,
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power3.inOut" },
            0
          ).to(
            imageInner,
            {
              duration: 1.8,
              force3D: true,
              scale: 1,
              ease: "power2.out",
            },
            0
          );
        }

        if (copy) {
          tl.from(
            copy,
            {
              autoAlpha: 0,
              duration: 0.62,
              force3D: true,
              overwrite: "auto",
              y: 20,
            },
            0.16
          );
        }

        if (featureCards.length) {
          tl.to(
            featureCards,
            {
              autoAlpha: 1,
              duration: cardDuration,
              force3D: true,
              overwrite: "auto",
              stagger: cardStagger,
              x: 0,
            },
            0.24
          );
        }

        tl.eventCallback("onComplete", () => {
          if (animatedItems.length) {
            gsap.set(animatedItems, { clearProps: "willChange" });
          }
        });
      });

      ScrollTrigger.refresh();
    }, page);

    const cleanupRefresh = createScrollTriggerRefresh(ScrollTrigger, page);

    return () => {
      cleanupRefresh();
      ctx.revert();
    };
  }, []);

  return (
    <main ref={pageRef} className="min-h-screen overflow-x-hidden bg-[#f5f5f5] text-[#141414]">
      <HeroSection />

      {sourcingSections.map((section) => (
        <SourcingFeatureSection key={section.id} section={section} />
      ))}

      <AdvantageList />
      <RFQSection />
      <Footer />
    </main>
  );
}
