import { createFileRoute } from "@tanstack/react-router";
import { AdminProfileForm } from "../components/AdminProfileForm";

export const Route = createFileRoute("/_admin/admin/profile")({ component: AdminProfile });

function AdminProfile() {
  return <AdminProfileForm title="Admin Profile" subtitle="Your moderator account." />;
}
