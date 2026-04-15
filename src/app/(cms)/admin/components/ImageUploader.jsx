"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Reusable image uploader that uploads to /api/admin/uploads/image (Cloudinary)
 * and returns the secure URL via onChange.
 *
 * Props:
 *  - value: string            current image URL
 *  - onChange: (url, meta) => void  called with Cloudinary secure_url + { publicId, ... }
 *  - folder?: string          Cloudinary folder (default: "cop/admin")
 *  - label?: string
 *  - className?: string
 */
export default function ImageUploader({ value, onChange, folder = "cop/admin", label, className = "" }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

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

      const res = await fetch(`${backendUrl}/api/admin/uploads/image`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Upload failed (${res.status})`);
      }
      const data = await res.json();
      onChange(data.url, data);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </label>
      )}

      <div className="flex items-start gap-3">
        {value ? (
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-border bg-muted">
            <img src={value} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("", null)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
              title="Remove"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border bg-muted/40 flex items-center justify-center text-muted-foreground">
            <ImageIcon className="w-6 h-6" />
          </div>
        )}

        <div className="flex-1 space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files?.[0])}
          />
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
          <input
            type="text"
            placeholder="Or paste an image URL"
            value={value || ""}
            onChange={(e) => onChange(e.target.value, null)}
            className="w-full border border-border bg-card px-3 py-2 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/40"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
