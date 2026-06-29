import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal, PageHeader } from "../components/common";
import {
  createSuperAdminTownship,
  deleteSuperAdminTownship,
  fetchSuperAdminTownships,
  updateSuperAdminTownship,
  type Township,
} from "../services/super-admin.service";

export const Route = createFileRoute("/_super/super-admin/townships")({ component: TownshipsPage });

function TownshipsPage() {
  const [townships, setTownships] = useState<Township[]>([]);
  const [editing, setEditing] = useState<Township | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadTownships() {
    try {
      setLoading(true);
      setError("");
      setTownships(await fetchSuperAdminTownships());
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Failed to load townships.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTownships();
  }, []);

  function openCreate() {
    setEditing(null);
    setName("");
    setState("");
    setRegion("");
    setModalOpen(true);
  }

  function openEdit(township: Township) {
    setEditing(township);
    setName(township.name || "");
    setState(township.state || "");
    setRegion(township.region || "");
    setModalOpen(true);
  }

  async function saveTownship() {
    if (!name.trim()) {
      setError("Township name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      if (editing) {
        const updated = await updateSuperAdminTownship(editing.township_id, { name, state, region });
        setTownships((current) =>
          current.map((item) => item.township_id === updated.township_id ? updated : item),
        );
      } else {
        const created = await createSuperAdminTownship({ name, state, region });
        setTownships((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
      }
      setModalOpen(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Unable to save township.");
    } finally {
      setSaving(false);
    }
  }

  async function removeTownship(township: Township) {
    try {
      setSaving(true);
      setError("");
      await deleteSuperAdminTownship(township.township_id);
      setTownships((current) => current.filter((item) => item.township_id !== township.township_id));
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Unable to delete township.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Townships"
        subtitle="Manage NTPC townships across India."
        action={<button className="ntpc-btn-primary" onClick={openCreate}><Plus size={16} /> New Township</button>}
      />
      {error ? <div className="ntpc-card p-4 text-sm text-red-600 mb-4">{error}</div> : null}
      <div className="ntpc-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Township</th>
              <th className="px-4 py-3 hidden md:table-cell">State</th>
              <th className="px-4 py-3 hidden md:table-cell">Region</th>
              <th className="px-4 py-3">Employees</th>
              <th className="px-4 py-3">Listings</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-muted-foreground">Loading townships...</td></tr>
            ) : townships.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-muted-foreground">No townships found.</td></tr>
            ) : (
              townships.map((township) => (
                <tr key={township.township_id}>
                  <td className="px-4 py-3 font-semibold">{township.name}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{township.state || "-"}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{township.region || "-"}</td>
                  <td className="px-4 py-3">{township.total_employees ?? 0}</td>
                  <td className="px-4 py-3">{township.total_listings ?? 0}</td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <button className="ntpc-btn-secondary !py-1 !px-2 text-xs" onClick={() => openEdit(township)}>Edit</button>
                    <button className="ntpc-btn-secondary !py-1 !px-2 text-xs text-red-600 hover:bg-red-50" onClick={() => void removeTownship(township)} disabled={saving}>Delete</button>
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
        title={editing ? "Edit Township" : "New Township"}
        footer={
          <>
            <button className="ntpc-btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button>
            <button className="ntpc-btn-primary" onClick={() => void saveTownship()} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <label className="block">
            <div className="text-xs font-semibold text-muted-foreground mb-1">Township Name</div>
            <input className="ntpc-input" value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="block">
            <div className="text-xs font-semibold text-muted-foreground mb-1">State</div>
            <input className="ntpc-input" value={state} onChange={(event) => setState(event.target.value)} />
          </label>
          <label className="block">
            <div className="text-xs font-semibold text-muted-foreground mb-1">Region</div>
            <input className="ntpc-input" value={region} onChange={(event) => setRegion(event.target.value)} />
          </label>
        </div>
      </Modal>
    </div>
  );
}
