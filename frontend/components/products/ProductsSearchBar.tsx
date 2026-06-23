// @ts-nocheck
"use client";

function SearchIcon({ className = "" }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function FilterIcon({ className = "" }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M4 7h16" />
      <path d="M7 12h10" />
      <path d="M10 17h4" />
    </svg>
  );
}

function DotsIcon({ className = "" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="5" r="2.2" />
      <circle cx="12" cy="12" r="2.2" />
      <circle cx="12" cy="19" r="2.2" />
    </svg>
  );
}

export default function ProductsSearchBar({
  activeCategory,
  categories,
  isFilterOpen,
  searchTerm,
  setActiveCategory,
  setIsFilterOpen,
  setSearchTerm,
}) {
  return (
    <div className="relative mx-auto w-full max-w-[860px]">
      <div className="flex items-center gap-2 sm:gap-3">
        <label className="relative flex-1">
          <input
            className="h-[46px] w-full rounded-[999px] border-none bg-[#5f0c66] pl-5 pr-12 font-['Poppins',sans-serif] text-[14px] text-white outline-none placeholder:text-white/85 sm:h-[52px] sm:pl-6 sm:pr-14 sm:text-[15px]"
            placeholder="Search"
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <SearchIcon className="absolute right-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white sm:right-5 sm:h-5 sm:w-5" />
        </label>

        <button
          aria-expanded={isFilterOpen}
          aria-label="Filter products"
          className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-white text-[#5f0c66] shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition hover:bg-[#f7edf8] sm:h-[52px] sm:w-[52px]"
          type="button"
          onClick={() => setIsFilterOpen((value) => !value)}
        >
          <DotsIcon className="h-[18px] w-[18px] sm:hidden" />
          <FilterIcon className="hidden h-5 w-5 sm:block" />
        </button>
      </div>

      {isFilterOpen ? (
        <div className="absolute right-0 z-20 mt-3 w-[min(240px,calc(100vw-2rem))] rounded-[14px] border border-[#e8e1eb] bg-white p-3 shadow-[0_18px_40px_rgba(27,0,30,0.16)]">
          <p className="px-2 pb-2 font-['Poppins',sans-serif] text-[12px] font-semibold uppercase tracking-[0.16em] text-[#8c5b93]">
            Filter Category
          </p>

          <div className="space-y-1">
            {categories.map((category) => {
              const isActive = activeCategory === category;

              return (
                <button
                  key={category}
                  className={`flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-left font-['Poppins',sans-serif] text-sm transition ${
                    isActive
                      ? "bg-[#5f0c66] text-white"
                      : "text-[#4d4d4d] hover:bg-[#f6f1f8]"
                  }`}
                  type="button"
                  onClick={() => {
                    setActiveCategory(category);
                    setIsFilterOpen(false);
                  }}
                >
                  <span>{category}</span>
                  {isActive ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

