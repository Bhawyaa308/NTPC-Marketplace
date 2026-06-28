import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Modal } from "../components/common";
import { TOWNSHIPS } from "../data/mock";

export const Route = createFileRoute("/_employee/settings")({
  component: Settings,
});

type PanelKey = string;

function Settings() {
  const [open, setOpen] = useState<PanelKey | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const sections = [
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
      items: ["Profile visibility", "Show contact to buyers", "Block list"],
    },
    {
      title: "Marketplace",
      items: ["Default township", "Preferred categories", "Saved searches"],
    },
  ];

  const close = () => {
    setOpen(null);
    setSaved(null);
  };
  const save = (label: string) => {
    setSaved(label);
    setTimeout(close, 900);
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Configure your NTPC Marketplace experience."
      />
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
                    onClick={() => setOpen(it)}
                    className="text-primary text-xs font-semibold hover:underline"
                  >
                    Manage
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={open !== null}
        onClose={close}
        title={open ?? ""}
        footer={
          <>
            <button className="ntpc-btn-secondary" onClick={close}>
              Cancel
            </button>
            <button className="ntpc-btn-primary" onClick={() => save(open!)}>
              Save
            </button>
          </>
        }
      >
        {saved ? (
          <div className="text-sm text-emerald-700">✓ {saved} updated.</div>
        ) : open === "Change password" ? (
          <div className="space-y-3 text-sm">
            <F label="Current password">
              <input type="password" className="ntpc-input" />
            </F>
            <F label="New password">
              <input type="password" className="ntpc-input" />
            </F>
            <F label="Confirm new password">
              <input type="password" className="ntpc-input" />
            </F>
          </div>
        ) : open === "Two-factor authentication" ? (
          <div className="space-y-2 text-sm">
            <Toggle label="Enable 2FA via authenticator app" />
            <Toggle label="Backup codes" />
          </div>
        ) : open === "Linked NTPC SSO" ? (
          <div className="text-sm">
            SSO linked to <strong>rohan@ntpc.co.in</strong>.{" "}
            <button className="text-primary font-semibold ml-2">Re-link</button>
          </div>
        ) : ["Email updates", "Push notifications", "Transfer alerts"].includes(
            open ?? "",
          ) ? (
          <div className="space-y-2 text-sm">
            <Toggle label="New messages" defaultOn />
            <Toggle label="Reservation updates" defaultOn />
            <Toggle label="Listings in my township" />
            <Toggle label="Weekly marketplace digest" />
          </div>
        ) : open === "Default township" || open === "Preferred Township" ? (
          <F label="Default township">
            <select className="ntpc-input">
              {TOWNSHIPS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </F>
        ) : open === "Preferred categories" ? (
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              "Electronics",
              "Furniture",
              "Appliances",
              "Vehicles",
              "Books",
              "Others",
            ].map((c) => (
              <Toggle key={c} label={c} />
            ))}
          </div>
        ) : open === "Saved searches" ? (
          <div className="text-sm space-y-2">
            <div className="flex justify-between border rounded p-2">
              <span>Sofas in Korba</span>
              <button className="text-xs text-red-600">Delete</button>
            </div>
            <div className="flex justify-between border rounded p-2">
              <span>Bikes under ₹50k</span>
              <button className="text-xs text-red-600">Delete</button>
            </div>
          </div>
        ) : open === "Profile visibility" ? (
          <div className="space-y-2 text-sm">
            <Radio
              name="vis"
              label="Visible to all NTPC employees"
              defaultChecked
            />
            <Radio name="vis" label="Visible to same township only" />
            <Radio name="vis" label="Hidden" />
          </div>
        ) : open === "Show contact to buyers" ? (
          <div className="space-y-2 text-sm">
            <Toggle label="Reveal phone after reservation" defaultOn />
            <Toggle label="Reveal email" />
          </div>
        ) : open === "Block list" ? (
          <div className="text-sm text-muted-foreground">
            You haven't blocked anyone.
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Configure your preference and save.
          </div>
        )}
      </Modal>
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
function Toggle({
  label,
  defaultOn = false,
}: {
  label: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <label className="flex items-center justify-between border rounded-lg p-3 cursor-pointer">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        className={`relative h-5 w-9 rounded-full transition ${on ? "bg-primary" : "bg-muted"}`}
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
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 border rounded p-2">
      <input type="radio" name={name} defaultChecked={defaultChecked} /> {label}
    </label>
  );
}
