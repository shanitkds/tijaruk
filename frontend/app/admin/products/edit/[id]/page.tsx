import AdminDashboard from "../../../../../components/admin/AdminDashboard";

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminDashboard initialTab="Products" initialAction="edit" initialActionId={id} />;
}
