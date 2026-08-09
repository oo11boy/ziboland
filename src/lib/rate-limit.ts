import { pool } from "./db";

export async function checkSmsRateLimit(phone: string): Promise<{
  allowed: boolean;
  remainingSeconds?: number;
}> {
  try {
    const [rows]: any = await pool.query(
      `SELECT created_at FROM verification_codes 
       WHERE email = ? 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [phone],
    );

    if (rows.length === 0) {
      return { allowed: true };
    }

    const lastSent = new Date(rows[0].created_at);
    const now = new Date();
    const diffSeconds = (now.getTime() - lastSent.getTime()) / 1000;
    const minInterval = 60;

    if (diffSeconds < minInterval) {
      return {
        allowed: false,
        remainingSeconds: Math.ceil(minInterval - diffSeconds),
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Rate limit check error:", error);
    return { allowed: true };
  }
}
