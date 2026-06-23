// @ts-nocheck
"use client";

import React, { useEffect, useState, useRef } from "react";
import { getMediaUrl } from "../../lib/media";
import { useRouter } from "next/navigation";
import api from "../../api/axios";
import { adminToast } from "./AdminToast";
import {
  Building,
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
  Star,
  Users,
  User,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Layers,
  FileText,
  Clock,
  Briefcase,
  Activity,
  Globe,
  RefreshCw,
  Lock
} from "lucide-react";

export interface Business {
  apiId?: number;
  profileComplete: boolean;
  id: string;
  name: string;
  status: "Active" | "Under Review" | "Inactive";
  industry: string;
  email: string;
  phone: string;
  location: string;
  addedDate: string;
  addedTime: string;
  crNumber: string;
  about: string;
  totalRfqs: number;
  totalValue: string;
  website: string;
  logoColor: string;
  logoChar: string;
  logo: string;
  primaryContact: {
    name: string;
    role: string;
    email: string;
    phone: string;
    avatar: string;
  };
  rating: number;
  reviewsCount: number;
  type?: string;
  industryId?: number;
  businessTypeId?: number;
}

interface ApiLookupOption {
  id: number | null;
  name: string;
}

interface ApiBusiness {
  id: number | null;
  user_id: string | null;
  user_email: string | null;
  business_name: string;
  cr_number: string;
  business_type: ApiLookupOption;
  industry: ApiLookupOption;
  business_status: "ACTIVE" | "INACTIVE" | "PENDING";
  business_description: string;
  location: string;
  website: string | null;
  logo: string | null;
  user_photo?: string;
  contact_person: string;
  email: string;
  phone: string;
  created_at: string;
  profile_complete?: boolean;
}

interface PaginatedBusinesses {
  count: number;
  results: ApiBusiness[];
}

interface BusinessManagementProps {
  isAddingBusiness?: boolean;
  setIsAddingBusiness?: (val: boolean) => void;
  initialAction?: string;
  initialActionId?: string;
}

export default function BusinessManagement({
  isAddingBusiness = false,
  setIsAddingBusiness = () => {},
  initialAction,
  initialActionId,
}: BusinessManagementProps) {
  const router = useRouter();
  const editingApiId =
    initialAction === "edit" && initialActionId
      ? Number(initialActionId)
      : null;
  const isEditingBusiness = Number.isInteger(editingApiId);
  const [businessList, setBusinessList] = useState<Business[]>([]);

  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [filterSegment, setFilterSegment] = useState<"All" | "Active" | "Review">("All");
  const [filterIndustry, setFilterIndustry] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const businessesPerPage = 8;
  const isEditingUserAccount = Boolean(editingUserId);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // Form states
  const [formName, setFormName] = useState("");
  const [formIndustry, setFormIndustry] = useState("Conglomerate");
  const [formStatus, setFormStatus] = useState<Business["status"]>("Active");
  const [formLocation, setFormLocation] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formPasswordError, setFormPasswordError] = useState("");
  const [formWebsite, setFormWebsite] = useState("");
  const [formCrNumber, setFormCrNumber] = useState("");
  const [formAbout, setFormAbout] = useState("");
  const [formContactName, setFormContactName] = useState("");
  const [formContactRole, setFormContactRole] = useState("");
  const [formContactPhone, setFormContactPhone] = useState("");
  const [formContactEmail, setFormContactEmail] = useState("");
  const [formType, setFormType] = useState("Select Type");
  const [logoUploaded, setLogoUploaded] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFileName, setLogoFileName] = useState("No file selected");
  const [logoFileSize, setLogoFileSize] = useState("Recommended: 200×200px");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [industryOptions, setIndustryOptions] = useState<ApiLookupOption[]>([]);
  const [businessTypeOptions, setBusinessTypeOptions] = useState<ApiLookupOption[]>([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);
  const [businessError, setBusinessError] = useState("");

  const mapApiBusiness = (business: ApiBusiness): Business => {
    const createdAt = new Date(business.created_at);
    const profileComplete =
      business.profile_complete ?? business.id !== null;
    const status: Business["status"] =
      business.business_status === "ACTIVE"
        ? "Active"
        : business.business_status === "PENDING"
          ? "Under Review"
          : "Inactive";

    return {
      apiId: business.id ?? undefined,
      profileComplete,
      id: business.user_id || `#BIZ-${String(business.id).padStart(4, "0")}`,
      name: business.business_name,
      status,
      industry: business.industry.name,
      industryId: business.industry.id ?? undefined,
      businessTypeId: business.business_type.id ?? undefined,
      type: business.business_type.name,
      email: business.email,
      phone: business.phone,
      location: business.location,
      addedDate: createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      addedTime: createdAt.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      crNumber: business.cr_number,
      about: business.business_description,
      totalRfqs: 0,
      totalValue: "SAR 0",
      website: business.website || "",
      logo: business.logo || "",
      logoColor: "bg-[#500c56]",
      logoChar: business.business_name.charAt(0).toUpperCase() || "B",
      primaryContact: {
        name: business.contact_person,
        role: business.business_type.name,
        email: business.email,
        phone: business.phone,
        avatar: business.user_photo || "",
      },
      rating: 0,
      reviewsCount: 0,
    };
  };

  useEffect(() => {
    let isMounted = true;

    async function loadBusinessData() {
      setIsLoadingBusinesses(true);
      setBusinessError("");

      try {
        const [
          { data: businessData },
          { data: industries },
          { data: businessTypes },
        ] = await Promise.all([
          api.get<PaginatedBusinesses>("/businesses/?page_size=100"),
          api.get<ApiLookupOption[]>("/industries/"),
          api.get<ApiLookupOption[]>("/business-types/"),
        ]);
        if (!isMounted) return;

        const businesses = businessData.results.map(mapApiBusiness);
        setBusinessList(businesses);
        setIndustryOptions(industries);
        setBusinessTypeOptions(businessTypes);
        setSelectedBusinessId(businesses[0]?.id || null);
        setSelectedRowIds(businesses[0] ? [businesses[0].id] : []);
        setFormIndustry((current) =>
          industries.some((option) => option.name === current)
            ? current
            : industries[0]?.name || "Select Industry"
        );
        setFormType((current) =>
          businessTypes.some((option) => option.name === current)
            ? current
            : businessTypes[0]?.name || "Select Type"
        );
      } catch (error) {
        console.error("Unable to load businesses.", error);
        if (isMounted) {
          setBusinessList([]);
          setBusinessError("Unable to load businesses from the backend.");
        }
      } finally {
        if (isMounted) setIsLoadingBusinesses(false);
      }
    }

    loadBusinessData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isEditingBusiness || !editingApiId) return;
    const business = businessList.find((item) => item.apiId === editingApiId);
    if (!business) return;

    setSelectedBusinessId(business.id);
    setFormName(business.name);
    setFormIndustry(business.industry);
    setFormStatus(business.status);
    setFormLocation(business.location);
    setFormPhone(business.phone);
    setFormEmail(business.email);
    setFormWebsite(business.website);
    setFormCrNumber(business.crNumber);
    setFormAbout(business.about);
    setFormContactName(business.primaryContact.name);
    setFormContactRole(business.primaryContact.role);
    setFormContactEmail(business.primaryContact.email);
    setFormContactPhone(business.primaryContact.phone);
    setFormType(business.type || "Select Type");
    setLogoFile(null);
    setLogoPreview(business.logo || null);
    setLogoUploaded(Boolean(business.logo));
    setLogoFileName(
      business.logo
        ? business.logo.split("/").pop() || "Current logo"
        : "No file selected"
    );
    setLogoFileSize(
      business.logo
        ? "Current business logo"
        : "Recommended: 200×200px"
    );
  }, [businessList, editingApiId, isEditingBusiness]);

  useEffect(() => {
    if (!businessError) return;
    adminToast.error("Unable to save business", businessError);
    setBusinessError("");
  }, [businessError]);

  const businessErrorToast = null;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setBusinessError("Only JPEG, PNG, and WebP logos are allowed.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setBusinessError("Logo file size must be 5MB or less.");
      e.target.value = "";
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoPreview(ev.target?.result as string);
      setLogoUploaded(true);
      setLogoFileName(file.name);
      setLogoFileSize(`${(file.size / 1024).toFixed(0)} KB · Done`);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const selectedBusiness = businessList.find(b => b.id === selectedBusinessId) || null;

  // Stats calculation matching mockup
  const totalCount = businessList.length;
  const activeCount = businessList.filter(b => b.status === "Active").length;
  const inactiveCount = businessList.filter(b => b.status === "Inactive").length;
  const reviewCount = businessList.filter(b => b.status === "Under Review").length;

  // Filtered lists
  const filteredBusinesses = businessList.filter(b => {
    // Segment Filter (All, Active, Review)
    const matchesSegment = 
      filterSegment === "All" ||
      (filterSegment === "Active" && b.status === "Active") ||
      (filterSegment === "Review" && b.status === "Under Review");

    // Industry Dropdown Filter
    const matchesIndustry = filterIndustry === "All" || b.industry === filterIndustry;

    // Status Dropdown Filter
    const matchesStatus = filterStatus === "All" || b.status === filterStatus;

    // Search Query Filter
    const matchesSearch = 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSegment && matchesIndustry && matchesStatus && matchesSearch;
  });
  const totalPages = Math.max(
    1,
    Math.ceil(filteredBusinesses.length / businessesPerPage)
  );
  const pageStartIndex = (currentPage - 1) * businessesPerPage;
  const paginatedBusinesses = filteredBusinesses.slice(
    pageStartIndex,
    pageStartIndex + businessesPerPage
  );
  const showingStart = filteredBusinesses.length === 0 ? 0 : pageStartIndex + 1;
  const showingEnd = Math.min(
    pageStartIndex + businessesPerPage,
    filteredBusinesses.length
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterSegment, filterIndustry, filterStatus, searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleRowSelectToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedRowIds.includes(id)) {
      setSelectedRowIds(prev => prev.filter(rowId => rowId !== id));
    } else {
      setSelectedRowIds(prev => [...prev, id]);
    }
  };

  const getBusinessPayload = (includePassword = false) => {
    const industry = industryOptions.find((option) => option.name === formIndustry);
    const businessType = businessTypeOptions.find((option) => option.name === formType);
    const email = formEmail || formContactEmail;
    const phone = formPhone || formContactPhone;

    if (!industry || !businessType) {
      throw new Error("Select an industry and business type from the backend list.");
    }

    return {
      business_name: formName,
      cr_number: formCrNumber,
      business_type: businessType.id,
      industry: industry.id,
      business_status:
        formStatus === "Active"
          ? "ACTIVE"
          : formStatus === "Under Review"
            ? "PENDING"
            : "INACTIVE",
      business_description: formAbout,
      location: formLocation,
      website: formWebsite
        ? /^https?:\/\//i.test(formWebsite)
          ? formWebsite
          : `https://${formWebsite}`
        : null,
      contact_person: formContactName,
      email,
      phone: phone.replace(/[^\d+]/g, ""),
      ...(includePassword ? { password: formPassword } : {}),
    };
  };

  const getBusinessFormData = (includePassword = false) => {
    const payload = new FormData();
    const businessPayload = getBusinessPayload(includePassword);

    Object.entries(businessPayload).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        payload.append(key, String(value));
      }
    });
    if (logoFile) {
      payload.append("logo", logoFile);
    }

    return payload;
  };

  const validateBusinessForm = (includePassword = false) => {
    const requiredFields = [
      [formName, "Business name is required."],
      [formCrNumber, "CR number is required."],
      [formLocation, "Location is required."],
      [formAbout, "Business description is required."],
      [formContactName, "Contact person is required."],
      [formEmail || formContactEmail, "Email address is required."],
      [formPhone || formContactPhone, "Phone number is required."],
    ];
    const missingField = requiredFields.find(([value]) => !String(value).trim());
    if (missingField) {
      setBusinessError(String(missingField[1]));
      return false;
    }
    if (!industryOptions.some((option) => option.name === formIndustry)) {
      setBusinessError("Select a valid industry.");
      return false;
    }
    if (!businessTypeOptions.some((option) => option.name === formType)) {
      setBusinessError("Select a valid business type.");
      return false;
    }
    if (includePassword && formPassword.length < 8) {
      setFormPasswordError("Password must contain at least 8 characters.");
      setBusinessError("Password must contain at least 8 characters.");
      return false;
    }
    return true;
  };

  const getApiErrorMessage = (error: any, fallback: string) => {
    const data = error?.response?.data;
    if (!data) return error instanceof Error ? error.message : fallback;

    const messages = Object.entries(data).flatMap(([field, value]) => {
      const values = Array.isArray(value) ? value : [value];
      return values.map((message) => `${field}: ${String(message)}`);
    });
    return messages.join(" ") || fallback;
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBusinessForm(true)) return;
    setFormPasswordError("");
    setIsSavingBusiness(true);
    setBusinessError("");

    try {
      const { data } = await api.post<ApiBusiness>(
        "/businesses/",
        getBusinessFormData(true)
      );
      const newBusiness = mapApiBusiness(data);
      setBusinessList((current) => [newBusiness, ...current]);
      setSelectedBusinessId(newBusiness.id);
      setSelectedRowIds([newBusiness.id]);
      setIsAddModalOpen(false);
      setIsAddingBusiness(false);
      router.push("/admin/users");
      clearForm();
      adminToast.success("Business created", "The business was created successfully.");
    } catch (error) {
      console.error("Unable to create business.", error);
      setBusinessError(getApiErrorMessage(error, "Unable to create the business."));
    } finally {
      setIsSavingBusiness(false);
    }
  };

  const handleEditClick = (b: Business) => {
    if (!b.apiId) {
      setSelectedBusinessId(b.id);
      setEditingUserId(b.id);
      setFormName(b.name);
      setFormIndustry(industryOptions[0]?.name || "Select Industry");
      setFormStatus(b.status);
      setFormLocation(b.location);
      setFormPhone(b.phone);
      setFormEmail(b.email);
      setFormWebsite(b.website);
      setFormCrNumber(b.crNumber);
      setFormAbout("");
      setFormContactName(b.primaryContact.name);
      setFormContactRole(b.primaryContact.role);
      setFormContactEmail(b.primaryContact.email);
      setFormContactPhone(b.primaryContact.phone);
      setFormType(businessTypeOptions[0]?.name || "Select Type");
      setLogoFile(null);
      setLogoPreview(b.logo || null);
      setLogoUploaded(Boolean(b.logo));
      setLogoFileName(b.logo ? b.logo.split("/").pop() || "Current logo" : "No file selected");
      setLogoFileSize(b.logo ? "Current business logo" : "Recommended: 200×200px");
      router.push("/admin/users");
      return;
    }
    router.push(`/admin/users/edit/${b.apiId}`);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusinessId) return;
    const business = businessList.find((item) => item.id === selectedBusinessId);
    if (!business?.apiId) return;
    if (!validateBusinessForm()) return;

    setIsSavingBusiness(true);
    setBusinessError("");
    try {
      const { data } = await api.patch<ApiBusiness>(
        `/businesses/${business.apiId}/`,
        getBusinessFormData()
      );
      const updatedBusiness = mapApiBusiness(data);
      setBusinessList((current) =>
        current.map((item) =>
          item.apiId === updatedBusiness.apiId ? updatedBusiness : item
        )
      );
      setSelectedBusinessId(updatedBusiness.id);
      clearForm();
      router.push("/admin/users");
      adminToast.success("Business updated", "The business changes were saved.");
    } catch (error) {
      console.error("Unable to update business.", error);
      setBusinessError(getApiErrorMessage(error, "Unable to update the business."));
    } finally {
      setIsSavingBusiness(false);
    }
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId || !validateBusinessForm()) return;

    setIsSavingBusiness(true);
    setBusinessError("");
    try {
      const { data } = await api.patch<ApiBusiness>(
        `/business-users/${editingUserId}/`,
        getBusinessFormData()
      );
      const updatedBusiness = mapApiBusiness(data);
      setBusinessList((current) =>
        current.map((item) => (item.id === editingUserId ? updatedBusiness : item))
      );
      setSelectedBusinessId(updatedBusiness.id);
      setSelectedRowIds([updatedBusiness.id]);
      setEditingUserId(null);
      clearForm();
      router.push("/admin/users");
      adminToast.success("Business user updated", "The business user changes were saved.");
    } catch (error) {
      console.error("Unable to update business user.", error);
      setBusinessError(getApiErrorMessage(error, "Unable to update the business user."));
    } finally {
      setIsSavingBusiness(false);
    }
  };

  const handleCycleStatus = async (id: string) => {
    const business = businessList.find((item) => item.id === id);
    if (!business) return;
    const nextStatus =
      business.status === "Active"
        ? "PENDING"
        : business.status === "Under Review"
          ? "INACTIVE"
          : "ACTIVE";

    try {
      const { data } = await api.patch<ApiBusiness>(
        business.apiId
          ? `/businesses/${business.apiId}/`
          : `/business-users/${business.id}/`,
        { business_status: nextStatus }
      );
      const updatedBusiness = mapApiBusiness(data);
      setBusinessList((current) =>
        current.map((item) =>
          item.id === id || item.apiId === updatedBusiness.apiId ? updatedBusiness : item
        )
      );
      adminToast.success("Business status updated", "The new status is now active.");
    } catch (error) {
      console.error("Unable to update business status.", error);
      setBusinessError("Unable to update the business status.");
    }
  };

  const handleDeleteBusiness = async (id: string) => {
    if (confirm("Archive this business profile? It will be hidden and its account will no longer be able to sign in.")) {
      const business = businessList.find((item) => item.id === id);
      if (!business) return;
      try {
        await api.delete(
          business.apiId
            ? `/businesses/${business.apiId}/`
            : `/business-users/${business.id}/`
        );
        setBusinessList((current) => current.filter((item) => item.id !== id));
        setSelectedRowIds((current) => current.filter((rowId) => rowId !== id));
        setSelectedBusinessId(null);
        adminToast.success("Business archived", "The business was archived successfully.");
      } catch (error) {
        console.error("Unable to archive business.", error);
        setBusinessError("Unable to archive the business.");
      }
    }
  };

  const clearForm = () => {
    setFormName("");
    setFormIndustry(industryOptions[0]?.name || "Select Industry");
    setFormStatus("Active");
    setFormLocation("");
    setFormPhone("");
    setFormEmail("");
    setFormPassword("");
    setFormPasswordError("");
    setFormWebsite("");
    setFormCrNumber("");
    setFormAbout("");
    setFormContactName("");
    setFormContactRole("");
    setFormContactPhone("");
    setFormContactEmail("");
    setFormType(businessTypeOptions[0]?.name || "Select Type");
    setLogoFile(null);
    setLogoUploaded(false);
    setLogoPreview(null);
    setLogoFileName("No file selected");
    setLogoFileSize("Recommended: 200×200px");
  };

  const getLogoIcon = (industry: string) => {
    switch (industry) {
      case "Conglomerate":
        return <Building className="w-5 h-5 text-white" />;
      case "Energy":
        return <Activity className="w-5 h-5 text-white" />;
      case "Construction":
        return <Building className="w-5 h-5 text-white" />;
      case "Chemicals":
        return <Layers className="w-5 h-5 text-white" />;
      case "Logistics":
        return <Briefcase className="w-5 h-5 text-white" />;
      case "Mining":
        return <Layers className="w-5 h-5 text-white" />;
      case "Agriculture":
        return <Globe className="w-5 h-5 text-white" />;
      default:
        return <Building className="w-5 h-5 text-white" />;
    }
  };

  // Checklist calculations
  const isBasicFilled = !!(formName && formLocation && formAbout);
  const isContactFilled = !!(formContactName && formContactPhone && formContactEmail);
  const isTypeFilled = formType !== "Select Type";
  const completionPercentage = (isBasicFilled ? 25 : 0) + (isContactFilled ? 25 : 0) + (isTypeFilled ? 25 : 0) + (logoUploaded ? 25 : 0);

  if (isAddingBusiness || isEditingBusiness || isEditingUserAccount) {
    return (
      <div className="pb-28">
        {businessErrorToast}
        {/* Business Registration Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-[#eef0f3] rounded-[20px] shadow-sm mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#500c56]/10 flex items-center justify-center text-[#500c56]">
              <Building className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="font-extrabold text-[#500c56] text-sm">
                {isEditingBusiness || isEditingUserAccount ? "Edit Business" : "Business Registration"}
              </h3>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">
                {isEditingBusiness || isEditingUserAccount
                  ? "Update the business details below"
                  : "Fill in the details below to add a new business to the platform"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50/50 border border-amber-100/30 rounded-xl text-amber-700 text-xs font-bold mt-3 sm:mt-0 shadow-sm shrink-0">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            <span>All fields marked * are required</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column - Form fields (70%) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Basic Information Card */}
            <div className="bg-white rounded-[24px] border border-[#eef0f3] p-6 shadow-sm text-left space-y-5">
              <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                <div className="w-7 h-7 rounded-lg bg-[#500c56]/5 flex items-center justify-center text-[#500c56]">
                  <Building className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-sm">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Business Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Business Name <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Building className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Al-Noor Trading Co."
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Industry */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Industry <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Briefcase className="h-4 w-4" />
                    </span>
                    <select
                      value={formIndustry}
                      onChange={(e) => setFormIndustry(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all cursor-pointer font-semibold"
                      required
                    >
                      <option value="Select Industry">Select Industry</option>
                      {industryOptions.map((industry) => (
                        <option key={industry.id} value={industry.name}>
                          {industry.name}
                        </option>
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
                      placeholder="e.g. Riyadh, Saudi Arabia"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                      required
                    />
                  </div>
                </div>

                {/* CR Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    CR Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <FileText className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. CR-10001"
                      value={formCrNumber}
                      onChange={(e) => setFormCrNumber(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Website <span className="text-gray-400">(Optional)</span></label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Globe className="h-4 w-4" />
                    </span>
                    <input
                      type="url"
                      placeholder="https://www.example.com"
                      value={formWebsite}
                      onChange={(e) => setFormWebsite(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Business Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Business Description <span className="text-rose-500">*</span></label>
                <textarea
                  placeholder="Briefly describe the nature and operations of this business..."
                  value={formAbout}
                  onChange={(e) => setFormAbout(e.target.value.slice(0, 500))}
                  className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all resize-none h-28 font-medium"
                  required
                />
                <div className="flex justify-between text-[10px] text-gray-455 font-bold uppercase">
                  <span>Max 500 characters</span>
                  <span>{formAbout.length} / 500 characters</span>
                </div>
              </div>
            </div>

            {/* 2. Contact Information Card */}
            <div className="bg-white rounded-[24px] border border-[#eef0f3] p-6 shadow-sm text-left space-y-5">
              <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-sm">Contact Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      value={formContactName}
                      onChange={(e) => setFormContactName(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                      required
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
                      type="tel"
                      placeholder="+966 5X XXX XXXX"
                      value={formContactPhone}
                      onChange={(e) => setFormContactPhone(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Email Address <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      placeholder="contact@business.com"
                      value={formContactEmail}
                      onChange={(e) => setFormContactEmail(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                      required
                    />
                  </div>
                </div>

                {!isEditingBusiness && !isEditingUserAccount && (
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Login Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={formPassword}
                      onChange={(e) => {
                        setFormPassword(e.target.value);
                        if (formPasswordError) setFormPasswordError("");
                      }}
                      autoComplete="new-password"
                      minLength={8}
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                      required
                    />
                  </div>
                  <p className="text-[10px] font-semibold text-gray-400">
                    Used by the business with its email to sign in.
                  </p>
                </div>
                )}
              </div>
            </div>

            {/* 3. Business Classification Card */}
            <div className="bg-white rounded-[24px] border border-[#eef0f3] p-6 shadow-sm text-left space-y-5">
              <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-[#500c56]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-sm">Business Classification</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Business Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Business Type <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Layers className="h-4 w-4" />
                    </span>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all cursor-pointer font-semibold"
                      required
                    >
                      <option value="Select Type">Select Type</option>
                      {businessTypeOptions.map((businessType) => (
                        <option key={businessType.id} value={businessType.name}>
                          {businessType.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Business Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Business Status <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Activity className="h-4 w-4" />
                    </span>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all cursor-pointer font-semibold"
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setIsAddingBusiness(false);
                  setEditingUserId(null);
                  router.push("/admin/users");
                }}
                className="px-6 py-2.5 border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-bold rounded-xl active:scale-95 transition-all w-full sm:w-auto text-center"
              >
                Cancel
              </button>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {!isEditingBusiness && !isEditingUserAccount && <button
                  type="button"
                  onClick={() => { setIsAddingBusiness(false); router.push('/admin/users'); }}
                  className="px-6 py-2.5 bg-slate-50 border border-slate-200 text-slate-705 hover:bg-slate-100 text-xs font-bold rounded-xl active:scale-95 transition-all text-center"
                >
                  Save as Draft
                </button>}
                <button
                  type="button"
                  onClick={
                    isEditingBusiness
                      ? handleEditSubmit
                      : isEditingUserAccount
                        ? handleEditUserSubmit
                        : handleAddSubmit
                  }
                  disabled={isSavingBusiness}
                  className="px-6 py-2.5 bg-[#df8a3c] hover:bg-[#c47c23] text-white text-xs font-black rounded-xl active:scale-95 transition-all shadow-sm shadow-orange-100 text-center"
                >
                  {isSavingBusiness
                    ? "Saving..."
                    : isEditingBusiness || isEditingUserAccount
                      ? "Save Changes"
                      : "Save Business"}
                </button>
              </div>
            </div>

          </div>

          {/* Right Column - Status & Checklists (30%) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Card 1: Business Logo */}
            <div className="bg-white rounded-[24px] border border-[#eef0f3] p-6 shadow-sm text-left space-y-4">
              <h3 className="font-extrabold text-gray-900 text-sm">Business Logo</h3>
              
              {/* Hidden file input */}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleLogoChange}
              />

              {/* Upload dashed box */}
              <div
                onClick={() => logoInputRef.current?.click()}
                className="border-2 border-dashed border-purple-200 rounded-[20px] p-6 flex flex-col items-center justify-center text-center bg-[#500c56]/[0.01] hover:bg-[#500c56]/[0.03] transition-colors cursor-pointer"
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-16 h-16 rounded-xl object-contain mb-3 border border-purple-100" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-[#500c56] flex items-center justify-center mb-3.5 shadow-inner">
                    <Plus className="h-5 w-5" />
                  </div>
                )}
                <h4 className="font-extrabold text-gray-800 text-xs">{logoPreview ? "Change Logo" : "Upload Logo"}</h4>
                <p className="text-[10px] text-gray-400 font-semibold mt-1 max-w-[170px] leading-relaxed">
                  Drag & drop or click to browse PNG, JPG, WebP up to 5MB
                </p>
                <button
                  type="button"
                  className="mt-4 px-4 py-2 bg-[#500c56] text-white hover:bg-[#6c1674] text-[10px] font-black rounded-lg transition-all active:scale-95"
                >
                  Browse Files
                </button>
              </div>

              {/* Upload footer */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1 text-left leading-normal">
                  <p className="font-extrabold text-gray-800 line-clamp-1">{logoFileName}</p>
                  <p className="text-[9px] text-gray-400 font-bold">{logoFileSize}</p>
                </div>
                {logoUploaded && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setLogoFile(null); setLogoPreview(null); setLogoUploaded(false); setLogoFileName("No file selected"); setLogoFileSize("Recommended: 200×200px"); }}
                    className="text-[10px] font-black text-rose-500 hover:text-rose-700 transition-colors shrink-0"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Card 2: Completion Checklist */}
            <div className="bg-white rounded-[24px] border border-[#eef0f3] p-6 shadow-sm text-left space-y-5">
              <h3 className="font-extrabold text-gray-900 text-sm">Completion Checklist</h3>

              <div className="space-y-4">
                {/* Item 1 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {isBasicFilled ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    ) : (
                      <span className="w-5 h-5 rounded-full border-2 border-purple-200 bg-white shrink-0" />
                    )}
                    <span className={`text-xs font-bold ${isBasicFilled ? "text-gray-500" : "text-gray-800"}`}>Basic information filled</span>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {isContactFilled ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    ) : (
                      <span className="w-5 h-5 rounded-full border-2 border-purple-200 bg-white shrink-0" />
                    )}
                    <span className={`text-xs font-bold ${isContactFilled ? "text-gray-500" : "text-gray-800"}`}>Contact details provided</span>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {isTypeFilled ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    ) : (
                      <span className="w-5 h-5 rounded-full border-2 border-purple-200 bg-white shrink-0" />
                    )}
                    <span className={`text-xs font-bold ${isTypeFilled ? "text-gray-500" : "text-gray-800"}`}>Business type selected</span>
                  </div>
                </div>

                {/* Item 4 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {logoUploaded ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    ) : (
                      <span className="w-5 h-5 rounded-full border-2 border-purple-200 bg-white shrink-0" />
                    )}
                    <span className={`text-xs font-bold ${logoUploaded ? "text-gray-500" : "text-gray-800"}`}>Logo uploaded</span>
                  </div>
                </div>
              </div>

              {/* Progress status bar */}
              <div className="pt-3 border-t border-gray-100 space-y-2.5">
                <div className="flex justify-between items-center text-xs font-black">
                  <span className="text-gray-500">Profile Completion</span>
                  <span className="text-[#500c56]">{completionPercentage}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-[#500c56] to-[#df8a3c] rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Quick Tips */}
            <div className="bg-[#500c56] rounded-[24px] p-6 text-white text-left space-y-4 shadow-md">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-305 shrink-0 animate-pulse" />
                <span>Quick Tips</span>
              </h3>
              <ul className="space-y-3.5 text-xs text-white/90 leading-relaxed font-semibold">
                <li className="flex gap-2">
                  <span className="text-amber-300 mt-0.5">-</span>
                  <span>Use a clear, high-resolution logo for best visibility.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-300 mt-0.5">-</span>
                  <span>A detailed description helps buyers discover your business faster.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-300 mt-0.5">-</span>
                  <span>Ensure contact info is accurate to receive RFQs.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Mockup Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Businesses */}
        <div className="bg-white border border-[#eef0f3] rounded-[20px] p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed] shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Total Businesses</p>
            <p className="text-[26px] font-extrabold text-gray-900 mt-0.5 leading-none">{totalCount}</p>
          </div>
        </div>

        {/* Active */}
        <div className="bg-white border border-[#eef0f3] rounded-[20px] p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Active</p>
            <p className="text-[26px] font-extrabold text-gray-900 mt-0.5 leading-none">{activeCount}</p>
          </div>
        </div>

        {/* Inactive */}
        <div className="bg-white border border-[#eef0f3] rounded-[20px] p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Inactive</p>
            <p className="text-[26px] font-extrabold text-gray-900 mt-0.5 leading-none">{inactiveCount}</p>
          </div>
        </div>

        {/* Under Review */}
        <div className="bg-white border border-[#eef0f3] rounded-[20px] p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Under Review</p>
            <p className="text-[26px] font-extrabold text-gray-900 mt-0.5 leading-none">{reviewCount}</p>
          </div>
        </div>
      </section>

      {businessErrorToast}

      {/* 2. Filter Bar Above Columns */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full lg:max-w-[350px]">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search businesses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#eef0f3] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#500c56]/40 shadow-sm"
          />
        </div>

        {/* Dropdowns & Add Button */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
          {/* Industry filter */}
          <div className="relative flex items-center bg-white border border-[#eef0f3] rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-500 shadow-sm gap-2 focus-within:ring-1 focus-within:ring-[#500c56]/40">
            <Briefcase className="h-4 w-4 text-gray-400 shrink-0" />
            <select
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
              className="bg-transparent focus:outline-none appearance-none pr-5 cursor-pointer text-gray-700 font-bold"
            >
              <option value="All">Industry</option>
              {industryOptions.map((industry) => (
                <option key={industry.id} value={industry.name}>
                  {industry.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-gray-400">
              <ChevronRight className="h-3.5 w-3.5 transform rotate-90" />
            </div>
          </div>

          {/* Status filter */}
          <div className="relative flex items-center bg-white border border-[#eef0f3] rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-500 shadow-sm gap-2 focus-within:ring-1 focus-within:ring-[#500c56]/40">
            <Activity className="h-4 w-4 text-gray-400 shrink-0" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent focus:outline-none appearance-none pr-5 cursor-pointer text-gray-700 font-bold"
            >
              <option value="All">Status</option>
              <option value="Active">Active</option>
              <option value="Under Review">Under Review</option>
              <option value="Inactive">Inactive</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-gray-400">
              <ChevronRight className="h-3.5 w-3.5 transform rotate-90" />
            </div>
          </div>

          {/* Add Business Button */}
          <button
            onClick={() => {
              clearForm();
              setIsAddingBusiness(true);
              router.push('/admin/users/add');
            }}
            className="bg-[#500c56] hover:bg-[#6c1674] text-white text-sm px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm shrink-0"
          >
            <Plus className="h-4 w-4 text-white" />
            <span>Add Business</span>
          </button>
        </div>
      </div>

      {/* 3. Grid Columns */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Business List */}
        <div className="lg:col-span-2 bg-white rounded-[20px] border border-[#eef0f3] p-6 shadow-sm flex flex-col justify-between min-h-[680px]">
          <div>
            {isLoadingBusinesses ? (
              <p className="py-12 text-center text-sm font-semibold text-gray-400">
                Loading businesses...
              </p>
            ) : null}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center">
                <h3 className="text-lg font-bold text-gray-900">Business List</h3>
                <span className="text-xs font-bold px-2.5 py-1 bg-[#7c3aed]/10 text-[#7c3aed] rounded-full ml-3">
                  {totalCount} total
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                <button className="flex items-center gap-1.5 px-3.5 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-xs font-semibold hover:bg-gray-50 active:scale-95 transition-all shadow-sm shrink-0">
                  <Download className="h-3.5 w-3.5" />
                  <span>Export</span>
                </button>

                <div className="bg-[#f8f9fa] border border-[#eef0f3] rounded-lg p-0.5 flex">
                  {(["All", "Active", "Review"] as const).map((segment) => (
                    <button
                      key={segment}
                      onClick={() => setFilterSegment(segment)}
                      className={`text-xs px-3.5 py-1.5 rounded-md font-bold transition-all ${
                        filterSegment === segment
                          ? "bg-[#500c56] text-white shadow-sm"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {segment === "Review" ? "Review" : segment}
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
                    <tr className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="pb-3.5 font-bold w-12">
                        <input
                          type="checkbox"
                          checked={
                            paginatedBusinesses.length > 0 &&
                            paginatedBusinesses.every((business) =>
                              selectedRowIds.includes(business.id)
                            )
                          }
                          onChange={() => {
                            const pageIds = paginatedBusinesses.map((business) => business.id);
                            const isPageSelected = pageIds.every((id) =>
                              selectedRowIds.includes(id)
                            );
                            if (isPageSelected) {
                              setSelectedRowIds((current) =>
                                current.filter((id) => !pageIds.includes(id))
                              );
                            } else {
                              setSelectedRowIds((current) => [
                                ...new Set([...current, ...pageIds]),
                              ]);
                            }
                          }}
                          className="rounded text-[#500c56] focus:ring-[#500c56] cursor-pointer"
                        />
                      </th>
                      <th className="pb-3.5 font-bold">BIZ ID</th>
                      <th className="pb-3.5 font-bold">NAME</th>
                      <th className="pb-3.5 font-bold">STATUS</th>
                      <th className="pb-3.5 font-bold">CONTACT</th>
                      <th className="pb-3.5 font-bold">LOCATION</th>
                      <th className="pb-3.5 font-bold">ADDED</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs sm:text-sm text-gray-700">
                    {paginatedBusinesses.map((b) => {
                      const isSelected = selectedBusinessId === b.id;
                      const isChecked = selectedRowIds.includes(b.id);
                      return (
                        <tr
                          key={b.id}
                          onClick={() => {
                            setSelectedBusinessId(b.id);
                            if (!selectedRowIds.includes(b.id)) {
                              setSelectedRowIds([b.id]);
                            }
                          }}
                          className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${
                            isSelected ? "bg-[#500c56]/5" : ""
                          }`}
                        >
                          <td className="py-4" onClick={(e) => handleRowSelectToggle(b.id, e)}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="rounded text-[#500c56] focus:ring-[#500c56] cursor-pointer"
                            />
                          </td>
                          <td className={`py-4 font-bold ${isSelected ? "text-[#500c56]" : "text-gray-500"}`}>
                            {b.id}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-lg ${b.logoColor} flex items-center justify-center overflow-hidden shrink-0 shadow-sm text-sm font-black text-white`}>
                                {b.primaryContact.avatar ? (
                                  <img
                                    src={getMediaUrl(b.primaryContact.avatar)}
                                    alt={`${b.name} profile`}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  b.logoChar
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-gray-800 line-clamp-1">{b.primaryContact.name || b.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              b.status === "Active" ? "bg-emerald-50 text-emerald-700" :
                              b.status === "Inactive" ? "bg-slate-50 text-gray-500" :
                              "bg-amber-50 text-amber-700"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                b.status === "Active" ? "bg-emerald-500" :
                                b.status === "Inactive" ? "bg-gray-400" :
                                "bg-amber-500"
                              }`} />
                              {b.status}
                            </span>
                          </td>
                          <td className="py-4 text-gray-500 font-semibold">{b.phone}</td>
                          <td className="py-4 text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                              <span className="font-semibold">{b.location}</span>
                            </div>
                          </td>
                          <td className="py-4 text-gray-400 font-medium">{b.addedDate}</td>
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
              Showing {showingStart}-{showingEnd} of {filteredBusinesses.length} businesses
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold ${
                      currentPage === page
                        ? "bg-[#500c56] text-white"
                        : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Business Details Panel */}
        <div className="lg:col-span-1 bg-white rounded-[20px] border border-[#eef0f3] overflow-hidden shadow-sm">
          {selectedBusiness ? (
            <div className="flex flex-col">
              {/* Header */}
              <div className="h-16 flex items-center justify-between px-5 bg-[#500c56] text-white shrink-0">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#ecd3ed]/70 font-bold uppercase">Selected Business</span>
                  <span className="text-xs sm:text-sm font-bold text-white leading-tight">
                    Business Details - {selectedBusiness.id}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
                    selectedBusiness.status === "Active" ? "border-emerald-400 bg-emerald-500/10 text-emerald-300" :
                    selectedBusiness.status === "Inactive" ? "border-slate-400 bg-slate-500/10 text-slate-350" :
                    "border-amber-400 bg-amber-500/10 text-amber-300"
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${
                      selectedBusiness.status === "Active" ? "bg-emerald-400" :
                      selectedBusiness.status === "Inactive" ? "bg-slate-400" :
                      "bg-amber-400"
                    }`} />
                    {selectedBusiness.status}
                  </span>
                  <button onClick={() => setSelectedBusinessId(null)} className="p-1 rounded-full text-[#ecd3ed] hover:bg-white/10">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-6 pb-6">
                {/* Business logo banner with initial fallback */}
                <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-[#500c56] to-[#7a247f]">
                  {selectedBusiness.primaryContact.avatar ? (
                    <img
                      src={getMediaUrl(selectedBusiness.primaryContact.avatar)}
                      alt={`${selectedBusiness.name} logo`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-7xl font-black text-white/90">
                      {selectedBusiness.logoChar}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3.5">
                    <div className="w-12 h-12 bg-[#e39b4d] rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg">
                      {getLogoIcon(selectedBusiness.industry)}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-base leading-tight">
                        {selectedBusiness.name}
                      </h4>
                      <p className="text-white/80 text-[11px] mt-0.5">
                        {selectedBusiness.location === "Riyadh, KSA" ? "Riyadh, Saudi Arabia" : selectedBusiness.location}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-5 space-y-6">
                  {/* Rating Stars and Sector badges */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-extrabold text-gray-900 leading-tight">
                        {selectedBusiness.name}
                      </h5>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="bg-[#500c56]/10 text-[#500c56] text-[10px] px-3 py-1 rounded-full font-bold">
                          {selectedBusiness.industry}
                        </span>
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] px-3 py-1 rounded-full font-bold">
                          {selectedBusiness.profileComplete
                            ? "Verified"
                            : "Google verified"}
                        </span>
                        {!selectedBusiness.profileComplete ? (
                          <span className="bg-amber-100 text-amber-700 text-[10px] px-3 py-1 rounded-full font-bold">
                            Profile incomplete
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase mt-2">
                        CR: {selectedBusiness.crNumber}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center justify-end text-amber-400 gap-0.5">
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold mt-1">
                        {selectedBusiness.rating} ({selectedBusiness.reviewsCount} reviews)
                      </p>
                    </div>
                  </div>

                  {/* About Section */}
                  <div>
                    <h4 className="border-l-[3px] border-[#500c56] pl-2.5 font-bold text-gray-800 text-xs uppercase tracking-wider">
                      About
                    </h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed mt-2.5">
                      {selectedBusiness.about}
                    </p>
                  </div>

                  {/* Business Metrics Section */}
                  <div>
                    <h4 className="border-l-[3px] border-[#e39b4d] pl-2.5 font-bold text-gray-800 text-xs uppercase tracking-wider">
                      Business Metrics
                    </h4>
                    <div className="grid grid-cols-3 gap-2.5 mt-3">
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center flex flex-col justify-between">
                        <div className="w-8 h-8 rounded-full bg-purple-50 text-[#500c56] flex items-center justify-center mx-auto mb-1 shrink-0">
                          <FileText className="h-4 w-4" />
                        </div>
                        <p className="text-[8px] text-gray-400 font-bold uppercase">Total RFQs</p>
                        <p className="text-xs sm:text-sm font-extrabold text-gray-800 mt-1">
                          {selectedBusiness.totalRfqs}
                        </p>
                        <p className="text-[8px] text-gray-400 font-semibold uppercase">Submitted</p>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center flex flex-col justify-between">
                        <div className="w-8 h-8 rounded-full bg-amber-50 text-[#e39b4d] flex items-center justify-center mx-auto mb-1 shrink-0">
                          <Layers className="h-4 w-4" />
                        </div>
                        <p className="text-[8px] text-gray-400 font-bold uppercase">Total Value</p>
                        <p className="text-xs sm:text-sm font-extrabold text-gray-800 mt-1">
                          {selectedBusiness.totalValue}
                        </p>
                        <p className="text-[8px] text-gray-400 font-semibold uppercase">Transacted</p>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center flex flex-col justify-between">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-1 shrink-0">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <p className="text-[8px] text-gray-400 font-bold uppercase">Status</p>
                        <p className="text-xs sm:text-sm font-extrabold text-emerald-600 mt-1">
                          {selectedBusiness.status}
                        </p>
                        <p className="text-[8px] text-gray-400 font-semibold uppercase">Verified</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div className="space-y-3">
                    <h4 className="border-l-[3px] border-[#500c56] pl-2.5 font-bold text-gray-800 text-xs uppercase tracking-wider">
                      Contact Information
                    </h4>
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs font-semibold text-gray-700">
                        <div className="flex items-center gap-2.5">
                          <Phone className="h-4 w-4 text-[#8c9ba5]" />
                          <span className="text-gray-400 font-semibold">Phone</span>
                        </div>
                        <span className="font-bold text-gray-800">{selectedBusiness.phone}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs font-semibold text-gray-700">
                        <div className="flex items-center gap-2.5">
                          <Mail className="h-4 w-4 text-[#8c9ba5]" />
                          <span className="text-gray-400 font-semibold">Email</span>
                        </div>
                        <span className="font-bold text-gray-800">{selectedBusiness.email}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs font-semibold text-gray-700">
                        <div className="flex items-center gap-2.5">
                          <MapPin className="h-4 w-4 text-[#8c9ba5]" />
                          <span className="text-gray-400 font-semibold">Location</span>
                        </div>
                        <span className="font-bold text-gray-800">
                          {selectedBusiness.location === "Riyadh, KSA" ? "Riyadh, Saudi Arabia" : selectedBusiness.location}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs font-semibold text-gray-700">
                        <div className="flex items-center gap-2.5">
                          <Globe className="h-4 w-4 text-[#8c9ba5]" />
                          <span className="text-gray-400 font-semibold">Website</span>
                        </div>
                        <a
                          href="#"
                          onClick={(e) => e.preventDefault()}
                          className="font-bold text-[#500c56] hover:underline"
                        >
                          {selectedBusiness.website}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Primary Contact Section */}
                  <div>
                    <h4 className="border-l-[3px] border-[#e39b4d] pl-2.5 font-bold text-gray-800 text-xs uppercase tracking-wider">
                      Primary Contact
                    </h4>
                    <div className="mt-3 p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-200 bg-[#500c56] shrink-0 shadow-inner">
                          {selectedBusiness.primaryContact.avatar ? (
                            <img
                              src={getMediaUrl(selectedBusiness.primaryContact.avatar)}
                              alt={`${selectedBusiness.name} logo`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-base font-black text-white">
                              {selectedBusiness.logoChar}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-gray-800">
                            {selectedBusiness.primaryContact.name}
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium">
                            {selectedBusiness.primaryContact.email}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                            {selectedBusiness.primaryContact.phone}
                          </p>
                        </div>
                      </div>
                      <span className="bg-purple-50 text-[#500c56] text-[10px] font-bold px-2 py-0.5 rounded-md border border-purple-100 shrink-0">
                        {selectedBusiness.primaryContact.role}
                      </span>
                    </div>
                  </div>

                  {/* Date Added Row */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs font-semibold text-gray-700">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="h-4 w-4 text-[#8c9ba5]" />
                      <span className="text-gray-400 font-semibold">Date Added</span>
                    </div>
                    <span className="font-bold text-gray-800">
                      {selectedBusiness.addedDate} at {selectedBusiness.addedTime}
                    </span>
                  </div>

                  {/* Bottom Actions footer */}
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(selectedBusiness)}
                        className="bg-[#d97706] hover:bg-[#b45309] text-white rounded-xl py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 flex-1 transition-all active:scale-95 shadow-sm"
                      >
                        <Edit3 className="h-4 w-4 text-white" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleCycleStatus(selectedBusiness.id)}
                        className="bg-[#d97706] hover:bg-[#b45309] text-white rounded-xl py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 flex-1 transition-all active:scale-95 shadow-sm"
                      >
                        <RefreshCw className="h-4 w-4 text-white" />
                        <span>Change Status</span>
                      </button>

                      <button
                        onClick={() => handleDeleteBusiness(selectedBusiness.id)}
                        className="bg-[#d97706] hover:bg-[#b45309] text-white rounded-xl py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 flex-1 transition-all active:scale-95 shadow-sm"
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                        <span>Delete</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium text-center pt-1">
                      All actions are permanently logged
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400 font-medium">
              Select a partner from the directory to review their contact channels and verify their listings.
            </div>
          )}
        </div>
      </section>

      {/* Add Business Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] shadow-xl border border-gray-100 max-w-lg w-full overflow-hidden">
            <div className="bg-[#500c56] text-white px-6 py-4 flex items-center justify-between">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Plus className="h-5 w-5 text-amber-455" />
                <span>Register Partner Profile</span>
              </h4>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-full text-white/85 hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Business Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Industry Sector</label>
                  <select
                    value={formIndustry}
                    onChange={(e) => setFormIndustry(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                    required
                  >
                    <option value="Select Industry">Select Industry</option>
                    {industryOptions.map((industry) => (
                      <option key={industry.id} value={industry.name}>
                        {industry.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase">Login Password</label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase">Business Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                  required
                >
                  <option value="Select Type">Select Type</option>
                  {businessTypeOptions.map((businessType) => (
                    <option key={businessType.id} value={businessType.name}>
                      {businessType.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Corporate Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                  >
                    <option value="Active">Active</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">CR Number</label>
                  <input
                    type="text"
                    value={formCrNumber}
                    onChange={(e) => setFormCrNumber(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Phone Number</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Corporate Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Location Address</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Riyadh, KSA"
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Website URL</label>
                  <input
                    type="text"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    placeholder="e.g. www.company.com"
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase">About Company Description</label>
                <textarea
                  value={formAbout}
                  onChange={(e) => setFormAbout(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none h-20"
                />
              </div>

              {/* Primary Contact subform */}
              <div className="border-t border-gray-100 pt-3 space-y-3">
                <h5 className="text-xs font-bold text-[#500c56] uppercase tracking-wider">Primary Contact Person</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Contact Name</label>
                    <input
                      type="text"
                      value={formContactName}
                      onChange={(e) => setFormContactName(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Job Title / Role</label>
                    <input
                      type="text"
                      value={formContactRole}
                      onChange={(e) => setFormContactRole(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                      placeholder="e.g. CEO"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Contact Phone</label>
                    <input
                      type="text"
                      value={formContactPhone}
                      onChange={(e) => setFormContactPhone(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Contact Email</label>
                    <input
                      type="email"
                      value={formContactEmail}
                      onChange={(e) => setFormContactEmail(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingBusiness}
                  className="flex-1 py-2.5 bg-[#500c56] text-white rounded-xl text-xs font-bold"
                >
                  {isSavingBusiness ? "Saving..." : "Register Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Business Modal */}
      {isEditModalOpen && selectedBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] shadow-xl border border-gray-100 max-w-lg w-full overflow-hidden">
            <div className="bg-[#500c56] text-white px-6 py-4 flex items-center justify-between">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-amber-455" />
                <span>Edit Corporate Profile - {selectedBusinessId}</span>
              </h4>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-full text-white/85 hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Business Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Industry Sector</label>
                  <select
                    value={formIndustry}
                    onChange={(e) => setFormIndustry(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                    required
                  >
                    <option value="Select Industry">Select Industry</option>
                    {industryOptions.map((industry) => (
                      <option key={industry.id} value={industry.name}>
                        {industry.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase">Business Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                  required
                >
                  <option value="Select Type">Select Type</option>
                  {businessTypeOptions.map((businessType) => (
                    <option key={businessType.id} value={businessType.name}>
                      {businessType.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Corporate Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                  >
                    <option value="Active">Active</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">CR Number</label>
                  <input
                    type="text"
                    value={formCrNumber}
                    onChange={(e) => setFormCrNumber(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Phone Number</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Corporate Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Location Address</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Website URL</label>
                  <input
                    type="text"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase">About Company Description</label>
                <textarea
                  value={formAbout}
                  onChange={(e) => setFormAbout(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none h-20"
                />
              </div>

              {/* Primary Contact subform */}
              <div className="border-t border-gray-100 pt-3 space-y-3">
                <h5 className="text-xs font-bold text-[#500c56] uppercase tracking-wider">Primary Contact Person</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Contact Name</label>
                    <input
                      type="text"
                      value={formContactName}
                      onChange={(e) => setFormContactName(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Job Title / Role</label>
                    <input
                      type="text"
                      value={formContactRole}
                      onChange={(e) => setFormContactRole(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Contact Phone</label>
                    <input
                      type="text"
                      value={formContactPhone}
                      onChange={(e) => setFormContactPhone(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Contact Email</label>
                    <input
                      type="email"
                      value={formContactEmail}
                      onChange={(e) => setFormContactEmail(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2 text-sm text-gray-700"
                    />
                  </div>
                </div>
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
                  disabled={isSavingBusiness}
                  className="flex-1 py-2.5 bg-[#500c56] text-white rounded-xl text-xs font-bold"
                >
                  {isSavingBusiness ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

