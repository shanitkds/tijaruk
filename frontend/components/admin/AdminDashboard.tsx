// @ts-nocheck
"use client";

import React, { useState, useRef, useEffect } from "react";
import { getMediaUrl } from "../../lib/media";
import { useRouter, usePathname } from "next/navigation";
import {
  FileText,
  Settings,
  ChevronRight,
  ChevronLeft,
  Search,
  X,
  Clock,
  ShieldCheck,
  Wallet,
  CheckCircle2,
  Filter,
  Plus,
  Download,
  MapPin,
  Send,
  User,
  AlertTriangle,
  CircleUserRound,
  LogOut,
} from "lucide-react";
import { useLenis } from "@studio-freight/react-lenis";
import RfqManagement, { Rfq } from "./RfqManagement";
import RfqDetailedView from "./RfqDetailedView";
import ProductManagement from "./ProductManagement";
import BusinessManagement from "./BusinessManagement";
import CreateUserList from "./CreateUserList";
import ReportManagement from "./ReportManagement";
import SupplierManagement from "./SupplierManagement";
import SettingsManagement from "./SettingsManagement";
import api from "../../api/axios";
import NotificationMenu from "../notifications/NotificationMenu";
import { clearAuthSession } from "../../lib/auth";
import { adminToast } from "./AdminToast";

interface AdminDashboardProps {
  initialTab?: string;
  initialAction?: string;
  initialActionId?: string;
}

type ApiRfq = {
  id: number;
  rfq_id: string;
  created_by_email: string;
  product_name: string | null;
  product_type: "DOMESTIC" | "INTERNATIONAL" | null;
  category_name: string | null;
  product_description: string | null;
  product_image: string | null;
  supplier_id: number | null;
  supplier_name: string | null;
  supplier_full_name: string | null;
  supplier_location: string | null;
  supplier_status: "ACTIVE" | "INACTIVE" | "PENDING" | null;
  supplier_email: string | null;
  supplier_phone: string | null;
  supplier_product_type: string | null;
  supplier_description: string | null;
  supplier_website: string | null;
  supplier_logo: string | null;
  supplier_payment_terms: string | null;
  supplier_minimum_order_quantity: number | null;
  supplier_joined_at: string | null;
  supplier_rating: string | null;
  product_price: string | null;
  product_shipping_cost: string | null;
  product_stock_quantity: number | null;
  product_unit_name: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  quantity_required: number;
  unit: number;
  unit_name: string;
  target_delivery_date: string;
  preferred_country_name: string | null;
  additional_details: string;
  attachment: string | null;
  business_name: string;
  business_contact_person: string;
  business_phone: string;
  business_industry: string;
  business_location: string;
  requester_user_id?: string;
  requester_username?: string;
  requester_full_name?: string;
  requester_phone?: string;
  requester_role?: string;
  requester_role_type?: string;
  requester_is_active?: boolean;
  requester_is_verified?: boolean;
  requester_photo?: string | null;
  requester_date_joined?: string | null;
  requester_updated_at?: string | null;
  business_id?: number | null;
  business_cr_number?: string;
  business_type?: string;
  business_status?: string;
  business_description?: string;
  business_website?: string;
  business_logo?: string;
  business_email?: string;
  business_user_role?: string;
  business_language?: string;
  business_created_at?: string | null;
  business_updated_at?: string | null;
  additional_service?: number | null;
  additional_service_name?: string | null;
  additional_service_price?: string | null;
  created_at: string;
};

type ApiTopProduct = {
  id: number;
  product_name: string;
  category_name: string;
  image_url: string;
  rfq_count: number;
};

type TopProduct = {
  id: number;
  name: string;
  sector: string;
  rfqs: string;
  image: string;
};

function mapApiRfq(rfq: ApiRfq): Rfq {
  const createdAt = new Date(rfq.created_at);
  const budgetMatch = rfq.additional_details.match(/Expected budget:\s*SAR\s*([0-9.,]+)/i);
  const budgetValue = budgetMatch ? Number(budgetMatch[1].replace(/,/g, "")) : 0;
  const productPrice = Number(rfq.product_price || 0);
  const productShippingCost = Number(rfq.product_shipping_cost || 0);
  const services = rfq.additional_service_name
    ? [
        {
          name: rfq.additional_service_name,
          cost: rfq.additional_service_price
            ? `+SAR ${Number(rfq.additional_service_price).toLocaleString()}`
            : "Price not provided",
        },
      ]
    : [];

  return {
    apiId: rfq.id,
    id: rfq.rfq_id,
    productName: rfq.product_name || "Custom RFQ",
    category: rfq.category_name || "Uncategorized",
    qtyVal: rfq.quantity_required,
    unitId: rfq.unit,
    qtyUnit: rfq.unit_name,
    quantity: `${rfq.quantity_required.toLocaleString()} ${rfq.unit_name}`,
    priceVal: productPrice,
    priceUnit: `per ${rfq.unit_name}`,
    pricePerUnit: productPrice ? `SAR ${productPrice.toLocaleString()}` : "Not provided",
    shippingCost: productShippingCost ? `SAR ${productShippingCost.toLocaleString()}` : "Free shipping",
    totalValue: budgetValue ? `SAR ${budgetValue.toLocaleString()}` : "Not provided",
    productQuantity: rfq.product_stock_quantity === null
      ? "Not provided"
      : `${rfq.product_stock_quantity.toLocaleString()} ${rfq.product_unit_name || rfq.unit_name}`,
    status: rfq.status.charAt(0) + rfq.status.slice(1).toLowerCase(),
    createdAt: rfq.created_at,
    date: createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: createdAt.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
    sku: rfq.product_name ? `PRD-${String(rfq.id).padStart(5, "0")}` : "CUSTOM",
    description: rfq.product_description || "No product description provided.",
    additionalDetails:
      rfq.additional_details
        .replace(/Expected budget:\s*SAR\s*[0-9.,]+/i, "")
        .trim() || "No additional requirements provided.",
    image: rfq.product_image || "/products/hero.webp",
    services,
    supplier: {
      apiId: rfq.supplier_id || undefined,
      name: rfq.supplier_name || "Supplier not assigned",
      contactName: rfq.supplier_full_name || "Not provided",
      rating: rfq.supplier_rating || "0",
      reviews: "0",
      location: rfq.supplier_location || "Not available",
      verified: rfq.supplier_status === "ACTIVE",
      email: rfq.supplier_email || "Not provided",
      phone: rfq.supplier_phone || "Not provided",
      productType: rfq.supplier_product_type || "Not provided",
      description: rfq.supplier_description || "No supplier description provided.",
      website: rfq.supplier_website || "",
      logo: rfq.supplier_logo || "",
      paymentTerms: rfq.supplier_payment_terms || "Not provided",
      minimumOrderQuantity: rfq.supplier_minimum_order_quantity || 0,
      joinedAt: rfq.supplier_joined_at
        ? new Date(rfq.supplier_joined_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Not provided",
    },
    attachment: rfq.attachment || undefined,
    preferredCountry: rfq.preferred_country_name || undefined,
    dueDate: new Date(`${rfq.target_delivery_date}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    sourcingType: rfq.product_type === "INTERNATIONAL" ? "International Sourcing" : "Domestic Sourcing",
    budgetRange: budgetValue ? `SAR ${budgetValue.toLocaleString()}` : "Not provided",
    contactPerson: rfq.business_contact_person || "Not provided",
    contactEmail: rfq.created_by_email,
    businessName: rfq.business_name || "Not provided",
    contactPhone: rfq.business_phone || "Not provided",
    contactIndustry: rfq.business_industry || "Not provided",
    contactLocation: rfq.business_location || "Not provided",
    businessUser: {
      userId: rfq.requester_user_id || "Not provided",
      username: rfq.requester_username || "Not provided",
      fullName: rfq.requester_full_name || rfq.business_contact_person || "Not provided",
      email: rfq.created_by_email || "Not provided",
      phone: rfq.requester_phone || rfq.business_phone || "Not provided",
      role: rfq.requester_role || "Not provided",
      roleType: rfq.requester_role_type || "Not provided",
      isActive: rfq.requester_is_active,
      isVerified: rfq.requester_is_verified,
      photo: rfq.requester_photo || "",
      dateJoined: rfq.requester_date_joined
        ? new Date(rfq.requester_date_joined).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Not provided",
      updatedAt: rfq.requester_updated_at
        ? new Date(rfq.requester_updated_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Not provided",
      businessId: rfq.business_id || undefined,
      businessName: rfq.business_name || "Not provided",
      crNumber: rfq.business_cr_number || "Not provided",
      businessType: rfq.business_type || "Not provided",
      industry: rfq.business_industry || "Not provided",
      status: rfq.business_status || "Not provided",
      description: rfq.business_description || "No business description provided.",
      location: rfq.business_location || "Not provided",
      website: rfq.business_website || "",
      logo: rfq.business_logo || "",
      contactPerson: rfq.business_contact_person || "Not provided",
      businessEmail: rfq.business_email || rfq.created_by_email || "Not provided",
      businessPhone: rfq.business_phone || "Not provided",
      userRole: rfq.business_user_role || "Not provided",
      language: rfq.business_language || "Not provided",
      businessCreatedAt: rfq.business_created_at
        ? new Date(rfq.business_created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Not provided",
      businessUpdatedAt: rfq.business_updated_at
        ? new Date(rfq.business_updated_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Not provided",
    },
  } as Rfq;
}

export default function AdminDashboard({
  initialTab = "Dashboard",
  initialAction,
  initialActionId,
}: AdminDashboardProps) {
  const lenis = useLenis();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Keep activeTab in sync when the user navigates via browser back/forward
  useEffect(() => {
    const tabMap: Record<string, string> = {
      dashboard: "Dashboard",
      rfqs: "RFQs",
      products: "Products",
      users: "Users",
      reports: "Reports",
      suppliers: "Suppliers",
      messages: "Messages",
      settings: "Settings",
    };
    const segment = pathname.split("/").filter(Boolean)[1]?.toLowerCase() ?? "dashboard";
    const tab = tabMap[segment];
    if (tab && tab !== activeTab) setActiveTab(tab);
  }, [pathname]);

  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null);
  const [detailedRfqId, setDetailedRfqId] = useState<string | null>(null);
  const [isAddingBusiness, setIsAddingBusiness] = useState(initialTab === "Users" && initialAction === "add");
  const [isAddingSupplier, setIsAddingSupplier] = useState(initialTab === "Suppliers" && initialAction === "add");
  const [filterSegment, setFilterSegment] = useState<"All" | "Pending" | "Approved">("All");
  const [settingsSection, setSettingsSection] = useState<string | null>("general");

  // Dashboard RFQ detailed modal states
  const [showDashboardDetail, setShowDashboardDetail] = useState(false);
  // Lock body scroll when dashboard detailed RFQ modal is open to prevent double scrollbars
  useEffect(() => {
    if (showDashboardDetail) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      lenis?.start();
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [showDashboardDetail, lenis]);
  const [dashboardSelectedRfqId, setDashboardSelectedRfqId] = useState<string | null>(null);
  const [dashboardNoteInput, setDashboardNoteInput] = useState("");
  const [dashboardChatInput, setDashboardChatInput] = useState("");

  const triggerDashboardToast = (title: string, body: string) => {
    if (/failed|unable|error/i.test(title)) adminToast.error(title, body);
    else adminToast.success(title, body);
  };

  // Dashboard RFQ notes record
  const [dashboardRfqNotes, setDashboardRfqNotes] = useState<Record<string, { id: number; text: string; author: string; time: string }[]>>({});

  // Dashboard RFQ chats record
  const [dashboardRfqChats, setDashboardRfqChats] = useState<Record<string, { id: number; text: string; sender: string; time: string; type: "incoming" | "outgoing" }[]>>({});

  // RFQ search
  const [rfqSearch, setRfqSearch] = useState("");

  // Live date label for the dashboard header
  const [todayLabel] = useState(() =>
    new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })
  );

  // Hoisted Account states
  const [adminName, setAdminName] = useState("Admin");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminUserId, setAdminUserId] = useState<number | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const adminInitial = adminName.trim().charAt(0).toUpperCase() || "A";

  useEffect(() => {
    function closeProfileMenu(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeProfileMenu);
    return () => document.removeEventListener("mousedown", closeProfileMenu);
  }, []);

  async function handleAdminLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await api.post("/accounts/logout/");
    } finally {
      clearAuthSession();
      router.replace("/login");
    }
  }

  const openAdminProfile = () => {
    setProfileMenuOpen(false);
    setActiveTab("Settings");
    setSettingsSection("account");
    router.push("/admin/settings");
  };

  const renderAdminProfileMenu = (avatarClassName: string, showIdentity = false) => (
    <div className="relative shrink-0" ref={profileMenuRef}>
      <button
        aria-expanded={profileMenuOpen}
        aria-label={`${adminName} profile menu`}
        className={
          showIdentity
            ? "flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer group"
            : avatarClassName
        }
        onClick={() => setProfileMenuOpen((open) => !open)}
        type="button"
      >
        {showIdentity ? (
          <>
            <div className={avatarClassName}>
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={adminName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-[#f3e8f4] text-sm font-bold text-[#500c56]">
                  {adminInitial}
                </span>
              )}
            </div>
            <div className="flex flex-col text-left leading-tight hidden sm:flex">
              <span className="text-sm font-extrabold text-gray-800 group-hover:text-[#500c56] transition-colors">{adminName}</span>
              <span className="text-xs text-gray-400 font-semibold">Super Admin</span>
            </div>
          </>
        ) : (
          profilePhoto ? (
            <img
              src={profilePhoto}
              alt={adminName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-[#f3e8f4] text-sm font-bold text-[#500c56]">
              {adminInitial}
            </span>
          )
        )}
      </button>

      {profileMenuOpen ? (
        <div className="absolute right-0 top-full z-[110] mt-3 w-[290px] overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_18px_50px_rgba(31,17,35,0.18)]">
          <div className="flex items-center gap-3 px-5 py-5">
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f3e8f4]">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={adminName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-[#500c56]">{adminInitial}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-[#111827]">
                {adminName}
              </p>
              <p className="truncate text-sm text-[#9ca3af]">
                {adminEmail}
              </p>
            </div>
          </div>

          <div className="border-t border-[#eef0f3] py-2">
            <button
              className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm font-medium text-[#475569] transition hover:bg-[#faf8fa]"
              onClick={openAdminProfile}
              type="button"
            >
              <CircleUserRound className="size-4.5 text-[#64748b]" />
              Go to Profile
            </button>
            <button
              className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              disabled={isLoggingOut}
              onClick={handleAdminLogout}
              type="button"
            >
              <LogOut className="size-4.5" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );

  useEffect(() => {
    let isMounted = true;

    async function loadAdminProfile() {
      try {
        const { data } = await api.get("/accounts/me/");
        if (!isMounted) return;

        setAdminName(data.name || data.email || "Admin");
        setAdminEmail(data.email || "");
        setProfilePhoto(data.photo_url || "");
        setAdminUserId(data.id ?? null);
      } catch (error) {
        console.error("Unable to load admin profile.", error);
      }
    }

    loadAdminProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // Supplier Management states for header filters and modals
  const [supplierSearch, setSupplierSearch] = useState("");
  const [supplierLocation, setSupplierLocation] = useState("");
  const [supplierType, setSupplierType] = useState("");
  const [supplierStatus, setSupplierStatus] = useState("");
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);

  // Main state for RFQs
  const [rfqList, setRfqList] = useState<Rfq[]>([]);
  const [isLoadingRfqs, setIsLoadingRfqs] = useState(true);
  const [rfqLoadError, setRfqLoadError] = useState("");
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    let isMounted = true;

    api.get<ApiRfq[]>("/rfqs/")
      .then(({ data }) => {
        if (isMounted) setRfqList(data.map(mapApiRfq));
      })
      .catch(() => {
        if (isMounted) setRfqLoadError("Unable to load RFQs. Please refresh the page.");
      })
      .finally(() => {
        if (isMounted) setIsLoadingRfqs(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (activeTab !== "Dashboard") return;

    let isMounted = true;
    api.get<ApiTopProduct[]>("/products/top-by-rfq-volume/")
      .then(({ data }) => {
        if (!isMounted) return;
        setTopProducts(data.map((product) => ({
          id: product.id,
          name: product.product_name,
          sector: product.category_name,
          rfqs: `${product.rfq_count} RFQ${product.rfq_count === 1 ? "" : "s"}`,
          image: product.image_url || "/products/hero.webp",
        })));
      })
      .catch(() => {
        if (isMounted) setTopProducts([]);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  type AdminApiConversation = {
    id: number;
    title: string;
    business_name: string;
    business_user_photo: string;
    status: string;
    last_message_at: string | null;
    last_message_preview: string | null;
  };

  type AdminApiMessage = {
    id: number;
    sender: number;
    content: string;
    created_at: string;
  };

  type AdminConversation = {
    id: number;
    company: string;
    businessName: string;
    avatarInitial: string;
    avatarUrl: string;
    preview: string;
    time: string;
    unread: number;
    online: boolean;
  };

  type AdminChatMessage = {
    id: number;
    sender: string;
    time: string;
    dateStr: string;
    text: string;
    attachment?: { name: string; size: string };
  };

  function formatAdminTime(iso: string | null): string {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function firstInitial(title: string): string {
    return title.trim().charAt(0).toUpperCase() || "U";
  }

  const [adminConversations, setAdminConversations] = useState<AdminConversation[]>([]);
  const [activeAdminConversationId, setActiveAdminConversationId] = useState<number | null>(null);
  const [adminMobileChatOpen, setAdminMobileChatOpen] = useState(false);
  const [adminMessageText, setAdminMessageText] = useState("");
  const [adminChatMessages, setAdminChatMessages] = useState<AdminChatMessage[]>([]);
  const activeAdminConversation = adminConversations.find((c) => c.id === activeAdminConversationId) ?? adminConversations[0];
  const adminMsgScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll + non-passive wheel listener; re-runs when messages change so the
  // listener is attached after the div mounts (it only exists on the Messages tab).
  useEffect(() => {
    const el = adminMsgScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    const onWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atTop = scrollTop === 0 && e.deltaY < 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight && e.deltaY > 0;
      if (!atTop && !atBottom) e.preventDefault();
      el.scrollTop += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [adminChatMessages]);


  useEffect(() => {
    let mounted = true;
    api.get<AdminApiConversation[]>("/messages/conversations/")
      .then(({ data }) => {
        if (!mounted) return;
        const mapped: AdminConversation[] = [...data]
          .sort((a, b) => {
            const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
            const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
            return tb - ta;
          })
          .map((c) => ({
          id: c.id,
          company: c.title || `Conversation #${c.id}`,
          businessName: c.business_name || "",
          avatarInitial: firstInitial(c.title || c.business_name || `C${c.id}`),
          avatarUrl: c.business_user_photo || "",
          preview: c.last_message_preview || "",
          time: formatAdminTime(c.last_message_at),
          unread: (c as any).unread_count || 0,
          unreadCount: (c as any).unread_count || 0,
          online: false,
        }));
        setAdminConversations(mapped);
        if (mapped.length > 0) setActiveAdminConversationId(mapped[0].id);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!activeAdminConversationId) return;
    let mounted = true;
    api.get<AdminApiMessage[]>(`/messages/conversations/${activeAdminConversationId}/messages/`)
      .then(({ data }) => {
        if (!mounted) return;
        setAdminChatMessages(
          data.map((m) => ({
            id: m.id,
            sender: adminUserId !== null && m.sender === adminUserId ? "admin" : "contact",
            time: formatAdminTime(m.created_at),
            dateStr: m.created_at ? new Date(m.created_at).toDateString() : new Date().toDateString(),
            text: m.content,
          }))
        );
      })
      .catch(() => { if (mounted) setAdminChatMessages([]); });
    return () => { mounted = false; };
  }, [activeAdminConversationId, adminUserId]);

  const sendAdminMessage = async () => {
    const text = adminMessageText.trim();
    if (!text || !activeAdminConversationId) return;

    setAdminMessageText("");
    const optimisticId = Date.now();
    setAdminChatMessages((current) => [
      ...current,
      { id: optimisticId, sender: "admin", time: "Now", dateStr: new Date().toDateString(), text },
    ]);

    try {
      const { data } = await api.post(`/messages/conversations/${activeAdminConversationId}/messages/`, { content: text });
      setAdminChatMessages((current) =>
        current.map((m) =>
          m.id === optimisticId
            ? { id: data.id, sender: "admin", time: new Date(data.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), text: data.content }
            : m
        )
      );
    } catch {
      setAdminChatMessages((current) => current.filter((m) => m.id !== optimisticId));
    }
  };

  // Carousel scroll handler
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const monthGrowth = (
    matches: (rfq: Rfq) => boolean,
    valueOf: (rfq: Rfq) => number = () => 1,
  ) => {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const totalForRange = (start: Date, end?: Date) => rfqList.reduce((total, rfq) => {
      const createdAt = new Date(rfq.createdAt || rfq.date);
      const inRange = createdAt >= start && (!end || createdAt < end);
      return inRange && matches(rfq) ? total + valueOf(rfq) : total;
    }, 0);
    const current = totalForRange(currentMonth);
    const previous = totalForRange(previousMonth, currentMonth);
    const percentage = previous === 0
      ? (current > 0 ? 100 : 0)
      : Math.round(((current - previous) / previous) * 100);

    return `${percentage >= 0 ? "↑" : "↓"} ${Math.abs(percentage)}%`;
  };

  const approvedRevenue = (rfq: Rfq) =>
    rfq.status === "Approved" ? Number(rfq.priceVal || 0) * Number(rfq.qtyVal || 0) : 0;
  const totalRevenue = rfqList.reduce((total, rfq) => total + approvedRevenue(rfq), 0);
  const pendingCount = rfqList.filter((rfq) => rfq.status === "Pending").length;
  const approvedCount = rfqList.filter((rfq) => rfq.status === "Approved").length;
  const rejectedCount = rfqList.filter((rfq) => rfq.status === "Rejected").length;

  const statsOverview = [
    {
      title: "Total RFQs",
      value: rfqList.length.toLocaleString(),
      growth: monthGrowth(() => true),
      icon: FileText
    },
    {
      title: "Pending RFQs",
      value: pendingCount.toLocaleString(),
      growth: monthGrowth((rfq) => rfq.status === "Pending"),
      icon: Clock
    },
    {
      title: "Approved RFQs",
      value: approvedCount.toLocaleString(),
      growth: monthGrowth((rfq) => rfq.status === "Approved"),
      icon: ShieldCheck
    },
    {
      title: "Total Revenue",
      value: `SAR ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      growth: monthGrowth((rfq) => rfq.status === "Approved", approvedRevenue),
      icon: Wallet
    }
  ];

  const recentRFQs = rfqList.slice(0, 5).map((rfq) => ({
    id: rfq.id,
    product: rfq.productName,
    quantity: rfq.quantity,
    status: rfq.status,
    date: rfq.date,
  }));

  const totalStatusCount = rfqList.length;
  const statusPercent = (count: number) => totalStatusCount
    ? Math.round((count / totalStatusCount) * 100)
    : 0;
  const pendingPercent = statusPercent(pendingCount);
  const approvedPercent = statusPercent(approvedCount);
  const rejectedPercent = statusPercent(rejectedCount);
  const donutCircumference = 219.9;
  const pendingArc = totalStatusCount ? (pendingCount / totalStatusCount) * donutCircumference : 0;
  const approvedArc = totalStatusCount ? (approvedCount / totalStatusCount) * donutCircumference : 0;
  const rejectedArc = totalStatusCount ? (rejectedCount / totalStatusCount) * donutCircumference : 0;

  const filteredRfqList = rfqSearch.trim()
    ? rfqList.filter(
        (r) =>
          r.id.toLowerCase().includes(rfqSearch.toLowerCase()) ||
          r.productName.toLowerCase().includes(rfqSearch.toLowerCase()) ||
          r.category?.toLowerCase().includes(rfqSearch.toLowerCase())
      )
    : rfqList;

  const loadDetailedRfq = async (id: string) => {
    const selected = rfqList.find((rfq) => rfq.id === id);
    if (!selected) return;

    try {
      const { data } = await api.get<ApiRfq>(`/rfqs/${selected.apiId}/`);
      const mappedRfq = mapApiRfq(data);
      setRfqList((current) =>
        current.map((rfq) => (rfq.apiId === mappedRfq.apiId ? mappedRfq : rfq))
      );
      setDetailedRfqId(mappedRfq.id);
    } catch {
      alert("Unable to load RFQ details. Please try again.");
    }
  };

  const handleViewDetailedRfq = (id: string) => {
    const selected = rfqList.find((rfq) => rfq.id === id);
    if (!selected) return;
    router.push(`/admin/rfqs/${selected.apiId}`);
  };

  useEffect(() => {
    if (initialAction !== "view" || !initialActionId || detailedRfqId || rfqList.length === 0) return;

    const selected = rfqList.find(
      (rfq) => String(rfq.apiId) === String(initialActionId) || rfq.id === initialActionId,
    );
    if (selected) void loadDetailedRfq(selected.id);
  }, [initialAction, initialActionId, detailedRfqId, rfqList]);

  const dashboardSelectedRfq = rfqList.find((r) => r.id === dashboardSelectedRfqId) || null;

  return (
    <div className={`min-h-screen bg-[#f8f7fa] text-[#1e1e24] font-sans antialiased overflow-x-hidden ${showDashboardDetail ? 'overflow-y-hidden' : ''}`}>
      {/* Main Content Pane */}
      <div className="flex min-h-screen min-w-0 max-w-full flex-1 flex-col overflow-x-hidden">
        {/* Header Bar — tab-specific left title + single persistent bell+avatar on the right */}
        <header className="min-h-[80px] h-auto py-4 bg-white border-b border-[#eef0f3] flex flex-wrap items-center justify-between px-4 sm:px-8 flex-shrink-0 gap-y-4 gap-x-2">
          {/* ── Left: tab-specific title & search controls ── */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {activeTab === "RFQs" ? (
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">RFQ Management</h1>
                <p className="text-[11px] sm:text-xs text-gray-400 font-semibold mt-0.5 hidden sm:block">
                  Review, approve, and manage all incoming requests for quote
                </p>
              </div>
            ) : activeTab === "Products" || activeTab === "Users" ? (
              <>
                {activeTab === "Users" && isAddingBusiness ? (
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-[#8c9ba5] font-bold mb-0.5">
                      <span className="cursor-pointer hover:text-[#500c56] hover:underline" onClick={() => setIsAddingBusiness(false)}>Users</span>
                      <span className="text-gray-300">/</span>
                      <span className="cursor-pointer hover:text-[#500c56] hover:underline" onClick={() => { setIsAddingBusiness(false); router.push('/admin/users'); }}>Users</span>
                      <span className="text-gray-350">/</span>
                      <span className="text-gray-900 font-extrabold">Add New Business</span>
                    </div>
                    <h1 className="text-xl sm:text-[22px] font-black text-[#500c56] leading-tight tracking-tight">Add New Business</h1>
                  </div>
                ) : (
                  <div className="flex flex-col text-left">
                    <h1 className="text-xl sm:text-[22px] font-bold text-[#1e1e24] leading-tight tracking-tight">
                      {activeTab === "Products" ? "Product Management" : "Users Management"}
                    </h1>
                    <p className="text-xs sm:text-[13px] text-[#8c9ba5] font-normal mt-1 hidden sm:block max-w-[335px] leading-relaxed">
                      {activeTab === "Products"
                        ? "Manage, update and track all products in the TIJARUK catalog"
                        : "Monitor, verify and manage all registered users on TIJARUK"}
                    </p>
                  </div>
                )}
              </>
            ) : activeTab === "Reports" ? (
              <div className="flex flex-col text-left">
                <h1 className="text-xl sm:text-[22px] font-bold text-[#1e1e24] leading-tight tracking-tight font-sans">Report Management</h1>
                <p className="text-xs sm:text-[13px] text-[#8c9ba5] font-normal mt-1 hidden sm:block max-w-[340px] leading-relaxed">
                  Generate, track and analyze all business reports on TIJARUK
                </p>
              </div>
            ) : activeTab === "Suppliers" ? (
              isAddingSupplier ? (
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-[#8c9ba5] font-bold mb-0.5">
                    <span className="cursor-pointer hover:text-[#500c56] hover:underline" onClick={() => setIsAddingSupplier(false)}>Suppliers</span>
                    <span className="text-gray-300">/</span>
                    <span className="text-gray-900 font-extrabold">Add Supplier</span>
                  </div>
                  <h1 className="text-xl sm:text-[22px] font-black text-[#500c56] leading-tight tracking-tight">Add Supplier</h1>
                </div>
              ) : (
                <div className="flex flex-col text-left">
                  <h1 className="text-xl sm:text-[22px] font-bold text-[#1e1e24] leading-tight tracking-tight">Supplier Management</h1>
                  <p className="text-xs sm:text-[13px] text-[#8c9ba5] font-normal mt-1 hidden sm:block max-w-[340px] leading-relaxed">
                    Monitor, verify and manage all registered suppliers on TIJARUK
                  </p>
                </div>
              )
            ) : activeTab === "Messages" ? (
              <div className="flex flex-col text-left">
                <h1 className="text-xl sm:text-[22px] font-bold text-[#1e1e24] leading-tight tracking-tight">Messages</h1>
                <p className="text-xs sm:text-[13px] text-[#8c9ba5] font-normal mt-1 hidden sm:block max-w-[340px] leading-relaxed">
                  Review RFQ conversations with buyers and suppliers
                </p>
              </div>
            ) : activeTab === "Settings" ? (
              <div className="flex flex-col text-left">
                {settingsSection ? (
                  <>
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-400 font-semibold mb-0.5">
                      <span>Platform Settings</span>
                      <ChevronRight className="h-3 w-3 text-gray-400" />
                      <span className="text-[#500c56] font-bold">
                        {settingsSection === "general" && "General Settings"}
                        {settingsSection === "account" && "Account Settings"}
                        {settingsSection === "notifications" && "Notification Settings"}
                        {settingsSection === "security" && "Security Settings"}
                        {settingsSection === "language" && "Language Settings"}
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-[22px] font-bold text-[#1e1e24] leading-tight tracking-tight">
                      {settingsSection === "general" && "General Settings"}
                      {settingsSection === "account" && "Account Settings"}
                      {settingsSection === "notifications" && "Notification Settings"}
                      {settingsSection === "security" && "Security Settings"}
                      {settingsSection === "language" && "Language Settings"}
                    </h1>
                  </>
                ) : (
                  <>
                    <h1 className="text-xl sm:text-[22px] font-bold text-[#1e1e24] leading-tight tracking-tight">Platform Settings</h1>
                    <p className="text-xs sm:text-[13px] text-[#8c9ba5] font-normal mt-1 hidden sm:block max-w-[340px] leading-relaxed">
                      Manage your platform configurations and preferences
                    </p>
                  </>
                )}
              </div>
            ) : (
              /* Dashboard (default) — search bar on the left */
              <div className="relative w-full max-w-md hidden sm:block">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Search className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  placeholder="Search RFQs, products, or businesses..."
                  className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-full py-2.5 pl-11 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/45 focus:ring-1 focus:ring-[#500c56]/45 transition-all shadow-inner"
                />
              </div>
            )}
          </div>

          {/* ── Right: tab-specific actions + persistent bell & avatar ── */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Tab-specific controls */}
            {activeTab === "RFQs" && (
              <>
                <div className="relative w-full max-w-[150px] sm:max-w-xs hidden md:block">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search RFQs..."
                    value={rfqSearch}
                    onChange={(e) => setRfqSearch(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all"
                  />
                </div>
                <button className="bg-[#500c56] hover:bg-[#6c1674] text-white text-xs px-3 sm:px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-sm">
                  <Filter className="h-3.5 w-3.5" />
                  <span>Filter</span>
                </button>
              </>
            )}
            {(activeTab === "Products" || activeTab === "Users") && activeTab === "Users" && isAddingBusiness && (
              <div className="relative w-full max-w-[150px] sm:max-w-xs hidden md:block">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all shadow-sm"
                />
              </div>
            )}
            {activeTab === "Reports" && (
              <>
                <div className="relative w-full max-w-[220px] hidden md:block">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search reports..."
                    className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all shadow-sm"
                  />
                </div>
                <button className="bg-gradient-to-r from-[#df8a3c] to-[#e39b4d] text-white text-xs sm:text-sm px-3 sm:px-5 py-2.5 rounded-[14px] font-bold flex items-center gap-1.5 transition-all shadow-[0_4px_14px_rgba(223,138,60,0.25)] hover:from-[#c27c38] hover:to-[#c57e33] active:scale-95 shrink-0">
                  <Plus className="h-4 w-4 text-white" />
                  <span className="hidden sm:block">Generate New Report</span>
                </button>
              </>
            )}
            {activeTab === "Suppliers" && !isAddingSupplier && (
              <>
                <div className="flex items-center flex-wrap gap-2 sm:gap-3 hidden 2xl:flex">
                  <div className="relative hidden xl:block">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Search className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search suppliers..."
                      value={supplierSearch}
                      onChange={(e) => setSupplierSearch(e.target.value)}
                      className="w-full max-w-[150px] sm:max-w-xs bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2 pl-9 pr-3 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all shadow-sm"
                    />
                  </div>
                  <div className="relative hidden md:block">
                    <select value={supplierLocation} onChange={(e) => setSupplierLocation(e.target.value)} className="appearance-none bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2 px-3 pr-8 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all shadow-sm cursor-pointer">
                      <option value="">Location</option>
                      <option value="Riyadh">Riyadh, KSA</option>
                      <option value="Jeddah">Jeddah, KSA</option>
                      <option value="Dammam">Dammam, KSA</option>
                      <option value="Jubail">Jubail, KSA</option>
                      <option value="Dubai">Dubai, UAE</option>
                      <option value="Cairo">Cairo, Egypt</option>
                      <option value="Istanbul">Istanbul, Turkey</option>
                      <option value="Kuwait">Kuwait City, KW</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"><ChevronRight className="h-3 w-3 transform rotate-90" /></div>
                  </div>
                  <div className="relative hidden md:block">
                    <select value={supplierType} onChange={(e) => setSupplierType(e.target.value)} className="appearance-none bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2 px-3 pr-8 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all shadow-sm cursor-pointer">
                      <option value="">Product Type</option>
                      <option value="Machinery">Machinery</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Chemicals">Chemicals</option>
                      <option value="Food & Bev">Food & Bev</option>
                      <option value="Construction">Construction</option>
                      <option value="Textiles">Textiles</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Logistics">Logistics</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"><ChevronRight className="h-3 w-3 transform rotate-90" /></div>
                  </div>
                  <div className="relative hidden sm:block">
                    <select value={supplierStatus} onChange={(e) => setSupplierStatus(e.target.value)} className="appearance-none bg-[#f8f9fa] border border-[#eef0f3] rounded-xl py-2 px-3 pr-8 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#500c56]/40 focus:ring-1 focus:ring-[#500c56]/40 transition-all shadow-sm cursor-pointer">
                      <option value="">Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Pending Approval">Pending Approval</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"><ChevronRight className="h-3 w-3 transform rotate-90" /></div>
                  </div>
                </div>
                <button
                  onClick={() => { setIsAddingSupplier(true); router.push('/admin/suppliers/add'); }}
                  className="bg-gradient-to-r from-[#df8a3c] to-[#e39b4d] text-white text-xs sm:text-sm px-3 sm:px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-[0_4px_14px_rgba(223,138,60,0.25)] hover:from-[#c27c38] hover:to-[#c57e33] active:scale-95 shrink-0"
                >
                  <Plus className="h-4 w-4 text-white" />
                  <span className="hidden sm:block">Add New Supplier</span>
                </button>
              </>
            )}
            {activeTab === "Dashboard" && (
              <span className="text-sm font-semibold text-gray-500 hidden md:block">{todayLabel}</span>
            )}

            {/* Single persistent NotificationMenu — stays mounted across ALL tab switches */}
            <NotificationMenu
              buttonClassName="relative w-11 h-11 flex items-center justify-center bg-[#f8f9fa] border border-[#eef0f3] rounded-[14px] text-[#8c9ba5] hover:text-gray-600 hover:bg-gray-100/50 transition-colors shadow-sm shrink-0"
              iconClassName="h-5 w-5"
            />

            {/* Single persistent profile avatar */}
            {renderAdminProfileMenu("h-11 w-11 rounded-full overflow-hidden border-2 border-[#e39b4d] shrink-0 cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95")}
          </div>
        </header>

        {/* Dashboard Work Area */}
        <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {activeTab === "Dashboard" ? (
            <>
              {/* Stats Cards Section */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsOverview.map((stat, idx) => {
                  const StatIcon = stat.icon;
                  return (
                    <div
                      key={idx}
                      className="relative overflow-hidden rounded-[24px] bg-[#500c56] text-white p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[160px] group"
                    >
                      {/* Top Row */}
                      <div className="flex justify-between items-start">
                        <span className="text-[13px] text-[#ecd3ed]/80 font-bold uppercase tracking-wider">
                          {stat.title}
                        </span>
                        <div className="p-2.5 rounded-2xl bg-white/10 flex items-center justify-center">
                          <StatIcon className="h-5 w-5 text-[#e39b4d]" />
                        </div>
                      </div>

                      {/* Bottom Row */}
                      <div className="flex justify-between items-end mt-4">
                        <h3 className="text-3xl font-extrabold tracking-tight leading-none text-white">
                          {stat.value}
                        </h3>
                        <span className="bg-white/10 text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-0.5 font-bold">
                          <span>{stat.growth}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* Middle Content Grid */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent RFQs Table */}
                <div className="lg:col-span-2 bg-white rounded-[24px] shadow-sm border border-[#eef0f3] p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900">Recent RFQs</h3>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveTab("RFQs");
                          router.push("/admin/rfqs");
                        }}
                        className="text-sm font-bold text-[#500c56] hover:text-[#6a1570] hover:underline transition-colors"
                      >
                        View All
                      </a>
                    </div>

                    <div className="overflow-x-auto -mx-6">
                      <div className="inline-block min-w-full align-middle px-6">
                        <table className="min-w-full divide-y divide-gray-100">
                          <thead>
                            <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                              <th className="pb-3.5 font-bold">RFQ ID</th>
                              <th className="pb-3.5 font-bold">Product</th>
                              <th className="pb-3.5 font-bold">Quantity</th>
                              <th className="pb-3.5 font-bold">Status</th>
                              <th className="pb-3.5 font-bold">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                            {recentRFQs.map((rfq) => (
                              <tr key={rfq.id} className="hover:bg-gray-50/50 transition-colors">
                                <td
                                  onClick={() => {
                                    setDashboardSelectedRfqId(rfq.id);
                                    setShowDashboardDetail(true);
                                  }}
                                  className="py-4 font-bold text-[#500c56] hover:underline cursor-pointer"
                                >
                                  {rfq.id}
                                </td>
                                <td className="py-4 text-gray-500 font-medium">{rfq.product}</td>
                                <td className="py-4 font-bold text-gray-700">{rfq.quantity}</td>
                                <td className="py-4">
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${rfq.status === "Approved"
                                      ? "bg-blue-50 text-blue-700"
                                      : rfq.status === "Rejected"
                                        ? "bg-red-50 text-red-700"
                                        : "bg-amber-50 text-amber-700"
                                      }`}
                                  >
                                    {rfq.status}
                                  </span>
                                </td>
                                <td className="py-4 text-gray-400 font-medium">{rfq.date}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RFQ Status Overview Donut Chart */}
                <div className="bg-white rounded-[24px] shadow-sm border border-[#eef0f3] p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">RFQ Status Overview</h3>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">Distribution of current RFQs</p>
                  </div>

                  <div className="my-6 relative flex items-center justify-center h-48">
                    <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        className="stroke-gray-100"
                        strokeWidth="12"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        className="stroke-[#e39b4d]"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={`${pendingArc} ${donutCircumference}`}
                        strokeDashoffset="0"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        className="stroke-[#2b87e3]"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={`${approvedArc} ${donutCircumference}`}
                        strokeDashoffset={-pendingArc}
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        className="stroke-[#ef4444]"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={`${rejectedArc} ${donutCircumference}`}
                        strokeDashoffset={-(pendingArc + approvedArc)}
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-extrabold text-gray-800">{approvedPercent}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-100 pt-4">
                    <div>
                      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 font-bold">
                        <span className="h-2 w-2 rounded-full bg-[#e39b4d]" />
                        <span>Pending</span>
                      </div>
                      <p className="text-sm font-extrabold text-gray-800 mt-1">{pendingPercent}%</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 font-bold">
                        <span className="h-2 w-2 rounded-full bg-[#2b87e3]" />
                        <span>Approved</span>
                      </div>
                      <p className="text-sm font-extrabold text-gray-800 mt-1">{approvedPercent}%</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 font-bold">
                        <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
                        <span>Rejected</span>
                      </div>
                      <p className="text-sm font-extrabold text-gray-800 mt-1">{rejectedPercent}%</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Bottom Section: Carousel */}
              <section className="bg-white rounded-[24px] shadow-sm border border-[#eef0f3] p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Top Products by RFQ Volume</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => scroll("left")}
                      className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => scroll("right")}
                      className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div
                  ref={scrollContainerRef}
                  className="flex gap-6 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {topProducts.map((product) => (
                    <div
                      key={product.id}
                      className="min-w-[260px] w-[260px] sm:min-w-[280px] sm:w-[280px] flex-shrink-0 bg-[#fbfbfb] rounded-[20px] overflow-hidden border border-[#f0f1f4] snap-start group shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                        <img
                          src={getMediaUrl(product.image)}
                          alt={product.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-3 right-3 bg-[#500c56] text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md">
                          {product.rfqs}
                        </span>
                      </div>

                      <div className="p-5 space-y-1 bg-white">
                        <h4 className="font-bold text-gray-800 group-hover:text-[#500c56] transition-colors line-clamp-1">
                          {product.name}
                        </h4>
                        <p className="text-xs text-gray-400 font-bold uppercase">{product.sector}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : activeTab === "RFQs" ? (
            detailedRfqId ? (
              <RfqDetailedView
                rfqId={detailedRfqId}
                rfqList={rfqList}
                setRfqList={setRfqList}
                onBack={() => {
                  if (initialAction === "view") {
                    router.push("/admin/rfqs");
                  } else {
                    setDetailedRfqId(null);
                  }
                }}
              />
            ) : (
              <RfqManagement
                rfqList={filteredRfqList}
                setRfqList={setRfqList}
                isLoading={isLoadingRfqs}
                loadError={rfqLoadError}
                selectedRfqId={selectedRfqId}
                setSelectedRfqId={setSelectedRfqId}
                filterSegment={filterSegment}
                setFilterSegment={setFilterSegment}
                onViewDetailed={handleViewDetailedRfq}
              />
            )
          ) : activeTab === "Products" ? (
            <ProductManagement initialAction={initialAction} initialActionId={initialActionId} />
          ) : activeTab === "Users" ? (
            initialAction === "add" || initialAction === "edit" ? (
              <BusinessManagement
                isAddingBusiness={isAddingBusiness}
                setIsAddingBusiness={setIsAddingBusiness}
                initialAction={initialAction}
                initialActionId={initialActionId}
              />
            ) : (
              <CreateUserList />
            )
          ) : activeTab === "Reports" ? (
            <ReportManagement />
          ) : activeTab === "Messages" ? (
            <section className="grid h-[calc(100dvh-144px)] min-h-[560px] min-w-0 max-w-full overflow-hidden rounded-[24px] border border-[#eef0f3] bg-white shadow-sm sm:grid-cols-[280px_minmax(0,1fr)] lg:grid-cols-[330px_minmax(0,1fr)]">
              <aside className={`min-h-0 border-r border-[#e5e7eb] bg-white ${adminMobileChatOpen ? "hidden sm:flex" : "flex"} flex-col`}>
                <div className="border-b border-[#f1f3f5] p-4">
                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9ca3af]" />
                    <input
                      className="h-10 w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] pl-9 pr-3 text-sm outline-none placeholder:text-[#9ca3af] focus:border-[#500c56]"
                      placeholder="Search conversations..."
                      type="search"
                    />
                  </label>
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {["All", "Unread", "Buyers", "Suppliers"].map((item, index) => (
                      <button
                        className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold ${index === 0 ? "bg-[#500c56] text-white" : "bg-[#f3f4f6] text-[#6b7280]"}`}
                        key={item}
                        type="button"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                  {adminConversations.map((conversation) => {
                    const active = conversation.id === activeAdminConversationId;

                    return (
                      <button
                        className={`flex w-full min-w-0 gap-3 border-b border-[#f1f3f5] p-4 text-left transition ${active ? "bg-[#fbf7fc]" : "hover:bg-[#f9fafb]"}`}
                        key={conversation.id}
                        onClick={() => {
                          setActiveAdminConversationId(conversation.id);
                          setAdminMobileChatOpen(true);
                          setAdminConversations((prev) =>
                            prev.map((c) =>
                              c.id === conversation.id ? { ...c, unread: 0 } : c
                            )
                          );
                          window.dispatchEvent(new CustomEvent("admin-conversation-read", { detail: { id: conversation.id } }));
                        }}
                        type="button"
                      >
                        <span
                          className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                            conversation.avatarUrl ? "bg-white bg-cover bg-center" : "bg-[#500c56]"
                          }`}
                          style={conversation.avatarUrl ? { backgroundImage: `url(${conversation.avatarUrl})` } : undefined}
                        >
                          {conversation.avatarUrl ? null : conversation.avatarInitial}
                          {conversation.online ? (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#4ade80]" />
                          ) : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span className="block min-w-0 flex-1 truncate text-sm font-bold text-[#111827]">
                              {conversation.company}
                            </span>
                            <span className="shrink-0 text-[10px] text-[#9ca3af]">{conversation.time}</span>
                          </span>
                          <span className={`block truncate text-xs ${active ? "text-[#500c56]" : "text-[#9ca3af]"}`}>
                            {conversation.businessName || "Business User"}
                          </span>
                          <span className="mt-1 block truncate text-xs text-[#9ca3af]">{conversation.preview}</span>
                        </span>
                        {conversation.unread ? (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#500c56] text-[10px] font-bold text-white">
                            {conversation.unread}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </aside>

              <div className={`min-h-0 min-w-0 flex-col overflow-hidden bg-[#f9fafb] ${adminMobileChatOpen ? "flex" : "hidden sm:flex"}`}>
                {activeAdminConversation ? (
                  <>
                    <div className="flex shrink-0 items-center justify-between border-b border-[#e5e7eb] bg-white px-4 py-3 sm:px-6">
                      <div className="flex min-w-0 items-center gap-3">
                        <button
                          aria-label="Back to conversations"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#500c56] sm:hidden"
                          onClick={() => setAdminMobileChatOpen(false)}
                          type="button"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div
                          className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                            activeAdminConversation.avatarUrl ? "bg-white bg-cover bg-center" : "bg-[#500c56]"
                          }`}
                          style={
                            activeAdminConversation.avatarUrl
                              ? { backgroundImage: `url(${activeAdminConversation.avatarUrl})` }
                              : undefined
                          }
                        >
                          {activeAdminConversation.avatarUrl ? null : activeAdminConversation.avatarInitial}
                          {activeAdminConversation.online ? (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#4ade80]" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <h2 className="truncate text-sm font-bold text-[#111827]">{activeAdminConversation.company}</h2>
                          <p className="truncate text-xs text-[#9ca3af]">
                            <span className={activeAdminConversation.online ? "text-[#10b981]" : "text-[#9ca3af]"}>
                              {activeAdminConversation.online ? "Online" : "Offline"}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div ref={adminMsgScrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-8">
                      {(() => {
                        const now = new Date();
                        const todayStr = now.toDateString();
                        const yesterdayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toDateString();
                        const getDateLabel = (dateStr: string) => {
                          if (dateStr === todayStr) return "Today";
                          if (dateStr === yesterdayStr) return "Yesterday";
                          return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                        };
                        let lastDateLabel = "";
                        const items: React.ReactNode[] = [];
                        adminChatMessages.forEach((message) => {
                          const fromAdmin = message.sender === "admin";
                          const dateLabel = getDateLabel(message.dateStr || todayStr);
                          if (dateLabel !== lastDateLabel) {
                            lastDateLabel = dateLabel;
                            items.push(
                              <div className="flex items-center gap-3" key={`sep-${message.id}`}>
                                <span className="h-px flex-1 bg-[#e5e7eb]" />
                                <span className="rounded-full border border-[#e5e7eb] bg-white px-3 py-1 text-[10px] text-[#9ca3af]">
                                  {dateLabel}
                                </span>
                                <span className="h-px flex-1 bg-[#e5e7eb]" />
                              </div>
                            );
                          }
                          items.push(
                            <div className={`flex gap-3 ${fromAdmin ? "justify-end" : "justify-start"}`} key={message.id}>
                              {!fromAdmin ? (
                                <div
                                  className={`mt-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                                    activeAdminConversation.avatarUrl ? "bg-white bg-cover bg-center" : "bg-[#500c56]"
                                  }`}
                                  style={
                                    activeAdminConversation.avatarUrl
                                      ? { backgroundImage: `url(${activeAdminConversation.avatarUrl})` }
                                      : undefined
                                  }
                                >
                                  {activeAdminConversation.avatarUrl ? null : activeAdminConversation.avatarInitial}
                                </div>
                              ) : null}
                              <div className={`max-w-[86%] sm:max-w-[70%] ${fromAdmin ? "text-right" : ""}`}>
                                <p className="mb-1 text-[10px] text-[#9ca3af]">
                                  {fromAdmin ? "Admin" : activeAdminConversation.company} - {message.time}
                                </p>
                                <div
                                  className={`rounded-2xl px-4 py-3 text-left text-xs leading-5 shadow-sm ${fromAdmin
                                    ? "rounded-br-none bg-[#500c56] text-white"
                                    : "rounded-tl-none border border-[#e5e7eb] bg-white text-[#374151]"
                                  }`}
                                >
                                  {message.text}
                                </div>
                                {message.attachment ? (
                                  <button
                                    className="mt-2 flex items-center gap-3 rounded-xl border border-[#e5e7eb] bg-white p-3 text-left shadow-sm"
                                    type="button"
                                  >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fee2e2] text-[#ef4444]">
                                      <FileText className="h-4 w-4" />
                                    </span>
                                    <span>
                                      <span className="block text-xs font-semibold text-[#374151]">{message.attachment.name}</span>
                                      <span className="block text-[10px] text-[#9ca3af]">{message.attachment.size}</span>
                                    </span>
                                    <Download className="ml-3 h-4 w-4 text-[#9ca3af]" />
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          );
                        });
                        return items;
                      })()}
                    </div>

                    <div className="shrink-0 border-t border-[#e5e7eb] bg-white p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] sm:px-6 sm:py-4">
                      <div className="flex items-center gap-2">
                        <label className="flex h-11 min-w-0 flex-1 items-center rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3">
                          <input
                            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9ca3af]"
                            onChange={(event) => setAdminMessageText(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                sendAdminMessage();
                              }
                            }}
                            placeholder={`Type a message to ${activeAdminConversation.company}...`}
                            type="text"
                            value={adminMessageText}
                          />
                        </label>
                        <button
                          aria-label="Send message"
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#500c56] text-white shadow-md disabled:opacity-50"
                          disabled={!adminMessageText.trim()}
                          onClick={sendAdminMessage}
                          type="button"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center text-sm text-[#9ca3af]">
                    Loading conversations…
                  </div>
                )}
              </div>
            </section>
          ) : activeTab === "Suppliers" ? (
            <SupplierManagement
              searchQuery={supplierSearch}
              setSearchQuery={setSupplierSearch}
              locationFilter={supplierLocation}
              setLocationFilter={setSupplierLocation}
              typeFilter={supplierType}
              setTypeFilter={setSupplierType}
              statusFilter={supplierStatus}
              setStatusFilter={setSupplierStatus}
              isAddModalOpenFromHeader={isAddSupplierOpen}
              setIsAddModalOpenFromHeader={setIsAddSupplierOpen}
              isAddingSupplier={isAddingSupplier}
              setIsAddingSupplier={setIsAddingSupplier}
              initialAction={initialAction}
              initialActionId={initialActionId}
            />
          ) : activeTab === "Settings" ? (
            <SettingsManagement
              settingsSection={settingsSection}
              setSettingsSection={setSettingsSection}
              adminName={adminName}
              setAdminName={setAdminName}
              adminEmail={adminEmail}
              setAdminEmail={setAdminEmail}
              currentPassword={currentPassword}
              setCurrentPassword={setCurrentPassword}
              profilePhoto={profilePhoto}
              setProfilePhoto={setProfilePhoto}
              onSaveSuccess={(title, body) => {
                adminToast.success(
                  title || "Settings updated successfully",
                  body || "",
                );
              }}
            />
          ) : (
            <div className="bg-white rounded-[24px] shadow-sm border border-[#eef0f3] p-12 text-center text-gray-400 font-medium">
              The {activeTab} section is currently under development. Click on the <strong>Dashboard</strong>, <strong>RFQs</strong>, <strong>Products</strong>, or <strong>Users</strong> tabs to view active management features.
            </div>
          )}
        </main>
      </div>

      {/* Dashboard RFQ Details Full-Screen Modal */}
      {showDashboardDetail && dashboardSelectedRfq && (() => {
        const selectedRfq = dashboardSelectedRfq;
        const sourcingType = selectedRfq.sourcingType || "Domestic Sourcing";
        const budgetRange = selectedRfq.budgetRange || "Not provided";
        const dueDate = selectedRfq.dueDate || "Not provided";
        const contactPerson = selectedRfq.contactPerson || "Not provided";
        const contactEmail = selectedRfq.contactEmail || "Not provided";
        const businessName = selectedRfq.businessName || "Not provided";
        const contactPhone = selectedRfq.contactPhone || "Not provided";
        const contactIndustry = selectedRfq.contactIndustry || "Not provided";
        const contactLocation = selectedRfq.contactLocation || "Not provided";

        // Get notes feed
        const notes = dashboardRfqNotes[selectedRfq.id] || [];
        // Get messages feed
        const messages = dashboardRfqChats[selectedRfq.id] || [];

        const handleStatusChange = async (newStatus: "Approved" | "Pending" | "Rejected") => {
          try {
            const { data } = await api.patch(
              `/rfqs/${selectedRfq.apiId}/status/`,
              { status: newStatus.toUpperCase() },
            );
            const savedStatus = data.status.charAt(0) + data.status.slice(1).toLowerCase();
            setRfqList((prev) =>
              prev.map((rfq) => (rfq.id === selectedRfq.id ? { ...rfq, status: savedStatus } : rfq))
            );
            triggerDashboardToast(`RFQ ${savedStatus}`, `RFQ ${selectedRfq.id} has been marked as ${savedStatus}.`);
          } catch {
            triggerDashboardToast("Update failed", "Unable to update this RFQ. Please try again.");
          }
        };

        return (
          <div className="fixed inset-0 z-50 overflow-y-hidden bg-[#f8f7fa] flex flex-col transition-all duration-300">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowDashboardDetail(false)}
                  className="p-2 -ml-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <div className="text-left">
                  <h1 className="text-xl font-bold text-gray-900">RFQ Details</h1>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">View and manage domestic sourcing request</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => triggerDashboardToast("RFQ Document Downloaded", "The complete RFQ specifications PDF has been saved.")}
                  className="bg-[#df8a3c] hover:bg-[#c27c38] text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <Download className="h-4 w-4" />
                  <span>Download RFQ</span>
                </button>
                <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-300 bg-gray-100 shadow-inner">
                  {profilePhoto ? (
                    <img alt={adminName} className="h-full w-full object-cover" src={profilePhoto} />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center font-bold text-gray-500">{adminInitial}</span>
                  )}
                </div>
              </div>
            </header>

            {/* Modal Body */}
            <div data-lenis-prevent className="flex-1 overflow-y-auto w-full">
              <main className="p-6 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start pb-12">

                {/* Left Column (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">

                  {/* 1. RFQ Title Card */}
                  <div className="bg-white border border-[#eef0f3] rounded-[24px] p-6 shadow-sm text-left space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-base sm:text-lg font-black text-gray-900">RFQ {selectedRfq.id}</span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${selectedRfq.status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          selectedRfq.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-100" :
                            "bg-rose-50 text-rose-700 border-rose-100"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${selectedRfq.status === "Approved" ? "bg-emerald-500" :
                            selectedRfq.status === "Pending" ? "bg-amber-500" :
                              "bg-rose-500"
                            }`} />
                          {selectedRfq.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 font-bold sm:text-right space-y-0.5">
                        <p>Created: {selectedRfq.date}</p>
                        <p>Due: {dueDate}</p>
                      </div>
                    </div>

                    <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">{selectedRfq.productName}</h2>

                    <div>
                      <span className="inline-flex items-center gap-1.5 bg-purple-50 text-[#500c56] border border-purple-100 text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-sm">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{sourcingType}</span>
                      </span>
                    </div>
                  </div>

                  {/* 2. Request Details */}
                  <div className="bg-white border border-[#eef0f3] rounded-[24px] p-6 shadow-sm text-left space-y-5">
                    <h3 className="text-sm sm:text-base font-black text-gray-900">Request Details</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Quantity Card */}
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Quantity Requested</p>
                        <p className="text-xl sm:text-2xl font-black text-[#500c56] mt-1">{selectedRfq.quantity}</p>
                        <p className="text-xs text-gray-400 font-semibold mt-1">{selectedRfq.productName}</p>
                      </div>

                      {/* Budget Card */}
                      <div className="bg-amber-50/50 border border-amber-100/50 rounded-2xl p-4">
                        <p className="text-[10px] text-amber-800/60 font-bold uppercase tracking-wider">Budget Range</p>
                        <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">{budgetRange}</p>
                        <p className="text-xs text-amber-700/60 font-semibold mt-1">Including delivery</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-[#8c9ba5] uppercase tracking-wider">Product Description</p>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs sm:text-sm text-gray-600 leading-relaxed font-semibold">
                        {selectedRfq.description}
                      </div>
                    </div>
                  </div>

                  {/* 3. Customer Information */}
                  <div className="bg-white border border-[#eef0f3] rounded-[24px] p-6 shadow-sm text-left space-y-5">
                    <h3 className="text-sm sm:text-base font-black text-gray-900">Customer Information</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs sm:text-sm">
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Contact Person</p>
                        <p className="font-extrabold text-gray-800">{contactPerson}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email</p>
                        <p className="font-extrabold text-gray-800">{contactEmail}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Business Name</p>
                        <p className="font-extrabold text-gray-800">{businessName}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Phone</p>
                        <p className="font-extrabold text-gray-800">{contactPhone}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Industry</p>
                        <p className="font-extrabold text-gray-800">{contactIndustry}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Location</p>
                        <p className="font-extrabold text-gray-800">{contactLocation}</p>
                      </div>
                    </div>
                  </div>

                  {/* 4. Service Information */}
                  <div className="bg-white border border-[#eef0f3] rounded-[24px] p-6 shadow-sm text-left space-y-4">
                    <h3 className="text-sm sm:text-base font-black text-gray-900">Service Information</h3>

                    <div className="bg-blue-50 text-blue-900 border border-blue-100 rounded-2xl p-4 flex items-start gap-3.5 text-xs sm:text-sm font-semibold text-left">
                      <div className="p-1.5 bg-blue-500 text-white rounded-lg shrink-0 mt-0.5 shadow-sm">
                        <AlertTriangle className="h-4.5 w-4.5" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-black text-blue-950">Service Type: Sourcing</h4>
                        <p className="leading-relaxed text-blue-800/80">
                          {selectedRfq.services?.length
                            ? selectedRfq.services.map((service) => service.name).join(", ")
                            : `${sourcingType} request with no additional services selected.`}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Column (1/3 width) */}
                <div className="space-y-6">

                  {/* 1. Actions */}
                  <div className="bg-white border border-[#eef0f3] rounded-[24px] p-6 shadow-sm text-left space-y-4">
                    <h3 className="text-sm sm:text-base font-black text-gray-900">Actions</h3>

                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => handleStatusChange("Approved")}
                        className="w-full bg-[#28c76f] hover:bg-[#20a158] text-white py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                      >
                        <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                        <span>Approve RFQ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange("Rejected")}
                        className="w-full bg-[#ea5455] hover:bg-[#d93f40] text-white py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                      >
                        <X className="h-4.5 w-4.5 shrink-0" />
                        <span>Reject RFQ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowDashboardDetail(false);
                          setActiveTab("RFQs");
                          setDetailedRfqId(selectedRfq.id);
                          router.push("/admin/rfqs");
                        }}
                        className="w-full bg-[#df8a3c] hover:bg-[#c27c38] text-white py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                      >
                        <User className="h-4.5 w-4.5 shrink-0" />
                        <span>Manage RFQ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const noteEl = document.getElementById("internal-note-textarea");
                          if (noteEl) noteEl.focus();
                        }}
                        className="w-full bg-[#500c56] hover:bg-[#6c1674] text-white py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                      >
                        <FileText className="h-4.5 w-4.5 shrink-0" />
                        <span>Add Notes</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Assigned Supplier */}
                  <div className="bg-white border border-[#eef0f3] rounded-[24px] p-6 shadow-sm text-left space-y-4">
                    <h3 className="text-sm sm:text-base font-black text-gray-900">Assigned Supplier</h3>

                    <div className="space-y-3">
                      {selectedRfq.supplier?.apiId ? (
                        <div className="relative space-y-2 rounded-2xl border border-gray-200 bg-white p-4">
                          <span className="absolute right-4 top-4 rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase text-[#28c76f]">
                            Assigned
                          </span>
                          <h4 className="max-w-[150px] text-sm font-extrabold leading-tight text-gray-800">
                            {selectedRfq.supplier.name}
                          </h4>
                          <p className="mt-0.5 text-[10px] font-semibold leading-relaxed text-gray-400">
                            {selectedRfq.supplier.location}
                            {selectedRfq.supplier.rating && selectedRfq.supplier.rating !== "0"
                              ? ` • ${selectedRfq.supplier.rating}★`
                              : ""}
                          </p>
                          <p className="pt-1 text-xs font-black text-amber-600">
                            {selectedRfq.pricePerUnit}
                          </p>
                        </div>
                      ) : (
                        <p className="rounded-2xl border border-dashed border-gray-200 p-4 text-xs font-semibold text-gray-400">
                          No supplier has been assigned to this RFQ.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 3. Internal Notes */}
                  <div className="bg-white border border-[#eef0f3] rounded-[24px] p-6 shadow-sm text-left space-y-4">
                    <h3 className="text-sm sm:text-base font-black text-gray-900">Internal Notes</h3>

                    {/* Notes Feed list */}
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {notes.length === 0 ? (
                        <p className="text-xs text-gray-400 font-semibold italic text-center py-4">No internal notes added yet.</p>
                      ) : (
                        notes.map((note) => (
                          <div key={note.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
                            <p className="text-xs font-semibold text-gray-700 leading-normal">{note.text}</p>
                            <p className="text-[10px] text-gray-400 font-bold">{note.author} • {note.time}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Note Add Input */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <textarea
                        id="internal-note-textarea"
                        placeholder="Add internal note..."
                        value={dashboardNoteInput}
                        onChange={(e) => setDashboardNoteInput(e.target.value)}
                        className="w-full bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all resize-none h-16"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!dashboardNoteInput.trim()) return;
                          const newNoteObj = {
                            id: Date.now(),
                            text: dashboardNoteInput,
                            author: "Admin",
                            time: "Just now"
                          };
                          setDashboardRfqNotes(prev => ({
                            ...prev,
                            [selectedRfq.id]: [...(prev[selectedRfq.id] || []), newNoteObj]
                          }));
                          setDashboardNoteInput("");
                          triggerDashboardToast("Internal Note Added", "Your private note was added to the RFQ feed.");
                        }}
                        className="bg-[#500c56] hover:bg-[#6c1674] text-white text-[11px] font-black px-4 py-2 rounded-xl transition-all active:scale-95 shadow-sm"
                      >
                        Add Note
                      </button>
                    </div>
                  </div>

                  {/* 4. Communication */}
                  <div className="bg-white border border-[#eef0f3] rounded-[24px] p-6 shadow-sm text-left space-y-4">
                    <h3 className="text-sm sm:text-base font-black text-gray-900">Communication</h3>

                    {/* Messages container */}
                    <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                      {messages.length === 0 ? (
                        <p className="text-xs text-gray-400 font-semibold italic text-center py-4">No chat communication logged.</p>
                      ) : (
                        messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`p-3 rounded-2xl max-w-[90%] space-y-1 ${msg.type === "incoming"
                              ? "bg-sky-50/70 border border-sky-100/50 text-left mr-auto"
                              : "bg-gray-50 border border-gray-100 text-left ml-auto"
                              }`}
                          >
                            <p className="text-xs font-semibold text-gray-800 leading-normal">{msg.text}</p>
                            <p className="text-[10px] text-gray-400 font-bold">
                              {msg.sender} • {msg.time}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Message Input bar */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        value={dashboardChatInput}
                        onChange={(e) => setDashboardChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (!dashboardChatInput.trim()) return;
                            const newMsg = {
                              id: Date.now(),
                              text: dashboardChatInput,
                              sender: "TIJARUK Admin",
                              time: "Just now",
                              type: "outgoing" as const
                            };
                            setDashboardRfqChats(prev => ({
                              ...prev,
                              [selectedRfq.id]: [...(prev[selectedRfq.id] || []), newMsg]
                            }));
                            setDashboardChatInput("");
                          }
                        }}
                        className="flex-1 bg-[#f8f9fa] border border-[#eef0f3] rounded-xl px-4 py-2.5 text-xs text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!dashboardChatInput.trim()) return;
                          const newMsg = {
                            id: Date.now(),
                            text: dashboardChatInput,
                            sender: "TIJARUK Admin",
                            time: "Just now",
                            type: "outgoing" as const
                          };
                          setDashboardRfqChats(prev => ({
                            ...prev,
                            [selectedRfq.id]: [...(prev[selectedRfq.id] || []), newMsg]
                          }));
                          setDashboardChatInput("");
                        }}
                        className="bg-[#df8a3c] hover:bg-[#c27c38] p-2.5 rounded-xl text-white flex items-center justify-center shrink-0 shadow-sm transition-all active:scale-95"
                      >
                        <Send className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>

                </div>

              </main>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
