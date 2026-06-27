import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "inventra-secret-key";

export async function getUserFromToken() {
  const cookieStore = await cookies(); // ✅ WAJIB await

  const token = cookieStore.get("inventra_token")?.value;

  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as {
      id: number;
      name: string;
      email: string;
      role: "ADMIN" | "STAFF";
    };
  } catch {
    return null;
  }
}