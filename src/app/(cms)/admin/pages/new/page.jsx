"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/pages");
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-[3px] border-border border-t-primary rounded-full animate-spin" />
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
        Opening Pages...
      </p>
    </div>
  );
}



