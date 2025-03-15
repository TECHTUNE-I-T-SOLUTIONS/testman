import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import connectdb from "@/lib/connectdb";
import { getServerSession } from "next-auth";
import User from "@/lib/models/User";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { oldPassword, newPassword } = await req.json();
    await new connectdb();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isMatch = await compare(oldPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Incorrect old password" },
        { status: 400 }
      );
    }

    user.password = await hash(newPassword, 10);
    await user.save();

    return NextResponse.json(
      { message: "Password updated successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
