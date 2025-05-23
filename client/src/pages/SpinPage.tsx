import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { formatDistance } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Gift, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import BannerAd from "@/components/banner/BannerAd";
import SEO from "@/components/common/SEO";

interface SpinResponse {
  success: boolean;
  points: number;
  nextSpinTime: string;
  message: string;
}

// Wheel segment colors - more vibrant colors inspired by the PHP example
const COLORS = ["#8b35bc", "#b163da", "#8b35bc", "#b163da", "#8b35bc"];
// Wheel segment points
const POINTS = [1, 2, 3, 4, 5];

const SpinPage = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  // Get spin status
  const { data: spinStatus, isLoading } = useQuery<SpinResponse>({
    queryKey: ["/api/users/firebase", currentUser?.uid, "spin-status"],
    queryFn: async () => {
      if (!currentUser?.uid) {
        throw new Error("User not logged in");
      }
      try {
        // Use a GET request to check if user can spin
        const response = await fetch(`/api/users/firebase/${currentUser.uid}/spin-status`);
        if (!response.ok) throw new Error("Failed to fetch spin status");
        return response.json();
      } catch (error) {
        console.error("Error fetching spin status:", error);
        throw error;
      }
    },
    enabled: !!currentUser?.uid,
    // Refetch periodically to update countdown
    refetchInterval: 60000, // every minute
  });

  // Process a spin
  const spinMutation = useMutation<SpinResponse>({
    mutationFn: async () => {
      if (!currentUser?.uid) throw new Error("User not logged in");
      console.log("Initiating spin for user:", currentUser.uid);
      return apiRequest(`/api/users/firebase/${currentUser.uid}/spin`, {
        method: "POST",
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/firebase", currentUser?.uid, "points-balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/firebase", currentUser?.uid, "points-log"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/firebase", currentUser?.uid, "spin-status"] });
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
    if (isSpinning || !currentUser?.uid) return;
    
    setIsSpinning(true);
    setResult(null);
    
    // Call the spin API first to get the actual points awarded
    spinMutation.mutate(undefined, {
      onSuccess: (data) => {
        // Get the points awarded from the API response
        const pointsAwarded = data.points;
        console.log("Points awarded:", pointsAwarded);
        
        // The index in the POINTS array where our result is
        const resultIndex = POINTS.indexOf(pointsAwarded);
        
        // Calculate how many degrees we need to spin to land on our result
        // Each segment is 72 degrees (360 / 5)
        // We add 4 full rotations (1440 degrees) for effect, plus the position
        const segmentDegrees = 360 / POINTS.length;
        
        // Important: The wheel rotates clockwise, but we need to adjust the destination
        // because of how the wheel segments are positioned relative to the pointer
        // Index 0 (value 1) is at the top-left, Index 1 (value 2) is at top-right, etc.
        // We subtract from 360 to get the correct angle (rotating counter-clockwise)
        const destinationDegrees = 360 - (resultIndex * segmentDegrees) - (segmentDegrees / 2);
        
        // Final rotation = multiple full rotations + destination position
        const totalRotation = 1440 + destinationDegrees; // 4 full rotations + destination
        
        console.log("Wheel rotation:", {
          segmentDegrees,
          resultIndex,
          destinationDegrees,
          totalRotation
        });
        
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

  // Debug log to trace authentication state
  useEffect(() => {
    console.log("Authentication state:", { 
      currentUser: !!currentUser, 
      uid: currentUser?.uid,
      authLoading, 
      isLoading, 
      spinStatus: !!spinStatus,
      success: spinStatus?.success 
    });
  }, [currentUser, authLoading, isLoading, spinStatus]);

  const canSpin = !authLoading && !isLoading && !!currentUser && (!spinStatus || spinStatus.success);

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Background inspired by PHP example */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-700 -z-10"></div>
      
      <div className="container py-8 max-w-4xl mx-auto relative z-10">
        <SEO 
          title="Spin the Wheel" 
          description="Spin the wheel to earn points at NepQue!" 
          noIndex={true}
        />
        
        {/* Banner Ad Above the Spin Wheel */}
        <div className="mb-6">
          <BannerAd location="spin-page" className="mx-auto" />
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-5xl font-bold mb-2 text-purple-600 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <line x1="12" y1="2" x2="12" y2="4"></line>
                <line x1="12" y1="20" x2="12" y2="22"></line>
                <line x1="4.93" y1="4.93" x2="6.34" y2="6.34"></line>
                <line x1="17.66" y1="17.66" x2="19.07" y2="19.07"></line>
                <line x1="2" y1="12" x2="4" y2="12"></line>
                <line x1="20" y1="12" x2="22" y2="12"></line>
                <line x1="4.93" y1="19.07" x2="6.34" y2="17.66"></line>
                <line x1="17.66" y1="6.34" x2="19.07" y2="4.93"></line>
              </svg>
              Spin the Wheel
            </h1>
            <p className="text-xl text-gray-500 mb-8">
              Spin the wheel once every 24 hours to earn 1-5 points!
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center max-w-3xl mx-auto">
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-[380px] h-[380px] bg-white p-5 rounded-full shadow-[0_10px_50px_rgba(88,28,135,0.2)] border-[8px] border-white">
                {/* Background gradient similar to PHP example */}
                <div className="absolute -inset-12 -z-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-[48px] opacity-30 blur-xl"></div>
                
                {/* Pointer triangle */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 
                               border-l-[15px] border-r-[15px] border-b-[25px] 
                               border-l-transparent border-r-transparent border-b-yellow-400 z-20
                               filter drop-shadow-lg"></div>
                
                {/* Wheel */}
                <motion.div 
                  ref={wheelRef}
                  className="absolute inset-2 rounded-full overflow-hidden border-8 border-purple-800 shadow-inner"
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
                    
                    // Alternate colors based on index
                    const isAlternate = index % 2 === 0;
                    
                    return (
                      <div 
                        key={index} 
                        className="absolute inset-0"
                        style={{
                          transform: `rotate(${rotation}deg)`,
                          clipPath: `polygon(50% 50%, 50% 0%, ${50 + segmentDegrees}% 0%, 50% 50%)`,
                          backgroundColor: isAlternate ? COLORS[0] : COLORS[1],
                          transformOrigin: "center",
                          boxShadow: "inset 0 0 15px rgba(0,0,0,0.2)",
                        }}
                      >
                        <div 
                          className="absolute text-white font-bold text-4xl drop-shadow-md"
                          style={{ 
                            transform: `rotate(${-rotation}deg)`,
                            top: '50%',
                            left: '50%',
                            height: '40px',
                            width: '40px',
                            marginLeft: '20px',
                            marginTop: '-100px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {point}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
                
                {/* Center button - styled like the PHP example */}
                <button 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                           w-[26%] h-[26%] rounded-full z-10 
                           bg-[radial-gradient(#fdcf3b_50%,#d88a40_85%)]
                           flex items-center justify-center text-[#c66e16] uppercase font-semibold tracking-wider
                           cursor-pointer hover:brightness-105 transition-all shadow-lg"
                  onClick={handleSpin}
                  disabled={!canSpin || isSpinning}
                  style={{ 
                    pointerEvents: canSpin && !isSpinning ? "auto" : "none",
                    letterSpacing: "0.1em" 
                  }}
                >
                  <span className="font-bold text-xl">SPIN</span>
                </button>
              </div>
              
              <Button 
                className="mt-12 px-12 py-6 text-xl font-medium rounded-full shadow-lg bg-gradient-to-r from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600 border-0 w-[90%] max-w-[400px]"
                onClick={handleSpin}
                disabled={!canSpin || isSpinning}
              >
                {isSpinning ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Spinning...
                  </>
                ) : !currentUser ? (
                  "Login to Spin"
                ) : !spinStatus?.success ? (
                  `Spin Again in about ${getTimeUntilNextSpin().replace('in ', '')}`
                ) : (
                  "Click Spin to Try Your Luck!"
                )}
              </Button>
              
              {/* Show result overlay if there is a result */}
              {result && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                  <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md mx-auto text-center">
                    <h3 className="text-2xl font-bold text-purple-600 mb-4">Congratulations!</h3>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200 animate-[pulse_0.5s_ease-in-out] mb-6">
                      <h3 className="font-semibold text-emerald-700 flex items-center justify-center gap-2 mb-2">
                        <Target className="h-6 w-6 text-emerald-600" /> Your spin result:
                      </h3>
                      <p className="text-5xl font-bold mt-2 bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                        {result} points!
                      </p>
                    </div>
                    <Button 
                      className="px-8 py-3 text-lg font-medium rounded-full shadow-lg bg-gradient-to-r from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600 border-0 w-full"
                      onClick={() => setResult(null)}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Banner Ad Below the Spin Wheel */}
        <div className="mt-10">
          <BannerAd location="spin-page" className="mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default SpinPage;