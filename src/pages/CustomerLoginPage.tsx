import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { BotanicalSprig } from "../components/BotanicalSprig";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export const CustomerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isEmailVerified } = useCustomerAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Return to intended page (e.g. /order or /profile) after login
  const returnUrl = (location.state as any)?.from?.pathname || "/profile";

  React.useEffect(() => {
    if (isAuthenticated) {
      if (!isEmailVerified) {
        navigate("/verify-email", { replace: true });
      } else {
        navigate(returnUrl, { replace: true });
      }
    }
  }, [isAuthenticated, isEmailVerified, navigate, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    const cleanEmail = email.trim().toLowerCase();
    const res = await login(cleanEmail, password, rememberMe);
    setIsSubmitting(false);

    if (res.success) {
      if (!res.emailVerified) {
        navigate(`/verify-email?email=${encodeURIComponent(cleanEmail)}`, { replace: true });
      } else {
        navigate(returnUrl, { replace: true });
      }
    } else {
      setError(res.error || "Failed to log in. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-[#F5EFEB]">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E2D9CC] shadow-sm p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BotanicalSprig className="w-12 h-6 text-[#C99742]" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0F3A23]">
            Welcome Back
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F3A23]">
            Customer Sign In
          </h2>
          <p className="text-xs text-[#6E776F] max-w-xs mx-auto">
            Log in to view your current orders, past orders, and saved campus delivery details.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-hero-fade">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">{error}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#162820] mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="e.g. student@csjmu.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF6F0]/60 border border-[#E2D9CC] rounded-xl text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23] focus:bg-white transition-colors"
              />
              <Mail className="w-4 h-4 text-[#6E776F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#162820]">
                Password *
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-[#0F3A23] hover:underline font-medium"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-[#FAF6F0]/60 border border-[#E2D9CC] rounded-xl text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23] focus:bg-white transition-colors"
              />
              <Lock className="w-4 h-4 text-[#6E776F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E776F] hover:text-[#0F3A23] p-1 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#E2D9CC] text-[#0F3A23] focus:ring-[#0F3A23] cursor-pointer"
              />
              <span className="text-xs text-[#2F3E37]">Remember me on this device</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-full bg-[#0F3A23] hover:bg-[#154D30] disabled:opacity-50 text-white text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing In...</span>
              </span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Security badge */}
        <div className="pt-2 border-t border-[#FAF6F0] flex items-center justify-center gap-1.5 text-[11px] text-[#6E776F]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0F3A23]" />
          <span>Secured by Firebase Authentication</span>
        </div>

        {/* Link to Register */}
        <div className="text-center text-xs text-[#6E776F] pt-1">
          Don&rsquo;t have an account yet?{" "}
          <Link
            to="/signup"
            className="font-semibold text-[#0F3A23] hover:underline"
          >
            Create an Account →
          </Link>
        </div>

        {/* Subtle link to Admin */}
        <div className="text-center pt-2">
          <Link
            to="/admin/login"
            className="text-[10px] text-[#A39E93] hover:text-[#0F3A23] uppercase tracking-wider"
          >
            Café Staff / Admin Portal →
          </Link>
        </div>
      </div>
    </div>
  );
};
