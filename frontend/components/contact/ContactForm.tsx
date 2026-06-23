// @ts-nocheck
"use client";

import { useState } from "react";
import { contactSubjects } from "./contactData";

function ArrowIcon() {
  return (
    <svg
      className="h-5 w-5"
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
  );
}

const fieldClassName =
  "h-[52px] w-full rounded-[8px] border border-[#bababa] bg-[#e5e5e5] px-4 font-['Poppins',sans-serif] text-sm text-[#232323] outline-none transition focus:border-[#5f0c66] focus:bg-white";

const labelClassName =
  "mb-3 block font-['Poppins',sans-serif] text-[13px] text-[#222222]";

export default function ContactForm() {
  const [subject, setSubject] = useState(contactSubjects[0]);

  return (
    <form action="#" className="grid gap-5 lg:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
      <label className="block">
        <span className={labelClassName}>
          Full Name<span className="text-[#e39b4d]">*</span>
        </span>
        <input className={fieldClassName} placeholder="Enter full name" type="text" />
      </label>

      <label className="block">
        <span className={labelClassName}>
          Email Address<span className="text-[#e39b4d]">*</span>
        </span>
        <input className={fieldClassName} placeholder="E-mail address" type="email" />
      </label>

      <label className="block">
        <span className={labelClassName}>
          Phone Number<span className="text-[#e39b4d]">*</span>
        </span>
        <input className={fieldClassName} placeholder="Enter phone number" type="tel" />
      </label>

      <label className="block">
        <span className={labelClassName}>
          Select Subject<span className="text-[#e39b4d]">*</span>
        </span>
        <div className="relative">
          <select
            className={`${fieldClassName} appearance-none pr-10 text-[#7e7e7e]`}
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          >
            {contactSubjects.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7e7e7e]">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </div>
      </label>

      <label className="block lg:col-span-2">
        <span className={labelClassName}>
          Message<span className="text-[#e39b4d]">*</span>
        </span>
        <textarea
          className="min-h-[124px] w-full rounded-[8px] border border-[#bababa] bg-[#e5e5e5] px-4 py-3 font-['Poppins',sans-serif] text-sm text-[#232323] outline-none transition focus:border-[#5f0c66] focus:bg-white"
          placeholder="Message"
        />
      </label>

      <div className="lg:col-span-2">
        <button
          className="inline-flex h-[58px] items-center gap-3 rounded-[8px] bg-[#5f0c66] px-8 font-['Poppins',sans-serif] text-[18px] font-semibold text-white transition hover:bg-[#74217a]"
          type="submit"
        >
          Send Enquiry
          <ArrowIcon />
        </button>
      </div>
    </form>
  );
}

