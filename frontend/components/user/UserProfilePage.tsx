"use client";

import { useEffect, useState } from "react";
import api from "../../api/axios";
import ProfileEditModal from "./ProfileEditModal";
import ProfileCompanyDetails from "./ProfileCompanyDetails";
import ProfileCompletionCard from "./ProfileCompletionCard";
import ProfilePersonalInfo from "./ProfilePersonalInfo";
import ProfileSidePanel from "./ProfileSidePanel";
import UserProfileHero from "./UserProfileHero";
import type {
  BusinessProfileResponse,
  UserProfileData,
} from "./userDashboardData";
import { dashboardToast } from "../admin/AdminToast";

export default function UserProfilePage({ data }: { data: UserProfileData }) {
  const [profileData, setProfileData] = useState(data);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    api
      .get<BusinessProfileResponse>("/business-profile/")
      .then(({ data: response }) => {
        setProfileData((current) => ({
          ...current,
          user: response.user,
          company: response.company,
        }));
      })
      .catch(() => dashboardToast.error("Unable to load profile", "Please try again."));
  }, []);

  async function updatePersonalInfo(values: {
    name: string;
    email: string;
    phone: string;
    role: string;
    location: string;
    language: string;
  }) {
    const { data: response } = await api.patch<BusinessProfileResponse>(
      "/business-profile/",
      {
        full_name: values.name,
        email: values.email,
        phone: values.phone,
        user_role: values.role,
        location: values.location,
        language: values.language,
      },
    );
    setProfileData((current) => ({
      ...current,
      user: response.user,
      company: response.company,
    }));
    dashboardToast.success("Profile updated", "Your personal information was saved.");
  }

  async function updateFullProfile(formData: FormData) {
    const { data: response } = await api.patch<BusinessProfileResponse>(
      "/business-profile/",
      formData,
    );
    setProfileData((current) => ({
      ...current,
      user: response.user,
      company: response.company,
    }));
    dashboardToast.success("Profile updated", "Your profile changes were saved.");
  }

  return (
    <section className="mx-auto w-full min-w-0 max-w-7xl overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
      <UserProfileHero
        onEditProfile={() => setEditModalOpen(true)}
        user={profileData.user}
      />

      <div className="mt-5 grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid min-w-0 gap-5">
          <ProfileCompletionCard
            company={profileData.company}
            user={profileData.user}
          />
          <ProfilePersonalInfo
            onSave={updatePersonalInfo}
            user={profileData.user}
          />
          <ProfileCompanyDetails company={profileData.company} />
        </div>
        <ProfileSidePanel
          data={{
            security: profileData.security,
            notificationPreferences: profileData.notificationPreferences,
            recentActivity: profileData.recentActivity,
          }}
        />
      </div>
      <ProfileEditModal
        onClose={() => setEditModalOpen(false)}
        onSave={updateFullProfile}
        open={editModalOpen}
        company={profileData.company}
        user={profileData.user}
      />
    </section>
  );
}
