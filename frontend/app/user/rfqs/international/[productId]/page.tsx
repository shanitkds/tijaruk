"use client";

import { useEffect, useState } from "react";
import api from "../../../../../api/axios";
import InternationalRfqCreatePage from "../../../../../components/user/InternationalRfqCreatePage";
import type { UserProduct } from "../../../../../components/user/userDashboardData";
import { dashboardToast } from "../../../../../components/admin/AdminToast";

type ApiProduct = {
  id: number;
  product_name: string;
  product_type: "DOMESTIC" | "INTERNATIONAL";
  category_name: string;
  description: string | null;
  image: string | null;
  status: "ACTIVE" | "INACTIVE";
  price: string;
  minimum_quantity: number;
  unit: number | null;
  unit_name: string | null;
  services?: number[];
  service_details?: {
    id: number;
    name: string;
    description: string;
  }[];
};

type ApiService = {
  id: number;
  name: string;
  short_description?: string | null;
};

type ProductService = {
  id: number;
  name: string;
  description: string;
};

export default function InternationalRfqPage({
  params,
}: {
  params: { productId: string };
}) {
  const [product, setProduct] = useState<UserProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (loadError) dashboardToast.error("Unable to open product", loadError);
  }, [loadError]);

  useEffect(() => {
    let isMounted = true;
    const productId = Number(params.productId);

    if (!Number.isInteger(productId) || productId <= 0) {
      setLoadError("Invalid product.");
      setIsLoading(false);
      return;
    }

    Promise.all([
      api.get<ApiProduct>(`/products/${productId}/`),
      api.get<ApiService[]>("/products/services/").catch(() => ({ data: [] as ApiService[] })),
    ])
      .then(([{ data }, { data: serviceOptions }]) => {
        if (!isMounted) return;

        if (data.status !== "ACTIVE" || data.product_type !== "INTERNATIONAL") {
          setLoadError("This international product is not available.");
          return;
        }

        const serviceDetails: ProductService[] =
          data.service_details && data.service_details.length > 0
            ? data.service_details
            : (data.services || [])
                .map((serviceId) => {
                  const service = serviceOptions.find((option) => option.id === serviceId);

                  if (!service) return null;

                  return {
                    id: service.id,
                    name: service.name,
                    description: service.short_description || "",
                  };
                })
                .filter((service): service is ProductService => Boolean(service));

        setProduct({
          id: data.id,
          name: data.product_name,
          category: data.category_name,
          sourcing: "International",
          description: data.description || "",
          image: data.image || "",
          rating: 0,
          reviews: 0,
          minimumQuantity: data.minimum_quantity,
          estimatedPrice: data.price,
          unitId: data.unit,
          unitName: data.unit_name,
          services: serviceDetails,
        });
      })
      .catch(() => {
        if (isMounted) {
          setLoadError("Unable to load this active product.");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [params.productId]);

  if (isLoading) {
    return <p className="py-16 text-center text-sm text-[#6b7280]">Loading product...</p>;
  }

  if (loadError) {
    return null;
  }

  return <InternationalRfqCreatePage product={product} />;
}
