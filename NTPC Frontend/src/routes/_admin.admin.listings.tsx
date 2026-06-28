import { createFileRoute } from "@tanstack/react-router";
import { LISTINGS } from "../data/mock";
import { PageHeader, StatusBadge } from "../components/common";
import { useStore, actions } from "../data/store";

export const Route = createFileRoute("/_admin/admin/listings")({ component: AdminListings });

function AdminListings() {
  const statusMap = useStore((s) => s.listingStatus);
  return (
    <div>
      <PageHeader title="All Listings" subtitle="Moderate active listings on the platform." />
      <div className="ntpc-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Listing</th>
              <th className="px-4 py-3 hidden md:table-cell">Seller</th>
              <th className="px-4 py-3 hidden md:table-cell">Township</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {LISTINGS.slice(0, 14).map((l) => {
              const status = statusMap[l.id] ?? "Active";
              const removed = status === "Removed";
              const hidden = status === "Hidden";
              return (
                <tr key={l.id} className={removed ? "opacity-50" : ""}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={l.image} alt="" className="h-10 w-10 rounded object-cover" />
                      <div><div className="font-semibold">{l.title}</div><div className="text-xs text-muted-foreground">{l.category}</div></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">{l.seller.name}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{l.township}</td>
                  <td className="px-4 py-3 font-semibold">₹{l.price.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3"><StatusBadge status={status === "Removed" ? "Cancelled" : status === "Hidden" ? "Inactive" : "Active"} /></td>
                  <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                    {!removed && !hidden && (
                      <button onClick={() => actions.setListingStatus(l.id, "Hidden")} className="ntpc-btn-secondary !py-1 !px-2 text-xs">Hide</button>
                    )}
                    {hidden && (
                      <button onClick={() => actions.setListingStatus(l.id, "Active")} className="ntpc-btn-secondary !py-1 !px-2 text-xs">Restore</button>
                    )}
                    {!removed ? (
                      <button onClick={() => actions.setListingStatus(l.id, "Removed")} className="ntpc-btn-secondary !py-1 !px-2 text-xs text-red-600 hover:bg-red-50">Remove</button>
                    ) : (
                      <button onClick={() => actions.setListingStatus(l.id, "Active")} className="ntpc-btn-secondary !py-1 !px-2 text-xs">Restore</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
