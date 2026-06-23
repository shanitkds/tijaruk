"use client";

import { useEffect, useState } from "react";
import api from "../../../../../api/axios";
import DomesticRfqCreatePage from "../../../../../components/user/DomesticRfqCreatePage";
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
};

export default function DomesticRfqPage({
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

    api.get<ApiProduct>(`/products/${productId}/`)
      .then(({ data }) => {
        if (!isMounted) return;

        if (data.status !== "ACTIVE" || data.product_type !== "DOMESTIC") {
          setLoadError("This domestic product is not available.");
          return;
        }

        setProduct({
          id: data.id,
          name: data.product_name,
          category: data.category_name,
          sourcing: "Domestic",
          description: data.description || "",
          image: data.image || "",
          rating: 0,
          reviews: 0,
          minimumQuantity: data.minimum_quantity,
          estimatedPrice: data.price,
          unitId: data.unit,
          unitName: data.unit_name,
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

  return <DomesticRfqCreatePage product={product} />;
}
