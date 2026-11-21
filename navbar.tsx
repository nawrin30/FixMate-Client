'use client';
import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/client-auth";
import { Wrench, Menu, X } from "lucide-react";
export default function Navbar() {
  const [user,setUser]=useState<any>(null), [open,setOpen]=useState(false);
  useEffect(()=>{ authClient.getSession().then((r:any)=>setUser(r.data?.user||null)); },[]);
  const role=user?.role||"customer";
  const dash=`/dashboard/${role}`;
  return <header className="nav"><div className="container nav-inner">
    <Link href="/" className="brand"><span className="brand-icon"><Wrench size={20}/></span>FixMate</Link>
    <button className="mobile-menu" onClick={()=>setOpen(!open)} aria-label="Toggle menu">{open?<X/>:<Menu/>}</button>
    <nav className={open?"links show":"links"}><Link href="/">Home</Link><Link href="/services">Services</Link><Link href="/about">How It Works</Link>
      {user?<div className="user-menu"><Link href={dash} className="btn btn-light">Dashboard</Link><Link href="/dashboard/profile" className="avatar-link">{user.name||user.email}</Link><button className="btn btn-dark" onClick={async()=>{await authClient.signOut();location.href="/";}}>Sign Out</button></div>:<div className="user-menu"><Link className="btn btn-light" href="/sign-in">Sign In</Link><Link className="btn btn-primary" href="/sign-up">Get Started</Link></div>}
    </nav></div></header>;
}
