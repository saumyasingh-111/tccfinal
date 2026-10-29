import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DataProvider, useData } from "./context/DataContext";
import { AuthProvider, useAuth, ProtectedAdminRoute } from "./context/AuthContext";
import { CustomerAuthProvider } from "./context/CustomerAuthContext";
import { ToastProvider } from "./context/ToastContext";
import { OrderProvider } from "./context/OrderContext";
import { ScrollToTop } from "./components/ScrollToTop";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { QuickOrderDrawer } from "./components/QuickOrderDrawer";
import { MobileStickyBar } from "./components/MobileStickyBar";

// Customer Multi-Page Routes
import { HomePage } from "./pages/HomePage";
import { MenuPage } from "./pages/MenuPage";
import { OurStoryPage } from "./pages/OurStoryPage";
import { GalleryPage } from "./pages/GalleryPage";
import { VisitUsPage } from "./pages/VisitUsPage";
import { GiftingPage } from "./pages/GiftingPage";
import { BuildYourGiftPage } from "./pages/BuildYourGiftPage";
import { GiftDetailPage } from "./pages/GiftDetailPage";
import { OrderPage } from "./pages/OrderPage";
import { CustomerLoginPage } from "./pages/CustomerLoginPage";
import { CustomerSignUpPage } from "./pages/CustomerSignUpPage";
import { CustomerVerifyEmailPage } from "./pages/CustomerVerifyEmailPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { CustomerProfilePage } from "./pages/CustomerProfilePage";

// Admin Portal Pages
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminMenuPage } from "./pages/admin/AdminMenuPage";
import { AdminGiftingPage } from "./pages/admin/AdminGiftingPage";
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage";
import { AdminFeaturedPage } from "./pages/admin/AdminFeaturedPage";
import { AdminGalleryPage } from "./pages/admin/AdminGalleryPage";
import { AdminHomepagePage } from "./pages/admin/AdminHomepagePage";
import { AdminCafeInfoPage } from "./pages/admin/AdminCafeInfoPage";
import { AdminReservationsPage } from "./pages/admin/AdminReservationsPage";
import { AdminSettingsPage } from "./pages/admin/AdminSettingsPage";
import { AdminInventoryPage } from "./pages/admin/AdminInventoryPage";
import { AdminCustomersPage } from "./pages/admin/AdminCustomersPage";
import { AdminReviewsPage } from "./pages/admin/AdminReviewsPage";
import { AdminOffersPage } from "./pages/admin/AdminOffersPage";

/**
 * Customer Layout Wrapper
 * Keeps customer navigation, cart, footer, and mobile bars isolated from Admin.
 */
const CustomerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useData();

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#162820] flex flex-col font-sans selection:bg-[#0F3A23]/20 selection:text-[#0F3A23]">
      {settings.isMaintenanceMode && (
        <div className="bg-[#755546] text-[#FAF7F2] text-xs text-center py-2 px-4 font-medium tracking-wide">
          Notice: The cafe menu is currently in maintenance mode. Please call or WhatsApp us for instant assistance.
        </div>
      )}
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <QuickOrderDrawer />
      <MobileStickyBar />
    </div>
  );
};

/**
 * Direct entry handler for /admin
 * - Unauthenticated users land directly on /admin/login
 * - Authenticated users land on /admin/dashboard
 */
const AdminRootRedirect: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/admin/dashboard" : "/admin/login"} replace />;
};

export function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <AuthProvider>
          <CustomerAuthProvider>
            <ToastProvider>
              <OrderProvider>
                {/* Reset scroll on route changes */}
                <ScrollToTop />

                <Routes>
                  {/* ----------------- Customer Website Routes ----------------- */}
                  <Route
                    path="/"
                    element={
                      <CustomerLayout>
                        <HomePage />
                      </CustomerLayout>
                    }
                  />
                  <Route
                    path="/menu"
                    element={
                      <CustomerLayout>
                        <MenuPage />
                      </CustomerLayout>
                    }
                  />
                  <Route
                    path="/order"
                    element={
                      <CustomerLayout>
                        <OrderPage />
                      </CustomerLayout>
                    }
                  />
                  <Route
                    path="/gifting"
                    element={
                      <CustomerLayout>
                        <GiftingPage />
                      </CustomerLayout>
                    }
                  />
                  <Route
                    path="/gifting/build-your-gift"
                    element={
                      <CustomerLayout>
                        <BuildYourGiftPage />
                      </CustomerLayout>
                    }
                  />
                  <Route
                    path="/gifting/:slug"
                    element={
                      <CustomerLayout>
                        <GiftDetailPage />
                      </CustomerLayout>
                    }
                  />
                  <Route
                    path="/our-story"
                    element={
                      <CustomerLayout>
                        <OurStoryPage />
                      </CustomerLayout>
                    }
                  />
                  <Route
                    path="/gallery"
                    element={
                      <CustomerLayout>
                        <GalleryPage />
                      </CustomerLayout>
                    }
                  />
                  <Route
                    path="/visit-us"
                    element={
                      <CustomerLayout>
                        <VisitUsPage />
                      </CustomerLayout>
                    }
                  />

                  {/* Customer Auth & Profile Routes */}
                  <Route
                    path="/login"
                    element={
                      <CustomerLayout>
                        <CustomerLoginPage />
                      </CustomerLayout>
                    }
                  />
                  <Route
                    path="/signup"
                    element={
                      <CustomerLayout>
                        <CustomerSignUpPage />
                      </CustomerLayout>
                    }
                  />
                  <Route
                    path="/verify-email"
                    element={
                      <CustomerLayout>
                        <CustomerVerifyEmailPage />
                      </CustomerLayout>
                    }
                  />
                  <Route
                    path="/forgot-password"
                    element={
                      <CustomerLayout>
                        <ForgotPasswordPage />
                      </CustomerLayout>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <CustomerLayout>
                        <CustomerProfilePage />
                      </CustomerLayout>
                    }
                  />

                {/* ----------------- Admin Portal Routes ----------------- */}
                <Route path="/admin" element={<AdminRootRedirect />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />

                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedAdminRoute>
                      <AdminDashboardPage />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/menu"
                  element={
                    <ProtectedAdminRoute>
                      <AdminMenuPage />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/gifting"
                  element={
                    <ProtectedAdminRoute>
                      <AdminGiftingPage />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedAdminRoute>
                      <AdminOrdersPage />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/inventory"
                  element={
                    <ProtectedAdminRoute>
                      <AdminInventoryPage />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/customers"
                  element={
                    <ProtectedAdminRoute>
                      <AdminCustomersPage />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/reviews"
                  element={
                    <ProtectedAdminRoute>
                      <AdminReviewsPage />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/offers"
                  element={
                    <ProtectedAdminRoute>
                      <AdminOffersPage />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/featured"
                  element={
                    <ProtectedAdminRoute>
                      <AdminFeaturedPage />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/gallery"
                  element={
                    <ProtectedAdminRoute>
                      <AdminGalleryPage />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/homepage"
                  element={
                    <ProtectedAdminRoute>
                      <AdminHomepagePage />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/cafe-info"
                  element={
                    <ProtectedAdminRoute>
                      <AdminCafeInfoPage />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/reservations"
                  element={
                    <ProtectedAdminRoute>
                      <AdminReservationsPage />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedAdminRoute>
                      <AdminSettingsPage />
                    </ProtectedAdminRoute>
                  }
                />

                {/* Fallback for invalid admin sub-routes */}
                <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />

                {/* General Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </OrderProvider>
          </ToastProvider>
        </CustomerAuthProvider>
      </AuthProvider>
    </DataProvider>
  </BrowserRouter>
  );
}

export default App;
