import { NextResponse } from "next/server";
import { connectdb } from "@/lib/connectdb";
import AdSettings from "@/lib/models/adSettings";

// GET: Get current ads status
export async function GET() {
  await connectdb();

  const existing = await AdSettings.findOne({});
  return NextResponse.json({ status: existing?.status || "off" });
}

// POST: Toggle ads status
export async function POST(req: Request) {
  await connectdb();
  const { status } = await req.json();

  if (!["on", "off"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  let settings = await AdSettings.findOne({});
  if (!settings) {
    settings = new AdSettings({ status });
  } else {
    settings.status = status;
  }

  await settings.save();
  return NextResponse.json({ status: settings.status });
}
