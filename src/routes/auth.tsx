import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Glass } from "@/components/glass";
import { supabase } from "@/lib/supabase";
import { Mail, CheckCircle2, User, Lock } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

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

/* ---------------------------------------------------------
   Validation
--------------------------------------------------------- */
const NAME_REGEX = /^[A-Za-z][A-Za-z\s'-]{1,49}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateName(name: string): string | null {
  if (!name.trim()) return "Name is required.";
  if (!NAME_REGEX.test(name.trim())) {
    return "Name can only contain letters, spaces, hyphens and apostrophes.";
  }
  return null;
}

function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required.";
  if (!EMAIL_REGEX.test(email.trim())) return "Enter a valid email address.";
  return null;
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Include at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "Include at least one lowercase letter.";
  if (!/[0-9]/.test(password)) return "Include at least one number.";
  return null;
}

/* ---------------------------------------------------------
   Steps:
   details      -> collect email (+name+password if signup)
   otp          -> 6-digit code sent to email
   confirm-info -> post-signup "check your inbox" style success card
--------------------------------------------------------- */
type Step = "details" | "otp";
type Mode = "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("details");
  const [mode, setMode] = useState<Mode>("signin");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string | null;
    email?: string | null;
    password?: string | null;
    otp?: string | null;
    form?: string | null;
  }>({});

  const cooldownRef = useRef<number>(0);

  /* ── Step 1: details -> send OTP ─────────────────────────── */
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const emailErr = validateEmail(email);
    const nameErr = mode === "signup" ? validateName(name) : null;
    const passErr = mode === "signup" ? validatePassword(password) : null;

    if (emailErr || nameErr || passErr) {
      setErrors({ email: emailErr, name: nameErr, password: passErr });
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        // Create the account. Supabase will also fire its own signup email,
        // which we're using as the OTP delivery (see dashboard note above).
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name.trim() },
          },
        });

        if (error) {
          setErrors({ form: error.message });
          setLoading(false);
          return;
        }

        // Already has a session (email confirmation disabled in dashboard) — skip OTP.
        if (data.session) {
          navigate({ to: "/dashboard" });
          return;
        }

        setStep("otp");
      } else {
        // Passwordless login: request a fresh OTP for an existing user only.
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: { shouldCreateUser: false },
        });

        if (error) {
          setErrors({
            form:
              error.message.toLowerCase().includes("user not found") ||
                error.message.toLowerCase().includes("signups not allowed")
                ? "No account with that email. Switch to Sign up below."
                : error.message,
          });
          setLoading(false);
          return;
        }

        setStep("otp");
      }
    } catch (err: any) {
      setErrors({ form: err?.message ?? "Something went wrong. Please try again." });
    }

    setLoading(false);
  };

  /* ── Step 2: verify OTP ──────────────────────────────────── */
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (otp.length !== 6) {
      setErrors({ otp: "Enter the 6-digit code." });
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp,
      type: mode === "signup" ? "signup" : "email",
    });

    if (error) {
      setErrors({ otp: "That code didn't work — check it and try again." });
      setLoading(false);
      return;
    }

    if (data.session) {
      // data.session.access_token is the JWT — Supabase stores/refreshes it
      // automatically via the browser client, and RLS on the DB reads it too.
      navigate({ to: "/dashboard" });
      return;
    }

    setLoading(false);
  };

  /* ── Resend OTP ──────────────────────────────────────────── */
  const handleResend = async () => {
    const now = Date.now();
    if (now < cooldownRef.current) return;
    cooldownRef.current = now + 30_000; // 30s cooldown

    setResending(true);
    if (mode === "signup") {
      await supabase.auth.resend({ type: "signup", email: email.trim() });
    } else {
      await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: false },
      });
    }
    setResending(false);
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
          {/* ── Details Step ───────────────────────────────── */}
          {step === "details" && (
            <motion.div
              key="details"
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
                    {mode === "signup" ? "Create your account" : "Welcome back"}
                  </h3>
                  <p className="mt-1 text-[13px] text-subtle-foreground">
                    {mode === "signup"
                      ? "We'll email you a code to verify it's really you"
                      : "We'll email you a one-time code to sign in"}
                  </p>
                </div>

                <form onSubmit={handleDetailsSubmit} className="flex flex-col gap-4">
                  {mode === "signup" && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-medium text-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" /> Full name
                      </label>
                      <input
                        type="text"
                        required
                        autoFocus
                        placeholder="Jordan Ellis"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2.5 text-[13px] text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                      {errors.name && <p className="text-[12px] text-red-400">{errors.name}</p>}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-foreground">Email address</label>
                    <input
                      type="email"
                      required
                      autoFocus={mode === "signin"}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-md border border-border bg-background/50 px-3 py-2.5 text-[13px] text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    {errors.email && <p className="text-[12px] text-red-400">{errors.email}</p>}
                  </div>

                  {mode === "signup" && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-medium text-foreground flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5" /> Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-md border border-border bg-background/50 px-3 py-2.5 text-[13px] text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                      {errors.password && (
                        <p className="text-[12px] text-red-400">{errors.password}</p>
                      )}
                      <p className="text-[11px] text-subtle-foreground">
                        Needs an uppercase letter, a lowercase letter, and a number.
                      </p>
                    </div>
                  )}

                  {errors.form && <p className="text-[12px] text-red-400">{errors.form}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-foreground text-[13px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? <Spinner /> : mode === "signup" ? "Send verification code" : "Send code"}
                  </button>

                  <div className="flex justify-center gap-1.5 pt-1">
                    <span className="text-[12px] text-subtle-foreground">
                      {mode === "signin" ? "No account?" : "Already have one?"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === "signin" ? "signup" : "signin");
                        setErrors({});
                        setPassword("");
                      }}
                      className="text-[12px] font-semibold text-primary hover:underline"
                    >
                      {mode === "signin" ? "Sign up" : "Sign in"}
                    </button>
                  </div>
                </form>
              </Glass>
            </motion.div>
          )}

          {/* ── OTP Step ───────────────────────────────────── */}
          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
              transition={SPRING}
            >
              <Glass className="p-6 md:p-8" noSheen>
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10"
                  >
                    <Mail className="h-6 w-6 text-primary" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-foreground">Enter your code</h3>
                  <p className="mt-1 text-[13px] text-subtle-foreground">
                    We sent a 6-digit code to
                  </p>
                  <p className="text-[13px] font-medium text-foreground">{email}</p>
                </div>

                <form onSubmit={handleOtpSubmit} className="flex flex-col items-center gap-4">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>

                  {errors.otp && <p className="text-[12px] text-red-400">{errors.otp}</p>}

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-foreground text-[13px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? <Spinner /> : (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Verify & continue
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between w-full pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("details");
                        setOtp("");
                        setErrors({});
                      }}
                      className="text-[11px] text-subtle-foreground hover:text-foreground transition-colors"
                    >
                      ← Use a different email
                    </button>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending}
                      className="text-[11px] font-medium text-primary hover:underline disabled:opacity-50"
                    >
                      {resending ? "Sending…" : "Resend code"}
                    </button>
                  </div>
                </form>
              </Glass>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
