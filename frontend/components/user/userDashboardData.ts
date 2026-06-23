import {
  CheckCircle2,
  Clock3,
  FileText,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type DashboardStat = {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
  icon: LucideIcon;
  iconClassName: string;
};

export type RfqStatus = "Approved" | "Pending" | "Rejected";

export type RecentRfq = {
  id: string;
  product: string;
  sourcing: "International" | "Domestic";
  quantity: string;
  status: RfqStatus;
  date: string;
};

export type RecentUpdate = {
  id: number;
  title: string;
  time: string;
  tone: "success" | "info" | "warning";
};

export type DashboardMessage = {
  id: number;
  sender: string;
  preview: string;
  time: string;
  avatar: string;
  unread?: boolean;
};

export type UserDashboardData = {
  stats: DashboardStat[];
  recentRfqs: RecentRfq[];
  updates: RecentUpdate[];
  messages: DashboardMessage[];
};

export type UserConversation = {
  id: number;
  company: string;
  contact: string;
  role: string;
  preview: string;
  time: string;
  avatar: string;
  unread: number;
  online?: boolean;
};

export type UserChatMessage = {
  id: number;
  text: string;
  time: string;
  sender: "user" | "contact";
  attachment?: {
    name: string;
    size: string;
  };
};

export type UserMessagesData = {
  totalConversations: number;
  conversations: UserConversation[];
  messages: UserChatMessage[];
};

export type UserProfileActivity = {
  id: number;
  title: string;
  time: string;
  tone: "purple" | "blue" | "green" | "orange";
};

export type UserProfileData = {
  user: {
    name: string;
    username: string;
    role: string;
    company: string;
    email: string;
    phone: string;
    location: string;
    language: string;
    memberSince: string;
    completedRfqs: number;
    avatar: string;
  };
  company: {
    name: string;
    crNumber?: string;
    businessTypeId?: number | null;
    industryId?: number | null;
    status?: string;
    description?: string;
    industry: string;
    location: string;
    size: string;
    website?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    memberSince: string;
    totalRfqs: number;
    completed: number;
    inProgress: number;
    logo: string;
  };
  security: {
    passwordUpdated: string;
    twoFactorEnabled: boolean;
    score: number;
  };
  notificationPreferences: {
    emailNotifications: boolean;
    newRfqResponses: boolean;
    orderStatusUpdates: boolean;
    marketingPromotions: boolean;
    criticalAlerts: boolean;
    newMessages: boolean;
    weeklyDigest: boolean;
  };
  recentActivity: UserProfileActivity[];
};

export type BusinessProfileResponse = Pick<UserProfileData, "user" | "company"> & {
  profileComplete?: boolean;
};

export type UserSettingsData = {
  preferences: {
    language: string;
    timezone: string;
    currency: string;
  };
  security: {
    twoFactorEnabled: boolean;
    sessions: Array<{
      id: number;
      device: string;
      location: string;
      activity: string;
      current?: boolean;
    }>;
  };
  plan: {
    name: string;
    price: number;
    nextBillingDate: string;
    paymentMethod: string;
    billingCycle: string;
    usedRfqs: number;
    storageUsed: string;
  };
  quickPreferences: {
    emailNotifications: boolean;
    rfqAutoReminders: boolean;
    marketingEmails: boolean;
    dataSharing: boolean;
    darkMode: boolean;
  };
};

export type ProductSourcing = "Domestic" | "International";

export type UserProduct = {
  id: number;
  name: string;
  category: string;
  sourcing: ProductSourcing;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  minimumQuantity?: number;
  estimatedPrice?: string | number | null;
  unitId?: number | null;
  unitName?: string | null;
  services?: {
    id: number;
    name: string;
    description: string;
  }[];
};

export type UserProductsData = {
  totalProducts: number;
  categories: string[];
  products: UserProduct[];
};

const dashboardData: UserDashboardData = {
  stats: [
    {
      title: "Total RFQs",
      value: "248",
      change: "+12% from last month",
      trend: "up",
      icon: FileText,
      iconClassName: "bg-[#f4e7f5] text-[#65096c]",
    },
    {
      title: "Pending Review",
      value: "34",
      change: "0% from last month",
      trend: "flat",
      icon: Clock3,
      iconClassName: "bg-[#fff3d6] text-[#e39b4d]",
    },
    {
      title: "Approved RFQs",
      value: "182",
      change: "+18% from last month",
      trend: "up",
      icon: CheckCircle2,
      iconClassName: "bg-[#dff9ee] text-[#13b981]",
    },
    {
      title: "Rejected",
      value: "12",
      change: "-5% from last month",
      trend: "down",
      icon: XCircle,
      iconClassName: "bg-[#ffe4e6] text-[#f04444]",
    },
  ],
  recentRfqs: [
    {
      id: "#RFQ-2024-089",
      product: "Industrial Valves",
      sourcing: "International",
      quantity: "5,000 pcs",
      status: "Approved",
      date: "Oct 24, 2024",
    },
    {
      id: "#RFQ-2024-088",
      product: "Processor Chips",
      sourcing: "International",
      quantity: "10,000 pcs",
      status: "Pending",
      date: "Oct 23, 2024",
    },
    {
      id: "#RFQ-2024-087",
      product: "Chemical Solvents",
      sourcing: "Domestic",
      quantity: "2,000 L",
      status: "Approved",
      date: "Oct 21, 2024",
    },
    {
      id: "#RFQ-2024-086",
      product: "Packaging Materials",
      sourcing: "Domestic",
      quantity: "500 Pallets",
      status: "Rejected",
      date: "Oct 20, 2024",
    },
  ],
  updates: [
    {
      id: 1,
      title: "RFQ #RFQ-2024-089 has been approved by admin.",
      time: "2 hours ago",
      tone: "success",
    },
    {
      id: 2,
      title: "New contract draft uploaded for Chemical Solvents.",
      time: "Yesterday",
      tone: "info",
    },
    {
      id: 3,
      title: "Supplier requested clarification on Processor Chips specs.",
      time: "Oct 22, 2024",
      tone: "warning",
    },
  ],
  messages: [
    {
      id: 1,
      sender: "Tarig Supplier Co.",
      preview: "We can fulfill the order by next week if...",
      time: "10:42 AM",
      avatar: "/home-images/testimonial-avatar.webp",
      unread: true,
    },
    {
      id: 2,
      sender: "System Admin",
      preview: "Your account verification is complete.",
      time: "Yesterday",
      avatar: "SA",
    },
  ],
};

export async function getUserDashboardData() {
  return dashboardData;
}

const userMessagesData: UserMessagesData = {
  totalConversations: 24,
  conversations: [
    {
      id: 1,
      company: "Global Logistics Co.",
      contact: "Ahmad Al-Rashid",
      role: "Ops Manager",
      preview: "We can confirm the shipment will depart on Friday...",
      time: "10:42 AM",
      avatar: "/home-images/testimonial-avatar.webp",
      unread: 3,
      online: true,
    },
  ],
  messages: [
    {
      id: 1,
      sender: "contact",
      time: "9:02 AM",
      text: "Good morning, Sara. Following up on our discussion regarding the bulk shipping contract for Q3. We have finalized the rates and would love to share the updated proposal.",
    },
    {
      id: 2,
      sender: "user",
      time: "9:18 AM",
      text: "Hi Ahmad! Yes, please do share. We're also interested in understanding the lead times for the Southeast Asia routes specifically.",
    },
    {
      id: 3,
      sender: "contact",
      time: "9:31 AM",
      text: "Of course! Please find the updated shipping rates attached. We've included detailed breakdowns for all major ports in the region.",
      attachment: {
        name: "Q3_Shipping_Rates.pdf",
        size: "2.4 MB - PDF Document",
      },
    },
    {
      id: 4,
      sender: "user",
      time: "10:04 AM",
      text: "Thank you! I've reviewed the document. The rates look competitive. Can we schedule a call this week to discuss the contract terms?",
    },
    {
      id: 5,
      sender: "contact",
      time: "10:27 AM",
      text: "Absolutely! I'm available Thursday or Friday this week. Would 2:00 PM GST work for you?",
    },
    {
      id: 6,
      sender: "contact",
      time: "10:42 AM",
      text: "We can confirm the shipment will depart on Friday from Port Rashid. Tracking reference will be sent once confirmed by our warehouse team.",
    },
  ],
};

export async function getUserMessagesData() {
  return userMessagesData;
}

const userProfileData: UserProfileData = {
  user: {
    name: "Ahmed Hassan",
    username: "ahmed.hassan",
    role: "Procurement Manager",
    company: "Global Logistics Corp",
    email: "ahmed.hassan@glocorp.ae",
    phone: "+971 50 123 4567",
    location: "Dubai, UAE",
    language: "English (EN)",
    memberSince: "Jan 2022",
    completedRfqs: 47,
    avatar: "/home-images/testimonial-avatar.webp",
  },
  company: {
    name: "Global Logistics Corp",
    industry: "Logistics & Supply Chain",
    location: "Dubai, UAE",
    size: "250-500 employees",
    memberSince: "Jan 2022",
    totalRfqs: 47,
    completed: 38,
    inProgress: 9,
    logo: "",
  },
  security: {
    passwordUpdated: "3 months ago",
    twoFactorEnabled: false,
    score: 85,
  },
  notificationPreferences: {
    emailNotifications: true,
    newRfqResponses: true,
    orderStatusUpdates: true,
    marketingPromotions: false,
    criticalAlerts: true,
    newMessages: false,
    weeklyDigest: false,
  },
  recentActivity: [
    {
      id: 1,
      title: "RFQ #1042 submitted",
      time: "2 hours ago",
      tone: "blue",
    },
    {
      id: 2,
      title: "Order #874 completed",
      time: "Yesterday, 4:30 PM",
      tone: "green",
    },
    {
      id: 3,
      title: "Message from Al Noor Supplies",
      time: "2 days ago",
      tone: "orange",
    },
    {
      id: 4,
      title: "Profile info updated",
      time: "3 days ago",
      tone: "purple",
    },
  ],
};

export async function getUserProfileData() {
  return userProfileData;
}

const userSettingsData: UserSettingsData = {
  preferences: {
    language: "English (EN)",
    timezone: "Gulf Standard Time",
    currency: "AED - UAE Dirham",
  },
  security: {
    twoFactorEnabled: true,
    sessions: [
      {
        id: 1,
        device: "MacBook Pro - Chrome",
        location: "Dubai, UAE",
        activity: "Active now",
        current: true,
      },
      {
        id: 2,
        device: "iPhone 15 - Safari",
        location: "Dubai, UAE",
        activity: "2 hours ago",
      },
      {
        id: 3,
        device: "Windows PC - Edge",
        location: "Sharjah, UAE",
        activity: "1 day ago",
      },
    ],
  },
  plan: {
    name: "Enterprise",
    price: 299,
    nextBillingDate: "February 1, 2025",
    paymentMethod: "•••• 4821",
    billingCycle: "Annual",
    usedRfqs: 38,
    storageUsed: "4.2 GB",
  },
  quickPreferences: {
    emailNotifications: true,
    rfqAutoReminders: true,
    marketingEmails: false,
    dataSharing: true,
    darkMode: false,
  },
};

export async function getUserSettingsData() {
  return userSettingsData;
}

const productsData: UserProductsData = {
  totalProducts: 1240,
  categories: ["Electronics", "Construction", "Textiles", "Food & Beverage", "Chemicals"],
  products: [
    {
      id: 1,
      name: "Industrial Solar Panels",
      category: "Electronics",
      sourcing: "International",
      description: "High-efficiency monocrystalline solar panels for industrial-scale energy solutions.",
      image: "/products/switces02.webp",
      rating: 4.7,
      reviews: 84,
    },
    {
      id: 2,
      name: "Premium Basmati Rice",
      category: "Food & Beverage",
      sourcing: "Domestic",
      description: "Long-grain aromatic basmati rice sourced from certified domestic farms.",
      image: "/products/rice.webp",
      rating: 4.8,
      reviews: 127,
    },
    {
      id: 3,
      name: "High-Grade Steel Rebar",
      category: "Construction",
      sourcing: "International",
      description: "Grade 60 deformed steel rebar for heavy-duty construction and infrastructure projects.",
      image: "/products/steel-rods.webp",
      rating: 4.6,
      reviews: 56,
    },
    {
      id: 4,
      name: "Premium Cotton Fabric Rolls",
      category: "Textiles",
      sourcing: "Domestic",
      description: "100% pure cotton fabric in various weights, suitable for garment and industrial use.",
      image: "/products/fabrics.webp",
      rating: 4.5,
      reviews: 39,
    },
    {
      id: 5,
      name: "Lithium-Ion Battery Packs",
      category: "Electronics",
      sourcing: "International",
      description: "High-capacity Li-ion battery packs for EVs and industrial energy storage systems.",
      image: "/products/semiconductors.png",
      rating: 4.8,
      reviews: 61,
    },
    {
      id: 6,
      name: "Extra Virgin Olive Oil",
      category: "Food & Beverage",
      sourcing: "Domestic",
      description: "Cold-pressed extra virgin olive oil, available in bulk drums for food processing.",
      image: "/products/vegitableoil.webp",
      rating: 4.9,
      reviews: 203,
    },
    {
      id: 7,
      name: "OPC Cement Grade 53",
      category: "Construction",
      sourcing: "International",
      description: "Ordinary Portland Cement grade 53 for high-strength structural applications.",
      image: "/products/pipe02.webp",
      rating: 4.4,
      reviews: 72,
    },
    {
      id: 8,
      name: "Industrial Polyester Fabric",
      category: "Textiles",
      sourcing: "Domestic",
      description: "High-tenacity woven polyester fabric for workwear, upholstery, and industrial uses.",
      image: "/products/fabrics02.webp",
      rating: 4.6,
      reviews: 28,
    },
  ],
};

export async function getUserProductsData() {
  return productsData;
}
