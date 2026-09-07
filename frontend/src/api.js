const TOKEN_KEY = "bigdots_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function asList(data) {
  if (Array.isArray(data)) return data;
  return data?.items || [];
}

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.detail || data.message || (typeof data === "object" ? Object.values(data)[0] : "Request failed");
    const text = Array.isArray(message) ? message[0] : message;
    throw new Error(typeof text === "string" ? text : JSON.stringify(text));
  }
  return data;
}

export const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export const discountPercent = (mrp, price) => (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);
