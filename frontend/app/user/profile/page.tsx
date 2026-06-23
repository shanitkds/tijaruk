import UserProfilePage from "../../../components/user/UserProfilePage";
import { getUserProfileData } from "../../../components/user/userDashboardData";

export default async function ProfilePage() {
  const profileData = await getUserProfileData();

  return <UserProfilePage data={profileData} />;
}
