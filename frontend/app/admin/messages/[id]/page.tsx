import AdminDashboard from "../../../../components/admin/AdminDashboard";

export default function MessageDetailPage({ params }: { params: { id: string } }) {
  return (
    <AdminDashboard initialTab="Messages" initialAction="view" initialActionId={params.id} />
  );
}
