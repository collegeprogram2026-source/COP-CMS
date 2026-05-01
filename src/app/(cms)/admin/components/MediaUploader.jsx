"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, ImageIcon, FileText, Film } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACCEPT = "image/*,video/*,application/pdf";

function detectKind(url) {
  if (!url) return "empty";
  const lower = url.toLowerCase().split("?")[0];
  if (/\.(jpe?g|png|webp|gif|svg|avif|bmp)$/.test(lower)) return "image";
  if (/\.(mp4|webm|mov|mkv|ogg)$/.test(lower)) return "video";
  if (/\.pdf$/.test(lower)) return "pdf";
  return "image";
}

/**
 * Media uploader for the page-content "Media" field type.
 * Uploads image / video / PDF to /api/admin/uploads/media (Cloudinary, resource_type=auto).
 *
 * Props:
 *  - value: string                 current media URL
 *  - onChange: (url, meta) => void called with Cloudinary secure_url + meta
 *  - folder?: string               Cloudinary folder (default: "cop/pages")
 *  - label?: string
 *  - className?: string
 */
export default function MediaUploader({ value, onChange, folder = "cop/pages", label, className = "" }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  const kind = meta?.resourceType
    ? meta.resourceType === "raw"
      ? "pdf"
      : meta.resourceType
    : detectKind(value);

  const handleUpload = async (file) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_APP_BACKEND_URL || "http://localhost:5000";

      let token = "";
      if (typeof window !== "undefined" && window.Clerk?.session) {
        token = await window.Clerk.session.getToken();
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch(`${backendUrl}/api/admin/uploads/media`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Upload failed (${res.status})`);
      }
      const data = await res.json();
      setMeta(data);
      onChange(data.url, data);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const Preview = () => {
    if (!value) {
      return (
        <div className="w-28 h-28 rounded-lg border-2 border-dashed border-border bg-muted/40 flex items-center justify-center text-muted-foreground">
          <ImageIcon className="w-6 h-6" />
        </div>
      );
    }
    if (kind === "video") {
      return (
        <video
          src={value}
          controls
          className="w-40 h-28 rounded-lg border-2 border-border bg-black object-cover"
        />
      );
    }
    if (kind === "pdf") {
      return (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="w-28 h-28 rounded-lg border-2 border-border bg-muted flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          title="Open PDF"
        >
          <FileText className="w-7 h-7" />
          <span className="text-[10px] font-bold uppercase tracking-wider">PDF</span>
        </a>
      );
    }
    return (
      <img
        src={value}
        alt=""
        className="w-28 h-28 rounded-lg border-2 border-border bg-muted object-cover"
      />
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </label>
      )}

      <div className="flex items-start gap-3">
        <div className="relative">
          <Preview />
          {value && (
            <button
              type="button"
              onClick={() => {
                setMeta(null);
                onChange("", null);
              }}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
              title="Remove"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => handleUpload(e.target.files?.[0])}
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-8 px-3 text-xs font-semibold"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="w-3 h-3 mr-1.5" />
                  {value ? "Replace" : "Upload"}
                </>
              )}
            </Button>
            <span className="text-[10px] text-muted-foreground/60 font-medium">
              Image · Video · PDF (max 100&nbsp;MB)
            </span>
          </div>
          <input
            type="text"
            placeholder="Or paste a media URL"
            value={value || ""}
            onChange={(e) => {
              setMeta(null);
              onChange(e.target.value, null);
            }}
            className="w-full border border-border bg-card px-3 py-2 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/40"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          {value && kind === "video" && (
            <p className="text-[10px] text-muted-foreground/60 italic flex items-center gap-1">
              <Film className="w-3 h-3" /> Video file
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
