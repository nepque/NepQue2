import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { formatDistance } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Award, Calendar, Star, Check, Clock, Gift, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CheckInResponse {
  success: boolean;
  points: number;
  newStreak: number;
  nextCheckInTime: string;
  message: string;
}

interface CheckIn {
  id: number;
  userId: number;
  checkedInAt: string;
  streakDay: number;
  pointsEarned: number;
}

interface StreakInfo {
  currentStreak: number;
  lastCheckIn: string | null;
  canCheckInNow: boolean;
  nextCheckInTime: string | null;
}

const EarnPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [checkingIn, setCheckingIn] = useState(false);

  // Get user's current streak info
  const { data: streakInfo, isLoading: loadingStreak } = useQuery<StreakInfo>({
    queryKey: ["/api/users/firebase", user?.uid, "streak"],
    queryFn: async () => {
      if (!user?.uid) return null;
      return apiRequest(`/api/users/firebase/${user.uid}/streak`);
    },
    enabled: !!user?.uid,
  });

  // Get user's check-in history
  const { data: checkInHistory, isLoading: loadingHistory } = useQuery<CheckIn[]>({
    queryKey: ["/api/users/firebase", user?.uid, "check-ins"],
    queryFn: async () => {
      if (!user?.uid) return [];
      return apiRequest(`/api/users/firebase/${user.uid}/check-ins`);
    },
    enabled: !!user?.uid,
  });

  // Process a check-in
  const checkInMutation = useMutation<CheckInResponse>({
    mutationFn: async () => {
      if (!user?.uid) throw new Error("User not logged in");
      return apiRequest(`/api/users/firebase/${user.uid}/check-in`, {
        method: "POST",
      });
    },
    onSuccess: (data) => {
      // Show success toast
      toast({
        title: "Check-in Successful!",
        description: data.message,
        variant: "default",
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/users/firebase", user?.uid, "streak"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/firebase", user?.uid, "check-ins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/firebase", user?.uid] });
      
      setCheckingIn(false);
    },
    onError: (error) => {
      toast({
        title: "Check-in Failed",
        description: error.message || "Something went wrong. Please try again later.",
        variant: "destructive",
      });
      setCheckingIn(false);
    },
  });

  const handleCheckIn = async () => {
    if (!user) {
      toast({
        title: "Not Logged In",
        description: "Please log in to check in and earn points.",
        variant: "destructive",
      });
      return;
    }

    setCheckingIn(true);
    checkInMutation.mutate();
  };

  // Calculate streak progress for the week (out of 7 days)
  const streakProgress = streakInfo ? (streakInfo.currentStreak % 7 || 7) * 100 / 7 : 0;
  
  // Format next check-in time
  const getNextCheckInTime = () => {
    if (!streakInfo || !streakInfo.nextCheckInTime) return "Unknown";
    const nextTime = new Date(streakInfo.nextCheckInTime);
    if (streakInfo.canCheckInNow) return "Now";
    return formatDistance(nextTime, new Date(), { addSuffix: true });
  };

  // Returns relevant badge color based on streak day
  const getStreakBadgeColor = (day: number) => {
    const streakDay = day % 7 || 7;
    if (streakDay === 7) return "bg-amber-500 hover:bg-amber-600";
    if (streakDay > 4) return "bg-emerald-500 hover:bg-emerald-600";
    if (streakDay > 2) return "bg-blue-500 hover:bg-blue-600";
    return "bg-slate-500 hover:bg-slate-600";
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Helmet>
        <title>Earn Points | NepQue</title>
        <meta name="description" content="Earn points by checking in daily and maintaining your streak on NepQue." />
        <meta name="keywords" content="points, rewards, check-in, streak, daily" />
      </Helmet>

      <h1 className="text-3xl font-bold mb-6">Earn Points</h1>

      <Tabs defaultValue="daily-check-in" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="daily-check-in" className="text-lg">
            <Calendar className="mr-2 h-5 w-5" />
            Daily Check-in
          </TabsTrigger>
          <TabsTrigger value="other-ways" className="text-lg">
            <Gift className="mr-2 h-5 w-5" />
            Other Ways to Earn
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily-check-in">
          {loadingStreak ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="mr-2 h-6 w-6 text-blue-500" />
                    Your Current Streak
                  </CardTitle>
                  <CardDescription>
                    Check in every day to build your streak and earn more points!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center p-4">
                    <div className="mb-4 text-center">
                      <span className="text-6xl font-bold text-blue-600">
                        {streakInfo?.currentStreak || 0}
                      </span>
                      <p className="text-lg text-gray-600">
                        {streakInfo?.currentStreak === 1 ? "Day" : "Days"}
                      </p>
                    </div>

                    <div className="w-full mb-2">
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Weekly Progress</span>
                        <span>
                          Day {streakInfo ? (streakInfo.currentStreak % 7 || 7) : 0}/7
                        </span>
                      </div>
                      <Progress value={streakProgress} className="h-2" />
                    </div>

                    <p className="text-sm text-gray-500 mt-2 mb-4">
                      {streakInfo?.currentStreak ? (
                        streakInfo.currentStreak % 7 === 0 ? (
                          <span className="font-semibold text-amber-600">
                            Amazing! You reached 7 days - you'll get 10 points today!
                          </span>
                        ) : (
                          <>
                            Reach day 7 to earn <strong>10 points</strong> instead of 5!
                          </>
                        )
                      ) : (
                        "Start your streak today!"
                      )}
                    </p>

                    <div className="text-center mt-4">
                      <div className="flex items-center mb-2 justify-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Next check-in: {getNextCheckInTime()}
                        </span>
                      </div>

                      <Button 
                        className="w-full" 
                        size="lg"
                        disabled={checkingIn || !streakInfo?.canCheckInNow}
                        onClick={handleCheckIn}
                      >
                        {checkingIn ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Checking in...
                          </>
                        ) : streakInfo?.canCheckInNow ? (
                          <>
                            <Check className="mr-2 h-5 w-5" />
                            Check In Now
                          </>
                        ) : (
                          <>
                            <Clock className="mr-2 h-5 w-5" />
                            Check In Later
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 text-sm text-gray-600 flex justify-center">
                  Check in daily to maintain your streak and maximize your points!
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="mr-2 h-6 w-6 text-orange-500" />
                    Check-in History
                  </CardTitle>
                  <CardDescription>
                    Your recent check-ins and points earned
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingHistory ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    </div>
                  ) : checkInHistory && checkInHistory.length > 0 ? (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {checkInHistory.map((checkIn) => (
                        <div key={checkIn.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="text-sm font-medium">
                                {new Date(checkIn.checkedInAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(checkIn.checkedInAt).toLocaleTimeString()}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Badge className={getStreakBadgeColor(checkIn.streakDay)}>
                              Day {checkIn.streakDay}
                            </Badge>
                            <div className="ml-3 flex items-center font-semibold">
                              <Coins className="h-3.5 w-3.5 mr-1 text-amber-500" />
                              +{checkIn.pointsEarned}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <Calendar className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                      <p>You haven't checked in yet!</p>
                      <p className="text-sm mt-1">Start your streak today.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="other-ways">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="mr-2 h-6 w-6 text-purple-500" />
                  Submit Coupons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Share deals with the community and earn points when your submissions are approved!</p>
                
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                    <span>Earn <strong>5 points</strong> for each approved coupon submission</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                    <span>Help others save money while earning rewards</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                    <span>No limit on how many coupons you can submit</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <a href="/submit-coupon">Submit a Coupon</a>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-6 w-6 text-amber-500" />
                  Earn Points by Using Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">More ways to earn points are coming soon!</p>
                
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                    <span>Refer friends for <strong>25 points</strong> per referral (coming soon)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                    <span>Complete your profile for <strong>15 bonus points</strong> (coming soon)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                    <span>Participate in limited-time promotions for extra points</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline" asChild>
                  <a href="/profile">View Your Profile</a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EarnPage;