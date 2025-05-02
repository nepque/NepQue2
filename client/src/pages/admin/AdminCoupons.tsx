import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import AdminLayout from "@/components/admin/AdminLayout";
import { CouponWithRelations } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  MoreHorizontal,
  Pencil,
  Trash,
  Check,
  X,
  Calendar,
  Tag
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format, isPast } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminCoupons = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStore, setFilterStore] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch coupons
  const { data: coupons, isLoading: isLoadingCoupons } = useQuery<CouponWithRelations[]>({
    queryKey: ["/api/coupons"],
    queryFn: async () => {
      const response = await fetch("/api/coupons");
      if (!response.ok) {
        throw new Error("Failed to fetch coupons");
      }
      return response.json();
    }
  });

  // Filter and search coupons
  const filteredCoupons = coupons?.filter(coupon => {
    // Search filter
    if (searchQuery && !coupon.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !coupon.store.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (filterCategory && filterCategory !== "all" && coupon.categoryId.toString() !== filterCategory) {
      return false;
    }
    
    // Store filter
    if (filterStore && filterStore !== "all" && coupon.storeId.toString() !== filterStore) {
      return false;
    }
    
    return true;
  });

  // Get unique categories and stores for filters
  const categories = [...new Set(coupons?.map(coupon => ({
    id: coupon.category.id,
    name: coupon.category.name,
  })) || [])].reduce((unique, item) => {
    const exists = unique.find(u => u.id === item.id);
    if (!exists) {
      unique.push(item);
    }
    return unique;
  }, [] as { id: number; name: string }[]);

  const stores = [...new Set(coupons?.map(coupon => ({
    id: coupon.store.id,
    name: coupon.store.name,
  })) || [])].reduce((unique, item) => {
    const exists = unique.find(u => u.id === item.id);
    if (!exists) {
      unique.push(item);
    }
    return unique;
  }, [] as { id: number; name: string }[]);

  // Pagination
  const totalPages = Math.ceil((filteredCoupons?.length || 0) / itemsPerPage);
  const paginatedCoupons = filteredCoupons?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format date display
  const formatDate = (date: string | Date) => {
    return format(new Date(date), "MMM d, yyyy");
  };

  // Check if coupon is expired
  const isExpired = (date: string | Date) => {
    return isPast(new Date(date)) && !isToday(new Date(date));
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  return (
    <AdminLayout title="Coupons">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-[280px]"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterStore} onValueChange={setFilterStore}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Store" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {stores.map(store => (
                  <SelectItem key={store.id} value={store.id.toString()}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Link href="/admin/coupons/new">
          <Button className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            Add Coupon
          </Button>
        </Link>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {isLoadingCoupons ? (
          <div className="p-4">
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        ) : filteredCoupons && filteredCoupons.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCoupons?.map(coupon => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {coupon.title}
                    </TableCell>
                    <TableCell>
                      <code className="px-2 py-1 rounded bg-gray-100 text-sm font-mono">
                        {coupon.code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-6 h-6 mr-2 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                          <img 
                            src={coupon.store.logo} 
                            alt={coupon.store.name}
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(coupon.store.name)}&background=random&size=32`;
                            }}
                          />
                        </div>
                        {coupon.store.name}
                      </div>
                    </TableCell>
                    <TableCell>{coupon.category.name}</TableCell>
                    <TableCell>{formatDate(coupon.expiresAt)}</TableCell>
                    <TableCell>
                      {isExpired(coupon.expiresAt) ? (
                        <Badge variant="destructive" className="text-xs">Expired</Badge>
                      ) : coupon.verified ? (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>{coupon.usedCount}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/coupons/edit/${coupon.id}`} className="cursor-pointer">
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 cursor-pointer">
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center p-4 border-t">
                <div className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCoupons?.length || 0)} of {filteredCoupons?.length || 0} results
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Tag className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No coupons found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || filterCategory || filterStore
                ? "Try changing your search or filter criteria"
                : "Get started by adding your first coupon"
              }
            </p>
            {!searchQuery && !filterCategory && !filterStore && (
              <Link href="/admin/coupons/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Coupon
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCoupons;