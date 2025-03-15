"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getStudentFromToken() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      matricNumber: any;
      name: string;
      id: string;
    };
    return decoded;
  } catch (error) {
    return null;
  }
}


export async function logoutStudent() {
  (await cookies()).delete("token");
}
