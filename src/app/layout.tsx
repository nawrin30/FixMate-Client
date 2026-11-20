import './globals.css';
import Providers from '@/components/providers';
import Navbar from '@/components/navbar';
export const metadata={title:'FixMate | Repair made simple',description:'Book trusted device and home appliance repair services.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Providers><Navbar/>{children}<footer className="footer"><div className="container footer-grid"><div><div className="brand">🔧 FixMate</div><p>Reliable repairs. Transparent progress. Pay after service.</p></div><div><b>Explore</b><p><a href="/">Home</a></p><p><a href="/services">Services</a></p><p><a href="/about">How it works</a></p></div><div><b>Contact</b><p>hello@fixmate.example</p><p>Dhaka, Bangladesh</p><p>© {new Date().getFullYear()} FixMate</p></div></div></footer></Providers></body></html>}
