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
        <Route component={NotFound} />
      </Switch>
      <Footer />
    </>
  );
}

function AdminRouter() {
  // Add a simple admin header component
  const AdminHeader = () => (
    <header className="bg-blue-600 text-white py-4 px-6 mb-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <nav className="space-x-4">
          <Link href="/admin" className="hover:underline">Dashboard</Link>
          <Link href="/admin/coupons" className="hover:underline">Coupons</Link>
          <Link href="/admin/stores" className="hover:underline">Stores</Link>
          <Link href="/admin/categories" className="hover:underline">Categories</Link>
          <Link href="/admin/users" className="hover:underline">Users</Link>
          <Link href="/admin/submissions" className="hover:underline">Submissions</Link>
        </nav>
      </div>
      <button 
        onClick={() => {
          localStorage.removeItem("adminToken");
          window.location.href = "/admin/login";
        }}
        className="bg-white text-blue-600 px-3 py-1 rounded text-sm"
      >
        Logout
      </button>
    </header>
  );

  return (
    <div className="bg-gray-100 min-h-screen">
      <AdminHeader />
      <main className="container mx-auto px-4 pb-8">
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
          
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  const { currentUser, isAdmin } = useAuth();
  const isAdminRoute = location.startsWith("/admin");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  
  // Check if admin token exists in localStorage
  useEffect(() => {
    const checkAdminToken = () => {
      const token = localStorage.getItem("adminToken");
      setIsAdminLoggedIn(!!token);
    };
    
    checkAdminToken();
    
    // Also check if we're on the admin login page
    if (location === "/admin/login") {
      // Don't trigger the admin check if we're already on the login page
      return;
    }
  }, [location]);

  // Special handling for admin login page
  if (location === "/admin/login") {
    return <AdminLogin />;
  }
  
  // If this is an admin route, check for admin authentication
  if (isAdminRoute) {
    // If admin is logged in, allow access to admin routes
    if (isAdminLoggedIn) {
      return <AdminRouter />;
    } else {
      // Redirect to admin login if not authenticated
      window.location.href = "/admin/login";
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
