import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  PageHeader,
  SearchBar,
  StatusBadge,
} from "../components/common";
import {
  activateAdminUser,
  deactivateAdminUser,
  fetchAdminUsers,
  type AdminUser,
} from "../services/admin.service";

export const Route = createFileRoute("/_admin/admin/users")({
  component: AdminUsers,
});

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatRole(role?: string) {
  if (!role) return "User";
  return role
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function getDepartment(user: AdminUser) {
  return user.department_name || user.department || "";
}

function getTownship(user: AdminUser) {
  return user.township_name || user.township || "";
}

function AdminUsers() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("ALL");
  const [township, setTownship] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      setUsers(await fetchAdminUsers());
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to load users.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const roles = useMemo(
    () =>
      Array.from(new Set(users.map((u) => u.role).filter(Boolean))).sort() as string[],
    [users],
  );

  const townships = useMemo(
    () =>
      Array.from(new Set(users.map(getTownship).filter(Boolean))).sort() as string[],
    [users],
  );

  const list = users.filter((u) => {
    const haystack = [
      u.name,
      u.employee_id,
      u.email,
      getDepartment(u),
      getTownship(u),
      u.role,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch = haystack.includes(q.toLowerCase());
    const matchesRole = role === "ALL" || u.role === role;
    const matchesTownship = township === "ALL" || getTownship(u) === township;
    const userStatus = u.is_active ? "ACTIVE" : "INACTIVE";
    const matchesStatus = status === "ALL" || userStatus === status;
    return matchesSearch && matchesRole && matchesTownship && matchesStatus;
  });

  const updateUserStatus = async (user: AdminUser) => {
    if (!user.user_id || updatingUserId) return;

    try {
      setUpdatingUserId(user.user_id);
      setError("");
      const updated = user.is_active
        ? await deactivateAdminUser(user.user_id)
        : await activateAdminUser(user.user_id);
      setUsers((current) =>
        current.map((item) =>
          item.user_id === updated.user_id ? updated : item,
        ),
      );
      setSelectedUser((current) =>
        current?.user_id === updated.user_id ? updated : current,
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to update account status.",
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Search and manage employee accounts."
        action={
          <div className="w-72">
            <SearchBar value={q} onChange={setQ} placeholder="Search users" />
          </div>
        }
      />
      <div className="ntpc-card p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <select
            className="ntpc-input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            {roles.map((item) => (
              <option key={item} value={item}>
                {formatRole(item)}
              </option>
            ))}
          </select>
          <select
            className="ntpc-input"
            value={township}
            onChange={(e) => setTownship(e.target.value)}
          >
            <option value="ALL">All Townships</option>
            {townships.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            className="ntpc-input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>
      {error ? (
        <div className="ntpc-card p-4 text-sm text-red-600 mb-4">{error}</div>
      ) : null}
      <div className="ntpc-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3 hidden md:table-cell">Employee ID</th>
              <th className="px-4 py-3 hidden md:table-cell">Township</th>
              <th className="px-4 py-3 hidden md:table-cell">Department</th>
              <th className="px-4 py-3 hidden lg:table-cell">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 hidden lg:table-cell">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-muted-foreground">
                  Loading users...
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-muted-foreground">
                  No users found.
                </td>
              </tr>
            ) : (
              list.map((u) => (
                <tr key={u.user_id}>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{u.name || "-"}</div>
                    <div className="text-xs text-muted-foreground">
                      {u.email || "-"}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {u.employee_id || "-"}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {getTownship(u) || "-"}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {getDepartment(u) || "-"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {formatRole(u.role)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={u.is_active ? "Active" : "Inactive"} />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {formatDate(u.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="ntpc-btn-secondary !py-1 !px-2 text-xs"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => void updateUserStatus(u)}
                      className="ntpc-btn-secondary !py-1 !px-2 text-xs"
                      disabled={updatingUserId === u.user_id}
                    >
                      {updatingUserId === u.user_id
                        ? "Updating..."
                        : u.is_active
                          ? "Deactivate"
                          : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={selectedUser !== null}
        onClose={() => setSelectedUser(null)}
        title="User Profile"
        footer={
          <button
            className="ntpc-btn-secondary"
            onClick={() => setSelectedUser(null)}
          >
            Close
          </button>
        }
      >
        {selectedUser ? (
          <div className="space-y-3 text-sm">
            <ProfileRow label="Name" value={selectedUser.name} />
            <ProfileRow label="Employee ID" value={selectedUser.employee_id} />
            <ProfileRow label="Email" value={selectedUser.email} />
            <ProfileRow label="Phone" value={selectedUser.phone} />
            <ProfileRow label="Township" value={getTownship(selectedUser)} />
            <ProfileRow label="Department" value={getDepartment(selectedUser)} />
            <ProfileRow label="Designation" value={selectedUser.designation} />
            <ProfileRow label="Role" value={formatRole(selectedUser.role)} />
            <div>
              <div className="font-semibold mb-1">Account Status</div>
              <StatusBadge
                status={selectedUser.is_active ? "Active" : "Inactive"}
              />
            </div>
            <ProfileRow label="Joined Date" value={formatDate(selectedUser.created_at)} />
            <ProfileRow label="Last Login" value={formatDate(selectedUser.last_login)} />
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>
      <div className="font-semibold mb-1">{label}</div>
      <div>{value || "-"}</div>
    </div>
  );
}
