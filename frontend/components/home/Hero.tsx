// @ts-nocheck
import { assets } from "../data";
import Navbar from "../shares/Navbar";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative isolate h-[100svh] min-h-[550px] w-full overflow-hidden bg-[#220025]"
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 size-full object-cover object-center"
      >
        <source src={assets.heroVideo} type="video/webm" />
      </video>
      <div className="absolute inset-0 bg-[#220025]/[0.61]" />

      <div className="relative mx-auto flex h-full max-w-[1440px] flex-col px-4 sm:px-6 lg:px-10 lg:pt-4">
        <Navbar />

        <div className="flex flex-1 items-center justify-center pb-0 sm:pb-4 lg:pb-8">
          <div className="mx-auto flex w-full max-w-[860px] flex-col items-center text-center lg:mt-4">
            <h1 className="font-['Poppins',sans-serif] text-[2.65rem] font-semibold leading-[1.02] text-white sm:text-[3.55rem] lg:text-[4.375rem] lg:leading-[1.08]">
              <span className="block">Experts in Global Trade.</span>
              <span className="block">Engineered for Scale.</span>
            </h1>

            <p className="mt-6 max-w-[621px] font-['Poppins',sans-serif] text-[1rem] leading-7 text-white/90 sm:text-[1.125rem] sm:leading-8 lg:mt-7 lg:text-[1.25rem] lg:leading-[1.6]">
              Tijaruk supports businesses in sourcing and trade, helping
              them operate across markets with clarity and confidence.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5 lg:mt-10">
              <a
                href="/products/domestic"
                className="inline-flex h-[46px] min-w-[200px] items-center justify-center rounded-[2px] bg-[#5f0c66] px-8 font-['Poppins',sans-serif] text-[16px] font-medium text-white transition hover:bg-[#74217a] sm:h-[48px] lg:min-w-[220px]"
              >
                Domestic
              </a>
              <a
                href="/products/international"
                className="inline-flex h-[46px] min-w-[200px] items-center justify-center rounded-[2px] bg-white px-8 font-['Poppins',sans-serif] text-[16px] font-medium text-[#5f0c66] transition hover:bg-gray-100 sm:h-[48px] lg:min-w-[220px]"
              >
                International
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

