// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { getMediaUrl } from "../../lib/media";
import { useRouter } from "next/navigation";
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Trash2,
  X,
  FileText,
  Ban,
  Tag,
  Calendar,
  RefreshCw,
  Star,
  Layers,
  CircleDot,
  UploadCloud,
  Truck,
  Info,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  Clock,
  Box
} from "lucide-react";
import api from "../../api/axios";
import { adminToast } from "./AdminToast";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: "Energy" | "Industrial" | "Construction" | "Electrical" | "Chemicals";
  priceVal: number;
  priceFormatted: string;
  stock: number;
  unitName: string;
  status: "Active" | "Inactive" | "Out of Stock";
  image: string;
  internalImages: string[];
  description: string;
  sector: string;
  minimumQuantity: number;
  supplier: {
    name: string;
    rating: string;
    reviews: string;
    location: string;
    verified: boolean;
  };
  dateAdded: string;
  timeAdded: string;
}

interface ApiProduct {
  id: number;
  product_name: string;
  product_type: "DOMESTIC" | "INTERNATIONAL";
  category: number;
  category_name: string;
  description: string | null;
  image: string | null;
  internal_images: { id: number; image: string }[];
  price: string;
  stock_quantity: number;
  minimum_quantity: number;
  unit: number | null;
  unit_name: string | null;
  supplier: number | null;
  status: "ACTIVE" | "INACTIVE";
  supplier_name: string | null;
  supplier_location: string | null;
  supplier_status: "ACTIVE" | "INACTIVE" | "PENDING" | null;
  services: number[];
  shipping_cost: string;
  created_at: string;
}

interface ApiLookupOption {
  id: number;
  name: string;
  service_price?: string;
}

interface ProductManagementProps {
  initialAction?: string;
  initialActionId?: string;
}

export default function ProductManagement({
  initialAction,
  initialActionId,
}: ProductManagementProps) {
  const router = useRouter();
  const [productList, setProductList] = useState<Product[]>([]);
  const [apiProducts, setApiProducts] = useState<ApiProduct[]>([]);
  const [unitOptions, setUnitOptions] = useState<ApiLookupOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<ApiLookupOption[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<ApiLookupOption[]>([]);
  const [serviceOptions, setServiceOptions] = useState<ApiLookupOption[]>([]);

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedDetailImage, setSelectedDetailImage] = useState("");
  const [filterSegment, setFilterSegment] = useState<"All" | "Active" | "Inactive">("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter dropdown state
  const [filterPrice, setFilterPrice] = useState("All");
  const [filterStock, setFilterStock] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(initialAction === "add");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isStockQuantityPopupOpen, setIsStockQuantityPopupOpen] = useState(false);
  const [isCategoryPopupOpen, setIsCategoryPopupOpen] = useState(false);
  const [isServicePopupOpen, setIsServicePopupOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formProductType, setFormProductType] = useState<"DOMESTIC" | "INTERNATIONAL">("DOMESTIC");
  const [formCategory, setFormCategory] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formMinimumQuantity, setFormMinimumQuantity] = useState("");
  const [formUnitId, setFormUnitId] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [formInternalImages, setFormInternalImages] = useState<{ file: File; preview: string }[]>([]);
  const [existingInternalImages, setExistingInternalImages] = useState<string[]>([]);
  const [formSupplierId, setFormSupplierId] = useState("");
  const [formServiceIds, setFormServiceIds] = useState<string[]>([]);
  const [formShippingCost, setFormShippingCost] = useState("");
  const [formStatus, setFormStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [stockQuantityDraft, setStockQuantityDraft] = useState("");
  const [stockUnitDraft, setStockUnitDraft] = useState("");
  const [stockQuantityError, setStockQuantityError] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryCreateError, setCategoryCreateError] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newServiceTitle, setNewServiceTitle] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceDescription, setNewServiceDescription] = useState("");
  const [serviceCreateError, setServiceCreateError] = useState("");
  const [isCreatingService, setIsCreatingService] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const error = saveError || stockQuantityError || categoryCreateError || serviceCreateError;
    if (error) {
      adminToast.error("Unable to save changes", error);
      setSaveError("");
      setStockQuantityError("");
      setCategoryCreateError("");
      setServiceCreateError("");
    }
  }, [saveError, stockQuantityError, categoryCreateError, serviceCreateError]);

  useEffect(() => {
    if (loadError) {
      adminToast.error("Unable to load products", loadError);
      setLoadError("");
    }
  }, [loadError]);

  const mapApiProduct = (product: ApiProduct): Product => {
    const createdAt = new Date(product.created_at);
    const price = Number(product.price);

    return {
      id: `PRD-${String(product.id).padStart(5, "0")}`,
      name: product.product_name,
      sku: `PRD-${String(product.id).padStart(5, "0")}`,
      category: product.category_name,
      priceVal: price,
      priceFormatted: `SAR ${price.toLocaleString()}`,
      stock: product.stock_quantity,
      minimumQuantity: product.minimum_quantity,
      unitName: product.unit_name || "Units",
      status:
        product.stock_quantity === 0
          ? "Out of Stock"
          : product.status === "ACTIVE"
            ? "Active"
            : "Inactive",
      image: product.image || "",
      internalImages: product.internal_images.map((image) => image.image),
      sector: product.category_name,
      description: product.description || "",
      supplier: {
        name: product.supplier_name || "Not assigned",
        rating: "0",
        reviews: "0",
        location: product.supplier_location || "No supplier selected",
        verified: product.supplier_status === "ACTIVE",
      },
      dateAdded: createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      timeAdded: createdAt.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    } as Product;
  };

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const [
          { data },
          { data: units },
          { data: categories },
          { data: suppliers },
          { data: services },
        ] = await Promise.all([
          api.get<ApiProduct[]>("/products/"),
          api.get<ApiLookupOption[]>("/products/units/"),
          api.get<ApiLookupOption[]>("/products/categories/"),
          api.get<ApiLookupOption[]>("/products/suppliers/"),
          api.get<ApiLookupOption[]>("/products/services/"),
        ]);
        if (!isMounted) return;

        const products = data.map(mapApiProduct);

        setApiProducts(data);
        setUnitOptions(units);
        setCategoryOptions(categories);
        setSupplierOptions(suppliers);
        setServiceOptions(services);
        setProductList(products);
        setSelectedProductId(products[0]?.id || null);
      } catch (error) {
        console.error("Unable to load products.", error);
        if (isMounted) setLoadError("Unable to load products. Please refresh the page.");
      }
    }

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedProduct = productList.find(p => p.id === selectedProductId) || null;

  useEffect(() => {
    if (initialAction !== "edit" || !initialActionId || apiProducts.length === 0) return;
    const target = productList.find(
      (p) => p.id === `PRD-${String(initialActionId).padStart(5, "0")}`
    );
    if (target) handleEditClick(target);
  }, [apiProducts]);

  useEffect(() => {
    setSelectedDetailImage(selectedProduct?.image || selectedProduct?.internalImages?.[0] || "");
  }, [selectedProductId]);

  const formProgressSections = [
    {
      label: "Product Information",
      complete: Boolean(formName && formProductType && formCategoryId),
    },
    {
      label: "Attributes",
      complete: Boolean(formPrice && formStock && formMinimumQuantity && formUnitId),
    },
    {
      label: "Services",
      complete: true,
    },
    {
      label: "Pricing & Shipping",
      complete: Boolean(formShippingCost),
    },
    {
      label: "Product Status",
      complete: Boolean(formStatus),
    },
  ];
  const completedFormSections = formProgressSections.filter((section) => section.complete).length;
  const pendingFormSections = formProgressSections.length - completedFormSections;
  const formCompletion = Math.round(
    (completedFormSections / formProgressSections.length) * 100,
  );

  // Stats calculation
  const totalProducts = productList.length;
  const activeCount = productList.filter((product) => product.status === "Active").length;
  const inactiveCount = productList.filter((product) => product.status === "Inactive").length;
  const outOfStockCount = productList.filter((product) => product.status === "Out of Stock").length;

  // Filtered lists
  const filteredProducts = productList.filter(p => {
    const matchesSegment = filterSegment === "All" ||
      (filterSegment === "Active" && p.status === "Active") ||
      (filterSegment === "Inactive" && p.status === "Inactive");

    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPrice = filterPrice === "All" ||
      (filterPrice === "Low" && p.priceVal < 5000) ||
      (filterPrice === "High" && p.priceVal >= 5000);
    const matchesStock = filterStock === "All" ||
      (filterStock === "InStock" && p.stock > 0) ||
      (filterStock === "OutOfStock" && p.stock === 0);
    const matchesStatus = filterStatus === "All" || p.status === filterStatus;

    return matchesSegment && matchesSearch && matchesPrice && matchesStock && matchesStatus;
  });
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const visibleProducts = filteredProducts.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterPrice, filterSegment, filterStatus, filterStock, searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");

    if (!formName || !formCategoryId || !formPrice || !formShippingCost) {
      setSaveError("Please complete all required fields.");
      return;
    }

    const selectedServiceIds = Array.from(new Set(formServiceIds));
    const payload = new FormData();
    payload.append("product_name", formName);
    payload.append("product_type", formProductType);
    payload.append("category", formCategoryId);
    payload.append("description", formDescription);
    payload.append("price", formPrice);
    payload.append("stock_quantity", formStock || "0");
    payload.append("minimum_quantity", formMinimumQuantity || "0");
    if (formUnitId) payload.append("unit", formUnitId);
    if (formSupplierId) payload.append("supplier", formSupplierId);
    selectedServiceIds.forEach((serviceId) => {
      payload.append("services", serviceId);
    });
    payload.append("status", formStatus);
    payload.append("shipping_cost", formShippingCost || "0");
    if (formImageFile) payload.append("image", formImageFile);
    formInternalImages.forEach((image) => {
      payload.append("internal_images", image.file);
    });

    try {
      setIsSaving(true);
      const { data } = editingProductId
        ? await api.put<ApiProduct>(`/products/${editingProductId}/`, payload)
        : await api.post<ApiProduct>("/products/", payload);
      const savedProduct = mapApiProduct(data);

      setApiProducts((current) =>
        editingProductId
          ? current.map((product) => product.id === editingProductId ? data : product)
          : [data, ...current],
      );
      setProductList((current) =>
        editingProductId
          ? current.map((product) => product.id === savedProduct.id ? savedProduct : product)
          : [savedProduct, ...current],
      );
      setSelectedProductId(savedProduct.id);
      setIsAddModalOpen(false);
      clearForm();
      adminToast.success(
        editingProductId ? "Product updated" : "Product created",
        editingProductId
          ? "The product changes were saved."
          : "The product was created successfully.",
      );
    } catch (error: any) {
      const responseData = error.response?.data;
      const message = responseData
        ? Object.values(responseData).flat().join(" ")
        : "Unable to save product.";
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (p: Product) => {
    const apiProduct = apiProducts.find(
      (product) => `PRD-${String(product.id).padStart(5, "0")}` === p.id,
    );
    if (!apiProduct) return;

    setEditingProductId(apiProduct.id);
    setFormName(apiProduct.product_name);
    setFormProductType(apiProduct.product_type);
    setFormCategory(apiProduct.category_name);
    setFormCategoryId(String(apiProduct.category));
    setFormPrice(apiProduct.price);
    setFormStock(String(apiProduct.stock_quantity));
    setFormMinimumQuantity(String(apiProduct.minimum_quantity));
    setFormUnitId(
      apiProduct.unit
        ? String(apiProduct.unit)
        : unitOptions[0]
          ? String(unitOptions[0].id)
          : "",
    );
    setFormDescription(apiProduct.description || "");
    setFormImage(apiProduct.image || "");
    setFormImageFile(null);
    setExistingInternalImages(apiProduct.internal_images.map((image) => image.image));
    setFormInternalImages([]);
    setFormSupplierId(apiProduct.supplier ? String(apiProduct.supplier) : "");
    setFormServiceIds(apiProduct.services.map((serviceId) => String(serviceId)));
    setFormShippingCost(apiProduct.shipping_cost);
    setFormStatus(apiProduct.status);
    setSaveError("");
    setIsAddModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    const stockNum = parseInt(formStock) || 0;
    const priceNum = parseFloat(formPrice) || 0;
    let status: Product["status"] = "Active";
    if (stockNum === 0) status = "Out of Stock";

    setProductList(prev => prev.map(p => {
      if (p.id === selectedProductId) {
        return {
          ...p,
          name: formName,
          sku: formSku,
          category: formCategory,
          priceVal: priceNum,
          priceFormatted: `SAR ${priceNum.toLocaleString()}`,
          stock: stockNum,
          minimumQuantity: parseInt(formMinimumQuantity) || 0,
          status,
          image: formImage,
          description: formDescription
        };
      }
      return p;
    }));
    setIsEditModalOpen(false);
    clearForm();
  };

  const handleToggleStatus = async (id: string) => {
    const apiProduct = apiProducts.find(
      (product) => `PRD-${String(product.id).padStart(5, "0")}` === id,
    );
    if (!apiProduct) return;

    try {
      const { data } = await api.patch<ApiProduct>(`/products/${apiProduct.id}/`, {
        status: apiProduct.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      });
      const updatedProduct = mapApiProduct(data);
      setApiProducts((current) =>
        current.map((product) => product.id === data.id ? data : product),
      );
      setProductList((current) =>
        current.map((product) => product.id === updatedProduct.id ? updatedProduct : product),
      );
      adminToast.success("Product status updated", "The new status is now active.");
    } catch (error) {
      console.error("Unable to change product status.", error);
      adminToast.error("Unable to update product status", "Please try again.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProductId) return;
    const apiProduct = apiProducts.find(
      (product) => `PRD-${String(product.id).padStart(5, "0")}` === selectedProductId,
    );
    if (!apiProduct) return;

    try {
      await api.delete(`/products/${apiProduct.id}/`);
      const remainingApiProducts = apiProducts.filter((product) => product.id !== apiProduct.id);
      const remainingProducts = productList.filter((product) => product.id !== selectedProductId);
      setApiProducts(remainingApiProducts);
      setProductList(remainingProducts);
      setSelectedProductId(remainingProducts[0]?.id || null);
      setIsDeleteConfirmOpen(false);
      adminToast.success("Product deleted", "The product was deleted successfully.");
    } catch (error) {
      console.error("Unable to delete product.", error);
      adminToast.error("Unable to delete product", "Please try again.");
    }
  };

  const handleStockQuantityPopupOpen = () => {
    setStockUnitDraft(unitOptions.find((unit) => String(unit.id) === formUnitId)?.name || "");
    setStockQuantityError("");
    setIsStockQuantityPopupOpen(true);
  };

  const handleStockQuantityApply = async () => {
    setStockQuantityError("");
    const unitName = stockUnitDraft.trim();

    if (!unitName) {
      setStockQuantityError("Unit is required.");
      return;
    }

    try {
      let unit = unitOptions.find((option) => option.name.toLowerCase() === unitName.toLowerCase());

      if (!unit) {
        const { data } = await api.post<ApiLookupOption>("/products/units/", {
          name: unitName,
        });
        unit = data;
        setUnitOptions((current) => [...current, data].sort((a, b) => a.name.localeCompare(b.name)));
      }

      setFormUnitId(String(unit.id));
      setIsStockQuantityPopupOpen(false);
      adminToast.success("Stock unit saved", "The stock unit is ready to use.");
    } catch (error: any) {
      const responseData = error.response?.data;
      const message = responseData
        ? Object.values(responseData).flat().join(" ")
        : "Unable to create unit.";
      setStockQuantityError(message);
    }
  };

  const handleCategoryCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setCategoryCreateError("");

    if (!newCategoryName.trim()) {
      setCategoryCreateError("Category name is required.");
      return;
    }

    try {
      setIsCreatingCategory(true);
      const { data } = await api.post<ApiLookupOption>("/products/categories/", {
        category_name: newCategoryName.trim(),
      });

      setCategoryOptions((current) => [...current, data].sort((a, b) => a.name.localeCompare(b.name)));
      setFormCategoryId(String(data.id));
      setFormCategory(data.name);
      setNewCategoryName("");
      setIsCategoryPopupOpen(false);
      adminToast.success("Category created", "The category is ready to use.");
    } catch (error: any) {
      const responseData = error.response?.data;
      const message = responseData
        ? Object.values(responseData).flat().join(" ")
        : "Unable to create category.";
      setCategoryCreateError(message);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleServiceCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setServiceCreateError("");

    if (!newServiceTitle.trim()) {
      setServiceCreateError("Service title is required.");
      return;
    }
    if (!newServicePrice) {
      setServiceCreateError("Service price is required.");
      return;
    }

    try {
      setIsCreatingService(true);
      const { data } = await api.post<ApiLookupOption>("/products/services/", {
        service_name: newServiceTitle.trim(),
        service_price: newServicePrice,
        short_description: newServiceDescription.trim(),
      });

      setServiceOptions((current) => [...current, data].sort((a, b) => a.name.localeCompare(b.name)));
      setFormServiceIds((current) => [...current, String(data.id)]);
      setNewServiceTitle("");
      setNewServicePrice("");
      setNewServiceDescription("");
      setIsServicePopupOpen(false);
      adminToast.success("Service created", "The service is ready to use.");
    } catch (error: any) {
      const responseData = error.response?.data;
      const message = responseData
        ? Object.values(responseData).flat().join(" ")
        : "Unable to create service.";
      setServiceCreateError(message);
    } finally {
      setIsCreatingService(false);
    }
  };

  const clearForm = () => {
    setFormName("");
    setFormSku("");
    setFormProductType("DOMESTIC");
    setFormCategory("");
    setFormCategoryId("");
    setFormPrice("");
    setFormStock("");
    setFormMinimumQuantity("");
    setFormUnitId("");
    setFormDescription("");
    setFormImage("");
    setFormImageFile(null);
    setFormInternalImages([]);
    setExistingInternalImages([]);
    setFormSupplierId("");
    setFormServiceIds([]);
    setFormShippingCost("");
    setFormStatus("ACTIVE");
    setStockQuantityDraft("");
    setStockUnitDraft("");
    setStockQuantityError("");
    setNewCategoryName("");
    setCategoryCreateError("");
    setIsCategoryPopupOpen(false);
    setNewServiceTitle("");
    setNewServicePrice("");
    setNewServiceDescription("");
    setServiceCreateError("");
    setIsStockQuantityPopupOpen(false);
    setIsServicePopupOpen(false);
    setEditingProductId(null);
    setSaveError("");
  };

  if (isAddModalOpen) {
    return (
      <div className="space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-gray-400 mb-1">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                clearForm();
              }}
              className="hover:text-[#500c56] transition-colors"
            >
              Products
            </button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#500c56]">{editingProductId ? "Edit Product" : "Add Product"}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">
            {editingProductId ? "Edit Product" : "Add New Product"}
          </h2>
        </div>

        {/* Form Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Left Column - Form Fields */}
          <div className="lg:col-span-2 space-y-6">

            {/* Product Information */}
            <div className="bg-white rounded-[24px] shadow-sm border border-[#eef0f3] overflow-hidden">
              <div className="p-6 border-b border-[#eef0f3] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#500c56]/5 text-[#500c56] flex items-center justify-center">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">Product Information</h3>
                    <p className="text-xs font-semibold text-gray-400">Basic details about the product</p>
                  </div>
                </div>
                <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">Required</span>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Product Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Industrial Steel Chair"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-white border border-[#eef0f3] rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all placeholder:text-gray-300"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Product Type <span className="text-rose-500">*</span></label>
                    <select
                      value={formProductType}
                      onChange={(e) => setFormProductType(e.target.value as "DOMESTIC" | "INTERNATIONAL")}
                      className="w-full bg-white border border-[#eef0f3] rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                    >
                      <option value="DOMESTIC">Domestic</option>
                      <option value="INTERNATIONAL">International</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 sm:w-1/2">
                  <label className="text-xs font-bold text-gray-700">Category <span className="text-rose-500">*</span></label>
                  <div className="flex items-center gap-2">
                    <select
                      value={formCategoryId}
                      onChange={(e) => {
                        const categoryId = e.target.value;
                        setFormCategoryId(categoryId);
                        setFormCategory(
                          categoryOptions.find((option) => String(option.id) === categoryId)?.name || "",
                        );
                      }}
                      className="w-full bg-white border border-[#eef0f3] rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                    >
                      <option value="" disabled>Select a category</option>
                      {categoryOptions.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryCreateError("");
                        setIsCategoryPopupOpen(true);
                      }}
                      className="h-11 w-11 shrink-0 rounded-full border border-[#dfe3ea] bg-white text-gray-400 hover:border-[#500c56] hover:text-[#500c56] flex items-center justify-center transition-colors"
                      aria-label="Create category"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Description</label>
                  <textarea
                    placeholder="Provide a detailed description of the product, including key features, specifications, and use cases..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-white border border-[#eef0f3] rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all placeholder:text-gray-300 resize-none"
                  />
                  <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                    <Info className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-semibold">A good description helps buyers make informed decisions.</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Price <span className="text-rose-500">*</span></label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-xs font-bold text-[#500c56]">SAR</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        className="w-full bg-white border border-[#eef0f3] rounded-xl pl-12 pr-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Stock Quantity <span className="text-rose-500">*</span></label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex items-center flex-1">
                        <span className="absolute left-4 text-gray-400"><Box className="w-4 h-4" /></span>
                        <input
                          type="number"
                          placeholder="0"
                          value={formStock}
                          onChange={(e) => setFormStock(e.target.value)}
                          className="w-full bg-white border border-[#eef0f3] rounded-l-xl pl-11 pr-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                        />
                      </div>
                      <select
                        value={formUnitId}
                        onChange={(e) => setFormUnitId(e.target.value)}
                        className="min-w-[105px] bg-[#f8f9fa] border border-l-0 border-[#eef0f3] rounded-r-xl px-3 py-2.5 text-sm font-bold text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56]"
                      >
                        <option value="" disabled>Unit</option>
                        {unitOptions.length === 0 && (
                          <option value="" disabled>No units available</option>
                        )}
                        {unitOptions.map((unit) => (
                          <option key={unit.id} value={unit.id}>{unit.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleStockQuantityPopupOpen}
                        className="h-11 w-11 shrink-0 rounded-full border border-[#dfe3ea] bg-white text-gray-400 hover:border-[#500c56] hover:text-[#500c56] flex items-center justify-center transition-colors"
                        aria-label="Create unit"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Minimum Quantity <span className="text-rose-500">*</span></label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-gray-400"><Box className="w-4 h-4" /></span>
                      <input
                        type="number"
                        placeholder="0"
                        value={formMinimumQuantity}
                        onChange={(e) => setFormMinimumQuantity(e.target.value)}
                        className="w-full bg-white border border-[#eef0f3] rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Supplier <span className="font-medium text-gray-400">(Optional)</span></label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-gray-400"><Truck className="w-4 h-4" /></span>
                      <select
                        value={formSupplierId}
                        onChange={(e) => setFormSupplierId(e.target.value)}
                        className="w-full bg-white border border-[#eef0f3] rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                      >
                        <option value="">Select a supplier (optional)</option>
                        {supplierOptions.length === 0 && (
                          <option value="" disabled>No suppliers available</option>
                        )}
                        {supplierOptions.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Service <span className="font-medium text-gray-400">(Optional)</span></label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="relative flex items-center flex-1">
                          <span className="absolute left-4 text-gray-400"><Truck className="w-4 h-4" /></span>
                          <select
                            value=""
                            onChange={(e) => {
                              const selectedServiceId = e.target.value;
                              if (!selectedServiceId) return;
                              setFormServiceIds((current) =>
                                current.includes(selectedServiceId)
                                  ? current
                                  : [...current, selectedServiceId],
                              );
                            }}
                            className="w-full bg-white border border-[#eef0f3] rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                          >
                            <option value="">Select a service (optional)</option>
                            {serviceOptions.map((service) => (
                              <option key={service.id} value={service.id}>{service.name}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setServiceCreateError("");
                            setIsServicePopupOpen(true);
                          }}
                          className="h-11 w-11 shrink-0 rounded-full border border-[#dfe3ea] bg-white text-gray-400 hover:border-[#500c56] hover:text-[#500c56] flex items-center justify-center transition-colors"
                          aria-label="Create service"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                      {formServiceIds.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formServiceIds.map((serviceId) => {
                            const service = serviceOptions.find((option) => String(option.id) === serviceId);

                            return (
                              <span
                                key={serviceId}
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#ecd3ed] bg-[#500c56]/5 px-3 py-1.5 text-xs font-bold text-[#500c56]"
                              >
                                {service?.name || "Service"}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormServiceIds((current) =>
                                      current.filter((id) => id !== serviceId),
                                    );
                                  }}
                                  className="rounded-full p-0.5 text-[#500c56]/70 hover:bg-[#500c56]/10 hover:text-[#500c56]"
                                  aria-label={`Remove ${service?.name || "service"}`}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Product Images */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700">Product Images</label>
                  <label className="border-2 border-dashed border-[#ecd3ed] bg-[#fdfafdfc] rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-[#500c56]/5 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const selectedFiles = Array.from(e.target.files || []);
                        const validFiles = selectedFiles.filter(
                          (file) =>
                            ["image/jpeg", "image/png", "image/webp"].includes(file.type) &&
                            file.size <= 5 * 1024 * 1024,
                        );
                        const availableSlots = formImage
                          ? 4 - formInternalImages.length - existingInternalImages.length
                          : 5;

                        if (availableSlots <= 0) {
                          setSaveError("You can upload 1 main image and up to 4 internal images.");
                          e.target.value = "";
                          return;
                        }

                        const filesToAdd = validFiles.slice(0, availableSlots);
                        if (formImage) {
                          setFormInternalImages((images) => [
                            ...images,
                            ...filesToAdd.map((file) => ({
                              file,
                              preview: URL.createObjectURL(file),
                            })),
                          ]);
                        } else {
                          const [mainFile, ...internalFiles] = filesToAdd;
                          setFormImageFile(mainFile || null);
                          setFormImage(mainFile ? URL.createObjectURL(mainFile) : "");
                          setFormInternalImages(internalFiles.map((file) => ({
                            file,
                            preview: URL.createObjectURL(file),
                          })));
                        }
                        setSaveError(
                          validFiles.length !== selectedFiles.length
                            ? "Only PNG, JPG, or WEBP images up to 5MB are allowed."
                            : selectedFiles.length > availableSlots
                              ? "Only 1 main image and 4 internal images are allowed."
                              : "",
                        );
                        e.target.value = "";
                      }}
                    />
                    <div className="w-12 h-12 bg-[#500c56]/10 rounded-full flex items-center justify-center text-[#500c56] mb-3">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <h5 className="text-sm font-extrabold text-gray-900 mb-1">Drag & drop images here</h5>
                    <p className="text-xs text-gray-400 font-semibold mb-4">or click to browse from your device</p>
                    <span className="bg-[#500c56]/10 text-[#500c56] text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#500c56]/20 transition-colors">
                      Browse Files
                    </span>
                    <p className="text-[9px] text-gray-400 font-bold mt-4 uppercase">1 main + up to 4 internal images - Max 5MB each</p>
                  </label>

                  {formImage && (
                    <div className="flex items-center gap-3 pt-3 overflow-x-auto pb-1">
                      <div className="relative w-16 h-16 rounded-xl border-2 border-[#500c56] bg-gray-50 flex-shrink-0">
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#500c56] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full z-10">Main</span>
                        <img src={formImage} className="w-full h-full object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => {
                            if (formImage.startsWith("blob:")) URL.revokeObjectURL(formImage);
                            const [nextMain, ...remainingInternal] = formInternalImages;
                            setFormImageFile(nextMain?.file || null);
                            setFormImage(nextMain?.preview || "");
                            setFormInternalImages(remainingInternal);
                          }}
                          className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white p-0.5 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      {formInternalImages.map((image, index) => (
                        <div
                          key={`${image.file.name}-${index}`}
                          className="relative w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 flex-shrink-0"
                        >
                          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full z-10">
                            Internal {index + 1}
                          </span>
                          <img src={image.preview} className="w-full h-full object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => {
                              const removed = formInternalImages[index];
                              if (removed?.preview.startsWith("blob:")) URL.revokeObjectURL(removed.preview);
                              setFormInternalImages((images) =>
                                images.filter((_, imageIndex) => imageIndex !== index),
                              );
                            }}
                            className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white p-0.5 rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {existingInternalImages.map((image, index) => (
                        <div
                          key={image}
                          className="relative w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 flex-shrink-0"
                        >
                          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full z-10">
                            Internal {index + 1}
                          </span>
                          <img src={image} className="w-full h-full object-cover rounded-lg" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Pricing & Shipping */}
            <div className="bg-white rounded-[24px] shadow-sm border border-[#eef0f3] overflow-hidden">
              <div className="p-6 border-b border-[#eef0f3] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#df8a3c]/10 text-[#df8a3c] flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">Pricing & Shipping</h3>
                  <p className="text-xs font-semibold text-gray-400">Configure shipping costs</p>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Shipping Cost <span className="text-rose-500">*</span></label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-xs font-bold text-[#df8a3c]">SAR</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formShippingCost}
                      onChange={(e) => setFormShippingCost(e.target.value)}
                      className="w-full bg-white border border-[#eef0f3] rounded-xl pl-12 pr-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#df8a3c] focus:ring-1 focus:ring-[#df8a3c] transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                    <Info className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-semibold">Enter 0 for free shipping</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Status */}
            <div className="bg-white rounded-[24px] shadow-sm border border-[#eef0f3] overflow-hidden">
              <div className="p-6 border-b border-[#eef0f3] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">Product Status</h3>
                  <p className="text-xs font-semibold text-gray-400">Control product visibility on the platform</p>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5 items-end">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Status <span className="text-rose-500">*</span></label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-emerald-500"><CircleDot className="w-4 h-4 fill-current" /></span>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as "ACTIVE" | "INACTIVE")}
                      className="w-full bg-white border border-[#eef0f3] rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                    <ChevronRight className="w-4 h-4 text-gray-400 absolute right-4 rotate-90" />
                  </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 text-emerald-800">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-extrabold">Product will be visible to buyers</span>
                  </div>
                  <p className="text-[10px] font-semibold text-emerald-700/70 mt-0.5 ml-3">Active products appear in search results and marketplace listings.</p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="text-[11px] font-bold">
                  <>All required fields (<span className="text-rose-500">*</span>) must be filled before saving.</>
                </span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    clearForm();
                  }}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-[#df8a3c] text-[#df8a3c] font-extrabold text-sm hover:bg-[#df8a3c]/5 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddSubmit}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-[#df8a3c] hover:bg-[#c27c38] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#df8a3c]/20 active:scale-95 transition-all"
                >
                  <Package className="w-4 h-4" />
                  {isSaving ? "Saving..." : editingProductId ? "Update Product" : "Save Product"}
                </button>
              </div>
            </div>

          </div>

          {/* Right Column - Helpers & Preview */}
          <div className="lg:col-span-1 space-y-6">

            {/* Product Preview */}
            <div className="bg-white rounded-[24px] shadow-sm border border-[#eef0f3] overflow-hidden flex flex-col">
              <div className="bg-[#500c56] p-5 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-black">Product Preview</h3>
                </div>
                <p className="text-[10px] font-semibold text-white/70">How it appears to buyers</p>
              </div>
              <div className="p-5">
                <div className="w-full aspect-[4/3] bg-gray-50 rounded-xl border border-gray-100 mb-4 flex items-center justify-center p-4">
                  {formImage ? (
                    <img src={formImage} className="w-full h-full object-contain mix-blend-multiply" />
                  ) : (
                    <UploadCloud className="w-10 h-10 text-gray-300" />
                  )}
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-gray-900 text-base">{formName || "Industrial Steel Chair"}</h4>
                    <p className="text-[10px] font-bold text-gray-400">{formCategory || "Furniture"}</p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase">
                    {formStatus === "ACTIVE" ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <span className="font-black text-[#500c56] text-lg">SAR {formPrice || "450.00"}</span>
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold">
                    <Box className="w-3.5 h-3.5" />
                    <span>
                      {formStock || "120"} {unitOptions.find((unit) => String(unit.id) === formUnitId)?.name || "units"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <span className="bg-gray-100 text-gray-600 text-[9px] font-bold px-2.5 py-1 rounded-md">
                    {formProductType === "DOMESTIC" ? "Domestic" : "International"}
                  </span>
                  <span className="bg-gray-100 text-gray-600 text-[9px] font-bold px-2.5 py-1 rounded-md">
                    Min Qty: {formMinimumQuantity || "0"}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Progress */}
            <div className="bg-white rounded-[24px] shadow-sm border border-[#eef0f3] p-6 space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#500c56]" />
                <h3 className="font-extrabold text-gray-900 text-sm">Form Progress</h3>
              </div>
              <div className="space-y-3 pt-2">
                {formProgressSections.map((section) => (
                  <div key={section.label} className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      {section.complete ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50 text-white" />
                      ) : (
                        <CircleDot className="w-3.5 h-3.5 text-amber-500 fill-amber-50" />
                      )}
                      <span className={section.complete ? "text-gray-600" : "text-gray-900 font-bold"}>
                        {section.label}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${section.complete
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-amber-600 bg-amber-50"
                      }`}>
                      {section.complete ? "Complete" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center text-xs font-bold mb-2">
                  <span className="text-gray-500">Completion</span>
                  <span className="text-[#500c56]">{formCompletion}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
                  <div
                    className="bg-[#500c56] h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${formCompletion}%` }}
                  ></div>
                </div>
                <div className={`flex items-center gap-1.5 text-[10px] font-bold ${pendingFormSections === 0 ? "text-emerald-600" : "text-amber-600"
                  }`}>
                  {pendingFormSections === 0 ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <AlertTriangle className="w-3 h-3" />
                  )}
                  <span>
                    {pendingFormSections === 0
                      ? "All sections complete"
                      : `${pendingFormSections} section${pendingFormSections === 1 ? "" : "s"} need attention`}
                  </span>
                </div>
              </div>
            </div>

            {/* Tips for Better Listings */}
            <div className="bg-white rounded-[24px] shadow-sm border border-[#eef0f3] p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500 fill-amber-50" />
                <h3 className="font-extrabold text-gray-900 text-sm">Tips for Better Listings</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                    <UploadCloud className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-gray-600 font-semibold leading-relaxed">Upload high-quality images from multiple angles to increase buyer confidence.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Edit3 className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-gray-600 font-semibold leading-relaxed">Write detailed descriptions including specifications and use cases.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Tag className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-gray-600 font-semibold leading-relaxed">Set competitive pricing using the wholesale tier for bulk buyers in Saudi Arabia.</p>
                </div>
              </div>
            </div>

            {/* Recently Added */}
            <div className="bg-white rounded-[24px] shadow-sm border border-[#eef0f3] p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-[#500c56]" />
                <h3 className="font-extrabold text-gray-900 text-sm">Recently Added</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-150 overflow-hidden p-1 shrink-0">
                      {productList[0]?.image ? <img src={productList[0].image} className="w-full h-full object-cover mix-blend-multiply" /> : <Package className="w-4 h-4 text-gray-300 m-auto mt-2" />}
                    </div>
                    <div>
                      <h5 className="text-[11px] font-extrabold text-gray-900 line-clamp-1">{productList[0]?.name || "No products yet"}</h5>
                      <p className="text-[9px] font-semibold text-gray-400">{productList[0] ? `${productList[0].category} - ${productList[0].priceFormatted}` : ""}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">{productList[0]?.status || ""}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-150 overflow-hidden p-1 shrink-0">
                      {productList[1]?.image ? <img src={productList[1].image} className="w-full h-full object-cover mix-blend-multiply" /> : <Package className="w-4 h-4 text-gray-300 m-auto mt-2" />}
                    </div>
                    <div>
                      <h5 className="text-[11px] font-extrabold text-gray-900 line-clamp-1">{productList[1]?.name || "No product"}</h5>
                      <p className="text-[9px] font-semibold text-gray-400">{productList[1] ? `${productList[1].category} - ${productList[1].priceFormatted}` : ""}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">{productList[1]?.status || ""}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-150 overflow-hidden p-1 shrink-0">
                      {productList[2]?.image ? <img src={productList[2].image} className="w-full h-full object-cover mix-blend-multiply" /> : <Package className="w-4 h-4 text-gray-300 m-auto mt-2" />}
                    </div>
                    <div>
                      <h5 className="text-[11px] font-extrabold text-gray-900 line-clamp-1">{productList[2]?.name || "No product"}</h5>
                      <p className="text-[9px] font-semibold text-gray-400">{productList[2] ? `${productList[2].category} - ${productList[2].priceFormatted}` : ""}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase">{productList[2]?.status || ""}</span>
                </div>
              </div>
              <button className="w-full py-2.5 mt-2 rounded-xl border border-gray-200 text-gray-600 font-bold text-[11px] flex items-center justify-center gap-1.5 hover:bg-gray-50 active:scale-95 transition-all">
                <ArrowRight className="w-3.5 h-3.5" />
                View All Products
              </button>
            </div>

          </div>
        </div>
        {isStockQuantityPopupOpen && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-[24px] bg-white border border-gray-100 shadow-xl overflow-hidden">
              <div className="bg-[#500c56] text-white px-6 py-4 flex items-center justify-between">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Box className="h-5 w-5 text-amber-400" />
                  <span>Create Unit</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsStockQuantityPopupOpen(false)}
                  className="p-1 rounded-full text-white/85 hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Unit</label>
                  <input
                    type="text"
                    value={stockUnitDraft}
                    onChange={(e) => setStockUnitDraft(e.target.value)}
                    placeholder="Enter unit"
                    list="stock-unit-options"
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56]"
                  />
                  <datalist id="stock-unit-options">
                    {unitOptions.map((unit) => (
                      <option key={unit.id} value={unit.name} />
                    ))}
                  </datalist>
                </div>
                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsStockQuantityPopupOpen(false)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleStockQuantityApply}
                    className="flex-1 py-2.5 bg-[#500c56] text-white rounded-xl text-xs font-bold"
                  >
                    Create Unit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {isCategoryPopupOpen && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-[24px] bg-white border border-gray-100 shadow-xl overflow-hidden">
              <div className="bg-[#500c56] text-white px-6 py-4 flex items-center justify-between">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Tag className="h-5 w-5 text-amber-400" />
                  <span>Create Category</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsCategoryPopupOpen(false)}
                  className="p-1 rounded-full text-white/85 hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleCategoryCreate} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Category Name</label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56]"
                  />
                </div>
                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsCategoryPopupOpen(false)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingCategory}
                    className="flex-1 py-2.5 bg-[#500c56] text-white rounded-xl text-xs font-bold disabled:opacity-70"
                  >
                    {isCreatingCategory ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {isServicePopupOpen && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-[24px] bg-white border border-gray-100 shadow-xl overflow-hidden">
              <div className="bg-[#500c56] text-white px-6 py-4 flex items-center justify-between">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Layers className="h-5 w-5 text-amber-400" />
                  <span>Create Service</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsServicePopupOpen(false)}
                  className="p-1 rounded-full text-white/85 hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleServiceCreate} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Title</label>
                  <input
                    type="text"
                    value={newServiceTitle}
                    onChange={(e) => setNewServiceTitle(e.target.value)}
                    placeholder="Enter service title"
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Price (SAR)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    placeholder="Enter service price"
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Description</label>
                  <textarea
                    value={newServiceDescription}
                    onChange={(e) => setNewServiceDescription(e.target.value)}
                    placeholder="Enter short description"
                    rows={3}
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsServicePopupOpen(false)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingService}
                    className="flex-1 py-2.5 bg-[#500c56] text-white rounded-xl text-xs font-bold disabled:opacity-70"
                  >
                    {isCreatingService ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Product Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <div className="bg-white border border-[#eef0f3] rounded-[20px] p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-[#500c56]/10 flex items-center justify-center text-[#500c56] shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Total Products</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{totalProducts}</p>
          </div>
        </div>

        {/* Active */}
        <div className="bg-white border border-[#eef0f3] rounded-[20px] p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Active</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{activeCount}</p>
          </div>
        </div>

        {/* Inactive */}
        <div className="bg-white border border-[#eef0f3] rounded-[20px] p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-gray-500 shrink-0">
            <Ban className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Inactive</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{inactiveCount}</p>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white border border-[#eef0f3] rounded-[20px] p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Out of Stock</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{outOfStockCount}</p>
          </div>
        </div>
      </section>

      {/* Dynamic Filters bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full lg:max-w-[280px]">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2 pl-10 pr-3 text-xs sm:text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#500c56]/40"
          />
        </div>

        {/* Dropdowns & Add Button */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto justify-start lg:justify-end">
          {/* Price dropdown with tag icon */}
          <div className="relative flex items-center bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-3 py-2 text-xs font-semibold text-gray-500 shadow-sm gap-1.5 focus-within:ring-1 focus-within:ring-[#500c56]/40">
            <Tag className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <select
              value={filterPrice}
              onChange={(e) => setFilterPrice(e.target.value)}
              className="bg-transparent focus:outline-none appearance-none pr-5 cursor-pointer text-gray-700 font-bold"
            >
              <option value="All">Price</option>
              <option value="Low">Under SAR 5,000</option>
              <option value="High">Over SAR 5,000</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-gray-400">
              <ChevronRight className="h-3 w-3 transform rotate-90" />
            </div>
          </div>

          {/* Stock dropdown with layers icon */}
          <div className="relative flex items-center bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-3 py-2 text-xs font-semibold text-gray-500 shadow-sm gap-1.5 focus-within:ring-1 focus-within:ring-[#500c56]/40">
            <Layers className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              className="bg-transparent focus:outline-none appearance-none pr-5 cursor-pointer text-gray-700 font-bold"
            >
              <option value="All">Stock</option>
              <option value="InStock">In Stock</option>
              <option value="OutOfStock">Out of Stock</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-gray-400">
              <ChevronRight className="h-3 w-3 transform rotate-90" />
            </div>
          </div>

          {/* Status dropdown with circledot icon */}
          <div className="relative flex items-center bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-3 py-2 text-xs font-semibold text-gray-500 shadow-sm gap-1.5 focus-within:ring-1 focus-within:ring-[#500c56]/40">
            <CircleDot className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent focus:outline-none appearance-none pr-5 cursor-pointer text-gray-700 font-bold"
            >
              <option value="All">Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-gray-400">
              <ChevronRight className="h-3 w-3 transform rotate-90" />
            </div>
          </div>

          {/* Add Product Button */}
          <button
            onClick={() => {
              clearForm();
              setIsAddModalOpen(true);
              router.push('/admin/products/add');
            }}
            className="bg-[#500c56] hover:bg-[#6c1674] text-white text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm shrink-0"
          >
            <Plus className="h-3.5 w-3.5 text-white" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Product List */}
        <div className="lg:col-span-2 bg-white rounded-[20px] border border-[#eef0f3] p-6 shadow-sm flex flex-col justify-between min-h-[680px]">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-gray-900">Product List</h3>
                <span className="text-[11px] font-bold px-2.5 py-1 bg-[#500c56]/10 text-[#500c56] rounded-full">
                  {totalProducts} total
                </span>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-xs font-semibold hover:bg-gray-50 active:scale-95 transition-all shadow-sm">
                  <Download className="h-3.5 w-3.5" />
                  <span>Export</span>
                </button>

                <div className="bg-[#f8f9fa] border border-[#eef0f3] rounded-lg p-0.5 flex">
                  {(["All", "Active", "Inactive"] as const).map((segment) => (
                    <button
                      key={segment}
                      onClick={() => setFilterSegment(segment)}
                      className={`text-xs px-3.5 py-1 rounded-md font-bold transition-all ${filterSegment === segment
                        ? "bg-[#500c56] text-white shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                      {segment}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto -mx-6">
              <div className="inline-block min-w-full align-middle px-6">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead>
                    <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="pb-3.5 font-bold">Product ID</th>
                      <th className="pb-3.5 font-bold">Name</th>
                      <th className="pb-3.5 font-bold">Category</th>
                      <th className="pb-3.5 font-bold">Stock</th>
                      <th className="pb-3.5 font-bold">Price</th>
                      <th className="pb-3.5 font-bold">Status</th>
                      <th className="pb-3.5 font-bold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs sm:text-sm text-gray-700">
                    {visibleProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400 font-medium text-sm">
                          No products found matching the filters.
                        </td>
                      </tr>
                    ) : null}
                    {visibleProducts.map((p) => {
                      const isSelected = selectedProductId === p.id;
                      return (
                        <tr
                          key={p.id}
                          onClick={() => setSelectedProductId(p.id)}
                          className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${isSelected ? "bg-[#500c56]/5" : ""
                            }`}
                        >
                          <td className={`py-4 font-bold ${isSelected ? "text-[#500c56]" : "text-gray-500"}`}>{p.id}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-800 line-clamp-1">{p.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${p.category === "Energy" ? "bg-purple-50 text-[#500c56] border border-purple-100" :
                              p.category === "Industrial" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                                p.category === "Construction" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                  p.category === "Electrical" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                    "bg-yellow-50 text-yellow-800 border border-yellow-100"
                              }`}>
                              {p.category}
                            </span>
                          </td>
                          <td className="py-4 text-gray-600 font-bold">{p.stock} Units</td>
                          <td className="py-4 font-extrabold text-gray-800">{p.priceFormatted}</td>
                          <td className="py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${p.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                              p.status === "Inactive" ? "bg-slate-50 text-gray-500 border-slate-100" :
                                "bg-rose-50 text-rose-700 border-rose-100"
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${p.status === "Active" ? "bg-emerald-500" :
                                p.status === "Inactive" ? "bg-gray-400" :
                                  "bg-rose-500"
                                }`} />
                              {p.status}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProductId(p.id);
                              }}
                              className={`p-1.5 rounded-full transition-all ${isSelected
                                ? "bg-[#500c56] text-white"
                                : "text-gray-400 border border-gray-200 bg-white hover:bg-gray-100"
                                }`}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-6 text-xs sm:text-sm text-gray-400 font-medium">
            <span>
              Showing {filteredProducts.length === 0 ? 0 : pageStart + 1}-
              {Math.min(pageStart + pageSize, filteredProducts.length)} of {filteredProducts.length} products
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 4) }, (_, index) => {
                const firstPage = Math.min(
                  Math.max(1, currentPage - 1),
                  Math.max(1, totalPages - 3),
                );
                const page = firstPage + index;

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold ${currentPage === page
                      ? "bg-[#500c56] text-white"
                      : "border border-gray-200 text-gray-500"
                      }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Product Detail Panel */}
        <div className="lg:col-span-1 bg-white rounded-[20px] border border-[#eef0f3] overflow-hidden shadow-sm">
          {selectedProduct ? (
            <div className="flex flex-col">
              {/* Header */}
              <div className="h-16 flex items-center justify-between px-5 bg-[#500c56] text-white shrink-0">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#ecd3ed]/70 font-bold uppercase">Selected Product</span>
                  <span className="text-xs sm:text-sm font-bold text-white leading-tight">Product Details - {selectedProduct.id}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border ${selectedProduct.status === "Active" ? "border-emerald-400 bg-emerald-500/10 text-emerald-300" :
                    selectedProduct.status === "Inactive" ? "border-slate-400 bg-slate-500/10 text-slate-350" :
                      "border-rose-400 bg-rose-500/10 text-rose-300"
                    }`}>
                    <span className={`w-1 h-1 rounded-full ${selectedProduct.status === "Active" ? "bg-emerald-400" :
                      selectedProduct.status === "Inactive" ? "bg-slate-400" :
                        "bg-rose-400"
                      }`} />
                    {selectedProduct.status}
                  </span>
                  <button onClick={() => setSelectedProductId(null)} className="p-1 rounded-full text-[#ecd3ed] hover:bg-white/10">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-6">
                <div>
                  <div className="relative h-44 w-full rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shadow-inner">
                    <img
                      src={getMediaUrl(selectedDetailImage || selectedProduct.image)}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex justify-between items-start mt-4">
                    <div>
                      <h5 className="text-base font-extrabold text-gray-900">{selectedProduct.name}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-[#500c56]/10 text-[#500c56] text-[10px] px-2.5 py-0.5 rounded-md font-bold">
                          {selectedProduct.category}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase">
                          SKU: {selectedProduct.sku}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-[#500c56]">{selectedProduct.priceFormatted}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Per Unit</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="border-l-[3px] border-[#500c56] pl-2.5 font-bold text-gray-800 text-xs uppercase tracking-wider">Description</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed mt-2.5">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Product Images (Thumbnails Row) */}
                <div>
                  <h4 className="border-l-[3px] border-[#500c56] pl-2.5 font-bold text-gray-800 text-xs uppercase tracking-wider">Product Images</h4>
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {selectedProduct.image && (
                      <button
                        type="button"
                        onClick={() => setSelectedDetailImage(selectedProduct.image)}
                        className={`h-12 rounded-lg overflow-hidden cursor-pointer bg-gray-50 ${selectedDetailImage === selectedProduct.image
                          ? "border-2 border-[#500c56]"
                          : "border border-gray-200"
                          }`}
                      >
                        <img src={getMediaUrl(selectedProduct.image)} className="w-full h-full object-cover" />
                      </button>
                    )}
                    {selectedProduct.internalImages.map((image, index) => (
                      <button
                        type="button"
                        key={`${image}-${index}`}
                        onClick={() => setSelectedDetailImage(image)}
                        className={`h-12 rounded-lg overflow-hidden cursor-pointer bg-gray-50 ${selectedDetailImage === image
                          ? "border-2 border-[#500c56]"
                          : "border border-gray-200"
                          }`}
                      >
                        <img src={getMediaUrl(image)} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock & Specifications */}
                <div>
                  <h4 className="border-l-[3px] border-[#500c56] pl-2.5 font-bold text-gray-800 text-xs uppercase tracking-wider">Stock & Specifications</h4>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center flex flex-col justify-between">
                      <div className="mx-auto text-[#500c56] mb-1">
                        <Package className="h-4 w-4" />
                      </div>
                      <p className="text-[8px] text-gray-400 font-bold uppercase">In Stock</p>
                      <p className="text-xs sm:text-sm font-extrabold text-gray-800 mt-1">{selectedProduct.stock}</p>
                      <p className="text-[8px] text-gray-400 font-semibold uppercase">Units</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center flex flex-col justify-between">
                      <div className="mx-auto text-[#e39b4d] mb-1">
                        <Tag className="h-4 w-4" />
                      </div>
                      <p className="text-[8px] text-gray-400 font-bold uppercase">Unit Price</p>
                      <p className="text-xs sm:text-sm font-extrabold text-gray-800 mt-1">{selectedProduct.priceVal.toLocaleString()}</p>
                      <p className="text-[8px] text-gray-400 font-semibold uppercase">SAR</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center flex flex-col justify-between">
                      <div className="mx-auto text-emerald-500 mb-1">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <p className="text-[8px] text-gray-400 font-bold uppercase">Status</p>
                      <p className="text-xs sm:text-sm font-extrabold text-emerald-600 mt-1">{selectedProduct.status}</p>
                      <p className="text-[8px] text-gray-400 font-semibold uppercase">Live</p>
                    </div>
                  </div>
                </div>

                {/* Supplier */}
                <div>
                  <h4 className="border-l-[3px] border-[#500c56] pl-2.5 font-bold text-gray-800 text-xs uppercase tracking-wider">Supplier</h4>
                  <div className="mt-3 p-3 rounded-xl border border-gray-100 bg-white relative flex justify-between items-start">
                    <div className="flex gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-400 text-sm overflow-hidden">
                        <img src="/home-images/testimonial-avatar.webp" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-gray-800">{selectedProduct.supplier.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="flex text-amber-400">
                            <Star className="h-2.5 w-2.5 fill-current" />
                          </div>
                          <span className="text-[9px] text-gray-500 font-semibold">{selectedProduct.supplier.rating} ({selectedProduct.supplier.reviews} reviews)</span>
                        </div>
                        <p className="text-[9px] text-gray-400 font-medium mt-0.5">{selectedProduct.supplier.location}</p>
                      </div>
                    </div>
                    {selectedProduct.supplier.verified && (
                      <span className="bg-emerald-50 text-emerald-700 text-[8px] font-bold px-2 py-0.5 rounded-md border border-emerald-100 shrink-0">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Date Added */}
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-650 text-xs font-semibold">
                  <Calendar className="h-4 w-4 text-slate-450" />
                  <span>Date Added</span>
                  <span className="ml-auto font-bold text-gray-800">{selectedProduct.dateAdded} at {selectedProduct.timeAdded}</span>
                </div>

                {/* Footer buttons */}
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleEditClick(selectedProduct)}
                      className="py-2.5 px-3 bg-[#e39b4d] hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit Product</span>
                    </button>
                    <button
                      onClick={() => handleToggleStatus(selectedProduct.id)}
                      className="py-2.5 px-3 bg-[#500c56] hover:bg-[#6c1674] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Change Status</span>
                    </button>
                    <button
                      onClick={() => setIsDeleteConfirmOpen(true)}
                      className="py-2.5 px-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-center text-gray-400 font-medium">All actions are permanently logged</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 font-medium">
              Select a product from the list to view specifications and adjust stock.
            </div>
          )}
        </div>
      </section>



      {/* Edit Product Modal */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] shadow-xl border border-gray-100 max-w-md w-full overflow-hidden">
            <div className="bg-[#500c56] text-white px-6 py-4 flex items-center justify-between">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-amber-450" />
                <span>Edit Product Info - {selectedProductId}</span>
              </h4>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-full text-white/85 hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase">Product Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">SKU Code</label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none"
                    required
                  >
                    <option value="Energy">Energy</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Construction">Construction</option>
                    <option value="Chemicals">Chemicals</option>
                    <option value="Electrical">Electrical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Unit Price (SAR)</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Stock Quantity</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase">Image Asset Path</label>
                <select
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                >
                  <option value="/products/spare-parts.webp">Industrial Spare Parts</option>
                  <option value="/products/pipe.webp">Steel Pipe Fittings</option>
                  <option value="/products/semiconductors.png">Semiconductors</option>
                  <option value="/products/steel-rods.webp">Steel Rods / Structural Steel</option>
                  <option value="/products/chemicals02.webp">Industrial Chemicals</option>
                  <option value="/products/switches.webp">Switches</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#500c56] text-white rounded-xl text-xs font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && selectedProduct && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] shadow-xl border border-gray-100 max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h5 className="font-bold text-sm">Delete Product Listing</h5>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Are you sure you want to permanently delete <strong>{selectedProduct.name}</strong> ({selectedProduct.sku})? This action will remove the listing from the marketplace.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

