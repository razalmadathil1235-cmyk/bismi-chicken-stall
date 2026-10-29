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
  IndianRupee,
  Check,
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
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
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

  if (recovery) return <ResetPassword onDone={() => setRecovery(false)} />;
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
  const [mode, setMode] = useState<"in" | "up" | "forgot">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgOk, setMsgOk] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    setMsgOk(false);
    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/owner`,
      });
      if (error) setMsg(error.message);
      else {
        setMsgOk(true);
        setMsg("Reset link sent. Check your email and open the link to set a new password.");
      }
      setBusy(false);
      return;
    }
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
          {mode !== "forgot" && (
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          )}
          <button
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-accent-foreground disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {mode === "in"
              ? "Sign in"
              : mode === "up"
                ? "Create owner account"
                : "Send reset link"}
          </button>
        </form>

        {mode === "in" && (
          <button
            onClick={() => {
              setMode("forgot");
              setMsg("");
              setMsgOk(false);
            }}
            className="mt-3 w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Forgot password?
          </button>
        )}

        {msg && (
          <p
            className={`mt-3 text-center text-xs font-semibold ${
              msgOk ? "text-leaf" : "text-destructive"
            }`}
          >
            {msg}
          </p>
        )}

        <button
          onClick={() => {
            setMode(mode === "in" ? "up" : "in");
            setMsg("");
            setMsgOk(false);
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

/* ---------- Reset password ---------- */

function ResetPassword({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (password !== confirm) {
      setMsg("Passwords do not match.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setMsg(error.message);
    else setDone(true);
    setBusy(false);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-secondary/40 px-4">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-7 shadow-warm">
        <span className="grid size-12 place-items-center rounded-2xl bg-accent/10 text-accent">
          <ShieldCheck className="size-6" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-600 text-foreground">
          Set a new password
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a new password for your owner account.
        </p>

        {done ? (
          <div className="mt-6 text-center">
            <CheckCircle2 className="mx-auto size-8 text-leaf" />
            <p className="mt-2 text-sm font-semibold text-foreground">
              Password updated. You&apos;re signed in now.
            </p>
            <button
              onClick={onDone}
              className="mt-4 w-full rounded-full bg-accent px-5 py-3 text-sm font-bold text-accent-foreground"
            >
              Go to orders desk
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <button
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-accent-foreground disabled:opacity-60"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              Update password
            </button>
            {msg && (
              <p className="text-center text-xs font-semibold text-destructive">
                {msg}
              </p>
            )}
          </form>
        )}
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

/* ---------- Rate board ---------- */

type RateRow = { id: string; label: string; price_per_kg: number | null };

function playChime() {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    if (ctx.state === "suspended") void ctx.resume();
    [880, 1174.66].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t0 = ctx.currentTime + i * 0.25;
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.25, t0 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.65);
    });
    window.setTimeout(() => void ctx.close(), 1600);
  } catch {
    /* ignore */
  }
}

function RateBoard() {
  const [rows, setRows] = useState<RateRow[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("rates")
      .select("id, label, price_per_kg")
      .order("sort_order");
    setRows((data ?? []) as unknown as RateRow[]);
    setDraft({});
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (r: RateRow) => {
    const raw = draft[r.id];
    if (raw === undefined || busy) return;
    const value = raw.trim() === "" ? null : Number(raw);
    if (value !== null && (!Number.isFinite(value) || value < 0)) return;
    setBusy(r.id);
    const { error } = await supabase
      .from("rates")
      .update({ price_per_kg: value })
      .eq("id", r.id);
    setBusy(null);
    if (error) return;
    setSaved(r.id);
    window.setTimeout(() => setSaved((s) => (s === r.id ? null : s)), 1800);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading rates…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <IndianRupee className="size-5 text-accent" />
          <h2 className="font-display text-lg font-600 text-foreground">
            Today&apos;s rate board
          </h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Set the price per kg for each chicken. Customers see it on the site
          the moment you save — and it goes into their WhatsApp order. Leave a
          box empty to show &quot;Today&apos;s rate on call&quot; instead.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((r) => {
          const value = draft[r.id] ?? (r.price_per_kg == null ? "" : String(r.price_per_kg));
          const dirty = draft[r.id] !== undefined;
          return (
            <div
              key={r.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-soft"
            >
              <p className="font-display text-base font-600 text-foreground">
                {r.label}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex flex-1 items-center rounded-full border border-border bg-background px-3">
                  <span className="text-sm font-semibold text-accent">₹</span>
                  <input
                    value={value}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [r.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void save(r);
                    }}
                    type="number"
                    min="0"
                    step="1"
                    inputMode="decimal"
                    placeholder="—"
                    aria-label={`Rate for ${r.label}`}
                    className="w-full bg-transparent px-2 py-2 text-sm font-semibold text-foreground outline-none"
                  />
                  <span className="text-xs text-muted-foreground">/kg</span>
                </div>
                <button
                  onClick={() => void save(r)}
                  disabled={!dirty || busy === r.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground transition-opacity disabled:opacity-40"
                >
                  {busy === r.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : saved === r.id ? (
                    <Check className="size-3.5" />
                  ) : null}
                  {saved === r.id ? "Saved" : "Save"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Orders desk ---------- */

function OrdersDesk({ email }: { email: string | null }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("live");
  const [view, setView] = useState<"orders" | "rates">("orders");

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
        (payload) => {
          if (payload.eventType === "INSERT") playChime();
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
            <div className="flex rounded-full border border-border bg-card p-0.5">
              {(["orders", "rates"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    view === v
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {v === "orders" ? "Orders" : "Rate board"}
                </button>
              ))}
            </div>
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
        {view === "rates" ? (
          <RateBoard />
        ) : visible.length === 0 ? (
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
