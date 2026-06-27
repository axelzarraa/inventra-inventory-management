import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET || "inventra-secret-key";

type TokenPayload = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("inventra_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const user = jwt.verify(token, JWT_SECRET) as TokenPayload;

    return NextResponse.json({
      success: true,
      message: "Current user fetched successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("GET_ME_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }
}