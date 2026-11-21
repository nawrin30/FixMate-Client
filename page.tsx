export default function About(){return <main className="container page-head"><span className="eyebrow">HOW IT WORKS</span>
<h1>Repair service, made transparent.</h1>
<p className="muted">FixMate connects customers with technicians through a clear, trackable repair journey.</p>
<div className="grid" style={{marginTop:30}}>{['Find an approved service','Send your repair request','Track technician progress','Pay only after completion'].map((x,i)=><div className="stat" key={x}><span className="tag">STEP 0{i+1}</span>
<h3>{x}</h3>
</div>)}</div>
</main>}
