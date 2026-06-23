// @ts-nocheck
"use client";

import Image from "next/image";
import { useDeferredValue, useEffect, useState } from "react";
import Footer from "../shares/Footer";
import Navbar from "../shares/Navbar";
import { productCards, productCategories, productsHero } from "./productsData";
import ProductCard from "./ProductCard";
import ProductsSearchBar from "./ProductsSearchBar";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const deferredSearch = useDeferredValue(searchTerm);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredProducts = productCards.filter((product) => {
    const matchesCategory =
      activeCategory === "All" || product.category === activeCategory;
    const matchesSearch =
      deferredSearch.trim() === "" ||
      `${product.name} ${product.category} ${product.description}`
        .toLowerCase()
        .includes(deferredSearch.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f5f5] text-[#151515]">
      <section className="relative isolate overflow-hidden text-white">
        <div className="absolute inset-0">
          <Image
            alt="Products hero"
            className="h-full w-full object-cover"
            fill
            sizes="100vw"
            src={productsHero.image}
          />
          {isMounted && productsHero.video && (
            <video
              autoPlay
              loop
              muted
              playsInline
              poster={productsHero.image}
              className="motion-reduce:hidden absolute inset-0 h-full w-full object-cover"
              preload="auto"
            >
              <source src={productsHero.video} type="video/webm" />
            </video>
          )}
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(95,12,102,0.92)_0%,rgba(128,0,139,0.62)_58%,rgba(34,0,37,0.18)_100%)]" />

        <div className="relative mx-auto max-w-[1440px] px-4 pb-16 pt-8 sm:px-6 lg:px-10 lg:pb-20">
          <Navbar />

          <div className="flex min-h-[300px] flex-col items-center justify-center pt-10 text-center sm:min-h-[360px] lg:min-h-[370px]">
            <h1 className="font-ibrand text-[3rem] leading-none text-white sm:text-[4rem]">
              {productsHero.title}
            </h1>
          </div>
        </div>
      </section>

      <section className="pb-16 pt-8 sm:pb-20 lg:pb-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <ProductsSearchBar
            activeCategory={activeCategory}
            categories={productCategories}
            isFilterOpen={isFilterOpen}
            searchTerm={searchTerm}
            setActiveCategory={setActiveCategory}
            setIsFilterOpen={setIsFilterOpen}
            setSearchTerm={setSearchTerm}
          />

          <div className="mx-auto mt-12 grid max-w-[1040px] gap-x-6 gap-y-8 sm:grid-cols-2 md:grid-cols-3">
            {filteredProducts.map((product, index) => (
              <ProductCard compact key={product.slug} product={product} priority={index < 3} />
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="mt-16 rounded-[18px] border border-dashed border-[#d3cbd7] bg-white px-6 py-12 text-center">
              <h2 className="font-ibrand text-[2rem] text-[#5f0c66]">No products found</h2>
              <p className="mt-3 font-['Poppins',sans-serif] text-[15px] leading-7 text-[#6b6b6b]">
                Try another search term or switch the category filter to explore more items.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <Footer />
    </main>
  );
}

