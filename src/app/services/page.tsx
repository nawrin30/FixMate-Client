'use client';
import { useEffect,useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api,money } from "@/lib/api";
const categories=["Smartphone","Laptop & PC","AC","Refrigerator","TV","Washing Machine","Electrical"];
export default function ServicesPage(){
 const params=useSearchParams(); const [q,setQ]=useState(params.get("q")||""),[category,setCategory]=useState(params.get("category")||""),[mode,setMode]=useState(""),[sort,setSort]=useState("newest"),[items,setItems]=useState<any[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 async function load(){setLoading(true);setError("");const p=new URLSearchParams();if(q)p.set("q",q);if(category)p.set("category",category);if(mode)p.set("mode",mode);p.set("sort",sort);try{const d=await api(`/api/services?${p}`);setItems(d.items||[])}catch(e:any){setError(e.message)}finally{setLoading(false)}}
 useEffect(()=>{const t=setTimeout(load,250);return()=>clearTimeout(t)},[q,category,mode,sort]);
 return <main className="container"><div className="page-head"><span className="eyebrow">FIND YOUR FIX</span><h1>Browse repair services</h1><p className="muted">Search trusted local technicians and choose the right service.</p></div>
 <div className="filters"><input placeholder="Search title or category..." value={q} onChange={e=>setQ(e.target.value)}/><select value={category} onChange={e=>setCategory(e.target.value)}><option value="">All categories</option>{categories.map(c=><option key={c}>{c}</option>)}</select><select value={mode} onChange={e=>setMode(e.target.value)}><option value="">All service modes</option><option>Home Visit</option><option>Shop Drop-off</option></select><select value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option></select></div>
 {loading?<p>Loading services…</p>:error?<div className="empty">{error}</div>:items.length?<div className="grid">{items.map(s=><article className="card" key={s._id}><img className="service-img" src={s.image} alt={s.title}/><div className="card-body"><div className="row"><span className="tag">{s.category}</span><span className="price">{money(s.basePrice)}</span></div><h3 style={{marginTop:12}}>{s.title}</h3><p className="meta">{s.serviceMode} · {s.serviceArea}</p><p className="meta">Technician: {s.technicianName}</p><Link className="btn btn-primary" href={`/services/${s._id}`}>View details</Link></div></article>)}</div>:<div className="empty"><h3>No services found</h3><p>Try changing your search or filters.</p></div>}</main>
}
