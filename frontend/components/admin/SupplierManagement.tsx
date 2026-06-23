// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  MapPin,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Trash2,
  X,
  Star,
  Phone,
  Mail,
  Globe,
  RefreshCw,
  Calendar,
  Building,
  Download,
  Check,
  Factory,
  Cpu,
  FlaskConical,
  Leaf,
  Hammer,
  Shirt,
  Bolt,
  Truck,
  CreditCard,
  Package,
  UploadCloud,
  Lightbulb,
  Shield,
  User,
  Save,
  Lock
} from "lucide-react";
import api from "../../api/axios";
import { adminToast } from "./AdminToast";

export interface Supplier {
  apiId: number;
  id: string;
  name: string;
  location: string;
  productType: string;
  status: "Active" | "Inactive" | "Pending Approval";
  contactPhone: string;
  contactEmail: string;
  website: string;
  crNumber: string;
  about: string;
  totalRfqs: number;
  dealValue: string;
  rating: number;
  reviewsCount: number;
  paymentTerms: string;
  moq: number;
  primaryContact: {
    name: string;
    role: string;
    email: string;
    phone: string;
    avatar: string;
  };
  dateAdded: string;
}

interface ApiSupplier {
  id: number;
  user_id: string;
  user_date_joined: string;
  full_name: string;
  location: string;
  phone: string;
  supplier_name: string;
  product_type: number;
  product_type_name: string;
  supplier_description: string | null;
  email: string;
  website: string | null;
  supplier_status: "ACTIVE" | "INACTIVE" | "PENDING";
  supplier_rating: string;
  logo: string | null;
  payment_terms: string | null;
  minimum_order_quantity: number;
}

interface SupplierManagementProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  locationFilter: string;
  setLocationFilter: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  isAddModalOpenFromHeader: boolean;
  setIsAddModalOpenFromHeader: (val: boolean) => void;
  isAddingSupplier?: boolean;
  setIsAddingSupplier?: (val: boolean) => void;
  initialAction?: string;
  initialActionId?: string;
}

export default function SupplierManagement({
  searchQuery,
  setSearchQuery,
  locationFilter,
  setLocationFilter,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  isAddModalOpenFromHeader,
  setIsAddModalOpenFromHeader,
  isAddingSupplier = false,
  setIsAddingSupplier = () => {},
  initialAction,
  initialActionId,
}: SupplierManagementProps) {
  const [supplierList, setSupplierList] = useState<Supplier[]>([]);

  // Selected supplier state
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");

  // Tab filter: "All" | "Active" | "Pending"
  const [activeSegmentTab, setActiveSegmentTab] = useState<"All" | "Active" | "Pending">("All");

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Add / Edit Modal states
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editingSupplierApiId, setEditingSupplierApiId] = useState<number | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    productType: "Machinery",
    status: "Active",
    contactPhone: "",
    contactEmail: "",
    website: "",
    crNumber: "",
    about: "",
    totalRfqs: 0,
    dealValue: "SAR 0",
    rating: 0,
    reviewsCount: 1,
    primaryContactName: "",
    primaryContactRole: "Director",
    primaryContactEmail: "",
    primaryContactPhone: "",
    password: "",
    paymentTerms: "",
    moq: ""
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoDetails, setLogoDetails] = useState<{ name: string; size: string } | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [productTypeOptions, setProductTypeOptions] = useState<{ id: number; name: string }[]>([]);
  const [isLoadingProductTypes, setIsLoadingProductTypes] = useState(false);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [supplierListError, setSupplierListError] = useState("");
  const [isSavingSupplier, setIsSavingSupplier] = useState(false);
  const [supplierSaveError, setSupplierSaveError] = useState("");

  useEffect(() => {
    if (supplierListError) {
      adminToast.error("Unable to load suppliers", supplierListError);
      setSupplierListError("");
    }
  }, [supplierListError]);

  useEffect(() => {
    if (supplierSaveError) {
      adminToast.error("Unable to save supplier", supplierSaveError);
      setSupplierSaveError("");
    }
  }, [supplierSaveError]);

  const mapApiSupplier = (supplier: ApiSupplier): Supplier => ({
    apiId: supplier.id,
    id: supplier.user_id,
    name: supplier.supplier_name,
    location: supplier.location,
    productType: supplier.product_type_name,
    status:
      supplier.supplier_status === "ACTIVE"
        ? "Active"
        : supplier.supplier_status === "INACTIVE"
          ? "Inactive"
          : "Pending Approval",
    contactPhone: supplier.phone,
    contactEmail: supplier.email,
    website: (supplier.website || "").replace(/^https?:\/\//i, ""),
    crNumber: "",
    about: supplier.supplier_description || "",
    totalRfqs: 0,
    dealValue: "SAR 0",
    rating: Number(supplier.supplier_rating),
    reviewsCount: 0,
    paymentTerms: supplier.payment_terms || "",
    moq: supplier.minimum_order_quantity,
    primaryContact: {
      name: supplier.full_name,
      role: "Representative",
      email: supplier.email,
      phone: supplier.phone,
      avatar: supplier.logo || "/home-images/testimonial-avatar.webp"
    },
    dateAdded: new Date(supplier.user_date_joined).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    })
  });

  const renderRatingStars = (rating: number) => (
    <div className="flex items-center justify-end">
      {Array.from({ length: 5 }).map((_, index) => {
        const fillPercentage = Math.max(0, Math.min(100, (rating - index) * 100));

        return (
          <span key={index} className="relative h-3.5 w-3.5 shrink-0">
            <Star className="absolute inset-0 h-3.5 w-3.5 fill-current text-gray-300" />
            <span
              className="absolute inset-0 overflow-hidden text-amber-400"
              style={{ width: `${fillPercentage}%` }}
            >
              <Star className="h-3.5 w-3.5 fill-current" />
            </span>
          </span>
        );
      })}
    </div>
  );

  useEffect(() => {
    let isMounted = true;

    api.get<ApiSupplier[]>("/suppliers/")
      .then((response) => {
        if (!isMounted) return;

        const suppliers = response.data.map(mapApiSupplier);
        setSupplierList(suppliers);
        setSelectedSupplierId(suppliers[0]?.id || "");
        setSupplierListError("");
      })
      .catch(() => {
        if (isMounted) {
          setSupplierListError("Unable to load suppliers. Please try again.");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingSuppliers(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (initialAction !== "edit" || !initialActionId || supplierList.length === 0) return;
    const target = supplierList.find((s) => s.apiId === Number(initialActionId));
    if (target) handleOpenEditModal(target);
  }, [supplierList]);

  // Clean form when isAddingSupplier is toggled
  useEffect(() => {
    if (isAddingSupplier && editingSupplierApiId === null) {
      setFormData({
        name: "",
        location: "",
        productType: "",
        status: "Active",
        contactPhone: "",
        contactEmail: "",
        website: "",
        crNumber: "",
        about: "",
        totalRfqs: 0,
        dealValue: "SAR 0",
        rating: 0,
        reviewsCount: 1,
        primaryContactName: "",
        primaryContactRole: "Director",
        primaryContactEmail: "",
        primaryContactPhone: "",
        password: "",
        paymentTerms: "",
        moq: ""
      });
      setLogoFile(null);
      setLogoPreview(null);
      setLogoDetails(null);
      setSupplierSaveError("");
    }

    if (isAddingSupplier) {
      setIsLoadingProductTypes(true);

      api.get("/suppliers/product-types/")
        .then((response) => {
          const options = response.data;
          setProductTypeOptions(options);
          if (editingSupplierApiId === null) {
            setFormData((current) => ({
              ...current,
              productType: options[0]?.name || ""
            }));
          }
        })
        .catch(() => {
          setProductTypeOptions([]);
          setSupplierSaveError("Unable to load product types. Please try again.");
        })
        .finally(() => setIsLoadingProductTypes(false));
    }
  }, [isAddingSupplier, editingSupplierApiId]);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      setLogoDetails({ name: file.name, size: `${sizeInMB} MB` });
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  const triggerLogoUpload = () => {
    document.getElementById("logoUploadInput")?.click();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productType = productTypeOptions.find((option) => option.name === formData.productType);

    if (!productType) {
      setSupplierSaveError("The selected product type is unavailable. Please refresh and try again.");
      return;
    }

    setIsSavingSupplier(true);
    setSupplierSaveError("");

    try {
      const payload = new FormData();
      if (editingSupplierApiId === null) {
        payload.append("password", formData.password);
      }
      payload.append("full_name", formData.primaryContactName);
      if (editingSupplierApiId === null) {
        payload.append("date_of_birth", "1970-01-01");
        payload.append("gender", "OTHER");
      }
      payload.append("location", formData.location);
      payload.append("phone", formData.primaryContactPhone);
      payload.append("supplier_name", formData.name);
      payload.append("product_type", String(productType.id));
      payload.append("supplier_description", formData.about);
      payload.append("email", formData.primaryContactEmail);
      if (formData.website) {
        payload.append(
          "website",
          /^https?:\/\//i.test(formData.website) ? formData.website : `https://${formData.website}`
        );
      }
      payload.append(
        "supplier_status",
        formData.status === "Pending Approval" ? "PENDING" : formData.status.toUpperCase()
      );
      payload.append("supplier_rating", String(formData.rating));
      payload.append("payment_terms", formData.paymentTerms);
      payload.append("minimum_order_quantity", formData.moq || "0");
      if (logoFile) payload.append("logo", logoFile);

      const { data } = editingSupplierApiId === null
        ? await api.post<ApiSupplier>("/suppliers/", payload)
        : await api.patch<ApiSupplier>(`/suppliers/${editingSupplierApiId}/`, payload);
      const savedSupplier = mapApiSupplier(data);

      setSupplierList((current) =>
        editingSupplierApiId === null
          ? [savedSupplier, ...current]
          : current.map((supplier) =>
              supplier.apiId === editingSupplierApiId ? savedSupplier : supplier
            )
      );
      setSelectedSupplierId(savedSupplier.id);
      setLogoFile(null);
      setLogoPreview(null);
      setLogoDetails(null);
      setEditingSupplierApiId(null);
      setIsAddingSupplier(false);
      adminToast.success(
        editingSupplierApiId === null ? "Supplier created" : "Supplier updated",
        editingSupplierApiId === null
          ? "The supplier was created successfully."
          : "The supplier changes were saved.",
      );
    } catch (error) {
      const details = error?.response?.data;
      const firstError = details && typeof details === "object"
        ? Object.values(details).flat().find(Boolean)
        : null;
      setSupplierSaveError(String(firstError || "Unable to create supplier. Please try again."));
    } finally {
      setIsSavingSupplier(false);
    }
  };

  // Keep track of header open command
  useEffect(() => {
    if (isAddModalOpenFromHeader) {
      handleOpenAddModal();
      setIsAddModalOpenFromHeader(false);
    }
  }, [isAddModalOpenFromHeader]);

  // Selected Supplier object
  const selectedSupplier = supplierList.find(s => s.id === selectedSupplierId) || supplierList[0];

  const currentActive = supplierList.filter(s => s.status === "Active").length;
  const currentInactive = supplierList.filter(s => s.status === "Inactive").length;
  const currentPending = supplierList.filter(s => s.status === "Pending Approval").length;

  const stats = {
    total: supplierList.length,
    active: currentActive,
    inactive: currentInactive,
    pending: currentPending
  };

  // Filtering Logic
  const filteredSuppliers = supplierList.filter((s) => {
    // 1. Segment Tab filter
    if (activeSegmentTab === "Active" && s.status !== "Active") return false;
    if (activeSegmentTab === "Pending" && s.status !== "Pending Approval") return false;

    // 2. Header Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesName = s.name.toLowerCase().includes(q);
      const matchesId = s.id.toLowerCase().includes(q);
      const matchesContact = s.contactPhone.includes(q) || s.contactEmail.toLowerCase().includes(q);
      if (!matchesName && !matchesId && !matchesContact) return false;
    }

    // 3. Header Location Filter
    if (locationFilter) {
      if (!s.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
    }

    // 4. Header Product Type Filter
    if (typeFilter) {
      if (s.productType !== typeFilter) return false;
    }

    // 5. Header Status Filter
    if (statusFilter) {
      if (s.status !== statusFilter) return false;
    }

    return true;
  });

  // Pagination calculation
  const totalItems = filteredSuppliers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(startIndex, startIndex + itemsPerPage);

  // Reset pagination if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, locationFilter, typeFilter, statusFilter, activeSegmentTab]);

  // Actions
  const handleOpenAddModal = () => {
    setEditingSupplierApiId(null);
    setFormData({
      name: "",
      location: "",
      productType: "",
      status: "Active",
      contactPhone: "",
      contactEmail: "",
      website: "",
      crNumber: "",
      about: "",
      totalRfqs: 0,
      dealValue: "SAR 0",
      rating: 0,
      reviewsCount: 1,
      primaryContactName: "",
      primaryContactRole: "Director",
      primaryContactEmail: "",
      primaryContactPhone: "",
      password: "",
      paymentTerms: "",
      moq: ""
    });
    setLogoFile(null);
    setLogoDetails(null);
    setLogoPreview(null);
    setSupplierSaveError("");
    setIsAddingSupplier(true);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
    setEditingSupplierApiId(supplier.apiId);
    setFormData({
      name: supplier.name,
      location: supplier.location,
      productType: supplier.productType,
      status: supplier.status,
      contactPhone: supplier.contactPhone,
      contactEmail: supplier.contactEmail,
      website: supplier.website,
      crNumber: supplier.crNumber,
      about: supplier.about,
      totalRfqs: supplier.totalRfqs,
      dealValue: supplier.dealValue,
      rating: supplier.rating,
      reviewsCount: supplier.reviewsCount,
      primaryContactName: supplier.primaryContact.name,
      primaryContactRole: supplier.primaryContact.role,
      primaryContactEmail: supplier.primaryContact.email,
      primaryContactPhone: supplier.primaryContact.phone,
      password: "",
      paymentTerms: supplier.paymentTerms,
      moq: String(supplier.moq)
    });
    setLogoFile(null);
    setLogoPreview(null);
    setLogoDetails(null);
    setSupplierSaveError("");
    setIsAddingSupplier(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `#SUP-00${72 + supplierList.length}`;
    const newSupplier: Supplier = {
      id: newId,
      name: formData.name || "New Supplier",
      location: formData.location || "Riyadh, KSA",
      productType: formData.productType,
      status: formData.status as any,
      contactPhone: formData.contactPhone || "+966 11 000 0000",
      contactEmail: formData.contactEmail || "info@supplier.com",
      website: formData.website || "www.supplier.com",
      crNumber: formData.crNumber || "1010099999",
      about: formData.about || "No description provided.",
      totalRfqs: formData.totalRfqs || 0,
      dealValue: formData.dealValue || "SAR 0",
      rating: formData.rating,
      reviewsCount: formData.reviewsCount,
      primaryContact: {
        name: formData.primaryContactName || "Contact Person",
        role: formData.primaryContactRole || "Representative",
        email: formData.primaryContactEmail || "contact@supplier.com",
        phone: formData.primaryContactPhone || "+966 50 000 0000",
        avatar: "/home-images/testimonial-avatar.webp"
      },
      dateAdded: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }) + " at 09:00 AM"
    };

    setSupplierList([newSupplier, ...supplierList]);
    setSelectedSupplierId(newId);
    setIsAddOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;

    setSupplierList(prev =>
      prev.map(s => {
        if (s.id === selectedSupplier.id) {
          return {
            ...s,
            name: formData.name,
            location: formData.location,
            productType: formData.productType,
            status: formData.status as any,
            contactPhone: formData.contactPhone,
            contactEmail: formData.contactEmail,
            website: formData.website,
            crNumber: formData.crNumber,
            about: formData.about,
            totalRfqs: formData.totalRfqs,
            dealValue: formData.dealValue,
            primaryContact: {
              ...s.primaryContact,
              name: formData.primaryContactName,
              role: formData.primaryContactRole,
              email: formData.primaryContactEmail,
              phone: formData.primaryContactPhone
            }
          };
        }
        return s;
      })
    );
    setIsEditOpen(false);
  };

  const handleDeleteSupplier = async (supplier: Supplier) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      try {
        await api.delete(`/suppliers/${supplier.apiId}/`);
        const remaining = supplierList.filter(s => s.apiId !== supplier.apiId);
        setSupplierList(remaining);
        setSelectedSupplierId(remaining[0]?.id || "");
        adminToast.success("Supplier deleted", "The supplier was deleted successfully.");
      } catch {
        alert("Unable to delete supplier. Please try again.");
      }
    }
  };

  const handleCycleStatus = async (supplier: Supplier) => {
    const statuses: Supplier["status"][] = ["Active", "Inactive", "Pending Approval"];
    const nextStatus = statuses[(statuses.indexOf(supplier.status) + 1) % statuses.length];
    const apiStatus = nextStatus === "Pending Approval" ? "PENDING" : nextStatus.toUpperCase();

    try {
      const { data } = await api.patch<ApiSupplier>(
        `/suppliers/${supplier.apiId}/`,
        { supplier_status: apiStatus }
      );
      const updatedSupplier = mapApiSupplier(data);
      setSupplierList((current) =>
        current.map((item) => item.apiId === supplier.apiId ? updatedSupplier : item)
      );
      setSelectedSupplierId(updatedSupplier.id);
      adminToast.success("Supplier status updated", "The new status is now active.");
    } catch {
      alert("Unable to change supplier status. Please try again.");
    }
  };

  // Helper for badge color formatting
  const getProductTypeStyle = (type: string) => {
    switch (type) {
      case "Machinery": return "bg-[#f3e8ff] text-[#6b21a8]";
      case "Electronics": return "bg-[#e0f2fe] text-[#0369a1]";
      case "Chemicals": return "bg-[#fef3c7] text-[#92400e]";
      case "Food & Bev": return "bg-[#dcfce7] text-[#166534]";
      case "Construction": return "bg-[#fee2e2] text-[#991b1b]";
      case "Textiles": return "bg-[#fae8ff] text-[#86198f]";
      case "Electrical": return "bg-[#ffedd5] text-[#c2410c]";
      case "Logistics": return "bg-[#f0fdf4] text-[#15803d]";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-emerald-500";
      case "Pending Approval": return "bg-amber-500";
      case "Inactive": return "bg-gray-400";
      default: return "bg-gray-400";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-emerald-50 text-emerald-700";
      case "Pending Approval": return "bg-amber-50 text-amber-700";
      case "Inactive": return "bg-gray-100 text-gray-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  // Render supplier list logo initial and bg
  const getSupplierLogoBg = (type: string) => {
    switch (type) {
      case "Machinery": return "bg-[#f3e8ff] text-[#500c56]";
      case "Electronics": return "bg-[#e0f2fe] text-[#0369a1]";
      case "Chemicals": return "bg-[#fef3c7] text-[#92400e]";
      case "Food & Bev": return "bg-[#dcfce7] text-[#166534]";
      case "Construction": return "bg-[#fee2e2] text-[#991b1b]";
      case "Textiles": return "bg-[#fae8ff] text-[#86198f]";
      case "Electrical": return "bg-[#ffedd5] text-[#c2410c]";
      case "Logistics": return "bg-[#f0fdf4] text-[#15803d]";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getSupplierIcon = (type: string) => {
    switch (type) {
      case "Machinery": return <Factory className="h-4 w-4" />;
      case "Electronics": return <Cpu className="h-4 w-4" />;
      case "Chemicals": return <FlaskConical className="h-4 w-4" />;
      case "Food & Bev": return <Leaf className="h-4 w-4" />;
      case "Construction": return <Hammer className="h-4 w-4" />;
      case "Textiles": return <Shirt className="h-4 w-4" />;
      case "Electrical": return <Bolt className="h-4 w-4" />;
      case "Logistics": return <Truck className="h-4 w-4" />;
      default: return <Building className="h-4 w-4" />;
    }
  };

  const getSupplierInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  if (isAddingSupplier) {
    return (
      <div className="space-y-6 animate-fade-in text-left">
        {/* Fill in subtitle & required alert pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1 text-left">
          <p className="text-sm text-gray-500 font-medium">Fill in the details below to register a new supplier on the platform.</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#500c56]/10 text-[#500c56] rounded-full text-[11px] font-bold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#500c56]" />
            <span className="flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 shrink-0" />
              All fields marked * are required
            </span>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* 1. Supplier Information Card */}
          <div className="bg-white rounded-[24px] border border-[#eef0f3] p-6 shadow-sm text-left space-y-5">
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-[#500c56] shrink-0">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">Supplier Information</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Basic details about the supplier</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Supplier Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Supplier Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. AlphaTech Supplies Ltd."
                  required
                  className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Product Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Product Type <span className="text-rose-500">*</span></label>
                <select
                  required
                  disabled={isLoadingProductTypes || productTypeOptions.length === 0}
                  className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-4 text-sm text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                  value={formData.productType}
                  onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                >
                  {isLoadingProductTypes && <option value="">Loading product types...</option>}
                  {!isLoadingProductTypes && productTypeOptions.length === 0 && (
                    <option value="">No product types available</option>
                  )}
                  {productTypeOptions.map((option) => (
                    <option key={option.id} value={option.name}>{option.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Location <span className="text-rose-500">*</span></label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <MapPin className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="e.g. Dubai, UAE"
                  required
                  className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            {/* Supplier Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Supplier Description</label>
              <textarea
                rows={3}
                placeholder="Brief overview of the supplier's offerings, specialties and background..."
                className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all resize-none"
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value.slice(0, 500) })}
              />
              <div className="flex justify-end text-[10px] text-gray-400 font-bold uppercase">
                <span>{formData.about.length} / 500 characters</span>
              </div>
            </div>

            {/* Contacts Info in 3 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Contact Person */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Contact Person <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Full name"
                    required
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                    value={formData.primaryContactName}
                    onChange={(e) => setFormData({ ...formData, primaryContactName: e.target.value })}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Email Address <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    placeholder="contact@supplier.com"
                    required
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                    value={formData.primaryContactEmail}
                    onChange={(e) => setFormData({ ...formData, primaryContactEmail: e.target.value })}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Phone Number <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="+971 50 000 0000"
                    required
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                    value={formData.primaryContactPhone}
                    onChange={(e) => setFormData({ ...formData, primaryContactPhone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {editingSupplierApiId === null && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    placeholder="Minimum 8 characters"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <p className="text-[9px] text-[#8c9ba5] font-extrabold uppercase pl-0.5">
                  Used by the supplier to sign in
                </p>
              </div>
            )}

            {/* Website */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                <span>Website</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">Optional</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Globe className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="https://www.suppliername.com"
                  className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Middle Row (Status & Rating, Upload Logo) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 2. Status & Rating Card */}
            <div className="bg-white rounded-[24px] border border-[#eef0f3] p-6 shadow-sm text-left space-y-5">
              <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-[#500c56] shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm">Status & Rating</h3>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Set supplier operational status</p>
                </div>
              </div>

              <div className="space-y-3.5 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Supplier Status <span className="text-rose-500">*</span></label>
                  <select
                    required
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-4 text-sm text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending Approval">Pending Approval</option>
                  </select>
                </div>

                {/* Color Dot Status Badges */}
                <div className="flex items-center gap-3 mt-1.5 pl-0.5">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: "Active" })}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      formData.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/30"
                        : "bg-gray-50 text-gray-400 border border-gray-100"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: "Inactive" })}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      formData.status === "Inactive"
                        ? "bg-rose-50 text-rose-700 ring-2 ring-rose-500/30"
                        : "bg-gray-50 text-gray-400 border border-gray-100"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Inactive
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: "Pending Approval" })}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      formData.status === "Pending Approval"
                        ? "bg-amber-50 text-amber-700 ring-2 ring-amber-500/30"
                        : "bg-gray-50 text-gray-400 border border-gray-100"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Pending
                  </button>
                </div>

                {/* Stars Rating Selector */}
                <div className="space-y-1.5 text-left pt-2.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Supplier Rating</label>
                  <div className="flex items-center gap-3 bg-[#f8f9fa] border border-[#eef0f3] rounded-2xl p-3 px-4.5">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = star <= formData.rating;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormData({ ...formData, rating: star })}
                            className="p-0.5 text-amber-400 hover:scale-110 active:scale-95 transition-transform"
                          >
                            <Star className={`h-6 w-6 ${isFilled ? "fill-current" : "text-gray-300"}`} />
                          </button>
                        );
                      })}
                    </div>
                    <div className="bg-[#500c56]/10 text-[#500c56] font-extrabold text-sm px-3 py-1 rounded-xl shrink-0">
                      {formData.rating.toFixed(1)} / 5.0
                    </div>
                  </div>
                  <p className="text-[10px] text-[#8c9ba5] font-semibold pl-0.5">Click stars to set supplier performance rating</p>

                  {/* Star guide rating text row */}
                  <div className="grid grid-cols-5 gap-1 pt-1.5 text-[9px] font-extrabold text-gray-400 uppercase text-center tracking-tight leading-tight">
                    <div>
                      <div className="text-gray-800">1</div>
                      <div>Poor</div>
                    </div>
                    <div>
                      <div className="text-gray-800">2</div>
                      <div>Fair</div>
                    </div>
                    <div>
                      <div className="text-gray-800">3</div>
                      <div>Good</div>
                    </div>
                    <div>
                      <div className="text-gray-800">4</div>
                      <div className="text-[#df8a3c]">Great</div>
                    </div>
                    <div>
                      <div className="text-gray-800">5</div>
                      <div>Excellent</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Upload Supplier Logo Card */}
            <div className="bg-white rounded-[24px] border border-[#eef0f3] p-6 shadow-sm text-left space-y-5">
              <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-[#500c56] shrink-0">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm">Upload Supplier Logo</h3>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">PNG, JPG or SVG up to 5MB</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Dashed Drag/Drop Box */}
                <div
                  onClick={triggerLogoUpload}
                  className="border-2 border-dashed border-[#eef0f3] hover:border-[#500c56]/30 bg-slate-50/40 hover:bg-slate-50/80 rounded-[20px] p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-2 min-h-[145px]"
                >
                  <input
                    type="file"
                    id="logoUploadInput"
                    className="hidden"
                    accept=".png,.jpg,.jpeg,.svg"
                    onChange={handleLogoFileChange}
                  />
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-14 h-14 rounded-xl object-contain border border-purple-100" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-[#500c56]">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                  )}
                  <div className="text-xs text-gray-600 leading-tight">
                    <span className="font-extrabold text-gray-800">{logoPreview ? "Change logo" : "Drop your logo here"}</span><br />
                    <span>or <strong className="text-[#500c56] hover:underline font-extrabold">browse</strong> to upload from your device</span>
                  </div>
                  <div className="flex items-center gap-3.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                    <span>PNG</span>
                    <span>Â·</span>
                    <span>JPG</span>
                    <span>Â·</span>
                    <span>SVG</span>
                  </div>
                </div>

                {/* Selected File Box */}
                <div className="flex items-center justify-between bg-[#f8f9fa] border border-[#eef0f3] rounded-xl p-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8.5 h-8.5 rounded-lg bg-purple-50 flex items-center justify-center text-[#500c56] shrink-0">
                      <Building className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-gray-700 truncate leading-none">
                        {logoDetails ? logoDetails.name : "No file selected"}
                      </p>
                      <p className="text-[10px] text-gray-400 font-semibold mt-1">
                        {logoDetails ? logoDetails.size : "Recommended: 400x400px square"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={logoDetails ? () => { setLogoFile(null); setLogoDetails(null); setLogoPreview(null); } : triggerLogoUpload}
                    className="text-[10px] font-black uppercase text-[#500c56] hover:text-[#330537] px-3.5 py-2 bg-white border border-[#eef0f3] rounded-lg shadow-sm hover:bg-gray-50 transition-all shrink-0 animate-fade-in"
                  >
                    {logoDetails ? "Remove" : "Browse"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Additional Information Card */}
          <div className="bg-white rounded-[24px] border border-[#eef0f3] p-6 shadow-sm text-left space-y-5">
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-[#500c56] shrink-0">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">Additional Information</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Commercial and operational preferences</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Payment Terms */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Payment Terms</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <CreditCard className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Net 30, COD, 50% upfront"
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  />
                </div>
                <p className="text-[9px] text-[#8c9ba5] font-extrabold uppercase pl-0.5 mt-1 text-left leading-none">Describe agreed payment conditions</p>
              </div>

              {/* Minimum Order Quantity */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Minimum Order Quantity (MOQ)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Package className="h-4 w-4" />
                  </span>
                  <input
                    type="number"
                    placeholder="e.g. 100"
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                    value={formData.moq}
                    onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                  />
                </div>
                <p className="text-[9px] text-[#8c9ba5] font-extrabold uppercase pl-0.5 mt-1 text-left leading-none">Minimum units per order</p>
              </div>
            </div>

            {/* Info Warning Callout */}
            <div className="bg-[#500c56]/5 border border-[#500c56]/10 rounded-2xl p-4.5 flex items-start gap-3 text-left">
              <div className="w-5.5 h-5.5 rounded-full bg-[#500c56]/10 flex items-center justify-center text-[#500c56] shrink-0 mt-0.5">
                <Lightbulb className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                You can update these details anytime from the Supplier Management panel after creation.
              </p>
            </div>
          </div>

          {/* Footer Navigation Bar */}
          <div className="border-t border-[#eef0f3] pt-5 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold justify-center sm:justify-start">
              <Shield className="w-4.5 h-4.5 text-gray-400 shrink-0" />
              <span>Data is securely stored and encrypted</span>
            </div>

            <div className="flex items-center justify-center gap-4">
              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => {
                  setEditingSupplierApiId(null);
                  setIsAddingSupplier(false);
                }}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-[#df964e] hover:bg-[#d48c45] rounded-xl shadow-[0_8px_20px_-6px_rgba(223,150,78,0.5)] transition-all active:scale-95 flex items-center gap-2"
              >
                <X className="w-4 h-4 text-white stroke-[2.5]" />
                Cancel
              </button>

              {/* Save Supplier Button */}
              <button
                type="submit"
                disabled={isSavingSupplier}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-[#22c55e] hover:bg-[#1faa51] rounded-xl shadow-[0_8px_20px_-6px_rgba(34,197,94,0.5)] transition-all active:scale-95 flex items-center gap-2"
              >
                <Save className="w-4 h-4 text-white stroke-[2.5]" />
                {isSavingSupplier
                  ? "Saving..."
                  : editingSupplierApiId === null
                    ? "Save Supplier"
                    : "Update Supplier"}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Statistics Cards Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Suppliers */}
        <div className="bg-white border border-[#eef0f3] rounded-[24px] p-5 flex items-center gap-4.5 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-[#500c56] shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Total Suppliers</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{stats.total.toLocaleString()}</p>
          </div>
        </div>

        {/* Active Suppliers */}
        <div className="bg-white border border-[#eef0f3] rounded-[24px] p-5 flex items-center gap-4.5 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Active</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{stats.active.toLocaleString()}</p>
          </div>
        </div>

        {/* Inactive Suppliers */}
        <div className="bg-white border border-[#eef0f3] rounded-[24px] p-5 flex items-center gap-4.5 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Inactive</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{stats.inactive.toLocaleString()}</p>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-white border border-[#eef0f3] rounded-[24px] p-5 flex items-center gap-4.5 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Pending Approval</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{stats.pending.toLocaleString()}</p>
          </div>
        </div>
      </section>

      {/* 2. Main content split layout */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Part: Table card */}
        <div className="lg:col-span-2 bg-white rounded-[24px] border border-[#eef0f3] p-6 shadow-sm flex flex-col justify-between min-h-[640px]">
          <div>
            {/* Table Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900">Supplier List</h3>
                <span className="text-[11px] font-bold px-2.5 py-1 bg-[#500c56]/10 text-[#500c56] rounded-full">
                  {stats.total} total
                </span>
              </div>

              {/* Action Buttons & Tabs */}
              <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3.5 w-full sm:w-auto">
                {/* Export Excel / PDF Button */}
                <button
                  onClick={() => alert("Exporting suppliers list...")}
                  className="px-3.5 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-[#f8f9fa] hover:bg-gray-100 border border-gray-200 rounded-xl flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>

                {/* Filter Segments */}
                <div className="bg-[#f1f2f5] p-1 rounded-xl flex flex-wrap sm:flex-nowrap items-center shrink-0">
                  {(["All", "Active", "Pending"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveSegmentTab(tab)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                        activeSegmentTab === tab
                          ? "bg-[#500c56] text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto -mx-6">
              <div className="inline-block min-w-full align-middle px-6">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead>
                    <tr className="text-left text-[11px] font-bold text-[#8c9ba5] uppercase tracking-wider">
                      <th className="pb-3.5 font-bold">Supplier ID</th>
                      <th className="pb-3.5 font-bold">Supplier Name</th>
                      <th className="pb-3.5 font-bold">Location</th>
                      <th className="pb-3.5 font-bold">Product Type</th>
                      <th className="pb-3.5 font-bold">Status</th>
                      <th className="pb-3.5 font-bold">Contact</th>
                      <th className="pb-3.5 font-bold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150/60 text-sm text-gray-700">
                    {isLoadingSuppliers ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                          Loading suppliers...
                        </td>
                      </tr>
                    ) : paginatedSuppliers.length === 0 || supplierListError ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                          No suppliers found matching the filters.
                        </td>
                      </tr>
                    ) : (
                      paginatedSuppliers.map((supplier) => {
                        const isSelected = supplier.id === selectedSupplierId;
                        return (
                          <tr
                            key={supplier.id}
                            className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${
                              isSelected ? "bg-[#500c56]/5" : ""
                            }`}
                            onClick={() => setSelectedSupplierId(supplier.id)}
                          >
                            {/* Supplier ID */}
                            <td className={`relative pl-4 py-4 font-bold text-xs ${isSelected ? "text-[#500c56]" : "text-[#8c9ba5]"}`}>
                              {isSelected && (
                                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#500c56]" />
                              )}
                              {supplier.id}
                            </td>

                            {/* Supplier Info with custom logo icon */}
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold shrink-0 shadow-sm ${getSupplierLogoBg(supplier.productType)}`}>
                                  {getSupplierIcon(supplier.productType)}
                                </div>
                                <div className="flex flex-col text-left">
                                  <span className="font-bold text-gray-900 leading-tight">
                                    {supplier.name}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Location */}
                            <td className="py-4">
                              <div className="flex items-center gap-1.5 text-[#8c9ba5] font-semibold text-xs">
                                <MapPin className="h-3.5 w-3.5 text-[#8c9ba5] shrink-0" />
                                <span>{supplier.location}</span>
                              </div>
                            </td>

                            {/* Product Type */}
                            <td className="py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getProductTypeStyle(supplier.productType)}`}>
                                {supplier.productType}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-4">
                              {supplier.status === "Pending Approval" ? (
                                <span className={`inline-flex flex-col items-start gap-0.5 px-3 py-1 rounded-2xl text-xs font-bold leading-tight ${getStatusBgColor(supplier.status)}`}>
                                  <div className="flex items-center gap-1.5">
                                    <span className={`h-1.5 w-1.5 rounded-full ${getStatusDotColor(supplier.status)}`} />
                                    <span>Pending</span>
                                  </div>
                                  <span className="pl-3 text-[10px]">Approval</span>
                                </span>
                              ) : (
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusBgColor(supplier.status)}`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${getStatusDotColor(supplier.status)}`} />
                                  <span>{supplier.status}</span>
                                </span>
                              )}
                            </td>

                            {/* Contact Info */}
                            <td className="py-4 text-xs text-gray-500 font-semibold">
                              {supplier.contactPhone}
                            </td>

                            {/* Action Trigger */}
                            <td className="py-4 text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSupplierId(supplier.id);
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                  isSelected 
                                    ? "text-white bg-[#500c56] shadow-sm scale-105" 
                                    : "text-gray-400 hover:text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:shadow-sm"
                                }`}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Table Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-gray-100 pt-4.5 mt-6 gap-4">
              <span className="text-xs text-gray-400 font-semibold text-center sm:text-left">
                Showing <strong className="text-gray-700">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)}</strong> of <strong className="text-gray-700">{totalItems}</strong> suppliers
              </span>

              <div className="flex items-center justify-center gap-1.5">
                {/* Prev Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  // Show current page, first, last, and neighbors
                  const isNear = Math.abs(currentPage - pageNum) <= 1;
                  const isFirstOrLast = pageNum === 1 || pageNum === totalPages;

                  if (!isNear && !isFirstOrLast) {
                    if (pageNum === 2 || pageNum === totalPages - 1) {
                      return <span key={pageNum} className="px-1 text-gray-300 text-xs">...</span>;
                    }
                    return null;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 w-8 text-xs font-bold rounded-xl transition-all ${
                        currentPage === pageNum
                          ? "bg-[#500c56] text-white shadow-sm"
                          : "text-gray-500 hover:bg-gray-100 border border-transparent"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Part: Details Panel */}
        {/* On mobile/tablet, render this details card as a floating drawer when selectedSupplierId is set and open, but on desktop embed it */}
        {selectedSupplier ? (
          <>
            {/* Desktop Version: Embeds in Grid */}
            <div className="bg-white rounded-[24px] border border-[#eef0f3] shadow-sm overflow-hidden text-left">
              {/* Header Title bar */}
              <div className="bg-[#500c56] text-white p-5 border-b border-[#ffffff]/10 flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[11px] uppercase tracking-wider text-[#ecd3ed]/70 font-bold">Selected Supplier</span>
                  <h3 className="text-lg font-bold text-white mt-1 leading-tight">
                    Supplier Details â€” <br />
                    {selectedSupplier.id}
                  </h3>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#28c76f] text-white shadow-sm`}>
                    <Check className="h-3.5 w-3.5 text-white" />
                    <span>Active</span>
                  </span>
                  <button
                    onClick={() => setSelectedSupplierId("")}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Detail Content */}
              <div className="p-6 space-y-6">
                {/* Banner Hero Card */}
                <div className="relative rounded-[20px] overflow-hidden h-40 bg-gray-900 flex items-end">
                  <img
                    src="/industrial_banner.png"
                    alt={selectedSupplier.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                  {/* Backdrop Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                  {/* Overlaid Logo and Quick Info */}
                  <div className="relative p-4 flex items-center gap-3 w-full">
                    <div className="w-12 h-12 bg-[#df8a3c] rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
                      <Building className="h-6 w-6" />
                    </div>
                    <div className="text-left text-white leading-tight">
                      <h4 className="font-extrabold text-sm leading-tight text-white">{selectedSupplier.name}</h4>
                      <p className="text-[10px] text-white/70 font-semibold mt-0.5">Est. 2004 Â· {selectedSupplier.location}</p>
                    </div>
                  </div>
                </div>

                {/* Rating & Company Subheader */}
                <div className="flex items-start justify-between border-b border-gray-100 pb-5">
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-gray-900 text-sm leading-tight">{selectedSupplier.name} Co.</h5>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getProductTypeStyle(selectedSupplier.productType)}`}>
                        {selectedSupplier.productType}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]">
                        Verified
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8c9ba5] font-semibold mt-1.5">CR: {selectedSupplier.crNumber}</p>
                  </div>

                  <div className="text-right">
                    {renderRatingStars(selectedSupplier.rating)}
                    <p className="text-[11px] text-gray-400 font-semibold mt-1">
                      <strong className="text-gray-700">{selectedSupplier.rating}</strong> ({selectedSupplier.reviewsCount} reviews)
                    </p>
                  </div>
                </div>

                {/* About Supplier */}
                <div className="space-y-2 border-b border-gray-100 pb-5 text-left">
                  <h6 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="h-3.5 w-[3px] bg-[#df8a3c] rounded-full inline-block" />
                    About Supplier
                  </h6>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    {selectedSupplier.about}
                  </p>
                </div>

                {/* Supplier Metrics */}
                <div className="space-y-2.5 border-b border-gray-100 pb-5 text-left">
                  <h6 className="text-[11px] font-bold text-[#8c9ba5] uppercase tracking-wider flex items-center gap-2">
                    <span className="h-3.5 w-[3px] bg-[#df8a3c] rounded-full inline-block" />
                    Supplier Metrics
                  </h6>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#f4f3f6] border border-gray-100 rounded-2xl p-3 text-center">
                      <Users className="h-4.5 w-4.5 text-[#500c56] mx-auto mb-1 shrink-0" />
                      <p className="text-[9px] font-bold text-[#8c9ba5] uppercase tracking-tight">Total RFQs</p>
                      <p className="text-sm font-extrabold text-gray-900 mt-0.5">{selectedSupplier.totalRfqs}</p>
                      <p className="text-[8px] font-semibold text-[#8c9ba5] mt-0.5">Fulfilled</p>
                    </div>

                    <div className="bg-[#fbf7f4] border border-gray-100 rounded-2xl p-3 text-center">
                      <Layers className="h-4.5 w-4.5 text-[#df8a3c] mx-auto mb-1 shrink-0" />
                      <p className="text-[9px] font-bold text-[#8c9ba5] uppercase tracking-tight">Deal Value</p>
                      <p className="text-sm font-extrabold text-gray-900 mt-0.5">{selectedSupplier.dealValue}</p>
                      <p className="text-[8px] font-semibold text-[#8c9ba5] mt-0.5">Transacted</p>
                    </div>

                    <div className="bg-[#f2f8f5] border border-gray-100 rounded-2xl p-3 text-center">
                      <Check className="h-4.5 w-4.5 text-[#28c76f] mx-auto mb-1 shrink-0" />
                      <p className="text-[9px] font-bold text-[#8c9ba5] uppercase tracking-tight">Status</p>
                      <p className="text-sm font-extrabold text-[#28c76f] mt-0.5">{selectedSupplier.status}</p>
                      <p className="text-[8px] font-semibold text-[#8c9ba5] mt-0.5">Verified</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3 border-b border-gray-100 pb-5 text-left">
                  <h6 className="text-[11px] font-bold text-[#8c9ba5] uppercase tracking-wider flex items-center gap-2">
                    <span className="h-3.5 w-[3px] bg-[#df8a3c] rounded-full inline-block" />
                    Contact Information
                  </h6>
                  
                  <div className="space-y-2.5">
                    <div className="bg-white border border-[#eef0f3] rounded-xl p-3 flex items-center gap-3 shadow-sm">
                      <div className="w-8.5 h-8.5 rounded-full bg-purple-50 flex items-center justify-center text-[#500c56] shrink-0">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div className="text-xs text-left">
                        <p className="text-[9px] text-[#8c9ba5] font-bold uppercase leading-none">Phone</p>
                        <p className="text-gray-800 font-bold mt-1">{selectedSupplier.contactPhone}</p>
                      </div>
                    </div>

                    <div className="bg-white border border-[#eef0f3] rounded-xl p-3 flex items-center gap-3 shadow-sm">
                      <div className="w-8.5 h-8.5 rounded-full bg-purple-50 flex items-center justify-center text-[#500c56] shrink-0">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="text-xs text-left">
                        <p className="text-[9px] text-[#8c9ba5] font-bold uppercase leading-none">Email</p>
                        <a href={`mailto:${selectedSupplier.contactEmail}`} className="text-[#500c56] hover:underline font-bold mt-1 block break-all">
                          {selectedSupplier.contactEmail}
                        </a>
                      </div>
                    </div>

                    <div className="bg-white border border-[#eef0f3] rounded-xl p-3 flex items-center gap-3 shadow-sm">
                      <div className="w-8.5 h-8.5 rounded-full bg-purple-50 flex items-center justify-center text-[#500c56] shrink-0">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="text-xs text-left">
                        <p className="text-[9px] text-[#8c9ba5] font-bold uppercase leading-none">Location</p>
                        <p className="text-gray-800 font-bold mt-1">{selectedSupplier.location}</p>
                      </div>
                    </div>

                    <div className="bg-white border border-[#eef0f3] rounded-xl p-3 flex items-center gap-3 shadow-sm">
                      <div className="w-8.5 h-8.5 rounded-full bg-purple-50 flex items-center justify-center text-[#500c56] shrink-0">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div className="text-xs text-left">
                        <p className="text-[9px] text-[#8c9ba5] font-bold uppercase leading-none">Website</p>
                        <a href={`https://${selectedSupplier.website}`} target="_blank" rel="noreferrer" className="text-[#500c56] hover:underline font-bold mt-1 block">
                          {selectedSupplier.website}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Contact */}
                <div className="space-y-3 border-b border-gray-100 pb-5 text-left">
                  <h6 className="text-[11px] font-bold text-[#8c9ba5] uppercase tracking-wider flex items-center gap-2">
                    <span className="h-3.5 w-[3px] bg-[#df8a3c] rounded-full inline-block" />
                    Primary Contact
                  </h6>
                  <div className="bg-[#f8f9fa] border border-[#eef0f3] rounded-2xl p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0">
                        <img
                          src={selectedSupplier.primaryContact.avatar}
                          alt={selectedSupplier.primaryContact.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-xs text-left leading-tight">
                        <h6 className="font-extrabold text-gray-900">{selectedSupplier.primaryContact.name}</h6>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{selectedSupplier.primaryContact.email}</p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{selectedSupplier.primaryContact.phone}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-purple-50 text-[#500c56] text-[10px] font-bold uppercase shrink-0">
                      {selectedSupplier.primaryContact.role}
                    </span>
                  </div>
                </div>

                {/* Date Added and Actions */}
                <div className="space-y-4">
                  <div className="bg-[#f8f9fa] border border-[#eef0f3] rounded-xl p-3 flex items-center gap-2 text-xs text-gray-400 font-semibold text-left">
                    <Calendar className="h-4 w-4 text-[#500c56] shrink-0" />
                    <span>Date Added: <strong className="text-gray-700 ml-1">{selectedSupplier.dateAdded}</strong></span>
                  </div>

                  {/* Amber Actions Buttons Grid */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleOpenEditModal(selectedSupplier)}
                      className="flex-1 bg-gradient-to-r from-[#df8a3c] to-[#e39b4d] text-white text-xs py-3 rounded-[14px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(223,138,60,0.18)] hover:from-[#c27c38] hover:to-[#c57e33] active:scale-95 shrink-0"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleCycleStatus(selectedSupplier)}
                      className="flex-1 bg-gradient-to-r from-[#df8a3c] to-[#e39b4d] text-white text-xs py-3 rounded-[14px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(223,138,60,0.18)] hover:from-[#c27c38] hover:to-[#c57e33] active:scale-95 shrink-0"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Change Status</span>
                    </button>

                    <button
                      onClick={() => handleDeleteSupplier(selectedSupplier)}
                      className="w-12 h-12 rounded-[14px] border-2 border-rose-200 text-rose-500 hover:bg-rose-50 flex items-center justify-center active:scale-95 transition-all shadow-sm shrink-0"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile / Tablet Version: Overlay Slide-In Drawer */}
            <div className="hidden">
              <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
                {/* Backdrop Click closes detail drawer */}
                <div className="absolute inset-0" onClick={() => setSelectedSupplierId("")} />

                {/* Slide content container */}
                <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col overflow-y-auto animate-slide-in">
                  {/* Title Bar */}
                  <div className="bg-[#500c56] text-white p-5 border-b border-[#ffffff]/10 flex items-center justify-between sticky top-0 z-10 shrink-0">
                    <div className="text-left">
                      <span className="text-[11px] uppercase tracking-wider text-[#ecd3ed]/70 font-bold">Selected Supplier</span>
                      <h3 className="text-lg font-bold text-white mt-1 leading-tight">
                        Supplier Details â€” <br />
                        {selectedSupplier.id}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#28c76f] text-white shadow-sm`}>
                        <Check className="h-3.5 w-3.5 text-white" />
                        <span>Active</span>
                      </span>
                      <button
                        onClick={() => setSelectedSupplierId("")}
                        className="p-1 rounded-lg text-white/80 hover:bg-white/10"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Main Scrollable Body */}
                  <div className="p-6 space-y-6">
                    {/* Banner Hero Card */}
                    <div className="relative rounded-[20px] overflow-hidden h-40 bg-gray-900 flex items-end">
                      <img
                        src="/industrial_banner.png"
                        alt={selectedSupplier.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                      />
                      {/* Backdrop Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                      {/* Overlaid Logo and Quick Info */}
                      <div className="relative p-4 flex items-center gap-3 w-full">
                        <div className="w-12 h-12 bg-[#df8a3c] rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
                          <Building className="h-6 w-6" />
                        </div>
                        <div className="text-left text-white leading-tight">
                          <h4 className="font-extrabold text-sm leading-tight text-white">{selectedSupplier.name}</h4>
                          <p className="text-[10px] text-white/70 font-semibold mt-0.5">Est. 2004 Â· {selectedSupplier.location}</p>
                        </div>
                      </div>
                    </div>

                    {/* Rating & Company Subheader */}
                    <div className="flex items-start justify-between border-b border-gray-100 pb-5">
                      <div className="space-y-1 text-left">
                        <h5 className="font-extrabold text-gray-900 text-sm leading-tight">{selectedSupplier.name} Co.</h5>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getProductTypeStyle(selectedSupplier.productType)}`}>
                            {selectedSupplier.productType}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]">
                            Verified
                          </span>
                        </div>
                        <p className="text-[10px] text-[#8c9ba5] font-semibold mt-1.5">CR: {selectedSupplier.crNumber}</p>
                      </div>

                      <div className="text-right">
                        {renderRatingStars(selectedSupplier.rating)}
                        <p className="text-[11px] text-gray-400 font-semibold mt-1">
                          <strong className="text-gray-700">{selectedSupplier.rating}</strong> ({selectedSupplier.reviewsCount} reviews)
                        </p>
                      </div>
                    </div>

                    {/* About Supplier */}
                    <div className="space-y-2 border-b border-gray-100 pb-5 text-left">
                      <h6 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="h-3.5 w-[3px] bg-[#df8a3c] rounded-full inline-block" />
                        About Supplier
                      </h6>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium">
                        {selectedSupplier.about}
                      </p>
                    </div>

                    {/* Supplier Metrics */}
                    <div className="space-y-2.5 border-b border-gray-100 pb-5 text-left">
                      <h6 className="text-[11px] font-bold text-[#8c9ba5] uppercase tracking-wider flex items-center gap-2">
                        <span className="h-3.5 w-[3px] bg-[#df8a3c] rounded-full inline-block" />
                        Supplier Metrics
                      </h6>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#f4f3f6] border border-gray-100 rounded-2xl p-3 text-center">
                          <Users className="h-4.5 w-4.5 text-[#500c56] mx-auto mb-1 shrink-0" />
                          <p className="text-[9px] font-bold text-[#8c9ba5] uppercase tracking-tight">Total RFQs</p>
                          <p className="text-sm font-extrabold text-gray-900 mt-0.5">{selectedSupplier.totalRfqs}</p>
                          <p className="text-[8px] font-semibold text-[#8c9ba5] mt-0.5">Fulfilled</p>
                        </div>

                        <div className="bg-[#fbf7f4] border border-gray-100 rounded-2xl p-3 text-center">
                          <Layers className="h-4.5 w-4.5 text-[#df8a3c] mx-auto mb-1 shrink-0" />
                          <p className="text-[9px] font-bold text-[#8c9ba5] uppercase tracking-tight">Deal Value</p>
                          <p className="text-sm font-extrabold text-gray-900 mt-0.5">{selectedSupplier.dealValue}</p>
                          <p className="text-[8px] font-semibold text-[#8c9ba5] mt-0.5">Transacted</p>
                        </div>

                        <div className="bg-[#f2f8f5] border border-gray-100 rounded-2xl p-3 text-center">
                          <Check className="h-4.5 w-4.5 text-[#28c76f] mx-auto mb-1 shrink-0" />
                          <p className="text-[9px] font-bold text-[#8c9ba5] uppercase tracking-tight">Status</p>
                          <p className="text-sm font-extrabold text-[#28c76f] mt-0.5">{selectedSupplier.status}</p>
                          <p className="text-[8px] font-semibold text-[#8c9ba5] mt-0.5">Verified</p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-3 border-b border-gray-100 pb-5 text-left">
                      <h6 className="text-[11px] font-bold text-[#8c9ba5] uppercase tracking-wider flex items-center gap-2">
                        <span className="h-3.5 w-[3px] bg-[#df8a3c] rounded-full inline-block" />
                        Contact Information
                      </h6>
                      
                      <div className="space-y-2.5">
                        <div className="bg-white border border-[#eef0f3] rounded-xl p-3 flex items-center gap-3 shadow-sm">
                          <div className="w-8.5 h-8.5 rounded-full bg-purple-50 flex items-center justify-center text-[#500c56] shrink-0">
                            <Phone className="h-4 w-4" />
                          </div>
                          <div className="text-xs text-left">
                            <p className="text-[9px] text-[#8c9ba5] font-bold uppercase leading-none">Phone</p>
                            <p className="text-gray-800 font-bold mt-1">{selectedSupplier.contactPhone}</p>
                          </div>
                        </div>

                        <div className="bg-white border border-[#eef0f3] rounded-xl p-3 flex items-center gap-3 shadow-sm">
                          <div className="w-8.5 h-8.5 rounded-full bg-purple-50 flex items-center justify-center text-[#500c56] shrink-0">
                            <Mail className="h-4 w-4" />
                          </div>
                          <div className="text-xs text-left">
                            <p className="text-[9px] text-[#8c9ba5] font-bold uppercase leading-none">Email</p>
                            <a href={`mailto:${selectedSupplier.contactEmail}`} className="text-[#500c56] hover:underline font-bold mt-1 block break-all">
                              {selectedSupplier.contactEmail}
                            </a>
                          </div>
                        </div>

                        <div className="bg-white border border-[#eef0f3] rounded-xl p-3 flex items-center gap-3 shadow-sm">
                          <div className="w-8.5 h-8.5 rounded-full bg-purple-50 flex items-center justify-center text-[#500c56] shrink-0">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div className="text-xs text-left">
                            <p className="text-[9px] text-[#8c9ba5] font-bold uppercase leading-none">Location</p>
                            <p className="text-gray-800 font-bold mt-1">{selectedSupplier.location}</p>
                          </div>
                        </div>

                        <div className="bg-white border border-[#eef0f3] rounded-xl p-3 flex items-center gap-3 shadow-sm">
                          <div className="w-8.5 h-8.5 rounded-full bg-purple-50 flex items-center justify-center text-[#500c56] shrink-0">
                            <Globe className="h-4 w-4" />
                          </div>
                          <div className="text-xs text-left">
                            <p className="text-[9px] text-[#8c9ba5] font-bold uppercase leading-none">Website</p>
                            <a href={`https://${selectedSupplier.website}`} target="_blank" rel="noreferrer" className="text-[#500c56] hover:underline font-bold mt-1 block">
                              {selectedSupplier.website}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Primary Contact */}
                    <div className="space-y-3 border-b border-gray-100 pb-5 text-left">
                      <h6 className="text-[11px] font-bold text-[#8c9ba5] uppercase tracking-wider flex items-center gap-2">
                        <span className="h-3.5 w-[3px] bg-[#df8a3c] rounded-full inline-block" />
                        Primary Contact
                      </h6>
                      <div className="bg-[#f8f9fa] border border-[#eef0f3] rounded-2xl p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0">
                            <img
                              src={selectedSupplier.primaryContact.avatar}
                              alt={selectedSupplier.primaryContact.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-xs text-left leading-tight">
                            <h6 className="font-extrabold text-gray-900">{selectedSupplier.primaryContact.name}</h6>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{selectedSupplier.primaryContact.email}</p>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{selectedSupplier.primaryContact.phone}</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded bg-purple-50 text-[#500c56] text-[10px] font-bold uppercase shrink-0">
                          {selectedSupplier.primaryContact.role}
                        </span>
                      </div>
                    </div>

                    {/* Date Added and Actions */}
                    <div className="space-y-4 text-left">
                      <div className="bg-[#f8f9fa] border border-[#eef0f3] rounded-xl p-3 flex items-center gap-2 text-xs text-gray-400 font-semibold text-left">
                        <Calendar className="h-4 w-4 text-[#500c56] shrink-0" />
                        <span>Date Added: <strong className="text-gray-700 ml-1">{selectedSupplier.dateAdded}</strong></span>
                      </div>

                      {/* Amber Actions Buttons Grid */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleOpenEditModal(selectedSupplier)}
                          className="flex-1 bg-gradient-to-r from-[#df8a3c] to-[#e39b4d] text-white text-xs py-3 rounded-[14px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(223,138,60,0.18)] hover:from-[#c27c38] hover:to-[#c57e33] active:scale-95 shrink-0"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleCycleStatus(selectedSupplier)}
                          className="flex-1 bg-gradient-to-r from-[#df8a3c] to-[#e39b4d] text-white text-xs py-3 rounded-[14px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(223,138,60,0.18)] hover:from-[#c27c38] hover:to-[#c57e33] active:scale-95 shrink-0"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>Change Status</span>
                        </button>

                        <button
                          onClick={() => {
                            handleDeleteSupplier(selectedSupplier);
                            setSelectedSupplierId("");
                          }}
                          className="w-12 h-12 rounded-[14px] border-2 border-rose-200 text-rose-500 hover:bg-rose-50 flex items-center justify-center active:scale-95 transition-all shadow-sm shrink-0"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </section>

      {/* 3. Add Supplier Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in text-left">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#500c56]" />
                Add New Supplier
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAdd} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Supplier Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Supplier Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Al-Rajhi Industrial"
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Riyadh, KSA"
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                {/* Product Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Product Type</label>
                  <select
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all"
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                  >
                    <option value="Machinery">Machinery</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Chemicals">Chemicals</option>
                    <option value="Food & Bev">Food & Bev</option>
                    <option value="Construction">Construction</option>
                    <option value="Textiles">Textiles</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                  <select
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* CR Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">CR Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1010087854"
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all"
                    value={formData.crNumber}
                    onChange={(e) => setFormData({ ...formData, crNumber: e.target.value })}
                  />
                </div>

                {/* Website */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Website</label>
                  <input
                    type="text"
                    placeholder="e.g. www.alrajhi-ind.com"
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>

                {/* Contact Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Supplier Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +966 11 310 0000"
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  />
                </div>

                {/* Contact Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Supplier Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. info@alrajhi-ind.com"
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  />
                </div>
              </div>

              {/* About Supplier */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">About Supplier</label>
                <textarea
                  rows={3}
                  placeholder="Provide details about the supplier's operations and expertise..."
                  className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all resize-none"
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                />
              </div>

              {/* Primary Contact Header */}
              <div className="border-t border-gray-100 pt-4 mt-2">
                <h4 className="text-sm font-bold text-[#500c56] mb-3">Primary Contact Representative</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Khalid Al-Rajhi"
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all"
                      value={formData.primaryContactName}
                      onChange={(e) => setFormData({ ...formData, primaryContactName: e.target.value })}
                    />
                  </div>

                  {/* Role */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Role / Position</label>
                    <input
                      type="text"
                      placeholder="e.g. Director or Supply Officer"
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all"
                      value={formData.primaryContactRole}
                      onChange={(e) => setFormData({ ...formData, primaryContactRole: e.target.value })}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. k.alrajhi@alrajhi-ind.com"
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all"
                      value={formData.primaryContactEmail}
                      onChange={(e) => setFormData({ ...formData, primaryContactEmail: e.target.value })}
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +966 50 310 2222"
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all"
                      value={formData.primaryContactPhone}
                      onChange={(e) => setFormData({ ...formData, primaryContactPhone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-gray-100 pt-5 flex items-center justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4.5 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#df8a3c] to-[#e39b4d] rounded-xl transition-all shadow-[0_4px_14px_rgba(223,138,60,0.25)] hover:from-[#c27c38] hover:to-[#c57e33] active:scale-95"
                >
                  Create Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Edit Supplier Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in text-left">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-[#500c56]" />
                Edit Supplier Info
              </h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Supplier Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Supplier Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Location</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                {/* Product Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Product Type</label>
                  <select
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all"
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                  >
                    <option value="Machinery">Machinery</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Chemicals">Chemicals</option>
                    <option value="Food & Bev">Food & Bev</option>
                    <option value="Construction">Construction</option>
                    <option value="Textiles">Textiles</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                  <select
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* CR Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">CR Number</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all"
                    value={formData.crNumber}
                    onChange={(e) => setFormData({ ...formData, crNumber: e.target.value })}
                  />
                </div>

                {/* Website */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Website</label>
                  <input
                    type="text"
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>

                {/* Contact Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Supplier Phone</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  />
                </div>

                {/* Contact Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Supplier Email</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  />
                </div>
              </div>

              {/* About Supplier */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">About Supplier</label>
                <textarea
                  rows={3}
                  className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all resize-none"
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                />
              </div>

              {/* Primary Contact Header */}
              <div className="border-t border-gray-100 pt-4 mt-2">
                <h4 className="text-sm font-bold text-[#500c56] mb-3">Primary Contact Representative</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all"
                      value={formData.primaryContactName}
                      onChange={(e) => setFormData({ ...formData, primaryContactName: e.target.value })}
                    />
                  </div>

                  {/* Role */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Role / Position</label>
                    <input
                      type="text"
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all"
                      value={formData.primaryContactRole}
                      onChange={(e) => setFormData({ ...formData, primaryContactRole: e.target.value })}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                    <input
                      type="email"
                      required
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all"
                      value={formData.primaryContactEmail}
                      onChange={(e) => setFormData({ ...formData, primaryContactEmail: e.target.value })}
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 px-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all"
                      value={formData.primaryContactPhone}
                      onChange={(e) => setFormData({ ...formData, primaryContactPhone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-gray-100 pt-5 flex items-center justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4.5 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#df8a3c] to-[#e39b4d] rounded-xl transition-all shadow-[0_4px_14px_rgba(223,138,60,0.25)] hover:from-[#c27c38] hover:to-[#c57e33] active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

