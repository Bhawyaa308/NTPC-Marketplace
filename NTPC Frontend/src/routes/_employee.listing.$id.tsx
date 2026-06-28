import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  MapPin,
  Truck,
  ShieldCheck,
  MessageSquare,
  Heart,
  Flag,
  BookmarkCheck,
  CheckCircle2,
} from "lucide-react";
import { createReservation } from "../services/reservations.service";
import { Modal } from "../components/common";
import api from "../lib/api";
import {
  addWishlistItem,
  removeWishlistItem,
  fetchWishlist,
} from "../services/wishlist.service";
export const Route = createFileRoute("/_employee/listing/$id")({
  component: ListingDetails,
});

function ListingDetails() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [l, setListing] = useState<any>(null);
  const [wishlisted, setWishlisted] = useState<boolean>(false);

  useEffect(() => {
    loadListing();
    loadWishlist();
  }, [id]);

  async function loadListing() {
    const res = await api.get(`/listings/${id}`);
    setListing(res.data);
  }
  async function loadWishlist() {
    try {
      const res = await fetchWishlist();
      const items = res?.data ?? res ?? [];
      // items expected to contain objects with `listing_id`
      setWishlisted(
        items.some((w: any) => String(w.listing_id) === String(id)),
      );
    } catch (err) {
      console.error("Failed to load wishlist", err);
    }
  }
  const [reserveOpen, setReserveOpen] = useState(false);
  const [reserveDone, setReserveDone] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const [reportSubject, setReportSubject] = useState("");

  const onReserve = async () => {
    try {
      await createReservation(l.listing_id);

      setReserveDone(true);
    } catch (err) {
      console.error(err);
      alert("Reservation failed");
    }
  };
  const onChat = async () => {
    try {
      const response = await api.post("/chat/rooms", {
        listing_id: l.listing_id,
      });

      const roomId =
        response.data?.room_id ??
        response.data?.id ??
        response.data?.data?.room_id ??
        response.data?.data?.id;
      if (roomId) {
        navigate({ to: "/messages", search: { c: String(roomId) } as any });
      } else {
        navigate({ to: "/messages" });
      }
    } catch (err) {
      console.error("Failed to open chat", err);
      navigate({ to: "/messages" });
    }
  };
  const onSubmitReport = () => {
    if (!reportSubject.trim()) return;
    // TODO: implement report submission via backend API
    // e.g. await reportsService.createReport({ listing_id: l.listing_id, subject: reportSubject, details })
    setReportDone(true);
  };
  if (!l) {
    return <div className="p-10">Loading...</div>;
  }
  const mainImage = l.image_urls?.[0] ?? "https://via.placeholder.com/500";
  const thumbnails: string[] =
    Array.isArray(l.image_urls) && l.image_urls.length > 0
      ? l.image_urls.slice(0, 4)
      : Array(4).fill("https://via.placeholder.com/150");
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
      <div>
        <div className="ntpc-card overflow-hidden">
          <img
            src={mainImage}
            alt={l.title}
            className="w-full aspect-[4/3] object-cover"
          />
        </div>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {thumbnails.map((src: string, i: number) => (
            <img
              key={i}
              src={src}
              alt=""
              className="aspect-square object-cover rounded-md border"
            />
          ))}
        </div>

        <div className="ntpc-card p-5 mt-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {l.category}
          </div>
          <h1 className="text-2xl font-bold mt-1">{l.title}</h1>
          <div className="text-3xl font-bold text-primary mt-2">
            ₹{l.price.toLocaleString("en-IN")}
          </div>
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {l.township}
            </span>
            <span>
              Condition:{" "}
              <span className="font-medium text-foreground">{l.condition}</span>
            </span>
            {/* backend does not provide postedAgo */}
          </div>
          <p className="mt-4 text-sm leading-relaxed">{l.description}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="ntpc-card p-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              {l.seller?.name
                ? l.seller.name
                    .split(" ")
                    .map((p: string) => p[0])
                    .join("")
                : ""}
            </div>
            <div className="min-w-0">
              <div className="font-semibold truncate">{l.seller?.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {l.seller?.designation} · {l.seller?.department}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <ShieldCheck size={14} className="text-emerald-600" /> Verified NTPC
            Employee
          </div>
          {l.seller?.transferring && (
            <div className="mt-3 rounded-lg bg-accent/10 border border-accent/30 text-accent-foreground p-3 text-xs flex items-start gap-2 text-orange-900">
              <Truck size={14} className="mt-0.5 text-accent shrink-0" />
              <span>
                Transferring to <strong>{l.seller?.destination}</strong>.
                Selling before relocation.
              </span>
            </div>
          )}
          <button
            onClick={() => {
              setReserveDone(false);
              setReserveOpen(true);
            }}
            className="ntpc-btn-primary w-full justify-center mt-4"
          >
            <BookmarkCheck size={16} /> Reserve Item
          </button>
          <button
            onClick={onChat}
            className="ntpc-btn-secondary w-full justify-center mt-2"
          >
            <MessageSquare size={16} /> Chat with Seller
          </button>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={async () => {
                try {
                  if (wishlisted) {
                    await removeWishlistItem(l.listing_id);

                    setWishlisted(false);
                  } else {
                    await addWishlistItem(l.listing_id);

                    setWishlisted(true);
                  }
                } catch (err) {
                  console.error(err);
                }
              }}
              className={`ntpc-btn-secondary justify-center ${wishlisted ? "text-red-600" : ""}`}
            >
              <Heart size={14} fill={wishlisted ? "currentColor" : "none"} />{" "}
              {wishlisted ? "Saved" : "Wishlist"}
            </button>
            <button
              onClick={() => {
                setReportDone(false);
                setReportSubject("");
                setReportOpen(true);
              }}
              className="ntpc-btn-secondary justify-center text-red-600 hover:bg-red-50"
            >
              <Flag size={14} /> Report
            </button>
          </div>
        </div>

        <div className="ntpc-card p-5 text-sm">
          <h3 className="font-bold mb-2">Safety tips</h3>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-xs">
            <li>Meet inside NTPC township premises.</li>
            <li>Inspect the item before paying.</li>
            <li>Pay only after confirming with the seller.</li>
          </ul>
        </div>

        <Link
          to="/marketplace"
          className="text-sm text-primary font-semibold hover:underline"
        >
          ← Back to Marketplace
        </Link>
      </div>

      <Modal
        open={reserveOpen}
        onClose={() => setReserveOpen(false)}
        title={reserveDone ? "Reservation Sent" : "Reserve this item"}
        footer={
          reserveDone ? (
            <>
              <button
                onClick={() => setReserveOpen(false)}
                className="ntpc-btn-secondary"
              >
                Close
              </button>
              <Link to="/reservations" className="ntpc-btn-primary">
                View Reservations
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() => setReserveOpen(false)}
                className="ntpc-btn-secondary"
              >
                Cancel
              </button>
              <button onClick={onReserve} className="ntpc-btn-primary">
                Confirm Reservation
              </button>
            </>
          )
        }
      >
        {reserveDone ? (
          <div className="flex items-start gap-3 text-sm">
            <CheckCircle2
              className="text-emerald-600 shrink-0 mt-0.5"
              size={18}
            />
            <div>
              Your reservation request for <strong>{l.title}</strong> has been
              sent to {l.seller.name}. You'll be notified when the seller
              approves.
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Reserving holds your spot in the queue. The seller will choose
            between all pending reservations.
          </div>
        )}
      </Modal>

      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title={reportDone ? "Report Submitted" : "Report this listing"}
        footer={
          reportDone ? (
            <button
              onClick={() => setReportOpen(false)}
              className="ntpc-btn-primary"
            >
              Close
            </button>
          ) : (
            <>
              <button
                onClick={() => setReportOpen(false)}
                className="ntpc-btn-secondary"
              >
                Cancel
              </button>
              <button onClick={onSubmitReport} className="ntpc-btn-primary">
                Submit Report
              </button>
            </>
          )
        }
      >
        {reportDone ? (
          <div className="flex items-start gap-3 text-sm">
            <CheckCircle2
              className="text-emerald-600 shrink-0 mt-0.5"
              size={18}
            />
            <div>Thanks. Our moderators will review this listing.</div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm">
              <div className="font-semibold mb-1">Subject</div>
              <input
                value={reportSubject}
                onChange={(e) => setReportSubject(e.target.value)}
                className="ntpc-input"
                placeholder="What's wrong with this listing?"
              />
            </label>
            <label className="block text-sm">
              <div className="font-semibold mb-1">Reason</div>
              <select className="ntpc-input">
                <option>Suspicious listing</option>
                <option>Inappropriate content</option>
                <option>Seller behavior</option>
                <option>Other</option>
              </select>
            </label>
            <label className="block text-sm">
              <div className="font-semibold mb-1">Details</div>
              <textarea rows={3} className="ntpc-input" />
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
}
