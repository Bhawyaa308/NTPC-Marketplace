import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal, PageHeader } from "../components/common";
import {
  createSuperAdminDepartment,
  deleteSuperAdminDepartment,
  fetchSuperAdminDepartments,
  updateSuperAdminDepartment,
  type Department,
} from "../services/super-admin.service";

export const Route = createFileRoute("/_super/super-admin/departments")({ component: Departments });

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editing, setEditing] = useState<Department | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadDepartments() {
    try {
      setLoading(true);
      setError("");
      setDepartments(await fetchSuperAdminDepartments());
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Failed to load departments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDepartments();
  }, []);

  function openCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setModalOpen(true);
  }

  function openEdit(department: Department) {
    setEditing(department);
    setName(department.department_name || "");
    setDescription(department.description || "");
    setModalOpen(true);
  }

  async function saveDepartment() {
    if (!name.trim()) {
      setError("Department name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      if (editing) {
        const updated = await updateSuperAdminDepartment(editing.department_id, {
          department_name: name,
          description,
        });
        setDepartments((current) =>
          current.map((item) => item.department_id === updated.department_id ? updated : item),
        );
      } else {
        const created = await createSuperAdminDepartment({ department_name: name, description });
        setDepartments((current) => [...current, created].sort((a, b) => a.department_name.localeCompare(b.department_name)));
      }
      setModalOpen(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Unable to save department.");
    } finally {
      setSaving(false);
    }
  }

  async function removeDepartment(department: Department) {
    try {
      setSaving(true);
      setError("");
      await deleteSuperAdminDepartment(department.department_id);
      setDepartments((current) => current.filter((item) => item.department_id !== department.department_id));
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Unable to delete department.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle="Manage NTPC departments across the organization."
        action={<button className="ntpc-btn-primary" onClick={openCreate}><Plus size={16} /> New Department</button>}
      />
      {error ? <div className="ntpc-card p-4 text-sm text-red-600 mb-4">{error}</div> : null}
      <div className="ntpc-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3 hidden md:table-cell">Description</th>
              <th className="px-4 py-3">Employees</th>
              <th className="px-4 py-3 hidden lg:table-cell">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-muted-foreground">Loading departments...</td></tr>
            ) : departments.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-muted-foreground">No departments found.</td></tr>
            ) : (
              departments.map((department) => (
                <tr key={department.department_id}>
                  <td className="px-4 py-3 font-semibold">{department.department_name}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{department.description || "-"}</td>
                  <td className="px-4 py-3">{department.total_employees ?? 0}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">{formatDate(department.created_at)}</td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <button className="ntpc-btn-secondary !py-1 !px-2 text-xs" onClick={() => openEdit(department)}>Edit</button>
                    <button className="ntpc-btn-secondary !py-1 !px-2 text-xs text-red-600 hover:bg-red-50" onClick={() => void removeDepartment(department)} disabled={saving}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Department" : "New Department"}
        footer={
          <>
            <button className="ntpc-btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button>
            <button className="ntpc-btn-primary" onClick={() => void saveDepartment()} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <label className="block">
            <div className="text-xs font-semibold text-muted-foreground mb-1">Department Name</div>
            <input className="ntpc-input" value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="block">
            <div className="text-xs font-semibold text-muted-foreground mb-1">Description</div>
            <textarea className="ntpc-input" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
        </div>
      </Modal>
    </div>
  );
}
