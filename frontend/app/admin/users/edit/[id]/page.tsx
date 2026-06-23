import CreateUser from "../../../../../components/admin/createuser";

export default async function UserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CreateUser showBusinessHeader userId={id} />;
}
