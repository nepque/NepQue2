import { useState } from "react";
import { usePointsLog } from "@/hooks/use-points-log";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Loader2, Plus, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PAGE_SIZE = 10;

export function PointsHistory() {
  const [page, setPage] = useState(1);
  const { pointsLog, pointsLogLoading, pointsBalance, balanceLoading } = usePointsLog();

  // Format actions to be more readable
  const formatAction = (action: string) => {
    switch (action) {
      case "daily_check_in":
        return "Daily Check-in";
      case "streak_complete":
        return "Streak Bonus";
      case "coupon_submission":
        return "Coupon Submission";
      case "withdrawal":
        return "Points Withdrawal";
      case "signup_bonus":
        return "Sign-up Bonus";
      default:
        return action.split("_").map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(" ");
    }
  };

  // Get the current page of data
  const paginatedData = pointsLog
    .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  
  const totalPages = Math.ceil(pointsLog.length / PAGE_SIZE);

  if (pointsLogLoading || balanceLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Points History</CardTitle>
          <CardDescription>Your points activity</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Points History</span>
          <Badge variant="outline" className="text-lg font-bold">
            Balance: {pointsBalance} points
          </Badge>
        </CardTitle>
        <CardDescription>Your points activity</CardDescription>
      </CardHeader>
      <CardContent>
        {pointsLog.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-muted-foreground mb-2">No points activity yet</p>
            <p className="text-sm text-muted-foreground">
              Check in daily and submit coupons to earn points
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableCaption>Your points transaction history</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>{formatAction(entry.action)}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className={`text-right font-medium ${entry.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.points > 0 ? (
                        <span className="flex items-center justify-end gap-1">
                          <Plus className="h-4 w-4" />
                          {entry.points}
                        </span>
                      ) : (
                        <span className="flex items-center justify-end gap-1">
                          <Minus className="h-4 w-4" />
                          {Math.abs(entry.points)}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className={page === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setPage(pageNum)}
                        isActive={page === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}