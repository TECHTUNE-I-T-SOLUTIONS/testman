import { NextRequest, NextResponse } from "next/server";
import { connectdb } from "@/lib/connectdb";
import Announcement from "@/lib/models/Announcement";

type UpdateAnnouncementFields = {
  content?: string;
  duration?: number;
  show?: boolean;
};

// PATCH: Partial update (e.g., toggle 'show')
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectdb();
    const { id } = params;
    const body = await req.json();

    const updateFields: UpdateAnnouncementFields = {};
    if ("content" in body) updateFields.content = body.content;
    if ("duration" in body) updateFields.duration = body.duration;
    if ("show" in body) updateFields.show = body.show;

    const updated = await Announcement.findByIdAndUpdate(id, updateFields, { new: true });

    if (!updated) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error in PATCH announcement:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT: Full update
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectdb();
    const { id } = params;
    const body = await req.json();
    const { content, duration, show } = body;

    const updateFields: UpdateAnnouncementFields = {};
    if (content) updateFields.content = content;
    if (duration) updateFields.duration = duration;
    if (typeof show === "boolean") updateFields.show = show;

    const updated = await Announcement.findByIdAndUpdate(id, updateFields, { new: true });

    if (!updated) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error in PUT announcement:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE: Remove announcement
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectdb();
    const { id } = params;

    const deleted = await Announcement.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
