"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { submitPayment, grantAccess } from "@/lib/firestore";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  userEmail: string;
  userDisplayName: string;
}

type Step = "instructions" | "upload" | "verifying" | "success" | "pending";

export default function PaymentModal({
  onClose,
  onSuccess,
  userId,
  userEmail,
  userDisplayName,
}: Props) {
  const [step, setStep] = useState<Step>("instructions");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [verifyResult, setVerifyResult] = useState<{
    verified: boolean;
    confidence: string;
    reason: string;
  } | null>(null);

  const gcashNumber =
    process.env.NEXT_PUBLIC_GCASH_NUMBER ?? "09XX-XXX-XXXX";
  const gcashName = process.env.NEXT_PUBLIC_GCASH_NAME ?? "Hannah";
  const price = process.env.NEXT_PUBLIC_PRICE ?? "299";

  const handleUploadComplete = async (url: string) => {
    setScreenshotUrl(url);
    setStep("verifying");

    try {
      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenshotUrl: url }),
      });
      const data = await res.json();
      setVerifyResult(data);

      const status =
        data.verified && data.confidence === "high" ? "approved" : "pending";

      await submitPayment({
        userId,
        userEmail,
        userDisplayName,
        screenshotUrl: url,
        aiVerified: data.verified,
        aiReason: data.reason,
        status,
      });

      if (status === "approved") {
        await grantAccess(userId);
        setStep("success");
        setTimeout(() => onSuccess(), 3000);
      } else {
        setStep("pending");
      }
    } catch (err) {
      console.error(err);
      // Submit for manual review on error
      await submitPayment({
        userId,
        userEmail,
        userDisplayName,
        screenshotUrl: url,
        aiVerified: false,
        aiReason: "Verification error — manual review needed",
        status: "pending",
      });
      setStep("pending");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(10,3,5,0.85)", backdropFilter: "blur(8px)" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="glass glow-border w-full max-w-md p-8 relative"
          style={{ borderRadius: 24 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-rose-400/60 hover:text-rose-400 text-xl"
            aria-label="Close"
          >
            ✕
          </button>

          {/* ── INSTRUCTIONS ─────────────────────────────── */}
          {step === "instructions" && (
            <div>
              <div className="text-4xl mb-4 text-center">💳</div>
              <h2 className="text-2xl font-black text-center mb-2">
                Payment Instructions
              </h2>
              <p className="text-center text-sm mb-6" style={{ color: "var(--muted)" }}>
                Follow these steps to unlock lifetime access
              </p>

              <ol className="space-y-4 mb-8">
                {[
                  {
                    n: "1",
                    title: "Open GCash",
                    desc: "Open your GCash app and go to Send Money",
                  },
                  {
                    n: "2",
                    title: "Send ₱299",
                    desc: `Send exactly ₱${price} to the number below`,
                  },
                  {
                    n: "3",
                    title: "Screenshot",
                    desc: "Take a screenshot of the successful payment",
                  },
                  {
                    n: "4",
                    title: "Upload",
                    desc: "Upload your screenshot on the next step",
                  },
                ].map((s) => (
                  <li key={s.n} className="flex gap-4 items-start">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{
                        background: "rgba(225,29,72,0.2)",
                        border: "1px solid rgba(225,29,72,0.4)",
                        color: "var(--red-light)",
                      }}
                    >
                      {s.n}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{s.title}</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        {s.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              {/* GCash details */}
              <div
                className="glass p-4 mb-6 text-center"
                style={{ background: "rgba(225,29,72,0.06)" }}
              >
                <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>
                  Send to
                </p>
                <p className="text-2xl font-black gradient-text">{gcashNumber}</p>
                <p className="text-sm font-semibold mt-1">{gcashName}</p>
                <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
                  Amount:{" "}
                  <span className="text-rose-400 font-bold">₱{price}.00</span>
                </p>
              </div>

              <button onClick={() => setStep("upload")} className="btn-red w-full justify-center text-base py-3">
                I&apos;ve sent the payment →
              </button>
            </div>
          )}

          {/* ── UPLOAD ───────────────────────────────────── */}
          {step === "upload" && (
            <div>
              <div className="text-4xl mb-4 text-center">📸</div>
              <h2 className="text-2xl font-black text-center mb-2">
                Upload Screenshot
              </h2>
              <p
                className="text-center text-sm mb-8"
                style={{ color: "var(--muted)" }}
              >
                Upload your GCash payment confirmation screenshot
              </p>

              <div
                className="border-2 border-dashed rounded-xl p-8 text-center mb-4"
                style={{ borderColor: "rgba(225,29,72,0.3)" }}
              >
                <UploadButton<OurFileRouter, "paymentScreenshot">
                  endpoint="paymentScreenshot"
                  onClientUploadComplete={(res) => {
                    if (res?.[0]?.ufsUrl) {
                      handleUploadComplete(res[0].ufsUrl);
                    }
                  }}
                  onUploadError={(err) => {
                    alert("Upload failed: " + err.message);
                  }}
                  appearance={{
                    button: {
                      background: "linear-gradient(135deg, #e11d48, #f43f5e)",
                      borderRadius: "10px",
                      fontWeight: "600",
                      padding: "10px 24px",
                    },
                    container: { flexDirection: "column", gap: "8px" },
                    allowedContent: { color: "var(--muted)", fontSize: "12px" },
                  }}
                />
              </div>

              <button
                onClick={() => setStep("instructions")}
                className="btn-ghost w-full justify-center text-sm mt-2"
              >
                ← Back to instructions
              </button>
            </div>
          )}

          {/* ── VERIFYING ────────────────────────────────── */}
          {step === "verifying" && (
            <div className="text-center py-8">
              <div className="text-5xl mb-6 animate-spin">⚡</div>
              <h2 className="text-2xl font-black mb-3">Verifying Payment</h2>
              <p style={{ color: "var(--muted)" }}>
                Our AI is analyzing your screenshot...
              </p>
              <div className="mt-6 flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      background: "var(--red)",
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── SUCCESS ──────────────────────────────────── */}
          {step === "success" && (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
                className="text-6xl mb-6"
              >
                🎉
              </motion.div>
              <h2 className="text-2xl font-black mb-3 gradient-text">
                Access Granted!
              </h2>
              <p style={{ color: "var(--muted)" }}>
                Payment verified ✓ You now have lifetime access. Redirecting...
              </p>
            </div>
          )}

          {/* ── PENDING ──────────────────────────────────── */}
          {step === "pending" && (
            <div className="text-center py-8">
              <div className="text-5xl mb-6">⏳</div>
              <h2 className="text-2xl font-black mb-3">Under Review</h2>
              <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
                {verifyResult?.reason ||
                  "Your payment is being reviewed by our team."}
              </p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                You&apos;ll receive access within <strong className="text-rose-400">24 hours</strong>{" "}
                after manual approval.
              </p>
              <button onClick={onClose} className="btn-red mt-6">
                Got it 👍
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
