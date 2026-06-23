// @ts-nocheck
import Image from "next/image";

export function ArrowIcon({ className = "size-4" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function StarIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m12 2.5 2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 17.56l-5.9 3.11 1.13-6.57L2.45 9.44l6.6-.96L12 2.5Z" />
    </svg>
  );
}

export function BenefitIcon({ type }) {
  const iconClassName = "size-12 text-[#5f0c66]";

  if (type === "handshake") {
    return (
      <Image
        alt=""
        className="size-12"
        height={48}
        sizes="48px"
        src="/icons/handshake.png"
        width={48}
      />
    );
  }

  if (type === "globe") {
    return (
      <Image
        alt=""
        className="size-12"
        height={48}
        sizes="48px"
        src="/icons/vectorum.png"
        width={48}
      />
    );
  }

  if (type === "spark") {
    return (
      <Image
        alt=""
        className="size-12"
        height={48}
        sizes="48px"
        src="/icons/trande.png"
        width={48}
      />
    );
  }

  if (type === "logistics") {
    return (
      <Image
        alt=""
        className="size-12"
        height={48}
        sizes="48px"
        src="/icons/logistics.png"
        width={48}
      />
    );
  }

  if (type === "check") {
    return (
      <Image
        alt=""
        className="size-12"
        height={48}
        sizes="48px"
        src="/icons/tick.png"
        width={48}
      />
    );
  }

  if (type === "support") {
    return (
      <Image
        alt=""
        className="size-12"
        height={48}
        sizes="48px"
        src="/icons/support.png"
        width={48}
      />
    );
  }

  if (type === "personal-business") {
    return (
      <Image
        alt=""
        className="size-12"
        height={48}
        sizes="48px"
        src="/icons/personal-business.png"
        width={48}
      />
    );
  }

  if (type === "entrepreneurs") {
    return (
      <Image
        alt=""
        className="size-12"
        height={48}
        sizes="48px"
        src="/icons/entrepreneurs.png"
        width={48}
      />
    );
  }

  return (
    <svg aria-hidden="true" className={iconClassName} fill="none" viewBox="0 0 24 24">
      <path
        d="M12 3v18M3 12h18m-4.5-7.5L7.5 19.5m0-15 9 15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function SectionTag({ children, className = "" }) {
  return (
    <p
      className={`text-sm font-semibold normal-case tracking-normal text-[#e39b4d] sm:text-base ${className}`}
    >
      {children}
    </p>
  );
}

