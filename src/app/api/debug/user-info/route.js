import { auth } from "@clerk/nextjs/server"

export async function GET(req) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Call the backend API, forwarding cookies so Clerk middleware can validate
    const backendUrl = process.env.NEXT_PUBLIC_APP_BACKEND_URL || "http://localhost:5000"
    const res = await fetch(`${backendUrl}/api/admin/users/self`, {
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
      credentials: "include",
    })

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch user info from backend" }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      })
    }

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("Error fetching user info:", err)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
