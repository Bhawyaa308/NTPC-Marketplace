import api from "../lib/api";

export async function fetchProfile() {
  const res = await api.get("/profile/me");
  return res.data;
}

export async function updateProfile(payload: {
  name?: string;
  phone?: string;
  designation?: string;
}) {
  const res = await api.patch("/profile/me", payload);
  return res.data;
}