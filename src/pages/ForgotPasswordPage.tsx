import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { BotanicalSprig } from "../components/BotanicalSprig";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useCustomerAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    const res = await resetPassword(email.trim());
    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
    } else {
      setError(res.error || "Failed to send password reset email. Please try again.");
    }
  };

  return (
    <div className="min-h-[75vh] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-[#F5EFEB]">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E2D9CC] shadow-sm p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BotanicalSprig className="w-12 h-6 text-[#C99742]" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0F3A23]">
            Account Recovery
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F3A23]">
            Reset Your Password
          </h2>
          <p className="text-xs text-[#6E776F] max-w-xs mx-auto">
            Enter your registered email address and we will send you a secure link to reset your password.
          </p>
        </div>

        {isSuccess ? (
          <div className="p-6 rounded-2xl bg-[#E6F0EB] border border-[#0F3A23]/20 text-center space-y-4 animate-hero-fade">
            <div className="w-12 h-12 rounded-full bg-[#0F3A23] text-white flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-[#C99742]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#0F3A23]">
                Check Your Email
              </h3>
              <p className="text-xs text-[#2F3E37] mt-1 leading-relaxed">
                If an account is registered with <strong className="font-semibold">{email}</strong>, we have sent instructions and a secure link to reset your password. Please check your inbox and spam folder.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0F3A23] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#154D30] transition-colors"
            >
              <span>Back to Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-hero-fade">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#162820] mb-1">
                Your Email Address *
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-full bg-[#0F3A23] hover:bg-[#154D30] disabled:opacity-50 text-white text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending Link...</span>
                </span>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F3A23] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
