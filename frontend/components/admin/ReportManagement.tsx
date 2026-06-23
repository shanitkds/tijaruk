// @ts-nocheck
"use client";

import React, { useState } from "react";
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
  Calendar,
  Layers,
  FileText,
  Clock,
  Briefcase,
  Activity,
  Globe,
  RefreshCw,
  Share2,
  TrendingUp,
  TrendingDown,
  Tag,
  User
} from "lucide-react";

export interface Report {
  id: string;
  name: string;
  type: "Sales" | "Revenue" | "RFQs" | "Product";
  dateGenerated: string;
  status: "Completed" | "In Progress" | "Pending";
  period: string;
  dataPoints: string;
  totalRevenue: string;
  revenueGrowth: string;
  revenueGrowthType: "up" | "down";
  productsSourced: string;
  productsSourcedGrowth: string;
  productsSourcedGrowthType: "up" | "down";
  rfqsProcessed: string;
  rfqsProcessedGrowth: string;
  rfqsProcessedGrowthType: "up" | "down";
  logoColor: string;
  chartPoints: number[];
  chartDates: string[];
}

export default function ReportManagement() {
  const [reportList, setReportList] = useState<Report[]>([
    {
      id: "#RPT-0091",
      name: "Q3 Sales Analysis",
      type: "Sales",
      dateGenerated: "Oct 01, 2024",
      status: "Completed",
      period: "Julâ€“Sep 2024",
      dataPoints: "4,821",
      totalRevenue: "SAR 8.4M",
      revenueGrowth: "12.4%",
      revenueGrowthType: "up",
      productsSourced: "1,284",
      productsSourcedGrowth: "8.1%",
      productsSourcedGrowthType: "up",
      rfqsProcessed: "347",
      rfqsProcessedGrowth: "2.3%",
      rfqsProcessedGrowthType: "down",
      logoColor: "bg-purple-100 text-[#500c56]",
      chartPoints: [280, 320, 310, 380, 350, 420, 400, 480, 450, 520, 490, 580, 540, 620, 590],
      chartDates: ["Jul 3", "Jul 10", "Jul 17", "Jul 24", "Aug 1", "Aug 8", "Aug 15", "Aug 22", "Aug 29", "Sep 5", "Sep 12", "Sep 19", "Sep 26", "Sep 30"]
    },
    {
      id: "#RPT-0090",
      name: "Revenue Overview Q3",
      type: "Revenue",
      dateGenerated: "Sep 28, 2024",
      status: "Completed",
      period: "Julâ€“Sep 2024",
      dataPoints: "3,124",
      totalRevenue: "SAR 6.2M",
      revenueGrowth: "10.1%",
      revenueGrowthType: "up",
      productsSourced: "952",
      productsSourcedGrowth: "5.4%",
      productsSourcedGrowthType: "up",
      rfqsProcessed: "284",
      rfqsProcessedGrowth: "1.8%",
      rfqsProcessedGrowthType: "up",
      logoColor: "bg-amber-100 text-[#d97706]",
      chartPoints: [220, 260, 240, 310, 290, 360, 330, 410, 380, 450, 420, 490, 460, 530, 500],
      chartDates: ["Jul 3", "Jul 10", "Jul 17", "Jul 24", "Aug 1", "Aug 8", "Aug 15", "Aug 22", "Aug 29", "Sep 5", "Sep 12", "Sep 19", "Sep 26", "Sep 30"]
    },
    {
      id: "#RPT-0089",
      name: "RFQ Performance Sep",
      type: "RFQs",
      dateGenerated: "Sep 15, 2024",
      status: "In Progress",
      period: "Sep 2024",
      dataPoints: "1,854",
      totalRevenue: "SAR 2.5M",
      revenueGrowth: "5.2%",
      revenueGrowthType: "up",
      productsSourced: "410",
      productsSourcedGrowth: "3.2%",
      productsSourcedGrowthType: "up",
      rfqsProcessed: "156",
      rfqsProcessedGrowth: "4.5%",
      rfqsProcessedGrowthType: "up",
      logoColor: "bg-blue-100 text-blue-700",
      chartPoints: [100, 130, 110, 160, 140, 200, 180, 230, 210, 260, 230, 290, 270, 330, 310],
      chartDates: ["Sep 1", "Sep 3", "Sep 5", "Sep 7", "Sep 9", "Sep 11", "Sep 13", "Sep 15", "Sep 17", "Sep 19", "Sep 21", "Sep 23", "Sep 25", "Sep 30"]
    },
    {
      id: "#RPT-0088",
      name: "Product Performance H2",
      type: "Product",
      dateGenerated: "Sep 10, 2024",
      status: "Pending",
      period: "Julâ€“Dec 2024",
      dataPoints: "5,412",
      totalRevenue: "SAR 12.1M",
      revenueGrowth: "15.6%",
      revenueGrowthType: "up",
      productsSourced: "2,150",
      productsSourcedGrowth: "12.8%",
      productsSourcedGrowthType: "up",
      rfqsProcessed: "612",
      rfqsProcessedGrowth: "1.5%",
      rfqsProcessedGrowthType: "down",
      logoColor: "bg-emerald-100 text-emerald-700",
      chartPoints: [450, 480, 460, 530, 500, 590, 560, 650, 610, 710, 670, 770, 740, 840, 810],
      chartDates: ["Jul 3", "Jul 17", "Jul 31", "Aug 14", "Aug 28", "Sep 11", "Sep 25", "Oct 9", "Oct 23", "Nov 6", "Nov 20", "Dec 4", "Dec 18", "Dec 30"]
    },
    {
      id: "#RPT-0087",
      name: "Q2 Sales Analysis",
      type: "Sales",
      dateGenerated: "Jul 05, 2024",
      status: "Completed",
      period: "Aprâ€“Jun 2024",
      dataPoints: "4,210",
      totalRevenue: "SAR 7.8M",
      revenueGrowth: "11.2%",
      revenueGrowthType: "up",
      productsSourced: "1,140",
      productsSourcedGrowth: "7.5%",
      productsSourcedGrowthType: "up",
      rfqsProcessed: "312",
      rfqsProcessedGrowth: "2.1%",
      rfqsProcessedGrowthType: "up",
      logoColor: "bg-purple-100 text-[#500c56]",
      chartPoints: [250, 280, 270, 330, 310, 370, 350, 410, 390, 460, 430, 500, 470, 540, 510],
      chartDates: ["Apr 3", "Apr 17", "May 1", "May 15", "May 29", "Jun 12", "Jun 26", "Jun 30"]
    },
    {
      id: "#RPT-0086",
      name: "Annual Revenue 2023",
      type: "Revenue",
      dateGenerated: "Jan 12, 2024",
      status: "In Progress",
      period: "Janâ€“Dec 2023",
      dataPoints: "18,421",
      totalRevenue: "SAR 32.5M",
      revenueGrowth: "20.4%",
      revenueGrowthType: "up",
      productsSourced: "5,840",
      productsSourcedGrowth: "18.2%",
      productsSourcedGrowthType: "up",
      rfqsProcessed: "1,642",
      rfqsProcessedGrowth: "8.4%",
      rfqsProcessedGrowthType: "up",
      logoColor: "bg-amber-100 text-[#d97706]",
      chartPoints: [1200, 1400, 1300, 1600, 1500, 1800, 1700, 2000, 1900, 2200, 2100, 2400, 2300, 2600, 2500],
      chartDates: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    },
    {
      id: "#RPT-0085",
      name: "Category Breakdown Q2",
      type: "Product",
      dateGenerated: "Jun 30, 2024",
      status: "Completed",
      period: "Aprâ€“Jun 2024",
      dataPoints: "2,841",
      totalRevenue: "SAR 4.9M",
      revenueGrowth: "8.5%",
      revenueGrowthType: "up",
      productsSourced: "820",
      productsSourcedGrowth: "6.1%",
      productsSourcedGrowthType: "up",
      rfqsProcessed: "215",
      rfqsProcessedGrowth: "0.8%",
      rfqsProcessedGrowthType: "down",
      logoColor: "bg-emerald-100 text-emerald-700",
      chartPoints: [180, 210, 200, 250, 230, 280, 260, 310, 290, 340, 320, 370, 350, 400, 380],
      chartDates: ["Apr 3", "Apr 17", "May 1", "May 15", "May 29", "Jun 12", "Jun 26", "Jun 30"]
    }
  ]);

  const [selectedReportId, setSelectedReportId] = useState<string | null>("#RPT-0091");
  const [filterSegment, setFilterSegment] = useState<"All" | "Sales" | "RFQs" | "Revenue">("All");
  const [filterType, setFilterType] = useState<string>("All");
  const [filterDateRange, setFilterDateRange] = useState<string>("Last 30 Days");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedReport = reportList.find(r => r.id === selectedReportId) || null;

  // Stats calculation matching mockup
  const totalCount = 128 + (reportList.length - 7);
  const completedCount = 94 + (reportList.filter(r => r.status === "Completed").length - 4);
  const inProgressCount = 21 + (reportList.filter(r => r.status === "In Progress").length - 2);
  const pendingCount = 13 + (reportList.filter(r => r.status === "Pending").length - 1);

  // Filtered lists
  const filteredReports = reportList.filter(r => {
    // Segment Filter (All, Sales, RFQs, Revenue)
    const matchesSegment = 
      filterSegment === "All" ||
      (filterSegment === "Sales" && r.type === "Sales") ||
      (filterSegment === "RFQs" && r.type === "RFQs") ||
      (filterSegment === "Revenue" && r.type === "Revenue");

    // Dropdown Type Filter
    const matchesType = filterType === "All" || r.type === filterType;

    // Status filter
    const matchesStatus = filterStatus === "All" || r.status === filterStatus;

    // Search query
    const matchesSearch = 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.type.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSegment && matchesType && matchesStatus && matchesSearch;
  });

  const handleDeleteReport = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm("Are you sure you want to delete this report?")) {
      setReportList(prev => prev.filter(r => r.id !== id));
      if (selectedReportId === id) {
        setSelectedReportId(null);
      }
    }
  };

  const getLogoIcon = (type: string) => {
    switch (type) {
      case "Sales":
        return <Activity className="w-5 h-5" />;
      case "Revenue":
        return <Building className="w-5 h-5" />;
      case "RFQs":
        return <FileText className="w-5 h-5" />;
      case "Product":
        return <Layers className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  // Convert chartPoints to SVG path with bounding parameters
  const generateSvgPath = (points: number[], startX: number, endX: number, startY: number, endY: number) => {
    if (!points || points.length === 0) return "";
    const maxVal = Math.max(...points) * 1.05;
    const minVal = Math.min(...points) * 0.95;
    const range = maxVal - minVal || 1;
    const width = endX - startX;
    const height = endY - startY;

    const coords = points.map((p, idx) => {
      const x = startX + (idx / (points.length - 1)) * width;
      const y = endY - ((p - minVal) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return `M ${coords.join(" L ")}`;
  };

  const generateSvgAreaPath = (points: number[], startX: number, endX: number, startY: number, endY: number) => {
    const linePath = generateSvgPath(points, startX, endX, startY, endY);
    if (!linePath) return "";
    return `${linePath} L ${endX},${endY} L ${startX},${endY} Z`;
  };

  return (
    <div className="space-y-6">
      {/* 1. Stats row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Reports */}
        <div className="bg-white border border-[#eef0f3] rounded-[20px] p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-[#500c56]/10 flex items-center justify-center text-[#500c56] shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Total Reports</p>
            <p className="text-[26px] font-extrabold text-gray-900 mt-0.5 leading-none">{totalCount}</p>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white border border-[#eef0f3] rounded-[20px] p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Completed</p>
            <p className="text-[26px] font-extrabold text-gray-900 mt-0.5 leading-none">{completedCount}</p>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white border border-[#eef0f3] rounded-[20px] p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: "3s" }} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">In Progress</p>
            <p className="text-[26px] font-extrabold text-gray-900 mt-0.5 leading-none">{inProgressCount}</p>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white border border-[#eef0f3] rounded-[20px] p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Pending</p>
            <p className="text-[26px] font-extrabold text-gray-900 mt-0.5 leading-none">{pendingCount}</p>
          </div>
        </div>
      </section>

      {/* 2. Filters Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Side Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start">
          {/* Report Type */}
          <div className="relative flex items-center bg-white border border-[#eef0f3] rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-500 shadow-sm gap-2 focus-within:ring-1 focus-within:ring-[#500c56]/40">
            <Filter className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="text-gray-400">Report Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent focus:outline-none appearance-none pr-5 cursor-pointer text-[#500c56] font-bold"
            >
              <option value="All">All Types</option>
              <option value="Sales">Sales</option>
              <option value="Revenue">Revenue</option>
              <option value="RFQs">RFQs</option>
              <option value="Product">Product</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#500c56]">
              <ChevronRight className="h-3 w-3 transform rotate-90" />
            </div>
          </div>

          {/* Date Range */}
          <div className="relative flex items-center bg-white border border-[#eef0f3] rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-500 shadow-sm gap-2 focus-within:ring-1 focus-within:ring-[#500c56]/40">
            <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="text-gray-400">Date Range:</span>
            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
              className="bg-transparent focus:outline-none appearance-none pr-5 cursor-pointer text-[#d97706] font-bold"
            >
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 6 Months">Last 6 Months</option>
              <option value="This Year">This Year</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#d97706]">
              <ChevronRight className="h-3 w-3 transform rotate-90" />
            </div>
          </div>

          {/* Status */}
          <div className="relative flex items-center bg-white border border-[#eef0f3] rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-500 shadow-sm gap-2 focus-within:ring-1 focus-within:ring-[#500c56]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
            <span className="text-gray-400">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent focus:outline-none appearance-none pr-5 cursor-pointer text-purple-750 font-bold"
            >
              <option value="All">All</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-purple-700">
              <ChevronRight className="h-3 w-3 transform rotate-90" />
            </div>
          </div>
        </div>

        {/* Right Side buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
          <button className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-50 active:scale-95 transition-all shadow-sm">
            <Download className="h-4 w-4" />
            <span>Export All</span>
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-50 active:scale-95 transition-all shadow-sm">
            <Filter className="h-4 w-4" />
            <span>Advanced Filters</span>
          </button>
        </div>
      </div>

      {/* 3. Grid area */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Report List */}
        <div className="lg:col-span-2 bg-white rounded-[20px] border border-[#eef0f3] p-6 shadow-sm flex flex-col justify-between min-h-[680px]">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center">
                <h3 className="text-lg font-bold text-gray-900">Report List</h3>
                <span className="text-xs font-bold px-2.5 py-1 bg-[#500c56]/10 text-[#500c56] rounded-full ml-3">
                  {totalCount} total
                </span>
              </div>

              <div className="bg-[#f8f9fa] border border-[#eef0f3] rounded-lg p-0.5 flex flex-wrap sm:flex-nowrap w-full sm:w-auto justify-start sm:justify-end shrink-0">
                {(["All", "Sales", "RFQs", "Revenue"] as const).map((segment) => (
                  <button
                    key={segment}
                    onClick={() => setFilterSegment(segment)}
                    className={`text-xs px-3.5 py-1.5 rounded-md font-bold transition-all ${
                      filterSegment === segment
                        ? "bg-[#500c56] text-white shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {segment}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto -mx-6">
              <div className="inline-block min-w-full align-middle px-6">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead>
                    <tr className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="pb-3.5 font-bold">REPORT ID</th>
                      <th className="pb-3.5 font-bold">REPORT NAME</th>
                      <th className="pb-3.5 font-bold">TYPE</th>
                      <th className="pb-3.5 font-bold">DATE GENERATED</th>
                      <th className="pb-3.5 font-bold">STATUS</th>
                      <th className="pb-3.5 font-bold text-center">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs sm:text-sm text-gray-700">
                    {filteredReports.map((r) => {
                      const isSelected = selectedReportId === r.id;
                      return (
                        <tr
                          key={r.id}
                          onClick={() => setSelectedReportId(r.id)}
                          className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${
                            isSelected ? "bg-[#500c56]/5" : ""
                          }`}
                        >
                          <td className={`py-4 font-bold ${isSelected ? "text-[#500c56]" : "text-gray-500"}`}>
                            {r.id}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-lg ${r.logoColor} flex items-center justify-center shrink-0 shadow-sm`}>
                                {getLogoIcon(r.type)}
                              </div>
                              <p className="font-bold text-gray-800 line-clamp-1">{r.name}</p>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                              r.type === "Sales" ? "bg-purple-50 text-[#500c56] border-purple-100" :
                              r.type === "Revenue" ? "bg-amber-50 text-[#d97706] border-amber-100" :
                              r.type === "RFQs" ? "bg-blue-50 text-blue-700 border-blue-100" :
                              "bg-emerald-50 text-emerald-700 border-emerald-100"
                            }`}>
                              {r.type}
                            </span>
                          </td>
                          <td className="py-4 text-gray-500 font-semibold">{r.dateGenerated}</td>
                          <td className="py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              r.status === "Completed" ? "bg-emerald-50 text-emerald-700" :
                              r.status === "Pending" ? "bg-amber-50 text-amber-700" :
                              "bg-blue-50 text-blue-700"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                r.status === "Completed" ? "bg-emerald-500" :
                                r.status === "Pending" ? "bg-amber-500" :
                                "bg-blue-500"
                              }`} />
                              {r.status}
                            </span>
                          </td>
                          <td className="py-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setSelectedReportId(r.id)}
                                className={`p-1.5 rounded-lg border transition-all ${
                                  isSelected ? "bg-[#500c56] text-white border-[#500c56]" : "text-gray-400 border-gray-200 bg-white hover:bg-gray-50"
                                }`}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                                <Download className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteReport(r.id)}
                                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
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
            <span>Showing 1-7 of {totalCount} reports</span>
            <div className="flex items-center gap-1.5">
              <button className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-[#500c56] text-white text-xs font-bold">1</button>
              <button className="w-8 h-8 rounded-lg border border-gray-200 text-xs font-bold text-gray-500">2</button>
              <button className="w-8 h-8 rounded-lg border border-gray-200 text-xs font-bold text-gray-500">3</button>
              <span className="px-1 text-gray-400 font-medium text-xs">...</span>
              <button className="w-8 h-8 rounded-lg border border-gray-200 text-xs font-bold text-gray-500">19</button>
              <button className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Report Details Panel */}
        <div className="lg:col-span-1 bg-white rounded-[20px] border border-[#eef0f3] overflow-hidden shadow-sm">
          {selectedReport ? (
            <div className="flex flex-col">
              {/* Header */}
              <div className="h-16 flex items-center justify-between px-5 bg-[#500c56] text-white shrink-0">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#ecd3ed]/70 font-bold uppercase">Selected Report</span>
                  <span className="text-xs sm:text-sm font-bold text-white leading-tight">
                    {selectedReport.name} â€” {selectedReport.id}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
                    selectedReport.status === "Completed" ? "border-emerald-400 bg-emerald-500/10 text-emerald-300" :
                    selectedReport.status === "Pending" ? "border-amber-400 bg-amber-500/10 text-amber-300" :
                    "border-blue-400 bg-blue-500/10 text-blue-300"
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${
                      selectedReport.status === "Completed" ? "bg-emerald-400" :
                      selectedReport.status === "Pending" ? "bg-amber-400" :
                      "bg-blue-400"
                    }`} />
                    {selectedReport.status}
                  </span>
                  <button onClick={() => setSelectedReportId(null)} className="p-1 rounded-full text-[#ecd3ed] hover:bg-white/10">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-6">
                {/* Meta details header with Download & Share (direct on white background) */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${selectedReport.logoColor} flex items-center justify-center shrink-0 shadow-sm`}>
                      {getLogoIcon(selectedReport.type)}
                    </div>
                    <div className="text-left">
                      <h4 className="font-extrabold text-base text-gray-900 leading-tight">
                        {selectedReport.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-semibold mt-1 leading-normal">
                        Generated: {selectedReport.dateGenerated.split(",")[0]},<br />
                        {selectedReport.dateGenerated.split(",")[1]} Â· By: Admin User
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button className="bg-[#df8a3c] hover:bg-[#c27c38] text-white text-xs px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-1 transition-all active:scale-95 shadow-[0_4px_14px_rgba(223,138,60,0.25)]">
                      <Download className="h-3.5 w-3.5 text-white" />
                      <span>Download</span>
                    </button>
                    <button className="bg-white border border-gray-200 text-gray-500 text-xs px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-1 hover:bg-gray-50 active:scale-95 transition-all shadow-sm">
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                {/* Summary Metrics (with orange vertical line) */}
                <div>
                  <h4 className="border-l-[3px] border-[#e39b4d] pl-2.5 font-bold text-gray-800 text-xs uppercase tracking-wider">
                    Summary Metrics
                  </h4>
                  <div className="grid grid-cols-3 gap-2.5 mt-3">
                    {/* Card 1: Total Revenue (purple theme) */}
                    <div className="bg-[#f7f5f9] border border-[#f0ebf5] rounded-2xl p-3 text-center flex flex-col justify-between shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-purple-50 text-[#500c56] flex items-center justify-center mx-auto mb-1 shrink-0">
                        <Layers className="h-4 w-4" />
                      </div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase leading-none">Total Revenue</p>
                      <p className="text-sm font-extrabold text-gray-900 mt-1">
                        {selectedReport.totalRevenue}
                      </p>
                      <span className={`text-[8px] font-bold flex items-center justify-center gap-0.5 mt-1 ${
                        selectedReport.revenueGrowthType === "up" ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {selectedReport.revenueGrowthType === "up" ? <TrendingUp className="h-2 w-2" /> : <TrendingDown className="h-2 w-2" />}
                        {selectedReport.revenueGrowth}
                      </span>
                    </div>

                    {/* Card 2: Products Sourced (orange theme) */}
                    <div className="bg-[#faf6f2] border border-[#f5ebdf] rounded-2xl p-3 text-center flex flex-col justify-between shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-amber-50 text-[#d97706] flex items-center justify-center mx-auto mb-1 shrink-0">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase leading-none">Products Sourced</p>
                      <p className="text-sm font-extrabold text-gray-900 mt-1">
                        {selectedReport.productsSourced}
                      </p>
                      <span className={`text-[8px] font-bold flex items-center justify-center gap-0.5 mt-1 ${
                        selectedReport.productsSourcedGrowthType === "up" ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {selectedReport.productsSourcedGrowthType === "up" ? <TrendingUp className="h-2 w-2" /> : <TrendingDown className="h-2 w-2" />}
                        {selectedReport.productsSourcedGrowth}
                      </span>
                    </div>

                    {/* Card 3: RFQs Processed (green theme) */}
                    <div className="bg-[#f2faf6] border border-[#e5f5ed] rounded-2xl p-3 text-center flex flex-col justify-between shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-1 shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase leading-none">RFQs Processed</p>
                      <p className="text-sm font-extrabold text-gray-900 mt-1">
                        {selectedReport.rfqsProcessed}
                      </p>
                      <span className={`text-[8px] font-bold flex items-center justify-center gap-0.5 mt-1 ${
                        selectedReport.rfqsProcessedGrowthType === "up" ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {selectedReport.rfqsProcessedGrowthType === "up" ? <TrendingUp className="h-2 w-2" /> : <TrendingDown className="h-2 w-2" />}
                        {selectedReport.rfqsProcessedGrowth}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Revenue Trend SVG Line Chart (with purple vertical line) */}
                <div>
                  <div className="flex items-center justify-between border-l-[3px] border-[#500c56] pl-2.5">
                    <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">
                      Revenue Trend
                    </h4>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">
                      Q3 2024 (Jul â€“ Sep)
                    </span>
                  </div>

                  <div className="mt-4 border border-gray-100 bg-white rounded-2xl p-4 shadow-inner relative">
                    {/* SVG Line Area Chart with Offset Y-axis and Tilted X-axis Labels inside SVG */}
                    <div className="h-40 w-full">
                      <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#500c56" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#500c56" stopOpacity="0" />
                          </linearGradient>
                        </defs>

                        {/* Grid lines (dashed, start at x=35, end at x=395) */}
                        <line x1="35" y1="15" x2="395" y2="15" stroke="#f0eded" strokeDasharray="3,3" />
                        <line x1="35" y1="65" x2="395" y2="65" stroke="#f0eded" strokeDasharray="3,3" />
                        <line x1="35" y1="115" x2="395" y2="115" stroke="#e5e5e5" />

                        {/* Y-axis Labels */}
                        <text x="0" y="19" className="text-[8px] fill-gray-400 font-bold font-sans">1000K</text>
                        <text x="0" y="69" className="text-[8px] fill-gray-400 font-bold font-sans">500K</text>
                        <text x="0" y="119" className="text-[8px] fill-gray-400 font-bold font-sans">0K</text>

                        {/* Chart Area */}
                        <path
                          d={generateSvgAreaPath(selectedReport.chartPoints, 35, 395, 15, 115)}
                          fill="url(#chart-grad)"
                        />

                        {/* Chart Line */}
                        <path
                          d={generateSvgPath(selectedReport.chartPoints, 35, 395, 15, 115)}
                          fill="none"
                          stroke="#500c56"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Data dots vertex circles */}
                        {selectedReport.chartPoints.map((p, idx) => {
                          const maxVal = Math.max(...selectedReport.chartPoints) * 1.05;
                          const minVal = Math.min(...selectedReport.chartPoints) * 0.95;
                          const range = maxVal - minVal || 1;
                          const x = 35 + (idx / (selectedReport.chartPoints.length - 1)) * 360;
                          const y = 115 - ((p - minVal) / range) * 100;

                          // Render dots at endpoints and peak/dip points to match mockup look
                          if (idx === 0 || idx === selectedReport.chartPoints.length - 1 || idx === 4 || idx === 8 || idx === 12) {
                            return (
                              <g key={idx}>
                                <circle cx={x} cy={y} r="3.5" fill="#500c56" stroke="white" strokeWidth="1" />
                              </g>
                            );
                          }
                          return null;
                        })}

                        {/* Tilted X-axis Labels */}
                        {selectedReport.chartDates.map((date, idx) => {
                          const x = 35 + (idx / (selectedReport.chartDates.length - 1)) * 360;
                          const y = 130;
                          return (
                            <text
                              key={idx}
                              x={x}
                              y={y}
                              transform={`rotate(-35 ${x} ${y})`}
                              textAnchor="end"
                              className="text-[8px] fill-gray-400 font-bold font-sans"
                            >
                              {date}
                            </text>
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Metadata details 2x2 grid (white card layout) */}
                <div className="grid grid-cols-2 gap-3.5">
                  {/* Period */}
                  <div className="flex items-center gap-3.5 p-3 bg-white border border-[#eef0f3] rounded-2xl shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-[#500c56] shrink-0 border border-purple-100/50">
                      <Calendar className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Period</span>
                      <span className="text-xs font-extrabold text-gray-800 mt-0.5">{selectedReport.period}</span>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="flex items-center gap-3.5 p-3 bg-white border border-[#eef0f3] rounded-2xl shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-[#d97706] shrink-0 border border-amber-100/50">
                      <Tag className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Type</span>
                      <span className="text-xs font-extrabold text-gray-800 mt-0.5">{selectedReport.type}</span>
                    </div>
                  </div>

                  {/* Generated */}
                  <div className="flex items-center gap-3.5 p-3 bg-white border border-[#eef0f3] rounded-2xl shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0 border border-emerald-100/50">
                      <User className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Generated</span>
                      <span className="text-xs font-extrabold text-gray-800 mt-0.5">By Admin User</span>
                    </div>
                  </div>

                  {/* Data Points */}
                  <div className="flex items-center gap-3.5 p-3 bg-white border border-[#eef0f3] rounded-2xl shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 shrink-0 border border-blue-100/50">
                      <Layers className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Data Points</span>
                      <span className="text-xs font-extrabold text-gray-800 mt-0.5">{selectedReport.dataPoints}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex gap-3">
                    <button className="bg-[#df8a3c] hover:bg-[#c27c38] text-white rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 flex-1 transition-all active:scale-95 shadow-[0_4px_14px_rgba(223,138,60,0.25)]">
                      <FileText className="h-4 w-4 text-white" />
                      <span>Export PDF</span>
                    </button>

                    <button className="border-2 border-[#500c56] text-[#500c56] hover:bg-[#500c56]/5 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 flex-1 transition-all active:scale-95 shadow-sm bg-white">
                      <FileText className="h-4 w-4" />
                      <span>Export Excel</span>
                    </button>

                    <button
                      onClick={() => handleDeleteReport(selectedReport.id)}
                      className="border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl p-2.5 transition-all active:scale-95 shadow-sm shrink-0 bg-white"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium text-center pt-1">
                    All actions are permanently logged
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400 font-medium">
              Select a report from the list to review summary metrics, trend visualizations, data points, and perform document downloads.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
