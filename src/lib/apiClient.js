"use client";

/**
 * API client for COP CMS.
 * Prepends the backend URL and attaches a Clerk Bearer token when `options.auth` is true.
 * Token retrieval is delegated to a module-level getter registered once by ClerkTokenBridge.
 */

let tokenGetter = null;
let resolveTokenGetterReady;
const tokenGetterReady = new Promise((resolve) => {
    resolveTokenGetterReady = resolve;
});

export function setTokenGetter(fn) {
    tokenGetter = fn;
    if (resolveTokenGetterReady) {
        resolveTokenGetterReady();
        resolveTokenGetterReady = null;
    }
}

async function waitForTokenGetter(timeoutMs = 5000) {
    if (tokenGetter) return;
    let timeoutId;
    const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(
            () => reject(new Error("Clerk auth bridge not ready within timeout")),
            timeoutMs
        );
    });
    try {
        await Promise.race([tokenGetterReady, timeout]);
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function callApi(endpoint, options = {}) {
    const backendUrl = process.env.NEXT_PUBLIC_APP_BACKEND_URL || "http://localhost:5000";
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${backendUrl}${cleanEndpoint}`;

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (options.auth) {
        await waitForTokenGetter();
        const token = await tokenGetter();
        if (!token) {
            throw new Error(
                `[apiClient] No Clerk token available for ${cleanEndpoint} — user is likely signed out`
            );
        }
        headers["Authorization"] = `Bearer ${token}`;
    }

    const { auth, body, ...fetchOptions } = options;

    return fetch(url, {
        ...fetchOptions,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
}
