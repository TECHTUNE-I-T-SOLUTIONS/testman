// app/dashboard/manage-ads/create/page.tsx
"use client";

import { useEffect, useState } from "react";

export default function ManageAdsTogglePage() {
  const [status, setStatus] = useState<"on" | "off">("off");
  const [loading, setLoading] = useState(false);

  // Fetch current ads status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/ads");
        const data = await res.json();
        setStatus(data.status);
      } catch (err) {
        console.error("Failed to fetch ads status", err);
      }
    };
    fetchStatus();
  }, []);

  // Toggle handler
  const handleToggle = async () => {
    setLoading(true);
    const newStatus = status === "on" ? "off" : "on";

    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      setStatus(data.status);
    } catch (err) {
      console.error("Failed to update ads status", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-xl text-center font-semibold mb-4">Manage Ads</h1>
      <p className="mb-2">Current status: <strong>{status.toUpperCase()}</strong></p>

      <button
        onClick={handleToggle}
        disabled={loading}
        className={`px-4 py-2 rounded ${
          status === "on" ? "bg-red-600" : "bg-green-600"
        } text-white`}
      >
        {loading ? "Updating..." : status === "on" ? "Turn Off Ads" : "Turn On Ads"}
      </button>
    </div>
  );
}
