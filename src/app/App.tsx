import { useState, useRef, useEffect } from "react";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import founderPhoto from "@/imports/image.png";

// ── GA4 ───────────────────────────────────────────────────────────────────
// Add to index.html <head>:
//   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
//   <script>
//     window.dataLayer=window.dataLayer||[];
//     function gtag(){dataLayer.push(arguments);}
//     gtag('js',new Date());
//     gtag('config','G-XXXXXXXXXX');
//   </script>
function track(event: string, params?: Record<string, string | number>) {
  if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
    (window as any).gtag("event", event, params);
  }
}

const FAQ_ITEMS = [
  {
    q: "Is the community open yet?",
    a: "Not yet. I'm validating interest and building the first version with future members in mind. Founding members get early access and an invite before anyone else.",
  },
  {
    q: "Why a Discord server?",
    a: "It's the fastest way to bring together people who want to practice marketing together, before investing time building a dedicated platform.",
  },
  {
    q: "Is this another marketing course?",
    a: "No. There are already great places to learn marketing theory. Marketing Sandbox is about applying what you've learned — building projects, experimenting, getting feedback, and improving.",
  },
  {
    q: "Will it always be a Discord community?",
    a: "Probably not. If enough people find it valuable, I'd love to build tools that make practicing and reviewing marketing projects easier. But first, I want to make sure the community itself solves a real problem.",
  },
];

function SignupForm({
  id,
  onSuccess,
  consentNote,
  dark = false,
}: {
  id: string;
  onSuccess: () => void;
  consentNote: string;
  dark?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [consentError, setConsentError] = useState(false);
  const started = useRef(false);

  function onFocus() {
    if (!started.current) {
      started.current = true;
      track("email_form_started", { form_id: id });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let valid = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }
    if (!consent) {
      setConsentError(true);
      valid = false;
    } else {
      setConsentError(false);
    }
    if (!valid) return;

    // ── Email provider integration ────────────────────────────────────────
    // Mailchimp:  POST https://us1.api.mailchimp.com/3.0/lists/{listId}/members
    // ConvertKit: POST https://api.convertkit.com/v3/forms/{formId}/subscribe
    // Beehiiv:    POST https://api.beehiiv.com/v2/publications/{pubId}/subscriptions
    // Buttondown: POST https://api.buttondown.email/v1/subscribers
    // Brevo:      POST https://api.brevo.com/v3/contacts
    // Payload: { email, consent: true, source: id, tags: ["founding_member"] }
    // ─────────────────────────────────────────────────────────────────────

    console.log("Subscriber:", { email: email.trim(), form: id, ts: new Date().toISOString() });
    track("email_form_completed", { form_id: id });
    track("generate_lead");
    onSuccess();
  }

  const inputBase = dark
    ? "bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/50 focus:ring-white/20"
    : "bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-foreground/30 focus:ring-foreground/15";

  const consentBase = dark
    ? `border-white/20 ${consentError ? "bg-red-900/20 border-red-400/40" : "bg-white/5"}`
    : `border-border ${consentError ? "border-destructive/40 bg-destructive/5" : "bg-muted/40"}`;

  const labelColor = dark ? "text-white/60" : "text-muted-foreground";
  const linkColor = dark ? "text-white/80 hover:text-white" : "hover:text-foreground";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={onFocus}
          placeholder="your@email.com"
          autoComplete="email"
          className={`flex-1 px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${inputBase} ${emailError ? "border-destructive" : ""}`}
        />
        <button
          type="submit"
          onClick={() => track("cta_click", { cta_label: "get_early_access", form_id: id })}
          className="bg-accent-foreground text-white text-sm font-semibold px-5 py-3 rounded-lg hover:opacity-85 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          Get Early Access
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      {emailError && <p className="text-xs text-destructive">{emailError}</p>}

      <div className={`flex gap-2.5 items-start p-3 rounded-lg border text-xs transition-colors ${consentBase}`}>
        <input
          id={`consent-${id}`}
          type="checkbox"
          checked={consent}
          onChange={(e) => { setConsent(e.target.checked); if (e.target.checked) setConsentError(false); }}
          style={{ accentColor: dark ? "#fff" : "#0a0a0a" }}
          className="mt-0.5 w-3.5 h-3.5 flex-shrink-0 cursor-pointer rounded"
        />
        <label htmlFor={`consent-${id}`} className={`leading-relaxed cursor-pointer select-none ${labelColor}`}>
          {consentNote}{" "}
          <a href="#privacy" className={`underline underline-offset-2 transition-colors ${linkColor}`}>Privacy</a>
          {" · "}
          <a href="#terms" className={`underline underline-offset-2 transition-colors ${linkColor}`}>Terms</a>
        </label>
      </div>
      {consentError && <p className="text-xs text-destructive">Please agree to continue.</p>}
    </form>
  );
}

function SuccessState({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`flex items-start gap-4 p-5 rounded-xl border ${dark ? "bg-white/10 border-white/20" : "bg-muted border-border"}`}>
      <div className="w-8 h-8 rounded-full bg-accent-foreground flex items-center justify-center flex-shrink-0 mt-0.5">
        <Check className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className={`font-semibold mb-1 ${dark ? "text-white" : "text-foreground"}`}>You're on the list.</p>
        <p className={`text-sm leading-relaxed ${dark ? "text-white/70" : "text-muted-foreground"}`}>
          Thanks for joining. I'll send updates as Marketing Sandbox develops — honest progress, no spam.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [heroSubmitted, setHeroSubmitted] = useState(false);
  const [bottomSubmitted, setBottomSubmitted] = useState(false);
  const [showStickyNav, setShowStickyNav] = useState(false);
  const anySubmitted = heroSubmitted || bottomSubmitted;

  useEffect(() => {
    const depths = new Set<number>();
    function onScroll() {
      setShowStickyNav(window.scrollY > 600);
      const pct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      [25, 50, 75, 90].forEach((d) => {
        if (pct >= d && !depths.has(d)) { depths.add(d); track("scroll_depth", { percent: d }); }
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToForm() {
    document.getElementById("hero-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
    track("cta_click", { cta_label: "sticky_nav" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight">Marketing Sandbox</span>
          <button
            onClick={scrollToForm}
            className={`text-xs font-semibold bg-accent-foreground text-white px-4 py-2 rounded-lg hover:opacity-80 transition-all duration-300 cursor-pointer ${showStickyNav ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            Join the founding list →
          </button>
        </div>
      </header>

      <main>

        {/* ── Hero — split layout ──────────────────────────────────────────── */}
        <section className="pt-20 min-h-screen flex items-center border-b border-border">
          <div className="max-w-5xl mx-auto px-6 w-full py-16 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left — copy + form */}
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-accent-foreground bg-accent px-3 py-1.5 rounded-full tracking-wide uppercase mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-foreground animate-pulse" />
                Founding list open
              </span>

              <h1
                className="text-4xl md:text-5xl leading-[1.1] tracking-tight text-foreground mb-5"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Turn marketing courses into real-world practice.
              </h1>

              <p className="text-[15px] text-muted-foreground leading-relaxed mb-3">
                Most courses teach the concepts. But after the lessons end, you're left wondering:
              </p>
              <p className="text-lg font-semibold text-foreground mb-6">
                "Okay... now what do I actually build?"
              </p>
              <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
                Marketing Sandbox is a community where aspiring marketers build projects, get real feedback, and practice the skills courses can't teach — together.
              </p>

              {/* Founding member perks */}
              <div className="space-y-2.5 mb-8">
                {[
                  "Invitation to the founding Discord community",
                  "Early access before public launch",
                  "Progress updates as we build",
                ].map((perk) => (
                  <div key={perk} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-accent-foreground flex-shrink-0" />
                    {perk}
                  </div>
                ))}
              </div>

              {/* Form */}
              <div id="hero-form">
                {heroSubmitted ? (
                  <SuccessState />
                ) : (
                  <SignupForm
                    id="hero"
                    onSuccess={() => setHeroSubmitted(true)}
                    consentNote="I agree to receive Marketing Sandbox updates. Unsubscribe anytime."
                  />
                )}
              </div>
            </div>

            {/* Right — founder photo */}
            <div className="relative flex flex-col items-center md:items-end">
              <div className="relative w-full max-w-sm">
                {/* Photo */}
                <div className="rounded-2xl overflow-hidden border border-border shadow-sm aspect-[3/4]">
                  <ImageWithFallback
                    src={founderPhoto}
                    alt="The founder of Marketing Sandbox standing in front of a stone arch"
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Founder caption card */}
                <div className="absolute -bottom-4 -left-4 bg-background border border-border rounded-xl px-4 py-3 shadow-sm max-w-[220px]">
                  <p className="text-xs font-semibold text-foreground mb-0.5">Hi, I'm building this.</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    I couldn't find this community, so I started building it myself.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── Why join early ──────────────────────────────────────────────── */}
        <div className="border-b border-border bg-muted/40 py-8 px-6">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 md:gap-16 items-start">
            <div>
              <p className="text-[11px] font-semibold text-accent-foreground uppercase tracking-widest mb-4">Why join early</p>
              <ul className="space-y-2.5">
                {[
                  "Help shape the community from day one",
                  "Meet other aspiring marketers early",
                  "Get invited before the public launch",
                  "Follow the journey as it unfolds",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-accent-foreground flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">This project is being built in public</p>
              <ul className="space-y-2.5">
                {[
                  "Watch it evolve from idea to community",
                  "See what works — and what doesn't",
                  "Learn alongside me as I figure it out",
                  "Help shape what gets built next",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <ArrowRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Why I built this ────────────────────────────────────────────── */}
        <section className="py-24 px-6 border-b border-border">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-[11px] font-semibold text-accent-foreground uppercase tracking-widest mb-4">The story</p>
              <h2
                className="text-3xl leading-tight tracking-tight mb-6"
                style={{ fontFamily: "var(--font-display)" }}
              >
                I looked for this community. It didn't exist.
              </h2>
              <div className="space-y-4 text-[15px] text-muted-foreground leading-relaxed">
                <p>I have a background in marketing but spent years working as a software engineer. After losing my job, I started refreshing my skills through online courses.</p>
                <p>The courses were helpful — but <span className="text-foreground font-medium">learning the theory wasn't the hard part</span>. The hard part was figuring out how to actually practice.</p>
                <p>I wanted somewhere to build landing pages, run small experiments, set up analytics, share work in progress, and learn from other people doing the same thing.</p>
                <p>I couldn't find that community, so I decided to start building it.</p>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-5">What the community is for</p>
              <div className="space-y-3">
                {[
                  { icon: "🧱", label: "Build landing pages", desc: "Create real pages and run actual traffic to them." },
                  { icon: "🧪", label: "Run experiments", desc: "Test ideas, measure results, and learn what works." },
                  { icon: "📊", label: "Set up analytics", desc: "Practice GA4, GTM, and conversion tracking on real projects." },
                  { icon: "💬", label: "Get real feedback", desc: "Share work in progress with people who get it." },
                  { icon: "📚", label: "Learn together", desc: "Grow alongside others making the same journey." },
                ].map(({ icon, label, desc }) => (
                  <div key={label} className="flex gap-3 items-start p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/50 transition-colors">
                    <span className="text-xl flex-shrink-0">{icon}</span>
                    <div>
                      <p className="font-medium text-[15px] mb-0.5">{label}</p>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Who it's for ────────────────────────────────────────────────── */}
        <section className="py-24 px-6 bg-muted/40 border-b border-border">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12 max-w-xl">
              <p className="text-[11px] font-semibold text-accent-foreground uppercase tracking-widest mb-4">Who it's for</p>
              <h2
                className="text-3xl leading-tight tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                For people who learn best by building.
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { emoji: "📖", label: "Taking a course", desc: "Working through Google, Coursera, or a bootcamp and want somewhere real to practice." },
                { emoji: "🔄", label: "Changing careers", desc: "Building a portfolio for your first marketing role and need proof of real skills." },
                { emoji: "⚡", label: "Teaching yourself", desc: "Learning from YouTube and blogs and want hands-on practice over more theory." },
                { emoji: "💼", label: "Building a portfolio", desc: "Looking for practical experience you can actually talk about in interviews." },
                { emoji: "🧪", label: "Experimenting", desc: "Someone who learns by trying things, measuring results, and iterating." },
                { emoji: "🤝", label: "Learning with others", desc: "Want to stay accountable and learn alongside people on the same path." },
              ].map(({ emoji, label, desc }) => (
                <div key={label} className="bg-background border border-border rounded-xl p-5 hover:border-foreground/20 transition-colors">
                  <span className="text-2xl mb-3 block">{emoji}</span>
                  <p className="font-semibold text-sm mb-1.5">{label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Dark CTA band ────────────────────────────────────────────────── */}
        <section className="py-20 px-6 bg-foreground border-b border-foreground">
          <div className="max-w-xl mx-auto text-center">
            <h2
              className="text-3xl text-white leading-tight tracking-tight mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Join the Founding Members List.
            </h2>
            <p className="text-white/60 text-[15px] mb-8">
              Get an invite to the Discord when it opens. Shape what gets built first.
            </p>
            {anySubmitted ? (
              <SuccessState dark />
            ) : (
              <SignupForm
                id="midpage"
                onSuccess={() => setBottomSubmitted(true)}
                consentNote="I agree to receive Marketing Sandbox updates. Unsubscribe anytime."
                dark
              />
            )}
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <section className="py-24 px-6 border-b border-border">
          <div className="max-w-2xl mx-auto">
            <div className="mb-10 text-center">
              <p className="text-[11px] font-semibold text-accent-foreground uppercase tracking-widest mb-4">FAQ</p>
              <h2
                className="text-3xl leading-tight tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Honest answers.
              </h2>
            </div>
            <Accordion.Root type="single" collapsible className="divide-y divide-border">
              {FAQ_ITEMS.map(({ q, a }, i) => (
                <Accordion.Item key={i} value={String(i)}>
                  <Accordion.Trigger className="w-full flex items-center justify-between py-5 text-left font-medium text-[15px] text-foreground hover:text-muted-foreground transition-colors group cursor-pointer gap-4">
                    {q}
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                  <Accordion.Content className="pb-5 text-[15px] text-muted-foreground leading-relaxed">
                    {a}
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </div>
        </section>

      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="py-12 px-6" id="privacy">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between gap-6 text-sm text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground mb-1">Marketing Sandbox</p>
            <p className="text-[13px]">Marketing skills are built through practice — not just courses.</p>
            <p className="text-[13px] mt-0.5">Pre-launch · Building in public</p>
          </div>
          <div className="flex flex-col gap-1.5 md:text-right text-xs" id="terms">
            <a href="#privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-foreground transition-colors">Terms of Use</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
