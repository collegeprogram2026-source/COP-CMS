"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { setTokenGetter } from "@/lib/apiClient";

export function ClerkTokenBridge() {
    const { getToken, isLoaded } = useAuth();

    useEffect(() => {
        console.log("[ClerkTokenBridge] isLoaded =", isLoaded);
        if (isLoaded) {
            setTokenGetter(getToken);
            console.log("[ClerkTokenBridge] tokenGetter registered");
        }
    }, [isLoaded, getToken]);

    return null;
}
