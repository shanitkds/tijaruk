// @ts-nocheck
"use client";

import Image from "next/image";
import {
  Box,
  Check,
  Package,
  Search,
  Settings,
  Ship,
  Target,
  Zap,
} from "lucide-react";
import Footer from "../shares/Footer";
import Navbar from "../shares/Navbar";

const HERO_IMAGE =
  "/international/hero.webp";

const ABOUT_IMAGE =
  "/international/white.webp";

const highlights = [
  {
    title: "No Manufacturing Required",
    description:
      "We connect you with vetted factories that meet your exact specifications.",
    icon: Ship,
    imageIcon: "/icons/white-labeling-manufacturing.png",
  },
  {
    title: "Faster Time to Market",
    description: "Launch in weeks, not months. Skip years of production setup.",
    icon: Zap,
  },
  {
    title: "Full Brand Ownership",
    description:
      "Your name, your logo, your packaging - complete brand control.",
    icon: Target,
  },
];

const services = [
  {
    title: "Product Sourcing",
    description:
      "Access our curated network of 500+ verified manufacturers across Asia, Europe, and beyond to find the perfect product match for your brand.",
    icon: Search,
    tone: "light",
  },
  {
    title: "Private Label Manufacturing",
    description:
      "Custom-formulated or specification-based products manufactured exclusively for your brand with full NDAs and exclusivity agreements.",
    icon: Box,
    tone: "dark",
  },
  {
    title: "Branding & Packaging",
    description:
      "Complete design services including label design, packaging development, and brand identity that makes your product stand out on any shelf.",
    icon: Package,
    tone: "light",
  },
  {
    title: "Custom Product Development",
    description:
      "From concept to prototype - our R&D teams work with you to develop entirely new products tailored to your market's demands.",
    icon: Settings,
    tone: "dark",
  },
  {
    title: "Quality Inspection",
    description:
      "Rigorous third-party quality audits, in-line production checks, and pre-shipment inspections ensuring every unit meets your standards.",
    icon: Check,
    tone: "light",
  },
  {
    title: "Logistics Support",
    description:
      "Full freight forwarding, customs clearance, warehousing, and last-mile delivery solutions so your products arrive on time, every time.",
    icon: Ship,
    tone: "dark",
  },
];

const inquiryBenefits = [
  "Confidential & secure submissions",
  "Dedicated account manager assigned",
  "No obligation, free consultation",
  "Response within 48 business hours",
];

function RequiredLabel({ children }) {
  return (
    <label className="font-['Poppins',sans-serif] text-[13px] font-medium text-[#313131] sm:text-[15px] lg:text-[18px]">
      {children} <span className="text-[#e39b4d]">*</span>
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="mt-2 h-12 w-full rounded-[5px] border-[2px] border-[#dadada] bg-white px-3 font-['Poppins',sans-serif] text-sm text-[#2b2b2b] outline-none transition placeholder:text-[#8a8a8a] focus:border-[#5f0c66] sm:h-14"
    />
  );
}

function TextArea(props) {
  const { className = "", ...rest } = props;

  return (
    <textarea
      {...rest}
      className={`mt-2 min-h-[142px] w-full resize-y rounded-[5px] border-[2px] border-[#b5b5b5]/50 bg-white px-3 py-3 font-['Poppins',sans-serif] text-sm text-[#2b2b2b] outline-none transition placeholder:text-[#8a8a8a] focus:border-[#5f0c66] ${className}`}
    />
  );
}

function SelectInput(props) {
  return (
    <select
      {...props}
      className="mt-2 h-12 w-full rounded-[5px] border-[2px] border-[#dadada] bg-white px-3 font-['Poppins',sans-serif] text-sm text-[#6c6c6c] outline-none transition focus:border-[#5f0c66] sm:h-14"
    />
  );
}

export default function WhiteLabelingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f5f5] text-[#161616]">
      <section className="px-4 pb-10 pt-3 sm:px-6 sm:pb-14 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <Navbar />

          <div className="relative mt-2 h-[390px] overflow-hidden rounded-[12px] sm:mt-3 sm:h-[470px] lg:h-[549px]">
            <Image
              alt="Container ship carrying products for white labeling"
              className="h-full w-full object-cover"
              fill
              priority
              sizes="100vw"
              src={HERO_IMAGE}
            />
            <div className="absolute inset-0 bg-[rgba(34,0,37,0.70)]" />

            <div className="relative flex h-full items-center px-6 sm:px-8 lg:px-[4rem]">
              <div className="max-w-[780px] translate-y-8 text-white sm:translate-y-10 lg:translate-y-12">
                <h1 className="font-ibrand text-[2.85rem] leading-[0.96] sm:text-[3.6rem] lg:text-[4rem]">
                  White Labeling
                  <span className="block">Solutions</span>
                </h1>
                <p className="mt-5 max-w-[760px] font-['Poppins',sans-serif] text-[15px] leading-[1.65] text-white/95 sm:text-[18px] lg:text-[20px] lg:leading-[1.45]">
                  Launch high-quality products under your own brand with
                  complete white labeling support - from sourcing to shelf.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-12 sm:pb-16 lg:pb-22">
        <div className="mx-auto grid max-w-[1440px] items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.82fr] lg:gap-12 lg:px-10">
          <div>
            <p className="font-['Poppins',sans-serif] text-sm font-medium text-[#5f0c66] sm:text-base lg:text-xl">
              What is White Labeling?
            </p>
            <h2 className="mt-2 max-w-[720px] font-ibrand text-[2rem] leading-[1] text-black sm:text-[2.55rem] lg:text-[2.85rem]">
              Launch Your Brand Without the Manufacturing Overhead
            </h2>

            <div className="mt-5 max-w-[650px] space-y-4 font-['Poppins',sans-serif] text-[14px] leading-[1.65] text-[#7c7c7c] sm:text-[15px] lg:text-[16px] text-justify">
              <p>
                White labeling allows businesses to source finished products
                from specialized manufacturers and sell them under their own
                brand name. It&apos;s the fastest, most cost-effective way to
                bring high-quality products to market - without building
                factories or supply chains from scratch.
              </p>
              <p>
                We handle every step of the process so you can focus entirely on
                marketing, sales, and growing your brand.
              </p>
            </div>

            <div className="mt-6 max-w-[650px] space-y-4 lg:mt-8">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    className="grid min-h-[82px] grid-cols-[56px_1fr] items-center gap-4 rounded-[10px] bg-white p-3 shadow-[2px_2px_9px_2px_rgba(0,0,0,0.14)] sm:grid-cols-[62px_1fr] sm:p-3.5"
                    key={item.title}
                  >
                    <div className="flex size-14 items-center justify-center rounded-[5px] bg-[#5f0c66] text-white sm:size-[62px]">
                      {item.imageIcon ? (
                        <Image
                          alt=""
                          aria-hidden="true"
                          className="h-8 w-8 object-contain sm:h-9 sm:w-9"
                          height={36}
                          src={item.imageIcon}
                          width={36}
                        />
                      ) : (
                        <Icon aria-hidden="true" className="size-7 sm:size-8" strokeWidth={1.8} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-['Poppins',sans-serif] text-[16px] font-medium text-[#313131] sm:text-[18px]">
                        {item.title}
                      </h3>
                      <p className="mt-1 font-['Poppins',sans-serif] text-[13px] leading-[1.45] text-[#6f6f6f] sm:text-[14px] text-justify">
                        {item.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="relative h-full w-full overflow-hidden rounded-[16px] border border-[#dadada] shadow-[0_24px_55px_rgba(0,0,0,0.12)]">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="h-full min-h-[340px] w-full object-cover sm:min-h-[420px] lg:min-h-[650px]"
              src="/products/producthero.webm"
            />
          </div>
        </div>
      </section>

      <section className="pb-16 sm:pb-24 lg:pb-32">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[620px] text-center">
            <p className="font-['Poppins',sans-serif] text-sm font-medium text-[#5f0c66] sm:text-base lg:text-2xl">
              What We Offer
            </p>
            <h2 className="mt-2 font-ibrand text-[2.35rem] leading-none text-black sm:text-[3.1rem] lg:text-[3.35rem]">
              Our White Label Services
            </h2>
            <p className="mt-4 font-['Poppins',sans-serif] text-[14px] leading-[1.65] text-[#7c7c7c] sm:text-[16px] lg:text-[18px]">
              End-to-end support across the entire product lifecycle - from raw
              sourcing to final delivery.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {services.map((service) => {
              const Icon = service.icon;
              const isDark = service.tone === "dark";

              return (
                <article
                  className={`min-h-[267px] rounded-[10px] p-6 shadow-[0_4px_8px_2px_rgba(0,0,0,0.22)] sm:p-7 ${
                    isDark ? "bg-[#5f0c66] text-white" : "bg-white text-black"
                  }`}
                  key={service.title}
                >
                  <div
                    className={`flex h-[57px] w-[59px] items-center justify-center rounded-[5px] ${
                      isDark ? "bg-white text-[#5f0c66]" : "bg-[#5f0c66] text-white"
                    }`}
                  >
                    <Icon aria-hidden="true" className="size-8" strokeWidth={1.8} />
                  </div>
                  <h3 className="mt-8 font-['Poppins',sans-serif] text-xl font-medium leading-snug">
                    {service.title}
                  </h3>
                  <p
                    className={`mt-3 font-['Poppins',sans-serif] text-[15px] leading-[1.65] ${
                      isDark ? "text-[#f9f9f9]" : "text-[#4d4d4d]"
                    }`}
                  >
                    {service.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pb-20 sm:pb-28 lg:pb-32">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16 lg:px-10">
          <aside className="lg:pt-4">
            <p className="font-['Poppins',sans-serif] text-sm font-semibold text-[#5f0c66] sm:text-xl">
              Product Inquiry
            </p>
            <h2 className="mt-3 font-['Poppins',sans-serif] text-[2.45rem] font-semibold leading-[1.08] text-[#2b2b2b] sm:text-[3rem]">
              Request a Quote
            </h2>
            <p className="mt-6 max-w-[470px] font-['Poppins',sans-serif] text-[16px] leading-[1.7] text-black lg:text-[18px]">
              Tell us about your product requirements and our sourcing team will
              get back to you within 48 business hours with a tailored proposal.
            </p>

            <ul className="mt-8 space-y-3 font-['Poppins',sans-serif] text-[16px] leading-snug text-black lg:text-[18px]">
              {inquiryBenefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <span className="mt-2 h-[7px] w-[7px] shrink-0 rounded-full bg-[#5f0c66]" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex min-h-[228px] max-w-[259px] items-center justify-center rounded-[5px] bg-white p-4 text-center font-['Poppins',sans-serif] text-sm font-semibold text-[#5f0c66] shadow-sm">
              Product Image
            </div>
          </aside>

          <form
            action="#"
            className="rounded-[30px] border border-[#dadada] bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.04)] sm:p-8 lg:p-12"
          >
            <h3 className="font-['Poppins',sans-serif] text-[2rem] leading-tight text-black sm:text-[2.7rem] lg:text-[43px]">
              Product Requirements Form
            </h3>

            <div className="mt-8">
              <RequiredLabel>Product Category</RequiredLabel>
              <SelectInput defaultValue="">
                <option value="" disabled>
                  Select a Category
                </option>
                <option>Food & Grocery</option>
                <option>Consumer Goods</option>
                <option>Industrial Products</option>
                <option>Health & Beauty</option>
              </SelectInput>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <RequiredLabel>Product Name</RequiredLabel>
                <TextInput type="text" />
              </div>
              <div>
                <RequiredLabel>Required Quantity</RequiredLabel>
                <TextInput type="text" />
              </div>
            </div>

            <div className="mt-6">
              <RequiredLabel>Product Description</RequiredLabel>
              <TextArea className="min-h-[166px]" />
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <RequiredLabel>Branding Requirements</RequiredLabel>
                <TextInput type="text" />
              </div>
              <div>
                <RequiredLabel>Packaging Preferences</RequiredLabel>
                <TextInput type="text" />
              </div>
              <div>
                <label className="font-['Poppins',sans-serif] text-[13px] font-medium text-[#313131] sm:text-[15px] lg:text-[18px]">
                  Target Market / Country
                </label>
                <TextInput type="text" />
              </div>
              <div>
                <label className="font-['Poppins',sans-serif] text-[13px] font-medium text-[#313131] sm:text-[15px] lg:text-[18px]">
                  Company Name
                </label>
                <TextInput type="text" />
              </div>
              <div>
                <RequiredLabel>Contact Person</RequiredLabel>
                <TextInput type="text" />
              </div>
              <div>
                <RequiredLabel>Email Address</RequiredLabel>
                <TextInput type="email" />
              </div>
            </div>

            <div className="mt-6">
              <RequiredLabel>Phone Number</RequiredLabel>
              <TextInput type="tel" />
            </div>

            <div className="mt-6">
              <RequiredLabel>Additional Requirements</RequiredLabel>
              <TextArea className="min-h-[225px]" />
            </div>

            <button
              className="mt-8 h-[60px] w-full rounded-[5px] bg-[#5f0c66] font-['Poppins',sans-serif] text-base font-semibold text-white shadow-[4px_4px_9px_2px_rgba(0,0,0,0.25)] transition hover:bg-[#76117e] sm:text-lg"
              type="submit"
            >
              Send RFQ
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
