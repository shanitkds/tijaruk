"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  CircleUserRound,
  FileText,
  UserPlus,
} from "lucide-react";
import api from "../../api/axios";
import {
  getAuthSession,
  type AuthUser,
} from "../../lib/auth";
import BecomeBusinessUserModal from "./BecomeBusinessUserModal";
import Navbar from "./Navbar";
import PublicProfileDetails from "./PublicProfileDetails";
import type { PublicProfileValues } from "./PublicProfileDetails";
import PublicProfileRfqs from "./PublicProfileRfqs";

type AccountProfile = {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  role_type?: string;
  photo_url: string;
  phone?: string;
};

type BusinessProfile = {
  user?: {
    name?: string;
    username?: string;
    role?: string;
    company?: string;
    email?: string;
    phone?: string;
    avatar?: string;
  };
  company?: {
    contactPerson?: string;
    email?: string;
    phone?: string;
  };
};

export default function PublicProfilePage() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);
  const [account, setAccount] = useState<AccountProfile | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [isBecomeUserModalOpen, setIsBecomeUserModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"profile" | "rfq">("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    setSessionUser(session.user);

    api
      .get<AccountProfile>("/accounts/me/")
      .then(({ data }) => setAccount(data))
      .catch(() => setAccount(null));

    api
      .get<BusinessProfile>("/business-profile/")
      .then(({ data }) => setBusinessProfile(data))
      .catch(() => setBusinessProfile(null));
  }, [router]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [photoFile]);

  const profile = useMemo(() => {
    const user = businessProfile?.user;
    const company = businessProfile?.company;
    const name =
      user?.name ||
      account?.name ||
      sessionUser?.full_name ||
      sessionUser?.username ||
      "User";
    const email = user?.email || account?.email || sessionUser?.email || "";
    const phone = user?.phone || account?.phone || company?.phone || "";

    return {
      name,
      email,
      phone,
      role: user?.role || account?.role_type || sessionUser?.role_type || "Guest",
      avatar: photoPreview || user?.avatar || account?.photo_url || sessionUser?.photo || "",
      initial: name.trim().charAt(0).toUpperCase() || "U",
    };
  }, [account, businessProfile, photoPreview, sessionUser]);

  async function saveProfile(values: PublicProfileValues) {
    if (!values.name.trim() || !values.email.trim()) {
      setProfileError("Full name and email address are required.");
      return;
    }

    setIsSavingProfile(true);
    setProfileError("");

    try {
      const isBusinessUser = account?.role?.toUpperCase() === "BUSINESS" || Boolean(businessProfile);
      const payload = new FormData();
      payload.append(isBusinessUser ? "full_name" : "name", values.name.trim());
      payload.append("email", values.email.trim());
      payload.append("phone", values.phone.trim());
      if (photoFile) payload.append("photo", photoFile);

      if (isBusinessUser) {
        const { data } = await api.patch<BusinessProfile>("/business-profile/", payload);
        setBusinessProfile(data);
      } else {
        const { data } = await api.patch<AccountProfile>("/accounts/me/", payload);
        setAccount(data);
      }

      setPhotoFile(null);
      setIsEditingProfile(false);
    } catch (error: any) {
      const responseData = error?.response?.data;
      const firstMessage = responseData && typeof responseData === "object"
        ? Object.values(responseData).flat().find((message) => typeof message === "string")
        : null;
      setProfileError(
        typeof firstMessage === "string" ? firstMessage : "Unable to save profile changes.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  function cancelProfileEdit() {
    setPhotoFile(null);
    setProfileError("");
    setIsEditingProfile(false);
  }

  return (
    <main className="min-h-screen bg-[#f4f4f4] font-['Poppins',sans-serif] text-[#111827]">
      <Navbar />
      <section className="mx-auto flex w-[94%] max-w-6xl flex-col gap-[3%] py-[3%] md:flex-row md:items-start">
        <aside className="w-full rounded-2xl border border-[#dedede] bg-white p-[3%] shadow-sm md:w-[22%]">
          <div className="flex flex-col items-center text-center">
            <div className="relative aspect-square w-1/2 md:w-[58%]">
              <div className="flex size-full items-center justify-center overflow-hidden rounded-full border-4 border-[#dfb373] bg-[#f3e8f4] text-5xl font-bold text-[#65096c]">
                {profile.avatar ? (
                  <img
                    alt={`${profile.name} profile`}
                    className="size-full object-cover"
                    src={profile.avatar}
                  />
                ) : (
                  profile.initial
                )}
              </div>
              <button
                aria-label="Change profile image"
                className="absolute bottom-[2%] right-[2%] z-10 flex aspect-square w-[25%] items-center justify-center rounded-full bg-[#276a5f] text-white ring-2 ring-white transition hover:bg-[#1f574f]"
                onClick={() => photoInputRef.current?.click()}
                type="button"
              >
                <Camera className="h-auto w-[48%]" />
              </button>
              <input
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    setPhotoFile(file);
                    setIsEditingProfile(true);
                    setActiveSection("profile");
                  }
                  event.target.value = "";
                }}
                ref={photoInputRef}
                type="file"
              />
            </div>
            <h1 className="mt-5 text-lg font-bold text-[#171717]">{profile.name}</h1>
            <p className="mt-1 max-w-full truncate text-sm text-[#7b7f87]">
              {profile.email}
            </p>
          </div>

          <nav className="mt-[15%] space-y-2 text-sm font-semibold">
            <button
              className={`flex h-12 w-full items-center gap-[8%] rounded-lg px-[8%] text-left transition ${activeSection === "profile" ? "bg-[#65096c] text-white" : "text-[#65096c] hover:bg-[#faf2fb]"}`}
              onClick={() => setActiveSection("profile")}
              type="button"
            >
              <CircleUserRound className="size-5" />
              My Profile
            </button>
            <button
              className={`flex h-12 w-full items-center gap-[8%] rounded-lg px-[8%] text-left transition ${activeSection === "rfq" ? "bg-[#65096c] text-white" : "text-[#65096c] hover:bg-[#faf2fb]"}`}
              onClick={() => setActiveSection("rfq")}
              type="button"
            >
              <FileText className="size-5" />
              RFQ
            </button>
          </nav>
        </aside>

        <div className="w-full space-y-5 md:w-[75%]">
          <section className="flex flex-col gap-[3%] rounded-2xl border border-[#e1e1e1] bg-white p-[3%] shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-[#a3a3a3]">
                Full Name
              </p>
              <p className="mt-1 truncate text-base text-[#171717]">{profile.name}</p>
            </div>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#65096c] px-6 text-sm font-bold text-white transition hover:bg-[#520858]"
              onClick={() => setIsBecomeUserModalOpen(true)}
              type="button"
            >
              <UserPlus className="size-4" />
              Become a User
            </button>
          </section>

          {activeSection === "profile" ? (
            <PublicProfileDetails
              error={profileError}
              isEditing={isEditingProfile}
              isSaving={isSavingProfile}
              onCancel={cancelProfileEdit}
              onEdit={() => {
                setProfileError("");
                setIsEditingProfile(true);
              }}
              onSave={saveProfile}
              profile={profile}
            />
          ) : (
            <PublicProfileRfqs />
          )}
        </div>
      </section>

      <BecomeBusinessUserModal
        isOpen={isBecomeUserModalOpen}
        onClose={() => setIsBecomeUserModalOpen(false)}
        onSuccess={() => {
          setIsBecomeUserModalOpen(false);
          router.push("/user");
        }}
      />
    </main>
  );
}
