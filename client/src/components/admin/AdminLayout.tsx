import { ReactNode, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Tag, 
  Store, 
  Settings, 
  Bell,
  User,
  ChevronDown,
  LogOut,
  Users,
  Inbox,
  CreditCard,
  Image
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import SEO from "@/components/common/SEO";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const [location, setLocation] = useLocation();

  // Verify admin is logged in on component mount and redirect if not
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      setLocation("/admin/login");
    } else {
      // If we have a token, refresh admin-related queries
      if (location.includes('/admin/stores')) {
        queryClient.invalidateQueries({queryKey: ['/api/stores/with-counts']});
      }
      if (location.includes('/admin/categories')) {
        queryClient.invalidateQueries({queryKey: ['/api/categories/with-counts']});
      }
    }
  }, [setLocation, location]);

  const isActive = (path: string) => {
    return location.startsWith(path);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <SEO title={`Admin - ${title}`} noIndex={true} />
      {/* Sidebar */}
      <aside className="bg-gray-800 text-white w-64 shrink-0 fixed h-screen overflow-y-auto">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-700">
          <Link href="/admin" className="text-2xl font-['Pacifico'] text-white">
            NepQue
          </Link>
        </div>

        {/* Navigation */}
        <nav className="py-4">
          <ul>
            <li>
              <Link 
                href="/admin" 
                className={`flex items-center py-3 px-6 ${
                  isActive("/admin") && !isActive("/admin/coupons") && !isActive("/admin/stores") && !isActive("/admin/categories") && !isActive("/admin/users") && !isActive("/admin/settings") && !isActive("/admin/withdrawals")
                    ? "bg-white/15 border-l-4 border-white text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                } transition-colors`}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/coupons" 
                className={`flex items-center py-3 px-6 ${
                  isActive("/admin/coupons")
                    ? "bg-white/15 border-l-4 border-white text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                } transition-colors`}
              >
                <Tag className="w-5 h-5 mr-3" />
                <span>Coupons</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/stores" 
                className={`flex items-center py-3 px-6 ${
                  isActive("/admin/stores")
                    ? "bg-white/15 border-l-4 border-white text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                } transition-colors`}
              >
                <Store className="w-5 h-5 mr-3" />
                <span>Stores</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/categories" 
                className={`flex items-center py-3 px-6 ${
                  isActive("/admin/categories")
                    ? "bg-white/15 border-l-4 border-white text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                } transition-colors`}
              >
                <Tag className="w-5 h-5 mr-3" />
                <span>Categories</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/users" 
                className={`flex items-center py-3 px-6 ${
                  isActive("/admin/users")
                    ? "bg-white/15 border-l-4 border-white text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                } transition-colors`}
              >
                <Users className="w-5 h-5 mr-3" />
                <span>Users</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/submissions" 
                className={`flex items-center py-3 px-6 ${
                  isActive("/admin/submissions")
                    ? "bg-white/15 border-l-4 border-white text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                } transition-colors`}
              >
                <Inbox className="w-5 h-5 mr-3" />
                <span>Submissions</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/withdrawals"
                className={`flex items-center py-3 px-6 ${
                  isActive("/admin/withdrawals")
                    ? "bg-white/15 border-l-4 border-white text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                } transition-colors`}
              >
                <CreditCard className="w-5 h-5 mr-3" />
                <span>Withdrawals</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/banner-ads"
                className={`flex items-center py-3 px-6 ${
                  isActive("/admin/banner-ads")
                    ? "bg-white/15 border-l-4 border-white text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                } transition-colors`}
              >
                <Image className="w-5 h-5 mr-3" />
                <span>Banner Ads</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/settings" 
                className={`flex items-center py-3 px-6 ${
                  isActive("/admin/settings")
                    ? "bg-white/15 border-l-4 border-white text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                } transition-colors`}
              >
                <Settings className="w-5 h-5 mr-3" />
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="ml-64 flex-1">
        {/* Top header */}
        <header className="bg-white h-16 px-6 flex items-center justify-between border-b border-gray-200 sticky top-0 z-10">
          {/* Page title */}
          <div className="text-lg font-semibold text-gray-800">
            NepQue Admin
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
            </div>

            {/* User dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-800">Admin User</p>
                  <p className="text-xs text-gray-500">admin@nepque.com</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-20">
                <Link href="/admin/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Your Profile
                </Link>
                <Link href="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Settings
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => {
                    localStorage.removeItem("adminToken");
                    setLocation("/admin/login");
                  }}
                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <div className="flex items-center text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sign out</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;