import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  LogOut, 
  User, 
  PlusCircle, 
  UserCircle, 
  Ticket, 
  Menu, 
  UserCircle2 
} from "lucide-react";

const Header = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { currentUser, signOut } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path: string) => {
    return location === path;
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Ticket className="text-secondary h-6 w-6 mr-2" />
              <span className="text-xl font-bold text-primary">NepQue</span>
            </Link>
            <button 
              onClick={toggleMobileMenu} 
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="text-neutral-600 h-5 w-5" />
            </button>
          </div>
          
          <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:flex flex-col md:flex-row md:items-center mt-4 md:mt-0`}>
            <nav className="flex flex-col md:flex-row md:space-x-6">
              <Link href="/" className={`py-2 md:py-0 font-medium ${isActive('/') ? 'text-primary' : 'text-neutral-600 hover:text-primary'} border-b md:border-b-0 border-gray-100`}>
                Home
              </Link>
              <Link href="/coupons" className={`py-2 md:py-0 font-medium ${isActive('/coupons') ? 'text-primary' : 'text-neutral-600 hover:text-primary'} border-b md:border-b-0 border-gray-100`}>
                Coupons
              </Link>
              <Link href="/coupons?featured=true" className={`py-2 md:py-0 font-medium ${location.includes('featured=true') ? 'text-primary' : 'text-neutral-600 hover:text-primary'} border-b md:border-b-0 border-gray-100`}>
                Top Deals
              </Link>
            </nav>
            <div className="mt-4 md:mt-0 md:ml-6">
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.photoURL || ''} alt={currentUser.displayName || 'User'} />
                        <AvatarFallback>
                          {currentUser.displayName 
                            ? currentUser.displayName.charAt(0).toUpperCase() 
                            : currentUser.email 
                              ? currentUser.email.charAt(0).toUpperCase() 
                              : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">
                        {currentUser.displayName || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/submit-coupon" className="cursor-pointer">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        <span>Submit Coupon</span>
                      </Link>
                    </DropdownMenuItem>
                    {currentUser.isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="default" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  <UserCircle2 className="h-4 w-4 mr-2" /> Sign In
                </Button>
              )}
            </div>
            
            <AuthModal 
              isOpen={isAuthModalOpen} 
              onClose={() => setIsAuthModalOpen(false)} 
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
