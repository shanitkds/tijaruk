// @ts-nocheck
import { notFound } from "next/navigation";
import ProductDetailPage from "../../../components/products/productsdetail";
import {
  getProductBySlug,
  getRelatedProducts,
  productCards,
} from "../../../components/products/productsData";

export function generateStaticParams() {
  return productCards.map((product) => ({ slug: product.slug }));
}

export default function ProductDetailRoute({ params }) {
  const product = getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailPage
      product={product}
      relatedProducts={getRelatedProducts(product.slug)}
    />
  );
}

