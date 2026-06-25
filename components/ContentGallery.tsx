"use client";

import { useEffect, useState } from "react";
import { getAllContent, type Content } from "@/lib/firestore";
import { motion } from "framer-motion";
import Image from "next/image";

interface Props {
  hasAccess: boolean;
  onUnlock: () => void;
}

export default function ContentGallery({ hasAccess, onUnlock }: Props) {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllContent()
      .then(setContent)
      .finally(() => setLoading(false));
  }, []);

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
      <h2 className="text-2xl font-black mb-6">
        Exclusive Content{" "}
        {!hasAccess && <span className="badge-red ml-2">🔒 Locked</span>}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {content.map((item, i) => (
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
              <Image
                src={
                  (hasAccess || !item.isLocked)
                    ? item.url
                    : item.thumbnailUrl || item.url
                }
                alt={item.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                style={{
                  filter:
                    item.isLocked && !hasAccess ? "blur(16px) brightness(0.5)" : "none",
                }}
              />
            ) : (
              <video
                src={(hasAccess || !item.isLocked) ? item.url : undefined}
                className="w-full h-full object-cover"
                style={{
                  filter:
                    item.isLocked && !hasAccess ? "blur(16px) brightness(0.5)" : "none",
                }}
                muted
                loop
                playsInline
                onMouseEnter={(e) => hasAccess && e.currentTarget.play()}
                onMouseLeave={(e) => e.currentTarget.pause()}
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
                  className="btn-red mt-3 text-xs py-1.5 px-3"
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
