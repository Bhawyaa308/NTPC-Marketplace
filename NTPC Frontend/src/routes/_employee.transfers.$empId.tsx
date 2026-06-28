import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowLeft, Calendar, Package, MapPin } from "lucide-react";
import { TRANSFER_EMPLOYEES } from "../data/mock";
import { ListingCard } from "../components/ListingCard";
import { PageHeader, EmptyState } from "../components/common";
import { getEmployeeListings } from "../data/store";

export const Route = createFileRoute("/_employee/transfers/$empId")({ component: TransferEmployee });

function TransferEmployee() {
  const { empId } = Route.useParams();
  const emp = TRANSFER_EMPLOYEES.find((e) => e.id === empId);
  if (!emp) {
    return (
      <div>
        <Link to="/transfers" className="text-sm text-primary font-semibold hover:underline">← Back to Transfers</Link>
        <EmptyState title="Employee not found" body="This transferring employee profile is unavailable." />
      </div>
    );
  }
  const listings = getEmployeeListings(emp.name);

  return (
    <div className="space-y-6">
      <Link to="/transfers" className="text-sm text-primary font-semibold hover:underline inline-flex items-center gap-1"><ArrowLeft size={14} /> Back to Transfers</Link>
      <PageHeader title={emp.name} subtitle={`${emp.designation} · ${emp.department}`} />

      <div className="ntpc-card p-5">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{emp.from}</span>
            <ArrowRight size={16} className="text-muted-foreground" />
            <span className="font-semibold text-primary">{emp.to}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground"><Calendar size={14} /> Moves on {emp.movingOn}</div>
          <div className="flex items-center gap-2 text-muted-foreground"><Package size={14} /> {listings.length} active listings</div>
          <div className="flex items-center gap-2 text-muted-foreground"><MapPin size={14} /> Currently in {emp.from}</div>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-bold mb-4">Listings from {emp.name}</h2>
        {listings.length === 0 ? (
          <EmptyState title="No active listings" body="This employee hasn't posted anything yet." />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </section>
    </div>
  );
}
