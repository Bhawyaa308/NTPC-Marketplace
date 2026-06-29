import api from "../lib/api";

export async function fetchProfile() {
  const res = await api.get("/profile/me");
  return res.data;
}

export async function updateProfile(payload: {
  name?: string;
  email?: string;
  phone?: string;
  designation?: string;
  department?: string;
  township?: string;
  department_id?: number;
  township_id?: number;
  profile_picture?: string;
}) {
  const res = await api.patch("/profile/me", payload);
  return res.data;
}

export async function uploadProfilePicture(file: File) {
  const formData = new FormData();
  formData.append("images", file);
  const res = await api.post("/listings/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.imageUrls?.[0] ?? "";
}
