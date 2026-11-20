import DashboardShell from '@/components/dashboard';
export default async function Layout({children,params}:{children:React.ReactNode;params:Promise<{role:string}>}){const {role}=await params;return <DashboardShell role={role}>{children}</DashboardShell>}
