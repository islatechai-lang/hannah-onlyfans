"use client";

import { useCallback, useState, useRef } from "react";
import { useUploadThing } from "@/lib/uploadthing";

interface Props {
  endpoint: "contentImage" | "contentVideo" | "paymentScreenshot";
  onUploadComplete: (url: string) => void;
  onUploadError?: (err: Error) => void;
  accept?: string;
  label?: string;
}

export default function FileUploader({
  endpoint,
  onUploadComplete,
  onUploadError,
  accept,
  label,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.ufsUrl || res?.[0]?.url || (res?.[0]?.serverData as any)?.url;
      if (url) {
        onUploadComplete(url);
      }
      setProgress(0);
      setFileName("");
    },
    onUploadError: (err) => {
      setProgress(0);
      setFileName("");
      onUploadError?.(err);
    },
    onUploadProgress: (p) => {
      setProgress(p);
    },
  });

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;
      setFileName(fileArray[0].name);
      startUpload(fileArray);
    },
    [startUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const defaultAccept =
    endpoint === "contentVideo"
      ? "video/*"
      : endpoint === "contentImage"
        ? "image/*"
        : "image/*";

  return (
    <div
      onClick={() => !isUploading && inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className="relative overflow-hidden transition-all duration-200"
      style={{
        border: isDragging
          ? "2px solid rgba(225,29,72,0.7)"
          : "2px dashed rgba(225,29,72,0.2)",
        background: isDragging
          ? "rgba(225,29,72,0.08)"
          : "rgba(225,29,72,0.02)",
        borderRadius: 16,
        padding: "32px 20px",
        cursor: isUploading ? "default" : "pointer",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept || defaultAccept}
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {isUploading ? (
        <div className="text-center">
          <div className="text-3xl mb-3 animate-pulse">⚡</div>
          <p className="text-sm font-semibold mb-1">
            Uploading{fileName ? ` ${fileName}` : ""}...
          </p>
          <div
            className="w-full h-2 rounded-full mt-3 overflow-hidden"
            style={{ background: "rgba(225,29,72,0.15)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #e11d48, #f43f5e)",
              }}
            />
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
            {progress}%
          </p>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-3xl mb-3">
            {isDragging ? "📥" : endpoint === "contentVideo" ? "🎬" : "📸"}
          </div>
          <p className="text-sm font-semibold mb-1">
            {isDragging
              ? "Drop it here!"
              : label || "Drag & drop or click to upload"}
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            {endpoint === "contentVideo"
              ? "MP4, MOV, WEBM up to 512MB"
              : endpoint === "contentImage"
                ? "JPG, PNG, WEBP up to 16MB"
                : "JPG, PNG up to 8MB"}
          </p>
        </div>
      )}
    </div>
  );
}
