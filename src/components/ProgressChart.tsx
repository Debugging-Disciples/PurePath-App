
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChartData {
  date: string;
  streak: number;
  mood?: number;
}

interface ProgressChartProps {
  data: ChartData[];
  className?: string;
  type?: 'streak' | 'mood';
}

// Helper function to get colors based on streak value
const getStreakColors = (value: number) => {
  if (value < 7) return 'hsl(var(--primary))';
  if (value < 30) return 'hsl(256, 90%, 65%)';
  return 'hsl(280, 90%, 60%)';
};

// Helper function to get colors based on mood value (1-10)
const getMoodColor = (value: number) => {
  if (value <= 3) return 'hsl(0, 84%, 60%)';
  if (value <= 6) return 'hsl(40, 90%, 60%)';
  if (value <= 8) return 'hsl(200, 90%, 60%)';
  return 'hsl(150, 90%, 40%)';
};

const ProgressChart: React.FC<ProgressChartProps> = ({ data, className, type = 'streak' }) => {
  const isMobile = useIsMobile();
  
  const chartTitle = type === 'streak' ? 'Streak Progress' : 'Mood Tracking';
  const chartDescription = type === 'streak' 
    ? 'Your continuous days of staying on track'
    : 'How you\'ve been feeling day by day';
  
  // Format data based on chart type
  const formattedData = type === 'streak'
    ? data
    : data.filter(item => item.mood !== undefined);
  
  // Custom tooltip for streak chart
  const StreakTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border shadow-lg rounded-md p-3 text-sm">
          <p className="font-medium">{label}</p>
          <p>
            <span className="text-primary font-medium">{payload[0].value}</span> day streak
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Custom tooltip for mood chart
  const MoodTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const mood = payload[0].value;
      let moodText = 'Poor';
      if (mood > 3) moodText = 'Average';
      if (mood > 6) moodText = 'Good';
      if (mood > 8) moodText = 'Excellent';
      
      return (
        <div className="bg-background border border-border shadow-lg rounded-md p-3 text-sm">
          <p className="font-medium">{label}</p>
          <p>
            Mood: <span className="font-medium">{moodText}</span> ({mood}/10)
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className={cn("p-6 rounded-lg border border-border bg-card", className)}>
      <h3 className="text-lg font-medium mb-1">{chartTitle}</h3>
      <p className="text-sm text-muted-foreground mb-4">{chartDescription}</p>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'streak' ? (
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: isMobile ? 0 : 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorStreak" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickMargin={10}
                minTickGap={15}
                className="text-xs text-muted-foreground"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickMargin={10}
                className="text-xs text-muted-foreground"
                allowDecimals={false}
              />
              <Tooltip content={<StreakTooltip />} />
              <Area 
                type="monotone" 
                dataKey="streak" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorStreak)" 
                strokeWidth={2}
                animationDuration={1000}
              />
            </AreaChart>
          ) : (
            <BarChart data={formattedData} margin={{ top: 10, right: 10, left: isMobile ? 0 : 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickMargin={10}
                minTickGap={15}
                className="text-xs text-muted-foreground" 
              />
              <YAxis 
                domain={[0, 10]} 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickMargin={10}
                className="text-xs text-muted-foreground"
              />
              <Tooltip content={<MoodTooltip />} />
              <Bar dataKey="mood" radius={[4, 4, 0, 0]}>
                {formattedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getMoodColor(entry.mood || 0)}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressChart;
