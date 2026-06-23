import AdminDashboard from "../../../../../components/admin/AdminDashboard";

export default async function SupplierEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminDashboard initialTab="Suppliers" initialAction="edit" initialActionId={id} />;
}
