import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "../components/common";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/profile")({ component: AdminProfile });

function AdminProfile() {
  const [form, setForm] = useState({
    name: "Sneha Iyer", email: "sneha@ntpc.co.in", employeeId: "10008721",
    department: "Finance", township: "Vindhyachal", phone: "+91 99xxxxxxx",
    bio: "Marketplace moderator. Focused on policy enforcement and dispute resolution.",
  });
  const [saved, setSaved] = useState(false);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const submit = (e: React.FormEvent) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 1500); };

  return (
    <div>
      <PageHeader title="Admin Profile" subtitle="Your moderator account." />
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <div className="ntpc-card p-5 h-fit text-center">
          <div className="h-24 w-24 rounded-full bg-primary text-white text-3xl font-bold flex items-center justify-center mx-auto">SA</div>
          <div className="font-bold mt-3">{form.name}</div>
          <div className="text-sm text-muted-foreground">Administrator · {form.township}</div>
          <button type="button" className="ntpc-btn-secondary w-full justify-center mt-5">Upload photo</button>
        </div>
        <form onSubmit={submit} className="ntpc-card p-5 space-y-4">
          {saved && <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 flex items-center gap-2 text-sm"><CheckCircle2 size={16} /> Profile updated.</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="Full name"><input className="ntpc-input" value={form.name} onChange={(e) => set("name", e.target.value)} /></F>
            <F label="Email"><input className="ntpc-input" value={form.email} onChange={(e) => set("email", e.target.value)} /></F>
            <F label="Phone"><input className="ntpc-input" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></F>
            <F label="Employee ID"><input className="ntpc-input" value={form.employeeId} onChange={(e) => set("employeeId", e.target.value)} /></F>
            <F label="Department"><input className="ntpc-input" value={form.department} onChange={(e) => set("department", e.target.value)} /></F>
            <F label="Township"><input className="ntpc-input" value={form.township} onChange={(e) => set("township", e.target.value)} /></F>
          </div>
          <F label="Bio"><textarea rows={3} className="ntpc-input" value={form.bio} onChange={(e) => set("bio", e.target.value)} /></F>
          <div className="flex justify-end gap-2">
            <button type="button" className="ntpc-btn-secondary">Cancel</button>
            <button type="submit" className="ntpc-btn-primary">Save changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="text-xs font-semibold text-muted-foreground mb-1">{label}</div>{children}</label>;
}
