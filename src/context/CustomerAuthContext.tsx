import React, { createContext, useContext, useState, useEffect } from "react";
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  applyActionCode,
  updateProfile as updateFirebaseProfile,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { type CampusDeliveryLocation } from "../data/campusBoundary";

export interface CustomerProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: "customer";
  defaultDeliveryLocation?: CampusDeliveryLocation | null;
  adminNotificationSent?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface CustomerAuthContextType {
  user: User | null;
  customerProfile: CustomerProfile | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  verificationCooldown: number;
  loading: boolean;
  signUp: (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; emailVerified?: boolean; emailSent?: boolean; emailError?: string }>;
  login: (
    email: string,
    password: string,
    remember?: boolean
  ) => Promise<{ success: boolean; error?: string; emailVerified?: boolean }>;
  logout: () => Promise<void>;
  sendVerificationEmail: (userInstance?: User | null) => Promise<{ success: boolean; error?: string }>;
  checkEmailVerified: () => Promise<boolean>;
  applyVerificationCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateCustomerProfile: (
    updates: Partial<Pick<CustomerProfile, "name" | "phone" | "defaultDeliveryLocation">>
  ) => Promise<{ success: boolean; error?: string }>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [verificationCooldown, setVerificationCooldown] = useState<number>(() => {
    try {
      const lastSent = Number(sessionStorage.getItem("tcc_last_verification_sent") || 0);
      const diff = Math.floor((Date.now() - lastSent) / 1000);
      return diff < 60 ? 60 - diff : 0;
    } catch {
      return 0;
    }
  });

  // Countdown timer for email verification cooldown
  useEffect(() => {
    if (verificationCooldown <= 0) return;
    const interval = setInterval(() => {
      setVerificationCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [verificationCooldown]);

  // Helper to format friendly error messages
  const formatAuthError = (err: any): string => {
    const code = err?.code || "";
    const msg = err?.message || "";

    if (code === "auth/configuration-not-found" || msg.includes("CONFIGURATION_NOT_FOUND")) {
      return "Firebase Authentication is not yet activated in your Firebase Console. Please go to Firebase Console > Authentication > Get Started > enable Email/Password provider.";
    }
    if (code === "auth/email-already-in-use") {
      return "An account with this email address already exists. Please log in instead.";
    }
    if (code === "auth/invalid-email") {
      return "Please enter a valid email address.";
    }
    if (code === "auth/weak-password") {
      return "Password is too weak. Please choose at least 6 characters with letters and numbers.";
    }
    if (
      code === "auth/user-not-found" ||
      code === "auth/wrong-password" ||
      code === "auth/invalid-credential"
    ) {
      return "Invalid email or password. Please verify your credentials.";
    }
    if (code === "auth/too-many-requests") {
      return "Too many failed attempts. Please try again after a few minutes or reset your password.";
    }
    if (code === "auth/network-request-failed") {
      return "Network connection error. Please check your internet connection.";
    }

    return msg || "Authentication error. Please try again.";
  };

  // Sync auth state and listen to user profile in Firestore
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);

          // Real-time listener for profile changes
          unsubscribeProfile = onSnapshot(
            userDocRef,
            (docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data();
                setCustomerProfile({
                  uid: currentUser.uid,
                  name: data?.name || currentUser.displayName || currentUser.email?.split("@")[0] || "Customer",
                  email: data?.email || currentUser.email || "",
                  phone: data?.phone || currentUser.phoneNumber || "",
                  role: "customer",
                  defaultDeliveryLocation: data?.defaultDeliveryLocation || null,
                  adminNotificationSent: Boolean(data?.adminNotificationSent),
                  createdAt: data?.createdAt || currentUser.metadata.creationTime,
                  updatedAt: data?.updatedAt,
                });
              } else {
                // If doc doesn't exist yet, build initial fallback from Firebase User
                const fallbackProfile: CustomerProfile = {
                  uid: currentUser.uid,
                  name: currentUser.displayName || currentUser.email?.split("@")[0] || "Customer",
                  email: currentUser.email || "",
                  phone: currentUser.phoneNumber || "",
                  role: "customer",
                  createdAt: new Date().toISOString(),
                };
                setCustomerProfile(fallbackProfile);
                // Attempt to create it in Firestore
                setDoc(userDocRef, fallbackProfile, { merge: true }).catch(() => {});
              }
              setLoading(false);
            },
            () => {
              // On error (e.g. offline or rule denial), fallback to basic info
              setCustomerProfile({
                uid: currentUser.uid,
                name: currentUser.displayName || currentUser.email?.split("@")[0] || "Customer",
                email: currentUser.email || "",
                phone: "",
                role: "customer",
              });
              setLoading(false);
            }
          );
        } catch {
          setLoading(false);
        }
      } else {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        setCustomerProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  // Customer Sign Up
  const signUp = async (
    name: string,
    email: string,
    phone: string,
    password: string
  ): Promise<{ success: boolean; error?: string; emailVerified?: boolean; emailSent?: boolean; emailError?: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();
      const cleanPhone = phone.trim();

      // 1. Create user in Firebase Authentication
      const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const newUser = credential.user;

      // 2. Update Firebase Auth display name
      try {
        await updateFirebaseProfile(newUser, { displayName: cleanName });
      } catch {}

      // 3. Create customer profile document in Firestore
      const newProfile: CustomerProfile = {
        uid: newUser.uid,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        role: "customer",
        adminNotificationSent: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        const userDocRef = doc(db, "users", newUser.uid);
        await setDoc(userDocRef, newProfile);
      } catch (firestoreErr) {
        console.warn("Could not write profile to Firestore immediately:", firestoreErr);
      }

      // 4. Send Email Verification (Awaited with Firebase Native Fallback)
      let emailSent = false;
      let emailError: string | undefined;

      try {
        let sentBranded = false;
        try {
          const idToken = await newUser.getIdToken();
          const response = await fetch("/api/notifications?action=send_verification", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              email: cleanEmail,
              name: cleanName,
              uid: newUser.uid,
            }),
          });
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.provider && data.provider !== "none" && data.provider !== "simulated") {
              sentBranded = true;
              emailSent = true;
            }
          }
        } catch (apiErr: any) {
          console.warn("Branded verification dispatch request failed:", apiErr?.message);
        }

        // If branded provider is not configured or failed, dispatch via Firebase Auth client SDK directly
        if (!sentBranded) {
          await sendEmailVerification(newUser);
          emailSent = true;
        }

        try {
          sessionStorage.setItem("tcc_last_verification_sent", String(Date.now()));
        } catch {}
        setVerificationCooldown(60);
      } catch (verifyErr: any) {
        console.error("Email verification dispatch failed:", verifyErr);
        emailSent = false;
        const errCode = verifyErr?.code ? `[${verifyErr.code}] ` : "";
        const errMsg = verifyErr?.message || formatAuthError(verifyErr);
        emailError = `${errCode}${errMsg}`;
      }

      // 5. Trigger Secure Server-Side Admin Notification
      try {
        const idToken = await newUser.getIdToken();
        fetch("/api/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            uid: newUser.uid,
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
          }),
        }).catch((err) => console.warn("Admin notification dispatch caught error:", err));
      } catch (err) {
        console.warn("Failed to get ID token for admin notification:", err);
      }

      setCustomerProfile(newProfile);
      return { success: true, emailVerified: false, emailSent, emailError };
    } catch (err: any) {
      return { success: false, error: formatAuthError(err) };
    }
  };

  // Customer Login
  const login = async (
    email: string,
    password: string,
    remember: boolean = true
  ): Promise<{ success: boolean; error?: string; emailVerified?: boolean }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();

      // Configure persistence
      await setPersistence(
        auth,
        remember ? browserLocalPersistence : browserSessionPersistence
      );

      const credential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const loggedInUser = credential.user;

      // Fetch profile
      try {
        const docRef = doc(db, "users", loggedInUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCustomerProfile(docSnap.data() as CustomerProfile);
        } else {
          const fallback: CustomerProfile = {
            uid: loggedInUser.uid,
            name: loggedInUser.displayName || cleanEmail.split("@")[0],
            email: cleanEmail,
            phone: "",
            role: "customer",
            createdAt: new Date().toISOString(),
          };
          setCustomerProfile(fallback);
          setDoc(docRef, fallback, { merge: true }).catch(() => {});
        }
      } catch {}

      return { success: true, emailVerified: loggedInUser.emailVerified };
    } catch (err: any) {
      return { success: false, error: formatAuthError(err) };
    }
  };

  // Customer Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setCustomerProfile(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Resend Email Verification (with rate limit protection)
  const sendVerificationEmail = async (
    userInstance?: User | null
  ): Promise<{ success: boolean; error?: string }> => {
    const targetUser = userInstance || auth.currentUser || user;
    if (!targetUser) {
      return { success: false, error: "Please log in first to request a verification email." };
    }

    if (targetUser.emailVerified) {
      return { success: true, error: "Your email address is already verified." };
    }

    if (verificationCooldown > 0) {
      return {
        success: false,
        error: `Please wait ${verificationCooldown} seconds before requesting another verification email.`,
      };
    }

    try {
      // 1. Dispatch custom branded verification email via backend if configured
      let sentBranded = false;
      try {
        const idToken = await targetUser.getIdToken();
        const res = await fetch("/api/notifications?action=send_verification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            email: targetUser.email,
            name: targetUser.displayName || customerProfile?.name || "",
            uid: targetUser.uid,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.provider && data.provider !== "none" && data.provider !== "simulated") {
            sentBranded = true;
          }
        }
      } catch (err: any) {
        console.warn("Branded email dispatch request failed:", err?.message);
      }

      // 2. Fallback to Firebase client SDK if custom backend provider is not configured or failed
      if (!sentBranded) {
        await sendEmailVerification(targetUser);
      }

      try {
        sessionStorage.setItem("tcc_last_verification_sent", String(Date.now()));
      } catch {}
      setVerificationCooldown(60);
      return { success: true };
    } catch (err: any) {
      console.error("sendVerificationEmail error:", err);
      const code = err?.code || "";
      if (code === "auth/too-many-requests") {
        setVerificationCooldown(60);
        return {
          success: false,
          error: `[auth/too-many-requests] Too many verification requests sent recently. Please check your spam/promotions folder or wait a minute before requesting another email.`,
        };
      }
      const errCode = code ? `[${code}] ` : "";
      const errMsg = err?.message || formatAuthError(err);
      return { success: false, error: `${errCode}${errMsg}` };
    }
  };

  // Check / Reload Email Verification Status
  const checkEmailVerified = async (): Promise<boolean> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;

    try {
      await currentUser.reload();
      setUser({ ...currentUser });
      return currentUser.emailVerified;
    } catch (err) {
      console.warn("Failed to reload user verification status:", err);
      return false;
    }
  };

  // Apply Firebase Action Code (for email verification link clicks)
  const applyVerificationCode = async (code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await applyActionCode(auth, code);
      if (auth.currentUser) {
        await auth.currentUser.reload();
        setUser({ ...auth.currentUser });
      }
      return { success: true };
    } catch (err: any) {
      const codeErr = err?.code || "";
      if (codeErr === "auth/invalid-action-code") {
        return { success: false, error: "The verification link is invalid, expired, or has already been used." };
      }
      if (codeErr === "auth/expired-action-code") {
        return { success: false, error: "The verification link has expired. Please request a new one." };
      }
      return { success: false, error: err?.message || "Failed to verify email link." };
    }
  };

  // Password Reset (hardened to prevent account enumeration)
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Dispatch custom branded password reset email via backend if configured
      let sentCustom = false;
      try {
        const res = await fetch("/api/notifications?action=send_reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.provider && data.provider !== "none" && data.provider !== "simulated") {
            sentCustom = true;
          }
        }
      } catch {}

      // 2. Fallback to Firebase client SDK if custom backend endpoint unconfigured or unreachable
      if (!sentCustom) {
        await sendPasswordResetEmail(auth, cleanEmail);
      }

      return { success: true };
    } catch (err: any) {
      const code = err?.code || "";
      // If user-not-found, still return success: true to prevent account enumeration attacks
      if (code === "auth/user-not-found") {
        return { success: true };
      }
      return { success: false, error: formatAuthError(err) };
    }
  };

  // Update Customer Profile
  const updateCustomerProfile = async (
    updates: Partial<Pick<CustomerProfile, "name" | "phone" | "defaultDeliveryLocation">>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "You must be signed in to update your profile." };
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const updatePayload = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(userDocRef, updatePayload, { merge: true });

      // Update display name in Firebase Auth if name changed
      if (updates.name && updates.name.trim() !== user.displayName) {
        try {
          await updateFirebaseProfile(user, { displayName: updates.name.trim() });
        } catch {}
      }

      setCustomerProfile((prev) =>
        prev
          ? {
              ...prev,
              ...updates,
              updatedAt: updatePayload.updatedAt,
            }
          : null
      );

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed to update profile." };
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        user,
        customerProfile,
        isAuthenticated: !!user,
        isEmailVerified: !!user?.emailVerified,
        verificationCooldown,
        loading,
        signUp,
        login,
        logout,
        sendVerificationEmail,
        checkEmailVerified,
        applyVerificationCode,
        resetPassword,
        updateCustomerProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
};
