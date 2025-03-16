import { NextResponse } from "next/server";
import  connectdb  from "@/lib/connectdb";
import User from "@/lib/models/User";
import { getServerSession } from "next-auth";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await new connectdb();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.email = email;
    await user.save();

    return NextResponse.json(
      { message: "Email updated successfully!", updatedEmail: email },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
