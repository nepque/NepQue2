import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// User-facing components
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HomePage from "@/pages/HomePage";
import CouponsPage from "@/pages/CouponsPage";
import CouponDetailPage from "@/pages/CouponDetailPage";
import StorePage from "@/pages/StorePage";
import CategoryPage from "@/pages/CategoryPage";
import SearchResultsPage from "@/pages/SearchResultsPage";

// Admin components
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminCoupons from "@/pages/admin/AdminCoupons";
import AdminStores from "@/pages/admin/AdminStores";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminCouponNew from "@/pages/admin/AdminCouponNew";
import AdminStoreNew from "@/pages/admin/AdminStoreNew";
import AdminCategoryNew from "@/pages/admin/AdminCategoryNew";

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
      
      {/* Create new item routes */}
      <Route path="/admin/coupons/new" component={AdminCouponNew} />
      <Route path="/admin/stores/new" component={AdminStoreNew} />
      <Route path="/admin/categories/new" component={AdminCategoryNew} />
      
      {/* Edit routes - would need to be implemented */}
      <Route path="/admin/coupons/edit/:id" component={AdminCoupons} />
      <Route path="/admin/stores/edit/:id" component={AdminStores} />
      <Route path="/admin/categories/edit/:id" component={AdminCategories} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");
  
  if (isAdmin) {
    return <AdminRouter />;
  }
  
  return <UserRouter />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
