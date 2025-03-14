"use client";

interface AdminActionsProps {
  admin: { _id: string };
  fetchAdmins: () => void;
}

export default function AdminActions({
  admin,
  fetchAdmins,
}: AdminActionsProps) {
  const deleteAdmin = async () => {
    await fetch("/api/admins", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: admin._id }),
    });
    fetchAdmins();
  };

  return (
    <div>
      <button className="mr-2 bg-purple-500 text-white px-3 py-1 hover:bg-purple-600 rounded">
        Edit
      </button>
      <button
        onClick={deleteAdmin}
        className="bg-red-500 text-white px-3 py-1 rounded"
      >
        Delete
      </button>
    </div>
  );
}
