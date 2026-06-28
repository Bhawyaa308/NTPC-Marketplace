import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const auth = window.localStorage.getItem("ntpc.auth");
    if (!auth) return null;

    const parsed = JSON.parse(auth);
    return typeof parsed?.token === "string" ? parsed.token : null;
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;