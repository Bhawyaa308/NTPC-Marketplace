import { createFileRoute, redirect } from "@tanstack/react-router";
import { getAuth, landingForRole } from "../lib/auth";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const auth = getAuth();
    if (!auth) throw redirect({ to: "/login" });
    throw redirect({ to: landingForRole(auth.role) });
  },
});
