"use client";

import { useEffect, useState } from "react";
import { getAllContent, type Content } from "@/lib/firestore";
import { motion } from "framer-motion";

interface Props {
  hasAccess: boolean;
  onUnlock: () => void;
}

export default function ContentGallery({ hasAccess, onUnlock }: Props) {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "image" | "video">("all");

  useEffect(() => {
    getAllContent()
      .then(setContent)
      .finally(() => setLoading(false));
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
                style={{
                  filter:
                    item.isLocked && !hasAccess ? "blur(24px) brightness(0.4)" : "none",
                }}
              />
            ) : (
              <video
                src={item.url}
                className="w-full h-full object-cover"
                style={{
                  filter:
                    item.isLocked && !hasAccess ? "blur(24px) brightness(0.4)" : "none",
                }}
                muted
                loop
                playsInline
                autoPlay={item.isLocked && !hasAccess}
                onMouseEnter={(e) => hasAccess && e.currentTarget.play()}
                onMouseLeave={(e) => !item.isLocked && e.currentTarget.pause()}
              />
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
                className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
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
                className="absolute top-2 right-2 bg-black/60 rounded-md px-2 py-0.5 text-xs"
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
