import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { formatDistance } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Gift, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface SpinResponse {
  success: boolean;
  points: number;
  nextSpinTime: string;
  message: string;
}

// Wheel segment colors
const COLORS = ["#9333ea", "#a855f7", "#c084fc", "#9333ea", "#a855f7"];
// Wheel segment points
const POINTS = [1, 2, 3, 4, 5];

const SpinPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  // Get spin status
  const { data: spinStatus, isLoading } = useQuery<SpinResponse>({
    queryKey: ["/api/users/firebase", user?.uid, "spin-status"],
    queryFn: async () => {
      if (!user?.uid) {
        throw new Error("User not logged in");
      }
      try {
        // Use a GET request to check if user can spin
        const response = await fetch(`/api/users/firebase/${user.uid}/spin-status`);
        if (!response.ok) throw new Error("Failed to fetch spin status");
        return response.json();
      } catch (error) {
        console.error("Error fetching spin status:", error);
        throw error;
      }
    },
    enabled: !!user?.uid,
    // Refetch periodically to update countdown
    refetchInterval: 60000, // every minute
  });

  // Process a spin
  const spinMutation = useMutation<SpinResponse>({
    mutationFn: async () => {
      if (!user?.uid) throw new Error("User not logged in");
      console.log("Initiating spin for user:", user.uid);
      return apiRequest(`/api/users/firebase/${user.uid}/spin`, {
        method: "POST",
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/firebase", user?.uid, "points-balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/firebase", user?.uid, "points-log"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/firebase", user?.uid, "spin-status"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process spin",
        variant: "destructive",
      });
      setIsSpinning(false);
    }
  });

  const handleSpin = () => {
    if (isSpinning || !user?.uid) return;
    
    setIsSpinning(true);
    setResult(null);
    
    // Call the spin API first to get the actual points awarded
    spinMutation.mutate(undefined, {
      onSuccess: (data) => {
        // Get the points awarded from the API response
        const pointsAwarded = data.points;
        
        // The index in the POINTS array where our result is
        const resultIndex = POINTS.indexOf(pointsAwarded);
        
        // Calculate how many degrees we need to spin to land on our result
        // Each segment is 72 degrees (360 / 5)
        // We add 4 full rotations (1440 degrees) for effect, plus the position
        const segmentDegrees = 360 / POINTS.length;
        const segmentOffset = (segmentDegrees / 2); // Offset to center of segment
        const destinationDegrees = (resultIndex * segmentDegrees) + segmentOffset;
        
        // Final rotation = multiple full rotations + destination position + a small random offset
        const totalRotation = 1440 + destinationDegrees + (Math.random() * 30 - 15); // 4 full rotations + destination
        
        // Set the rotation
        setRotation(totalRotation);
        
        // After animation completes, update the UI
        setTimeout(() => {
          setResult(pointsAwarded);
          
          // Show the result toast
          toast({
            title: "Congratulations!",
            description: `You won ${pointsAwarded} points!`,
            variant: "default",
          });
        }, 5000); // Match this to animation duration
      },
      onError: () => {
        setIsSpinning(false);
      }
    });
  };

  // Reset spinning state after animation completes
  useEffect(() => {
    if (isSpinning) {
      const timer = setTimeout(() => {
        setIsSpinning(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSpinning]);

  // Calculate time until next spin
  const getTimeUntilNextSpin = () => {
    if (!spinStatus || !spinStatus.nextSpinTime) return "soon";
    
    const nextSpinTime = new Date(spinStatus.nextSpinTime);
    const now = new Date();
    
    if (nextSpinTime <= now) {
      return "now";
    }
    
    return formatDistance(nextSpinTime, now, { addSuffix: true });
  };

  const canSpin = !authLoading && !isLoading && !!user && (!spinStatus || spinStatus.success);

  return (
    <div className="container py-8 max-w-4xl">
      <Helmet>
        <title>Spin the Wheel - NepQue</title>
        <meta name="description" content="Spin the wheel to earn points at NepQue!" />
      </Helmet>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">🎡 Spin the Wheel</h1>
        <p className="text-lg text-muted-foreground">
          Spin the wheel once every 24 hours to earn 1-5 points!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-[300px] h-[300px]">
            {/* Wheel background */}
            <div className="absolute inset-0 rounded-full bg-purple-700"></div>
            
            {/* Pointer triangle */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 
                            border-l-[15px] border-r-[15px] border-b-[30px] 
                            border-l-transparent border-r-transparent border-b-yellow-400 z-20"></div>
            
            {/* Wheel */}
            <motion.div 
              ref={wheelRef}
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{
                transformOrigin: "center center",
              }}
              animate={{
                rotate: rotation
              }}
              transition={{
                duration: 5,
                ease: [0.2, 0.6, 0.4, 1]
              }}
            >
              {/* Wheel segments */}
              {POINTS.map((point, index) => {
                // Calculate the rotation and position for each segment
                const segmentDegrees = 360 / POINTS.length;
                const rotation = index * segmentDegrees;
                return (
                  <div 
                    key={index} 
                    className="absolute inset-0"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + segmentDegrees}% 0%, 50% 50%)`,
                      backgroundColor: COLORS[index % COLORS.length],
                      transformOrigin: "center"
                    }}
                  >
                    <div 
                      className="absolute top-[25%] left-1/2 -translate-x-1/2 text-white font-bold text-xl"
                      style={{ transform: `rotate(${-rotation + segmentDegrees/2}deg)` }}
                    >
                      {point}
                    </div>
                  </div>
                );
              })}
            </motion.div>
            
            {/* Center button */}
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                       w-20 h-20 rounded-full bg-yellow-400 z-10 
                       flex items-center justify-center 
                       cursor-pointer hover:bg-yellow-500 transition-colors"
              onClick={handleSpin}
              style={{ pointerEvents: canSpin && !isSpinning ? "auto" : "none" }}
            >
              <span className="font-bold text-orange-800 text-lg">SPIN</span>
            </div>
          </div>
          
          <Button 
            className="mt-8 px-8 py-6 text-lg"
            onClick={handleSpin}
            disabled={!canSpin || isSpinning}
          >
            {isSpinning ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Spinning...
              </>
            ) : !user ? (
              "Login to Spin"
            ) : !spinStatus?.success ? (
              `Spin Again ${getTimeUntilNextSpin()}`
            ) : (
              "Click Spin to Try Your Luck!"
            )}
          </Button>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" /> Spin Rewards
              </CardTitle>
              <CardDescription>
                Spin the wheel for a chance to win points every 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">How it works:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Spin the wheel once every 24 hours</li>
                  <li>Win between 1-5 points with each spin</li>
                  <li>Points are automatically added to your account</li>
                  <li>Use your points to withdraw rewards or get special offers</li>
                </ul>
              </div>
              
              {result && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-700 flex items-center gap-2">
                    <Target className="h-5 w-5" /> Your last spin result:
                  </h3>
                  <p className="text-2xl font-bold mt-2">
                    {result} points!
                  </p>
                </div>
              )}
              
              {!user && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-yellow-700">
                    Please sign in to spin the wheel and earn points.
                  </p>
                </div>
              )}
              
              {user && spinStatus && !spinStatus.success && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-700">Next spin available:</h3>
                  <p className="text-xl mt-1">
                    {getTimeUntilNextSpin()}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Earn points daily to increase your reward balance faster!
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SpinPage;