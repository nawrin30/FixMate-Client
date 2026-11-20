
'use client';

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/client-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Role = "customer" | "technician" | "admin";

const roles: {
  value: Role;
  title: string;
  description: string;
  emoji: string;
}[] = [
  {
    value: "customer",
    title: "Customer",
    description: "Book repair services",
    emoji: "👤",
  },
  {
    value: "technician",
    title: "Technician",
    description: "Manage repair requests",
    emoji: "🔧",
  },
  {
    value: "admin",
    title: "Admin",
    description: "Manage FixMate",
    emoji: "🛡️",
  },
];

export default function Signin() {
  const [role, setRole] = useState<Role>("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    try {
      const result = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      const user = (result.data as any)?.user;
      const actualRole = user?.role || "customer";

      // Selected role must match the account's actual role.
      if (actualRole !== role) {
        await authClient.signOut();

        throw new Error(
          `This account is not registered as ${role}. Please select the correct account type.`
        );
      }

      toast.success("Welcome back!");
      router.replace(`/dashboard/${actualRole}`);
    } catch (error: any) {
      toast.error(error.message || "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  async function googleSignIn() {
    if (role !== "customer") {
      toast.error("Google sign in is currently available for Customers only.");
      return;
    }

    setGoogleBusy(true);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard/customer",
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Google sign in failed");
      setGoogleBusy(false);
    }
  }

  return (
    <main className="container">
      <form className="form-card" onSubmit={submit}>
        <span className="eyebrow">WELCOME BACK TO FIXMATE</span>

        <h1>Sign in to your account</h1>

        <p className="muted" style={{ marginBottom: 20 }}>
          Select your account type to continue.
        </p>

        {/* Account Type Selection */}
        <div className="field">
          <label>Choose Account Type</label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 9,
            }}
          >
            {roles.map((item) => {
              const active = role === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setRole(item.value)}
                  style={{
                    padding: "14px 5px",
                    borderRadius: 12,
                    border: active
                      ? "2px solid #2563eb"
                      : "1px solid #ddd",
                    background: active ? "#eff6ff" : "#fff",
                    color: active ? "#1d4ed8" : "#444",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 7,
                    minWidth: 0,
                  }}
                >
                  <span style={{ fontSize: 25 }}>{item.emoji}</span>

                  <strong style={{ fontSize: 13 }}>
                    {item.title}
                  </strong>

                  <span
                    style={{
                      fontSize: 10,
                      textAlign: "center",
                      lineHeight: 1.4,
                    }}
                  >
                    {item.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Email */}
        <div className="field">
          <label>Email Address</label>

          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="field">
          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Forgot Password */}
        <div
          style={{
            textAlign: "right",
            marginTop: -8,
            marginBottom: 18,
          }}
        >
          <Link
            href="/forgot-password"
            style={{
              color: "#2563eb",
              fontSize: 14,
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Forgot Password?
          </Link>
        </div>

        {/* Sign In */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={busy || googleBusy}
          style={{ width: "100%" }}
        >
          {busy ? "Signing in..." : `Sign in as ${role}`}
        </button>

        <div style={{ textAlign: "center", margin: "18px 0" }}>
          <span className="muted">OR</span>
        </div>

        {/* Google Login */}
        <button
          type="button"
          className="btn"
          onClick={googleSignIn}
          disabled={googleBusy || busy}
          style={{
            width: "100%",
            background: "#fff",
            color: "#333",
            border: "1px solid #ddd",
          }}
        >
          {googleBusy ? "Connecting to Google..." : "Continue with Google"}
        </button>

        <p className="muted" style={{ textAlign: "center" }}>
          New to FixMate? <Link href="/sign-up">Create account</Link>
        </p>
      </form>
    </main>
  );
}
