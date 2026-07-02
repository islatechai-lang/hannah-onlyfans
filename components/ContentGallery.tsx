import { useEffect, useState, useRef } from "react";
import { getAllContent, type Content } from "@/lib/firestore";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  hasAccess: boolean;
  onUnlock: () => void;
  userEmail?: string;
}

export default function ContentGallery({ hasAccess, onUnlock, userEmail }: Props) {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"image" | "video">("image");
  const [selectedItem, setSelectedItem] = useState<Content | null>(null);
  const [isPageFocused, setIsPageFocused] = useState(true);
  
  // Image zoom & pan state
  const [zoomScale, setZoomScale] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Custom video player states
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isEnded, setIsEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    };
  }, []);

  const filteredContent = content.filter(
    (item) => item.type === activeFilter
  );

  const navigateItem = (direction: "prev" | "next") => {
    if (!selectedItem) return;
    const currentIndex = filteredContent.findIndex((item) => item.id === selectedItem.id);
    if (currentIndex === -1) return;

    let newIndex = currentIndex;
    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredContent.length - 1;
    } else {
      newIndex = currentIndex < filteredContent.length - 1 ? currentIndex + 1 : 0;
    }

    setZoomScale(1);
    setIsPlaying(true);
    setCurrentTime(0);
    setIsEnded(false);
    setSelectedItem(filteredContent[newIndex]);
  };

  useEffect(() => {
    if (!selectedItem) return;

    const handleGalleryKeys = (e: KeyboardEvent) => {
      if (selectedItem.type === "image") {
        if (e.key === "ArrowLeft") {
          navigateItem("prev");
        } else if (e.key === "ArrowRight") {
          navigateItem("next");
        }
      } else if (selectedItem.type === "video") {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          navigateItem("prev");
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          navigateItem("next");
        }
      }
      if (e.key === "Escape") {
        setSelectedItem(null);
      }
    };

    window.addEventListener("keydown", handleGalleryKeys);
    return () => {
      window.removeEventListener("keydown", handleGalleryKeys);
    };
  }, [selectedItem, filteredContent]);

  useEffect(() => {
    if (zoomScale === 1) {
      setPanPosition({ x: 0, y: 0 });
    }
  }, [zoomScale]);

  useEffect(() => {
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
    setIsEnded(false);
  }, [selectedItem]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleZoom = (type: "in" | "out") => {
    setZoomScale((prev) => {
      const step = 0.25;
      const nextScale = type === "in" ? prev + step : prev - step;
      return Math.min(Math.max(nextScale, 1), 3);
    });
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setDragStart({
      x: clientX - panPosition.x,
      y: clientY - panPosition.y,
    });
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || zoomScale <= 1) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setPanPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isEnded) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      setIsEnded(false);
      return;
    }
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
    if (time < duration) {
      setIsEnded(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const vol = parseFloat(e.target.value);
    videoRef.current.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && volume === 0) {
      videoRef.current.volume = 0.5;
      setVolume(0.5);
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    const playerContainer = videoRef.current.parentElement;
    if (!playerContainer) return;

    if (!document.fullscreenElement) {
      playerContainer.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(console.error);
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(console.error);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };



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
          {(["image", "video"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase cursor-pointer ${
                activeFilter === filter
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "text-rose-200/50 hover:text-rose-200"
              }`}
            >
              {filter === "image" ? "📸 Photos" : "🎬 Videos"}
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
            className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
            style={{ border: "1px solid rgba(225,29,72,0.15)" }}
            onClick={() => {
              if (hasAccess || !item.isLocked) {
                setSelectedItem(item);
              } else {
                onUnlock();
              }
            }}
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

            {/* Info bar (always visible) */}
            {(!item.isLocked || hasAccess) && (
              <div
                className="absolute bottom-0 left-0 right-0 p-2 z-20"
                style={{
                  background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
                }}
              >
                <p className="text-xs font-bold text-white truncate">{item.title}</p>
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

      {/* Lightbox Modal */}
      {selectedItem && (hasAccess || !selectedItem.isLocked) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
          onClick={() => setSelectedItem(null)}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white hover:text-rose-400 text-3xl font-black z-50 transition-colors cursor-pointer"
            onClick={() => setSelectedItem(null)}
          >
            ✕
          </button>

          {/* Left Arrow (Prev - Image Mode only) */}
          {selectedItem.type === "image" && filteredContent.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateItem("prev");
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:text-rose-400 text-4xl font-black z-40 bg-black/40 hover:bg-black/60 w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer select-none"
            >
              ‹
            </button>
          )}

          {/* Right Arrow (Next - Image Mode only) */}
          {selectedItem.type === "image" && filteredContent.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateItem("next");
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:text-rose-400 text-4xl font-black z-40 bg-black/40 hover:bg-black/60 w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer select-none"
            >
              ›
            </button>
          )}

          {/* Up Arrow (Prev - Video Mode only - Reels style) */}
          {selectedItem.type === "video" && filteredContent.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateItem("prev");
              }}
              className="absolute top-6 left-1/2 -translate-x-1/2 text-white hover:text-rose-400 text-2xl font-black z-40 bg-black/40 hover:bg-black/60 w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer select-none"
              title="Previous Video"
            >
              ▲
            </button>
          )}

          {/* Down Arrow (Next - Video Mode only - Reels style) */}
          {selectedItem.type === "video" && filteredContent.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateItem("next");
              }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white hover:text-rose-400 text-2xl font-black z-40 bg-black/40 hover:bg-black/60 w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer select-none animate-bounce"
              title="Next Video"
            >
              ▼
            </button>
          )}
          
          <div
            className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem.type === "image" ? (
              <div className="relative w-fit h-fit flex flex-col items-center justify-center">
                <div className="relative overflow-hidden rounded-lg max-w-full max-h-[75vh] flex items-center justify-center bg-black/40">
                  {/* Floating zoom pill (small and elegant) */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 z-40 select-none text-[10px] shadow-lg">
                    <button
                      onClick={() => handleZoom("out")}
                      disabled={zoomScale <= 1}
                      className="text-white/80 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-white/80 p-0.5 cursor-pointer transition-colors"
                      title="Zoom Out"
                    >
                      ➖
                    </button>
                    <span className="text-white/50 font-mono select-none px-0.5">
                      {Math.round(zoomScale * 100)}%
                    </span>
                    <button
                      onClick={() => handleZoom("in")}
                      disabled={zoomScale >= 3}
                      className="text-white/80 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-white/80 p-0.5 cursor-pointer transition-colors"
                      title="Zoom In"
                    >
                      ➕
                    </button>
                  </div>

                  <img
                    src={selectedItem.url}
                    alt={selectedItem.title}
                    className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl origin-center"
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                    style={{
                      transform: `scale(${zoomScale}) translate(${panPosition.x / zoomScale}px, ${panPosition.y / zoomScale}px)`,
                      transition: isDragging ? "none" : "transform 0.15s ease-out"
                    }}
                  />
                  {/* Transparent protection & drag panning overlay */}
                  <div
                    className="absolute inset-0 z-10 select-none"
                    style={{ cursor: zoomScale > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                    onMouseDown={handleDragStart}
                    onMouseMove={handleDragMove}
                    onMouseUp={handleDragEnd}
                    onMouseLeave={handleDragEnd}
                    onTouchStart={handleDragStart}
                    onTouchMove={handleDragMove}
                    onTouchEnd={handleDragEnd}
                  />
                  
                  {/* Watermark overlay */}
                  {userEmail && (
                    <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center overflow-hidden">
                      <div className="text-xs sm:text-sm font-mono text-white/5 rotate-[-25deg] select-none whitespace-nowrap uppercase tracking-widest">
                        {userEmail} • Hannah OnlyFans
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 text-center select-none bg-black/50 py-1.5 px-4 rounded-full border border-white/5 backdrop-blur-sm">
                  <p className="text-white text-sm font-bold">{selectedItem.title}</p>
                </div>
              </div>
            ) : (
              <div 
                className="relative w-full max-w-2xl h-fit flex items-center justify-center bg-black rounded-xl overflow-hidden group/player shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <video
                  ref={videoRef}
                  src={selectedItem.url}
                  autoPlay={isPlaying}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => {
                    setIsPlaying(false);
                    setIsEnded(true);
                  }}
                  onClick={togglePlay}
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  className="w-full max-h-[75vh] object-contain rounded-lg"
                />

                {/* Replay Overlay */}
                {isEnded && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 pointer-events-none">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                      }}
                      className="pointer-events-auto bg-black/60 hover:bg-rose-600 text-white rounded-full p-4 flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-110"
                      title="Replay Video"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Transparent protection overlay & click toggle play */}
                <div
                  className="absolute inset-0 z-10 select-none cursor-pointer"
                  onClick={togglePlay}
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                />

                {/* Watermark overlay */}
                {userEmail && (
                  <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center overflow-hidden">
                    <div className="text-xs sm:text-sm font-mono text-white/5 rotate-[-25deg] select-none whitespace-nowrap uppercase tracking-widest">
                      {userEmail} • Hannah OnlyFans
                    </div>
                  </div>
                )}

                {/* Custom Video Control Overlay */}
                <div
                  className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2 transition-opacity duration-300 opacity-0 group-hover/player:opacity-100 z-30"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Progress bar */}
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeekChange}
                      className="w-full accent-rose-500 bg-white/20 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between text-white text-sm mt-1">
                    <div className="flex items-center gap-4">
                      {/* Play/Pause */}
                      <button
                        onClick={togglePlay}
                        className="hover:text-rose-400 font-bold transition-colors cursor-pointer text-sm"
                      >
                        {isPlaying ? "⏸ Pause" : "▶ Play"}
                      </button>

                      {/* Time display */}
                      <span className="text-xs font-mono">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Volume controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleMute}
                          className="hover:text-rose-400 text-sm transition-colors cursor-pointer"
                        >
                          {isMuted ? "🔇" : "🔊"}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.1}
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-16 accent-rose-500 bg-white/20 h-1 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Fullscreen */}
                      <button
                        onClick={toggleFullscreen}
                        className="hover:text-rose-400 text-xs transition-colors cursor-pointer"
                      >
                        {isFullscreen ? "🗖 Small" : "🗖 Full"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
