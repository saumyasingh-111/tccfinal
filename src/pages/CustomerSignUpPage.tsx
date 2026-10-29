import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { BotanicalSprig } from "../components/BotanicalSprig";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export const CustomerSignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, isAuthenticated, isEmailVerified } = useCustomerAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      if (isEmailVerified) {
        navigate("/profile", { replace: true });
      } else {
        navigate("/verify-email", { replace: true });
      }
    }
  }, [isAuthenticated, isEmailVerified, navigate]);

  // Clean Indian phone number input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9+]/g, "");
    setPhone(raw);
  };

  const validate = (): string | null => {
    if (!name.trim()) return "Please enter your full name.";

    // Phone validation: Indian mobile format (10 digits starting with 6-9, or +91 prefix)
    const digits = phone.replace(/[^0-9]/g, "");
    const cleanDigits = digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
    if (!/^[6-9]\d{9}$/.test(cleanDigits)) {
      return "Please enter a valid 10-digit Indian mobile number (e.g., 9876543210).";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address.";
    }

    // Password validation
    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match. Please re-enter.";
    }

    if (!agreeTerms) {
      return "Please agree to the Terms & Conditions and Privacy Policy to create an account.";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    const digits = phone.replace(/[^0-9]/g, "");
    const cleanPhone = digits.startsWith("91") && digits.length === 12 ? `+91 ${digits.slice(2)}` : `+91 ${digits}`;

    const cleanEmail = email.trim().toLowerCase();
    const res = await signUp(name.trim(), cleanEmail, cleanPhone, password);
    setIsSubmitting(false);

    if (res.success) {
      const sentParam = res.emailSent === false ? "0" : "1";
      const errorQuery = res.emailError ? `&error=${encodeURIComponent(res.emailError)}` : "";
      navigate(`/verify-email?email=${encodeURIComponent(cleanEmail)}&sent=${sentParam}${errorQuery}`, { replace: true });
    } else {
      setError(res.error || "Failed to create account. Please try again.");
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-[#F5EFEB]">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E2D9CC] shadow-sm p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BotanicalSprig className="w-12 h-6 text-[#C99742]" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0F3A23]">
            Join The Classic Crush
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F3A23]">
            Create Customer Account
          </h2>
          <p className="text-xs text-[#6E776F] max-w-xs mx-auto">
            Order online, save your CSJMU campus delivery location, and view live order updates.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-hero-fade">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <span className="font-semibold block">{error}</span>
              {error.toLowerCase().includes("already exists") && (
                <div className="pt-1.5 flex flex-wrap items-center gap-3 text-xs">
                  <Link
                    to={`/login?email=${encodeURIComponent(email.trim().toLowerCase())}`}
                    className="text-[#0F3A23] font-bold underline hover:text-[#162820]"
                  >
                    Log In
                  </Link>
                  <span className="text-gray-400">&bull;</span>
                  <Link
                    to={`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}&sent=0`}
                    className="text-[#0F3A23] font-bold underline hover:text-[#162820]"
                  >
                    Verify Email / Resend
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#162820] mb-1">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF6F0]/60 border border-[#E2D9CC] rounded-xl text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23] focus:bg-white transition-colors"
              />
              <User className="w-4 h-4 text-[#6E776F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#162820] mb-1">
              Mobile Number (India) *
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                placeholder="10-digit mobile number (e.g. 9876543210)"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={13}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF6F0]/60 border border-[#E2D9CC] rounded-xl text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23] focus:bg-white transition-colors"
              />
              <Phone className="w-4 h-4 text-[#6E776F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[10px] text-[#6E776F] mt-1">
              Used for delivery coordination on CSJMU campus.
            </p>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#162820] mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="e.g. rahul@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF6F0]/60 border border-[#E2D9CC] rounded-xl text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23] focus:bg-white transition-colors"
              />
              <Mail className="w-4 h-4 text-[#6E776F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#162820] mb-1">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="At least 6 characters"
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

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#162820] mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-[#FAF6F0]/60 border border-[#E2D9CC] rounded-xl text-xs text-[#162820] focus:outline-hidden focus:border-[#0F3A23] focus:bg-white transition-colors"
              />
              <Lock className="w-4 h-4 text-[#6E776F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E776F] hover:text-[#0F3A23] p-1 cursor-pointer"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-[#E2D9CC] text-[#0F3A23] focus:ring-[#0F3A23] cursor-pointer"
              />
              <span className="text-[11px] text-[#2F3E37] leading-relaxed">
                I agree to The Classic Crush’s Terms of Service and Privacy Policy, and understand that delivery is currently restricted to the CSJMU campus.
              </span>
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
                <span>Creating Account...</span>
              </span>
            ) : (
              <>
                <span>Create Account</span>
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

        {/* Link to Login */}
        <div className="text-center text-xs text-[#6E776F] pt-1">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#0F3A23] hover:underline"
          >
            Sign In here →
          </Link>
        </div>
      </div>
    </div>
  );
};
