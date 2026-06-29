export const TOWNSHIPS = [
  "Dadri", "Singrauli", "Rihand", "Korba", "Vindhyachal", "Ramagundam",
  "Talcher Kaniha", "Farakka", "Kahalgaon", "Sipat", "Mouda", "Solapur",
];

export const CATEGORIES = [
  { id: "electronics", name: "Electronics", icon: "Tv" },
  { id: "furniture", name: "Furniture", icon: "Sofa" },
  { id: "appliances", name: "Appliances", icon: "WashingMachine" },
  { id: "vehicles", name: "Vehicles", icon: "Car" },
  { id: "books", name: "Books", icon: "BookOpen" },
  { id: "others", name: "Others", icon: "Package" },
];

export type Listing = {
  id: string;
  title: string;
  price: number;
  category: string;
  township: string;
  image: string;
  seller: { name: string; designation: string; department: string; transferring?: boolean; destination?: string };
  description: string;
  postedAgo: string;
  condition: string;
  featured?: boolean;
};

const img = (q: string, i: number) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=800&q=70&sig=${i}`;

const photos = [
  "photo-1593359677879-a4bb92f829d1",
  "photo-1555041469-a586c61ea9bc",
  "photo-1567538096630-e0c55bd6374c",
  "photo-1581235720704-06d3acfcb36f",
  "photo-1542291026-7eec264c27ff",
  "photo-1505740420928-5e560c06d30e",
  "photo-1517336714731-489689fd1ca8",
  "photo-1556228720-195a672e8a03",
  "photo-1606813907291-d86efa9b94db",
  "photo-1484101403633-562f891dc89a",
  "photo-1493663284031-b7e3aefcae8e",
  "photo-1519985176271-adb1088fa94c",
];

const sellers = [
  { name: "Rohan Mehta", designation: "Sr. Engineer", department: "Operations" },
  { name: "Priya Sharma", designation: "Manager", department: "HR" },
  { name: "Anil Kumar", designation: "Engineer", department: "Maintenance" },
  { name: "Sneha Iyer", designation: "AGM", department: "Finance" },
  { name: "Vikram Singh", designation: "Engineer", department: "Civil" },
  { name: "Deepa Nair", designation: "DGM", department: "Projects" },
];

export const LISTINGS: Listing[] = Array.from({ length: 24 }).map((_, i) => {
  const cat = CATEGORIES[i % CATEGORIES.length];
  const seller = sellers[i % sellers.length];
  const transferring = i % 3 === 0;
  const titles: Record<string, string[]> = {
    electronics: ["Sony Bravia 43\" LED TV", "Apple MacBook Air M2", "Bose SoundLink Speaker", "Canon DSLR 1500D"],
    furniture: ["Teakwood 3-Seater Sofa", "Queen-size Bed with Storage", "6-seat Dining Table", "Executive Office Chair"],
    appliances: ["LG 7kg Front-load Washer", "Samsung 253L Refrigerator", "Bajaj Microwave 25L", "Voltas 1.5T Inverter AC"],
    vehicles: ["Honda Activa 6G (2022)", "Hero Splendor Plus (2021)", "Maruti Alto K10 (2020)", "Royal Enfield Classic 350"],
    books: ["GATE 2024 Engineering Set", "Power Plant Engineering — PK Nag", "Children's Encyclopedia Pack", "Hindi Literature Collection"],
    others: ["Decathlon Treadmill", "Inflatable Kids Pool", "Garden Tool Set", "Pressure Cooker Combo"],
  };
  return {
    id: `L-${1000 + i}`,
    title: titles[cat.id][i % 4],
    price: [2500, 5500, 12000, 18500, 24000, 42000, 65000][i % 7],
    category: cat.id,
    township: TOWNSHIPS[i % TOWNSHIPS.length],
    image: img(photos[i % photos.length], i),
    seller: {
      ...seller,
      transferring,
      destination: transferring ? TOWNSHIPS[(i + 4) % TOWNSHIPS.length] : undefined,
    },
    description:
      "Well-maintained, used in NTPC township quarters. No major issues. Pickup preferred. Sold due to upcoming township transfer.",
    postedAgo: ["2h ago", "1d ago", "3d ago", "5d ago", "1w ago"][i % 5],
    condition: ["Like New", "Excellent", "Good", "Fair"][i % 4],
    featured: i < 4,
  };
});

export const TRANSFER_EMPLOYEES = sellers.slice(0, 6).map((s, i) => ({
  ...s,
  id: `E-${i}`,
  from: TOWNSHIPS[i % TOWNSHIPS.length],
  to: TOWNSHIPS[(i + 3) % TOWNSHIPS.length],
  movingOn: ["15 Jul 2026", "22 Jul 2026", "01 Aug 2026", "10 Aug 2026", "18 Aug 2026", "25 Aug 2026"][i],
  listings: 3 + (i % 5),
}));

export const RESERVATIONS = [
  { id: "R-001", listing: LISTINGS[0], status: "Pending", date: "12 Jun 2026" },
  { id: "R-002", listing: LISTINGS[3], status: "Approved", date: "10 Jun 2026" },
  { id: "R-003", listing: LISTINGS[5], status: "Rejected", date: "07 Jun 2026" },
  { id: "R-004", listing: LISTINGS[7], status: "Expired", date: "01 Jun 2026" },
];

export const ORDERS = [
  { id: "O-1001", listing: LISTINGS[1], amount: 5500, status: "Pending", date: "14 Jun" },
  { id: "O-1002", listing: LISTINGS[2], amount: 12000, status: "Paid", date: "11 Jun" },
  { id: "O-1003", listing: LISTINGS[4], amount: 24000, status: "Completed", date: "05 Jun" },
  { id: "O-1004", listing: LISTINGS[6], amount: 2500, status: "Cancelled", date: "02 Jun" },
  { id: "O-1005", listing: LISTINGS[8], amount: 18500, status: "Completed", date: "30 May" },
];

export const NOTIFICATIONS = [
  { id: "N1", title: "Your reservation was approved", body: "Sony Bravia 43\" LED TV — by Rohan Mehta", time: "2h ago", unread: true },
  { id: "N2", title: "New message from Priya Sharma", body: "Yes, the sofa is still available.", time: "5h ago", unread: true },
  { id: "N3", title: "Listing sold", body: "Your Bajaj Microwave 25L was marked sold.", time: "1d ago", unread: false },
  { id: "N4", title: "Transfer alert: Dadri → Korba", body: "12 new transfer listings available this week.", time: "2d ago", unread: false },
];

export const CONVERSATIONS = [
  { id: "C1", name: "Rohan Mehta", role: "Sr. Engineer · Dadri", last: "Sure, you can pick it up Sunday.", time: "2h", unread: 2 },
  { id: "C2", name: "Priya Sharma", role: "Manager · Korba", last: "Sending pictures shortly.", time: "5h", unread: 0 },
  { id: "C3", name: "Anil Kumar", role: "Engineer · Singrauli", last: "Price is negotiable.", time: "1d", unread: 1 },
  { id: "C4", name: "Sneha Iyer", role: "AGM · Vindhyachal", last: "Thanks for confirming!", time: "3d", unread: 0 },
];

export const MESSAGES = [
  { id: "M1", from: "them", text: "Hi! Is the TV still available?", time: "10:02 AM" },
  { id: "M2", from: "me", text: "Yes, it is. Are you in Dadri township?", time: "10:04 AM" },
  { id: "M3", from: "them", text: "Yes, Block C-12. Can I see it tomorrow?", time: "10:06 AM" },
  { id: "M4", from: "me", text: "Sure, come by after 6 PM.", time: "10:07 AM" },
  { id: "M5", from: "them", text: "Sure, you can pick it up Sunday.", time: "10:09 AM" },
];

export const ADMIN_USERS = sellers.map((s, i) => ({
  id: `U-${100 + i}`,
  name: s.name,
  email: `${s.name.split(" ")[0].toLowerCase()}@ntpc.co.in`,
  township: TOWNSHIPS[i % TOWNSHIPS.length],
  department: s.department,
  status: i % 4 === 0 ? "Inactive" : "Active",
  joined: "Jan 2024",
}));

export const DEPARTMENTS = [
  "Operations", "Maintenance", "HR", "Finance", "Civil", "Projects", "Safety", "IT",
].map((d, i) => ({ id: `D-${i}`, name: d, head: sellers[i % sellers.length].name, active: i !== 6 }));

export const AUDIT_LOGS = Array.from({ length: 10 }).map((_, i) => ({
  id: `A-${i}`,
  actor: sellers[i % sellers.length].name,
  event: ["LOGIN", "LISTING_CREATED", "USER_DEACTIVATED", "REPORT_RESOLVED", "DEPARTMENT_UPDATED"][i % 5],
  detail: "System change recorded",
  time: `${i + 1}h ago`,
}));
