import UserSettingsPage from "../../../components/user/UserSettingsPage";
import { getUserSettingsData } from "../../../components/user/userDashboardData";

export default async function SettingsPage() {
  const settingsData = await getUserSettingsData();

  return <UserSettingsPage data={settingsData} />;
}
