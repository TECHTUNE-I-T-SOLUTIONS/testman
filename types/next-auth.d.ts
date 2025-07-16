import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      matricNumber: any;
      id: string;
      name: string;
      email: string;
      role: string;
      email?: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    matricNumber: string;
    email?: string;
  }

   interface JWT {
     id: string;
     email: string;
     role: string;
   }
}
