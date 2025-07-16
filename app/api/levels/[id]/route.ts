import { NextRequest, NextResponse } from "next/server";
import { connectdb } from "@/lib/connectdb";
import Level from "@/lib/models/Level";
import department from "@/lib/models/department";

// 🟩 GET /api/levels/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectdb();

    const level = await Level.findById(params.id);
    if (!level) {
      return NextResponse.json({ error: "Level not found" }, { status: 404 });
    }

    return NextResponse.json(level, { status: 200 });
  } catch (error) {
    console.error("Error fetching level:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// 🟨 PUT /api/levels/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectdb();
    const data = await req.json();

    const updatedLevel = await Level.findByIdAndUpdate(params.id, data, { new: true });

    if (!updatedLevel) {
      return NextResponse.json({ error: "Level not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Level updated", level: updatedLevel });
  } catch (error) {
    console.error("Error updating level:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// 🟥 DELETE /api/levels/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectdb();

    const level = await Level.findById(params.id);
    if (!level) {
      return NextResponse.json({ error: "Level not found" }, { status: 404 });
    }

    await Level.findByIdAndDelete(params.id);

    await department.updateOne(
      { _id: level.departmentId },
      { $pull: { levels: params.id } }
    );

    return NextResponse.json({ message: "Level deleted successfully" });
  } catch (error) {
    console.error("Error deleting level:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
