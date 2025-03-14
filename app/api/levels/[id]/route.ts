import connectdb from "@/lib/connectdb";
import department from "@/lib/models/department";
import Level from "@/lib/models/Level";
import { NextResponse } from "next/server";
import { parse } from "url"; // Import URL parser

export async function DELETE(req: Request) {
  try {
    await connectdb();

    // Extract ID from the request URL
    const { pathname } = parse(req.url, true);
    const id = pathname?.split("/").pop(); // Get the last segment of the URL

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const level = await Level.findById(id);
    if (!level) {
      return NextResponse.json({ error: "Level not found" }, { status: 404 });
    }

    await Level.findByIdAndDelete(id);

    await department.updateOne(
      { _id: level.departmentId },
      { $pull: { levels: id } }
    );

    return NextResponse.json(
      { message: "Level deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting level:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
