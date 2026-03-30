"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function NewPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/pages");
  }, [router]);

  return (
    <div className="min-h-screen bg-muted/20 dark:bg-zinc-950 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
      <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest animate-pulse">
        Opening Pages...
      </p>
    </div>
  );
}