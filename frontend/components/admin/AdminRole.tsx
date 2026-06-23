// @ts-nocheck
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { IoSaveSharp } from "react-icons/io5";
import {
  BarChart3,
  ChevronRight,
  ChevronDown,
  Crown,
  Download,
  Plus,
  Search,
  Shield,
  ShoppingCart,
  UserCheck,
  UserMinus,
  Users,
} from "lucide-react";
import api from "../../api/axios";
import { getAuthSession } from "../../lib/auth";
import NotificationMenu from "../notifications/NotificationMenu";

const roles = [
  {
    name: "Super Admin",
    description: "Full platform access",
    type: "System",
    assigned: "3 admins",
    access: "Full Access",
    status: "Active",
    icon: Crown,
    accessClass: "text-[#991b1b]",
  },
  {
    name: "Order Manager",
    description: "Manage orders and fulfillment",
    type: "Custom",
    assigned: "8 admins",
    access: "Limited",
    status: "Active",
    icon: ShoppingCart,
    accessClass: "text-[#92400e]",
  },
  {
    name: "Reports Viewer",
    description: "Read-only access to analytics",
    type: "Custom",
    assigned: "6 admins",
    access: "View Only",
    status: "Active",
    icon: BarChart3,
    accessClass: "text-[#111827]",
  },
];

const stats = [
  { label: "Total Roles", value: "1", icon: Users },
  { label: "Active Members", value: "1", icon: UserCheck },
  { label: "Inactive Members", value: "0", icon: UserMinus },
  { label: "Admin Roles", value: "2", icon: Shield },
];

const permissionRows = [
  { label: "Dashboard", value: "dashboard", permissions: ["View"] },
  { label: "RFQs", value: "rfqs", permissions: ["View", "Create", "Edit"] },
  { label: "Products", value: "products", permissions: ["View", "Edit", "Export"] },
  { label: "Users", value: "users", permissions: ["View", "Create", "Edit"] },
  { label: "Reports", value: "reports", permissions: ["View", "Create", "Edit", "Delete", "Approve", "Full"] },
  { label: "Messages", value: "messages", permissions: ["View", "Create", "Edit", "Approve"] },
  { label: "Suppliers", value: "suppliers", permissions: ["View"] },
];

const permissionColumns = ["View", "Create", "Edit", "Delete", "Approve", "Export", "Full"];
const permissionFieldByColumn = {
  View: "can_view",
  Create: "can_create",
  Edit: "can_edit",
  Delete: "can_delete",
  Approve: "can_approve",
  Export: "can_export",
  Full: "full_access",
};

function StatCard({ item }) {
  const Icon = item.icon;

  return (
    <article className="relative h-full min-h-[148px] overflow-hidden rounded-[20px] bg-[#5f0c66] p-5 text-white shadow-[0_4px_20px_rgba(95,12,102,0.14)]">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5 blur-[20px]" />
      <div className="relative flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-white/80">{item.label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-[#e39b4d]">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="relative mt-7 text-3xl font-bold leading-none">{item.value}</p>
    </article>
  );
}

function AdminRoleHeader({ actionLabel = "" }: { actionLabel?: string }) {
  const router = useRouter();
  const hasActionCrumb = Boolean(actionLabel);
  const [adminProfile, setAdminProfile] = useState({ name: "Admin", photo: "" });

  useEffect(() => {
    const sessionUser = getAuthSession()?.user;
    if (sessionUser) {
      setAdminProfile({
        name: sessionUser.full_name || sessionUser.username || "Admin",
        photo: sessionUser.photo || "",
      });
    }

    api.get("/accounts/me/")
      .then(({ data }) => {
        setAdminProfile({
          name: data.name || data.full_name || data.email || "Admin",
          photo: data.photo_url || "",
        });
      })
      .catch(() => {});
  }, []);

  return (
    <header className="flex min-h-[70px] flex-wrap items-center justify-between gap-4 border-b border-[#e7e9ed] bg-white px-4 py-3 pl-16 sm:px-6 sm:pl-16 lg:px-8">
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-[#9aa1ad]">
          <button
            className={hasActionCrumb ? "transition hover:text-[#65096c]" : "font-bold text-[#65096c]"}
            disabled={!hasActionCrumb}
            onClick={() => router.push("/admin/admin-roles")}
            type="button"
          >
            Admin Roles
          </button>
          {hasActionCrumb ? (
            <>
              <ChevronRight className="size-3 text-[#c0c4cb]" />
              <span className="font-bold text-[#65096c]">{actionLabel}</span>
            </>
          ) : null}
        </div>
        <h1 className="text-[17px] font-black leading-tight text-[#65096c]">
          {actionLabel || "Admin Roles"}
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <label className="relative hidden w-[172px] sm:block md:w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]" />
          <input
            className="h-[38px] w-full rounded-xl border border-[#e7e9ed] bg-[#fafbfc] pl-9 pr-3 text-xs text-[#4b5563] outline-none placeholder:text-[#9ca3af] focus:border-[#65096c]/40 focus:ring-2 focus:ring-[#65096c]/10"
            placeholder="Search..."
            type="search"
          />
        </label>
        <NotificationMenu
          buttonClassName="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-[#eef0f3] bg-[#f8f9fa] text-[#8c9ba5] shadow-sm transition-colors hover:bg-gray-100/50 hover:text-gray-600"
          iconClassName="h-5 w-5"
        />
        <button
          aria-label="Open admin profile"
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-[#e39b4d] bg-[#f3e8f4] text-sm font-bold text-[#500c56] transition-transform duration-200 hover:scale-105 active:scale-95"
          onClick={() => router.push("/admin/settings")}
          type="button"
        >
          {adminProfile.photo ? (
            <img alt={adminProfile.name} className="size-full object-cover" src={adminProfile.photo} />
          ) : (
            adminProfile.name.trim().charAt(0).toUpperCase() || "A"
          )}
        </button>
      </div>
    </header>
  );
}

function SelectBox({ children, className = "" }) {
  return (
    <select
      className={`h-10 w-full min-w-0 max-w-full appearance-none rounded-lg border border-[#dfdfdf] bg-white px-3 pr-9 text-sm text-[#111827] outline-none transition focus:border-[#5f0c66] focus:ring-1 focus:ring-[#5f0c66]/20 ${className}`}
      defaultValue=""
    >
      {children}
    </select>
  );
}

function StatusPill({ children, tone = "green" }) {
  const styles =
    tone === "amber"
      ? "bg-[#fff3df] text-[#b45309]"
      : "bg-[#dff7eb] text-[#047857]";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

function FieldLabel({ children, required = false }) {
  return (
    <label className="text-sm font-semibold tracking-[-0.5px] text-[#5f0c66]">
      {children}
      {required && <span className="ml-1 text-[#9f8151]">*</span>}
    </label>
  );
}

function buildDefaultPermissions() {
  return permissionRows.map((row) => ({
    module: row.value,
    can_view: false,
    can_create: false,
    can_edit: false,
    can_delete: false,
    can_approve: false,
    can_export: false,
    full_access: false,
  }));
}

function toRoleForm(role) {
  if (!role) {
    return {
      role_name: "",
      access_level: "CUSTOM_ACCESS",
      role_status: true,
      permissions: buildDefaultPermissions(),
    };
  }

  const permissionsByModule = Object.fromEntries(
    (role.permissions || []).map((permission) => [permission.module, permission])
  );

  return {
    role_name: role.role_name,
    access_level: role.access_level,
    role_status: role.role_status,
    permissions: permissionRows.map((row) => ({
      ...buildDefaultPermissions().find((permission) => permission.module === row.value),
      ...permissionsByModule[row.value],
      module: row.value,
    })),
  };
}

function CreateRolePage({ editingRole, onCancel, onSave, saveError, isSaving }) {
  const [formData, setFormData] = useState(() => toRoleForm(editingRole));

  useEffect(() => {
    setFormData(toRoleForm(editingRole));
  }, [editingRole]);

  const updatePermission = (module, field, checked) => {
    setFormData((current) => {
      const permissions = current.permissions.map((permission) => {
        if (permission.module !== module) return permission;

        if (field === "full_access") {
          return {
            ...permission,
            can_view: checked,
            can_create: checked,
            can_edit: checked,
            can_delete: checked,
            can_approve: checked,
            can_export: checked,
            full_access: checked,
          };
        }

        const updatedPermission = { ...permission, [field]: checked };
        updatedPermission.full_access = [
          "can_view",
          "can_create",
          "can_edit",
          "can_delete",
          "can_approve",
          "can_export",
        ].every((permissionField) => updatedPermission[permissionField]);
        return updatedPermission;
      });

      return {
        ...current,
        access_level: permissions.every((permission) => permission.full_access)
          ? "FULL_ACCESS"
          : "CUSTOM_ACCESS",
        permissions,
      };
    });
  };

  const updateAccessLevel = (accessLevel) => {
    setFormData((current) => ({
      ...current,
      access_level: accessLevel,
      permissions:
        accessLevel === "FULL_ACCESS"
          ? current.permissions.map((permission) => ({
              ...permission,
              can_view: true,
              can_create: true,
              can_edit: true,
              can_delete: true,
              can_approve: true,
              can_export: true,
              full_access: true,
            }))
          : current.permissions,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(formData);
  };

  return (
    <form className="space-y-7" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-3xl text-sm leading-6 tracking-[-0.5px] text-[#5f0c66]/70 sm:text-base">
          Define a new admin role, configure permissions, and control platform access securely.
        </p>
        <div className="flex gap-3">
          {editingRole && (
            <button
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[#dfdfdf] bg-white px-5 text-sm font-medium text-[#5f0c66] transition hover:bg-[#f9fafb]"
              onClick={onCancel}
              type="button"
            >
              Cancel
            </button>
          )}
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#5f0c66] px-5 text-sm font-medium text-white transition hover:bg-[#74147c] disabled:cursor-not-allowed disabled:opacity-60 sm:w-[162px]"
            disabled={isSaving}
            type="submit"
          >
            <IoSaveSharp className="h-4 w-4" />
            {isSaving ? "Saving..." : "Changes Save"}
          </button>
        </div>
      </div>

      {saveError && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {saveError}
        </div>
      )}

      <section className="rounded-xl border border-[#dfdfdf] bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold tracking-[-0.5px] text-[#5f0c66]">
          Basic Role Information
        </h2>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel required>Role Name</FieldLabel>
            <input
              className="h-[50px] w-full rounded-lg border border-[#dfdfdf] bg-[rgba(235,225,207,0.3)] px-4 text-base tracking-[-0.5px] text-[#5f0c66] outline-none placeholder:text-[#5f0c66]/50 focus:border-[#5f0c66] focus:ring-1 focus:ring-[#5f0c66]/20"
              onChange={(event) =>
                setFormData((current) => ({ ...current, role_name: event.target.value }))
              }
              placeholder="e.g., Content Manager"
              required
              type="text"
              value={formData.role_name}
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>Access Level Summary</FieldLabel>
            <div className="relative">
              <select
                className="h-12 w-full appearance-none rounded-lg border border-[#dfdfdf] bg-[rgba(235,225,207,0.3)] px-3 pr-10 text-base tracking-[-0.5px] text-[#5f0c66] outline-none focus:border-[#5f0c66] focus:ring-1 focus:ring-[#5f0c66]/20"
                onChange={(event) => updateAccessLevel(event.target.value)}
                value={formData.access_level}
              >
                <option value="CUSTOM_ACCESS">Custom Access</option>
                <option value="FULL_ACCESS">Full Access</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5f0c66]" />
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel>Role Status</FieldLabel>
            <div className="relative">
              <select
                className="h-12 w-full appearance-none rounded-lg border border-[#dfdfdf] bg-[rgba(235,225,207,0.3)] px-3 pr-10 text-base tracking-[-0.5px] text-[#5f0c66] outline-none focus:border-[#5f0c66] focus:ring-1 focus:ring-[#5f0c66]/20"
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    role_status: event.target.value === "active",
                  }))
                }
                value={formData.role_status ? "active" : "inactive"}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5f0c66]" />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#dfdfdf] bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold tracking-[-0.5px] text-[#5f0c66]">
          Permissions Matrix
        </h2>
        <p className="mt-2 text-sm tracking-[-0.5px] text-[#5f0c66]/60">
          Configure granular access control for each module.
        </p>

        <div className="mt-7 overflow-x-auto">
          <table className="min-w-[920px] w-full text-center">
            <thead>
              <tr className="border-b-2 border-[#dfdfdf] text-sm text-[#5f0c66]">
                <th className="w-[270px] px-4 py-3 font-bold">Module</th>
                {permissionColumns.map((column) => (
                  <th
                    key={column}
                    className={`px-4 py-3 text-xs font-semibold ${column === "Full" ? "text-[#9f8151]" : ""}`}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dfdfdf]">
              {permissionRows.map((row) => (
                <tr key={row.value} className="text-sm font-medium tracking-[-0.5px] text-[#5f0c66]">
                  <td className="px-4 py-4">{row.label}</td>
                  {permissionColumns.map((column) => (
                    <td key={`${row.value}-${column}`} className="px-4 py-4">
                      <input
                        aria-label={`${row.label} ${column}`}
                        className="h-4 w-4 accent-[#0075ff]"
                        checked={
                          formData.permissions.find((permission) => permission.module === row.value)?.[
                            permissionFieldByColumn[column]
                          ] || false
                        }
                        onChange={(event) =>
                          updatePermission(
                            row.value,
                            permissionFieldByColumn[column],
                            event.target.checked
                          )
                        }
                        type="checkbox"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </form>
  );
}

export default function AdminRole({ initialAction }: { initialAction?: string }) {
  const router = useRouter();
  const isCreateMode = initialAction === "create";
  const [roleList, setRoleList] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadRoles = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const { data } = await api.get("/accounts/roles/");
      setRoleList(data);
      setSelectedRoleId((current) => current || data[0]?.id || null);
    } catch {
      setLoadError("Unable to load admin roles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const selectedRole = useMemo(
    () => roleList.find((role) => role.id === selectedRoleId) || roleList[0] || null,
    [roleList, selectedRoleId]
  );

  const handleSaveRole = async (payload) => {
    setIsSaving(true);
    setSaveError("");
    try {
      const { data } = editingRole
        ? await api.patch(`/accounts/roles/${editingRole.id}/`, payload)
        : await api.post("/accounts/roles/", payload);

      setRoleList((current) =>
        editingRole
          ? current.map((role) => (role.id === data.id ? data : role))
          : [data, ...current]
      );
      setSelectedRoleId(data.id);
      setEditingRole(null);
      if (isCreateMode) router.push("/admin/admin-roles");
    } catch (error) {
      const details = error?.response?.data;
      const message =
        typeof details === "string"
          ? details
          : details?.role_name?.[0] ||
            details?.permissions?.[0] ||
            details?.detail ||
            "Unable to save role. Please check the form and try again.";
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isCreateMode) {
    return (
      <div className="min-h-screen min-w-0 bg-[#f8f7fa]">
        <AdminRoleHeader actionLabel="Create Role" />
        <main className="w-full min-w-0 p-4 sm:p-5 md:p-6 lg:p-8">
          <CreateRolePage
            editingRole={null}
            isSaving={isSaving}
            onCancel={() => router.push("/admin/admin-roles")}
            onSave={handleSaveRole}
            saveError={saveError}
          />
        </main>
      </div>
    );
  }

  if (editingRole) {
    return (
      <div className="min-h-screen min-w-0 bg-[#f8f7fa]">
        <AdminRoleHeader actionLabel="Edit Role" />
        <main className="w-full min-w-0 p-4 sm:p-5 md:p-6 lg:p-8">
          <CreateRolePage
            editingRole={editingRole}
            isSaving={isSaving}
            onCancel={() => {
              setEditingRole(null);
              setSaveError("");
            }}
            onSave={handleSaveRole}
            saveError={saveError}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-0 bg-[#f8f7fa]">
      <AdminRoleHeader />
      <main className="w-full min-w-0 max-w-full space-y-6 overflow-x-hidden p-4 sm:p-5 md:p-6 lg:p-8">
      <section className="min-w-0 rounded-lg border border-[#dfdfdf] bg-white px-4 py-5 shadow-sm sm:px-6">
        <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="min-w-0 break-words text-2xl font-bold tracking-[-0.5px] text-[#5f0c66] sm:text-[30px]">
            Admin Roles & Permissions
          </h2>

          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block min-w-0 sm:w-[256px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
              <input
                className="h-[42px] w-full rounded-lg border border-[#dfdfdf] bg-white pl-10 pr-3 text-sm outline-none transition placeholder:text-black/50 focus:border-[#5f0c66] focus:ring-1 focus:ring-[#5f0c66]/20"
                placeholder="Search..."
                type="text"
              />
            </label>
            <button
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#5f0c66] px-5 text-sm font-medium text-white transition hover:bg-[#74147c]"
              onClick={() => router.push("/admin/admin-roles/create")}
              type="button"
            >
              <Plus className="h-4 w-4" />
              Create Role
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
        {[
          { ...stats[0], value: String(roleList.length) },
          { ...stats[1], value: String(roleList.filter((role) => role.role_status).length) },
          { ...stats[2], value: String(roleList.filter((role) => !role.role_status).length) },
          { ...stats[3], value: String(roleList.length) },
        ].map((item) => (
          <StatCard key={item.label} item={item} />
        ))}
      </section>

      <section className="grid w-full min-w-0 max-w-full items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(260px,0.72fr)] xl:grid-cols-[minmax(0,2fr)_minmax(280px,0.72fr)]">
        <div className="w-full min-w-0 max-w-full space-y-5 overflow-hidden">
          <div className="w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-[#dfdfdf] bg-white p-4 shadow-sm sm:p-6">
            <div className="flex w-full min-w-0 max-w-full flex-col gap-3 lg:flex-row lg:items-center">
              <input
                className="h-[42px] w-full min-w-0 max-w-full rounded-lg border border-[#dfdfdf] bg-white px-4 text-sm outline-none transition placeholder:text-black/50 focus:border-[#5f0c66] focus:ring-1 focus:ring-[#5f0c66]/20 lg:flex-1"
                placeholder="Search roles..."
                type="text"
              />
              <SelectBox className="lg:w-[159px] lg:shrink-0">
                <option value="">All Roles</option>
                <option>System</option>
                <option>Custom</option>
              </SelectBox>
              <SelectBox className="lg:w-[113px] lg:shrink-0">
                <option value="">Active</option>
                <option>Inactive</option>
              </SelectBox>
              <button className="inline-flex h-10 w-full min-w-0 max-w-full items-center justify-center gap-2 rounded-lg bg-[#dfdfdf] px-4 text-sm font-medium text-[#374151] transition hover:bg-[#d3d3d3] lg:w-[105px] lg:shrink-0">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          <div className="min-w-0 overflow-hidden rounded-lg border border-[#dfdfdf] bg-white shadow-sm">
            <div className="border-b border-[#dfdfdf] px-6 py-5">
              <h3 className="text-lg font-semibold text-[#0a4833]">Admin Roles</h3>
            </div>

            {loadError && (
              <div className="border-b border-red-100 bg-red-50 px-6 py-3 text-sm font-medium text-red-700">
                {loadError}
              </div>
            )}

            <div className="block divide-y divide-[#edf0f2] lg:hidden">
              {isLoading && (
                <div className="px-5 py-8 text-center text-sm text-[#6b7280]">
                  Loading roles...
                </div>
              )}
              {!isLoading && roleList.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-[#6b7280]">
                  No roles found.
                </div>
              )}
              {!isLoading && roleList.map((role, index) => {
                const Icon = [Crown, ShoppingCart, BarChart3][index] || Shield;
                const accessLabel = role.access_level_display || role.access_level;

                return (
                  <button
                    key={role.id}
                    className={`block min-w-0 w-full px-4 py-4 text-left transition sm:px-5 ${
                      selectedRole?.id === role.id ? "bg-[#faf5ff]" : "bg-white"
                    }`}
                    onClick={() => setSelectedRoleId(role.id)}
                    type="button"
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#5f0c66]" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#111827]">
                          {role.role_name}
                        </p>
                        <p className="mt-0.5 text-xs text-[#6b7280]">
                          {accessLabel === "Full Access" ? "Full platform access" : "Custom platform access"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid min-w-0 grid-cols-1 gap-2 text-xs min-[380px]:grid-cols-2">
                      <div className="min-w-0 rounded-lg bg-[#f9fafb] px-3 py-2">
                        <p className="text-[#6b7280]">Type</p>
                        <p className="break-words font-medium text-[#111827]">
                          {role.access_level === "FULL_ACCESS" ? "System" : "Custom"}
                        </p>
                      </div>
                      <div className="min-w-0 rounded-lg bg-[#f9fafb] px-3 py-2">
                        <p className="text-[#6b7280]">Assigned</p>
                        <p className="break-words font-medium text-[#111827]">
                          {role.assigned_staff_count} admins
                        </p>
                      </div>
                      <div className="min-w-0 rounded-lg bg-[#f9fafb] px-3 py-2">
                        <p className="text-[#6b7280]">Access</p>
                        <p className="break-words font-medium text-[#111827]">{accessLabel}</p>
                      </div>
                      <div className="min-w-0 rounded-lg bg-[#f9fafb] px-3 py-2">
                        <p className="text-[#6b7280]">Status</p>
                        <p className={`break-words font-medium ${role.role_status ? "text-[#166534]" : "text-[#991b1b]"}`}>
                          {role.role_status ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-[640px] w-full text-left">
                <thead className="bg-[#f9fafb] text-xs font-medium tracking-[0.1px] text-[#6b7280]">
                  <tr>
                    <th className="px-6 py-4 text-center">Role</th>
                    <th className="px-4 py-4 text-center">Type</th>
                    <th className="px-4 py-4 text-center">Assigned</th>
                    <th className="px-4 py-4 text-center">Access<br />Level</th>
                    <th className="px-4 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf0f2] text-sm">
                  {isLoading && (
                    <tr>
                      <td className="px-6 py-8 text-center text-[#6b7280]" colSpan={5}>
                        Loading roles...
                      </td>
                    </tr>
                  )}
                  {!isLoading && roleList.length === 0 && (
                    <tr>
                      <td className="px-6 py-8 text-center text-[#6b7280]" colSpan={5}>
                        No roles found.
                      </td>
                    </tr>
                  )}
                  {!isLoading && roleList.map((role, index) => {
                    const Icon = [Crown, ShoppingCart, BarChart3][index] || Shield;
                    const accessLabel = role.access_level_display || role.access_level;

                    return (
                      <tr
                        key={role.id}
                        className={`cursor-pointer bg-white transition hover:bg-[#fafafa] ${
                          selectedRole?.id === role.id ? "bg-[#faf5ff]" : ""
                        }`}
                        onClick={() => setSelectedRoleId(role.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4 shrink-0 text-[#5f0c66]" />
                            <div>
                              <p className="font-medium text-[#111827]">{role.role_name}</p>
                              <p className="text-xs text-[#6b7280]">
                                {accessLabel === "Full Access" ? "Full platform access" : "Custom platform access"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              role.access_level === "FULL_ACCESS"
                                ? "bg-[#5f0c66] text-white"
                                : "bg-[#f3f4f6] text-[#374151]"
                            }`}
                          >
                            {role.access_level === "FULL_ACCESS" ? "System" : "Custom"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center text-[#111827]">
                          {role.assigned_staff_count} admins
                        </td>
                        <td className="px-4 py-4 text-center text-xs font-medium text-[#111827]">
                          {accessLabel}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`text-xs font-medium ${role.role_status ? "text-[#166534]" : "text-[#991b1b]"}`}>
                            {role.role_status ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="min-w-0 rounded-lg border border-[#dfdfdf] bg-white p-5 shadow-sm sm:p-6 lg:min-h-[223px]">
          <h3 className="text-base font-semibold text-[#0a4833]">Role Details</h3>
          {selectedRole ? (
            <div className="mt-4 space-y-4 text-sm text-[#111827]">
              <div>
                <p className="mb-2 break-words text-xs text-[#6b7280]">{selectedRole.role_name}</p>
                <div className="flex flex-wrap gap-2">
                  <StatusPill>{selectedRole.role_status ? "Active" : "Inactive"}</StatusPill>
                  <StatusPill tone="amber">
                    {selectedRole.access_level === "FULL_ACCESS" ? "Full" : "Medium"}
                  </StatusPill>
                </div>
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-medium">Assigned Staffs</p>
                <p>Assigned {selectedRole.assigned_staff_count} Staffs</p>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-[#6b7280]">Last Updated</p>
                <p>{new Date(selectedRole.updated_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}</p>
              </div>
              <button
                className="h-11 w-full rounded-lg bg-[#5f0c66] text-sm font-medium text-white transition hover:bg-[#74147c]"
                onClick={() => setEditingRole(selectedRole)}
                type="button"
              >
                Edit Role
              </button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#6b7280]">Select a role to view details.</p>
          )}
        </aside>
      </section>
      </main>
    </div>
  );
}
