'use client';
export default function ErrorPage({reset}:{error:Error;reset:()=>void}){
    return <main className="container page-head"><h1>Something went wrong</h1>
    <p className="muted">Please try again.</p>
    <button className="btn btn-primary" onClick={()=>reset()}>Try again</button>
    </main>}
