import { format } from "date-fns";
import { usePointsLog, PointsLogEntry } from "@/hooks/use-points-log";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Info, TrendingUp, TrendingDown, RefreshCcw, Calendar, CheckCircle2, Award, Gift, Coins, Send } from "lucide-react";

export function PointsHistory() {
  const { pointsLog, pointsLogLoading, pointsBalance, balanceLoading } = usePointsLog();

  // Helper function to get icon based on action type
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'daily_check_in':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'streak_complete':
        return <Award className="h-4 w-4 text-amber-500" />;
      case 'coupon_approved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <Send className="h-4 w-4 text-red-500" />;
      case 'signup_bonus':
        return <Gift className="h-4 w-4 text-purple-500" />;
      default:
        return <Coins className="h-4 w-4 text-gray-500" />;
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "PPP");
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  // Helper function to format time
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "p");
    } catch (e) {
      console.error("Error formatting time:", e);
      return "";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Points Balance</CardTitle>
          <CardDescription>Your current total points</CardDescription>
        </CardHeader>
        <CardContent>
          {balanceLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Coins className="h-8 w-8 mr-3 text-yellow-500" />
              <span className="text-4xl font-bold">{pointsBalance}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Points History</CardTitle>
          <CardDescription>Your points transactions and activities</CardDescription>
        </CardHeader>
        <CardContent>
          {pointsLogLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : pointsLog.length > 0 ? (
            <div className="space-y-4">
              {pointsLog.map((entry: PointsLogEntry) => (
                <div 
                  key={entry.id} 
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      {getActionIcon(entry.action)}
                    </div>
                    <div>
                      <div className="font-medium">{entry.description}</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(entry.createdAt)} at {formatTime(entry.createdAt)}
                      </div>
                    </div>
                  </div>
                  <Badge 
                    className={
                      entry.points > 0 
                        ? "bg-green-500 hover:bg-green-600" 
                        : "bg-red-500 hover:bg-red-600"
                    }
                  >
                    {entry.points > 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {entry.points > 0 ? "+" : ""}{entry.points}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <RefreshCcw className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">No points activity yet</p>
              <p className="text-sm mt-1">Start earning points by checking in daily or submitting coupons!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}