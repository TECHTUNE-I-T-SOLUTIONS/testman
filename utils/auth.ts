"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export async function getStudentFromToken() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      matricNumber: string;
      name: string;
      id: string;
    };
    return decoded;
  } catch {
    return null;
  }
}


export async function logoutStudent() {
  (await cookies()).delete("token");
}

export async function getAdminFromRequestFromHeaders(req?: NextRequest) {
  // Try to get the admin-token from cookies (supports both NextRequest and server context)
  let token: string | undefined;
  if (req && req.cookies) {
    // For NextRequest (API route)
    token = req.cookies.get("admin-token")?.value;
  } else {
    // For server context
    const cookieStore = cookies();
    token = (await cookieStore).get("admin-token")?.value;
  }
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      email: string;
      id: string;
      role: string;
    };
    return decoded;
  } catch {
    return null;
  }
}
