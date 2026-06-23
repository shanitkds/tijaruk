import AdminDashboard from "../../../../components/admin/AdminDashboard";

export default function RfqDetailPage({ params }: { params: { id: string } }) {
  return (
    <AdminDashboard initialTab="RFQs" initialAction="view" initialActionId={params.id} />
  );
}
