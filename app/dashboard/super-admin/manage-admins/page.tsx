"use client";

import { useEffect, useState } from "react";
import AdminForm from "@/components/dashboard/manage-admin/AdminForm";
import AdminList from "@/components/dashboard/manage-admin/AdminList";
import Header from "@/components/dashboard/Header";

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);

  const fetchAdmins = async () => {
    const res = await fetch("/api/admins");
    const data = await res.json();
    setAdmins(data);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <Header title="Manage Admins & Sub-Admins" />
      <AdminForm fetchAdmins={fetchAdmins} />
      <AdminList admins={admins} fetchAdmins={fetchAdmins} />
    </div>
  );
}
