"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllPayments,
  getAllUsers,
  getAllContent,
  updatePaymentStatus,
  grantAccess,
  revokeAccess,
  addContent,
  deleteContent,
  type Payment,
  type UserProfile,
  type Content,
} from "@/lib/firestore";
import FileUploader from "@/components/FileUploader";

type Tab = "overview" | "payments" | "users" | "content";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");

  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);

  // Content upload form
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<"image" | "video">("image");
  const [newUrl, setNewUrl] = useState("");
  const [isLocked, setIsLocked] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewContent, setPreviewContent] = useState<Content | null>(null);
  const [activeFilter, setActiveFilter] = useState<"image" | "video">("image");

  const handleLogin = async () => {
    setAuthError("");
    const res = await fetch("/api/admin-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
      loadData();
    } else {
      setAuthError("Wrong password, babe 💔");
    }
  };

  const loadData = async () => {
    setLoading(true);
    const [p, u, c] = await Promise.all([
      getAllPayments(),
      getAllUsers(),
      getAllContent(),
    ]);
    setPayments(p);
    setUsers(u);
    setContent(c);
    setLoading(false);
  };

  useEffect(() => {
    if (authed) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  const handleApprove = async (payment: Payment) => {
    await updatePaymentStatus(payment.id, "approved");
    await grantAccess(payment.userId);
    await loadData();
  };

  const handleReject = async (payment: Payment) => {
    await updatePaymentStatus(payment.id, "rejected");
    await loadData();
  };

  const handleToggleAccess = async (user: UserProfile) => {
    if (user.hasAccess) {
      await revokeAccess(user.uid);
    } else {
      await grantAccess(user.uid);
    }
    await loadData();
  };

  const handleAddContent = async () => {
    if (!newTitle || !newUrl) return;
    setUploading(true);
    await addContent({
      title: newTitle,
      description: newDesc,
      type: newType,
      url: newUrl,
      isLocked,
    });
    setNewTitle("");
    setNewDesc("");
    setNewUrl("");
    setUploading(false);
    await loadData();
  };

  const handleDeleteContent = async (id: string) => {
    if (!confirm("Delete this content?")) return;
    await deleteContent(id);
    await loadData();
  };

  // ── Login Screen ───────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center animated-bg grid-pattern px-4">
        <div
          className="fixed top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(225,29,72,0.15) 0%, transparent 65%)",
            filter: "blur(40px)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass glow-border w-full max-w-sm p-8 relative z-10"
          style={{ borderRadius: 24 }}
        >
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🔐</div>
            <h1 className="text-2xl font-black gradient-text">Admin Access</h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              Enter admin password
            </p>
          </div>
          <input
            type="password"
            className="input-red mb-3"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          {authError && (
            <p className="text-rose-400 text-sm mb-3">{authError}</p>
          )}
          <button onClick={handleLogin} className="btn-red w-full justify-center">
            Enter 🔑
          </button>
        </motion.div>
      </main>
    );
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalRevenue =
    payments.filter((p) => p.status === "approved").length *
    parseInt(process.env.NEXT_PUBLIC_PRICE ?? "280");
  const pending = payments.filter((p) => p.status === "pending").length;
  const approved = payments.filter((p) => p.status === "approved").length;
  const activeUsers = users.filter((u) => u.hasAccess).length;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "payments", label: "Payments", icon: "💳" },
    { key: "users", label: "Users", icon: "👥" },
    { key: "content", label: "Content", icon: "📸" },
  ];

  return (
    <main className="min-h-screen animated-bg noise">
      {/* Admin Navbar */}
      <div
        className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 h-16"
        style={{
          background: "rgba(10,3,5,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,20,60,0.12)",
        }}
      >
        <span className="font-black gradient-text text-lg">
          💦 Admin Panel
        </span>
        <div className="flex gap-1 sm:gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                tab === t.key
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "text-rose-200/50 hover:text-rose-300"
              }`}
            >
              <span className="mr-1">{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {loading && (
          <div className="text-center py-10 text-rose-400 animate-pulse">
            Loading... ⚡
          </div>
        )}

        {/* ── OVERVIEW ──────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <h2 className="text-2xl font-black mb-6">Overview</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  {
                    label: "Total Revenue",
                    value: `₱${totalRevenue.toLocaleString()}`,
                    icon: "💰",
                    color: "#34d399",
                  },
                  {
                    label: "Paid Members",
                    value: activeUsers,
                    icon: "👑",
                    color: "#f43f5e",
                  },
                  {
                    label: "Pending",
                    value: pending,
                    icon: "⏳",
                    color: "#fcd34d",
                  },
                  {
                    label: "Total Users",
                    value: users.length,
                    icon: "👥",
                    color: "#818cf8",
                  },
                ].map((s) => (
                  <div key={s.label} className="glass p-5">
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <div
                      className="text-3xl font-black mb-1"
                      style={{ color: s.color }}
                    >
                      {s.value}
                    </div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent payments */}
              <h3 className="font-bold mb-4 text-rose-300">
                Recent Submissions
              </h3>
              <div className="space-y-3">
                {payments.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="glass p-4 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {p.userDisplayName}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: "var(--muted)" }}
                      >
                        {p.userEmail}
                      </p>
                    </div>
                    <span
                      className={
                        p.status === "approved"
                          ? "badge-green"
                          : p.status === "rejected"
                            ? "badge-red"
                            : "badge-yellow"
                      }
                    >
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── PAYMENTS ──────────────────────────────────── */}
          {tab === "payments" && (
            <motion.div
              key="payments"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black">
                  Payments{" "}
                  {pending > 0 && (
                    <span className="badge-yellow ml-2">{pending} pending</span>
                  )}
                </h2>
                <button
                  onClick={loadData}
                  className="btn-ghost text-sm py-2 px-3"
                >
                  🔄 Refresh
                </button>
              </div>

              <div className="space-y-4">
                {payments.map((p) => (
                  <div key={p.id} className="glass p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold truncate">
                            {p.userDisplayName}
                          </p>
                          <span
                            className={
                              p.status === "approved"
                                ? "badge-green"
                                : p.status === "rejected"
                                  ? "badge-red"
                                  : "badge-yellow"
                            }
                          >
                            {p.status}
                          </span>
                          {p.aiVerified && (
                            <span className="badge-green text-xs">
                              AI ✓
                            </span>
                          )}
                        </div>
                        <p
                          className="text-xs truncate"
                          style={{ color: "var(--muted)" }}
                        >
                          {p.userEmail}
                        </p>
                        <p
                          className="text-xs mt-1"
                          style={{ color: "var(--muted)" }}
                        >
                          AI: {p.aiReason}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {p.screenshotUrl && (
                          <a
                            href={p.screenshotUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-ghost text-xs py-1.5 px-3"
                          >
                            📸 View
                          </a>
                        )}
                        {p.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(p)}
                              className="btn-red text-xs py-1.5 px-3"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleReject(p)}
                              className="text-xs py-1.5 px-3 rounded-lg border transition-colors"
                              style={{
                                borderColor: "rgba(239,68,68,0.3)",
                                color: "#f87171",
                                background: "rgba(239,68,68,0.05)",
                              }}
                            >
                              ✕ Reject
                            </button>
                          </>
                        )}
                        {p.status === "approved" && (
                          <button
                            onClick={() => handleReject(p)}
                            className="text-xs py-1.5 px-3 rounded-lg border transition-colors"
                            style={{
                              borderColor: "rgba(239,68,68,0.3)",
                              color: "#f87171",
                              background: "rgba(239,68,68,0.05)",
                            }}
                          >
                            Revoke
                          </button>
                        )}
                        {p.status === "rejected" && (
                          <button
                            onClick={() => handleApprove(p)}
                            className="btn-red text-xs py-1.5 px-3"
                          >
                            Re-approve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {payments.length === 0 && (
                  <div className="glass p-12 text-center">
                    <p className="text-4xl mb-3">💳</p>
                    <p style={{ color: "var(--muted)" }}>No payments yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── USERS ─────────────────────────────────────── */}
          {tab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black">
                  Users ({users.length})
                </h2>
                <button
                  onClick={loadData}
                  className="btn-ghost text-sm py-2 px-3"
                >
                  🔄 Refresh
                </button>
              </div>

              <div className="space-y-3">
                {users.map((u) => (
                  <div
                    key={u.uid}
                    className="glass p-4 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{u.displayName}</p>
                      <p
                        className="text-xs truncate"
                        style={{ color: "var(--muted)" }}
                      >
                        {u.email}
                      </p>
                      {u.hasAccess && u.accessExpiresAt && (
                        <p className="text-[10px] text-emerald-400 mt-1 font-mono">
                          Expires: {typeof u.accessExpiresAt.toDate === "function"
                            ? u.accessExpiresAt.toDate().toLocaleDateString()
                            : new Date((u.accessExpiresAt as any).seconds * 1000).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span
                        className={u.hasAccess ? "badge-green" : "badge-red"}
                      >
                        {u.hasAccess ? "✓ Access" : "🔒 Locked"}
                      </span>
                      <button
                        onClick={() => handleToggleAccess(u)}
                        className="btn-ghost text-xs py-1.5 px-3"
                      >
                        {u.hasAccess ? "Revoke" : "Grant"}
                      </button>
                    </div>
                  </div>
                ))}

                {users.length === 0 && (
                  <div className="glass p-12 text-center">
                    <p className="text-4xl mb-3">👥</p>
                    <p style={{ color: "var(--muted)" }}>No users yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── CONTENT ───────────────────────────────────── */}
          {tab === "content" && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <h2 className="text-2xl font-black mb-6">Content Manager</h2>

              {/* Upload form */}
              <div className="glass p-6 mb-8" style={{ borderRadius: 20 }}>
                <h3 className="font-bold mb-5 text-rose-300">
                  📤 Upload New Content
                </h3>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    className="input-red"
                    placeholder="Title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                  <input
                    type="text"
                    className="input-red"
                    placeholder="Description (optional)"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 mb-4">
                  {(["image", "video"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewType(t)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
                        newType === t
                          ? "border-rose-500 bg-rose-500/20 text-rose-300"
                          : "border-transparent bg-white/5 text-rose-200/50 hover:border-rose-500/30"
                      }`}
                    >
                      {t === "image" ? "📸 Image" : "🎬 Video"}
                    </button>
                  ))}
                  <label className="flex items-center gap-2 cursor-pointer ml-auto">
                    <span className="text-sm" style={{ color: "var(--muted)" }}>
                      Locked
                    </span>
                    <div
                      onClick={() => setIsLocked(!isLocked)}
                      className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative ${isLocked ? "bg-rose-500" : "bg-white/10"}`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isLocked ? "left-6" : "left-1"}`}
                      />
                    </div>
                  </label>
                </div>

                {/* Upload area */}
                <div className="mb-4">
                  {newUrl ? (
                    <div
                      className="rounded-2xl p-6 text-center"
                      style={{ border: "2px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.03)" }}
                    >
                      <p className="text-green-400 font-semibold mb-3">
                        ✓ File uploaded!
                      </p>
                      {newType === "image" ? (
                        <img src={newUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg mb-3" />
                      ) : (
                        <video src={newUrl} className="max-h-40 mx-auto rounded-lg mb-3" controls muted playsInline />
                      )}
                      <button
                        onClick={() => setNewUrl("")}
                        className="text-rose-400 text-xs cursor-pointer hover:text-rose-300 transition-colors"
                      >
                        ✕ Remove & re-upload
                      </button>
                    </div>
                  ) : (
                    <FileUploader
                      endpoint={newType === "image" ? "contentImage" : "contentVideo"}
                      onUploadComplete={(url) => setNewUrl(url)}
                      onUploadError={(err) => alert("Upload error: " + err.message)}
                    />
                  )}
                </div>

                <button
                  onClick={handleAddContent}
                  disabled={!newTitle || !newUrl || uploading}
                  className="btn-red disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {uploading ? "Saving..." : "Save Content ✓"}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="font-bold text-rose-300">
                  Uploaded Contents ({content.filter(c => c.type === activeFilter).length})
                </h3>
                {/* Filter Tabs */}
                <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5 w-fit">
                  {(["image", "video"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase cursor-pointer"
                      style={{
                        background: activeFilter === filter ? "rgba(225, 29, 72, 0.2)" : "transparent",
                        borderColor: activeFilter === filter ? "rgba(225, 29, 72, 0.3)" : "transparent",
                        borderWidth: 1,
                        color: activeFilter === filter ? "var(--red-light)" : "rgba(244, 63, 94, 0.6)",
                      }}
                    >
                      {filter === "image" ? "📸 Photos" : "🎬 Videos"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {content.filter(c => c.type === activeFilter).map((c) => (
                  <div
                    key={c.id}
                    className="relative group glass overflow-hidden"
                    style={{ borderRadius: 14 }}
                  >
                    <div className="aspect-square bg-rose-900/20 flex items-center justify-center relative overflow-hidden">
                      {c.type === "image" ? (
                        <img
                          src={c.url}
                          alt={c.title}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <video
                          src={c.url}
                          className="object-cover w-full h-full"
                          muted
                          playsInline
                        />
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-semibold truncate">
                        {c.title}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span
                          className={
                            c.isLocked ? "badge-red" : "badge-green"
                          }
                          style={{ fontSize: "0.65rem", padding: "1px 6px" }}
                        >
                          {c.isLocked ? "🔒 Locked" : "🔓 Free"}
                        </span>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPreviewContent(c)}
                        className="btn-ghost text-xs py-1 px-2 cursor-pointer"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteContent(c.id)}
                        className="text-xs py-1 px-2 rounded-lg bg-red-900/50 border border-red-500/30 text-red-400 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {content.filter(c => c.type === activeFilter).length === 0 && (
                  <div className="glass col-span-full p-12 text-center">
                    <p className="text-4xl mb-3">📸</p>
                    <p style={{ color: "var(--muted)" }}>
                      No {activeFilter + "s"} found
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox Preview Modal */}
      {previewContent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(10,3,5,0.9)", backdropFilter: "blur(10px)" }}
          onClick={() => setPreviewContent(null)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewContent(null)}
              className="absolute -top-10 right-0 text-white text-base hover:text-rose-400 cursor-pointer font-bold"
            >
              ✕ Close Preview
            </button>
            {previewContent.type === "image" ? (
              <img
                src={previewContent.url}
                alt={previewContent.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg glow-border"
              />
            ) : (
              <video
                src={previewContent.url}
                className="max-w-full max-h-[70vh] object-contain rounded-lg glow-border"
                controls
                autoPlay
                playsInline
              />
            )}
            <h3 className="text-lg font-bold mt-4 text-center text-rose-200">{previewContent.title}</h3>
            {previewContent.description && (
              <p className="text-sm mt-1 text-center" style={{ color: "var(--muted)" }}>
                {previewContent.description}
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
