"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ContentGallery from "@/components/ContentGallery";
import PaymentModal from "@/components/PaymentModal";
import { motion } from "framer-motion";
import Image from "next/image";

export default function DashboardPage() {
  const { user, profile, loading, signOutUser, refreshProfile } = useAuth();
  const router = useRouter();
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/sign-in");
    }
  }, [user, loading, router]);

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-bg">
        <div className="text-rose-500 animate-pulse text-2xl">Loading... 💦</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen animated-bg noise">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10"
        >
          <div className="flex items-center gap-4">
            {profile.photoURL && (
              <Image
                src={profile.photoURL}
                alt="avatar"
                width={56}
                height={56}
                className="rounded-full border-2 border-rose-500"
              />
            )}
            <div>
              <h1 className="text-2xl font-black">
                Hey, {profile.displayName?.split(" ")[0]} 👋
              </h1>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {profile.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {profile.hasAccess ? (
              <span className="badge-green">✓ Full Access</span>
            ) : (
              <span className="badge-red">🔒 Locked</span>
            )}
          </div>
        </motion.div>

        {/* Access banner */}
        {!profile.hasAccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass glow-border p-6 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div>
              <h2 className="font-bold text-lg mb-1">
                🔒 Content is locked
              </h2>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Send ₱299 via GCash and upload your screenshot for instant access.
              </p>
            </div>
            <button
              onClick={() => setShowPayment(true)}
              className="btn-red whitespace-nowrap"
            >
              Unlock Now — ₱299 💋
            </button>
          </motion.div>
        )}

        {profile.hasAccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-4 mb-10 flex items-center gap-3"
            style={{ borderColor: "rgba(52,211,153,0.2)", background: "rgba(16,185,129,0.05)" }}
          >
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-bold text-green-400">You have full access!</p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Enjoy all exclusive content. Lifetime access — no expiry.
              </p>
            </div>
          </motion.div>
        )}

        {/* Content Gallery */}
        <ContentGallery
          hasAccess={profile.hasAccess}
          onUnlock={() => setShowPayment(true)}
        />
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            refreshProfile();
          }}
          userId={user.uid}
          userEmail={profile.email}
          userDisplayName={profile.displayName}
        />
      )}
    </main>
  );
}
