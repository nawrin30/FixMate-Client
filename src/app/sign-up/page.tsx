
'use client';

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/client-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [v, setV] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer"
  });

  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (
      v.password.length < 6 ||
      !/[A-Z]/.test(v.password) ||
      !/[a-z]/.test(v.password)
    ) {
      toast.error(
        "Password needs 6+ characters, uppercase and lowercase letters"
      );
      return;
    }

    setBusy(true);

    try {
      const r = await authClient.signUp.email({
        name: v.name,
        email: v.email,
        password: v.password,
        role: v.role
      } as any);

      if (r.error) throw new Error(r.error.message);

      toast.success("Account created");
      router.push(`/dashboard/${v.role}`);
    } catch (e: any) {
      toast.error(e.message || "Sign up failed");
    } finally {
      setBusy(false);
    }
  }

  async function googleSignUp() {
    setGoogleBusy(true);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard/customer"
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (e: any) {
      toast.error(e.message || "Google sign up failed");
      setGoogleBusy(false);
    }
  }

  return (
    <main className="container">
      <form className="form-card" onSubmit={submit}>
        <span className="eyebrow">JOIN FIXMATE</span>
        <h1>Create account</h1>

        <div className="field">
          <label>Full name</label>
          <input
            required
            type="text"
            value={v.name}
            onChange={(e) =>
              setV({ ...v, name: e.target.value })
            }
          />
        </div>

        <div className="field">
          <label>Email</label>
          <input
            required
            type="email"
            value={v.email}
            onChange={(e) =>
              setV({ ...v, email: e.target.value })
            }
          />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            required
            type="password"
            value={v.password}
            onChange={(e) =>
              setV({ ...v, password: e.target.value })
            }
          />
        </div>

        <div className="field">
          <label>Account type</label>
          <select
            value={v.role}
            onChange={(e) =>
              setV({ ...v, role: e.target.value })
            }
          >
            <option value="customer">Customer</option>
            <option value="technician">Technician</option>
          </select>
        </div>

        <button
          className="btn btn-primary"
          disabled={busy}
        >
          {busy ? "Creating…" : "Create account"}
        </button>

        <div style={{ textAlign: "center", margin: "18px 0" }}>
          <span className="muted">OR</span>
        </div>

        <button
          type="button"
          className="btn"
          onClick={googleSignUp}
          disabled={googleBusy}
          style={{
            width: "100%",
            background: "#fff",
            color: "#333",
            border: "1px solid #ddd"
          }}
        >
          {googleBusy
            ? "Connecting to Google…"
            : "Continue with Google"}
        </button>

        <p className="muted">
          Already registered? <Link href="/sign-in">Sign in</Link>
        </p>
      </form>
    </main>
  );
}
