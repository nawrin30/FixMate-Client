import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { issueApiToken } from "@/lib/session-token";
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  const token = await issueApiToken({ id: user.id, email: user.email, name: user.name, role: ["customer", "technician", "admin"].includes(user.role) ? user.role : "customer" });
  return NextResponse.json({ token, user });
}
