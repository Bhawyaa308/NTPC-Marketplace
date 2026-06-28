import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, StatusBadge } from "../components/common";
import {
  CreditCard,
  Wallet,
  Building2,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { fetchOrders } from "../services/orders.service";
import {
  createPaymentForOrder,
  simulatePaymentSuccess,
} from "../services/payments.service";

export const Route = createFileRoute("/_employee/payments")({
  component: Payments,
});

type Method = "UPI" | "Card" | "Net Banking" | "Wallet";
type Step = 1 | 2 | 3 | 4 | 5 | 6;

async function loadRazorpayScript(): Promise<boolean> {
  if ((window as any).Razorpay) return true;

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

function Payments() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [step, setStep] = useState<Step>(1);
  const [method, setMethod] = useState<Method>("UPI");
  const [details, setDetails] = useState<Record<string, string>>({});

  const payableStatuses = ["PENDING", "RESERVED"];
  const isPayableOrder = (order: any) =>
    payableStatuses.includes((order?.status ?? "").toString().toUpperCase());

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const data = await fetchOrders();
      const payableOrders = data.filter(isPayableOrder);
      setOrders(payableOrders);

      if (payableOrders.length === 0) {
        setSelected(null);
        setStep(1);
      } else {
        setSelected((current: any) => {
          if (
            current &&
            payableOrders.some((o: any) => o.order_id === current.order_id)
          ) {
            return current;
          }
          return payableOrders[0];
        });
      }
    } catch (err) {
      console.error("Orders fetch error:", err);
      setOrders([]);
      setSelected(null);
    }
  }

  const finalizePaymentSuccess = async (orderId: string | number) => {
    try {
      await simulatePaymentSuccess(orderId);

      const freshData = await fetchOrders();
      const freshPayableOrders = freshData.filter(isPayableOrder);

      setOrders(freshPayableOrders);
      setSelected(freshPayableOrders[0] ?? null);
      setStep(5);
    } catch (err) {
      console.error("Payment success sync error:", err);
      setStep(6);
    }
  };

  const proceed = async () => {
    if (step === 3) {
      setStep(4);
      try {
        if (!selected) {
          setStep(6);
          return;
        }

        const razorpayKeyId = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID;
        const isDev = (import.meta as any).env.DEV;

        // Load Razorpay SDK if not already loaded
        const loaded = await loadRazorpayScript();

        if (!loaded) {
          throw new Error("Unable to load Razorpay SDK");
        }

        const razorpayOrder = await createPaymentForOrder(selected.order_id);
        const currentOrderId = selected.order_id;

        if (isDev && !razorpayKeyId) {
          await finalizePaymentSuccess(currentOrderId);
          return;
        }

        if (!razorpayKeyId) {
          throw new Error("Razorpay Key ID is not configured");
        }

        const rzp = new (window as any).Razorpay({
          key: razorpayKeyId,
          amount: Number(razorpayOrder?.amount || selected.amount * 100),
          currency: razorpayOrder?.currency || "INR",
          order_id: razorpayOrder?.id || razorpayOrder?.order_id,
          name: "NTPC Marketplace",
          description: `Payment for order ${currentOrderId}`,
          handler: async () => {
            try {
              await simulatePaymentSuccess(currentOrderId);

              const freshData = await fetchOrders();
              const freshPayableOrders = freshData.filter(isPayableOrder);

              setOrders(freshPayableOrders);
              setSelected(freshPayableOrders[0] ?? null);
              setStep(5);
            } catch (err) {
              console.error("Razorpay success callback error:", err);
              setStep(6);
            }
          },
          prefill: { name: "", email: "", contact: "" },
          theme: { color: "#2563eb" },
        });
        rzp.open();
      } catch (err) {
        console.error("Payment error:", err);
        setStep(6);
      }
    } else if (step < 3) {
      setStep((s) => (s + 1) as Step);
    }
  };
  if (!selected) {
    return (
      <div>
        <PageHeader title="Payments" subtitle="Settle dues securely." />

        <div className="ntpc-card p-8 text-center">No pending payments</div>
      </div>
    );
  }
  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Settle dues securely. NTPC payroll-linked options coming soon."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="ntpc-card p-2">
            <div className="flex items-center text-xs font-semibold">
              {["Summary", "Method", "Details", "Processing", "Result"].map(
                (label, i) => {
                  const stepIdx = Math.min(step, 5);
                  const reached =
                    i + 1 <= (stepIdx === 5 || stepIdx === 6 ? 5 : stepIdx);
                  return (
                    <div key={label} className="flex-1 flex items-center">
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center ${reached ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                      >
                        {i + 1}
                      </div>
                      <div
                        className={`px-2 ${reached ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {label}
                      </div>
                      {i < 4 && (
                        <div
                          className={`flex-1 h-px ${reached ? "bg-primary" : "bg-muted"}`}
                        />
                      )}
                    </div>
                  );
                },
              )}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-3">
              {orders.map((o) => (
                <button
                  key={o.order_id}
                  onClick={() => setSelected(o)}
                  className={`ntpc-card p-4 w-full text-left ${selected?.order_id === o.order_id ? "ring-2 ring-primary" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={o.listing?.image || "/placeholder.png"}
                      className="h-16 w-16 rounded-lg object-cover"
                      alt=""
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">
                        {o.listing.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Seller: {o.listing?.seller?.name || ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">
                        ₹{(o.amount ?? 0).toLocaleString("en-IN")}
                      </div>
                      <StatusBadge status={o.status} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="ntpc-card p-5">
              <h3 className="font-bold mb-3">Choose payment method</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(["UPI", "Card", "Net Banking", "Wallet"] as Method[]).map(
                  (m) => (
                    <label
                      key={m}
                      className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer hover:bg-muted ${method === m ? "ring-2 ring-primary" : ""}`}
                    >
                      <input
                        type="radio"
                        name="pm"
                        checked={method === m}
                        onChange={() => setMethod(m)}
                      />
                      {m === "UPI" && (
                        <CreditCard size={16} className="text-primary" />
                      )}
                      {m === "Card" && (
                        <CreditCard size={16} className="text-primary" />
                      )}
                      {m === "Net Banking" && (
                        <Building2 size={16} className="text-primary" />
                      )}
                      {m === "Wallet" && (
                        <Wallet size={16} className="text-primary" />
                      )}
                      <span className="text-sm font-medium">{m}</span>
                    </label>
                  ),
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="ntpc-card p-5 space-y-3">
              <h3 className="font-bold">Enter {method} details</h3>
              {method === "UPI" && (
                <Field label="UPI ID">
                  <input
                    className="ntpc-input"
                    placeholder="name@bank"
                    value={details.upi || ""}
                    onChange={(e) =>
                      setDetails({ ...details, upi: e.target.value })
                    }
                  />
                </Field>
              )}
              {method === "Card" && (
                <div className="space-y-3">
                  <Field label="Card Number">
                    <input
                      className="ntpc-input"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      value={details.card || ""}
                      onChange={(e) =>
                        setDetails({ ...details, card: e.target.value })
                      }
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Expiry (MM/YY)">
                      <input
                        className="ntpc-input"
                        placeholder="08/29"
                        maxLength={5}
                        value={details.exp || ""}
                        onChange={(e) =>
                          setDetails({ ...details, exp: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="CVV">
                      <input
                        className="ntpc-input"
                        placeholder="123"
                        maxLength={4}
                        type="password"
                        value={details.cvv || ""}
                        onChange={(e) =>
                          setDetails({ ...details, cvv: e.target.value })
                        }
                      />
                    </Field>
                  </div>
                </div>
              )}
              {method === "Net Banking" && (
                <Field label="Select Bank">
                  <select
                    className="ntpc-input"
                    value={details.bank || ""}
                    onChange={(e) =>
                      setDetails({ ...details, bank: e.target.value })
                    }
                  >
                    <option value="">Choose your bank…</option>
                    {["SBI", "HDFC", "ICICI", "Axis", "PNB", "Canara"].map(
                      (b) => (
                        <option key={b}>{b}</option>
                      ),
                    )}
                  </select>
                </Field>
              )}
              {method === "Wallet" && (
                <Field label="Select Wallet">
                  <select
                    className="ntpc-input"
                    value={details.wallet || ""}
                    onChange={(e) =>
                      setDetails({ ...details, wallet: e.target.value })
                    }
                  >
                    <option value="">Choose wallet…</option>
                    {["Paytm", "PhonePe", "Amazon Pay", "Mobikwik"].map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </Field>
              )}
              <div className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
                <ShieldCheck size={12} className="text-emerald-600" /> Payments
                are encrypted end-to-end.
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="ntpc-card p-10 flex flex-col items-center text-center">
              <Loader2 size={36} className="animate-spin text-primary" />
              <div className="font-bold mt-4">Processing payment…</div>
              <div className="text-sm text-muted-foreground">
                Please don't refresh the page.
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="ntpc-card p-10 flex flex-col items-center text-center">
              <CheckCircle2 size={48} className="text-emerald-600" />
              <div className="font-bold text-lg mt-3">Payment Successful</div>
              <div className="text-sm text-muted-foreground mt-1">
                ₹{(selected?.amount ?? 0).toLocaleString("en-IN")} paid via{" "}
                {method}.
              </div>
              <button
                onClick={() => {
                  setStep(1);
                  setMethod("UPI");
                  setDetails({});
                }}
                className="ntpc-btn-primary mt-5"
              >
                {orders.length > 0 ? "Pay another order" : "Done"}
              </button>
            </div>
          )}

          {step === 6 && (
            <div className="ntpc-card p-10 flex flex-col items-center text-center">
              <XCircle size={48} className="text-red-600" />
              <div className="font-bold text-lg mt-3">Payment Failed</div>
              <div className="text-sm text-muted-foreground mt-1">
                Something went wrong. No money was deducted.
              </div>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setStep(3)}
                  className="ntpc-btn-secondary"
                >
                  Try Again
                </button>
                <button onClick={() => setStep(1)} className="ntpc-btn-primary">
                  Choose another order
                </button>
              </div>
            </div>
          )}

          {step < 4 && (
            <div className="flex justify-between mt-2">
              <button
                onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
                disabled={step === 1}
                className="ntpc-btn-secondary disabled:opacity-40"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button onClick={proceed} className="ntpc-btn-primary">
                {step === 3 ? "Pay" : "Continue"} <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="ntpc-card p-5 h-fit">
          <h3 className="font-bold">Order Summary</h3>
          <div className="mt-3 flex gap-3 items-center">
            <img
              src={selected?.listing?.image || "/placeholder.png"}
              className="h-14 w-14 rounded-lg object-cover"
              alt=""
            />
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate">
                {selected?.listing?.title}
              </div>
              <div className="text-xs text-muted-foreground">
                {selected.listing.seller.name}
              </div>
            </div>
          </div>
          <div className="text-sm mt-4 space-y-1">
            <Row
              label="Item"
              value={`₹${selected?.amount?.toLocaleString("en-IN") || "0"}`}
            />
            <Row label="Platform fee" value="₹0" />
            <Row label="Taxes" value="₹0" />
            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">
                ₹{(selected?.amount ?? 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
          {step >= 2 && (
            <div className="text-xs text-muted-foreground mt-3">
              Method:{" "}
              <span className="font-semibold text-foreground">{method}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <div className="font-semibold mb-1">{label}</div>
      {children}
    </label>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
