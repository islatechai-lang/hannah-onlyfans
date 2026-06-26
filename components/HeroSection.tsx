"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden animated-bg grid-pattern">
      {/* Glow orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(225,29,72,0.2) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(251,113,133,0.15) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-24 pb-20">
        {/* Badge */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="flex justify-center mb-6"
        >
          <span className="badge-red">💦 Limited Time — ₱280 for 7 Days</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={1}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="text-5xl sm:text-7xl font-black mb-6 leading-none tracking-tight"
        >
          Unlock{" "}
          <span className="gradient-text glow-text">Hannah OnlyFans</span>
          <br />
          Exclusive Access
        </motion.h1>

        {/* Sub */}
        <motion.p
          custom={2}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
          style={{ color: "var(--muted)" }}
        >
          Premium photos, videos, and exclusive content. 7 days
          access. No subscriptions, no BS.
        </motion.p>

        {/* CTA */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {user ? (
            <Link href="/dashboard" className="btn-red text-lg px-8 py-4">
              Go to Dashboard 💦
            </Link>
          ) : (
            <Link href="/sign-in" className="btn-red text-lg px-8 py-4">
              Get Access Now — ₱280 💋
            </Link>
          )}
          <Link href="#pricing" className="btn-ghost text-lg px-8 py-4">
            See What&apos;s Inside 👀
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mt-14 flex flex-wrap justify-center gap-6"
        >
          {[
            { icon: "📅", label: "7 Days Access" },
            { icon: "💳", label: "GCash Payment" },
            { icon: "⚡", label: "Instant Verify" },
            { icon: "🔞", label: "18+ Only" },
          ].map((b) => (
            <div
              key={b.label}
              className="glass flex items-center gap-2 px-4 py-2 text-sm"
              style={{ borderRadius: 10 }}
            >
              <span>{b.icon}</span>
              <span style={{ color: "var(--muted)" }}>{b.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Preview blur grid */}
        <motion.div
          custom={5}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mt-16 grid grid-cols-3 sm:grid-cols-5 gap-2 max-w-3xl mx-auto"
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-xl overflow-hidden glow-border"
              style={{
                background: `linear-gradient(${135 + i * 15}deg, rgba(225,29,72,0.3), rgba(251,113,133,0.15))`,
                border: "1px solid rgba(225,29,72,0.2)",
              }}
            >
              {/* Placeholder blur preview */}
              <div
                className="absolute inset-0 flex items-center justify-center text-2xl"
                style={{ backdropFilter: "blur(8px)" }}
              >
                🔒
              </div>
            </div>
          ))}
        </motion.div>
        <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>
          Unlock to view exclusive content →
        </p>
      </div>
    </section>
  );
}
