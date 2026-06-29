import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader, Modal } from "../components/common";
import { Toaster } from "../components/ui/sonner";
import { toast } from "sonner";
import api from "../lib/api";
import {
  changePassword,
  fetchSettings,
  type ProfileVisibility,
  type SettingsPatch,
  updateSettings,
  type UserSettings,
} from "../services/settings.service";

export const Route = createFileRoute("/_employee/settings")({
  component: Settings,
});

type PanelKey =
  | "Change password"
  | "Two-factor authentication"
  | "Linked NTPC SSO"
  | "Email updates"
  | "Push notifications"
  | "Transfer alerts"
  | "Profile visibility"
  | "Show contact to buyers"
  | "Default township"
  | "Preferred categories";

type Township = { id: number; name: string };
type Category = { category_id: number; name: string };

const sections: Array<{ title: string; items: PanelKey[] }> = [
  {
    title: "Account",
    items: [
      "Change password",
      "Two-factor authentication",
      "Linked NTPC SSO",
    ],
  },
  {
    title: "Notifications",
    items: ["Email updates", "Push notifications", "Transfer alerts"],
  },
  {
    title: "Privacy",
    items: ["Profile visibility", "Show contact to buyers"],
  },
  {
    title: "Marketplace",
    items: ["Default township", "Preferred categories"],
  },
];

const visibilityLabels: Record<ProfileVisibility, string> = {
  PUBLIC: "Public",
  NTPC_EMPLOYEES_ONLY: "NTPC Employees Only",
  PRIVATE: "Private",
};

const defaultPasswordForm = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

function getErrorMessage(err: any, fallback: string) {
  return err?.response?.data?.message || err?.response?.data?.error || fallback;
}

function validatePasswordPolicy(password: string) {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

function Settings() {
  const [open, setOpen] = useState<PanelKey | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [townships, setTownships] = useState<Township[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmTwoFactor, setConfirmTwoFactor] = useState(false);
  const [passwordForm, setPasswordForm] = useState(defaultPasswordForm);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [settingsData, townshipRes, categoryRes] = await Promise.all([
          fetchSettings(),
          api.get("/townships"),
          api.get("/categories"),
        ]);

        setSettings(settingsData);
        setTownships(townshipRes.data?.townships ?? []);
        setCategories(categoryRes.data ?? []);
      } catch (err: any) {
        setError(getErrorMessage(err, "Unable to load settings right now."));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const preferredCategoryIds = useMemo(
    () =>
      new Set(
        (settings?.preferred_categories ?? []).map((category) =>
          Number(category.category_id),
        ),
      ),
    [settings?.preferred_categories],
  );

  const close = () => {
    setOpen(null);
    setError("");
    setSuccess("");
    setConfirmTwoFactor(false);
    setPasswordForm(defaultPasswordForm);
  };

  const patchOptimistic = async (
    payload: SettingsPatch,
    optimistic: (current: UserSettings) => UserSettings,
    label: string,
    key: string,
  ) => {
    if (!settings || pendingKey) return;

    const previous = settings;
    setSettings(optimistic(settings));
    setPendingKey(key);
    setError("");
    setSuccess("");

    try {
      const updated = await updateSettings(payload);
      setSettings(updated);
      setSuccess(`${label} updated.`);
      toast.success(`${label} updated.`);
    } catch (err: any) {
      setSettings(previous);
      const message = getErrorMessage(err, `Unable to update ${label}.`);
      setError(message);
      toast.error(message);
    } finally {
      setPendingKey(null);
    }
  };

  const toggleField = (
    field:
      | "email_notifications"
      | "push_notifications"
      | "transfer_alerts"
      | "show_contact_to_buyers",
    label: string,
  ) => {
    if (!settings) return;
    const next = !settings[field];
    void patchOptimistic(
      { [field]: next },
      (current) => ({ ...current, [field]: next }),
      label,
      field,
    );
  };

  const updateTwoFactor = () => {
    if (!settings) return;
    const next = !settings.two_factor_enabled;
    void patchOptimistic(
      { two_factor_enabled: next },
      (current) => ({ ...current, two_factor_enabled: next }),
      "Two-factor authentication",
      "two_factor_enabled",
    );
    setConfirmTwoFactor(false);
  };

  const updateVisibility = (value: ProfileVisibility) => {
    void patchOptimistic(
      { profile_visibility: value },
      (current) => ({ ...current, profile_visibility: value }),
      "Profile visibility",
      "profile_visibility",
    );
  };

  const updateTownship = (value: string) => {
    const townshipId = value ? Number(value) : null;
    const townshipName =
      townships.find((township) => township.id === townshipId)?.name ?? null;

    void patchOptimistic(
      { default_township_id: townshipId },
      (current) => ({
        ...current,
        default_township_id: townshipId,
        default_township_name: townshipName,
      }),
      "Default township",
      "default_township_id",
    );
  };

  const updatePreferredCategory = (category: Category) => {
    const nextIds = new Set(preferredCategoryIds);
    if (nextIds.has(category.category_id)) {
      nextIds.delete(category.category_id);
    } else {
      nextIds.add(category.category_id);
    }

    const nextList = categories
      .filter((item) => nextIds.has(item.category_id))
      .map((item) => ({ category_id: item.category_id, name: item.name }));

    void patchOptimistic(
      { preferred_categories: [...nextIds] },
      (current) => ({ ...current, preferred_categories: nextList }),
      "Preferred categories",
      "preferred_categories",
    );
  };

  const submitPassword = async () => {
    if (pendingKey) return;

    if (
      !passwordForm.current_password ||
      !passwordForm.new_password ||
      !passwordForm.confirm_password
    ) {
      setError("All password fields are required.");
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (!validatePasswordPolicy(passwordForm.new_password)) {
      setError(
        "Password must include at least 8 characters, uppercase, lowercase, number, and special character.",
      );
      return;
    }

    try {
      setPendingKey("password");
      setError("");
      setSuccess("");
      await changePassword(passwordForm);
      setPasswordForm(defaultPasswordForm);
      setSuccess("Password updated successfully.");
      toast.success("Password updated successfully.");
    } catch (err: any) {
      setError(getErrorMessage(err, "Unable to update password right now."));
    } finally {
      setPendingKey(null);
    }
  };

  const passwordFooter = (
    <>
      <button className="ntpc-btn-secondary" onClick={close} disabled={!!pendingKey}>
        Cancel
      </button>
      <button
        className="ntpc-btn-primary"
        onClick={() => void submitPassword()}
        disabled={pendingKey === "password"}
      >
        {pendingKey === "password" ? "Saving..." : "Save"}
      </button>
    </>
  );

  const closeFooter = (
    <button className="ntpc-btn-secondary" onClick={close} disabled={!!pendingKey}>
      Close
    </button>
  );

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Configure your NTPC Marketplace experience."
      />
      {loading ? (
        <div className="ntpc-card p-4 text-sm text-muted-foreground">
          Loading settings...
        </div>
      ) : error && !settings ? (
        <div className="ntpc-card p-4 text-sm text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((s) => (
            <div key={s.title} className="ntpc-card p-5">
              <h3 className="font-bold mb-3">{s.title}</h3>
              <div className="divide-y">
                {s.items.map((it) => (
                  <div
                    key={it}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <span>{it}</span>
                    <button
                      onClick={() => {
                        setOpen(it);
                        setError("");
                        setSuccess("");
                      }}
                      className="text-primary text-xs font-semibold hover:underline"
                      disabled={!settings}
                    >
                      Manage
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open !== null}
        onClose={close}
        title={open ?? ""}
        footer={open === "Change password" ? passwordFooter : closeFooter}
      >
        {!settings ? (
          <div className="text-sm text-muted-foreground">
            Settings are loading.
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            {success ? (
              <div className="text-sm text-emerald-700">{success}</div>
            ) : null}
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
            {pendingKey && pendingKey !== "password" ? (
              <div className="text-sm text-muted-foreground">Saving...</div>
            ) : null}

            {open === "Change password" ? (
              <PasswordFields
                value={passwordForm}
                disabled={pendingKey === "password"}
                onChange={setPasswordForm}
              />
            ) : open === "Two-factor authentication" ? (
              confirmTwoFactor ? (
                <div className="space-y-3">
                  <p>
                    {settings.two_factor_enabled
                      ? "Disable two-factor authentication for your account?"
                      : "Enable two-factor authentication for your account?"}
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      className="ntpc-btn-secondary"
                      onClick={() => setConfirmTwoFactor(false)}
                      disabled={pendingKey === "two_factor_enabled"}
                    >
                      Cancel
                    </button>
                    <button
                      className="ntpc-btn-primary"
                      onClick={updateTwoFactor}
                      disabled={pendingKey === "two_factor_enabled"}
                    >
                      {pendingKey === "two_factor_enabled"
                        ? "Saving..."
                        : "Confirm"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border rounded-lg p-3">
                    <span>
                      {settings.two_factor_enabled
                        ? "2FA is enabled"
                        : "2FA is disabled"}
                    </span>
                    <button
                      className="ntpc-btn-secondary !py-1 !px-2 text-xs"
                      onClick={() => setConfirmTwoFactor(true)}
                    >
                      {settings.two_factor_enabled ? "Disable" : "Enable"}
                    </button>
                  </div>
                </div>
              )
            ) : open === "Linked NTPC SSO" ? (
              <div className="text-sm text-muted-foreground">
                NTPC SSO is{" "}
                <strong>
                  {settings.ntpc_sso_linked ? "linked" : "not linked"}
                </strong>
                . This connection is managed by NTPC identity services and
                cannot be changed here.
              </div>
            ) : open === "Email updates" ? (
              <Toggle
                label="Email updates"
                on={settings.email_notifications}
                loading={pendingKey === "email_notifications"}
                onToggle={() =>
                  toggleField("email_notifications", "Email updates")
                }
              />
            ) : open === "Push notifications" ? (
              <Toggle
                label="Push notifications"
                on={settings.push_notifications}
                loading={pendingKey === "push_notifications"}
                onToggle={() =>
                  toggleField("push_notifications", "Push notifications")
                }
              />
            ) : open === "Transfer alerts" ? (
              <Toggle
                label="Transfer alerts"
                on={settings.transfer_alerts}
                loading={pendingKey === "transfer_alerts"}
                onToggle={() =>
                  toggleField("transfer_alerts", "Transfer alerts")
                }
              />
            ) : open === "Default township" ? (
              <F label="Default township">
                <select
                  className="ntpc-input"
                  value={settings.default_township_id ?? ""}
                  onChange={(event) => updateTownship(event.target.value)}
                  disabled={pendingKey === "default_township_id"}
                >
                  <option value="">No default township</option>
                  {townships.map((township) => (
                    <option key={township.id} value={township.id}>
                      {township.name}
                    </option>
                  ))}
                </select>
              </F>
            ) : open === "Preferred categories" ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                {categories.map((category) => (
                  <Toggle
                    key={category.category_id}
                    label={category.name}
                    on={preferredCategoryIds.has(category.category_id)}
                    loading={pendingKey === "preferred_categories"}
                    onToggle={() => updatePreferredCategory(category)}
                  />
                ))}
              </div>
            ) : open === "Profile visibility" ? (
              <div className="space-y-2 text-sm">
                {(Object.keys(visibilityLabels) as ProfileVisibility[]).map(
                  (value) => (
                    <Radio
                      key={value}
                      name="profile_visibility"
                      label={visibilityLabels[value]}
                      checked={settings.profile_visibility === value}
                      disabled={pendingKey === "profile_visibility"}
                      onChange={() => updateVisibility(value)}
                    />
                  ),
                )}
              </div>
            ) : open === "Show contact to buyers" ? (
              <Toggle
                label="Show contact to buyers"
                on={settings.show_contact_to_buyers}
                loading={pendingKey === "show_contact_to_buyers"}
                onToggle={() =>
                  toggleField("show_contact_to_buyers", "Contact visibility")
                }
              />
            ) : null}
          </div>
        )}
      </Modal>
      <Toaster position="top-right" />
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <div className="font-semibold mb-1">{label}</div>
      {children}
    </label>
  );
}

function PasswordFields({
  value,
  disabled,
  onChange,
}: {
  value: typeof defaultPasswordForm;
  disabled: boolean;
  onChange: (value: typeof defaultPasswordForm) => void;
}) {
  const update = (key: keyof typeof defaultPasswordForm, next: string) => {
    onChange({ ...value, [key]: next });
  };

  return (
    <div className="space-y-3 text-sm">
      <F label="Current password">
        <input
          type="password"
          className="ntpc-input"
          value={value.current_password}
          onChange={(event) => update("current_password", event.target.value)}
          disabled={disabled}
        />
      </F>
      <F label="New password">
        <input
          type="password"
          className="ntpc-input"
          value={value.new_password}
          onChange={(event) => update("new_password", event.target.value)}
          disabled={disabled}
        />
      </F>
      <F label="Confirm new password">
        <input
          type="password"
          className="ntpc-input"
          value={value.confirm_password}
          onChange={(event) => update("confirm_password", event.target.value)}
          disabled={disabled}
        />
      </F>
    </div>
  );
}

function Toggle({
  label,
  on,
  loading,
  onToggle,
}: {
  label: string;
  on: boolean;
  loading?: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex items-center justify-between border rounded-lg p-3 cursor-pointer">
      <span>
        {label}
        {loading ? (
          <span className="ml-2 text-xs text-muted-foreground">Saving...</span>
        ) : null}
      </span>
      <button
        type="button"
        onClick={onToggle}
        disabled={loading}
        className={`relative h-5 w-9 rounded-full transition disabled:opacity-60 ${on ? "bg-primary" : "bg-muted"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${on ? "left-[18px]" : "left-0.5"}`}
        />
      </button>
    </label>
  );
}

function Radio({
  name,
  label,
  checked,
  disabled,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 border rounded p-2">
      <input
        type="radio"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />{" "}
      {label}
    </label>
  );
}
