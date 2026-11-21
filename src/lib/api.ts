
const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

let cachedToken = "";
let tokenPromise: Promise<string> | null = null;

async function getToken(): Promise<string> {
  if (typeof window === "undefined") return "";

  // Use cached token if already fetched
  if (cachedToken) return cachedToken;

  // Avoid multiple token requests at the same time
  if (tokenPromise) return tokenPromise;

  tokenPromise = (async () => {
    try {
      const response = await fetch("/api/token", {
        cache: "no-store",
      });

      if (!response.ok) return "";

      const data = await response.json();
      cachedToken = data.token || "";

      return cachedToken;
    } catch {
      return "";
    } finally {
      tokenPromise = null;
    }
  })();

  return tokenPromise;
}

export async function api(
  path: string,
  options: RequestInit = {}
) {
  const token = await getToken();

  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const money = (n: number) =>
  `$${Number(n || 0).toFixed(2)}`;
