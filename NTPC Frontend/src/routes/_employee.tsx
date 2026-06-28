import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "../components/AppShell";
import { getAuth, landingForRole } from "../lib/auth";

export const Route = createFileRoute("/_employee")({
  beforeLoad: () => {
    const auth = getAuth();
    if (!auth) throw redirect({ to: "/login" });
    if (auth.role !== "employee")
      throw redirect({ to: landingForRole(auth.role) });
  },
  component: () => (
    <AppShell role="employee">
      <Outlet />
    </AppShell>
  ),
});
