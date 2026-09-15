import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Glass } from "@/components/glass";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

const SPRING: any = { type: "spring", bounce: 0.15, duration: 0.4 };

const SIGN_IN_VARIANTS = {
  default: { opacity: 1, scale: 1, y: 0, x: "-50%", filter: "blur(0px)", pointerEvents: "auto" as const },
  verifying: { opacity: 0, scale: 0.95, y: -10, x: "-50%", filter: "blur(4px)", pointerEvents: "none" as const },
};

const VERIFY_VARIANTS = {
  default: { opacity: 0, y: 50, x: "-50%", filter: "blur(8px)" },
  verifying: { opacity: 1, y: 0, x: "-50%", filter: "blur(0px)" },
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

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

function ConditionalField({ open, label, error, ...props }: any) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: "auto", marginTop: 12 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          style={{ overflow: "hidden" }}
          className="flex flex-col gap-2"
        >
          <label className="text-[13px] font-medium text-foreground">{label}</label>
          <input
            {...props}
            className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-[13px] text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await wait(650);
    setLoading(false);
    if (!showPassword) {
      setShowPassword(true);
    } else {
      setIsVerifying(true);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await wait(650);
    setLoading(false);
    
    // Set mock authentication state
    localStorage.setItem("mock_auth", "true");
    
    // Redirect to dashboard
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      {/* Mesh gradient background for auth page */}
      <div className="absolute inset-0 z-[-1] overflow-hidden bg-background">
        <div className="absolute left-1/4 top-1/4 h-[50vh] w-[50vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[40vh] w-[40vw] translate-x-1/2 translate-y-1/2 rounded-full bg-purple-500/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm h-[400px]">
        <motion.div
          variants={SIGN_IN_VARIANTS}
          initial="default"
          animate={isVerifying ? "verifying" : "default"}
          transition={SPRING}
          className="absolute left-1/2 top-10 w-full"
        >
          <Glass className="p-6 md:p-8" noSheen>
            <div className="text-center">
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                {showPassword ? "Create your account" : "Welcome to Signal Scope"}
              </h3>
              <p className="mt-1 text-[13px] text-subtle-foreground">Enter your details to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-foreground">Email address</label>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-[13px] text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <ConditionalField
                label="Password"
                type="password"
                required
                placeholder="Create a password"
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                open={showPassword}
              />
              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex h-9 w-full items-center justify-center rounded-md bg-foreground text-[13px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? <Spinner /> : "Continue"}
              </button>
            </form>
          </Glass>
        </motion.div>

        <AnimatePresence>
          {isVerifying && (
            <motion.div
              variants={VERIFY_VARIANTS}
              initial="default"
              animate="verifying"
              exit="default"
              transition={SPRING}
              className="absolute left-1/2 top-10 w-full z-10"
            >
              <Glass className="p-6 md:p-8 shadow-2xl" noSheen>
                <div className="text-center">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">Verify your account</h3>
                  <p className="mt-1 text-[13px] text-subtle-foreground">Enter the code sent to your email</p>
                </div>
                <form onSubmit={handleVerify} className="mt-6">
                  <div className="flex justify-center gap-2">
                    <input
                      autoFocus
                      className="w-[120px] rounded-md border border-border bg-background/50 px-3 py-2 text-center text-lg font-mono tracking-[0.5em] text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                      maxLength={6}
                      placeholder="••••••"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 flex h-9 w-full items-center justify-center rounded-md bg-foreground text-[13px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? <Spinner /> : "Verify"}
                  </button>
                </form>
              </Glass>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
