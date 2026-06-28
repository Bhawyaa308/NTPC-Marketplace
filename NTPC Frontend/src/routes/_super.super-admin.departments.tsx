import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DEPARTMENTS } from "../data/mock";
import { PageHeader, StatusBadge } from "../components/common";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_super/super-admin/departments")({ component: Departments });

function Departments() {
  const [list, setList] = useState(DEPARTMENTS);
  return (
    <div>
      <PageHeader title="Departments" subtitle="Manage NTPC departments across the organization." action={<button className="ntpc-btn-primary"><Plus size={16} /> New Department</button>} />
      <div className="ntpc-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Department</th><th className="px-4 py-3">Head</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {list.map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-3 font-semibold">{d.name}</td>
                <td className="px-4 py-3">{d.head}</td>
                <td className="px-4 py-3"><StatusBadge status={d.active ? "Active" : "Inactive"} /></td>
                <td className="px-4 py-3 text-right space-x-1">
                  <button className="ntpc-btn-secondary !py-1 !px-2 text-xs">Edit</button>
                  <button onClick={() => setList((a) => a.map((x) => x.id === d.id ? { ...x, active: !x.active } : x))} className="ntpc-btn-secondary !py-1 !px-2 text-xs">{d.active ? "Deactivate" : "Activate"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
