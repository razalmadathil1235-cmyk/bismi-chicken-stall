import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Truck,
  Phone,
  MapPin,
  Clock,
  Leaf,
  ShieldCheck,
  Scissors,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  X,
  MessageCircle,
  Star,
  ChevronRight,
  Mail,
  Navigation,
  LifeBuoy,
  Loader2,

  Heart,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/bismi-logo.jpg.asset.json";
import heroImg from "@/assets/hero.jpg";
import broilerImg from "@/assets/chicken-broiler.jpg";
import legImg from "@/assets/chicken-leg.jpg";
import springImg from "@/assets/chicken-spring.jpg";
import nadanImg from "@/assets/chicken-nadan.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const PHONE = "8157988462";
const PHONE_INTL = "918157988462";
const ADDRESS =
  "MLA Road, Kuttikatoor, Kozhikode, Kerala 673571 (Landmark: Kunnamangalam Co-operative Bank)";
const DELIVERY_INFO = "₹10 per 3 km";
const SUPPORT_EMAILS = ["shameer.ep53@gmail.com"];
const CUT_STYLES = [
  "Curry cut",
  "Fry cut",
  "Chicken 65 cut",
  "Biriyani cut",
] as const;

type Product = {
  id: string;
  name: string;
  malayalam: string;
  blurb: string;
  image: string;
  tag?: string;
  badge?: string;
};

const PRODUCTS: Product[] = [
  {
    id: "broiler",
    name: "Broiler Chicken",
    malayalam: "ബ്രോയിലർ കോഴി",
    blurb:
      "Tender farm-fresh broiler, cleaned and cut to your liking. Perfect for everyday curries and fries.",
    image: broilerImg,
    tag: "Best value",
  },
  {
    id: "legon",
    name: "Leg Pieces (Legon)",
    malayalam: "ലെഗ് പീസ്",
    blurb:
      "Juicy thigh and drumstick cuts only — the favourite for biryani, fry and kids at home.",
    image: legImg,
    tag: "Most loved",
  },
  {
    id: "spring",
    name: "Spring Chicken (Kada)",
    malayalam: "സ്പ്രിങ് കോഴി",
    blurb:
      "Young, tender spring chicken with delicate flavour. Ideal for roast and rich masala.",
    image: springImg,
    tag: "Tender",
  },
  {
    id: "nadan",
    name: "Nadan Kozhi (Country Chicken)",
    malayalam: "നാടൻ കോഴി",
    blurb:
      "Free-range country chicken with deep, authentic taste and firm texture. The flavour of home.",
    image: nadanImg,
    tag: "Premium",
    badge: "Free-range",
  },
];

type CartItem = { id: string; qty: number };

const RATE_NOTE = "Today's rate on call";

function Index() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // load persisted cart after hydration to avoid SSR mismatch
  useEffect(() => {
    setHydrated(true);
    try {
      const raw = localStorage.getItem("bismi-cart");
      if (raw) setCart(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("bismi-cart", JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart, hydrated]);

  const count = cart.reduce((s, i) => s + i.qty, 0);

  const setQty = (id: string, qty: number) =>
    setCart((c) =>
      qty <= 0
        ? c.filter((i) => i.id !== id)
        : c.some((i) => i.id === id)
          ? c.map((i) => (i.id === id ? { ...i, qty } : i))
          : [...c, { id, qty }],
    );

  const add = (id: string, kg = 1) => {
    setCart((c) => {
      const ex = c.find((i) => i.id === id);
      return ex ? c.map((i) => (i.id === id ? { ...i, qty: i.qty + kg } : i)) : [...c, { id, qty: kg }];
    });
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header count={count} onCart={() => setOpen(true)} />
      <Hero />
      <TrustStrip />
      <Products onAdd={add} cart={cart} setQty={setQty} hydrated={hydrated} />
      <WhyUs />
      <Location />
      <Support />
      <Footer onCart={() => setOpen(true)} />

      <CartDrawer
        open={open}
        onClose={() => setOpen(false)}
        cart={cart}
        setQty={setQty}
        count={count}
      />
    </div>
  );
}

/* ---------- Header ---------- */

function Header({ count, onCart }: { count: number; onCart: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <Logo />
          <div className="leading-tight">
            <p className="font-display text-lg font-600 tracking-tight text-foreground">
              Bismi
            </p>
            <p className="-mt-0.5 text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
              Chicken Stall
            </p>
          </div>
        </a>

        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <a href="#products" className="transition-colors hover:text-foreground">
            Products
          </a>
          <a href="#why" className="transition-colors hover:text-foreground">
            Why us
          </a>
          <a href="#location" className="transition-colors hover:text-foreground">
            Find us
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${PHONE}`}
            className="hidden items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary sm:inline-flex"
          >
            <Phone className="size-4" /> {PHONE}
          </a>
          <button
            onClick={onCart}
            className="relative inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-soft transition-transform hover:scale-[1.03]"
          >
            <ShoppingCart className="size-4" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground ring-2 ring-background">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <img
      src={logoAsset.url}
      alt="Bismi Chicken Stall Kuttikatoor logo"
      className="size-11 rounded-xl object-contain"
    />
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="bg-grain absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-2 md:pb-24 md:pt-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-leaf/30 bg-leaf/10 px-3 py-1 text-xs font-semibold text-leaf">
            <Leaf className="size-3.5" /> 100% fresh & halal cut
          </span>
          <h1 className="mt-5 font-display text-4xl font-600 leading-[1.05] tracking-tight text-balance text-foreground sm:text-5xl md:text-6xl">
            Fresh chicken,{" "}
            <span className="text-gradient-warm">brought to your door</span> in
            Kuttikatoor.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Order broiler, spring and nadan kozhi from Bismi Chicken Stall in
            Kuttikatoor. Cut, cleaned and on its way — pay on delivery.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#products"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-warm transition-transform hover:scale-[1.03]"
            >
              Order fresh now <ChevronRight className="size-4" />
            </a>
            <a
              href={`https://wa.me/${PHONE_INTL}?text=${encodeURIComponent(
                "Hi Bismi Chicken Stall, I'd like to place an order.",
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <MessageCircle className="size-4 text-leaf" /> WhatsApp order
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Truck className="size-4 text-accent" /> Delivery from {DELIVERY_INFO}
            </span>
            <span className="inline-flex items-center gap-2">
              <Star className="size-4 text-primary" /> Same-day in Kuttikatoor
            </span>
            <span className="inline-flex items-center gap-2">
              <Phone className="size-4 text-accent" /> {PHONE}
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-[2rem] gradient-warm opacity-20 blur-2xl" aria-hidden />
          <div className="overflow-hidden rounded-[1.5rem] border border-border/60 shadow-warm">
            <img
              src={heroImg}
              alt="Assorted fresh raw chicken on a rustic slate board with curry leaves and spices"
              width={1600}
              height={1067}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -left-3 rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-soft backdrop-blur sm:-left-6">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Today&apos;s rate
            </p>
            <p className="font-display text-xl font-600 text-foreground">
              Call us to know
            </p>
          </div>
          <div className="absolute -right-3 top-5 inline-flex items-center gap-2 rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold text-accent-foreground shadow-soft sm:-right-5">
            <Truck className="size-3.5" /> {DELIVERY_INFO} DELIVERY
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Trust strip ---------- */

function TrustStrip() {
  const items = [
    { icon: Leaf, label: "Fresh daily" },
    { icon: ShieldCheck, label: "Halal & hygienic" },
    { icon: Scissors, label: "Cut & cleaned" },
    { icon: Truck, label: `${DELIVERY_INFO} delivery` },
  ];
  return (
    <div className="border-y border-border/70 bg-card">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 py-5 sm:px-6 md:grid-cols-4 md:gap-6">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-accent/10 text-accent">
              <it.icon className="size-4" />
            </span>
            <span className="text-sm font-semibold text-foreground">
              {it.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Products ---------- */

function Products({
  onAdd,
  cart,
  setQty,
  hydrated,
}: {
  onAdd: (id: string) => void;
  cart: CartItem[];
  setQty: (id: string, qty: number) => void;
  hydrated: boolean;
}) {
  return (
    <section id="products" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <div className="mb-10 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          Our menu
        </p>
        <h2 className="mt-2 font-display text-3xl font-600 tracking-tight text-foreground sm:text-4xl">
          Pick your chicken, set the kilos
        </h2>
        <p className="mt-3 text-muted-foreground">
          Rates change with the market every day, so give us a call or a
          WhatsApp message for today&apos;s price. Choose your kilos — we cut and
          clean it fresh, then deliver at ₹10 per 3 km.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PRODUCTS.map((p) => {
          const inCart = cart.find((i) => i.id === p.id);
          return (
            <article
              key={p.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-warm"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  width={1024}
                  height={1024}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {p.tag && (
                  <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent shadow-soft backdrop-blur">
                    {p.tag}
                  </span>
                )}
                {p.badge && (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-leaf px-2.5 py-1 text-[11px] font-bold text-white">
                    <Leaf className="size-3" /> {p.badge}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-display text-lg font-600 text-foreground">
                  {p.name}
                </h3>
                <p className="-mt-0.5 text-xs font-medium text-accent">
                  {p.malayalam}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {p.blurb}
                </p>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                    {RATE_NOTE}
                  </p>
                  <a
                    href={`tel:${PHONE}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
                  >
                    <Phone className="size-3" /> Ask rate
                  </a>
                </div>

                {hydrated && inCart ? (
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <QtyStepper
                      value={inCart.qty}
                      onDec={() => setQty(p.id, inCart.qty - 1)}
                      onInc={() => setQty(p.id, inCart.qty + 1)}
                    />
                    <span className="text-sm font-semibold text-accent">
                      {inCart.qty} kg
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => onAdd(p.id)}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
                  >
                    <Plus className="size-4" /> Add to cart
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function QtyStepper({
  value,
  onDec,
  onInc,
}: {
  value: number;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-background p-1">
      <button
        onClick={onDec}
        aria-label="Decrease"
        className="grid size-8 place-items-center rounded-full text-foreground transition-colors hover:bg-secondary"
      >
        <Minus className="size-4" />
      </button>
      <span className="min-w-12 px-2 text-center text-sm font-bold text-foreground">
        {value} kg
      </span>
      <button
        onClick={onInc}
        aria-label="Increase"
        className="grid size-8 place-items-center rounded-full text-foreground transition-colors hover:bg-secondary"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

/* ---------- Why us ---------- */

function WhyUs() {
  const feats = [
    {
      icon: Truck,
      title: "Home delivery",
      text: `Delivery across Kuttikatoor and nearby Kozhikode areas at ₹10 per 3 km. Same-day for orders before evening.`,
    },
    {
      icon: Leaf,
      title: "Fresh, never frozen",
      text: "Chicken cut fresh only after you order — never stocked frozen. Cleaned and packed hygienically.",
    },
    {
      icon: ShieldCheck,
      title: "Halal & hygienic",
      text: "Proper halal cut, clean handling and sealed packing. Quality you can trust for your family.",
    },
    {
      icon: Heart,
      title: "Pay on delivery",
      text: "No online payment needed. Inspect your order, then pay cash when it arrives at your door.",
    },
  ];
  return (
    <section id="why" className="border-y border-border/70 bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            Why Bismi
          </p>
          <h2 className="mt-2 font-display text-3xl font-600 tracking-tight text-foreground sm:text-4xl">
            Freshness and care, the way you'd want at home
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {feats.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <span className="grid size-11 place-items-center rounded-xl gradient-warm text-white shadow-soft">
                <f.icon className="size-5" strokeWidth={2.2} />
              </span>
              <h3 className="mt-4 font-display text-lg font-600 text-foreground">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Location ---------- */

function Location() {
  const mapSrc =
    "https://www.google.com/maps?q=" +
    encodeURIComponent("Kunnamangalam Co-operative Bank, MLA Road, Kuttikatoor, Kozhikode, Kerala 673571") +
    "&output=embed";
  return (
    <section id="location" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            Find us
          </p>
          <h2 className="mt-2 font-display text-3xl font-600 tracking-tight text-foreground sm:text-4xl">
            On MLA Road, Kuttikatoor
          </h2>
          <p className="mt-3 text-muted-foreground">
            We're in Kuttikatoor on MLA Road — look for the Kunnamangalam
            Co-operative Bank, we're right there. Or skip the trip: order online
            and we'll bring it to you.
          </p>

          <ul className="mt-7 space-y-4">
            <InfoRow icon={MapPin} title="Address">
              MLA Road, Kuttikatoor, Kozhikode, Kerala 673571
              <br />
              Landmark: Kunnamangalam Co-operative Bank
            </InfoRow>
            <InfoRow icon={Phone} title="Call / WhatsApp">
              <a href={`tel:${PHONE}`} className="hover:text-accent">
                {PHONE}
              </a>
            </InfoRow>
            <InfoRow icon={Clock} title="Open daily">
              7:00 AM – 9:00 PM
            </InfoRow>
            <InfoRow icon={Truck} title="Delivery">
              Delivery across Kuttikatoor & nearby areas (₹10 per 3 km)
            </InfoRow>
          </ul>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${PHONE_INTL}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-leaf px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-[1.03]"
            >
              <MessageCircle className="size-4" /> Chat on WhatsApp
            </a>
            <a
              href={`tel:${PHONE}`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <Phone className="size-4" /> Call to order
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border shadow-warm">
          <iframe
            title="Bismi Chicken Stall location map"
            src={mapSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[320px] w-full sm:h-[420px]"
          />
        </div>
      </div>
    </section>
  );
}

function InfoRow({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3.5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{children}</p>
      </div>
    </li>
  );
}

/* ---------- Support ---------- */

function Support() {
  const channels = [
    {
      icon: Phone,
      label: "Call the shop",
      value: PHONE,
      href: `tel:${PHONE}`,
      desc: "Fastest for today's rate & orders",
      tone: "accent" as const,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: PHONE,
      href: `https://wa.me/${PHONE_INTL}`,
      desc: "Send your order or a quick question",
      tone: "leaf" as const,
    },
    {
      icon: Mail,
      label: "Email support",
      value: SUPPORT_EMAILS[0],
      href: `mailto:${SUPPORT_EMAILS[0]}?subject=${encodeURIComponent("Bismi Chicken Stall \u2014 support")}`,
      desc: "For feedback, complaints & receipts",
      tone: "accent" as const,
    },
  ];

  return (
    <section id="support" className="border-y border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            Support
          </p>
          <h2 className="mt-2 font-display text-3xl font-600 tracking-tight text-foreground sm:text-4xl">
            Need help with an order?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Something wrong with a delivery, a question about today's rate,
            or feedback for us? Reach us on any channel below — we reply
            as soon as we can.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel={c.href.startsWith("http") ? "noreferrer" : undefined}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-warm"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid size-11 place-items-center rounded-xl ${
                    c.tone === "leaf"
                      ? "bg-leaf/15 text-leaf"
                      : "bg-accent/10 text-accent"
                  }`}
                >
                  <c.icon className="size-5" />
                </span>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {c.label}
                </p>
              </div>
              <p className="mt-4 break-words text-base font-semibold text-foreground group-hover:text-accent">
                {c.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                Contact <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </a>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Clock, title: "Support hours", text: "7:00 AM – 9:00 PM, every day." },
            { icon: LifeBuoy, title: "Response time", text: "Calls & WhatsApp answered within minutes during shop hours." },
            { icon: ShieldCheck, title: "Quality promise", text: "Not satisfied with a cut? Tell us — we'll make it right." },
          ].map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
                <f.icon className="size-4" strokeWidth={2.2} />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{f.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                  {f.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

function Footer({ onCart }: { onCart: () => void }) {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo />
              <div className="leading-tight">
                <p className="font-display text-lg font-600 text-foreground">
                  Bismi
                </p>
                <p className="-mt-0.5 text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
                  Chicken Stall
                </p>
              </div>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Fresh chicken, cut to order and delivered in Kuttikatoor,
              Kozhikode.
            </p>
          </div>

          <div className="text-sm">
            <p className="font-semibold text-foreground">Quick links</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <a href="#products" className="hover:text-accent">
                  Our chicken
                </a>
              </li>
              <li>
                <a href="#why" className="hover:text-accent">
                  Why Bismi
                </a>
              </li>
              <li>
                <button onClick={onCart} className="hover:text-accent">
                  Your cart
                </button>
              </li>
            </ul>
          </div>

          <div className="text-sm">
            <p className="font-semibold text-foreground">Order now</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <a href={`tel:${PHONE}`} className="inline-flex items-center gap-2 hover:text-accent">
                  <Phone className="size-4" /> {PHONE}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${PHONE_INTL}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 hover:text-accent"
                >
                  <MessageCircle className="size-4" /> WhatsApp us
                </a>
              </li>
              <li className="inline-flex items-center gap-2">
                <Clock className="size-4" /> 7 AM – 9 PM, daily
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Bismi Chicken Stall, Kuttikatoor.</p>
          <p>Delivery ₹10 per 3 km · Pay on delivery</p>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Cart Drawer ---------- */

function CartDrawer({
  open,
  onClose,
  cart,
  setQty,
  count,
}: {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  setQty: (id: string, qty: number) => void;
  count: number;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [cut, setCut] = useState<string>("");
  const [coords, setCoords] = useState<{ lat: number; lng: number; acc: number } | null>(null);
  const [locStatus, setLocStatus] = useState<"idle" | "loading" | "error">("idle");
  const [locError, setLocError] = useState("");

  const shareLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocStatus("error");
      setLocError("Location isn't supported on this browser.");
      return;
    }
    setLocStatus("loading");
    setLocError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          acc: Math.round(pos.coords.accuracy),
        });
        setLocStatus("idle");
      },
      (err) => {
        setLocStatus("error");
        setLocError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Allow it, or type your address above."
            : "Couldn't get your location. Please try again.",
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const mapsLink = coords
    ? `https://maps.google.com/?q=${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`
    : null;

  const lines = cart.map((i) => {
    const p = PRODUCTS.find((x) => x.id === i.id)!;
    return `${p.name} — ${i.qty} kg`;
  });

  const message = useMemo(() => {
    const parts = [
      "*New order — Bismi Chicken Stall*",
      "",
      `Name: ${name || "—"}`,
      `Phone: ${phone || "—"}`,
      `Address: ${address || "—"}`,
      `Cut style: ${cut || "—"}`,
      notes ? `Notes: ${notes}` : null,
      "",
      "Items:",
      ...lines,
      "",
      mapsLink ? "📍 Live location for delivery:" : null,
      mapsLink ? mapsLink : null,
      coords ? `(accuracy ±${coords.acc} m)` : null,
      mapsLink ? "" : null,
      "Please confirm today's rate and total.",
      "Delivery: ₹10 per 3 km (pay on delivery)",
    ].filter((x) => x !== null);
    return parts.join("\n");
  }, [name, phone, address, cut, notes, lines, mapsLink, coords]);

  const waHref = `https://wa.me/${PHONE_INTL}?text=${encodeURIComponent(message)}`;

  const errors = {
    name: name.trim().length < 2 ? "Please enter your name" : "",
    phone: /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ""))
      ? ""
      : "Enter a valid 10-digit mobile number",
    address: address.trim().length < 8 ? "Please enter your full address" : "",
    cut: cut ? "" : "Please choose a cut style",
    location: coords ? "" : "Please turn on location and share your GPS pin",
  };
  const isValid = Object.values(errors).every((e) => !e);
  const [touched, setTouched] = useState(false);
  const show = (k: keyof typeof errors) => (touched ? errors[k] : "");

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-warm transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Your cart"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="font-display text-xl font-600 text-foreground">
              Your order
            </h2>
            <p className="text-xs text-muted-foreground">
              {count > 0 ? `${count} kg of chicken` : "Nothing yet"}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-secondary"
          >
            <X className="size-5" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-secondary text-accent">
              <ShoppingCart className="size-7" />
            </span>
            <p className="mt-4 font-display text-lg font-600 text-foreground">
              Your cart is empty
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add some fresh chicken to get started.
            </p>
            <button
              onClick={onClose}
              className="mt-5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
            >
              Browse chicken
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {cart.map((i) => {
                const p = PRODUCTS.find((x) => x.id === i.id)!;
                return (
                  <div
                    key={i.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="size-14 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {p.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {RATE_NOTE}
                      </p>
                      <div className="mt-1.5 inline-flex items-center rounded-full border border-border bg-background p-0.5">
                        <button
                          onClick={() => setQty(p.id, i.qty - 1)}
                          aria-label="Decrease"
                          className="grid size-7 place-items-center rounded-full text-foreground hover:bg-secondary"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="min-w-10 px-1 text-center text-xs font-bold">
                          {i.qty} kg
                        </span>
                        <button
                          onClick={() => setQty(p.id, i.qty + 1)}
                          aria-label="Increase"
                          className="grid size-7 place-items-center rounded-full text-foreground hover:bg-secondary"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => setQty(p.id, 0)}
                        aria-label="Remove"
                        className="grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="space-y-3 pt-2">
                <Field label="Your name *">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahim"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                  {show("name") && <ErrText>{errors.name}</ErrText>}
                </Field>
                <Field label="Phone number *">
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputMode="tel"
                    placeholder="10-digit mobile number"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                  {show("phone") && <ErrText>{errors.phone}</ErrText>}
                </Field>
                <Field label="Delivery address *">
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    placeholder="House name, street, area, landmark"
                    className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                  {show("address") && <ErrText>{errors.address}</ErrText>}
                </Field>


                <div className="rounded-xl border border-border bg-card p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Live location
                  </p>
                  {coords ? (
                    <div className="mt-2">
                      <p className="text-sm font-semibold text-leaf">
                        Location attached ✓
                      </p>
                      <a
                        href={mapsLink ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-0.5 block break-all text-xs text-muted-foreground underline hover:text-accent"
                      >
                        {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} (±
                        {coords.acc} m)
                      </a>
                      <button
                        onClick={shareLocation}
                        className="mt-2 text-xs font-semibold text-accent hover:underline"
                      >
                        Update location
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Share your GPS pin so the delivery rider finds you
                        exactly. It&apos;s sent with your order on WhatsApp.
                      </p>
                      <button
                        onClick={shareLocation}
                        disabled={locStatus === "loading"}
                        className="mt-2.5 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-bold text-accent-foreground disabled:opacity-60"
                      >
                        {locStatus === "loading" ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Navigation className="size-4" />
                        )}
                        {locStatus === "loading"
                          ? "Getting location…"
                          : "Share my location"}
                      </button>
                    </>
                  )}
                  {locStatus === "error" && (
                    <p className="mt-2 text-xs font-medium text-destructive">
                      {locError}
                    </p>
                  )}
                </div>

                {show("location") && (
                  <ErrText>{errors.location}</ErrText>
                )}

                <Field label="How should we cut it? *">
                  <div className="flex flex-wrap gap-2">
                    {CUT_STYLES.map((c) => {
                      const active = cut === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCut(active ? "" : c)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                            active
                              ? "border-accent bg-accent text-accent-foreground"
                              : "border-input bg-background text-muted-foreground hover:border-accent hover:text-foreground"
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                  {show("cut") && <ErrText>{errors.cut}</ErrText>}
                </Field>


                <Field label="Notes (optional)">
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. skinless, small pieces"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </Field>
              </div>
            </div>

            <div className="border-t border-border bg-card px-5 py-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Delivery</span>
                <span className="font-semibold text-leaf">{DELIVERY_INFO}</span>
              </div>
              <div className="mt-1 flex items-start justify-between gap-3">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="max-w-[60%] text-right text-xs font-semibold text-foreground">
                  We confirm today&apos;s rate on WhatsApp or call
                </span>
              </div>
              <a
                href={isValid ? waHref : undefined}
                target="_blank"
                rel="noreferrer"
                aria-disabled={!isValid}
                onClick={(e) => {
                  setTouched(true);
                  if (!isValid) e.preventDefault();
                }}
                className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-leaf px-5 py-3 text-sm font-bold text-white shadow-soft transition-transform ${
                  isValid
                    ? "hover:scale-[1.02]"
                    : "cursor-not-allowed opacity-50"
                }`}
              >
                <MessageCircle className="size-4" /> Order on WhatsApp
              </a>
              {touched && !isValid && (
                <p className="mt-2 text-center text-[11px] font-semibold text-destructive">
                  Fill every detail and turn on location to place the order.
                </p>
              )}
              <a
                href={`tel:${PHONE}`}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                <Phone className="size-4" /> Call to confirm
              </a>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                Your order details open in WhatsApp. Pay cash on delivery.
              </p>
            </div>
          </>
        )}
      </aside>
    </>
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
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function ErrText({ children }: { children: React.ReactNode }) {
  return (
    <span className="mt-1 block text-xs font-medium text-destructive">
      {children}
    </span>
  );
}
