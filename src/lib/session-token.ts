import { SignJWT } from "jose";
export async function issueApiToken(user: { id: string; email: string; name?: string; role?: string }) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "development-only-change-this");
  return new SignJWT({ email: user.email, name: user.name || "", role: user.role || "customer" })
    .setProtectedHeader({ alg: "HS256" }).setSubject(user.id).setIssuedAt().setExpirationTime("2h").sign(secret);
}
