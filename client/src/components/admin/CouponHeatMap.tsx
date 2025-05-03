import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  Cell,
  Legend,
  CartesianGrid
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ChevronsUpDown, Info, AlertCircle } from 'lucide-react';
import { 
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

// Types for our heat map data
interface HeatMapDataPoint {
  x: number | string;
  y: number | string;
  z: number;
  name: string;
  category: string;
  date: string;
}

// Types for aggregated data
interface CategoryData {
  category: string;
  usageCount: number;
  coupons: number;
}

interface TimeData {
  month: string;
  usageCount: number;
  coupons: number;
}

// This generates our heat map data from the API data
const generateHeatMapData = (
  type: 'category' | 'time',
  metric: 'usageCount' | 'coupons',
  data?: CategoryData[] | TimeData[]
): HeatMapDataPoint[] => {
  if (!data || data.length === 0) {
    return [];
  }

  if (type === 'category') {
    return (data as CategoryData[]).map((item, index) => ({
      x: index,
      y: 0,  // Fixed y position for category view
      z: item[metric],
      name: item.category,
      category: item.category,
      date: ''
    }));
  } else {
    return (data as TimeData[]).map((item, index) => ({
      x: index,
      y: 0,  // Fixed y position for time view
      z: item[metric],
      name: item.month,
      category: '',
      date: item.month
    }));
  }
};

// Custom tooltip component for the heat map
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-md shadow-lg">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm text-gray-600">{`Usage Count: ${data.z}`}</p>
        {data.category && <p className="text-sm text-gray-600">Category: {data.category}</p>}
        {data.date && <p className="text-sm text-gray-600">Month: {data.date}</p>}
      </div>
    );
  }

  return null;
};

// Helper function to get color based on value
const getColor = (value: number, max: number) => {
  // Normalize the value
  const normalized = value / max;
  
  // Generate a color from blue (cold) to red (hot)
  const hue = ((1 - normalized) * 240).toString(10);
  return `hsl(${hue}, 70%, 50%)`;
};

const CouponHeatMap = () => {
  const [activeTab, setActiveTab] = useState<'category' | 'time'>('category');
  const [metric, setMetric] = useState<'usageCount' | 'coupons'>('usageCount');
  const [data, setData] = useState<HeatMapDataPoint[]>([]);
  const [maxValue, setMaxValue] = useState<number>(0);

  // Fetch data by category
  const { 
    data: categoryData, 
    isLoading: isCategoryLoading, 
    error: categoryError 
  } = useQuery<CategoryData[]>({
    queryKey: ['/api/heatmap/category'],
    queryFn: async () => {
      const response = await fetch('/api/heatmap/category');
      if (!response.ok) {
        throw new Error('Failed to fetch category heat map data');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Fetch data by time
  const { 
    data: timeData, 
    isLoading: isTimeLoading, 
    error: timeError 
  } = useQuery<TimeData[]>({
    queryKey: ['/api/heatmap/time'],
    queryFn: async () => {
      const response = await fetch('/api/heatmap/time');
      if (!response.ok) {
        throw new Error('Failed to fetch time heat map data');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  useEffect(() => {
    // Only process data if we have it
    if (
      (activeTab === 'category' && !categoryData) || 
      (activeTab === 'time' && !timeData)
    ) {
      return;
    }

    // Generate heat map data based on active tab and metric
    const sourceData = activeTab === 'category' ? categoryData : timeData;
    const newData = generateHeatMapData(activeTab, metric, sourceData);
    setData(newData);
    
    // Find the maximum value for color scaling
    if (newData.length > 0) {
      const max = Math.max(...newData.map(item => item.z));
      setMaxValue(max);
    }
  }, [activeTab, metric, categoryData, timeData]);

  // Determine if we're loading or have an error
  const isLoading = (activeTab === 'category' && isCategoryLoading) || 
                   (activeTab === 'time' && isTimeLoading);
  
  const error = (activeTab === 'category' && categoryError) || 
               (activeTab === 'time' && timeError);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">Coupon Popularity Heat Map</CardTitle>
            <CardDescription>
              Visualize coupon popularity by category or time
            </CardDescription>
          </div>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Info className="h-5 w-5 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>This heat map shows the popularity of coupons based on usage count or number of coupons. 
                  Switch between category and time views for different insights.</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-2">
          <Tabs
            defaultValue="category"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'category' | 'time')}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="category">By Category</TabsTrigger>
              <TabsTrigger value="time">By Time</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Label htmlFor="metric" className="whitespace-nowrap">Metric:</Label>
            <Select
              value={metric}
              onValueChange={(value) => setMetric(value as 'usageCount' | 'coupons')}
            >
              <SelectTrigger id="metric" className="w-full">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usageCount">Usage Count</SelectItem>
                <SelectItem value="coupons">Number of Coupons</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-1">
        {error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : 'Failed to load heat map data'}
            </AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="w-full h-[350px] flex items-center justify-center">
            <div className="space-y-4 w-full">
              <Skeleton className="h-[350px] w-full" />
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[350px]">
            <p className="text-gray-500 text-center">No data available for the selected view</p>
          </div>
        ) : (
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 60,
                  left: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="category" 
                  dataKey="name" 
                  name={activeTab === 'category' ? 'Category' : 'Month'} 
                  tickMargin={20}
                  tick={(props) => {
                    const { x, y, payload } = props;
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text 
                          x={0} 
                          y={0} 
                          dy={16} 
                          textAnchor="end" 
                          fill="#666"
                          fontSize={12}
                          transform="rotate(-45)"
                        >
                          {payload.value}
                        </text>
                      </g>
                    );
                  }}
                />
                <YAxis type="number" dataKey="y" tick={false} axisLine={false} />
                <ZAxis 
                  type="number" 
                  dataKey="z" 
                  range={[100, 1000]} 
                  name={metric === 'usageCount' ? 'Usage Count' : 'Number of Coupons'} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Scatter 
                  name={metric === 'usageCount' ? 'Usage Count' : 'Number of Coupons'} 
                  data={data} 
                  fill="#8884d8"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(entry.z, maxValue)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CouponHeatMap;