// @ts-nocheck
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Footer from "../shares/Footer";
import Navbar from "../shares/Navbar";

const HERO_IMAGE = "/international/hero.webp";
const WHO_IMAGE = "/international/premium-rice.webp";
const WHITE_LABELING_VIDEO = "/international/white.webm";
const REBRANDING_VIDEO = "/international/rebranding.webm";

const PRODUCTS_PER_PAGE = 3;

function ArrowIcon({ direction = "left" }) {
  return (
    <svg
      className={`h-4 w-4 ${direction === "right" ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ServiceTile({ image, label, href = "/sourcing#rfq", primary = false }) {
  return (
    <article className="group relative min-h-[270px] overflow-hidden rounded-[3px] bg-[#d9d9d9] sm:min-h-[330px] lg:min-h-[428px]">
      <Image
        alt={label}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        fill
        loading="lazy"
        sizes="(max-width: 767px) 100vw, 50vw"
        src={image}
      />
      {primary ? (
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:pointer-events-auto group-hover:opacity-100">
          <div className="absolute inset-0 bg-black/60" />
          <Link
            className="absolute bottom-6 left-5 flex translate-y-4 items-center transition-all duration-500 hover:scale-[1.02] group-hover:translate-y-0"
            href={href}
          >
            <div className="flex h-[56px] items-center rounded-l-[3px] rounded-r-[100px] border-l-[16px] border-[#5f0c66] bg-white pl-4 pr-10 font-['Poppins',sans-serif] text-[1.25rem] font-medium tracking-tight leading-none text-[#5f0c66] shadow-[0_10px_28px_rgba(0,0,0,0.18)] sm:h-[64px] sm:pl-5 sm:pr-14 sm:text-[1.4rem]">
              {label}
            </div>
            <div className="relative z-10 -ml-10 flex h-[46px] w-[54px] items-center justify-center rounded-l-[3px] rounded-r-[100px] bg-[#5f0c66] text-white shadow-[0_4px_20px_rgba(0,0,0,0.25)] sm:h-[52px] sm:w-[60px]">
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18m0 0l-6-6m6 6l-6 6" />
              </svg>
            </div>
          </Link>
        </div>
      ) : null}
    </article>
  );
}

function ProductCard({ product }) {
  const baseImageRef = useRef(null);
  const hoverImageRef = useRef(null);
  const hoverTimelineRef = useRef(null);
  const hoverImage = product.hoverImage;
  const hasHoverImage = Boolean(hoverImage);
  const estimatedPrice = product.price
    ? `SAR ${Number(product.price).toLocaleString("en-US")}`
    : "Not added";
  const minimumQuantity = product.minimumQuantity ?? 0;
  const unitName = product.unitName || "Units";

  useEffect(() => {
    if (!hoverImage) return undefined;
    const preloadImage = window.document.createElement("img");
    preloadImage.decoding = "async";
    preloadImage.src = hoverImage;
    return () => { preloadImage.src = ""; };
  }, [hoverImage]);

  useEffect(() => {
    return () => { hoverTimelineRef.current?.kill(); };
  }, []);

  const playImageFade = () => {
    if (!hasHoverImage || !baseImageRef.current || !hoverImageRef.current) return;
    hoverTimelineRef.current?.kill();
    hoverTimelineRef.current = gsap.timeline({ defaults: { duration: 0.45, ease: "power3.out", overwrite: true } });
    hoverTimelineRef.current.to(baseImageRef.current, { scale: 1.04 }, 0).to(hoverImageRef.current, { autoAlpha: 1 }, 0);
  };

  const resetImageFade = () => {
    if (!hasHoverImage || !baseImageRef.current || !hoverImageRef.current) return;
    hoverTimelineRef.current?.kill();
    hoverTimelineRef.current = gsap.timeline({ defaults: { duration: 0.4, ease: "power3.inOut", overwrite: true } });
    hoverTimelineRef.current.to(baseImageRef.current, { scale: 1 }, 0).to(hoverImageRef.current, { autoAlpha: 0 }, 0);
  };

  return (
    <article 
      className="group flex h-full flex-col rounded-[12px] bg-white p-2 shadow-[0_1px_4px_rgba(0,0,0,0.25)] md:p-3"
      onPointerEnter={playImageFade}
      onPointerLeave={resetImageFade}
    >
      <div className="relative overflow-hidden rounded-[9px] bg-gray-100">
        <Image
          ref={baseImageRef}
          alt={product.name}
          className="h-[140px] w-full object-cover sm:h-[210px] md:h-[250px] lg:h-[285px]"
          height={331}
          loading="lazy"
          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 400px"
          src={product.image}
          width={400}
        />

        {hasHoverImage ? (
          <img
            ref={hoverImageRef}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 h-[140px] w-full object-cover opacity-0 sm:h-[210px] md:h-[250px] lg:h-[285px]"
            decoding="async"
            loading="lazy"
            src={hoverImage}
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-3 text-center md:px-3 md:pb-2 md:pt-5">
        <h2 className="line-clamp-2 min-h-[30px] font-ibrand text-[13px] leading-[15px] text-[#373737] md:min-h-0 md:text-[19px] md:leading-none">
          {product.name.toUpperCase()}
        </h2>

        <p className="mx-auto mt-1.5 line-clamp-2 min-h-[26px] w-full font-['Poppins',sans-serif] text-[9px] leading-[13px] text-[#7d7b7b] md:mt-3.5 md:min-h-[36px] md:text-[14px] md:leading-[18px]">
          {product.description}
        </p>

        <div className="mx-auto mt-2 grid w-full max-w-[260px] gap-1 font-['Poppins',sans-serif] text-[9px] text-[#707070] md:mt-3 md:gap-1.5 md:text-[12px]">
          <div className="flex items-center justify-between gap-1.5 md:gap-3">
            <span><span className="md:hidden">Est. Price</span><span className="hidden md:inline">Estimated Price</span></span>
            <b className="text-right text-[#373737]">{estimatedPrice}</b>
          </div>
          <div className="flex items-center justify-between gap-1.5 md:gap-3">
            <span><span className="md:hidden">Min. Qty</span><span className="hidden md:inline">Minimum Quantity</span></span>
            <b className="text-right text-[#373737]">
              {minimumQuantity.toLocaleString()} {unitName}
            </b>
          </div>
        </div>

        <div className="mt-auto flex justify-center pt-3 md:mt-5 md:pt-0">
          <Link
            className="relative inline-flex h-10 w-full max-w-[250px] items-center justify-center rounded-[26px] bg-[#5f0c66] font-['Poppins',sans-serif] text-[11px] font-semibold text-white transition hover:bg-[#7a1d84] md:h-[48px] md:text-[14px]"
            href={`/sourcing?product=${product.id}&type=INTERNATIONAL#rfq`}
          >
            <span className="absolute left-3 h-1.5 w-1.5 rounded-full bg-white md:left-5 md:h-2 md:w-2" />
            <span>Send RFQ</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

function SectionHeading() {
  return (
    <div className="inline-flex flex-col items-start">
      <h2 className="font-ibrand text-[32px] leading-[26px] text-[#5f0c66] sm:text-[38px]">
        Products
      </h2>
      <div className="relative mt-3 flex w-full items-center">
        <span className="h-[4px] w-full rounded-full bg-[#5f0c66]" />
        <span className="absolute -right-1 h-[11px] w-[11px] rounded-full bg-[#5f0c66]" />
      </div>
    </div>
  );
}

function WhoWeAreSection() {
  return (
    <section className="pb-[90px] pt-[56px]">
      <div className="mx-auto grid max-w-[1373px] gap-[72px] px-4 sm:px-6 lg:grid-cols-[561px_1fr] lg:px-0">
        <div className="relative min-h-[360px] overflow-hidden rounded-[6px] bg-[#d9d9d9] lg:min-h-[518px]">
          <Image
            alt="Premium rice packaging"
            className="h-full w-full object-cover"
            fill
            loading="lazy"
            sizes="(max-width: 1023px) 100vw, 561px"
            src={WHO_IMAGE}
          />
        </div>

        <div className="pt-0 font-['Poppins',sans-serif] lg:pt-[55px]">
          <h2 className="text-[26px] font-semibold leading-[24px] text-[#e39b4d] sm:text-[31px]">
            Who We Are
          </h2>
          <p className="mt-[30px] max-w-[732px] font-ibrand text-[24px] leading-[1.3] text-[#5f0c66] sm:text-[30px] sm:leading-[40px]">
            Tijaruk is a trade and business platform connecting buyers,
            suppliers, and markets through a structured system.
          </p>
          <div className="mt-[72px] max-w-[653px] space-y-5 font-['Roboto',sans-serif] text-[15px] leading-[23px] text-[#666] sm:text-[18px]">
            <p>
              Tijaruk is built to simplify how businesses connect across trade.
              We bring buyers and suppliers together through a structured
              platform that removes friction and creates direct, reliable access
              to global markets.
            </p>
            <p>
              By combining sourcing, pricing clarity, and supplier verification
              into one system, we eliminate scattered processes and reduce
              uncertainty. Businesses gain better control over decisions,
              timelines, and outcomes. Our approach is designed to make trade
              more transparent and dependable where connections are clear,
              processes are defined, and opportunities turn into real, scalable
              business.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AddOnServiceRow({ title, video, href, reverse = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;

    element.muted = true;
    element.defaultMuted = true;
    element.play().catch(() => {});
  }, [video]);

  return (
    <article className="bg-white">
      <div className="mx-auto grid max-w-[1384px] gap-8 px-4 py-[11px] sm:px-6 lg:grid-cols-2 lg:px-0">
        <Link
          className={`relative min-h-[280px] overflow-hidden rounded-r-[3px] bg-[#d9d9d9] lg:min-h-[428px] ${
            reverse ? "lg:order-2" : ""
          }`}
          href={href}
        >
          <video
            ref={videoRef}
            aria-label={`${title} video`}
            autoPlay
            className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
            defaultMuted
            loop
            muted
            onCanPlay={(event) => {
              event.currentTarget.play().catch(() => {});
            }}
            playsInline
            preload="metadata"
          >
            <source src={video} type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-[#220025]/45" />
        </Link>

        <div
          className={`flex flex-col justify-center px-0 py-8 font-['Poppins',sans-serif] lg:px-[28px] lg:py-0 ${
            reverse ? "lg:order-1" : ""
          }`}
        >
          <h3 className="font-ibrand text-[32px] leading-[26px] text-[#5f0c66] sm:text-[38px]">
            {title}
          </h3>
          <p className="mt-8 max-w-[639px] font-ibrand text-[24px] leading-[1.3] text-[#5f0c66] sm:text-[30px] sm:leading-[40px]">
            Tijaruk is a trade and business platform connecting buyers,
            suppliers, and markets through a structured system.
          </p>
          <div className="mt-9 max-w-[644px] space-y-3 font-['Roboto',sans-serif] text-[15px] leading-[23px] text-[#666] sm:text-[18px]">
            <p>
              Tijaruk is built to simplify how businesses connect across trade.
              We bring buyers and suppliers together through a structured
              platform that removes friction and creates direct, reliable access
              to global markets.
            </p>
            <p>
              By combining sourcing, pricing clarity, and supplier verification
              into one system, we eliminate scattered processes and reduce
              uncertainty. Businesses gain better control over decisions,
              timelines, and outcomes.
            </p>
          </div>

          <div className="mt-8 flex justify-end">
            <Link
              className="inline-flex h-12 items-center gap-3 rounded-[999px] bg-[#5f0c66] px-8 font-['Poppins',sans-serif] text-[14px] font-semibold text-white transition hover:bg-[#7a1d84]"
              href={href}
            >
              <span>Learn More</span>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function InternationalPage() {
  const [internationalProducts, setInternationalProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/products/public/international/")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load products.");
        }
        return response.json();
      })
      .then((products) => {
        if (!isMounted) return;
        setInternationalProducts(
          products.map((product) => ({
            id: product.id,
            name: product.product_name,
            description: product.description || "No product description available.",
            image: product.image || "/international/hero.webp",
            hoverImage: product.internal_images?.[0]?.image || null,
            rating: product.supplier_rating || "0",
            price: product.price,
            minimumQuantity: product.minimum_quantity,
            unitName: product.unit_name,
          })),
        );
      })
      .catch(() => {
        if (isMounted) {
          setLoadError("Unable to load international products. Please try again.");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);
  const totalPages = Math.max(
    1,
    Math.ceil(internationalProducts.length / PRODUCTS_PER_PAGE)
  );

  const visibleProducts = internationalProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const goToPage = (page) => {
    const nextPage = Math.min(totalPages, Math.max(1, page));
    setCurrentPage(nextPage);

    const element = document.getElementById("international-products");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f5f5] text-[#161616]">
      <section className="px-4 pb-0 pt-3 sm:px-6 lg:px-0 lg:pt-[31px]">
        <div className="mx-auto max-w-[1373px]">
          <Navbar />

          <div className="relative mt-4 h-[360px] overflow-hidden rounded-[6px] sm:mt-5 sm:h-[460px] lg:mt-6 lg:h-[549px]">
            <Image
              alt="International shipping vessel"
              className="h-full w-full object-cover"
              fill
              priority
              sizes="100vw"
              src={HERO_IMAGE}
            />
            <div className="absolute inset-0 rounded-[6px] bg-[#220025]/70" />

            <div className="relative flex h-full items-end px-5 pb-8 sm:items-center sm:px-8 sm:pb-0 lg:px-[40px]">
              <div className="max-w-[928px] translate-y-0 text-white sm:translate-y-[56px] lg:translate-y-[112px]">
                <h1 className="font-ibrand text-[36px] leading-[1] sm:text-[55px] lg:text-[63px]">
                  International
                </h1>

                <div className="mt-3 max-w-[330px] space-y-3 font-['Poppins',sans-serif] text-[12px] leading-[17px] text-white sm:mt-[14px] sm:max-w-[720px] sm:space-y-[20px] sm:text-[17px] sm:leading-[24px] lg:max-w-[928px] lg:space-y-[26px] lg:text-[20px] lg:leading-[26px]">
                  <p>
                    At Tijaruk, we empower Saudi businesses, entrepreneurs, and
                    global partners to thrive in today&apos;s fast-moving trade
                    environment. From importing and exporting to business setup,
                    branding, and automation, we provide end-to-end support
                    designed to make every stage of your journey smoother.
                  </p>
                  <p>
                    Whether you are starting fresh, scaling your operations, or
                    taking your products global, our team is here to guide you
                    with trusted expertise and personalized solutions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WhoWeAreSection />

      <section className="pb-[98px]">
        <div className="mx-auto max-w-[1373px] px-4 sm:px-6 lg:px-0">
          <h2 className="font-ibrand text-[42px] leading-[26px] text-black sm:text-[51px]">
            Add-on Services
          </h2>
        </div>

        <div className="mt-[52px] space-y-[50px]">
          <AddOnServiceRow
            title="Rebranding"
            video={REBRANDING_VIDEO}
            href="/add-on-services/rebranding"
          />
          <AddOnServiceRow
            title="White Labeling"
            video={WHITE_LABELING_VIDEO}
            href="/add-on-services/white-labeling"
            reverse
          />
        </div>
      </section>

      <section id="international-products" className="pb-14">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-0">
          <SectionHeading />

          <div className="mt-9 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-7 lg:grid-cols-4 lg:gap-9 xl:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {isLoading ? (
              <p className="col-span-full py-12 text-center text-sm text-[#707070]">
                Loading international products...
              </p>
            ) : null}
            {loadError ? (
              <p className="col-span-full py-12 text-center text-sm font-semibold text-red-600">
                {loadError}
              </p>
            ) : null}
            {!isLoading && !loadError && internationalProducts.length === 0 ? (
              <p className="col-span-full py-12 text-center text-sm text-[#707070]">
                No international products are currently available.
              </p>
            ) : null}
          </div>

          {internationalProducts.length > 0 ? (
          <div className="mt-[41px] flex justify-center">
            <div className="inline-flex h-[60px] items-center justify-center gap-[7px] rounded-[5px] bg-white px-px py-[7px]">
              <button
                aria-label="Previous page"
                className="flex h-[31px] w-[31px] items-center justify-center rounded-[5px] text-[#6a1472] transition hover:bg-[#f4ecf6] disabled:cursor-not-allowed disabled:opacity-40"
                disabled={currentPage === 1}
                type="button"
                onClick={() => goToPage(currentPage - 1)}
              >
                <ArrowIcon />
              </button>

              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1;
                const isActive = currentPage === page;

                return (
                  <button
                    key={page}
                    aria-current={isActive ? "page" : undefined}
                    className={`h-[46px] min-w-[48px] rounded-[7px] px-2 font-['Poppins',sans-serif] text-[16px] transition ${
                      isActive
                        ? "bg-[#5f0c66] text-white shadow-[3px_3px_7px_rgba(0,0,0,0.18)]"
                        : "bg-[#e9e9e9] text-[#5f0c66] hover:bg-[#ddd6df]"
                    }`}
                    type="button"
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                aria-label="Next page"
                className="flex h-[31px] w-[31px] items-center justify-center rounded-[5px] text-[#6a1472] transition hover:bg-[#f4ecf6] disabled:cursor-not-allowed disabled:opacity-40"
                disabled={currentPage === totalPages}
                type="button"
                onClick={() => goToPage(currentPage + 1)}
              >
                <ArrowIcon direction="right" />
              </button>
            </div>
          </div>
          ) : null}
        </div>
      </section>

      <Footer />
    </main>
  );
}
