"use client"
import { SignIn } from "@clerk/nextjs"

export default function AuthPage() {
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
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5"
          style={{
            background: "radial-gradient(circle, #ffffff 0%, transparent 70%)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #ffffff 0%, transparent 70%)",
            transform: "translate(-30%, 30%)",
          }}
        />

        {/* Grid texture overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
              <span className="text-slate-900 font-bold text-sm">C</span>
            </div>
            <span className="text-white font-bold text-lg tracking-wide">COP CMS</span>
          </div>
        </div>

        {/* Quote */}
        <div className="relative z-10">
          <p className="text-white/80 text-2xl font-light leading-snug mb-6">
            Your content.<br />
            Your control.
          </p>
          <p className="text-white/40 text-sm">
            Sign in to manage pages, blogs,<br />
            experts, and more from one place.
          </p>
        </div>

        {/* Bottom dots */}
        <div className="relative z-10 flex gap-2">
          <div className="w-2 h-2 rounded-full bg-white/60" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
        </div>
      </div>

      {/* ── Right panel — Clerk SignIn ── */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-sm flex flex-col items-center gap-6">

          {/* Mobile brand */}
          <div className="flex items-center gap-2 lg:hidden self-start">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="text-slate-800 font-bold">COP CMS</span>
          </div>

          {/* Clerk component */}
          <SignIn
            afterSignInUrl="/admin"
            signUpUrl="/admin/login"
            redirectUrl="/admin"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "w-full shadow-sm border border-slate-200 rounded-2xl overflow-hidden",
                cardBox: "w-full",
                headerTitle: "text-slate-800 font-bold text-base",
                headerSubtitle: "text-slate-400 text-xs",
                socialButtonsBlockButton:
                  "border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-lg transition-colors",
                dividerLine: "bg-slate-200",
                dividerText: "text-slate-400 text-xs",
                formFieldLabel: "text-xs font-semibold text-slate-600 uppercase tracking-wide",
                formFieldInput:
                  "border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-slate-400 focus:border-slate-400 hover:border-slate-400 transition-colors",
                formButtonPrimary:
                  "bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors",
                footerActionText: "text-slate-400 text-xs",
                footerActionLink: "text-slate-600 font-semibold hover:text-slate-800 text-xs",
                identityPreviewText: "text-slate-700 text-sm",
                identityPreviewEditButton: "text-slate-500 hover:text-slate-700 text-xs",
                alertText: "text-red-700 text-xs font-medium",
                formFieldErrorText: "text-red-600 text-xs",
              },
              layout: {
                socialButtonsPlacement: "top",
              },
            }}
          />

          <p className="text-xs text-slate-400 text-center">
            Having trouble? Contact your admin.
          </p>

        </div>
      </div>

    </div>
  )
}