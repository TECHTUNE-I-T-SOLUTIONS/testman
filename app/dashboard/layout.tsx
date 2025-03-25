import AdminLayout from "./AdminLayout";

export const metadata = {
  title: "Admin Dashboard",
  description: "Admin Dashboard for managing the Operation save my CGPA portal",
};
export default function AdminParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
