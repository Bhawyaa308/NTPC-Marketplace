import { clearAuth } from "../lib/auth";
import {
  createFileRoute,
  Link,
  useNavigate,
  redirect,
} from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { NTPCBrand } from "../components/NTPCLogo";
import { getAuth } from "../lib/auth";
import { registerUser } from "../services/auth.service";

export const Route = createFileRoute("/register")({
  beforeLoad: () => {},
  component: Register,
});

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  empId: z.string().min(4),
  phone: z.string().min(10),
  departmentId: z.string(),
  townshipId: z.string(),
  password: z.string().min(8),
});
type FormData = z.infer<typeof schema>;

function Register() {
  const nav = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    console.log("REGISTER DATA", data);
    try {
      await registerUser({
        employee_id: data.empId,
        email: data.email,
        name: data.name,
        phone: data.phone,
        department_id: Number(data.departmentId),
        township_id: Number(data.townshipId),
        designation: "Employee",
        password: data.password,
      });
      clearAuth();
      alert("Registration successful. Please login.");

      nav({
        to: "/login",
      });
    } catch (error: any) {
      console.error("REGISTER ERROR", error?.response?.data);

      alert(JSON.stringify(error?.response?.data, null, 2));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md ntpc-card p-7">
        <NTPCBrand />

        <h2 className="text-2xl font-bold mt-6">Create your account</h2>

        <p className="text-sm text-muted-foreground mt-1">
          Only verified NTPC employees can register.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3">
          <Field label="Full name" error={errors.name?.message}>
            <input className="ntpc-input" {...register("name")} />
          </Field>

          <Field label="NTPC email" error={errors.email?.message}>
            <input
              className="ntpc-input"
              placeholder="you@ntpc.co.in"
              {...register("email")}
            />
          </Field>

          <Field label="Employee ID" error={errors.empId?.message}>
            <input className="ntpc-input" {...register("empId")} />
          </Field>

          <Field label="Township">
            <select className="ntpc-input" {...register("townshipId")}>
              <option value="1">Dadri</option>
              <option value="2">Korba</option>
              <option value="3">Ramagundam</option>
              <option value="4">Vindhyachal</option>
              <option value="5">Talcher</option>
            </select>
          </Field>

          <Field label="Password" error={errors.password?.message}>
            <input
              type="password"
              className="ntpc-input"
              {...register("password")}
            />
          </Field>
          <Field label="Phone Number" error={errors.phone?.message}>
            <input
              className="ntpc-input"
              placeholder="9876543210"
              {...register("phone")}
            />
          </Field>
          <Field label="Department">
            <select className="ntpc-input" {...register("departmentId")}>
              <option value="1">Operations</option>
              <option value="2">Projects</option>
              <option value="3">Human Resources</option>
              <option value="4">Finance</option>
              <option value="5">Commercial</option>
              <option value="6">Contracts & Materials</option>
              <option value="7">Information Technology</option>
            </select>
          </Field>
          <button
            type="submit"
            disabled={isSubmitting}
            className="ntpc-btn-primary w-full justify-center mt-2"
          >
            {isSubmitting ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => {
              clearAuth();
              nav({
                to: "/login",
              });
            }}
            className="text-primary font-semibold hover:underline"
          >
            Sign in
          </button>
        </div>
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
    <label className="block text-sm">
      <div className="font-semibold mb-1">{label}</div>

      {children}

      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </label>
  );
}
