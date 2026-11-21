'use client';
import {useEffect,useState}
 from "react";
 import {useSearchParams,useRouter}
  from "next/navigation";
  import {api,money} 
  from "@/lib/api";
export default function Success(){
    const p=useSearchParams(),router=useRouter();
    const [payment,setPayment]=useState<any>(null),[error,setError]=useState("");useEffect(()=>{
        const id=p.get("session_id");if(id)api(`/api/payments/verify?session_id=${id}`).then(setPayment).catch((e:any)=>setError(e.message))},[]);return <main className="container page-head"><h1>Payment {payment?"successful":"confirmation"}</h1>{payment?<><p>Thank you. Your payment of {money(payment.amount)} is confirmed.</p>
        <p>Transaction: {payment.transactionId}</p></>:<p>{error||"Verifying payment…"}</p>}
        <button className="btn btn-primary" onClick={()=>router.push("/dashboard/customer/bookings")}>Back to My Bookings</button>
        </main>}
