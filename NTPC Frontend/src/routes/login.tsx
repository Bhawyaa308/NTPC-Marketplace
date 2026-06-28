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
import { getAuth, setAuth, roleFromEmail, landingForRole } from "../lib/auth";
import api from "../lib/api";
export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    const auth = getAuth();
    if (auth) throw redirect({ to: landingForRole(auth.role) });
  },
  component: Login,
});

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Min 6 characters"),
});
type FormData = z.infer<typeof schema>;

function Login() {
  const nav = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const onSubmit = async (data: FormData) => {
    try {
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      let role: "employee" | "admin" | "super" = "employee";

      const roleId = response.data.user.role_id;

      if (roleId === 2) role = "admin";
      if (roleId === 3) role = "super";

      setAuth({
        token: response.data.token,
        user: response.data.user,
        role,
      });

      nav({
        to: landingForRole(role),
      });
    } catch (error) {
      console.error(error);
      alert("Login failed");
    }
  };
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary to-[#0a5cad] text-white">
        <NTPCBrand />
        <div>
          <h1 className="text-4xl font-bold leading-tight">
            An internal marketplace,
            <br />
            built for NTPC.
          </h1>
          <p className="mt-4 opacity-90 max-w-md">
            Buy and sell across townships. Help colleagues moving on transfer.
            All in one trusted place.
          </p>
        </div>
        <div className="text-xs opacity-70">
          © NTPC Limited · Internal Use Only
        </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-sm space-y-4"
        >
          <div className="lg:hidden mb-4">
            <NTPCBrand />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Sign in</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Use your NTPC corporate email to continue.
            </p>
          </div>
          <label className="block text-sm">
            <div className="font-semibold mb-1">Email</div>
            <input
              className="ntpc-input"
              placeholder="you@ntpc.co.in"
              {...register("email")}
            />
            {errors.email && (
              <div className="text-xs text-red-600 mt-1">
                {errors.email.message}
              </div>
            )}
          </label>
          <label className="block text-sm">
            <div className="font-semibold mb-1">Password</div>
            <input
              type="password"
              className="ntpc-input"
              {...register("password")}
            />
            {errors.password && (
              <div className="text-xs text-red-600 mt-1">
                {errors.password.message}
              </div>
            )}
          </label>
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Remember me
            </label>
            <a className="text-primary font-semibold hover:underline">
              Forgot password?
            </a>
          </div>
          <button
            type="submit"
            className="ntpc-btn-primary w-full justify-center"
          >
            Sign in
          </button>
          <div className="text-center text-sm text-muted-foreground">
            New employee?{" "}
            <Link
              to="/register"
              className="text-primary font-semibold hover:underline"
            >
              Create an account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
