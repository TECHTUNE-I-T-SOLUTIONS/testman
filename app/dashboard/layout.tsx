export const metadata = {
  title: "Admin Dashboard",
  description: "Admin Dashboard for managing the Operation save my CGPA portal",
};

import AdminLayout from "./AdminLayout";

export default function AdminParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
