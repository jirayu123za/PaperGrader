const BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api';
const join = (b: string, p: string) => `${b.replace(/\/+$/,'')}/${p.replace(/^\/+/,'')}`;
export const API_BASE = BASE;
export const api = (path: string, init?: RequestInit) => fetch(join(BASE, path), init);
export const qf = async <T>(path: string, init?: RequestInit) => {
  const r = await api(path, init);
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
};