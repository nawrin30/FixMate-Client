'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api, money } from "@/lib/api";
import { toast } from "sonner";
import { useParams } from "next/navigation";

type Stat = { label: string; value: number | string; hint: string };

export default function DashboardOverview() {
  const { role } = useParams<{ role: string }>();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        if (role === "customer") {
          const [b, p] = await Promise.all([api("/api/bookings/my"), api("/api/payments/my")]);
          if (active) { setBookings(b); setPayments(p); }
        } else if (role === "technician") {
          const [s, b] = await Promise.all([api("/api/services/mine"), api("/api/bookings/technician")]);
          if (active) { setServices(s); setBookings(b); }
        } else if (role === "admin") {
          const [u, s, b, p] = await Promise.all([api("/api/admin/users"), api("/api/admin/services"), api("/api/admin/bookings"), api("/api/admin/payments")]);
          if (active) { setUsers(u); setServices(s); setBookings(b); setPayments(p.items || []); }
        }
      } catch (e: any) { if (active) toast.error(e.message || "Could not load dashboard"); }
      finally { if (active) setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, [role]);

  const stats: Stat[] = useMemo(() => {
    if (role === "customer") return [
      { label: "Total Requests", value: bookings.length, hint: "All repair requests" },
      { label: "Active Jobs", value: bookings.filter(b => ["requested", "accepted", "in-progress"].includes(b.status)).length, hint: "Currently being handled" },
      { label: "Completed Jobs", value: bookings.filter(b => b.status === "completed" || b.status === "paid").length, hint: "Jobs completed" },
    ];
    if (role === "technician") return [
      { label: "Total Services", value: services.length, hint: "Services you listed" },
      { label: "Approved Services", value: services.filter(s => s.approvalStatus === "approved").length, hint: "Visible to customers" },
      { label: "Pending Requests", value: bookings.filter(b => b.status === "requested").length, hint: "Need your response" },
    ];
    return [
      { label: "Total Users", value: users.length, hint: "Registered accounts" },
      { label: "Total Technicians", value: users.filter(u => u.role === "technician").length, hint: "Service providers" },
      { label: "Pending Services", value: services.filter(s => s.approvalStatus === "pending").length, hint: "Waiting for review" },
    ];
  }, [role, bookings, services, users]);

  const chart = role === "technician"
    ? ["requested", "accepted", "in-progress", "completed", "rejected"].map(k => ({ label: k.replace("-", " "), count: bookings.filter(b => b.status === k).length }))
    : role === "admin"
      ? ["pending", "approved", "rejected"].map(k => ({ label: k, count: services.filter(s => s.approvalStatus === k).length }))
      : ["requested", "accepted", "in-progress", "completed", "cancelled"].map(k => ({ label: k.replace("-", " "), count: bookings.filter(b => b.status === k).length }));
  const max = Math.max(1, ...chart.map(x => x.count));

  if (loading) return <div className="stat"><p>Loading your dashboard…</p></div>;
  if (!["customer", "technician", "admin"].includes(role)) return <div className="empty">Unknown dashboard role.</div>;

  return <div className="dashboard-overview">
    <div className="section-head"><div><span className="eyebrow">YOUR WORKSPACE</span><h2>{role === "admin" ? "Platform overview" : role === "technician" ? "Technician overview" : "Customer overview"}</h2><p className="muted">A quick look at your FixMate activity.</p></div></div>
    <div className="grid dashboard-stats">{stats.map(s => <article className="stat" key={s.label}><p className="muted">{s.label}</p><h2>{s.value}</h2><small className="muted">{s.hint}</small></article>)}</div>
    <section className="stat" style={{ marginTop: 24 }}><div className="section-head"><div><h3>{role === "admin" ? "Service approval status" : "Job status overview"}</h3><p className="muted">Live counts from your account.</p></div></div>
      <div className="overview-chart">{chart.map(x => <div className="chart-row" key={x.label}><span>{x.label}</span><div className="chart-track"><div className="chart-fill" style={{ width: `${(x.count / max) * 100}%` }} /></div><b>{x.count}</b></div>)}</div>
    </section>
    <div className="grid" style={{ marginTop: 24 }}>
      {role === "customer" && <><Link className="stat" href="/dashboard/customer/bookings"><h3>My Bookings →</h3><p className="muted">Track, cancel or pay for your repair jobs.</p></Link><Link className="stat" href="/dashboard/customer/payments"><h3>Payment History →</h3><p className="muted">Review your completed payments. Total paid: {money(payments.reduce((n,p)=>n+Number(p.amount||0),0))}</p></Link></>}
      {role === "technician" && <><Link className="stat" href="/dashboard/technician/add-service"><h3>Add a Service →</h3><p className="muted">List a new repair service.</p></Link><Link className="stat" href="/dashboard/technician/requests"><h3>Manage Requests →</h3><p className="muted">Review customer repair requests.</p></Link></>}
      {role === "admin" && <><Link className="stat" href="/dashboard/admin/services"><h3>Review Services →</h3><p className="muted">Approve or reject technician listings.</p></Link><Link className="stat" href="/dashboard/admin/transactions"><h3>Transactions →</h3><p className="muted">{payments.length} recorded payments.</p></Link></>}
    </div>
  </div>;
}
