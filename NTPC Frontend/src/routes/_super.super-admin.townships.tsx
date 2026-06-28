import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TOWNSHIPS } from "../data/mock";
import { PageHeader, StatusBadge } from "../components/common";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_super/super-admin/townships")({ component: TownshipsPage });

function TownshipsPage() {
  const [list, setList] = useState(TOWNSHIPS.map((t, i) => ({ id: `T-${i}`, name: t, employees: 60 + i * 13, active: i !== 8 })));
  return (
    <div>
      <PageHeader title="Townships" subtitle="Manage NTPC townships across India." action={<button className="ntpc-btn-primary"><Plus size={16} /> New Township</button>} />
      <div className="ntpc-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Township</th><th className="px-4 py-3">Employees</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {list.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-3 font-semibold">{t.name}</td>
                <td className="px-4 py-3">{t.employees}</td>
                <td className="px-4 py-3"><StatusBadge status={t.active ? "Active" : "Inactive"} /></td>
                <td className="px-4 py-3 text-right space-x-1">
                  <button className="ntpc-btn-secondary !py-1 !px-2 text-xs">Edit</button>
                  <button onClick={() => setList((a) => a.map((x) => x.id === t.id ? { ...x, active: !x.active } : x))} className="ntpc-btn-secondary !py-1 !px-2 text-xs">{t.active ? "Deactivate" : "Activate"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
