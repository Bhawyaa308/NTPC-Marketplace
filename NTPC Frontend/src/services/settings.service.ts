import api from "../lib/api";

export type ProfileVisibility = "PUBLIC" | "NTPC_EMPLOYEES_ONLY" | "PRIVATE";

export type UserSettings = {
  user_id: number;
  two_factor_enabled: boolean;
  ntpc_sso_linked: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  transfer_alerts: boolean;
  profile_visibility: ProfileVisibility;
  show_contact_to_buyers: boolean;
  default_township_id: number | null;
  default_township_name?: string | null;
  preferred_categories: Array<{ category_id: number; name: string }>;
};

export type SettingsPatch = Partial<
  Pick<
    UserSettings,
    | "two_factor_enabled"
    | "email_notifications"
    | "push_notifications"
    | "transfer_alerts"
    | "profile_visibility"
    | "show_contact_to_buyers"
    | "default_township_id"
  >
> & {
  preferred_categories?: number[];
};

export async function fetchSettings() {
  const res = await api.get("/settings");
  return res.data as UserSettings;
}

export async function updateSettings(payload: SettingsPatch) {
  const res = await api.patch("/settings", payload);
  return res.data as UserSettings;
}

export async function changePassword(payload: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}) {
  const res = await api.patch("/settings/password", payload);
  return res.data as { message: string };
}
