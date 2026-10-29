import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { BotanicalSprig } from "../components/BotanicalSprig";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  ArrowRight,
  LogOut,
  Clock,
  Sparkles,
} from "lucide-react";

export const CustomerVerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    user,
    isAuthenticated,
    isEmailVerified,
    verificationCooldown,
    sendVerificationEmail,
    checkEmailVerified,
    applyVerificationCode,
    logout,
  } = useCustomerAuth();

  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Check sent query parameter: "1" = successfully dispatched, "0" = delivery failed, null = regular visit
  const sentParam = searchParams.get("sent");
  const errorParam = searchParams.get("error");

  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(() => {
    if (sentParam === "0") {
      return {
        type: "error",
        text: errorParam
          ? `Your account was created, but we couldn't send the verification email: ${errorParam}`
          : "Your account was created, but we couldn't send the verification email. Please try again.",
      };
    }
    if (sentParam === "1") {
      return {
        type: "success",
        text: "Your account is ready! We've sent a verification link to your email. Please check your inbox.",
      };
    }
    return null;
  });

  // Check if link was opened directly with Firebase action parameters
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    if (mode === "verifyEmail" && oobCode) {
      const handleActionCode = async () => {
        setIsChecking(true);
        setStatusMessage({ type: "info", text: "Verifying your email address..." });
        const res = await applyVerificationCode(oobCode);
        setIsChecking(false);
        if (res.success) {
          setStatusMessage({
            type: "success",
            text: "Congratulations! Your email address has been verified successfully.",
          });
          setTimeout(() => {
            navigate("/profile", { replace: true });
          }, 2500);
        } else {
          setStatusMessage({
            type: "error",
            text: res.error || "Verification link is invalid or has expired.",
          });
        }
      };
      handleActionCode();
    }
  }, [mode, oobCode, applyVerificationCode, navigate]);

  // If already verified and not processing an action code, redirect to profile
  useEffect(() => {
    if (isAuthenticated && isEmailVerified && !oobCode) {
      navigate("/profile", { replace: true });
    }
  }, [isAuthenticated, isEmailVerified, oobCode, navigate]);

  // Displayed email address
  const userEmail = user?.email || searchParams.get("email") || "your registered email";

  // Check status handler
  const handleCheckStatus = async () => {
    setIsChecking(true);
    setStatusMessage(null);
    const verified = await checkEmailVerified();
    setIsChecking(false);

    if (verified) {
      setStatusMessage({
        type: "success",
        text: "Your email is verified! Redirecting to your profile...",
      });
      setTimeout(() => {
        navigate("/profile", { replace: true });
      }, 1500);
    } else {
      setStatusMessage({
        type: "info",
        text: "Not verified yet. Please click the verification link sent to your inbox and try again.",
      });
    }
  };

  // Resend verification email handler
  const handleResend = async () => {
    if (verificationCooldown > 0) return;
    setIsResending(true);
    setStatusMessage(null);

    const res = await sendVerificationEmail();
    setIsResending(false);

    if (res.success) {
      setStatusMessage({
        type: "success",
        text: "Your account is ready! We've sent a verification link to your email. Please check your inbox.",
      });
    } else {
      setStatusMessage({
        type: "error",
        text: res.error || "Your account was created, but we couldn't send the verification email. Please try again.",
      });
    }
  };

  const isFailedInitialSend = sentParam === "0" && statusMessage?.type === "error";

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-[#F5EFEB]">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E2D9CC] shadow-sm p-6 sm:p-8 space-y-6 text-center">
        {/* Sprig & Badge */}
        <div className="space-y-2">
          <div className="flex justify-center">
            <BotanicalSprig className="w-12 h-6 text-[#C99742]" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0F3A23]">
            Account Verification
          </span>
        </div>

        {/* Dynamic Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[#E6F0EB] text-[#0F3A23] flex items-center justify-center border-2 border-[#C99742]/30 shadow-inner">
              {isEmailVerified ? (
                <CheckCircle2 className="w-10 h-10 text-[#0F3A23]" />
              ) : (
                <Mail className="w-10 h-10 text-[#0F3A23]" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0F3A23] text-white flex items-center justify-center border-2 border-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C99742]" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F3A23]">
            {isEmailVerified ? "Email Verified!" : "Verify Your Email"}
          </h2>
          <p className="text-xs text-[#2F3E37] max-w-xs mx-auto leading-relaxed">
            {isFailedInitialSend
              ? "Your account was created, but we couldn't send the verification email. Please try sending it again below."
              : "Your account is ready! Please check your email to verify your address."}
          </p>
        </div>

        {/* Email Highlight Box */}
        <div className="p-3.5 bg-[#FAF6F0] rounded-2xl border border-[#E2D9CC] text-xs text-[#162820] flex items-center justify-center gap-2 font-medium break-all">
          <Mail className="w-4 h-4 text-[#C99742] shrink-0" />
          <span className="font-semibold">{userEmail}</span>
        </div>

        {/* Status Banner */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 text-left animate-hero-fade ${
              statusMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : statusMessage.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : statusMessage.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <span className="font-medium leading-relaxed">{statusMessage.text}</span>
          </div>
        )}

        {/* Unauthenticated Helper Box */}
        {!isAuthenticated && (
          <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2 text-left">
            <span className="leading-snug">Need to sign in before requesting verification?</span>
            <Link
              to={`/login?email=${encodeURIComponent(userEmail)}`}
              className="font-bold underline text-[#0F3A23] shrink-0"
            >
              Sign In &rarr;
            </Link>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-2">
          {/* Check Verification Status */}
          <button
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="w-full py-3 rounded-full bg-[#0F3A23] hover:bg-[#154D30] disabled:opacity-50 text-white text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Checking Status...</span>
              </>
            ) : (
              <>
                <span>I've Verified My Email</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C99742]" />
              </>
            )}
          </button>

          {/* Resend / Retry Verification Email Button */}
          <button
            onClick={handleResend}
            disabled={isResending || verificationCooldown > 0}
            className="w-full py-2.5 rounded-full border border-[#0F3A23]/30 hover:border-[#0F3A23] hover:bg-[#FAF6F0] disabled:opacity-50 text-[#0F3A23] text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Sending Email...</span>
              </>
            ) : verificationCooldown > 0 ? (
              <>
                <Clock className="w-3.5 h-3.5 text-[#C99742]" />
                <span>Resend in {verificationCooldown}s</span>
              </>
            ) : isFailedInitialSend ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-[#C99742]" />
                <span>Retry Sending Verification Email</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-[#C99742]" />
                <span>Resend Verification Email</span>
              </>
            )}
          </button>
        </div>

        {/* Informational Guidance Box */}
        <div className="p-4 bg-[#F5EFEB]/70 rounded-2xl border border-[#E2D9CC]/60 text-left space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0F3A23] block">
            Didn't receive the email?
          </span>
          <ul className="text-[11px] text-[#6E776F] space-y-1 list-disc list-inside">
            <li>Check your spam or junk folder.</li>
            <li>Verification links are valid for 24 hours.</li>
            <li>Ensure you typed your email address accurately.</li>
          </ul>
        </div>

        {/* Switch Account or Logout */}
        <div className="pt-2 flex items-center justify-center gap-4 text-xs text-[#6E776F]">
          {isAuthenticated ? (
            <button
              onClick={async () => {
                await logout();
                navigate("/login", { replace: true });
              }}
              className="inline-flex items-center gap-1.5 text-[#755546] hover:text-[#0F3A23] font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out / Change email</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-[#0F3A23] hover:underline font-semibold"
            >
              <span>Back to Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
