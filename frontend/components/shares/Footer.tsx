// @ts-nocheck
"use client";

import Link from "next/link";
import Image from "next/image";
import { assets } from "../data";

export default function Footer() {
  return (
    <footer className="bg-[#5f0c66] pb-24 pt-24 text-white">
      <div className="mx-auto grid max-w-[1444px] grid-cols-2 gap-x-8 gap-y-14 px-4 sm:px-6 md:grid-cols-[1.2fr_0.75fr_0.75fr] md:gap-x-6 lg:px-10">
        <div className="col-span-2 md:col-span-1 lg:pl-10">
          <div className="relative -top-7 inline-block">
            <Image
              alt="Tijaruk"
              className="h-auto w-[96px]"
              height={48}
              sizes="96px"
              src={assets.logo}
              width={96}
            />
          </div>
          <p className="relative -top-3 max-w-none font-['Poppins',sans-serif] text-sm leading-6 text-white/80">
            <span className="block whitespace-nowrap">With Tijaruk, your trade and business journey</span> 
            <span className="block">moves forward into a new beginning.</span>
          </p>
          <form className="relative left-1/2 mt-20 flex w-[calc(100vw-24px)] max-w-none -translate-x-1/2 flex-col gap-4 md:left-auto md:w-full md:max-w-md md:translate-x-0 md:flex-row md:gap-3" action="#">
            <input
              className="min-h-[76px] w-full flex-1 rounded-[8px] border border-white/25 bg-transparent px-5 text-base text-white outline-none placeholder:text-white/55 focus:border-[#e39b4d] md:min-h-0 md:h-12 md:rounded-[6px] md:border-white/20 md:px-4 md:text-sm"
              placeholder="E-mail address"
              type="email"
            />
            <button
              className="h-14 rounded-[6px] bg-[#e39b4d] px-7 text-base font-semibold text-[#4d0d54] transition hover:bg-[#f0b163] md:h-12 md:px-6 md:text-sm"
              type="submit"
            >
              Subscribe
            </button>
          </form>
        </div>

        <div className="md:justify-self-end">
          <div className="inline-block min-w-[120px]">
            <p className="whitespace-nowrap font-['Poppins',sans-serif] text-xl font-semibold text-[#e39b4d]">
              Follow Us
            </p>
            <ul className="mt-3 space-y-1 font-['Poppins',sans-serif] text-white/85">
              <li>
                <Link
                  className="block transition hover:text-white"
                  href="https://facebook.com"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Facebook
                </Link>
              </li>
              <li>
                <Link
                  className="block transition hover:text-white"
                  href="https://instagram.com"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Instagram
                </Link>
              </li>
              <li>
                <Link
                  className="block transition hover:text-white"
                  href="https://linkedin.com"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  LinkedIn
                </Link>
              </li>
              <li>
                <Link
                  className="block transition hover:text-white"
                  href="https://youtube.com"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Youtube
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div>
            <p className="font-['Poppins',sans-serif] text-xl font-semibold text-[#e39b4d]">Explore</p>
          <ul className="mt-2 space-y-1 font-['Poppins',sans-serif] text-white/85">
            <li><Link className="block transition hover:text-white" href="/">Home</Link></li>
            <li><Link className="block transition hover:text-white" href="/about">About Us</Link></li>
            <li><Link className="block transition hover:text-white" href="/services">Services</Link></li>
            <li><Link className="block transition hover:text-white" href="/contact">Contact Us</Link></li>
            <li><Link className="block transition hover:text-white" href="/products/domestic">Domestic</Link></li>
            <li><Link className="block transition hover:text-white" href="/products/international">International</Link></li>
            <li><Link className="block transition hover:text-white" href="/sourcing">Sourcing</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

