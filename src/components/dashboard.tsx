
'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/client-auth";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardShell({
  children,
  role
}: {
  children: React.ReactNode;
  role: string;
}) {
  const [user, setUser] = useState<any>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    authClient.getSession().then((r: any) => {
      const u = r.data?.user;

      if (!u) {
        router.replace("/sign-in");
      } else if ((u.role || "customer") !== role) {
        router.replace(`/dashboard/${u.role || "customer"}`);
      } else {
        setUser(u);
      }
    });
  }, [role, router]);

  const menus: any = {
    customer: [
      ["Overview", "/dashboard/customer"],
      ["My Bookings", "/dashboard/customer/bookings"],
      ["Payments", "/dashboard/customer/payments"]
    ],
    technician: [
      ["Overview", "/dashboard/technician"],
      ["Add Service", "/dashboard/technician/add-service"],
      ["My Services", "/dashboard/technician/my-services"],
      ["Requests", "/dashboard/technician/requests"]
    ],
    admin: [
      ["Overview", "/dashboard/admin"],
      ["Users", "/dashboard/admin/users"],
      ["Services", "/dashboard/admin/services"],
      ["Bookings", "/dashboard/admin/bookings"],
      ["Transactions", "/dashboard/admin/transactions"]
    ]
  };

  async function handleSignOut() {
    try {
      setLoggingOut(true);

      const result = await authClient.signOut();

      if (result.error) {
        throw new Error(result.error.message);
      }

      setUser(null);
      router.replace("/sign-in");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
      alert("Sign out failed. Please try again.");
      setLoggingOut(false);
    }
  }

  if (!user) {
    return <main className="container page-head">Checking access…</main>;
  }

  return (
    <div className="dashboard">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <b>🔧 FIXMATE / {role.toUpperCase()}</b>

        {menus[role]?.map(([title, url]: string[]) => (
          <Link href={url} key={url} onClick={() => setMenuOpen(false)} aria-current={pathname === url ? "page" : undefined} className={pathname === url ? "dashboard-link-active" : ""}>
            {title}
          </Link>
        ))}

        <Link href="/dashboard/profile">Update Profile</Link>

        <Link href="/">← Back to home</Link>

        <button
          type="button"
          className="btn btn-dark"
          onClick={handleSignOut}
          disabled={loggingOut}
          style={{ marginTop: 20, width: "100%" }}
        >
          {loggingOut ? "Signing Out..." : "Sign Out"}
        </button>
      </aside>

      <section className="dash-content">
        <div className="row" style={{ marginBottom: 28, alignItems: "center" }}>
          <button type="button" className="btn btn-light dashboard-menu-toggle" aria-label="Toggle dashboard menu" onClick={() => setMenuOpen(v => !v)}>☰</button>
          <div>
            <span className="eyebrow">WORKSPACE</span>
            <h1>{role} dashboard</h1>
          </div>

          <div className="dashboard-user">{user.image ? <img src={user.image} alt="Profile" /> : <span className="avatar-fallback">{(user.name || "U").slice(0,1).toUpperCase()}</span>}<div><b>{user.name}</b><small>{role}</small></div></div>
        </div>

        {children}
      </section>
    </div>
  );
}
