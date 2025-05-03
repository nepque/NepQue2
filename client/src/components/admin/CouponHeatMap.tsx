import { useState, useEffect } from 'react';
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
import { ChevronsUpDown, Info } from 'lucide-react';
import { 
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

// Sample data - In a real application, this would come from the API
const sampleCategoryData: CategoryData[] = [
  { category: 'Retail', usageCount: 250, coupons: 15 },
  { category: 'Food & Drink', usageCount: 180, coupons: 12 },
  { category: 'Travel', usageCount: 120, coupons: 8 },
  { category: 'Electronics', usageCount: 300, coupons: 10 },
  { category: 'Fashion', usageCount: 210, coupons: 14 },
  { category: 'Beauty', usageCount: 90, coupons: 6 },
  { category: 'Home & Garden', usageCount: 150, coupons: 9 },
  { category: 'Sports', usageCount: 60, coupons: 5 }
];

const sampleTimeData: TimeData[] = [
  { month: 'Jan', usageCount: 150, coupons: 10 },
  { month: 'Feb', usageCount: 170, coupons: 12 },
  { month: 'Mar', usageCount: 190, coupons: 13 },
  { month: 'Apr', usageCount: 220, coupons: 14 },
  { month: 'May', usageCount: 250, coupons: 15 },
  { month: 'Jun', usageCount: 280, coupons: 16 },
  { month: 'Jul', usageCount: 310, coupons: 18 },
  { month: 'Aug', usageCount: 290, coupons: 17 },
  { month: 'Sep', usageCount: 260, coupons: 15 },
  { month: 'Oct', usageCount: 230, coupons: 14 },
  { month: 'Nov', usageCount: 200, coupons: 12 },
  { month: 'Dec', usageCount: 170, coupons: 10 }
];

// This generates our heat map data from the sample data
const generateHeatMapData = (
  type: 'category' | 'time',
  metric: 'usageCount' | 'coupons'
): HeatMapDataPoint[] => {
  if (type === 'category') {
    return sampleCategoryData.map((item, index) => ({
      x: index,
      y: 0,  // Fixed y position for category view
      z: item[metric],
      name: item.category,
      category: item.category,
      date: ''
    }));
  } else {
    return sampleTimeData.map((item, index) => ({
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
        <p className="text-sm text-gray-600">{`Usage Count: ${data.category ? sampleCategoryData.find(c => c.category === data.category)?.usageCount : sampleTimeData.find(t => t.month === data.date)?.usageCount}`}</p>
        <p className="text-sm text-gray-600">{`Coupons: ${data.category ? sampleCategoryData.find(c => c.category === data.category)?.coupons : sampleTimeData.find(t => t.month === data.date)?.coupons}`}</p>
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

  useEffect(() => {
    // Generate heat map data based on active tab and metric
    const newData = generateHeatMapData(activeTab, metric);
    setData(newData);
    
    // Find the maximum value for color scaling
    const max = Math.max(...newData.map(item => item.z));
    setMaxValue(max);
  }, [activeTab, metric]);

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
      </CardContent>
    </Card>
  );
};

export default CouponHeatMap;