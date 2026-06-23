// @ts-nocheck
import Image from "next/image";
import { forwardRef } from "react";

function ServiceBadge({ id }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#e39b4d] px-2.5 py-2 text-white sm:px-3 sm:py-2.5">
      <span className="size-1.5 rounded-full bg-white/90 sm:size-2" />
      <span className="font-['Poppins',sans-serif] text-[0.95rem] font-semibold leading-none sm:text-[1.1rem] lg:text-[1.2rem]">
        {id}
      </span>
    </div>
  );
}

function ServiceFeatureList({ features, heading }) {
  return (
    <div className="mt-10 sm:mt-12">
      {heading || (
        <div className="mb-3 flex items-center gap-2.5 sm:mb-4">
          <span className="size-2 rounded-full bg-[#e39b4d]" />
          <h3 className="font-['Poppins',sans-serif] text-base font-semibold text-[#181818] sm:text-lg">What We do</h3>
        </div>
      )}

      <ol className="space-y-0 border-b border-[#e8e2dc]">
        {features.map((feature, index) => (
          <li
            key={feature}
            className="grid grid-cols-[1.75rem_1fr] items-center border-b border-[#e8e2dc] py-2 last:border-b-0 sm:grid-cols-[2.2rem_1fr] sm:py-2.5"
          >
            <span className="font-['Poppins',sans-serif] text-[15px] font-medium text-[#5a5a5a] sm:text-base">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="font-['Poppins',sans-serif] text-[13px] leading-5 text-[#4a4a4a] sm:text-[14px] sm:leading-6">
              {feature}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ServiceSectionBase({ service }, ref) {
  const titleClassName =
    service.id === "01"
      ? "mt-5 max-w-[13ch] font-ibrand text-[1.72rem] leading-[0.98] text-[#111111] sm:mt-6 sm:text-[2.25rem] lg:text-[3.5rem]"
      : service.id === "02"
        ? "mt-5 max-w-[13ch] font-ibrand text-[1.76rem] leading-[0.98] text-[#111111] sm:mt-6 sm:text-[2.34rem] lg:text-[3.45rem]"
      : service.id === "03"
        ? "mt-5 max-w-[13ch] font-ibrand text-[1.72rem] leading-[0.98] text-[#111111] sm:mt-6 sm:text-[2.25rem] lg:text-[3.43rem]"
      : service.id === "04"
        ? "mt-5 max-w-[13ch] font-ibrand text-[1.65rem] leading-[0.98] text-[#111111] sm:mt-6 sm:text-[2.15rem] lg:text-[3.15rem]"
      : service.id === "05"
        ? "mt-5 max-w-[13ch] font-ibrand text-[1.55rem] leading-[0.98] text-[#111111] sm:mt-6 sm:text-[2.05rem] lg:text-[2.95rem]"
      : service.id === "06"
        ? "mt-5 max-w-[13ch] font-ibrand text-[1.5rem] leading-[0.98] text-[#111111] sm:mt-6 sm:text-[2rem] lg:text-[2.85rem]"
      : service.id === "07"
        ? "mt-5 max-w-[13ch] font-ibrand text-[1.45rem] leading-[0.98] text-[#111111] sm:mt-6 sm:text-[1.95rem] lg:text-[2.75rem]"
      : "mt-5 max-w-[13ch] font-ibrand text-[2rem] leading-[0.98] text-[#111111] sm:mt-6 sm:text-[2.7rem] lg:text-[4.2rem]";

  const formattedDescription =
    service.id === "01" ? (
      <>
        <span className="block">TIJARUK is your trusted sourcing and trade partner. We help Saudi-based</span>
        <span className="block">businesses source and import products from Asia, Africa, and around the</span>
        <span className="block">globe, while also exporting Saudi-made products to international markets.</span>
      </>
    ) : (
      service.description
    );

  const formattedTitle =
    service.id === "01"
      ? (
        <>
          <span className="whitespace-nowrap">Import &amp; Export</span> Services
        </>
      )
      : service.id === "02"
        ? (
          <>
            <span className="block whitespace-nowrap">Business Setup &amp; Global</span>
            <span className="block whitespace-nowrap">Trade Support</span>
          </>
        )
      : service.id === "03"
        ? (
          <>
            <span className="block whitespace-nowrap">Entrepreneur Development</span>
            <span className="block whitespace-nowrap">Support</span>
          </>
        )
      : service.id === "04"
        ? (
          <>
            <span className="block whitespace-nowrap">Branding &amp; Marketing</span>
            <span className="block whitespace-nowrap">Make Your Brand Stand Out</span>
          </>
        )
      : service.id === "05"
        ? (
          <>
            <span className="block whitespace-nowrap">Business Automation</span>
            <span className="block whitespace-nowrap">Solutions &ndash;Work</span>
            <span className="block whitespace-nowrap">Smarter,Not Harder</span>
          </>
        )
      : service.id === "06"
        ? (
          <>
            <span className="block whitespace-nowrap">Saudi Market Entry Support</span>
            <span className="block whitespace-nowrap">Get Your Products Seen &amp;</span>
            <span className="block whitespace-nowrap">Sold</span>
          </>
        )
      : service.id === "07"
        ? (
          <>
            <span className="block whitespace-nowrap">Global Sourcing Solutions -</span>
            <span className="block whitespace-nowrap">Reliable, Efficient, End-to-</span>
            <span className="block whitespace-nowrap">End</span>
          </>
        )
        : service.title;

  const imageClass =
    service.id === "01"
      ? "h-[240px] w-full object-cover object-bottom sm:h-[300px] md:h-[380px] lg:h-[460px]"
      : "h-[210px] w-full object-cover sm:h-[280px] md:h-[340px] lg:h-[420px]";

  const customHeading =
    service.id === "01" ? (
      <div className="mb-3 flex items-center gap-2 sm:mb-4">
        <span className="size-2 rounded-full bg-[#181818]" />
        <h3 className="font-['Poppins',sans-serif] text-lg font-semibold text-[#181818] sm:text-[1.1rem]">What We do</h3>
      </div>
    ) : null;

  const articleClass =
    service.id === "01"
      ? "rounded-[14px] border border-[#dbe6ff] bg-white px-4 py-5 shadow-[0_18px_45px_rgba(0,0,0,0.06)] sm:px-7 sm:py-8 lg:px-8 lg:py-8"
      : "rounded-[14px] bg-white px-4 py-5 shadow-[0_18px_45px_rgba(0,0,0,0.06)] sm:px-7 sm:py-8 lg:px-8 lg:py-8";

  const gridClass =
    service.id === "01"
      ? "grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.7fr)] lg:items-center"
      : "grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.7fr)] lg:items-start";

  return (
    <article ref={ref} className={articleClass}>
      <div className={gridClass}>
        <div>
          <ServiceBadge id={service.id} />

          <h2 className={titleClassName}>
            {formattedTitle}
          </h2>

          <p className="mt-4 max-w-[42rem] font-['Poppins',sans-serif] text-[15px] leading-7 text-[#434343] sm:mt-5 sm:text-base sm:leading-8">
            {formattedDescription}
          </p>

          <a
            className="mt-7 inline-flex w-full items-center justify-center rounded-[8px] bg-[#5f0c66] px-6 py-3.5 text-center font-['Poppins',sans-serif] text-sm font-semibold text-white transition hover:bg-[#74217a] sm:mt-8 sm:w-auto sm:px-8 sm:py-4 sm:text-base"
            href="#contact"
          >
            Schedule a Consultation
          </a>
        </div>

        <ServiceFeatureList features={service.features} heading={customHeading} />
      </div>

      <div className="relative mt-8 overflow-hidden rounded-[12px]">
        <Image
          alt={service.title}
          className={imageClass}
          height={420}
          sizes="(max-width: 1024px) 100vw, 1333px"
          src={service.image}
          width={1333}
          priority={true}
        />
      </div>
    </article>
  );
}

const ServiceSection = forwardRef(ServiceSectionBase);

export default ServiceSection;


