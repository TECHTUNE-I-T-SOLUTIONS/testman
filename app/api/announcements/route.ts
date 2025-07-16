import { NextRequest, NextResponse } from "next/server";
import { connectdb } from "@/lib/connectdb";
import Announcement from "@/lib/models/Announcement";

// CREATE ANNOUNCEMENT
export async function POST(req: NextRequest) {
  try {
    await connectdb();
    const body = await req.json();
    const { content, duration, show } = body;

    if (!content || !duration || typeof show !== "boolean") {
      return NextResponse.json({ error: "All fields (content, duration, show) are required" }, { status: 400 });
    }

    const newAnnouncement = await Announcement.create({ content, duration, show });

    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET ANNOUNCEMENTS
export async function GET() {
  try {
    await connectdb();

    const announcements = await Announcement.find().sort({ createdAt: -1 });
    return NextResponse.json(announcements, { status: 200 });

  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json({ error: "Failed to load announcements" }, { status: 500 });
  }
}
