import { useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";

// Guards routes that require a logged-in user. For a public app, guests can
// browse freely, but management pages (Admin, Owner Dashboard, Billing) and
// account-only flows still need an authenticated session.
export default function RequireAuth({ children }) {
  const { isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      navigateToLogin();
    }
  }, [isLoadingAuth, isAuthenticated, navigateToLogin]);

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-background">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Redirecting you to sign in…</p>
      </div>
    );
  }

  return children;
}