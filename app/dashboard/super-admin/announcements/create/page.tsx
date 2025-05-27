"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CreateAnnouncementPage() {
  const [content, setContent] = useState("");
  const [duration, setDuration] = useState("");
  const [show, setShow] = useState("yes");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!content || !duration || !show) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          duration: Number(duration),
          show: show === "yes", // convert to boolean for backend
        }),
      });

      if (res.ok) {
        toast.success("Announcement created successfully!");
        router.push("/dashboard/super-admin/announcements/view");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create announcement");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold">Create Announcement</h1>

      <Textarea
        placeholder="Enter announcement content..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px]"
      />

      <Input
        type="number"
        placeholder="Duration in days"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />

      <div>
        <Label className="block mb-1 text-sm font-medium text-gray-700">Show Announcement?</Label>
        <Select value={show} onValueChange={setShow}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create Announcement"}
      </Button>
    </div>
  );
}
