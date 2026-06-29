import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, Mail, Phone, MapPin, Building2, Briefcase } from "lucide-react";
import { Modal, PageHeader } from "./common";
import { fetchProfile, updateProfile, uploadProfilePicture } from "../services/profile.service";
import { changePassword } from "../services/settings.service";

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  employee_id: string;
  department: string;
  township: string;
  designation: string;
  profile_picture: string;
};

const emptyForm: ProfileForm = {
  name: "",
  email: "",
  phone: "",
  employee_id: "",
  department: "",
  township: "",
  designation: "",
  profile_picture: "",
};

function initials(name?: string) {
  return (name || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AdminProfileForm({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchProfile();
      setProfile(data);
      setForm({
        name: data.name ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        employee_id: data.employee_id ?? "",
        department: data.department ?? "",
        township: data.township ?? "",
        designation: data.designation ?? "",
        profile_picture: data.profile_picture ?? "",
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  function set<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Name, email and phone are required.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const updated = await updateProfile({
        name: form.name,
        email: form.email,
        phone: form.phone,
        designation: form.designation,
        department: form.department,
        township: form.township,
        profile_picture: form.profile_picture,
      });
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      await loadProfile();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function onUpload(file?: File) {
    if (!file) return;
    try {
      setUploading(true);
      setError("");
      const imageUrl = await uploadProfilePicture(file);
      if (!imageUrl) {
        throw new Error("Upload failed");
      }
      set("profile_picture", imageUrl);
      const updated = await updateProfile({ profile_picture: imageUrl });
      setProfile(updated);
      await loadProfile();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Unable to upload profile picture.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      {error ? <div className="ntpc-card p-4 text-sm text-red-600 mb-4">{error}</div> : null}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <div className="ntpc-card p-5 h-fit text-center">
          <div className="h-24 w-24 rounded-full bg-primary text-white text-3xl font-bold flex items-center justify-center mx-auto overflow-hidden">
            {form.profile_picture ? <img src={form.profile_picture} alt="" className="h-full w-full object-cover" /> : initials(form.name)}
          </div>
          <div className="font-bold mt-3">{form.name || "Admin"}</div>
          <div className="text-sm text-muted-foreground">{form.designation || "Administrator"} - {form.township}</div>
          <div className="mt-4 text-xs text-left space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground"><Mail size={13} /> {profile?.email}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><Phone size={13} /> {profile?.phone}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><MapPin size={13} /> {profile?.township}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><Building2 size={13} /> {profile?.department}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><Briefcase size={13} /> Employee ID {profile?.employee_id}</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(event) => void onUpload(event.target.files?.[0])} />
          <button type="button" className="ntpc-btn-secondary w-full justify-center mt-5" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload photo"}
          </button>
          <button type="button" className="ntpc-btn-secondary w-full justify-center mt-2" onClick={() => setPasswordOpen(true)}>
            Change password
          </button>
        </div>
        <form onSubmit={submit} className="ntpc-card p-5 space-y-4">
          {saved && <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 flex items-center gap-2 text-sm"><CheckCircle2 size={16} /> Profile updated.</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="Full name"><input className="ntpc-input" value={form.name} onChange={(e) => set("name", e.target.value)} /></F>
            <F label="Email"><input className="ntpc-input" value={form.email} onChange={(e) => set("email", e.target.value)} /></F>
            <F label="Phone"><input className="ntpc-input" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></F>
            <F label="Employee ID"><input className="ntpc-input bg-muted" value={form.employee_id} readOnly /></F>
            <F label="Department"><input className="ntpc-input" value={form.department} onChange={(e) => set("department", e.target.value)} /></F>
            <F label="Township"><input className="ntpc-input" value={form.township} onChange={(e) => set("township", e.target.value)} /></F>
          </div>
          <F label="Designation"><input className="ntpc-input" value={form.designation} onChange={(e) => set("designation", e.target.value)} /></F>
          <div className="flex justify-end gap-2">
            <button type="button" className="ntpc-btn-secondary" onClick={() => void loadProfile()} disabled={saving}>Cancel</button>
            <button type="submit" className="ntpc-btn-primary" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
          </div>
        </form>
      </div>
      <PasswordDialog open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </div>
  );
}

function PasswordDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit() {
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const result = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setSuccess(result.message || "Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Unable to update password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change Password"
      footer={
        <>
          <button className="ntpc-btn-secondary" onClick={onClose} disabled={saving}>Close</button>
          <button className="ntpc-btn-primary" onClick={() => void submit()} disabled={saving}>{saving ? "Updating..." : "Update password"}</button>
        </>
      }
    >
      <div className="space-y-3 text-sm">
        {error ? <div className="text-red-600">{error}</div> : null}
        {success ? <div className="text-emerald-700">{success}</div> : null}
        <F label="Current password"><input type="password" className="ntpc-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></F>
        <F label="New password"><input type="password" className="ntpc-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></F>
        <F label="Confirm password"><input type="password" className="ntpc-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></F>
      </div>
    </Modal>
  );
}

function F({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><div className="text-xs font-semibold text-muted-foreground mb-1">{label}</div>{children}</label>;
}
