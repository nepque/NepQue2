import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import AdminLayout from "@/components/admin/AdminLayout";
import { Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Pencil,
  Trash,
  ExternalLink,
  Tag
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

const AdminCategories = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch categories with coupon counts
  const { data: categoriesWithCounts, isLoading: isLoadingCategories } = useQuery<(Category & { couponCount: number })[]>({
    queryKey: ["/api/categories/with-counts"],
    retry: 3,
    staleTime: 60000, // 1 minute
  });

  // Filter and search categories
  const filteredCategories = categoriesWithCounts?.filter(category => {
    // Search filter
    if (searchQuery && !category.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Pagination
  const totalPages = Math.ceil((filteredCategories?.length || 0) / itemsPerPage);
  const paginatedCategories = filteredCategories?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AdminLayout title="Categories">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-[280px]"
          />
        </div>
        
        <Link href="/admin/categories/new">
          <Button className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </Link>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {isLoadingCategories ? (
          <div className="p-4">
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        ) : filteredCategories && filteredCategories.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Category</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Coupons</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCategories?.map(category => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div 
                          className="w-10 h-10 rounded-md flex items-center justify-center mr-3"
                          style={{ backgroundColor: category.color }}
                        >
                          <span className="text-white text-lg">{category.icon}</span>
                        </div>
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {category.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {category.icon}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div 
                          className="w-6 h-6 rounded-full mr-2 border border-gray-200"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {category.color}
                        </code>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {category.couponCount} coupons
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
                            <Link href={`/admin/categories/edit/${category.id}`} className="cursor-pointer">
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/category/${category.slug}`} className="cursor-pointer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Category
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
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCategories?.length || 0)} of {filteredCategories?.length || 0} results
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
            <h3 className="text-lg font-medium text-gray-900 mb-1">No categories found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? "Try changing your search criteria"
                : "Get started by adding your first category"
              }
            </p>
            {!searchQuery && (
              <Link href="/admin/categories/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;