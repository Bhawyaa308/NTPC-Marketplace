import { useSyncExternalStore } from "react";
import {
  LISTINGS,
  NOTIFICATIONS,
  CONVERSATIONS,
  MESSAGES,
  RESERVATIONS,
  TRANSFER_EMPLOYEES,
  type Listing,
} from "./mock";

type Msg = { id: string; from: "me" | "them"; text: string; time: string };
type Conv = { id: string; name: string; role: string; last: string; time: string; unread: number };
type Notif = { id: string; title: string; body: string; time: string; unread: boolean };
type Reservation = { id: string; listing: Listing; status: string; date: string; buyer: string };
type ListingStatus = "Active" | "Reserved" | "Sold" | "Expired" | "Hidden" | "Removed";

type State = {
  wishlist: string[];
  notifications: Notif[];
  conversations: Conv[];
  messagesByConv: Record<string, Msg[]>;
  reservations: Reservation[];
  myListings: (Listing & { status: ListingStatus })[];
  listingStatus: Record<string, ListingStatus>;
};

const seedConvMessages = (): Record<string, Msg[]> => {
  const variants: Record<string, Msg[]> = {
    C1: [
      { id: "m1", from: "them", text: "Hi! Is the TV still available?", time: "10:02 AM" },
      { id: "m2", from: "me", text: "Yes, it is. Are you in Dadri township?", time: "10:04 AM" },
      { id: "m3", from: "them", text: "Yes, Block C-12. Can I see it tomorrow?", time: "10:06 AM" },
      { id: "m4", from: "me", text: "Sure, come by after 6 PM.", time: "10:07 AM" },
      { id: "m5", from: "them", text: "Sure, you can pick it up Sunday.", time: "10:09 AM" },
    ],
    C2: [
      { id: "m1", from: "me", text: "Hi Priya, is the sofa still available?", time: "09:10 AM" },
      { id: "m2", from: "them", text: "Yes, the sofa is still available.", time: "09:12 AM" },
      { id: "m3", from: "them", text: "Sending pictures shortly.", time: "09:14 AM" },
    ],
    C3: [
      { id: "m1", from: "them", text: "Hello, interested in your bike listing?", time: "Yesterday" },
      { id: "m2", from: "me", text: "Yes, what's your best price?", time: "Yesterday" },
      { id: "m3", from: "them", text: "Price is negotiable.", time: "Yesterday" },
    ],
    C4: [
      { id: "m1", from: "me", text: "Confirming pickup at 5 PM Friday.", time: "Mon" },
      { id: "m2", from: "them", text: "Thanks for confirming!", time: "Mon" },
    ],
  };
  CONVERSATIONS.forEach((c) => {
    if (!variants[c.id]) variants[c.id] = [{ id: "m0", from: "them", text: c.last, time: c.time }];
  });
  return variants;
};

const state: State = {
  wishlist: LISTINGS.slice(0, 3).map((l) => l.id),
  notifications: NOTIFICATIONS.map((n) => ({ ...n })),
  conversations: CONVERSATIONS.map((c) => ({ ...c })),
  messagesByConv: seedConvMessages(),
  reservations: RESERVATIONS.map((r) => ({ ...r, buyer: "Rohan Mehta" })),
  myListings: LISTINGS.slice(0, 8).map((l, i) => ({
    ...l,
    status: (["Active", "Active", "Reserved", "Sold", "Active", "Expired", "Active", "Reserved"] as ListingStatus[])[i],
  })),
  listingStatus: Object.fromEntries(LISTINGS.map((l) => [l.id, "Active" as ListingStatus])),
};

// also seed pending reservations on first myListing so seller flow has data
state.reservations.push(
  { id: "R-101", listing: state.myListings[0], status: "Pending", date: "13 Jun 2026", buyer: "Anil Kumar" },
  { id: "R-102", listing: state.myListings[0], status: "Pending", date: "14 Jun 2026", buyer: "Vikram Singh" },
  { id: "R-103", listing: state.myListings[1], status: "Pending", date: "15 Jun 2026", buyer: "Deepa Nair" },
);

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}
export const getState = () => state;

const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
export const actions = {
  toggleWishlist(id: string) {
    state.wishlist = state.wishlist.includes(id)
      ? state.wishlist.filter((x) => x !== id)
      : [...state.wishlist, id];
    emit();
  },
  isWishlisted(id: string) { return state.wishlist.includes(id); },

  markNotifRead(id: string) {
    state.notifications = state.notifications.map((n) => n.id === id ? { ...n, unread: false } : n);
    emit();
  },
  markAllNotifRead() {
    state.notifications = state.notifications.map((n) => ({ ...n, unread: false }));
    emit();
  },
  unreadNotifCount() { return state.notifications.filter((n) => n.unread).length; },

  ensureConversationWith(listing: Listing): string {
    const existing = state.conversations.find((c) => c.name === listing.seller.name);
    if (existing) return existing.id;
    const id = `C${Date.now()}`;
    state.conversations = [
      { id, name: listing.seller.name, role: `${listing.seller.designation} · ${listing.township}`, last: "Conversation started", time: "now", unread: 0 },
      ...state.conversations,
    ];
    state.messagesByConv[id] = [
      { id: "m0", from: "me", text: `Hi! I'm interested in your "${listing.title}".`, time: now() },
    ];
    emit();
    return id;
  },
  sendMessage(convId: string, text: string) {
    if (!text.trim()) return;
    const msg: Msg = { id: `m${Date.now()}`, from: "me", text: text.trim(), time: now() };
    state.messagesByConv[convId] = [...(state.messagesByConv[convId] || []), msg];
    state.conversations = state.conversations.map((c) => c.id === convId ? { ...c, last: msg.text, time: "now", unread: 0 } : c);
    emit();
  },

  createReservation(listing: Listing) {
    const r: Reservation = {
      id: `R-${Math.floor(Math.random() * 9000 + 1000)}`,
      listing, status: "Pending", date: today(), buyer: "Rohan Mehta",
    };
    state.reservations = [r, ...state.reservations];
    emit();
    return r.id;
  },
  approveReservation(id: string) {
    const target = state.reservations.find((r) => r.id === id);
    if (!target) return;
    state.reservations = state.reservations.map((r) => {
      if (r.id === id) return { ...r, status: "Approved" };
      if (r.listing.id === target.listing.id && r.status === "Pending") return { ...r, status: "Rejected" };
      return r;
    });
    state.myListings = state.myListings.map((l) => l.id === target.listing.id ? { ...l, status: "Reserved" } : l);
    emit();
  },
  rejectReservation(id: string) {
    state.reservations = state.reservations.map((r) => r.id === id ? { ...r, status: "Rejected" } : r);
    emit();
  },

  createListing(input: Omit<Listing, "id" | "postedAgo" | "featured">) {
    const id = `L-${Math.floor(Math.random() * 9000 + 1000)}`;
    const newListing = { ...input, id, postedAgo: "just now" } as Listing;
    state.myListings = [{ ...newListing, status: "Active" }, ...state.myListings];
    state.listingStatus[id] = "Active";
    emit();
    return id;
  },
  setListingStatus(id: string, status: ListingStatus) {
    state.listingStatus[id] = status;
    state.myListings = state.myListings.map((l) => l.id === id ? { ...l, status } : l);
    emit();
  },
};

export function getEmployeeListings(empName: string): Listing[] {
  return LISTINGS.filter((l) => l.seller.name === empName);
}
export function getTransferEmployee(id: string) {
  return TRANSFER_EMPLOYEES.find((e) => e.id === id);
}
