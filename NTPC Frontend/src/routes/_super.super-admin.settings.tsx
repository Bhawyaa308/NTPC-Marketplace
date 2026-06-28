import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/common";

export const Route = createFileRoute("/_super/super-admin/settings")({ component: SuperSettings });

function SuperSettings() {
  const sections = [
    { title: "Platform", items: ["Branding", "Default township", "Listing rules", "Featured categories"] },
    { title: "Security", items: ["SSO providers", "Session length", "IP allowlist"] },
    { title: "Integrations", items: ["NTPC Payroll", "HRMS sync", "Email gateway"] },
    { title: "Compliance", items: ["Data retention", "Audit policy", "Export logs"] },
  ];
  return (
    <div>
      <PageHeader title="Platform Settings" subtitle="Governance controls for super admins." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((s) => (
          <div key={s.title} className="ntpc-card p-5">
            <h3 className="font-bold mb-3">{s.title}</h3>
            <div className="divide-y">
              {s.items.map((it) => (
                <div key={it} className="flex items-center justify-between py-3 text-sm">
                  <span>{it}</span>
                  <button className="text-primary text-xs font-semibold hover:underline">Configure</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
