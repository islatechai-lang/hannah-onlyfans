"use client";

import { useEffect, useState } from "react";
import { getAllContent, type Content } from "@/lib/firestore";
import { motion } from "framer-motion";

interface Props {
  hasAccess: boolean;
  onUnlock: () => void;
  userEmail?: string;
}

export default function ContentGallery({ hasAccess, onUnlock, userEmail }: Props) {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "image" | "video">("all");
  const [isPageFocused, setIsPageFocused] = useState(true);

  useEffect(() => {
    getAllContent()
      .then(setContent)
      .finally(() => setLoading(false));

    // Security listeners
    const handleFocus = () => setIsPageFocused(true);
    const handleBlur = () => setIsPageFocused(false);
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPageFocused(false);
      } else {
        setIsPageFocused(true);
      }
    };

    const preventDefault = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === "s" || e.key === "S" || e.key === "p" || e.key === "P" || e.key === "c" || e.key === "C" || e.key === "u" || e.key === "U")) ||
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "i" || e.key === "I" || e.key === "j" || e.key === "J" || e.key === "c" || e.key === "C"))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("contextmenu", preventDefault);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("contextmenu", preventDefault);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const filteredContent = content.filter(
    (item) => activeFilter === "all" || item.type === activeFilter
  );

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl animate-pulse"
            style={{ background: "rgba(225,29,72,0.08)" }}
          />
        ))}
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="glass p-12 text-center" style={{ borderRadius: 20 }}>
        <div className="text-5xl mb-4">📸</div>
        <h3 className="text-xl font-bold mb-2">Content coming soon</h3>
        <p style={{ color: "var(--muted)" }}>
          Exclusive content is being uploaded. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Security Overlay for Focus Loss */}
      {!isPageFocused && hasAccess && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center text-center p-6 bg-black/95 backdrop-blur-3xl"
          style={{ pointerEvents: "all" }}
        >
          <div className="text-6xl mb-4">🛡️</div>
          <h3 className="text-xl font-bold text-rose-400 mb-2">Security Shield Active</h3>
          <p className="text-sm max-w-sm text-rose-200/60 leading-relaxed">
            Screen capturing is blocked. Please click inside the window to unlock content.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl font-black flex items-center gap-2">
          Exclusive Content{" "}
          {!hasAccess && <span className="badge-red">🔒 Locked</span>}
        </h2>
        
        {/* Filter Tabs */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5 w-fit">
          {(["all", "image", "video"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase cursor-pointer ${
                activeFilter === filter
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "text-rose-200/50 hover:text-rose-200"
              }`}
            >
              {filter === "all" ? "💦 All" : filter === "image" ? "📸 Photos" : "🎬 Videos"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredContent.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="relative aspect-square rounded-xl overflow-hidden group"
            style={{ border: "1px solid rgba(225,29,72,0.15)" }}
          >
            {/* Content preview */}
            {item.type === "image" ? (
              <img
                src={item.url}
                alt={item.title}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                style={{
                  filter:
                    item.isLocked && !hasAccess ? "blur(24px) brightness(0.4)" : "none",
                }}
              />
            ) : (
              <video
                src={item.url}
                className="w-full h-full object-cover"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                controlsList="nodownload"
                disablePictureInPicture
                style={{
                  filter:
                    item.isLocked && !hasAccess ? "blur(24px) brightness(0.4)" : "none",
                }}
                muted
                loop
                playsInline
                autoPlay={item.isLocked && !hasAccess}
              />
            )}

            {/* Transparent protection overlay & hover-play trigger */}
            {(!item.isLocked || hasAccess) && (
              <div
                className="absolute inset-0 z-10 select-none cursor-default"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                onMouseEnter={(e) => {
                  if (!hasAccess) return;
                  const video = e.currentTarget.parentElement?.querySelector("video");
                  if (video) video.play().catch(() => {});
                }}
                onMouseLeave={(e) => {
                  const video = e.currentTarget.parentElement?.querySelector("video");
                  if (video) video.pause();
                }}
              />
            )}

            {/* Watermark overlay */}
            {hasAccess && userEmail && (
              <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center overflow-hidden">
                <div className="text-[10px] font-mono text-white/5 rotate-[-25deg] select-none whitespace-nowrap uppercase tracking-widest">
                  {userEmail} • Hannah OnlyFans
                </div>
              </div>
            )}

            {/* Lock overlay */}
            {(item.isLocked && !hasAccess) && (
              <div className="locked-overlay">
                <span className="text-4xl mb-2">🔒</span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: "var(--muted)" }}
                >
                  Members Only
                </span>
                <button
                  onClick={onUnlock}
                  className="btn-red mt-3 text-xs py-1.5 px-3 cursor-pointer"
                >
                  Unlock
                </button>
              </div>
            )}

            {/* Info bar on hover (unlocked) */}
            {(!item.isLocked || hasAccess) && (
              <div
                className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                style={{
                  background: "linear-gradient(transparent, rgba(10,3,5,0.9))",
                }}
              >
                <p className="text-xs font-medium truncate">{item.title}</p>
              </div>
            )}

            {/* Type badge */}
            {item.type === "video" && (!item.isLocked || hasAccess) && (
              <div
                className="absolute top-2 right-2 bg-black/60 rounded-md px-2 py-0.5 text-xs z-20"
              >
                🎬
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
