'use client'

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { callApi } from "@/lib/apiClient"

function SetPasswordInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const qpEmail = searchParams?.get?.("email") || ""
    const qpToken = searchParams?.get?.("token") || ""
    const timeoutId = setTimeout(() => {
      setEmail(qpEmail)
      setToken(qpToken)
    }, 0)
    return () => clearTimeout(timeoutId)
  }, [searchParams])

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!password || !confirm) return setError("Please fill in all fields")
    if (password !== confirm) return setError("Passwords do not match")
    if (password.length < 8) return setError("Password must be at least 8 characters")

    setLoading(true)
    try {
      const res = await callApi("/api/auth/set-password", {
        method: "POST",
        body: { email, token, password },
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || "Failed to set password")
        setLoading(false)
        return
      }
      setSuccess(true)
      setTimeout(() => router.replace("/admin/login"), 2000)
    } catch {
      setError("Network error. Please try again.")
      setLoading(false)
    }
  }

  const inp =
    "w-full border-2 border-border bg-card px-3 py-2.5 rounded-lg text-sm text-foreground " +
    "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-border " +
    "placeholder:text-muted-foreground transition-colors hover:border-border"

  return (
    <div className="fixed inset-0 z-50 flex">

      {/* ── Left panel — gradient banner ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 40%, #2d2d2d 70%, #f5f5f5 100%)",
        }}
      >
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />

        {/* Grid texture overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-card flex items-center justify-center">
              <span className="text-foreground font-bold text-sm">C</span>
            </div>
            <span className="text-white font-bold text-lg tracking-wide">COP CMS</span>
          </div>
        </div>

        {/* Quote */}
        <div className="relative z-10">
          <p className="text-white/80 text-2xl font-light leading-snug mb-6">
            One account.<br />
            Full control.
          </p>
          <p className="text-white/40 text-sm">
            Set up your credentials to access<br />the admin dashboard.
          </p>
        </div>

        {/* Bottom dots */}
        <div className="relative z-10 flex gap-2">
          <div className="w-2 h-2 rounded-full bg-card/60" />
          <div className="w-2 h-2 rounded-full bg-card/20" />
          <div className="w-2 h-2 rounded-full bg-card/20" />
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center bg-muted px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="text-foreground font-bold">COP CMS</span>
          </div>

          {/* Card */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">

            {/* Card header */}
            <div className="bg-primary px-6 py-5">
              <h2 className="text-white font-semibold text-base tracking-wide">🔐 Set Password</h2>
              <p className="text-muted-foreground text-xs mt-1">Create a password to finalize your account</p>
            </div>

            <div className="p-6">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-emerald-500 text-2xl">✓</span>
                  </div>
                  <p className="text-foreground font-semibold">Password set successfully!</p>
                  <p className="text-xs text-muted-foreground mt-2">Redirecting to login...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inp + " bg-muted text-muted-foreground"}
                      required
                      readOnly
                    />
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className={inp}
                      required
                    />
                  </div>

                  {/* Confirm */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Re-enter your password"
                      className={inp}
                      required
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="p-3 bg-rose-500/10 border-2 border-rose-500/20 rounded-lg">
                      <p className="text-xs text-rose-500 font-medium">⚠ {error}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-muted disabled:opacity-50 transition-colors"
                    >
                      {loading ? "Setting password..." : "Set Password →"}
                    </button>
                  </div>

                </form>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Having trouble? Contact your admin.
          </p>
        </div>
      </div>

    </div>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-muted flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    }>
      <SetPasswordInner />
    </Suspense>
  )
}
