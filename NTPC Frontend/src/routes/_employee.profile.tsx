import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "../components/common";
import { Mail, Phone, MapPin, Building2, Briefcase } from "lucide-react";
import { fetchProfile, updateProfile } from "../services/profile.service";

export const Route = createFileRoute("/_employee/profile")({
  component: Profile,
});

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  township: z.string(),
  department: z.string(),
  designation: z.string(),
  bio: z.string().max(280).optional(),
});
type FormData = z.infer<typeof schema>;

function Profile() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { register, handleSubmit, formState, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      township: "",
      department: "",
      designation: "",
      bio: "",
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);

      const data = await fetchProfile();

      setProfile(data);

      reset({
        name: data.name ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        township: data.township ?? "",
        department: data.department ?? "",
        designation: data.designation ?? "",
        bio: "",
      });
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(values: FormData) {
    try {
      setSubmitting(true);

      const payload = {
        name: values.name,
        phone: values.phone,
        designation: values.designation,
      };

      await updateProfile(payload);

      await loadProfile();
    } catch (err) {
      console.error("Profile update error:", err);
    } finally {
      setSubmitting(false);
    }
  }
  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }
  return (
    <div>
      <PageHeader
        title="Profile"
        subtitle="Manage how you appear to other NTPC employees."
      />
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <div className="ntpc-card p-5 h-fit text-center">
          <div className="h-24 w-24 rounded-full bg-primary text-white text-3xl font-bold flex items-center justify-center mx-auto">
            {profile?.name
              ?.split(" ")
              ?.map((n: string) => n[0])
              ?.join("")
              ?.slice(0, 2)}
          </div>
          <div className="font-bold mt-3">{profile?.name}</div>
          <div className="text-sm text-muted-foreground">
            {profile?.designation}
          </div>
          <div className="mt-4 text-xs text-left space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail size={13} /> {profile?.email}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone size={13} /> {profile?.phone}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={13} /> {profile?.township}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 size={13} /> {profile?.department}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase size={13} /> Employee ID {profile?.employee_id}
            </div>
          </div>
          <button className="ntpc-btn-secondary w-full justify-center mt-5">
            Upload photo
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="ntpc-card p-5 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full name" error={formState.errors.name?.message}>
              <input className="ntpc-input" {...register("name")} />
            </Field>
            <Field label="Email">
              <input
                className="ntpc-input bg-muted"
                {...register("email")}
                readOnly
              />
            </Field>
            <Field label="Phone" error={formState.errors.phone?.message}>
              <input className="ntpc-input" {...register("phone")} />
            </Field>
            <Field label="Township">
              <input className="ntpc-input" {...register("township")} />
            </Field>
            <Field label="Department">
              <input className="ntpc-input" {...register("department")} />
            </Field>
            <Field label="Designation">
              <input className="ntpc-input" {...register("designation")} />
            </Field>
          </div>
          <Field label="Bio">
            <textarea rows={3} className="ntpc-input" {...register("bio")} />
          </Field>
          <div className="flex gap-2 justify-end">
            <button type="button" className="ntpc-btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className="ntpc-btn-primary"
              disabled={submitting}
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-muted-foreground mb-1">
        {label}
      </div>
      {children}
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </label>
  );
}
