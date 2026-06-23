"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
} from "lucide-react";
import api from "../../api/axios";
import { dashboardToast } from "../admin/AdminToast";
import ProductCard from "./ProductCard";
import { useUserSearch } from "./UserSearchContext";
import type { ProductSourcing, UserProduct } from "./userDashboardData";

const sourcingFilters: ProductSourcing[] = ["Domestic", "International"];

type ApiProduct = {
  id: number;
  product_name: string;
  product_type: "DOMESTIC" | "INTERNATIONAL";
  category_name: string;
  description: string | null;
  image: string | null;
  price: string;
  minimum_quantity: number;
  unit: number | null;
  unit_name: string | null;
};

export default function UserProductsPage() {
  const router = useRouter();
  const { searchQuery } = useUserSearch();
  const [products, setProducts] = useState<UserProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (loadError) dashboardToast.error("Unable to load products", loadError);
  }, [loadError]);
  const [category, setCategory] = useState("All");
  const [sourcing, setSourcing] = useState<ProductSourcing | "All">("All");
  const [sort, setSort] = useState("Newest");
  const [pageSize, setPageSize] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [requestedIds, setRequestedIds] = useState<number[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const { data } = await api.get<ApiProduct[]>("/products/");
        console.log(data);
        if (!isMounted) {
          return;
        }

        setProducts(
          data.map((product) => ({
            id: product.id,
            name: product.product_name,
            category: product.category_name,
            sourcing:
              product.product_type === "INTERNATIONAL"
                ? "International"
                : "Domestic",
            description: product.description || "",
            image: product.image || "",
            rating: 0,
            reviews: 0,
            minimumQuantity: product.minimum_quantity,
            estimatedPrice: product.price,
            unitId: product.unit,
            unitName: product.unit_name,
          })),
        );
      } catch {
        if (isMounted) {
          setLoadError("Unable to load products.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category))),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return products
      .filter((product) => {
        const matchesCategory = category === "All" || product.category === category;
        const matchesSourcing = sourcing === "All" || product.sourcing === sourcing;
        const matchesSearch = !normalizedQuery || [
          product.name,
          product.category,
          product.description,
          product.sourcing,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));

        return matchesCategory && matchesSourcing && matchesSearch;
      })
      .sort((first, second) => {
        if (sort === "Rating") {
          return second.rating - first.rating;
        }

        if (sort === "Reviews") {
          return second.reviews - first.reviews;
        }

        return first.id - second.id;
      });
  }, [category, products, searchQuery, sort, sourcing]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const visibleProducts = filteredProducts.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, pageSize, searchQuery, sort, sourcing]);

  function clearFilters() {
    setCategory("All");
    setSourcing("All");
    setSort("Newest");
  }

  function toggleBookmark(productId: number) {
    setBookmarkedIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }

  function requestRfq(productId: number) {
    const selectedProduct = products.find((product) => product.id === productId);

    if (selectedProduct?.sourcing === "International") {
      router.push(`/user/rfqs/international/${productId}`);
      return;
    }

    if (selectedProduct?.sourcing === "Domestic") {
      router.push(`/user/rfqs/domestic/${productId}`);
      return;
    }

    setRequestedIds((current) => (current.includes(productId) ? current : [...current, productId]));
  }

  return (
    <section className="mx-auto w-full min-w-0 max-w-7xl overflow-x-hidden px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-[#e8e3e8] pb-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-5 flex items-center gap-2 text-xs font-medium text-[#6b7280]">
            <span>Dashboard</span>
            <ChevronRight aria-hidden="true" className="size-3" strokeWidth={1.8} />
            <span className="font-bold text-[#111827]">Browse Products</span>
          </div>
          <h1 className="text-2xl font-bold leading-8 text-[#111827]">Browse Products</h1>
          <p className="mt-1 text-sm leading-5 text-[#6b7280]">
            Discover and source products from domestic and international suppliers.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex max-w-full flex-wrap items-center gap-2">
            <button
              aria-label="Grid view"
              className="flex size-10 items-center justify-center rounded-lg bg-[#65096c] text-white"
              type="button"
            >
              <Grid3X3 aria-hidden="true" className="size-4" strokeWidth={1.8} />
            </button>
            <button
              aria-label="List view"
              className="flex size-10 items-center justify-center rounded-lg border border-[#e8e3e8] bg-white text-[#6b7280]"
              type="button"
            >
              <List aria-hidden="true" className="size-4" strokeWidth={1.8} />
            </button>
            <label className="flex h-10 items-center gap-2 rounded-lg border border-[#e8e3e8] bg-white px-3 text-xs font-semibold text-[#6b7280]">
              <SlidersHorizontal aria-hidden="true" className="size-4 text-[#65096c]" strokeWidth={1.8} />
              Sort:
              <select
                className="bg-transparent text-[#111827] outline-none"
                onChange={(event) => setSort(event.target.value)}
                value={sort}
              >
                <option>Newest</option>
                <option>Rating</option>
                <option>Reviews</option>
              </select>
            </label>
            <span className="flex h-10 items-center rounded-lg border border-[#e8e3e8] bg-white px-4 text-xs font-bold text-[#65096c]">
              {filteredProducts.length.toLocaleString()} products
            </span>
          </div>
        </div>
      </div>

      <div className="my-4 max-w-full overflow-hidden rounded-xl border border-[#e8e3e8] bg-white shadow-sm">
        <div className="flex items-center gap-3 overflow-x-auto overscroll-x-contain p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="flex shrink-0 items-center gap-2 text-sm font-bold text-[#111827]">
            <Filter aria-hidden="true" className="size-4 text-[#65096c]" strokeWidth={1.8} />
            Filters:
          </span>

          <span className="shrink-0 text-xs font-bold uppercase tracking-[0.4px] text-[#6b7280]">Category:</span>
          {["All", ...categories].map((item) => (
            <button
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                category === item
                  ? "border-[#65096c] bg-[#65096c] text-white"
                  : "border-[#e8e3e8] bg-white text-[#6b7280] hover:text-[#65096c]"
              }`}
              key={item}
              onClick={() => setCategory(item)}
              type="button"
            >
              {item}
            </button>
          ))}

          <span className="mx-2 hidden h-6 w-px bg-[#e8e3e8] sm:block" />
          <span className="shrink-0 text-xs font-bold uppercase tracking-[0.4px] text-[#6b7280]">Sourcing:</span>
          {sourcingFilters.map((item) => (
            <button
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                sourcing === item
                  ? "border-[#e39b4d] bg-[#fff3d6] text-[#b86d1d]"
                  : "border-[#e8e3e8] bg-white text-[#6b7280] hover:text-[#65096c]"
              }`}
              key={item}
              onClick={() => setSourcing(item)}
              type="button"
            >
              {item}
            </button>
          ))}

          <button
            className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[#6b7280] transition hover:bg-[#f8f9fa] hover:text-[#65096c]"
            onClick={clearFilters}
            type="button"
          >
            <X aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
            Clear all
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-[#6b7280]">Loading products...</p>
      ) : null}


      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-4">
        {visibleProducts.map((product) => (
          <ProductCard
            bookmarked={bookmarkedIds.includes(product.id)}
            key={product.id}
            onBookmark={toggleBookmark}
            onRequest={requestRfq}
            product={product}
            requested={requestedIds.includes(product.id)}
          />
        ))}
      </div>

      {!isLoading && !loadError && visibleProducts.length === 0 ? (
        <p className="py-12 text-center text-sm text-[#6b7280]">
          {searchQuery.trim() ? "No products match your search." : "No products found."}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[#e8e3e8] bg-white p-3 text-sm text-[#6b7280] shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p>
          Showing{" "}
          <span className="font-bold text-[#111827]">
            {filteredProducts.length ? pageStart + 1 : 0}-
            {Math.min(pageStart + visibleProducts.length, filteredProducts.length)}
          </span>{" "}
          of{" "}
          <span className="font-bold text-[#111827]">
            {filteredProducts.length.toLocaleString()}
          </span>{" "}
          products
        </p>

        <div className="flex max-w-full items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            aria-label="Previous page"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#e8e3e8] text-[#9ca3af]"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            type="button"
          >
            <ChevronLeft aria-hidden="true" className="size-4" strokeWidth={1.8} />
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${
                page === currentPage
                  ? "border-[#65096c] bg-[#65096c] text-white"
                  : "border-[#e8e3e8] text-[#6b7280]"
              }`}
              key={page}
              onClick={() => setCurrentPage(page)}
              type="button"
            >
              {page}
            </button>
          ))}
          <button
            aria-label="Next page"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#e8e3e8] text-[#6b7280]"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            type="button"
          >
            <ChevronRight aria-hidden="true" className="size-4" strokeWidth={1.8} />
          </button>
        </div>

        <label className="flex items-center gap-2 text-xs font-medium">
          Per page:
          <select
            className="h-9 rounded-lg border border-[#e8e3e8] bg-white px-3 text-xs font-bold text-[#111827] outline-none"
            onChange={(event) => setPageSize(Number(event.target.value))}
            value={pageSize}
          >
            <option value={4}>4</option>
            <option value={8}>8</option>
          </select>
          <ChevronDown aria-hidden="true" className="-ml-8 size-3 text-[#6b7280]" strokeWidth={1.8} />
        </label>
      </div>
    </section>
  );
}
