// @ts-nocheck
import Image from "next/image";
import Link from "next/link";
import Footer from "../shares/Footer";
import Navbar from "../shares/Navbar";
import ContactForm from "./ContactForm";
import { contactHero, contactInfoCards } from "./contactData";

function PhoneIcon() {
  return (
    <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6.6 10.8c1.6 3.1 4.1 5.6 7.2 7.2l2.4-2.4c.3-.3.8-.4 1.2-.3 1 .3 2.1.5 3.2.5.7 0 1.2.5 1.2 1.2V21c0 .7-.5 1.2-1.2 1.2C11.7 22.2 1.8 12.3 1.8 1.8 1.8 1.1 2.3.6 3 .6h3.6c.7 0 1.2.5 1.2 1.2 0 1.1.2 2.2.5 3.2.1.4 0 .9-.3 1.2l-2.4 2.4Z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.2a7.4 7.4 0 0 0-7.4 7.4c0 5.7 7.4 12.2 7.4 12.2s7.4-6.5 7.4-12.2A7.4 7.4 0 0 0 12 2.2Zm0 10.3a2.9 2.9 0 1 1 0-5.8 2.9 2.9 0 0 1 0 5.8Z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
      <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-13Zm2.1.2 6.9 5.7 6.9-5.7H5.1Zm13.8 2.4-6.1 5a1.3 1.3 0 0 1-1.6 0l-6.1-5v10.4c0 .2.2.4.4.4h13c.2 0 .4-.2.4-.4V8.1Z" />
    </svg>
  );
}

function ContactInfoIcon({ id }) {
  if (id === "phone") {
    return <PhoneIcon />;
  }

  if (id === "address") {
    return <LocationIcon />;
  }

  return <EmailIcon />;
}

function ContactInfoCard({ item }) {
  const isAddress = item.id === "address";

  return (
    <article className="rounded-[16px] bg-white p-[18px] shadow-[0_3px_7px_rgba(0,0,0,0.16)]">
      <div className="flex h-[64px] w-[64px] items-center justify-center rounded-[13px] bg-[#5f0c66] text-white">
        <ContactInfoIcon id={item.id} />
      </div>

      <div className="mt-[18px] border-t border-dashed border-[#c9c9c9] pt-[18px]">
        <h2 className="font-ibrand text-[1.55rem] leading-[1.1] text-black sm:text-[1.65rem]">{item.title}</h2>
        <Link
          className={`mt-3 block font-['Poppins',sans-serif] text-[15px] leading-[1.5] text-[#808080] transition hover:text-[#5f0c66] ${isAddress ? "max-w-[285px]" : ""}`}
          href={item.href}
          target={item.id === "address" ? "_blank" : undefined}
        >
          {item.value}
        </Link>
      </div>
    </article>
  );
}

export default function ContactPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f5f5] text-[#1a1a1a]">
      <section className="px-4 pb-14 pt-8 sm:px-6 lg:px-10 lg:pb-20">
        <div className="mx-auto max-w-[1440px]">
          <Navbar />

          <div className="mx-auto mt-12 max-w-[1100px] text-center">
            <div className="mx-auto inline-flex h-[52px] items-center justify-center rounded-[7px] border border-[#b3b3b3] px-7">
              <span className="font-ibrand text-[1.6rem] text-black">{contactHero.tag}</span>
            </div>

            <h1 className="mx-auto mt-10 max-w-[440px] font-ibrand text-[2.7rem] leading-[0.95] text-black sm:text-[3.5rem] lg:text-[3.9rem]">
              {contactHero.title}
            </h1>

            <div className="mx-auto mt-8 max-w-[1020px] space-y-4 font-['Poppins',sans-serif] text-[15px] leading-[26px] text-[#6b6b6b] sm:text-[18px]">
              {contactHero.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <section className="mt-12 rounded-[7px] bg-white p-4 sm:p-6 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[488px_minmax(0,1fr)] lg:items-start">
              <div className="overflow-hidden rounded-[4px]">
                <Image
                  alt="Contact conversation"
                  className="h-[360px] w-full object-cover sm:h-[520px] lg:h-[681px]"
                  height={681}
                   loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 488px"
                  src={contactHero.image}
                  width={488}
                />
              </div>

              <div className="pt-2 lg:px-2">
                <h2 className="font-ibrand text-[2.7rem] leading-none text-[#4b4b4b] sm:text-[3.2rem]">
                  Start the Conversation
                </h2>
                <div className="mt-8">
                  <ContactForm />
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto mt-11 grid max-w-[1120px] gap-5 lg:grid-cols-3">
            {contactInfoCards.map((item) => (
              <ContactInfoCard key={item.id} item={item} />
            ))}
          </section>

          <section className="mt-8 overflow-hidden rounded-[4px] border border-[#dedede] bg-[#f0f0f0]">
            <iframe
              aria-label="Tijaruk office location on Google Maps"
              className="h-[320px] w-full border-0 sm:h-[420px] lg:h-[681px]"
              loading="eager"
              referrerPolicy="no-referrer-when-downgrade"
              src={contactHero.mapEmbedUrl}
              title="Tijaruk office location on Google Maps"
            />
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}

