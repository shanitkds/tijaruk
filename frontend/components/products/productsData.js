export const productsHero = {
  title: "Products",
  description:
    "Explore export-ready essentials and industrial goods sourced through TIJARUK's trusted supplier network.",
  video: "/products/producthero.webm",
  image: "/products/hero.webp",
};

export const productCategories = [
  "All",
  "Food & Agriculture",
  "Industrial Materials",
  "Electrical",
  "Textiles",
  "Chemicals",
  "Automotive",
];

const PRODUCT_DETAIL_CAPTION =
  "Lorem ipsum dolor sit amet consectetur. Interdum facilisis sollicitudin malesuada commodo. Sed sit nec nunc fermentum sed diam in viverra pellentesque. Tincidunt odio aliquet .";

const PRODUCT_CARD_CAPTION = PRODUCT_DETAIL_CAPTION;

export const productCards = [
  {
    name: "Rice",
    slug: "rice",
    image: "/products/rice.webp",
    hoverImage: "/products/rice02.webp",
    galleryImages: ["/products/rice02.webp", "/oredrnow/rice03.webp"],
    category: "Food & Agriculture",
    description: PRODUCT_CARD_CAPTION,
    price: "3.44 USD",
    reviews: 146,
    detailPrice: "14.36 USD",
    minimumOrder: 10,
    units: ["Kg", "Ton", "Bag"],
    categoriesLabel: "Sourcing",
    sourceModes: ["Domestic Sourcing", "International Sourcing"],
    infoText: PRODUCT_DETAIL_CAPTION,
    descriptionText: PRODUCT_DETAIL_CAPTION,
    features: ["Fast shipping", "Secure payments"],
    relatedSlugs: ["spices", "vegetable-oil", "steel-rods"],
  },
  {
    name: "Spices",
    slug: "spices",
    image: "/products/spices.webp",
    hoverImage: "/products/spices02.webp",
    galleryImages: ["/products/spices02.webp", "/oredrnow/spices03.webp"],
    category: "Food & Agriculture",
    description: PRODUCT_CARD_CAPTION,
    price: "5.34 USD",
    reviews: 146,
    detailPrice: "5.34 USD",
    minimumOrder: 10,
    units: ["Kg", "Bag", "Ton"],
    categoriesLabel: "Sourcing",
    sourceModes: ["Domestic Sourcing", "International Sourcing"],
    infoText: PRODUCT_DETAIL_CAPTION,
    descriptionText: PRODUCT_DETAIL_CAPTION,
    features: ["Fast shipping", "Secure payments"],
    relatedSlugs: ["rice", "vegetable-oil", "cleaning-chemicals"],
  },
  {
    name: "Switches",
    slug: "switches",
    image: "/products/switches.webp",
    hoverImage: "/products/switces02.webp",
    galleryImages: ["/products/switces02.webp", "/oredrnow/switces03.webp"],
    category: "Electrical",
    description: PRODUCT_CARD_CAPTION,
    price: "3.44 USD",
    reviews: 146,
    detailPrice: "16.44 USD",
    minimumOrder: 100,
    units: ["Units", "Box", "Carton"],
    categoriesLabel: "Electrical",
    sourceModes: ["Domestic Sourcing", "International Sourcing"],
    infoText: PRODUCT_DETAIL_CAPTION,
    descriptionText: PRODUCT_DETAIL_CAPTION,
    features: ["Fast shipping", "Secure payments"],
    relatedSlugs: ["steel-rods", "pipes", "spare-parts"],
  },
  {
    name: "Vegetable Oil",
    slug: "vegetable-oil",
    image: "/products/vegitableoil.webp",
    hoverImage: "/products/vegitableoil02.webp",
    galleryImages: ["/products/vegitableoil02.webp", "/oredrnow/vegitableoil03.webp"],
    category: "Food & Agriculture",
    description: PRODUCT_CARD_CAPTION,
    price: "3.44 USD",
    reviews: 146,
    detailPrice: "11.24 USD",
    minimumOrder: 50,
    units: ["L", "Carton", "Pallet"],
    categoriesLabel: "Sourcing",
    sourceModes: ["Domestic Sourcing", "International Sourcing"],
    infoText: PRODUCT_DETAIL_CAPTION,
    descriptionText: PRODUCT_DETAIL_CAPTION,
    features: ["Fast shipping", "Secure payments"],
    relatedSlugs: ["rice", "spices", "fabrics"],
  },
  {
    name: "Steel Rods",
    slug: "steel-rods",
    image: "/products/steel-rods.webp",
    hoverImage: "/products/steel02.webp",
    galleryImages: ["/products/steel02.webp", "/oredrnow/steel03.webp"],
    category: "Industrial Materials",
    description: PRODUCT_CARD_CAPTION,
    price: "8.44 USD",
    reviews: 146,
    detailPrice: "8.44 USD",
    minimumOrder: 2,
    units: ["Ton", "Bundle", "Truckload"],
    categoriesLabel: "Industrial Materials",
    sourceModes: ["Domestic Sourcing", "International Sourcing"],
    infoText: PRODUCT_DETAIL_CAPTION,
    descriptionText: PRODUCT_DETAIL_CAPTION,
    features: ["Fast shipping", "Secure payments"],
    relatedSlugs: ["switches", "pipes", "spare-parts"],
  },
  {
    name: "Fabrics",
    slug: "fabrics",
    image: "/products/fabrics.webp",
    hoverImage: "/products/fabrics02.webp",
    galleryImages: ["/products/fabrics02.webp", "/oredrnow/fabrics03.webp"],
    category: "Textiles",
    description: PRODUCT_CARD_CAPTION,
    price: "3.44 USD",
    reviews: 146,
    detailPrice: "6.84 USD",
    minimumOrder: 500,
    units: ["Meters", "Roll", "Bale"],
    categoriesLabel: "Textiles",
    sourceModes: ["Domestic Sourcing", "International Sourcing"],
    infoText: PRODUCT_DETAIL_CAPTION,
    descriptionText: PRODUCT_DETAIL_CAPTION,
    features: ["Fast shipping", "Secure payments"],
    relatedSlugs: ["rice", "vegetable-oil", "cleaning-chemicals"],
  },
  {
    name: "Pipes",
    slug: "pipes",
    image: "/products/pipe.webp",
    hoverImage: "/products/pipe02.webp",
    galleryImages: ["/products/pipe02.webp", "/oredrnow/pipe03.webp"],
    category: "Industrial Materials",
    description: PRODUCT_CARD_CAPTION,
    price: "3.44 USD",
    reviews: 146,
    detailPrice: "7.92 USD",
    minimumOrder: 40,
    units: ["Units", "Bundle", "Truckload"],
    categoriesLabel: "Industrial Materials",
    sourceModes: ["Domestic Sourcing", "International Sourcing"],
    infoText: PRODUCT_DETAIL_CAPTION,
    descriptionText: PRODUCT_DETAIL_CAPTION,
    features: ["Fast shipping", "Secure payments"],
    relatedSlugs: ["steel-rods", "switches", "spare-parts"],
  },
  {
    name: "Spare Parts",
    slug: "spare-parts",
    image: "/products/spare-parts.webp",
    hoverImage: "/products/spare02.webp",
    galleryImages: ["/products/spare02.webp", "/oredrnow/spare03.webp"],
    category: "Automotive",
    description: PRODUCT_CARD_CAPTION,
    price: "3.54 USD",
    reviews: 146,
    detailPrice: "3.54 USD",
    minimumOrder: 30,
    units: ["Units", "Box", "Carton"],
    categoriesLabel: "Automotive",
    sourceModes: ["Domestic Sourcing", "International Sourcing"],
    infoText: PRODUCT_DETAIL_CAPTION,
    descriptionText: PRODUCT_DETAIL_CAPTION,
    features: ["Fast shipping", "Secure payments"],
    relatedSlugs: ["pipes", "switches", "steel-rods"],
  },
  {
    name: "Cleaning Chemicals",
    slug: "cleaning-chemicals",
    image: "/products/cleaning-chemicals.webp",
    hoverImage: "/products/chemicals02.webp",
    galleryImages: ["/products/chemicals02.webp", "/oredrnow/chemicals03.webp"],
    category: "Chemicals",
    description: PRODUCT_CARD_CAPTION,
    price: "3.44 USD",
    reviews: 146,
    detailPrice: "4.72 USD",
    minimumOrder: 100,
    units: ["L", "Carton", "Pallet"],
    categoriesLabel: "Chemicals",
    sourceModes: ["Domestic Sourcing", "International Sourcing"],
    infoText: PRODUCT_DETAIL_CAPTION,
    descriptionText: PRODUCT_DETAIL_CAPTION,
    features: ["Fast shipping", "Secure payments"],
    relatedSlugs: ["fabrics", "spices", "vegetable-oil"],
  },
];

export function getProductBySlug(slug) {
  return productCards.find((product) => product.slug === slug);
}

export function getRelatedProducts(slug) {
  const product = getProductBySlug(slug);

  if (!product) {
    return [];
  }

  const RELATED_COUNT = 8;

  const relatedFromList = product.relatedSlugs
    .map((relatedSlug) => getProductBySlug(relatedSlug))
    .filter(Boolean);

  if (relatedFromList.length >= RELATED_COUNT) {
    return relatedFromList.slice(0, RELATED_COUNT);
  }

  return productCards
    .filter((item) => item.slug !== slug)
    .slice(0, RELATED_COUNT);
}
