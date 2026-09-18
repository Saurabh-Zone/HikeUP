const BASE = import.meta.env.VITE_API_URL || "/api";

export const getToken = () => localStorage.getItem("hikeupToken");

export async function api(endpoint, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${endpoint}`, { ...options, headers });
  } catch (err) {
    throw new Error(
      "Cannot connect to HikeUp backend. Make sure MongoDB and the backend server are running on http://localhost:5000."
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export const auth = {
  signup: d => api("/auth/signup", { method: "POST", body: JSON.stringify(d) }),
  login: d => api("/auth/login", { method: "POST", body: JSON.stringify(d) }),
  me: () => api("/auth/me")
};
export const services = {
  list: () => api("/services"), all: () => api("/services/all"),
  create: d => api("/services", { method: "POST", body: JSON.stringify(d) }),
  update: (id,d) => api(`/services/${id}`, { method: "PUT", body: JSON.stringify(d) }),
  remove: id => api(`/services/${id}`, { method: "DELETE" })
};
export const bookings = {
  list: () => api("/bookings"), get: id => api(`/bookings/${id}`),
  create: d => api("/bookings", { method: "POST", body: JSON.stringify(d) }),
  status: (id,d) => api(`/bookings/${id}/status`, { method: "PUT", body: JSON.stringify(d) }),
  cancel: id => api(`/bookings/${id}`, { method: "DELETE" }),
  nearby: id => api(`/bookings/${id}/nearby-workers`), history: id => api(`/bookings/${id}/history`)
};
export const allocations = {
  dispatch: id => api(`/allocations/${id}/dispatch`, { method: "POST" }),
  pending: () => api("/allocations/worker/pending"),
  accept: id => api(`/allocations/${id}/accept`, { method: "PUT" }),
  reject: (id,reason) => api(`/allocations/${id}/reject`, { method: "PUT", body: JSON.stringify({reason}) })
};
export const dashboard = { customer: () => api("/dashboard/customer"), worker: () => api("/dashboard/worker"), admin: () => api("/dashboard/admin") };
export const users = {
  list: p => api(`/users?${new URLSearchParams(p||{})}`), workers: p => api(`/users/workers?${new URLSearchParams(p||{})}`),
  meUpdate: d => api("/users/me", { method: "PUT", body: JSON.stringify(d) }),
  verify: (id,isVerified) => api(`/users/${id}/verify`, { method: "PUT", body: JSON.stringify({isVerified}) }),
  remove: id => api(`/users/${id}`, { method: "DELETE" })
};
export const reviews = { submit: d => api("/reviews", { method: "POST", body: JSON.stringify(d) }), user: id => api(`/reviews/user/${id}`) };
export const payments = {
  create: d => api("/payments/create-intent", { method: "POST", body: JSON.stringify(d) }),
  confirm: d => api("/payments/confirm", { method: "POST", body: JSON.stringify(d) }),
  get: id => api(`/payments/booking/${id}`)
};
