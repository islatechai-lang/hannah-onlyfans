"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function SignInPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 animated-bg grid-pattern"
    >
      {/* Glow */}
      <div
        className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(225,29,72,0.15) 0%, transparent 65%)",
          filter: "blur(40px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass p-8 sm:p-10 text-center glow-border" style={{ borderRadius: 24 }}>
          {/* Logo */}
          <div className="text-5xl mb-4">💦</div>
          <h1 className="text-3xl font-black mb-2">
            Welcome to{" "}
            <span className="gradient-text">Hannah OnlyFans</span>
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
            Sign in to unlock exclusive content
          </p>

          {/* Google Sign In */}
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "white",
            }}
          >
            {/* Google Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="text-xs mt-6" style={{ color: "var(--muted)" }}>
            By signing in you confirm you are 18+ and agree to our terms.
          </p>
        </div>
      </motion.div>
    </main>
  );
}
