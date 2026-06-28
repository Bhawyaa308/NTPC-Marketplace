import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ADMIN_USERS } from "../data/mock";
import { PageHeader, StatusBadge, SearchBar } from "../components/common";

export const Route = createFileRoute("/_admin/admin/users")({ component: AdminUsers });

function AdminUsers() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState(ADMIN_USERS);
  const list = users.filter((u) => (u.name + u.email + u.department).toLowerCase().includes(q.toLowerCase()));
  const toggle = (id: string) => setUsers((arr) => arr.map((u) => u.id === id ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u));
  return (
    <div>
      <PageHeader title="Users" subtitle="Search and manage employee accounts." action={<div className="w-72"><SearchBar value={q} onChange={setQ} placeholder="Search users" /></div>} />
      <div className="ntpc-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">User</th><th className="px-4 py-3 hidden md:table-cell">Township</th><th className="px-4 py-3 hidden md:table-cell">Department</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {list.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <div className="font-semibold">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">{u.township}</td>
                <td className="px-4 py-3 hidden md:table-cell">{u.department}</td>
                <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => toggle(u.id)} className="ntpc-btn-secondary !py-1 !px-2 text-xs">
                    {u.status === "Active" ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
