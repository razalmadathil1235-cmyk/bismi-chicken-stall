import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2,
  LogOut,
  MapPin,
  Phone,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Bike,
  ChefHat,
  XCircle,
  Package,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/owner")({
  head: () => ({
    meta: [
      { title: "Owner Orders Desk — Bismi Chicken Stall" },
      {
        name: "description",
        content:
          "Private orders desk for Bismi Chicken Stall, Kuttikatoor. Track live orders, customer details and delivery pins.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Owner Orders Desk — Bismi Chicken Stall" },
      {
        property: "og:description",
        content: "Private orders desk for Bismi Chicken Stall, Kuttikatoor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OwnerPage,
});

type OrderItem = { name: string; qty: number };

type Order = {
  id: string;
  created_at: string;
  customer_name: string;
  phone: string;
  address: string;
  cut_style: string;
  notes: string | null;
  items: OrderItem[];
  total_kg: number;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  status: string;
};

const STATUSES = [
  { key: "new", label: "New", icon: Clock },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "out", label: "Out for delivery", icon: Bike },
  { key: "done", label: "Delivered", icon: CheckCircle2 },
  { key: "cancelled", label: "Cancelled", icon: XCircle },
] as const;

function statusMeta(key: string) {
  return STATUSES.find((s) => s.key === key) ?? STATUSES[0];
}

function OwnerPage() {
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null);
      setEmail(session?.user.email ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
      setEmail(data.session?.user.email ?? null);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const checkRole = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .eq("role", "admin")
      .maybeSingle();
    setIsOwner(!!data);
  }, []);

  useEffect(() => {
    if (userId) void checkRole(userId);
    else setIsOwner(false);
  }, [userId, checkRole]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!userId) return <SignIn />;
  if (!isOwner)
    return (
      <ClaimOwner
        email={email}
        onClaimed={() => userId && checkRole(userId)}
      />
    );

  return <OrdersDesk email={email} />;
}

/* ---------- Sign in ---------- */

function SignIn() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const fn =
      mode === "in"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/owner` },
          });
    const { error } = await fn;
    if (error) setMsg(error.message);
    else if (mode === "up") setMsg("Account created. You can sign in now.");
    setBusy(false);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-secondary/40 px-4">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-7 shadow-warm">
        <span className="grid size-12 place-items-center rounded-2xl bg-accent/10 text-accent">
          <ShieldCheck className="size-6" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-600 text-foreground">
          Owner sign in
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Private orders desk for Bismi Chicken Stall.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <button
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-accent-foreground disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {mode === "in" ? "Sign in" : "Create owner account"}
          </button>
        </form>

        {msg && (
          <p className="mt-3 text-center text-xs font-semibold text-destructive">
            {msg}
          </p>
        )}

        <button
          onClick={() => {
            setMode(mode === "in" ? "up" : "in");
            setMsg("");
          }}
          className="mt-4 w-full text-center text-xs font-semibold text-accent"
        >
          {mode === "in"
            ? "First time? Create the owner account"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

/* ---------- Claim owner ---------- */

function ClaimOwner({
  email,
  onClaimed,
}: {
  email: string | null;
  onClaimed: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const claim = async () => {
    setBusy(true);
    setMsg("");
    const { data, error } = await supabase.rpc("claim_owner");
    if (error) setMsg(error.message);
    else if (data === true) onClaimed();
    else setMsg("An owner account already exists. Sign in with that account.");
    setBusy(false);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-secondary/40 px-4">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-7 text-center shadow-warm">
        <h1 className="font-display text-2xl font-600 text-foreground">
          Not the owner yet
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Signed in as {email}. If this is the shop&apos;s account, claim owner
          access below — this works only once.
        </p>
        <button
          onClick={claim}
          disabled={busy}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-accent-foreground disabled:opacity-60"
        >
          {busy && <Loader2 className="size-4 animate-spin" />} Claim owner
          access
        </button>
        {msg && (
          <p className="mt-3 text-xs font-semibold text-destructive">{msg}</p>
        )}
        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-4 text-xs font-semibold text-muted-foreground"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

/* ---------- Orders desk ---------- */

function OrdersDesk({ email }: { email: string | null }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("live");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setOrders((data ?? []) as unknown as Order[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const channel = supabase
      .channel("orders-desk")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          void load();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [load]);

  const setStatus = async (id: string, status: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o)),
    );
    await supabase.from("orders").update({ status }).eq("id", id);
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  const visible = useMemo(() => {
    if (filter === "live")
      return orders.filter((o) => ["new", "preparing", "out"].includes(o.status));
    if (filter === "all") return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const tabs = [
    { key: "live", label: "Ongoing" },
    ...STATUSES.map((s) => ({ key: s.key, label: s.label })),
    { key: "all", label: "All" },
  ];

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="font-display text-lg font-600 text-foreground">
              Orders desk
            </p>
            <p className="text-[11px] text-muted-foreground">{email}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void load()}
              className="grid size-9 place-items-center rounded-full border border-border bg-card text-foreground"
              aria-label="Refresh"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground"
            >
              <LogOut className="size-3.5" /> Sign out
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 pb-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                filter === t.key
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              {counts[t.key] ? ` (${counts[t.key]})` : ""}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center">
            <Package className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 font-display text-lg font-600 text-foreground">
              No orders here
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              New orders appear the moment a customer places one.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {visible.map((o) => (
              <OrderCard key={o.id} order={o} onStatus={setStatus} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function OrderCard({
  order,
  onStatus,
}: {
  order: Order;
  onStatus: (id: string, status: string) => void;
}) {
  const meta = statusMeta(order.status);
  const when = new Date(order.created_at).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-600 text-foreground">
            {order.customer_name}
          </p>
          <p className="text-xs text-muted-foreground">{when}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-accent">
          <meta.icon className="size-3.5" /> {meta.label}
        </span>
      </div>

      <ul className="mt-3 space-y-1 rounded-xl bg-secondary/60 p-3 text-sm text-foreground">
        {items.map((it, idx) => (
          <li key={idx} className="flex justify-between">
            <span>{it.name}</span>
            <span className="font-semibold">{it.qty} kg</span>
          </li>
        ))}
        <li className="flex justify-between border-t border-border pt-1 text-xs text-muted-foreground">
          <span>Cut style</span>
          <span className="font-semibold text-foreground">
            {order.cut_style}
          </span>
        </li>
        {order.notes ? (
          <li className="flex justify-between gap-3 text-xs text-muted-foreground">
            <span>Notes</span>
            <span className="text-right text-foreground">{order.notes}</span>
          </li>
        ) : null}
      </ul>

      <p className="mt-3 text-sm text-muted-foreground">{order.address}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={`tel:${order.phone}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
        >
          <Phone className="size-3.5" /> {order.phone}
        </a>
        <a
          href={`https://wa.me/91${order.phone.replace(/\D/g, "").slice(-10)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-leaf hover:bg-secondary"
        >
          <MessageCircle className="size-3.5" /> WhatsApp
        </a>
        {order.lat != null && order.lng != null && (
          <a
            href={`https://maps.google.com/?q=${order.lat},${order.lng}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-accent hover:bg-secondary"
          >
            <MapPin className="size-3.5" /> Delivery pin
          </a>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
        {STATUSES.filter((s) => s.key !== order.status).map((s) => (
          <button
            key={s.key}
            onClick={() => onStatus(order.id, s.key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              s.key === "done"
                ? "bg-leaf text-white"
                : s.key === "cancelled"
                  ? "border border-border text-destructive hover:bg-secondary"
                  : "border border-border text-foreground hover:bg-secondary"
            }`}
          >
            <s.icon className="size-3.5" /> {s.label}
          </button>
        ))}
      </div>
    </article>
  );
}
