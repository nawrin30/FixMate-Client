const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export async function api(path: string, options: RequestInit = {}) {
  let token = "";
  if (typeof window !== "undefined") {
    const r = await fetch("/api/token", { cache: "no-store" });
    if (r.ok) token = (await r.json()).token;
  }
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API}${path}`, { ...options, headers, cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}
export const money = (n: number) => `$${Number(n || 0).toFixed(2)}`;
