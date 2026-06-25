"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const features = [
  "Exclusive photos & videos 📸",
  "New content added regularly 🔥",
  "Lifetime access, no subscription 💎",
  "Private members-only feed 🔞",
  "Behind-the-scenes content 🎬",
  "Direct vibe with Hannah 💌",
];

const testimonials = [
  {
    name: "JM",
    text: "Best ₱299 I ever spent. Content is 🔥🔥🔥",
    stars: 5,
    date: "1 week ago",
  },
  {
    name: "Carlo A.",
    text: "Legit! Verified in like 2 minutes. No cap.",
    stars: 5,
    date: "3 days ago",
  },
  {
    name: "Anonymous",
    text: "I was skeptical pero worth it talaga. 😍",
    stars: 5,
    date: "2 weeks ago",
  },
];

const faqs = [
  {
    q: "How do I pay?",
    a: "Send ₱299 to our GCash number, upload your screenshot, and get instant access. The process takes under 5 minutes.",
  },
  {
    q: "Is it really lifetime access?",
    a: "Yes! Pay once, access forever. No monthly fees, no renewals. Your account is unlocked permanently.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We currently accept GCash only for Philippine users.",
  },
  {
    q: "How fast is verification?",
    a: "Our AI verifies most payments in seconds. If manual review is needed, it's usually within 24 hours.",
  },
  {
    q: "Is this safe and private?",
    a: "Absolutely. We use secure Firebase auth, and your data is never shared with anyone.",
  },
];

export default function LandingSections() {
  return (
    <>
      {/* ── FEATURES ─────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6" id="features">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              What you <span className="gradient-text">unlock</span>
            </h2>
            <p style={{ color: "var(--muted)" }}>
              Everything included in one lifetime payment
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="glass p-4 flex items-center gap-3"
              >
                <span className="text-rose-500 text-xl">✓</span>
                <span className="font-medium">{f}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6" id="pricing">
        <div className="max-w-lg mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              One price. <span className="gradient-text">Lifetime.</span>
            </h2>
            <p className="mb-10" style={{ color: "var(--muted)" }}>
              No tricks, no subscriptions.
            </p>

            <div
              className="glass p-8 glow-border relative overflow-hidden"
              style={{ borderRadius: 24 }}
            >
              {/* Glow accent */}
              <div
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(225,29,72,0.25) 0%, transparent 70%)",
                }}
              />

              <div className="badge-red mb-4 inline-block">
                🔥 Best Deal
              </div>
              <div className="text-6xl font-black mb-1 gradient-text">
                ₱299
              </div>
              <div className="text-sm mb-8" style={{ color: "var(--muted)" }}>
                One-time payment · Lifetime access
              </div>

              <ul className="text-left space-y-3 mb-8">
                {features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-rose-500">✓</span>
                    <span style={{ color: "var(--text)" }}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link href="/sign-in" className="btn-red w-full justify-center text-lg py-4">
                Get Instant Access 🔥
              </Link>
              <p
                className="text-xs mt-3"
                style={{ color: "var(--muted)" }}
              >
                Pay via GCash • Verified by AI • Instant unlock
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              What members <span className="gradient-text">say</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-6"
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <span key={s} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="mb-4 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{t.name}</span>
                  <span className="text-xs" style={{ color: "var(--muted)" }}>
                    {t.date}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6" id="faq">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="gradient-text">FAQ</span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="glass p-6"
              >
                <h3 className="font-bold text-rose-300 mb-2">{faq.q}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-4xl sm:text-5xl font-black mb-6">
            Ready to unlock{" "}
            <span className="gradient-text">everything?</span>
          </h2>
          <p className="mb-8 text-lg" style={{ color: "var(--muted)" }}>
            Join hundreds of members. ₱299 one-time. Lifetime access.
          </p>
          <Link href="/sign-in" className="btn-red text-xl px-10 py-5">
            Get Access Now 💋
          </Link>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer
        className="py-8 px-4 text-center text-sm border-t"
        style={{
          borderColor: "rgba(255,20,60,0.1)",
          color: "var(--muted)",
        }}
      >
        <p>© {new Date().getFullYear()} Hannah OnlyFans. All rights reserved. 💦</p>
        <p className="mt-1 text-xs">18+ only. By signing up you confirm you are of legal age.</p>
      </footer>
    </>
  );
}
