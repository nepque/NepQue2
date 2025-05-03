import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

// User-facing components
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HomePage from "@/pages/HomePage";
import CouponsPage from "@/pages/CouponsPage";
import CouponDetailPage from "@/pages/CouponDetailPage";
import StorePage from "@/pages/StorePage";
import CategoryPage from "@/pages/CategoryPage";
import SearchResultsPage from "@/pages/SearchResultsPage";
import ProfilePage from "@/pages/ProfilePage";
import SubmitCouponPage from "@/pages/SubmitCouponPage";
import AboutPage from "@/pages/AboutPage";
import FAQPage from "@/pages/FAQPage";
import ContactPage from "@/pages/ContactPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsOfServicePage from "@/pages/TermsOfServicePage";
import WithdrawalsPage from "@/pages/WithdrawalsPage";
import EarnPage from "@/pages/EarnPage"; // Added import for new EarnPage

// Admin components
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminCoupons from "@/pages/admin/AdminCoupons";
import AdminStores from "@/pages/admin/AdminStores";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminCouponNew from "@/pages/admin/AdminCouponNew";
import AdminStoreNew from "@/pages/admin/AdminStoreNew";
import AdminCategoryNew from "@/pages/admin/AdminCategoryNew";
import AdminCouponEdit from "@/pages/admin/AdminCouponEdit";
import AdminSubmissionEdit from "@/pages/admin/AdminSubmissionEdit";
import AdminStoreEdit from "@/pages/admin/AdminStoreEdit";
import AdminCategoryEdit from "@/pages/admin/AdminCategoryEdit";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminSubmissions from "@/pages/admin/AdminSubmissions";
import AdminWithdrawals from "@/pages/admin/AdminWithdrawals"; // Added import

function UserRouter() {
  return (
    <>
      <Header />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/coupons" component={CouponsPage} />
        <Route path="/coupon/:id" component={CouponDetailPage} />
        <Route path="/store/:slug" component={StorePage} />
        <Route path="/category/:slug" component={CategoryPage} />
        <Route path="/search" component={SearchResultsPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/submit-coupon" component={SubmitCouponPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/faq" component={FAQPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/privacy-policy" component={PrivacyPolicyPage} />
        <Route path="/terms-of-service" component={TermsOfServicePage} />
        <Route path="/withdrawals" component={WithdrawalsPage} /> {/* Added withdrawals route */}
        <Route path="/earn" component={EarnPage} /> {/* Added earn points route */}
        <Route component={NotFound} />
      </Switch>
      <Footer />
    </>
  );
}

function AdminRouter() {
  const [, setLocation] = useLocation();

  return (
    <Switch>
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/coupons" component={AdminCoupons} />
      <Route path="/admin/stores" component={AdminStores} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/submissions" component={AdminSubmissions} />

      {/* Create new item routes */}
      <Route path="/admin/coupons/new" component={AdminCouponNew} />
      <Route path="/admin/stores/new" component={AdminStoreNew} />
      <Route path="/admin/categories/new" component={AdminCategoryNew} />

      {/* Edit routes */}
      <Route path="/admin/coupons/edit/:id" component={AdminCouponEdit} />
      <Route path="/admin/submissions/edit/:id" component={AdminSubmissionEdit} />
      <Route path="/admin/stores/edit/:id" component={AdminStoreEdit} />
      <Route path="/admin/categories/edit/:id" component={AdminCategoryEdit} />
      <Route path="/admin/withdrawals" component={AdminWithdrawals} /> {/* Added withdrawals route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  const [location, setLocation] = useLocation();
  const { currentUser, isAdmin } = useAuth();
  const isAdminRoute = location.startsWith("/admin");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if admin token exists in localStorage
  useEffect(() => {
    const checkAdminToken = () => {
      const token = localStorage.getItem("adminToken");
      setIsAdminLoggedIn(!!token);
      setIsCheckingAuth(false);
    };

    // Don't check auth on login page
    if (location === "/admin/login") {
      setIsCheckingAuth(false);
      return;
    }

    checkAdminToken();
  }, [location]);

  // Special handling for admin login page
  if (location === "/admin/login") {
    return <AdminLogin />;
  }

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If this is an admin route, check for admin authentication
  if (isAdminRoute) {
    // If admin is logged in, allow access to admin routes
    if (isAdminLoggedIn) {
      return <AdminRouter />;
    } else {
      // Use setLocation instead of direct window.location modification
      // This prevents the page from reloading and maintains React state
      setLocation("/admin/login");
      return null;
    }
  }

  // For all non-admin routes
  return <UserRouter />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;