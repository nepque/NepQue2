import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

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
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminCoupons from "@/pages/admin/AdminCoupons";
import AdminStores from "@/pages/admin/AdminStores";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminCouponNew from "@/pages/admin/AdminCouponNew";
import AdminStoreNew from "@/pages/admin/AdminStoreNew";
import AdminCategoryNew from "@/pages/admin/AdminCategoryNew";
import AdminCouponEdit from "@/pages/admin/AdminCouponEdit";
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
  return (
    <Switch>
      <Route path="/admin" component={AdminDashboard} />
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
      <Route path="/admin/stores/edit/:id" component={AdminStoreEdit} />
      <Route path="/admin/categories/edit/:id" component={AdminCategoryEdit} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  const [location] = useLocation();
  const { currentUser, isAdmin } = useAuth();
  const isAdminRoute = location.startsWith("/admin");
  
  // For testing purposes, we'll allow all authenticated users into admin
  if (isAdminRoute && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-500 text-white p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Login Required</h1>
          <p className="mb-4">Please login to access the admin area.</p>
          <Link href="/">
            <button className="px-4 py-2 bg-white text-red-500 rounded shadow hover:bg-gray-100">
              Go to Homepage
            </button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Continue to the right router based on path
  if (isAdminRoute) {
    return <AdminRouter />;
  }
  
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
