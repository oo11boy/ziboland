import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2/promise";

interface TicketRow extends RowDataPacket {
  id: number;
  user_id: number;
  subject: string;
  status: string;
  created_at: string;
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: No token provided" },
        { status: 401 },
      );
    }

    let decoded: { userId: number; role: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: number;
        role: string;
      };
      if (!decoded.role || decoded.role !== "admin") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    } catch (err) {
      console.error("JWT verification error:", err);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    const [rows] = await pool.query<TicketRow[]>(
      `SELECT id, user_id, subject, status, created_at 
       FROM tickets 
       ORDER BY created_at DESC 
       LIMIT 5`,
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching recent tickets:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch recent tickets",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
