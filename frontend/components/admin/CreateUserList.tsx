// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Languages,
  MapPin,
  Pencil,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  UserRound,
} from "lucide-react";
import api from "../../api/axios";

function formatDate(value) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusPill({ active }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black ${active ? "bg-[#e7fff4] text-[#10a66a]" : "bg-[#edf0f4] text-[#8a94a3]"}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function getUserRoleLabel(user) {
  if (user.role === "ADMIN") return "Admin";
  if (user.role === "BUSINESS" && user.role_type === "GUEST") return "Guest";
  if (user.role === "BUSINESS") return "Business User";
  return user.role_obj?.role_name || "Internal Staff";
}

function StatCard({ item }) {
  const tone = {
    purple: "bg-[#fbf2ff] text-[#65096c]",
    green: "bg-[#e9fff5] text-[#10a66a]",
    red: "bg-[#fff0ee] text-[#ff5d57]",
  }[item.tone];

  return (
    <article className="flex h-[70px] items-center gap-4 rounded-[13px] border border-[#eef0f4] bg-white px-5 shadow-[0_12px_28px_rgba(35,23,42,0.04)]">
      <span className={`flex size-9 items-center justify-center rounded-[10px] ${tone}`}>
        <UserRound className="size-4" />
      </span>
      <span>
        <span className="block text-[11px] font-semibold text-[#9ba4b1]">{item.label}</span>
        <span className="block text-[16px] font-black leading-5 text-[#151924]">{item.value}</span>
      </span>
    </article>
  );
}

function FilterButton({ children, icon: Icon, value, onChange, options }) {
  return (
    <label className="relative block">
      {Icon ? <Icon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#667085]" /> : null}
      <select
        className={`h-10 appearance-none rounded-[9px] border border-[#eceff4] bg-white px-4 pr-9 text-[12px] font-bold text-[#667085] shadow-sm outline-none ${Icon ? "pl-9" : ""}`}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">{children}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-[#a5adba]" />
    </label>
  );
}

export default function CreateUserList() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = () => {
    setIsLoading(true);
    setError("");
    api.get("/accounts/admin-users/", {
      params: {
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      },
    })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data.results || [];
        setUsers(list);
        setPage(1);
        setSelectedId((current) => current && list.some((user) => user.id === current) ? current : list[0]?.id || null);
      })
      .catch(() => setError("Unable to load users."))
      .finally(() => setIsLoading(false));
  };

  const handleArchiveUser = async (id) => {
    if (!id) return;
    setError("");
    try {
      await api.delete(`/accounts/admin-users/${id}/`);
      loadUsers();
    } catch {
      setError("Unable to archive this user.");
    }
  };

  const handleToggleStatus = async (user) => {
    if (!user) return;
    const userRole = user.role === "ADMIN"
      ? "ADMIN"
      : user.role === "BUSINESS"
        ? "BUSINESS"
        : user.role_obj?.id
          ? `ROLE:${user.role_obj.id}`
          : "";
    if (!userRole) {
      setError("Unable to update this user because the role is missing.");
      return;
    }
    const payload = new FormData();
    payload.append("full_name", user.full_name || "");
    payload.append("email", user.email || "");
    payload.append("username", user.username || "");
    payload.append("phone", user.phone || "");
    payload.append("user_role", userRole);
    payload.append("location", user.location || "");
    payload.append("is_active", user.is_active ? "false" : "true");
    try {
      await api.patch(`/accounts/admin-users/${user.id}/`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      loadUsers();
    } catch {
      setError("Unable to change this user status.");
    }
  };

  useEffect(() => {
    api.get("/accounts/roles/")
      .then(({ data }) => setRoles(Array.isArray(data) ? data : data.results || []))
      .catch(() => setRoles([]));
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadUsers, 250);
    return () => clearTimeout(timer);
  }, [search, roleFilter, statusFilter]);

  const selectedUser = users.find((user) => user.id === selectedId) || null;
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
  const pageStart = (page - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, users.length);
  const paginatedUsers = users.slice(pageStart, pageEnd);
  const paginationItems = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);
    if (page <= 3) return [1, 2, 3, "ellipsis", totalPages];
    if (page >= totalPages - 2) return [1, "ellipsis", totalPages - 2, totalPages - 1, totalPages];
    return [1, "ellipsis-start", page, "ellipsis-end", totalPages];
  }, [page, totalPages]);
  const changePage = (nextPage) => {
    const boundedPage = Math.min(totalPages, Math.max(1, nextPage));
    setPage(boundedPage);
    const firstUser = users[(boundedPage - 1) * pageSize];
    if (firstUser) setSelectedId(firstUser.id);
  };
  const stats = useMemo(() => {
    const active = users.filter((user) => user.is_active).length;
    return [
      { label: "Total Users", value: String(users.length), tone: "purple" },
      { label: "Active", value: String(active), tone: "green" },
      { label: "Inactive", value: String(users.length - active), tone: "red" },
    ];
  }, [users]);

  return (
    <section className="w-full px-5 pb-8 pt-1 sm:px-7 lg:px-8">
      <div className="mx-auto w-full max-w-[1170px] space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((item) => <StatCard item={item} key={item.label} />)}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
          <label className="relative block w-full lg:w-[250px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#a5adba]" />
            <input
              className="h-10 w-full rounded-[9px] border border-[#eceff4] bg-white pl-11 pr-4 text-[12px] font-medium outline-none placeholder:text-[#a5adba] focus:border-[#65096c] focus:ring-4 focus:ring-[#65096c]/10"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users..."
              type="search"
              value={search}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <FilterButton icon={SlidersHorizontal} onChange={setRoleFilter} options={[{ label: "Admin", value: "ADMIN" }, { label: "Business User", value: "BUSINESS" }, { label: "Guest", value: "GUEST" }, ...roles.map((role) => ({ label: role.role_name, value: role.id }))]} value={roleFilter}>Role</FilterButton>
            <FilterButton onChange={setStatusFilter} options={[{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }]} value={statusFilter}>Status</FilterButton>
            <button className="flex h-10 items-center gap-2 rounded-[9px] bg-[#65096c] px-6 text-[12px] font-black text-white shadow-[0_12px_24px_rgba(101,9,108,0.24)] transition hover:bg-[#7b1284]" onClick={() => router.push("/admin/users/add")} type="button">
              <Plus className="size-4" /> Add User
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
          <div className="min-w-0 self-start rounded-[14px] border border-[#eef0f4] bg-white p-4 shadow-[0_14px_34px_rgba(35,23,42,0.05)] sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-[15px] font-black text-[#151924]">
                User List <span className="ml-2 rounded-full bg-[#fbecfb] px-2 py-1 text-[10px] font-black text-[#65096c]">{users.length} total</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                <button className="flex h-8 items-center gap-2 rounded-[7px] border border-[#e7eaf0] px-3 text-[10px] font-black text-[#7b8493]" type="button"><Download className="size-3" /> Export</button>
                <button className="h-8 rounded-[7px] bg-[#65096c] px-4 text-[10px] font-black text-white" onClick={() => setStatusFilter("")} type="button">All</button>
                <button className="h-8 rounded-[7px] px-4 text-[10px] font-black text-[#7b8493]" onClick={() => setStatusFilter("active")} type="button">Active</button>
                <button className="h-8 rounded-[7px] px-4 text-[10px] font-black text-[#7b8493]" onClick={() => setStatusFilter("inactive")} type="button">Review</button>
              </div>
            </div>

            {error ? <div className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-xs font-bold text-red-700">{error}</div> : null}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-separate border-spacing-y-0 text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-[0.03em] text-[#a5adba]">
                    <th className="w-10 px-2 py-3"></th>
                    <th className="px-2 py-3">User ID</th>
                    <th className="px-2 py-3">Name</th>
                    <th className="px-2 py-3">Status</th>
                    <th className="px-2 py-3">Email</th>
                    <th className="px-2 py-3">Role</th>
                    <th className="px-2 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td className="border-t border-[#f0f2f5] px-2 py-16 text-center text-sm font-bold text-[#9aa3b1]" colSpan={7}>Loading users...</td></tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td className="border-t border-[#f0f2f5] px-2 py-16 text-center" colSpan={7}>
                        <div className="mx-auto flex max-w-[260px] flex-col items-center gap-3">
                          <span className="flex size-12 items-center justify-center rounded-full bg-[#fbecfb] text-[#65096c]"><UserRound className="size-5" /></span>
                          <div><p className="text-sm font-black text-[#394150]">No users found</p><p className="mt-1 text-xs font-medium text-[#9aa3b1]">Created users will appear here.</p></div>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedUsers.map((user) => (
                    <tr className="text-[12px] font-semibold text-[#5f6877]" key={user.id}>
                      <td className="border-t border-[#f0f2f5] px-2 py-4"><button aria-label={`Select ${user.full_name}`} className={`inline-flex size-5 items-center justify-center rounded-[5px] border transition ${selectedId === user.id ? "border-[#65096c] bg-[#65096c] text-white" : "border-[#dce1e8] bg-white text-transparent"}`} onClick={() => setSelectedId(user.id)} type="button"><Check className="size-3.5 stroke-[3]" /></button></td>
                      <td className="border-t border-[#f0f2f5] px-2 py-4 font-black text-[#65096c]">{user.user_id || user.id}</td>
                      <td className="border-t border-[#f0f2f5] px-2 py-4 font-black text-[#394150]">{user.full_name}</td>
                      <td className="border-t border-[#f0f2f5] px-2 py-4"><StatusPill active={user.is_active} /></td>
                      <td className="border-t border-[#f0f2f5] px-2 py-4">{user.email}</td>
                      <td className="border-t border-[#f0f2f5] px-2 py-4">{getUserRoleLabel(user)}</td>
                      <td className="border-t border-[#f0f2f5] px-2 py-4 text-center"><button className={`inline-flex size-7 items-center justify-center rounded-full ${selectedId === user.id ? "bg-[#65096c] text-white" : "bg-[#f5f7fa] text-[#9aa3b1]"}`} onClick={() => setSelectedId(user.id)} type="button"><Eye className="size-3.5" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col gap-3 text-[11px] font-medium text-[#9aa3b1] sm:flex-row sm:items-center sm:justify-between">
              <span>Showing <strong className="text-[#667085]">{users.length ? pageStart + 1 : 0}-{pageEnd}</strong> of <strong className="text-[#667085]">{users.length}</strong> businesses</span>
              <div className="flex items-center gap-2">
                <button aria-label="Previous page" className="inline-flex size-8 items-center justify-center rounded-[8px] border border-[#e7eaf0] bg-white text-[#98a2b3] transition hover:border-[#65096c] hover:text-[#65096c] disabled:cursor-not-allowed disabled:opacity-40" disabled={page === 1} onClick={() => changePage(page - 1)} type="button"><ChevronLeft className="size-4" /></button>
                {paginationItems.map((item) => typeof item === "number" ? (
                  <button className={`inline-flex size-8 items-center justify-center rounded-[8px] text-[11px] font-black transition ${page === item ? "bg-[#65096c] text-white shadow-[0_8px_18px_rgba(101,9,108,0.22)]" : "border border-[#e7eaf0] bg-white text-[#98a2b3] hover:border-[#65096c] hover:text-[#65096c]"}`} key={item} onClick={() => changePage(item)} type="button">{item}</button>
                ) : <span className="px-0.5 text-[#98a2b3]" key={item}>...</span>)}
                <button aria-label="Next page" className="inline-flex size-8 items-center justify-center rounded-[8px] border border-[#e7eaf0] bg-white text-[#98a2b3] transition hover:border-[#65096c] hover:text-[#65096c] disabled:cursor-not-allowed disabled:opacity-40" disabled={page === totalPages} onClick={() => changePage(page + 1)} type="button"><ChevronRight className="size-4" /></button>
              </div>
            </div>
          </div>

          <aside className="overflow-hidden rounded-[14px] border border-[#eef0f4] bg-white shadow-[0_14px_34px_rgba(35,23,42,0.05)]">
            <div className="flex items-start justify-between bg-[#65096c] px-5 py-4 text-white">
              <div>
                <p className="text-[10px] font-medium text-white/70">Selected User</p>
                <h3 className="text-[14px] font-black">{selectedUser ? `User ID - ${selectedUser.user_id || selectedUser.id}` : "No user selected"}</h3>
              </div>
              {selectedUser ? <StatusPill active={selectedUser.is_active} /> : null}
            </div>

            {selectedUser ? (
              <div className="p-5">
                <div className="flex h-[300px] items-center justify-center overflow-hidden rounded-[12px] bg-gradient-to-b from-[#f7f1f8] to-[#d7b7d9]">
                  {selectedUser.photo_url ? <img alt={selectedUser.full_name} className="h-full w-full object-cover object-center" src={selectedUser.photo_url} /> : <UserRound className="size-16 text-[#65096c]" />}
                </div>
                <div className="mt-4"><h4 className="text-[14px] font-black text-[#1f2630]">{selectedUser.full_name}</h4><p className="mt-1 text-[11px] font-bold text-[#65096c]">{getUserRoleLabel(selectedUser)}</p><p className="mt-1 text-[11px] font-medium text-[#9aa3b1]">{selectedUser.username}</p></div>
                <div className="mt-5 border-l-4 border-[#65096c] pl-4">
                  <h5 className="text-[12px] font-black text-[#1f2630]">Contact Information</h5>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between gap-3 rounded-[9px] bg-[#fbf7fc] px-3 py-3"><span className="flex items-center gap-2 text-[11px] font-bold text-[#8b5f91]"><Phone className="size-3.5 text-[#65096c]" /> Phone</span><span className="text-[11px] font-black text-[#1f2630]">{selectedUser.phone || "-"}</span></div>
                    <div className="flex items-center justify-between gap-3 rounded-[9px] bg-[#fbf7fc] px-3 py-3"><span className="flex items-center gap-2 text-[11px] font-bold text-[#8b5f91]"><Mail className="size-3.5 text-[#65096c]" /> Email</span><span className="text-[11px] font-black text-[#1f2630]">{selectedUser.email}</span></div>
                    {selectedUser.role === "BUSINESS" ? (
                      <>
                        <div className="flex items-center justify-between gap-3 rounded-[9px] bg-[#fbf7fc] px-3 py-3"><span className="flex items-center gap-2 text-[11px] font-bold text-[#8b5f91]"><MapPin className="size-3.5 text-[#65096c]" /> Place</span><span className="text-right text-[11px] font-black text-[#1f2630]">{selectedUser.location || "-"}</span></div>
                        <div className="flex items-center justify-between gap-3 rounded-[9px] bg-[#fbf7fc] px-3 py-3"><span className="flex items-center gap-2 text-[11px] font-bold text-[#8b5f91]"><Languages className="size-3.5 text-[#65096c]" /> Language</span><span className="text-right text-[11px] font-black text-[#1f2630]">{selectedUser.language || "-"}</span></div>
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="mt-10 rounded-[9px] bg-[#fbf7fc] px-3 py-3 text-[11px] font-bold text-[#8b5f91]"><span className="flex items-center gap-2"><CalendarDays className="size-3.5 text-[#65096c]" /> Date Added <strong className="ml-auto text-[#1f2630]">{formatDate(selectedUser.date_joined)}</strong></span></div>

                <div className="mt-8 grid grid-cols-[1fr_1fr_42px] gap-3">
                  <button className="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#e39b4d] text-[12px] font-black text-white shadow-[0_12px_22px_rgba(227,155,77,0.28)] transition hover:bg-[#d88c39]" onClick={() => router.push(`/admin/users/edit/${selectedUser.id}`)} type="button">
                    <Pencil className="size-3.5" /> Edit
                  </button>
                  <button className="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#e39b4d] text-[12px] font-black text-white shadow-[0_12px_22px_rgba(227,155,77,0.28)] transition hover:bg-[#d88c39]" onClick={() => handleToggleStatus(selectedUser)} type="button">
                    <RefreshCw className="size-3.5" /> Change Status
                  </button>
                  <button className="flex h-11 items-center justify-center rounded-[10px] border border-[#ffb8b4] bg-white text-[#ff5d57] transition hover:bg-[#fff0ee]" onClick={() => handleArchiveUser(selectedUser.id)} type="button">
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <p className="mt-4 text-center text-[10px] font-medium text-[#c1c7d0]">All actions are permanently logged</p>
              </div>
            ) : (
              <div className="flex min-h-[430px] flex-col items-center justify-center p-6 text-center"><span className="flex size-16 items-center justify-center rounded-full bg-[#fbecfb] text-[#65096c]"><UserRound className="size-7" /></span><h4 className="mt-5 text-[15px] font-black text-[#1f2630]">Select a user</h4><p className="mt-2 max-w-[220px] text-xs font-medium leading-5 text-[#9aa3b1]">User details and contact information will appear here after selecting a row.</p></div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
