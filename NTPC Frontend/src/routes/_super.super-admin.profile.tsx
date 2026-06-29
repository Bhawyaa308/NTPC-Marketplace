import { createFileRoute } from "@tanstack/react-router";
import { AdminProfileForm } from "../components/AdminProfileForm";

export const Route = createFileRoute("/_super/super-admin/profile")({ component: SuperAdminProfile });

function SuperAdminProfile() {
  return <AdminProfileForm title="Super Admin Profile" subtitle="Your administrator account." />;
}
