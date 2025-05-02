import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import AdminLayout from "@/components/admin/AdminLayout";
import { Store } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Pencil,
  Trash,
  ExternalLink,
  Store as StoreIcon
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Badge } from "@/components/ui/badge";

const AdminStores = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch stores with coupon counts
  const { data: storesWithCounts, isLoading: isLoadingStores } = useQuery<(Store & { couponCount: number })[]>({
    queryKey: ["/api/stores/with-counts"],
    queryFn: async () => {
      const response = await fetch("/api/stores/with-counts");
      if (!response.ok) {
        throw new Error("Failed to fetch stores");
      }
      return response.json();
    }
  });

  // Filter and search stores
  const filteredStores = storesWithCounts?.filter(store => {
    // Search filter
    if (searchQuery && !store.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !store.website.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Pagination
  const totalPages = Math.ceil((filteredStores?.length || 0) / itemsPerPage);
  const paginatedStores = filteredStores?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format website URL for display
  const formatWebsiteUrl = (url: string) => {
    return url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
  };

  return (
    <AdminLayout title="Stores">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search stores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-[280px]"
          />
        </div>
        
        <Link href="/admin/stores/new">
          <Button className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            Add Store
          </Button>
        </Link>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {isLoadingStores ? (
          <div className="p-4">
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        ) : filteredStores && filteredStores.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Store</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Coupons</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStores?.map(store => (
                  <TableRow key={store.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex items-center justify-center mr-3 border border-gray-200">
                          <img 
                            src={store.logo} 
                            alt={store.name}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(store.name)}&background=random&size=32`;
                            }}
                          />
                        </div>
                        <span className="font-medium">{store.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <a 
                        href={store.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        {formatWebsiteUrl(store.website)}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {store.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {store.couponCount} coupons
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/stores/edit/${store.id}`} className="cursor-pointer">
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/store/${store.slug}`} className="cursor-pointer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Store
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
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStores?.length || 0)} of {filteredStores?.length || 0} results
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
              <StoreIcon className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No stores found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? "Try changing your search criteria"
                : "Get started by adding your first store"
              }
            </p>
            {!searchQuery && (
              <Link href="/admin/stores/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Store
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminStores;