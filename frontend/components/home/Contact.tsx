// @ts-nocheck
import { ArrowIcon } from "../ui";

export default function Contact() {
  return (
    <section
      id="contact"
      className="flex items-center bg-[#fcfbfb] px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-14 xl:min-h-screen xl:py-24"
    >
      <div className="flex w-full max-w-[1440px] flex-col justify-center">
        <div className="mx-auto w-full max-w-[1040px] text-left">
          <h2 className="relative -mt-4 inline-block font-ibrand text-[2rem] font-medium leading-[0.96] text-[#5f0c66] sm:-mt-2 sm:text-[2.5rem] lg:-mt-2 lg:text-[2.7rem] xl:-mt-6">
            Let&apos;s get <br className="hidden sm:block" />
            in touch
          </h2>
        </div>

        <div className="relative mx-auto mt-5 w-full max-w-[1040px] overflow-hidden rounded-[18px] bg-[#5f0c66] px-5 pb-10 pt-12 shadow-[0_28px_70px_rgba(95,12,102,0.24)] sm:px-6 sm:pb-12 sm:pt-12 xl:mt-8 lg:px-8 lg:pb-14 lg:pt-14">
          <div className="absolute inset-0 opacity-[0.04]">
            <img
              alt=""
              className="size-full object-cover"
              decoding="async"
              loading="lazy"
              src="/sourcing/rfq-pattern.webp"
            />
          </div>

          <form className="relative grid gap-3.5 lg:grid-cols-2 lg:gap-x-4 lg:gap-y-3" action="#">
            <label className="block">
              <span className="mb-3 block font-['Poppins',sans-serif] text-sm text-white">
                Full Name<span className="text-[#e39b4d]">*</span>
              </span>
              <input
                className="h-11 w-full rounded-[8px] border border-[#bababa] px-4 font-['Poppins',sans-serif] text-[#212121] outline-none transition focus:border-[#e39b4d]"
                placeholder="Enter full name"
                type="text"
              />
            </label>

            <label className="block">
              <span className="mb-3 block font-['Poppins',sans-serif] text-sm text-white">
                Email Address<span className="text-[#e39b4d]">*</span>
              </span>
              <input
                className="h-11 w-full rounded-[8px] border border-[#bababa] px-4 font-['Poppins',sans-serif] text-[#212121] outline-none transition focus:border-[#e39b4d]"
                placeholder="E-mail address"
                type="email"
              />
            </label>

            <label className="block">
              <span className="mb-3 block font-['Poppins',sans-serif] text-sm text-white">
                Phone Number<span className="text-[#e39b4d]">*</span>
              </span>
              <input
                className="h-11 w-full rounded-[8px] border border-[#bababa] px-4 font-['Poppins',sans-serif] text-[#212121] outline-none transition focus:border-[#e39b4d]"
                placeholder="Enter phone number"
                type="tel"
              />
            </label>

            <label className="block">
              <span className="mb-3 block font-['Poppins',sans-serif] text-sm text-white">
                Select Subject<span className="text-[#e39b4d]">*</span>
              </span>
              <select className="h-11 w-full rounded-[8px] border border-[#bababa] bg-white px-4 font-['Poppins',sans-serif] text-[#7e7e7e] outline-none transition focus:border-[#e39b4d]">
                <option>Subject</option>
                <option>Import & Export Solutions</option>
                <option>Business Setup in KSA</option>
                <option>Branding & Marketing</option>
              </select>
            </label>

            <label className="block lg:col-span-2">
              <span className="mb-3 block font-['Poppins',sans-serif] text-sm text-white">
                Message<span className="text-[#e39b4d]">*</span>
              </span>
              <textarea
                className="min-h-[132px] w-full rounded-[8px] border border-[#bababa] px-4 py-3 font-['Poppins',sans-serif] text-[#212121] outline-none transition focus:border-[#e39b4d] sm:min-h-[144px]"
                placeholder="Message"
              />
            </label>

            <div className="flex justify-center lg:col-span-2 lg:justify-start">
              <button
                className="inline-flex min-h-[52px] items-center gap-3 rounded-[8px] bg-white px-9 font-['Poppins',sans-serif] text-base font-semibold text-[#5f0c66] transition hover:bg-[#f4dcb8]"
                type="submit"
              >
                Send Enquiry
                <ArrowIcon className="size-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

