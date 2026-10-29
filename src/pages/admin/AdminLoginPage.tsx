import React, { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { VegBadge } from "../../components/VegBadge";
import { BrandLogo } from "../../components/BrandLogo";
import { Lock, Mail, ArrowLeft, AlertCircle } from "lucide-react";

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/admin/dashboard";

  // If already authenticated, immediately redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await login(email, password, rememberMe);
      setIsSubmitting(false);

      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.error || "Authentication failed.");
      }
    } catch {
      setIsSubmitting(false);
      setError("An unexpected error occurred during authentication.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EFEB] flex flex-col justify-center items-center p-4 antialiased selection:bg-[#E8DFD1] selection:text-[#0F3A23]">
      {/* Back to customer website link */}
      <div className="mb-6 w-full max-w-sm">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#0F3A23] hover:underline transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to website</span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl border border-[#E2D9CC] shadow-md p-7 sm:p-8">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <BrandLogo size="md" className="mx-auto mb-3" />
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="font-serif text-2xl font-bold tracking-[0.16em] uppercase text-[#0F3A23]">
              THE CLASSIC CRUSH
            </span>
            <VegBadge size="sm" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#C99742]">
            STAFF &amp; MANAGEMENT PORTAL
          </span>
          <div className="w-8 h-0.5 bg-[#C99742] mx-auto mt-2.5 mb-2" />
          <p className="text-xs text-[#6E776F] font-light">
            Sign in with your authorized staff or administrator credentials
          </p>
        </div>

        {/* Error message if any */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F3A23] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@theclassiccrush.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF6F0] border border-[#E2D9CC] rounded-xl text-sm text-[#162820] placeholder-[#6E776F] focus:outline-none focus:ring-1 focus:ring-[#0F3A23] focus:border-[#0F3A23] transition-all"
              />
              <Mail className="w-4 h-4 text-[#6E776F] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F3A23] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF6F0] border border-[#E2D9CC] rounded-xl text-sm text-[#162820] placeholder-[#6E776F] focus:outline-none focus:ring-1 focus:ring-[#0F3A23] focus:border-[#0F3A23] transition-all"
              />
              <Lock className="w-4 h-4 text-[#6E776F] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="flex items-center gap-2 text-[#6E776F] cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#E2D9CC] text-[#0F3A23] focus:ring-[#0F3A23]"
              />
              <span>Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3.5 bg-[#0F3A23] hover:bg-[#154D30] text-white text-xs font-semibold uppercase tracking-[0.2em] rounded-full transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
