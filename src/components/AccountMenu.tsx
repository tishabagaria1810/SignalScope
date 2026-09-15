import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LogOut, Settings, User } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Glass } from "./glass";

const user = {
  fullName: "Ada Lovelace",
  email: "ada@signalscope.io",
  initials: "AL",
};

const contentAnimations = {
  initial: { opacity: 0, filter: "blur(8px)" },
  animate: { opacity: 1, filter: "blur(0px)", transition: { delay: 0.15 } },
  exit: { opacity: 0, filter: "blur(8px)" },
};

const SPRING = { type: "spring", bounce: 0.15, duration: 0.4 };

export function AccountMenu() {
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Check mock authentication state
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = localStorage.getItem("mock_auth") === "true";
      setSignedIn(isAuth);
    };
    checkAuth();
    // Re-check when storage changes (useful if modified in another tab/window)
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggleOpen = () => {
    if (signedIn) {
      setOpen(!open);
    }
  };

  const handleSignOutClick = () => {
    setOpen(false);
    setShowLogoutConfirm(true);
  };

  const confirmSignOut = () => {
    localStorage.removeItem("mock_auth");
    setSignedIn(false);
    setShowLogoutConfirm(false);
    window.dispatchEvent(new Event("storage"));
    navigate({ to: "/" });
  };

  return (
    <div className="relative" ref={rootRef}>
      {signedIn ? (
        <button
          onClick={toggleOpen}
          className="glass-surface ml-1 grid size-9 place-items-center rounded-[999px] text-muted-foreground transition-colors hover:text-foreground sm:size-10 overflow-hidden"
        >
          <motion.div
            layoutId="avatar"
            transition={SPRING}
            className="flex h-full w-full items-center justify-center bg-primary/20 text-[13px] font-semibold text-primary"
          >
            {user.initials}
          </motion.div>
        </button>
      ) : (
        <Link
          to="/auth"
          className="glass-surface ml-1 grid size-9 place-items-center rounded-[999px] text-muted-foreground transition-colors hover:text-foreground sm:size-10 overflow-hidden"
        >
          <User className="size-5" />
        </Link>
      )}

      <AnimatePresence>
        {open && signedIn && (
          <motion.div
            layoutId="menu-dropdown"
            transition={SPRING}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-[calc(100%+20px)] z-50 w-56"
          >
            <Glass className="overflow-hidden p-1 shadow-2xl">
              <div className="flex items-center gap-3 p-3">
                <motion.div
                  layoutId="avatar"
                  transition={SPRING}
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[14px] font-semibold text-primary"
                >
                  {user.initials}
                </motion.div>
                <motion.div
                  initial={contentAnimations.initial}
                  animate={contentAnimations.animate}
                  exit={contentAnimations.exit}
                  className="min-w-0"
                >
                  <p className="truncate text-[13px] font-medium text-foreground">{user.fullName}</p>
                  <p className="truncate text-[11px] text-subtle-foreground">{user.email}</p>
                </motion.div>
              </div>

              <div className="my-1 h-px bg-border/50" />

              <motion.div
                initial={contentAnimations.initial}
                animate={contentAnimations.animate}
                exit={contentAnimations.exit}
                className="flex flex-col gap-0.5"
              >
                <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">
                  <Settings className="size-4" />
                  Manage account
                </button>
                <button
                  onClick={handleSignOutClick}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </motion.div>

              <div className="mt-1 pb-1 flex justify-center">
                <p className="text-[10px] text-subtle-foreground opacity-60">Secured by Signal Scope</p>
              </div>
            </Glass>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <Glass className="w-[320px] p-6 text-center shadow-2xl">
              <h3 className="mb-2 text-lg font-semibold text-foreground">Sign Out</h3>
              <p className="mb-6 text-[13px] text-muted-foreground">
                Are you sure you want to sign out of your account?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 rounded-md border border-border bg-transparent py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSignOut}
                  className="flex-1 rounded-md bg-red-500/20 py-2 text-[13px] font-medium text-red-500 transition-colors hover:bg-red-500/30"
                >
                  Sign Out
                </button>
              </div>
            </Glass>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
