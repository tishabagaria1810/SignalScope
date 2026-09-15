import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Glass } from "@/components/glass";
import { supabase } from "@/lib/supabase";
import { Mail, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

const SPRING: any = { type: "spring", bounce: 0.15, duration: 0.4 };

function Spinner({ size = 16 }: { size?: number }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      style={{
        width: size,
        height: size,
        border: "2px solid currentColor",
        borderBottomColor: "transparent",
        borderRadius: "50%",
      }}
    />
  );
}

type Step = "email" | "password" | "confirm-email";
type Mode = "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  /* ── Step 1: email ───────────────────────────────────────── */
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setStep("password");
  };

  /* ── Step 2: password ────────────────────────────────────── */
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
          setPasswordError(error.message);
          setLoading(false);
          return;
        }

        // User created but email confirmation pending
        if (data.user && !data.session) {
          setLoading(false);
          setStep("confirm-email");
          return;
        }

        // Email confirmation disabled — session returned immediately
        if (data.session) {
          navigate({ to: "/dashboard" });
          return;
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          if (error.message.toLowerCase().includes("email not confirmed")) {
            setPasswordError("Please confirm your email first, then try signing in.");
          } else if (
            error.message.toLowerCase().includes("invalid") ||
            error.message.toLowerCase().includes("credentials")
          ) {
            setPasswordError("Wrong email or password. Need an account? Switch to Sign up below.");
          } else {
            setPasswordError(error.message);
          }
          setLoading(false);
          return;
        }

        if (data.session) {
          navigate({ to: "/dashboard" });
          return;
        }
      }
    } catch (err: any) {
      setPasswordError(err?.message ?? "Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  /* ── Resend confirmation email ───────────────────────────── */
  const handleResendEmail = async () => {
    setLoading(true);
    await supabase.auth.resend({ type: "signup", email });
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 z-[-1] overflow-hidden bg-background">
        <div className="absolute left-1/4 top-1/4 h-[50vh] w-[50vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[40vh] w-[40vw] translate-x-1/2 translate-y-1/2 rounded-full bg-purple-500/10 blur-[100px]" />
        <div className="absolute left-3/4 top-1/2 h-[30vh] w-[30vw] rounded-full bg-cyan-500/10 blur-[80px]" />
      </div>

      <div className="relative w-full max-w-sm">
        <AnimatePresence mode="wait">
          {/* ── Email Step ─────────────────────────────────── */}
          {step === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={SPRING}
            >
              <Glass className="p-6 md:p-8" noSheen>
                <div className="text-center mb-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    Welcome to SignalScope
                  </h3>
                  <p className="mt-1 text-[13px] text-subtle-foreground">
                    Sign in or create an account to continue
                  </p>
                </div>

                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-foreground">Email address</label>
                    <input
                      type="email"
                      required
                      autoFocus
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-md border border-border bg-background/50 px-3 py-2.5 text-[13px] text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    {emailError && <p className="text-[12px] text-red-400">{emailError}</p>}
                  </div>
                  <button
                    type="submit"
                    className="flex h-10 w-full items-center justify-center rounded-md bg-foreground text-[13px] font-medium text-background transition-opacity hover:opacity-90"
                  >
                    Continue
                  </button>
                </form>
              </Glass>
            </motion.div>
          )}

          {/* ── Password Step ──────────────────────────────── */}
          {step === "password" && (
            <motion.div
              key="password"
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={SPRING}
            >
              <Glass className="p-6 md:p-8 shadow-2xl" noSheen>
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    {mode === "signup" ? "Create your account" : "Welcome back"}
                  </h3>
                  <p className="mt-1 text-[13px] text-subtle-foreground truncate">{email}</p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-foreground">Password</label>
                    <input
                      autoFocus
                      type="password"
                      required
                      minLength={6}
                      placeholder={mode === "signup" ? "Create a password (min 6 chars)" : "Enter your password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-md border border-border bg-background/50 px-3 py-2.5 text-[13px] text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <AnimatePresence>
                      {passwordError && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-[12px] text-red-400"
                        >
                          {passwordError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-foreground text-[13px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? <Spinner /> : mode === "signup" ? "Create account" : "Sign in"}
                  </button>

                  {/* Toggle sign in / sign up */}
                  <div className="flex justify-center gap-1.5 pt-1">
                    <span className="text-[12px] text-subtle-foreground">
                      {mode === "signin" ? "No account?" : "Already have one?"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === "signin" ? "signup" : "signin");
                        setPasswordError(null);
                        setPassword("");
                      }}
                      className="text-[12px] font-semibold text-primary hover:underline"
                    >
                      {mode === "signin" ? "Sign up" : "Sign in"}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setStep("email"); setPasswordError(null); setPassword(""); }}
                    className="text-[11px] text-subtle-foreground hover:text-foreground transition-colors mt-1"
                  >
                    ← Use a different email
                  </button>
                </form>
              </Glass>
            </motion.div>
          )}

          {/* ── Email Confirmation Step ────────────────────── */}
          {step === "confirm-email" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
              transition={SPRING}
            >
              <Glass className="p-6 md:p-8" noSheen>
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10"
                  >
                    <CheckCircle2 className="h-8 w-8 text-green-400" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-foreground">Check your inbox</h3>
                  <p className="mt-2 text-[13px] text-subtle-foreground leading-relaxed">
                    We sent a confirmation link to
                  </p>
                  <p className="mt-1 text-[13px] font-medium text-foreground">{email}</p>
                  <p className="mt-3 text-[12px] text-subtle-foreground leading-relaxed">
                    Click the link in the email to verify your account, then come back and sign in.
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={() => { setStep("password"); setMode("signin"); setPassword(""); setPasswordError(null); }}
                    className="flex h-10 w-full items-center justify-center rounded-md bg-foreground text-[13px] font-medium text-background transition-opacity hover:opacity-90"
                  >
                    I've confirmed — Sign in
                  </button>
                  <button
                    onClick={handleResendEmail}
                    disabled={loading}
                    className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-border text-[13px] text-muted-foreground transition-colors hover:bg-white/5 disabled:opacity-50"
                  >
                    {loading ? <Spinner size={14} /> : "Resend email"}
                  </button>
                </div>

                <div className="mt-4 rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2.5">
                  <p className="text-[11px] text-amber-400 leading-relaxed">
                    <strong>Tip:</strong> If you want to skip email confirmation for testing, go to{" "}
                    <strong>Supabase → Authentication → Providers → Email</strong> and disable{" "}
                    <strong>"Confirm email"</strong>.
                  </p>
                </div>
              </Glass>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
