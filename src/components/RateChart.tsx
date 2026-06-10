import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface HistoryPoint {
  timestamp: number;
  rates: Record<string, number>;
}

interface RateChartProps {
  history: Array<{
    timestamp: number;
    rates: Record<string, number>;
  }>;
  targetCurrency: string;
}

const RateChart: React.FC<RateChartProps> = ({ history, targetCurrency }) => {
  // Transform the history data for Recharts
  // We need an array of { date: string, rate: number }
  const chartData = history
    .map((point) => ({
      // Format date to a readable string for the X-Axis (e.g., "HH:mm")
      date: new Date(point.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      // We extract the rate for the specific currency being tracked
      rate: point.rates[targetCurrency] || 0,
    }))
    .sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  if (chartData.length < 2) {
    return (
      <div 
        className="w-full h-48 flex items-center justify-center text-sm italic opacity-60"
        style={{ color: 'var(--secondary)' }}
      >
        Insufficient history to show trends. Refresh later to see charts.
      </div>
    );
  }

  return (
    <div className="w-full h-48 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
          <XAxis 
            dataKey="date" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            stroke="var(--secondary)"
          />
          <YAxis 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            stroke="var(--secondary)"
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
              color: 'var(--text)',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            itemStyle={{ color: 'var(--primary)' }}
          />
          <Area
            type="monotone"
            dataKey="rate"
            stroke="var(--primary)"
            fillOpacity={1}
            fill="url(#colorRate)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RateChart;
