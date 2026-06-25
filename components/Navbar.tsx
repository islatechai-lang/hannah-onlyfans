"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function Navbar() {
  const { user, profile, signOutUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(10,3,5,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,20,60,0.12)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span
            className="text-2xl font-black gradient-text tracking-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            Hannah&apos;s World
          </span>
          <span className="text-red-400 text-xl">🔥</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/#pricing"
            className="text-sm text-rose-200/70 hover:text-rose-300 transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/#faq"
            className="text-sm text-rose-200/70 hover:text-rose-300 transition-colors"
          >
            FAQ
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="btn-red text-sm py-2 px-4">
                Dashboard
              </Link>
              <button
                onClick={() => signOutUser()}
                className="btn-ghost text-sm py-2 px-4"
              >
                Sign Out
              </button>
              {profile?.photoURL && (
                <Image
                  src={profile.photoURL}
                  alt="avatar"
                  width={34}
                  height={34}
                  className="rounded-full border-2 border-rose-500"
                />
              )}
            </div>
          ) : (
            <Link href="/sign-in" className="btn-red text-sm py-2 px-4">
              Sign In 🔑
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-rose-400 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5">
            <span
              className={`block w-6 h-0.5 bg-rose-400 transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block w-6 h-0.5 bg-rose-400 transition-all ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-6 h-0.5 bg-rose-400 transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t"
            style={{ borderColor: "rgba(255,20,60,0.12)" }}
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              <Link
                href="/#pricing"
                className="text-rose-200/70 hover:text-rose-300 py-2"
                onClick={() => setMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/#faq"
                className="text-rose-200/70 hover:text-rose-300 py-2"
                onClick={() => setMenuOpen(false)}
              >
                FAQ
              </Link>
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="btn-red text-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button onClick={() => signOutUser()} className="btn-ghost">
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/sign-in" className="btn-red text-center">
                  Sign In 🔑
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
