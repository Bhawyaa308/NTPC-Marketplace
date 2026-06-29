import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "../components/common";
import {
  fetchSuperAdminSettings,
  updateSuperAdminSetting,
  type PlatformSetting,
} from "../services/super-admin.service";

export const Route = createFileRoute("/_super/super-admin/settings")({ component: SuperSettings });

function SuperSettings() {
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [error, setError] = useState("");
  const [savingKey, setSavingKey] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        setError("");
        setSettings(await fetchSuperAdminSettings());
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.response?.data?.error || "Failed to load settings.");
      }
    }

    void loadSettings();
  }, []);

  async function configure(settingKey: string) {
    const currentValue = settings.find((setting) => setting.setting_key === settingKey)?.setting_value || "";
    const nextValue = window.prompt(`Configure ${settingKey}`, currentValue);
    if (nextValue === null) return;

    try {
      setSavingKey(settingKey);
      setError("");
      const updated = await updateSuperAdminSetting({
        setting_key: settingKey,
        setting_value: nextValue,
      });
      setSettings((current) =>
        current.map((setting) =>
          setting.setting_key === updated.setting_key ? updated : setting,
        ),
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Unable to update setting.");
    } finally {
      setSavingKey("");
    }
  }

  const sections = [
    { title: "Platform", items: ["Branding", "Default township", "Listing rules", "Featured categories"] },
    { title: "Security", items: ["SSO providers", "Session length", "IP allowlist"] },
    { title: "Integrations", items: ["NTPC Payroll", "HRMS sync", "Email gateway"] },
    { title: "Compliance", items: ["Data retention", "Audit policy", "Export logs"] },
  ];
  return (
    <div>
      <PageHeader title="Platform Settings" subtitle="Governance controls for super admins." />
      {error ? <div className="ntpc-card p-4 text-sm text-red-600 mb-4">{error}</div> : null}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((s) => (
          <div key={s.title} className="ntpc-card p-5">
            <h3 className="font-bold mb-3">{s.title}</h3>
            <div className="divide-y">
              {s.items.map((it) => (
                <div key={it} className="flex items-center justify-between py-3 text-sm">
                  <span>{it}</span>
                  <button className="text-primary text-xs font-semibold hover:underline" onClick={() => void configure(it)} disabled={savingKey === it}>{savingKey === it ? "Saving" : "Configure"}</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
